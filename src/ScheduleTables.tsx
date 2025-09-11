import { Flex } from "@chakra-ui/react";
import { useScheduleContext } from "./hooks/useScheduleContext.ts";
import SearchDialog from "./SearchDialog.tsx";
import React, { useState, useMemo } from "react";
import { useAutoCallback } from "./hooks/useAutoCallback.ts";
import ScheduleTableWrapper from "./components/ScheduleTableWrapper.tsx";
import dummyScheduleMap from "./dummyScheduleMap.ts";

export const ScheduleTables = React.memo(() => {
  console.log("🎯 ScheduleTables 렌더링됨:", performance.now());
  const { setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  // 🔥 최적화: 더미 데이터에서 초기 테이블 목록 가져오기
  const [tableIds, setTableIds] = useState<string[]>(() => {
    // 초기 테이블 목록을 더미 데이터에서 가져옴
    return Object.keys(dummyScheduleMap);
  });
  // 🔥 최적화: disabledRemoveButton을 useMemo로 메모이제이션
  const disabledRemoveButton = useMemo(
    () => tableIds.length === 1,
    [tableIds.length]
  );

  // 🔥 최적화: useAutoCallback으로 함수 최적화
  const duplicate = useAutoCallback((targetId: string) => {
    const newTableId = `schedule-${Date.now()}`;
    // 🔥 최적화: 복제 시에만 schedulesMap 업데이트 (필요한 경우에만)
    setSchedulesMap((prev) => ({
      ...prev,
      [newTableId]: [...prev[targetId]],
    }));
    // 테이블 목록에 새 테이블 추가
    setTableIds((prev) => [...prev, newTableId]);
  });

  const remove = useAutoCallback((targetId: string) => {
    console.log(
      `🎯 ScheduleTables - 시간표 삭제: ${targetId}`,
      performance.now()
    );
    // 🔥 최적화: schedulesMap 업데이트 제거 - 로컬 상태만 관리
    // 테이블 목록에서 삭제된 테이블 제거
    setTableIds((prev) => prev.filter((id) => id !== targetId));
  });

  const handleScheduleTimeClick = useAutoCallback(
    (tableId: string, timeInfo: { day?: string; time?: number }) => {
      setSearchInfo({ tableId, ...timeInfo });
    }
  );

  // 🔥 최적화: handleDeleteButtonClick 제거 - ScheduleTableWrapper에서 직접 처리

  const handleSearchClick = useAutoCallback((tableId: string) => {
    setSearchInfo({ tableId });
  });

  const handleSearchInfoClose = useAutoCallback(() => {
    setSearchInfo(null);
  });

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {tableIds.map((tableId, index) => (
          <ScheduleTableWrapper
            key={tableId}
            tableId={tableId}
            index={index}
            disabledRemoveButton={disabledRemoveButton}
            onScheduleTimeClick={handleScheduleTimeClick}
            onDuplicate={duplicate}
            onRemove={remove}
            onSearchClick={handleSearchClick}
          />
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={handleSearchInfoClose} />
    </>
  );
});

ScheduleTables.displayName = "ScheduleTables";
