import { Box } from "@chakra-ui/react";
import { Schedule } from "./types.ts";
import React, { useMemo, useCallback } from "react";
import { useAutoCallback } from "./hooks/useAutoCallback.ts";
import ScheduleTableHeader from "./components/ScheduleTableHeader.tsx";
import ScheduleItems from "./components/ScheduleItems.tsx";

interface Props {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

// 🔥 최적화: 색상 배열을 상수로 정의
const SCHEDULE_COLORS = [
  "#fdd",
  "#ffd",
  "#dff",
  "#ddf",
  "#fdf",
  "#dfd",
] as const;

const ScheduleTable = React.memo(
  ({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick }: Props) => {
    // 🔥 최적화: getColor 함수를 useMemo로 메모이제이션
    const colorMap = useMemo(() => {
      const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
      const map = new Map<string, string>();

      lectures.forEach((lectureId, index) => {
        map.set(lectureId, SCHEDULE_COLORS[index % SCHEDULE_COLORS.length]);
      });

      return map;
    }, [schedules]);

    const getColor = useCallback(
      (lectureId: string): string => {
        return colorMap.get(lectureId) || SCHEDULE_COLORS[0];
      },
      [colorMap]
    );

    // 🔥 최적화: 이벤트 핸들러를 useAutoCallback으로 최적화
    const handleScheduleTimeClick = useAutoCallback(
      (day: string, timeIndex: number) => {
        onScheduleTimeClick?.({ day, time: timeIndex + 1 });
      }
    );

    const handleDeleteButtonClick = useAutoCallback(
      ({ day, time }: { day: string; time: number }) => {
        onDeleteButtonClick?.({ day, time });
      }
    );

    return (
      <Box position="relative">
        {/* 🔥 최적화: 헤더는 한 번만 렌더링 */}
        <ScheduleTableHeader onScheduleTimeClick={handleScheduleTimeClick} />

        {/* 🔥 최적화: 강의만 리렌더링 */}
        <ScheduleItems
          schedules={schedules}
          tableId={tableId}
          getColor={getColor}
          onDeleteButtonClick={handleDeleteButtonClick}
        />
      </Box>
    );
  }
);

ScheduleTable.displayName = "ScheduleTable";

export default ScheduleTable;
