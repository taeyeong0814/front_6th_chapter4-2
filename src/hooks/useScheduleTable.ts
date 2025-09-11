import { useMemo, useCallback } from "react";
import { useScheduleContext } from "./useScheduleContext.ts";
import { Schedule } from "../types.ts";

// 🔥 최적화: 특정 테이블만 구독하는 Hook
export const useScheduleTable = (tableId: string) => {
  const { getSchedulesByTableId, addSchedule, removeSchedule, updateSchedule } =
    useScheduleContext();

  const schedules = useMemo(() => {
    console.log(
      `🎯 useScheduleTable - schedules 계산됨: ${tableId}`,
      performance.now()
    );
    return getSchedulesByTableId(tableId);
  }, [getSchedulesByTableId, tableId]);

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
