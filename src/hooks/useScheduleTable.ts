import { useMemo, useCallback, useContext } from "react";
import { ScheduleContext } from "../context/ScheduleContext.ts";
import { Schedule } from "../types.ts";

// 🔥 최적화: 특정 테이블만 구독하는 Hook
export const useScheduleTable = (tableId: string) => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useScheduleTable must be used within a ScheduleProvider");
  }

  const { schedulesMap, addSchedule, removeSchedule, updateSchedule } = context;

  // 🔥 최적화: 해당 테이블의 schedules만 구독
  const schedules = useMemo(() => {
    return schedulesMap[tableId] || [];
  }, [schedulesMap, tableId]); // schedulesMap과 tableId를 의존성으로 설정

  const handleAddSchedule = useCallback(
    (schedule: Schedule) => {
      addSchedule(tableId, schedule);
    },
    [addSchedule, tableId]
  );

  const handleRemoveSchedule = useCallback(
    (index: number) => {
      removeSchedule(tableId, index);
    },
    [removeSchedule, tableId]
  );

  const handleUpdateSchedule = useCallback(
    (index: number, schedule: Schedule) => {
      updateSchedule(tableId, index, schedule);
    },
    [updateSchedule, tableId]
  );

  return {
    schedules,
    addSchedule: handleAddSchedule,
    removeSchedule: handleRemoveSchedule,
    updateSchedule: handleUpdateSchedule,
  };
};
