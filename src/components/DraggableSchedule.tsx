import React, { useMemo } from "react";
import {
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@chakra-ui/react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Schedule } from "../types.ts";
import { CellSize, DAY_LABELS } from "../constants.ts";
import { useAutoCallback } from "../hooks/useAutoCallback.ts";

interface Props {
  id: string;
  data: Schedule;
  bg: string;
  onDeleteButtonClick: () => void;
}

const DraggableSchedule = React.memo(
  ({ id, data, bg, onDeleteButtonClick }: Props) => {
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

export default DraggableSchedule;
