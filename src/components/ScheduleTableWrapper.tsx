import React, { useEffect } from "react";
import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import ScheduleTable from "../ScheduleTable.tsx";
import { useAutoCallback } from "../hooks/useAutoCallback.ts";
import { useIndividualScheduleTable } from "../hooks/useIndividualScheduleTable.ts";
import { Schedule } from "../types.ts";
import { CellSize } from "../constants.ts";

// 🔥 최적화: 드래그 영역 처리를 위한 SnapModifier
function createSnapModifier(): Modifier {
  return ({ transform, containerNodeRect, draggingNodeRect }) => {
    const containerTop = containerNodeRect?.top ?? 0;
    const containerLeft = containerNodeRect?.left ?? 0;
    const containerBottom = containerNodeRect?.bottom ?? 0;
    const containerRight = containerNodeRect?.right ?? 0;

    const { top = 0, left = 0, bottom = 0, right = 0 } = draggingNodeRect ?? {};

    const minX = containerLeft - left + 120 + 1;
    const minY = containerTop - top + 40 + 1;
    const maxX = containerRight - right;
    const maxY = containerBottom - bottom;

    return {
      ...transform,
      x: Math.min(
        Math.max(
          Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH,
          minX
        ),
        maxX
      ),
      y: Math.min(
        Math.max(
          Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT,
          minY
        ),
        maxY
      ),
    };
  };
}

const modifiers = [createSnapModifier()];

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
  onRegisterAddSchedule?: (
    tableId: string,
    addScheduleFn: (schedules: Schedule[]) => void
  ) => void; // 🔥 addSchedule 함수 등록
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
    onRegisterAddSchedule,
  }: Props) => {
    // 🔥 최적화: 복제된 시간표는 렌더링 과정을 스킵하고 바로 보여지도록
    const isClonedTable = sourceTableId !== undefined;

    // 🔥 최적화: 완전한 상태 분리 - useScheduleContext 제거
    // 복제된 시간표는 cloneData를 직접 사용, 원본은 빈 배열로 시작
    const initialSchedules = cloneData || [];

    // 🔥 최적화: 모든 경우에 useIndividualScheduleTable 호출 (Hook 규칙 준수)
    const {
      schedules: hookSchedules,
      addSchedule: hookAddSchedule,
      removeSchedule,
      handleDragEnd,
    } = useIndividualScheduleTable(tableId, initialSchedules);

    // 🔥 최적화: 복제된 시간표도 hookSchedules를 사용하여 상태 관리
    const schedules = hookSchedules;

    // 🔥 최적화: 개별 시간표용 DndContext 센서 설정
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 8,
        },
      })
    );

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
        const targetIndex = schedules.findIndex(
          (schedule) => schedule.day === day && schedule.range.includes(time)
        );

        if (targetIndex !== -1) {
          removeSchedule(targetIndex);
        }
      }
    );

    const handleDuplicate = useAutoCallback(() => {
      // 🔥 최적화: 복제 시 현재 시간표의 실제 데이터를 전달
      onDuplicate(tableId, schedules);
    });

    const handleRemove = useAutoCallback(() => {
      onRemove(tableId);
    });

    const handleSearchClick = useAutoCallback(() => {
      onSearchClick(tableId);
    });

    // 🔥 addSchedule 함수를 부모에게 등록 (모든 테이블)
    useEffect(() => {
      if (onRegisterAddSchedule) {
        const addScheduleWrapper = (schedules: Schedule[]) => {
          schedules.forEach((schedule) => {
            hookAddSchedule(schedule);
          });
        };
        onRegisterAddSchedule(tableId, addScheduleWrapper);
      }
    }, [onRegisterAddSchedule, tableId, hookAddSchedule]);

    // 🔥 최적화: 복제된 시간표는 렌더링 과정 없이 바로 완성된 상태로 보여지도록
    if (isClonedTable) {
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
        <DndContext
          sensors={sensors}
          onDragEnd={handleDragEnd}
          modifiers={modifiers}
        >
          <ScheduleTable
            key={`schedule-table-${index}`}
            schedules={schedules}
            tableId={tableId}
            onScheduleTimeClick={handleScheduleTimeClick}
            onDeleteButtonClick={handleDeleteButtonClick}
          />
        </DndContext>
      </Stack>
    );
  }
);

ScheduleTableWrapper.displayName = "ScheduleTableWrapper";

export default ScheduleTableWrapper;
