import React from "react";
import { Table, Thead, Tbody, Th, Tr, Box } from "@chakra-ui/react";
import { Lecture } from "../types.ts";
import LectureRow from "./LectureRow.tsx";

interface Props {
  lectures: Lecture[];
  onAddSchedule: (lecture: Lecture) => void;
  loaderWrapperRef: React.RefObject<HTMLDivElement | null>;
  loaderRef: React.RefObject<HTMLDivElement | null>;
}

const LectureTable = React.memo(
  ({ lectures, onAddSchedule, loaderWrapperRef, loaderRef }: Props) => {
    console.log("🎯 LectureTable 렌더링됨:", performance.now());

    return (
      <Box>
        <Table>
          <Thead>
            <Tr>
              <Th width="100px">과목코드</Th>
              <Th width="50px">학년</Th>
              <Th width="200px">과목명</Th>
              <Th width="50px">학점</Th>
              <Th width="150px">전공</Th>
              <Th width="150px">시간</Th>
              <Th width="80px"></Th>
            </Tr>
          </Thead>
        </Table>

        <Box overflowY="auto" maxH="500px" ref={loaderWrapperRef}>
          <Table size="sm" variant="striped">
            <Tbody>
              {lectures.map((lecture, index) => (
                <LectureRow
                  key={`${lecture.id}-${index}`}
                  lecture={lecture}
                  onAddSchedule={onAddSchedule}
                />
              ))}
            </Tbody>
          </Table>
          <Box ref={loaderRef} h="20px" />
        </Box>
      </Box>
    );
  }
);

LectureTable.displayName = "LectureTable";

export default LectureTable;
