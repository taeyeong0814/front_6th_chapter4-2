import React from "react";
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
    console.log(`🎯 ScheduleItems 렌더링됨: ${tableId}`, performance.now());

    return (
      <>
        {schedules.map((schedule, index) => (
          <DraggableSchedule
            key={`${schedule.lecture.title}-${index}`}
            id={`${tableId}:${index}`}
            data={schedule}
            bg={getColor(schedule.lecture.id)}
            onDeleteButtonClick={() =>
              onDeleteButtonClick({
                day: schedule.day,
                time: schedule.range[0],
              })
            }
          />
        ))}
      </>
    );
  }
);

ScheduleItems.displayName = "ScheduleItems";

export default ScheduleItems;
