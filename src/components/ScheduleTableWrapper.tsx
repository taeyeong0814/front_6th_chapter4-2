import React from "react";
import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "../ScheduleTable.tsx";
import { useAutoCallback } from "../hooks/useAutoCallback.ts";
import { useScheduleContext } from "../hooks/useScheduleContext.ts";
import { useIndividualScheduleTable } from "../hooks/useIndividualScheduleTable.ts";
import { Schedule } from "../types.ts";

interface Props {
  tableId: string;
  index: number;
  disabledRemoveButton: boolean;
  sourceTableId?: string; // 🔥 최적화: 복제 원본 테이블 ID
  cloneData?: Schedule[]; // 🔥 최적화: 복제된 시간표의 실제 데이터
  onScheduleTimeClick: (
    tableId: string,
    timeInfo: { day?: string; time?: number }
  ) => void;
  onDuplicate: (targetId: string, currentSchedules?: Schedule[]) => void;
  onRemove: (targetId: string) => void;
  onSearchClick: (tableId: string) => void;
}

const ScheduleTableWrapper = React.memo(
  ({
    tableId,
    index,
    disabledRemoveButton,
    sourceTableId,
    cloneData,
    onScheduleTimeClick,
    onDuplicate,
    onRemove,
    onSearchClick,
  }: Props) => {
    console.log(
      `🎯 ScheduleTableWrapper 렌더링됨: ${tableId}`,
      performance.now()
    );

    // 🔥 최적화: 복제된 시간표는 렌더링 과정을 스킵하고 바로 보여지도록
    const isClonedTable = sourceTableId !== undefined;

    // 🔥 최적화: 개별 테이블별로 독립적인 상태 관리
    const { schedulesMap } = useScheduleContext();
    // 🔥 최적화: 복제된 시간표는 실제 데이터를 초기값으로 사용
    const initialSchedules =
      cloneData ||
      (sourceTableId
        ? schedulesMap[sourceTableId] || []
        : schedulesMap[tableId] || []);

    // 🔥 최적화: 모든 경우에 useIndividualScheduleTable 호출 (Hook 규칙 준수)
    const { schedules: hookSchedules, removeSchedule } =
      useIndividualScheduleTable(tableId, initialSchedules);

    // 🔥 최적화: 복제된 시간표는 렌더링 과정 없이 바로 데이터 사용
    const schedules = isClonedTable ? initialSchedules : hookSchedules;

    // 🔥 최적화: 복제된 시간표의 데이터 전달 제거 - 독립적인 상태 관리

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
      // 🔥 최적화: 복제 시 현재 시간표의 실제 데이터를 전달
      onDuplicate(tableId, schedules);
    });

    const handleRemove = useAutoCallback(() => {
      onRemove(tableId);
    });

    const handleSearchClick = useAutoCallback(() => {
      onSearchClick(tableId);
    });

    // 🔥 최적화: 복제된 시간표는 렌더링 과정 없이 바로 완성된 상태로 보여지도록
    if (isClonedTable) {
      console.log(
        `🎯 복제된 시간표 - 렌더링 스킵: ${tableId}`,
        performance.now()
      );
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

    // 🔥 최적화: 원본 시간표만 정상적인 렌더링 과정 거침
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
