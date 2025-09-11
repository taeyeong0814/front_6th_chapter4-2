import React, { useCallback } from "react";
import { Schedule } from "../types.ts";
import DraggableSchedule from "./DraggableSchedule.tsx";

interface Props {
  schedules: Schedule[];
  tableId: string;
  getColor: (lectureId: string) => string;
  onDeleteButtonClick: ({ day, time }: { day: string; time: number }) => void;
}

const ScheduleItems = React.memo(
  ({ schedules, tableId, getColor, onDeleteButtonClick }: Props) => {
    // 🔥 최적화: 삭제 버튼 클릭 핸들러를 useCallback으로 메모이제이션
    const handleDeleteClick = useCallback(
      (day: string, time: number) => {
        onDeleteButtonClick({ day, time });
      },
      [onDeleteButtonClick]
    );

    return (
      <>
        {schedules.map((schedule, index) => {
          // 🔥 최적화: 각 스케줄별로 고정된 삭제 핸들러 생성
          const deleteHandler = () =>
            handleDeleteClick(schedule.day, schedule.range[0]);

          return (
            <DraggableSchedule
              key={`${schedule.lecture.title}-${index}`}
              id={`${tableId}:${index}`}
              data={schedule}
              bg={getColor(schedule.lecture.id)}
              onDeleteButtonClick={deleteHandler}
            />
          );
        })}
      </>
    );
  }
);

ScheduleItems.displayName = "ScheduleItems";

export default ScheduleItems;
