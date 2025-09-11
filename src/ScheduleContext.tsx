import { PropsWithChildren, useState, useMemo, useCallback } from "react";
import { Schedule } from "./types.ts";
import dummyScheduleMap from "./dummyScheduleMap.ts";
import { ScheduleContext } from "./context/ScheduleContext.ts";

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  console.log("🎯 ScheduleProvider 렌더링됨:", performance.now());
  const [schedulesMap, setSchedulesMap] =
    useState<Record<string, Schedule[]>>(dummyScheduleMap);

  // 🔥 최적화: 특정 테이블의 스케줄만 가져오는 selector
  const getSchedulesByTableId = useCallback(
    (tableId: string) => {
      console.log(
        `🎯 getSchedulesByTableId 호출됨: ${tableId}`,
        performance.now()
      );
      return schedulesMap[tableId] || [];
    },
    [schedulesMap] // schedulesMap 의존성 복원
  );

  // 🔥 최적화: 스케줄 추가 함수
  const addSchedule = useCallback((tableId: string, schedule: Schedule) => {
    console.log(`🎯 addSchedule 호출됨: ${tableId}`, performance.now());
    setSchedulesMap((prev) => ({
      ...prev,
      [tableId]: [...(prev[tableId] || []), schedule],
    }));
  }, []);

  // 🔥 최적화: 스케줄 삭제 함수
  const removeSchedule = useCallback((tableId: string, index: number) => {
    console.log(
      `🎯 removeSchedule 호출됨: ${tableId}, ${index}`,
      performance.now()
    );
    setSchedulesMap((prev) => ({
      ...prev,
      [tableId]: prev[tableId]?.filter((_, i) => i !== index) || [],
    }));
  }, []);

  // 🔥 최적화: 스케줄 업데이트 함수
  const updateSchedule = useCallback(
    (tableId: string, index: number, schedule: Schedule) => {
      console.log(
        `🎯 updateSchedule 호출됨: ${tableId}, ${index}`,
        performance.now()
      );
      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]:
          prev[tableId]?.map((s, i) => (i === index ? schedule : s)) || [],
      }));
    },
    []
  );

  // 🔥 최적화: setSchedulesMap 함수 메모이제이션
  const memoizedSetSchedulesMap = useCallback(setSchedulesMap, [
    setSchedulesMap,
  ]);

  // 🔥 최적화: Context value 메모이제이션
  const contextValue = useMemo(
    () => ({
      schedulesMap,
      setSchedulesMap: memoizedSetSchedulesMap,
      getSchedulesByTableId,
      addSchedule,
      removeSchedule,
      updateSchedule,
    }),
    [
      schedulesMap,
      memoizedSetSchedulesMap,
      getSchedulesByTableId,
      addSchedule,
      removeSchedule,
      updateSchedule,
    ]
  );

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
};
