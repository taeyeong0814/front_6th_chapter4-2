import React from "react";
import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "../ScheduleTable.tsx";
import { useAutoCallback } from "../hooks/useAutoCallback.ts";
import { useScheduleContext } from "../hooks/useScheduleContext.ts";
import { useIndividualScheduleTable } from "../hooks/useIndividualScheduleTable.ts";

interface Props {
  tableId: string;
  index: number;
  disabledRemoveButton: boolean;
  onScheduleTimeClick: (
    tableId: string,
    timeInfo: { day?: string; time?: number }
  ) => void;
  onDuplicate: (targetId: string) => void;
  onRemove: (targetId: string) => void;
  onSearchClick: (tableId: string) => void;
}

const ScheduleTableWrapper = React.memo(
  ({
    tableId,
    index,
    disabledRemoveButton,
    onScheduleTimeClick,
    onDuplicate,
    onRemove,
    onSearchClick,
  }: Props) => {
    console.log(
      `🎯 ScheduleTableWrapper 렌더링됨: ${tableId}`,
      performance.now()
    );

    // 🔥 최적화: 개별 테이블별로 독립적인 상태 관리
    const { schedulesMap } = useScheduleContext();
    const initialSchedules = schedulesMap[tableId] || [];
    const { schedules, removeSchedule } = useIndividualScheduleTable(
      tableId,
      initialSchedules
    );

    // 🔥 최적화: 테이블별 이벤트 핸들러
    const handleScheduleTimeClick = useAutoCallback(
      (timeInfo: { day?: string; time?: number }) => {
        onScheduleTimeClick(tableId, timeInfo);
      }
    );

    const handleDeleteButtonClick = useAutoCallback(
      ({ day, time }: { day: string; time: number }) => {
        // 🔥 최적화: 개별 테이블에서 직접 강의 삭제 처리
        console.log(
          `🎯 ScheduleTableWrapper - 강의 삭제: ${tableId}`,
          performance.now()
        );
        const targetIndex = schedules.findIndex(
          (schedule) => schedule.day === day && schedule.range.includes(time)
        );

        if (targetIndex !== -1) {
          removeSchedule(targetIndex);
        }
      }
    );

    const handleDuplicate = useAutoCallback(() => {
      console.log(
        `🎯 ScheduleTableWrapper - 복제: ${tableId}`,
        performance.now()
      );
      // 🔥 최적화: 복제 시 schedulesMap 업데이트를 개별 테이블에서 처리
      onDuplicate(tableId);
    });

    const handleRemove = useAutoCallback(() => {
      onRemove(tableId);
    });

    const handleSearchClick = useAutoCallback(() => {
      onSearchClick(tableId);
    });

    return (
      <Stack key={tableId} width="600px">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h3" fontSize="lg">
            시간표 {index + 1}
          </Heading>
          <ButtonGroup size="sm" isAttached>
            <Button colorScheme="green" onClick={handleSearchClick}>
              시간표 추가
            </Button>
            <Button colorScheme="green" mx="1px" onClick={handleDuplicate}>
              복제
            </Button>
            <Button
              colorScheme="green"
              isDisabled={disabledRemoveButton}
              onClick={handleRemove}
            >
              삭제
            </Button>
          </ButtonGroup>
        </Flex>
        <ScheduleTable
          key={`schedule-table-${index}`}
          schedules={schedules}
          tableId={tableId}
          onScheduleTimeClick={handleScheduleTimeClick}
          onDeleteButtonClick={handleDeleteButtonClick}
        />
      </Stack>
    );
  }
);

ScheduleTableWrapper.displayName = "ScheduleTableWrapper";

export default ScheduleTableWrapper;
