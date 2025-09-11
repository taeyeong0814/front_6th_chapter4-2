import { useEffect, useMemo, useRef, useState } from "react";
import { useAutoCallback } from "./hooks/useAutoCallback.ts";
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import SearchFilters from "./components/SearchFilters.tsx";
import LectureTable from "./components/LectureTable.tsx";
import { useScheduleContext } from "./hooks/useScheduleContext.ts";
import { Lecture } from "./types.ts";
import { parseSchedule } from "./utils.ts";
import axios from "axios";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

const PAGE_SIZE = 100;

const fetchMajors = () => axios.get<Lecture[]>("/schedules-majors.json");
const fetchLiberalArts = () =>
  axios.get<Lecture[]>("/schedules-liberal-arts.json");

// API 캐시 시스템 구현
const createApiCache = () => {
  const cache = new Map<string, Promise<{ data: Lecture[] }>>();

  return async (key: string, fetcher: () => Promise<{ data: Lecture[] }>) => {
    if (cache.has(key)) {
      console.log(`캐시에서 반환: ${key}`);
      return cache.get(key);
    }

    console.log(`API 호출 시작: ${key}`, performance.now());
    const promise = fetcher();
    cache.set(key, promise);

    try {
      const result = await promise;
      console.log(`API 호출 완료: ${key}`, performance.now());
      return result;
    } catch (error) {
      cache.delete(key); // 에러 시 캐시에서 제거
      throw error;
    }
  };
};

const apiCache = createApiCache();

// 최적화된 API 호출 함수 - 병렬 실행 + 캐시 적용
const fetchAllLectures = async () => {
  // Promise.all에서 await 제거하여 진짜 병렬 실행
  const results = await Promise.all([
    apiCache("majors-1", fetchMajors),
    apiCache("liberal-arts-1", fetchLiberalArts),
    apiCache("majors-2", fetchMajors),
    apiCache("liberal-arts-2", fetchLiberalArts),
    apiCache("majors-3", fetchMajors),
    apiCache("liberal-arts-3", fetchLiberalArts),
  ]);

  return results;
};

// TODO: 이 컴포넌트에서 불필요한 연산이 발생하지 않도록 다양한 방식으로 시도해주세요.
const SearchDialog = ({ searchInfo, onClose }: Props) => {
  console.log("🎯 SearchDialog 렌더링됨:", performance.now());
  const { setSchedulesMap } = useScheduleContext();

  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);
  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: "",
    grades: [],
    days: [],
    times: [],
    majors: [],
  });

  // 🔥 최적화: 검색 조건이 변경될 때만 필터링 실행
  const filteredLectures = useMemo(() => {
    console.log("🔥 필터링 실행됨 - 검색 조건 변경:", performance.now());
    const { query = "", credits, grades, days, times, majors } = searchOptions;
    return lectures
      .filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(query.toLowerCase()) ||
          lecture.id.toLowerCase().includes(query.toLowerCase())
      )
      .filter(
        (lecture) => grades.length === 0 || grades.includes(lecture.grade)
      )
      .filter(
        (lecture) => majors.length === 0 || majors.includes(lecture.major)
      )
      .filter(
        (lecture) => !credits || lecture.credits.startsWith(String(credits))
      )
      .filter((lecture) => {
        if (days.length === 0) {
          return true;
        }
        const schedules = lecture.schedule
          ? parseSchedule(lecture.schedule)
          : [];
        return schedules.some((s) => days.includes(s.day));
      })
      .filter((lecture) => {
        if (times.length === 0) {
          return true;
        }
        const schedules = lecture.schedule
          ? parseSchedule(lecture.schedule)
          : [];
        return schedules.some((s) =>
          s.range.some((time) => times.includes(time))
        );
      });
  }, [lectures, searchOptions]);

  // 🔥 최적화: 페이지네이션 계산 메모이제이션
  const lastPage = useMemo(() => {
    console.log("🔥 lastPage 계산됨:", performance.now());
    return Math.ceil(filteredLectures.length / PAGE_SIZE);
  }, [filteredLectures.length]);

  // 🔥 최적화: 보여질 강의 목록 메모이제이션
  const visibleLectures = useMemo(() => {
    console.log("🔥 visibleLectures 계산됨:", performance.now());
    return filteredLectures.slice(0, page * PAGE_SIZE);
  }, [filteredLectures, page]);

  // 🔥 최적화: 전공 목록 메모이제이션
  const allMajors = useMemo(() => {
    console.log("🔥 allMajors 계산됨:", performance.now());
    return [...new Set(lectures.map((lecture) => lecture.major))];
  }, [lectures]);

  const changeSearchOption = useAutoCallback(
    (field: keyof SearchOption, value: SearchOption[typeof field]) => {
      setPage(1);
      setSearchOptions({ ...searchOptions, [field]: value });
      loaderWrapperRef.current?.scrollTo(0, 0);
    }
  );

  const addSchedule = useAutoCallback((lecture: Lecture) => {
    if (!searchInfo) return;

    const { tableId } = searchInfo;

    const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
      ...schedule,
      lecture,
    }));

    setSchedulesMap((prev) => ({
      ...prev,
      [tableId]: [...prev[tableId], ...schedules],
    }));

    onClose();
  });

  useEffect(() => {
    fetchAllLectures()
      .then((results) => {
        setLectures(results.flatMap((result) => result?.data || []));
      })
      .catch((error) => {
        console.error("API 호출 실패:", error);
      });
  }, []);

  useEffect(() => {
    const $loader = loaderRef.current;
    const $loaderWrapper = loaderWrapperRef.current;

    if (!$loader || !$loaderWrapper) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => Math.min(lastPage, prevPage + 1));
        }
      },
      { threshold: 0, root: $loaderWrapper }
    );

    observer.observe($loader);

    return () => observer.unobserve($loader);
  }, [lastPage]);

  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
    setPage(1);
  }, [searchInfo]);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" w="1000px">
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <SearchFilters
              searchOptions={searchOptions}
              allMajors={allMajors}
              onChange={changeSearchOption}
            />
            <Text align="right">검색결과: {filteredLectures.length}개</Text>
            <LectureTable
              lectures={visibleLectures}
              onAddSchedule={addSchedule}
              loaderWrapperRef={loaderWrapperRef}
              loaderRef={loaderRef}
            />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SearchDialog;
