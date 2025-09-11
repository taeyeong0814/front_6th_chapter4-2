import React from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  CheckboxGroup,
  Checkbox,
  Wrap,
  Tag,
  TagCloseButton,
  TagLabel,
  Stack,
  Box,
} from "@chakra-ui/react";
import { useAutoCallback } from "../hooks/useAutoCallback.ts";
import { DAY_LABELS } from "../constants.ts";

interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

interface Props {
  searchOptions: SearchOption;
  allMajors: string[];
  onChange: (
    field: keyof SearchOption,
    value: SearchOption[typeof field]
  ) => void;
}

const TIME_SLOTS = [
  { id: 1, label: "09:00~09:30" },
  { id: 2, label: "09:30~10:00" },
  { id: 3, label: "10:00~10:30" },
  { id: 4, label: "10:30~11:00" },
  { id: 5, label: "11:00~11:30" },
  { id: 6, label: "11:30~12:00" },
  { id: 7, label: "12:00~12:30" },
  { id: 8, label: "12:30~13:00" },
  { id: 9, label: "13:00~13:30" },
  { id: 10, label: "13:30~14:00" },
  { id: 11, label: "14:00~14:30" },
  { id: 12, label: "14:30~15:00" },
  { id: 13, label: "15:00~15:30" },
  { id: 14, label: "15:30~16:00" },
  { id: 15, label: "16:00~16:30" },
  { id: 16, label: "16:30~17:00" },
  { id: 17, label: "17:00~17:30" },
  { id: 18, label: "17:30~18:00" },
  { id: 19, label: "18:00~18:50" },
  { id: 20, label: "18:55~19:45" },
  { id: 21, label: "19:50~20:40" },
  { id: 22, label: "20:45~21:35" },
  { id: 23, label: "21:40~22:30" },
  { id: 24, label: "22:35~23:25" },
];

const SearchFilters = React.memo(
  ({ searchOptions, allMajors, onChange }: Props) => {
    console.log("🎯 SearchFilters 렌더링됨:", performance.now());

    const handleQueryChange = useAutoCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange("query", e.target.value);
      }
    );

    const handleCreditsChange = useAutoCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(
          "credits",
          e.target.value ? Number(e.target.value) : undefined
        );
      }
    );

    const handleGradesChange = useAutoCallback(
      (values: (string | number)[]) => {
        onChange("grades", values.map(Number));
      }
    );

    const handleDaysChange = useAutoCallback((values: (string | number)[]) => {
      onChange("days", values as string[]);
    });

    const handleTimesChange = useAutoCallback((values: (string | number)[]) => {
      onChange("times", values.map(Number));
    });

    const handleMajorsChange = useAutoCallback(
      (values: (string | number)[]) => {
        onChange("majors", values as string[]);
      }
    );

    const handleTimeRemove = useAutoCallback((time: number) => {
      onChange(
        "times",
        searchOptions.times.filter((v) => v !== time)
      );
    });

    const handleMajorRemove = useAutoCallback((major: string) => {
      onChange(
        "majors",
        searchOptions.majors.filter((v) => v !== major)
      );
    });

    return (
      <>
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>검색어</FormLabel>
            <Input
              placeholder="과목명 또는 과목코드"
              value={searchOptions.query}
              onChange={handleQueryChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>학점</FormLabel>
            <Select
              value={searchOptions.credits}
              onChange={handleCreditsChange}
            >
              <option value="">전체</option>
              <option value="1">1학점</option>
              <option value="2">2학점</option>
              <option value="3">3학점</option>
            </Select>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl>
            <FormLabel>학년</FormLabel>
            <CheckboxGroup
              value={searchOptions.grades}
              onChange={handleGradesChange}
            >
              <HStack spacing={4}>
                {[1, 2, 3, 4].map((grade) => (
                  <Checkbox key={grade} value={grade}>
                    {grade}학년
                  </Checkbox>
                ))}
              </HStack>
            </CheckboxGroup>
          </FormControl>

          <FormControl>
            <FormLabel>요일</FormLabel>
            <CheckboxGroup
              value={searchOptions.days}
              onChange={handleDaysChange}
            >
              <HStack spacing={4}>
                {DAY_LABELS.map((day) => (
                  <Checkbox key={day} value={day}>
                    {day}
                  </Checkbox>
                ))}
              </HStack>
            </CheckboxGroup>
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl>
            <FormLabel>시간</FormLabel>
            <CheckboxGroup
              colorScheme="green"
              value={searchOptions.times}
              onChange={handleTimesChange}
            >
              <Wrap spacing={1} mb={2}>
                {searchOptions.times
                  .sort((a, b) => a - b)
                  .map((time) => (
                    <Tag
                      key={time}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                    >
                      <TagLabel>{time}교시</TagLabel>
                      <TagCloseButton onClick={() => handleTimeRemove(time)} />
                    </Tag>
                  ))}
              </Wrap>
              <Stack
                spacing={2}
                overflowY="auto"
                h="100px"
                border="1px solid"
                borderColor="gray.200"
                borderRadius={5}
                p={2}
              >
                {TIME_SLOTS.map(({ id, label }) => (
                  <Box key={id}>
                    <Checkbox key={id} size="sm" value={id}>
                      {id}교시({label})
                    </Checkbox>
                  </Box>
                ))}
              </Stack>
            </CheckboxGroup>
          </FormControl>

          <FormControl>
            <FormLabel>전공</FormLabel>
            <CheckboxGroup
              colorScheme="green"
              value={searchOptions.majors}
              onChange={handleMajorsChange}
            >
              <Wrap spacing={1} mb={2}>
                {searchOptions.majors.map((major) => (
                  <Tag
                    key={major}
                    size="sm"
                    variant="outline"
                    colorScheme="blue"
                  >
                    <TagLabel>{major.split("<p>").pop()}</TagLabel>
                    <TagCloseButton onClick={() => handleMajorRemove(major)} />
                  </Tag>
                ))}
              </Wrap>
              <Stack
                spacing={2}
                overflowY="auto"
                h="100px"
                border="1px solid"
                borderColor="gray.200"
                borderRadius={5}
                p={2}
              >
                {allMajors.map((major) => (
                  <Box key={major}>
                    <Checkbox key={major} size="sm" value={major}>
                      {major.replace(/<p>/gi, " ")}
                    </Checkbox>
                  </Box>
                ))}
              </Stack>
            </CheckboxGroup>
          </FormControl>
        </HStack>
      </>
    );
  }
);

SearchFilters.displayName = "SearchFilters";

export default SearchFilters;
