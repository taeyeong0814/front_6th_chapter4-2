import { useState, useCallback, useEffect, useRef } from "react";
import { Schedule } from "../types.ts";

// 🔥 최적화: 개별 테이블별로 독립적인 상태를 관리하는 Hook
export const useIndividualScheduleTable = (
  tableId: string,
  initialSchedules: Schedule[] = []
) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const initializedTableIdRef = useRef<string | null>(null);

  // 🔥 최적화: 한 번만 초기화되도록 수정 (빈 배열도 허용)
  useEffect(() => {
    if (initializedTableIdRef.current !== tableId) {
      console.log(
        `🎯 useIndividualScheduleTable - 초기화: ${tableId}`,
        performance.now()
      );
      setSchedules(initialSchedules);
      initializedTableIdRef.current = tableId;
    }
  }, [initialSchedules, tableId]);

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
