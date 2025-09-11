import { useState, useCallback, useEffect } from "react";
import { Schedule } from "../types.ts";

// 🔥 최적화: 개별 테이블별로 독립적인 상태를 관리하는 Hook
export const useIndividualScheduleTable = (
  tableId: string,
  initialSchedules: Schedule[] = []
) => {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);

  // 🔥 초기 데이터 설정
  useEffect(() => {
    if (initialSchedules.length > 0) {
      setSchedules(initialSchedules);
    }
  }, [initialSchedules]);

  const addSchedule = useCallback(
    (schedule: Schedule) => {
      console.log(
        `🎯 useIndividualScheduleTable - addSchedule: ${tableId}`,
        performance.now()
      );
      setSchedules((prev) => [...prev, schedule]);
    },
    [tableId]
  );

  const removeSchedule = useCallback(
    (index: number) => {
      console.log(
        `🎯 useIndividualScheduleTable - removeSchedule: ${tableId}, ${index}`,
        performance.now()
      );
      setSchedules((prev) => prev.filter((_, i) => i !== index));
    },
    [tableId]
  );

  const updateSchedule = useCallback(
    (index: number, schedule: Schedule) => {
      console.log(
        `🎯 useIndividualScheduleTable - updateSchedule: ${tableId}, ${index}`,
        performance.now()
      );
      setSchedules((prev) => prev.map((s, i) => (i === index ? schedule : s)));
    },
    [tableId]
  );

  return {
    schedules,
    addSchedule,
    removeSchedule,
    updateSchedule,
  };
};
