import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { CellSize, DAY_LABELS, 분 } from "./constants.ts";
import { Schedule } from "./types.ts";
import { fill2, parseHnM } from "./utils.ts";
import { useDndContext, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React, { ComponentProps, Fragment, useMemo, useCallback } from "react";
import { useAutoCallback } from "./hooks/useAutoCallback.ts";

interface Props {
  tableId: string;
  schedules: Schedule[];
  onScheduleTimeClick?: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick?: (timeInfo: { day: string; time: number }) => void;
}

// 🔥 최적화: TIMES 배열을 컴포넌트 외부로 이동하여 매번 생성되지 않도록 함
const TIMES = [
  ...Array(18)
    .fill(0)
    .map((v, k) => v + k * 30 * 분)
    .map((v) => `${parseHnM(v)}~${parseHnM(v + 30 * 분)}`),

  ...Array(6)
    .fill(18 * 30 * 분)
    .map((v, k) => v + k * 55 * 분)
    .map((v) => `${parseHnM(v)}~${parseHnM(v + 50 * 분)}`),
] as const;

// 🔥 최적화: 색상 배열을 상수로 정의
const SCHEDULE_COLORS = [
  "#fdd",
  "#ffd",
  "#dff",
  "#ddf",
  "#fdf",
  "#dfd",
] as const;

const ScheduleTable = ({
  tableId,
  schedules,
  onScheduleTimeClick,
  onDeleteButtonClick,
}: Props) => {
  console.log("🎯 ScheduleTable 렌더링됨:", performance.now());

  // 🔥 최적화: getColor 함수를 useMemo로 메모이제이션
  const colorMap = useMemo(() => {
    console.log("🎯 colorMap 계산됨:", performance.now());
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

  const dndContext = useDndContext();

  // 🔥 최적화: getActiveTableId를 useMemo로 메모이제이션
  const activeTableId = useMemo(() => {
    const activeId = dndContext.active?.id;
    if (activeId) {
      return String(activeId).split(":")[0];
    }
    return null;
  }, [dndContext.active?.id]);

  // 🔥 최적화: 이벤트 핸들러를 useAutoCallback으로 최적화
  const handleScheduleTimeClick = useAutoCallback(
    (day: string, timeIndex: number) => {
      onScheduleTimeClick?.({ day, time: timeIndex + 1 });
    }
  );

  return (
    <Box
      position="relative"
      outline={activeTableId === tableId ? "5px dashed" : undefined}
      outlineColor="blue.300"
    >
      <Grid
        templateColumns={`120px repeat(${DAY_LABELS.length}, ${CellSize.WIDTH}px)`}
        templateRows={`40px repeat(${TIMES.length}, ${CellSize.HEIGHT}px)`}
        bg="white"
        fontSize="sm"
        textAlign="center"
        outline="1px solid"
        outlineColor="gray.300"
      >
        <GridItem key="교시" borderColor="gray.300" bg="gray.100">
          <Flex justifyContent="center" alignItems="center" h="full" w="full">
            <Text fontWeight="bold">교시</Text>
          </Flex>
        </GridItem>
        {DAY_LABELS.map((day) => (
          <GridItem
            key={day}
            borderLeft="1px"
            borderColor="gray.300"
            bg="gray.100"
          >
            <Flex justifyContent="center" alignItems="center" h="full">
              <Text fontWeight="bold">{day}</Text>
            </Flex>
          </GridItem>
        ))}
        {TIMES.map((time, timeIndex) => (
          <Fragment key={`시간-${timeIndex + 1}`}>
            <GridItem
              borderTop="1px solid"
              borderColor="gray.300"
              bg={timeIndex > 17 ? "gray.200" : "gray.100"}
            >
              <Flex justifyContent="center" alignItems="center" h="full">
                <Text fontSize="xs">
                  {fill2(timeIndex + 1)} ({time})
                </Text>
              </Flex>
            </GridItem>
            {DAY_LABELS.map((day) => (
              <GridItem
                key={`${day}-${timeIndex + 2}`}
                borderWidth="1px 0 0 1px"
                borderColor="gray.300"
                bg={timeIndex > 17 ? "gray.100" : "white"}
                cursor="pointer"
                _hover={{ bg: "yellow.100" }}
                onClick={() => handleScheduleTimeClick(day, timeIndex)}
              />
            ))}
          </Fragment>
        ))}
      </Grid>

      {schedules.map((schedule, index) => (
        <DraggableSchedule
          key={`${schedule.lecture.title}-${index}`}
          id={`${tableId}:${index}`}
          data={schedule}
          bg={getColor(schedule.lecture.id)}
          onDeleteButtonClick={() =>
            onDeleteButtonClick?.({
              day: schedule.day,
              time: schedule.range[0],
            })
          }
        />
      ))}
    </Box>
  );
};

const DraggableSchedule = React.memo(
  ({
    id,
    data,
    bg,
    onDeleteButtonClick,
  }: { id: string; data: Schedule } & ComponentProps<typeof Box> & {
      onDeleteButtonClick: () => void;
    }) => {
    console.log(`🎯 DraggableSchedule 렌더링됨: ${id}`, performance.now());

    const { day, range, room, lecture } = data;
    const { attributes, setNodeRef, listeners, transform } = useDraggable({
      id,
    });

    // 🔥 최적화: 계산값들을 useMemo로 메모이제이션
    const leftIndex = useMemo(
      () => DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]),
      [day]
    );

    const topIndex = useMemo(() => range[0] - 1, [range]);
    const size = useMemo(() => range.length, [range]);

    // 🔥 최적화: 스타일 계산을 useMemo로 메모이제이션
    const style = useMemo(
      () => ({
        left: `${120 + CellSize.WIDTH * leftIndex + 1}px`,
        top: `${40 + (topIndex * CellSize.HEIGHT + 1)}px`,
        width: `${CellSize.WIDTH - 1}px`,
        height: `${CellSize.HEIGHT * size - 1}px`,
      }),
      [leftIndex, topIndex, size]
    );

    // 🔥 최적화: 이벤트 핸들러를 useAutoCallback으로 최적화
    const handlePopoverClick = useAutoCallback((event: React.MouseEvent) => {
      event.stopPropagation();
    });

    return (
      <Popover>
        <PopoverTrigger>
          <Box
            position="absolute"
            left={style.left}
            top={style.top}
            width={style.width}
            height={style.height}
            bg={bg}
            p={1}
            boxSizing="border-box"
            cursor="pointer"
            ref={setNodeRef}
            transform={CSS.Translate.toString(transform)}
            {...listeners}
            {...attributes}
          >
            <Text fontSize="sm" fontWeight="bold">
              {lecture.title}
            </Text>
            <Text fontSize="xs">{room}</Text>
          </Box>
        </PopoverTrigger>
        <PopoverContent onClick={handlePopoverClick}>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Text>강의를 삭제하시겠습니까?</Text>
            <Button colorScheme="red" size="xs" onClick={onDeleteButtonClick}>
              삭제
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
);

DraggableSchedule.displayName = "DraggableSchedule";

export default ScheduleTable;
