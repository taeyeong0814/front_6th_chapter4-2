import { Flex } from "@chakra-ui/react";
import SearchDialog from "./SearchDialog.tsx";
import React, { useState, useMemo, useRef } from "react";
import { useAutoCallback } from "./hooks/useAutoCallback.ts";
import ScheduleTableWrapper from "./components/ScheduleTableWrapper.tsx";
import dummyScheduleMap from "./dummyScheduleMap.ts";
import { Schedule } from "./types.ts";
import { useScheduleContext } from "./hooks/useScheduleContext.ts";

export const ScheduleTables = React.memo(() => {
  const { addSchedule } = useScheduleContext(); // 🔥 최적화: Context에서 addSchedule 가져오기
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  // 🔥 최적화: 더미 데이터에서 초기 테이블 목록 가져오기
  const [tableIds, setTableIds] = useState<string[]>(() => {
    // 초기 테이블 목록을 더미 데이터에서 가져옴
    return Object.keys(dummyScheduleMap);
  });
  // 🔥 최적화: disabledRemoveButton을 useMemo로 메모이제이션
  const disabledRemoveButton = useMemo(
    () => tableIds.length === 1,
    [tableIds.length]
  );

  // 🔥 최적화: 복제된 테이블의 원본 ID를 추적하는 Map
  const [cloneSourceMap, setCloneSourceMap] = useState<Record<string, string>>(
    {}
  );

  // 🔥 최적화: 복제된 시간표의 실제 데이터를 저장하는 Map
  const [cloneDataMap, setCloneDataMap] = useState<Record<string, Schedule[]>>(
    {}
  );

  // 🔥 최적화: 복제된 시간표의 데이터 업데이트 함수 제거 - 독립적인 상태 관리

  // 🔥 최적화: useAutoCallback으로 함수 최적화
  const duplicate = useAutoCallback(
    (targetId: string, currentSchedules?: Schedule[]) => {
      const newTableId = `schedule-${Date.now()}`;

      // 🔥 최적화: 복제 시 현재 시간표의 실제 데이터를 저장
      if (currentSchedules) {
        setCloneDataMap((prev) => ({
          ...prev,
          [newTableId]: currentSchedules, // 새 테이블의 실제 데이터 저장
        }));
      }

      setCloneSourceMap((prev) => ({
        ...prev,
        [newTableId]: targetId, // 새 테이블의 원본 ID 저장
      }));
      setTableIds((prev) => [...prev, newTableId]);
    }
  );

  const remove = useAutoCallback((targetId: string) => {
    // 🔥 최적화: schedulesMap 업데이트 제거 - 로컬 상태만 관리
    // 테이블 목록에서 삭제된 테이블 제거
    setTableIds((prev) => prev.filter((id) => id !== targetId));
  });

  const handleScheduleTimeClick = useAutoCallback(
    (tableId: string, timeInfo: { day?: string; time?: number }) => {
      setSearchInfo({ tableId, ...timeInfo });
    }
  );

  // 🔥 최적화: handleDeleteButtonClick 제거 - ScheduleTableWrapper에서 직접 처리

  const handleSearchClick = useAutoCallback((tableId: string) => {
    setSearchInfo({ tableId });
  });

  const handleSearchInfoClose = useAutoCallback(() => {
    setSearchInfo(null);
  });

  // 🔥 개별 테이블의 addSchedule 함수들을 저장하는 ref
  const tableAddScheduleRefs = useRef<
    Record<string, (schedules: Schedule[]) => void>
  >({});

  // 🔥 개별 테이블의 addSchedule 함수를 등록받는 함수
  const registerTableAddSchedule = useAutoCallback(
    (tableId: string, addScheduleFn: (schedules: Schedule[]) => void) => {
      tableAddScheduleRefs.current[tableId] = addScheduleFn;
    }
  );

  // 🔥 최적화: SearchDialog를 통한 스케줄 추가 처리
  const handleAddSchedule = useAutoCallback(
    (tableId: string, schedules: Schedule[]) => {
      // 모든 테이블(원본/복제)은 개별 addSchedule 함수 사용
      const addScheduleFn = tableAddScheduleRefs.current[tableId];
      if (addScheduleFn) {
        addScheduleFn(schedules);
      } else {
        // 폴백: Context를 통해 스케줄 추가 (등록되지 않은 경우)
        schedules.forEach((schedule) => {
          addSchedule(tableId, schedule);
        });
      }
    }
  );

  // 🔥 최적화: cloneData 계산을 메모이제이션
  const getCloneData = useAutoCallback((tableId: string) => {
    return (
      cloneDataMap[tableId] ||
      (!cloneSourceMap[tableId]
        ? dummyScheduleMap[tableId as keyof typeof dummyScheduleMap]
        : undefined)
    );
  });

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {tableIds.map((tableId, index) => (
          <ScheduleTableWrapper
            key={tableId}
            tableId={tableId}
            index={index}
            disabledRemoveButton={disabledRemoveButton}
            sourceTableId={cloneSourceMap[tableId]} // 🔥 최적화: 복제 원본 ID 전달
            cloneData={getCloneData(tableId)} // 🔥 최적화: 복제된 시간표 또는 원본 시간표의 실제 데이터 전달
            onScheduleTimeClick={handleScheduleTimeClick}
            onDuplicate={duplicate}
            onRemove={remove}
            onSearchClick={handleSearchClick}
            onRegisterAddSchedule={registerTableAddSchedule} // 🔥 addSchedule 함수 등록
            // 🔥 최적화: 복제 데이터 업데이트 함수 제거 - 독립적인 상태 관리
          />
        ))}
      </Flex>
      <SearchDialog
        searchInfo={searchInfo}
        onClose={handleSearchInfoClose}
        onAddSchedule={handleAddSchedule}
      />
    </>
  );
});

ScheduleTables.displayName = "ScheduleTables";
