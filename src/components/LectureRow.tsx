import React from "react";
import { Tr, Td, Button } from "@chakra-ui/react";
import { Lecture } from "../types.ts";
import { useAutoCallback } from "../hooks/useAutoCallback.ts";

interface Props {
  lecture: Lecture;
  onAddSchedule: (lecture: Lecture) => void;
}

const LectureRow = React.memo(({ lecture, onAddSchedule }: Props) => {
  const handleAdd = useAutoCallback(() => {
    onAddSchedule(lecture);
  });

  return (
    <Tr>
      <Td width="100px">{lecture.id}</Td>
      <Td width="50px">{lecture.grade}</Td>
      <Td width="200px">{lecture.title}</Td>
      <Td width="50px">{lecture.credits}</Td>
      <Td width="150px" dangerouslySetInnerHTML={{ __html: lecture.major }} />
      <Td
        width="150px"
        dangerouslySetInnerHTML={{ __html: lecture.schedule }}
      />
      <Td width="80px">
        <Button size="sm" colorScheme="green" onClick={handleAdd}>
          추가
        </Button>
      </Td>
    </Tr>
  );
});

LectureRow.displayName = "LectureRow";

export default LectureRow;
