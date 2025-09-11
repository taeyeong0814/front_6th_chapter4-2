import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Lecture, Schedule } from "./types.ts";
import { parseSchedule } from "./utils.ts";
import axios from "axios";

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
  onAddSchedule: (tableId: string, schedules: Schedule[]) => void; // 🔥 최적화: 부모를 통해 스케줄 추가
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

// 🔥 배포 환경 호환성을 위한 API 경로 설정
const getApiPath = (filename: string) => {
  if (process.env.NODE_ENV === "production") {
    return `https://hanghae-plus.github.io/front_6th_chapter4-2/${filename}`;
  }
  return `/${filename}`;
};

const fetchMajors = () =>
  axios.get<Lecture[]>(getApiPath("schedules-majors.json"));
const fetchLiberalArts = () =>
  axios.get<Lecture[]>(getApiPath("schedules-liberal-arts.json"));

// API 캐시 시스템 구현
const createApiCache = () => {
  const cache = new Map<string, Promise<{ data: Lecture[] }>>();

  return async (key: string, fetcher: () => Promise<{ data: Lecture[] }>) => {
    if (cache.has(key)) {
      return cache.get(key);
    }

    const promise = fetcher();
    cache.set(key, promise);

    try {
      const result = await promise;
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
const SearchDialog = React.memo(
  ({ searchInfo, onClose, onAddSchedule }: Props) => {
    const loaderWrapperRef = useRef<HTMLDivElement>(null);
    const loaderRef = useRef<HTMLDivElement>(null);
    const [allLectures, setAllLectures] = useState<Lecture[]>([]); // 🔥 최적화: 전체 강의 데이터
    const [filteredLectures, setFilteredLectures] = useState<Lecture[]>([]); // 🔥 최적화: 필터링된 강의 데이터
    const [displayedLectures, setDisplayedLectures] = useState<Lecture[]>([]); // 🔥 최적화: 화면에 표시될 강의들
    // 🔥 최적화: 개별 필드 상태로 분리하여 불필요한 리렌더링 방지
    const [query, setQuery] = useState("");
    const [grades, setGrades] = useState<number[]>([]);
    const [days, setDays] = useState<string[]>([]);
    const [times, setTimes] = useState<number[]>([]);
    const [majors, setMajors] = useState<string[]>([]);
    const [credits, setCredits] = useState<number | undefined>(undefined);

    // 🔥 최적화: searchOptions를 메모이제이션된 객체로 관리
    const searchOptions = useMemo(
      () => ({
        query,
        grades,
        days,
        times,
        majors,
        credits,
      }),
      [query, grades, days, times, majors, credits]
    );

    // 🔥 최적화: 검색 조건 변경 시 필터링 실행 및 첫 페이지만 표시
    useEffect(() => {
      if (allLectures.length === 0) return;

      const {
        query = "",
        credits,
        grades,
        days,
        times,
        majors,
      } = searchOptions;

      const filtered = allLectures
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

      // 🔥 최적화: 필터링된 결과 저장 및 첫 페이지만 표시
      setFilteredLectures(filtered);
      setDisplayedLectures(filtered.slice(0, PAGE_SIZE));
    }, [allLectures, searchOptions]);

    // 🔥 최적화: 전공 목록 메모이제이션
    const allMajors = useMemo(() => {
      const majors = [...new Set(allLectures.map((lecture) => lecture.major))];
      return majors;
    }, [allLectures]);

    // 🔥 최적화: 개별 필드별 변경 함수들로 분리
    const changeSearchOption = useAutoCallback(
      (field: keyof SearchOption, value: SearchOption[typeof field]) => {
        // 🔥 최적화: 필드별로 개별 상태 업데이트
        switch (field) {
          case "query":
            setQuery(value as string);
            break;
          case "grades":
            setGrades(value as number[]);
            break;
          case "days":
            setDays(value as string[]);
            break;
          case "times":
            setTimes(value as number[]);
            break;
          case "majors":
            setMajors(value as string[]);
            break;
          case "credits":
            setCredits(value as number | undefined);
            break;
        }

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

      // 🔥 최적화: 부모 컴포넌트를 통해 스케줄 추가 (Context 직접 조작 방지)
      onAddSchedule(tableId, schedules);

      onClose();
    });

    useEffect(() => {
      fetchAllLectures()
        .then((results) => {
          const lectures = results.flatMap((result) => result?.data || []);
          setAllLectures(lectures);
          setFilteredLectures(lectures);
          // 🔥 최적화: 첫 페이지 데이터만 표시
          setDisplayedLectures(lectures.slice(0, PAGE_SIZE));
        })
        .catch((error) => {
          console.error(error);
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
            // 🔥 최적화: 기존 데이터는 리렌더링하지 않고 새로운 데이터만 추가
            setDisplayedLectures((prevDisplayed) => {
              const currentLength = prevDisplayed.length;
              const nextBatch = filteredLectures.slice(
                currentLength,
                currentLength + PAGE_SIZE
              );

              if (nextBatch.length === 0) {
                return prevDisplayed;
              }

              return [...prevDisplayed, ...nextBatch];
            });
          }
        },
        { threshold: 0, root: $loaderWrapper }
      );

      observer.observe($loader);

      return () => {
        observer.unobserve($loader);
        observer.disconnect(); // 🔥 최적화: observer 완전 정리
      };
    }, [filteredLectures]); // 🔥 최적화: filteredLectures 사용

    useEffect(() => {
      if (searchInfo) {
        // 🔥 최적화: Dialog가 열릴 때 다른 필드들은 리셋하고 선택된 요일/시간만 설정
        setQuery("");
        setGrades([]);
        setMajors([]);
        setCredits(undefined);

        // 선택된 요일/시간만 설정
        if (searchInfo.day) {
          setDays([searchInfo.day]);
        } else {
          setDays([]);
        }

        if (searchInfo.time) {
          setTimes([searchInfo.time]);
        } else {
          setTimes([]);
        }

        // 🔥 최적화: lectures는 초기화하지 않음 (API 데이터 유지)
      }
    }, [searchInfo]);

    // 🔥 최적화: Dialog 닫힐 때 검색 조건만 리셋 (API 데이터 유지)
    const handleClose = useAutoCallback(() => {
      // 모든 검색 조건 리셋
      setQuery("");
      setGrades([]);
      setDays([]);
      setTimes([]);
      setMajors([]);
      setCredits(undefined);

      // 🔥 최적화: displayedLectures 초기화
      setFilteredLectures([]);
      setDisplayedLectures([]);

      // 스크롤 위치 리셋
      loaderWrapperRef.current?.scrollTo(0, 0);

      // Dialog 닫기
      onClose();
    });

    return (
      <Modal isOpen={Boolean(searchInfo)} onClose={handleClose} size="6xl">
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
                lectures={displayedLectures}
                onAddSchedule={addSchedule}
                loaderWrapperRef={loaderWrapperRef}
                loaderRef={loaderRef}
              />
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

SearchDialog.displayName = "SearchDialog";

export default SearchDialog;
