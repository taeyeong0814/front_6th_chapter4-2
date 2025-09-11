import { useState, useCallback, useEffect, useRef } from "react";
import { Schedule } from "../types.ts";
import { DAY_LABELS, CellSize } from "../constants.ts";
import { DragEndEvent } from "@dnd-kit/core";

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
      setSchedules(initialSchedules);
      initializedTableIdRef.current = tableId;
    }
  }, [initialSchedules, tableId]);

  const addSchedule = useCallback(
    (schedule: Schedule) => {
      setSchedules((prev) => [...prev, schedule]);
    },
    [tableId]
  );

  const removeSchedule = useCallback(
    (index: number) => {
      setSchedules((prev) => prev.filter((_, i) => i !== index));
    },
    [tableId]
  );

  const updateSchedule = useCallback(
    (index: number, schedule: Schedule) => {
      setSchedules((prev) => prev.map((s, i) => (i === index ? schedule : s)));
    },
    [tableId]
  );

  // 🔥 최적화: 드래그&드롭 처리 함수 추가
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      const { x, y } = delta;
      const [, index] = String(active.id).split(":");

      const schedule = schedules[Number(index)];
      const nowDayIndex = DAY_LABELS.indexOf(
        schedule.day as (typeof DAY_LABELS)[number]
      );

      // 🔥 최적화: 정확한 셀 크기 사용 (CellSize 상수 사용)
      const moveDayIndex = Math.floor(x / CellSize.WIDTH);
      const moveTimeIndex = Math.floor(y / CellSize.HEIGHT);

      // 🔥 최적화: 유효한 범위 내에서만 이동 허용
      const newDayIndex = Math.max(
        0,
        Math.min(DAY_LABELS.length - 1, nowDayIndex + moveDayIndex)
      );

      // 🔥 최적화: 시간 범위도 유효한 범위 내에서만 허용 (1-24시간)
      const newRange = schedule.range.map((time) => {
        const newTime = time + moveTimeIndex;
        return Math.max(1, Math.min(24, newTime));
      });

      // 🔥 최적화: 실제로 변경사항이 있는지 확인
      const hasDayChanged = newDayIndex !== nowDayIndex;
      const hasTimeChanged = !newRange.every(
        (time, idx) => time === schedule.range[idx]
      );

      // 실제로 변경사항이 없는 경우에만 원래 위치 유지
      if (!hasDayChanged && !hasTimeChanged) {
        return; // 변경사항 없음
      }

      const updatedSchedule = {
        ...schedule,
        day: DAY_LABELS[newDayIndex],
        range: newRange,
      };

      updateSchedule(Number(index), updatedSchedule);
    },
    [tableId, schedules, updateSchedule]
  );

  return {
    schedules,
    addSchedule,
    removeSchedule,
    updateSchedule,
    handleDragEnd, // 🔥 최적화: 드래그&드롭 핸들러 추가
  };
};
