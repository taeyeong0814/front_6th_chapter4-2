import { Fragment, memo } from "react";
import { Grid, GridItem, Flex, Text } from "@chakra-ui/react";
import { CellSize, DAY_LABELS, 분 } from "../constants.ts";
import { fill2, parseHnM } from "../utils.ts";
import { useAutoCallback } from "../hooks/useAutoCallback.ts";

// 🔥 최적화: TIMES 배열을 컴포넌트 외부로 이동
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

interface Props {
  onScheduleTimeClick?: (day: string, timeIndex: number) => void;
}

const ScheduleTableHeader = memo(({ onScheduleTimeClick }: Props) => {
  const handleScheduleTimeClick = useAutoCallback(
    (day: string, timeIndex: number) => {
      onScheduleTimeClick?.(day, timeIndex);
    }
  );

  return (
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
        <Fragment key={`fragment-${timeIndex}`}>
          <GridItem
            key={`시간-${timeIndex + 1}`}
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
  );
});

ScheduleTableHeader.displayName = "ScheduleTableHeader";

export default ScheduleTableHeader;
