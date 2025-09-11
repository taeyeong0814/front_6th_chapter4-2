import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import ScheduleTable from "./ScheduleTable.tsx";
import { useScheduleContext } from "./ScheduleContext.tsx";
import SearchDialog from "./SearchDialog.tsx";
import { useState, useMemo, memo } from "react";
import { useAutoCallback } from "./hooks/useAutoCallback";

// 버튼 영역을 메모이제이션된 컴포넌트로 분리
const TableHeader = memo(
  ({
    index,
    // tableId,
    onAddClick,
    onDuplicateClick,
    onRemoveClick,
    isRemoveDisabled,
  }: {
    index: number;
    tableId: string;
    onAddClick: () => void;
    onDuplicateClick: () => void;
    onRemoveClick: () => void;
    isRemoveDisabled: boolean;
  }) => {
    console.log(`🔘 TableHeader ${index + 1} 렌더링`);

    return (
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h3" fontSize="lg">
          시간표 {index + 1}
        </Heading>
        <ButtonGroup size="sm" isAttached>
          <Button colorScheme="green" onClick={onAddClick}>
            시간표 추가
          </Button>
          <Button colorScheme="green" mx="1px" onClick={onDuplicateClick}>
            복제
          </Button>
          <Button
            colorScheme="green"
            isDisabled={isRemoveDisabled}
            onClick={onRemoveClick}
          >
            삭제
          </Button>
        </ButtonGroup>
      </Flex>
    );
  }
);

export const ScheduleTables = memo(() => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  // 핸들러 함수들을 useAutoCallback으로 메모이제이션
  const duplicate = useAutoCallback((targetId: string) => {
    setSchedulesMap((prev) => ({
      ...prev,
      [`schedule-${Date.now()}`]: [...prev[targetId]],
    }));
  });

  const remove = useAutoCallback((targetId: string) => {
    setSchedulesMap((prev) => {
      delete prev[targetId];
      return { ...prev };
    });
  });

  const handleAddClick = useAutoCallback((tableId: string) => {
    setSearchInfo({ tableId });
  });

  const handleCloseDialog = useAutoCallback(() => {
    setSearchInfo(null);
  });

  // 각 테이블별 핸들러를 메모이제이션
  const handlersMap = useMemo(() => {
    const map = new Map();

    Object.keys(schedulesMap).forEach((tableId) => {
      if (!map.has(tableId)) {
        map.set(tableId, {
          // 시간표 핸들러
          onScheduleTimeClick: (timeInfo: { day: string; time: number }) => {
            setSearchInfo({ tableId, ...timeInfo });
          },
          onDeleteButtonClick: ({
            day,
            time,
          }: {
            day: string;
            time: number;
          }) => {
            setSchedulesMap((prev) => ({
              ...prev,
              [tableId]: prev[tableId].filter(
                (schedule) =>
                  schedule.day !== day || !schedule.range.includes(time)
              ),
            }));
          },
          // 버튼 핸들러
          onAddClick: () => handleAddClick(tableId),
          onDuplicateClick: () => duplicate(tableId),
          onRemoveClick: () => remove(tableId),
        });
      }
    });

    return map;
  }, [schedulesMap, setSchedulesMap, handleAddClick, duplicate, remove]);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId, schedules], index) => {
          const handlers = handlersMap.get(tableId);

          return (
            <Stack key={tableId} width="600px">
              <TableHeader
                index={index}
                tableId={tableId}
                onAddClick={handlers.onAddClick}
                onDuplicateClick={handlers.onDuplicateClick}
                onRemoveClick={handlers.onRemoveClick}
                isRemoveDisabled={disabledRemoveButton}
              />
              <ScheduleTable
                key={`schedule-table-${index}`}
                schedules={schedules}
                tableId={tableId}
                onScheduleTimeClick={handlers.onScheduleTimeClick}
                onDeleteButtonClick={handlers.onDeleteButtonClick}
              />
            </Stack>
          );
        })}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleCloseDialog} />
    </>
  );
});
