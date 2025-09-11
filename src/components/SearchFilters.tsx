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

// 🔥 최적화: 개별 필드 컴포넌트들로 분리하여 독립적 리렌더링
const QueryFilter = React.memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => {
    const handleChange = useAutoCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      }
    );

    return (
      <FormControl>
        <FormLabel>검색어</FormLabel>
        <Input
          placeholder="과목명 또는 과목코드"
          value={value}
          onChange={handleChange}
        />
      </FormControl>
    );
  }
);

const CreditsFilter = React.memo(
  ({
    value,
    onChange,
  }: {
    value?: number;
    onChange: (value?: number) => void;
  }) => {
    const handleChange = useAutoCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value ? Number(e.target.value) : undefined);
      }
    );

    return (
      <FormControl>
        <FormLabel>학점</FormLabel>
        <Select placeholder="전체" value={value || ""} onChange={handleChange}>
          <option value="">전체</option>
          <option value={1}>1학점</option>
          <option value={2}>2학점</option>
          <option value={3}>3학점</option>
        </Select>
      </FormControl>
    );
  }
);

const GradesFilter = React.memo(
  ({
    value,
    onChange,
  }: {
    value: number[];
    onChange: (value: number[]) => void;
  }) => {
    const handleChange = useAutoCallback((values: (string | number)[]) => {
      onChange(values.map(Number));
    });

    return (
      <FormControl>
        <FormLabel>학년</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={value}
          onChange={handleChange}
        >
          <HStack spacing={4}>
            {[1, 2, 3, 4].map((grade) => (
              <Checkbox key={grade} size="sm" value={grade}>
                {grade}학년
              </Checkbox>
            ))}
          </HStack>
        </CheckboxGroup>
      </FormControl>
    );
  }
);

const DaysFilter = React.memo(
  ({
    value,
    onChange,
  }: {
    value: string[];
    onChange: (value: string[]) => void;
  }) => {
    const handleChange = useAutoCallback((values: (string | number)[]) => {
      onChange(values as string[]);
    });

    return (
      <FormControl>
        <FormLabel>요일</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={value}
          onChange={handleChange}
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
    );
  }
);

const TimesFilter = React.memo(
  ({
    value,
    onChange,
  }: {
    value: number[];
    onChange: (value: number[]) => void;
  }) => {
    const handleChange = useAutoCallback((values: (string | number)[]) => {
      onChange(values.map(Number));
    });

    const handleTimeRemove = useAutoCallback((time: number) => {
      onChange(value.filter((v) => v !== time));
    });

    return (
      <FormControl>
        <FormLabel>시간</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={value}
          onChange={handleChange}
        >
          <Wrap spacing={1} mb={2}>
            {value
              .sort((a, b) => a - b)
              .map((time) => (
                <Tag key={time} size="sm" variant="outline" colorScheme="blue">
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
    );
  }
);

const MajorsFilter = React.memo(
  ({
    value,
    allMajors,
    onChange,
  }: {
    value: string[];
    allMajors: string[];
    onChange: (value: string[]) => void;
  }) => {
    const handleChange = useAutoCallback((values: (string | number)[]) => {
      onChange(values as string[]);
    });

    const handleMajorRemove = useAutoCallback((major: string) => {
      onChange(value.filter((v) => v !== major));
    });

    return (
      <FormControl>
        <FormLabel>전공</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={value}
          onChange={handleChange}
        >
          <Wrap spacing={1} mb={2}>
            {value.map((major) => (
              <Tag key={major} size="sm" variant="outline" colorScheme="blue">
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
    );
  }
);

// 🔥 최적화: displayName 추가
QueryFilter.displayName = "QueryFilter";
CreditsFilter.displayName = "CreditsFilter";
GradesFilter.displayName = "GradesFilter";
DaysFilter.displayName = "DaysFilter";
TimesFilter.displayName = "TimesFilter";
MajorsFilter.displayName = "MajorsFilter";

const SearchFilters = React.memo(
  ({ searchOptions, allMajors, onChange }: Props) => {
    const handleQueryChange = useAutoCallback((value: string) => {
      onChange("query", value);
    });

    const handleCreditsChange = useAutoCallback((value?: number) => {
      onChange("credits", value);
    });

    const handleGradesChange = useAutoCallback((value: number[]) => {
      onChange("grades", value);
    });

    const handleDaysChange = useAutoCallback((value: string[]) => {
      onChange("days", value);
    });

    const handleTimesChange = useAutoCallback((value: number[]) => {
      onChange("times", value);
    });

    const handleMajorsChange = useAutoCallback((value: string[]) => {
      onChange("majors", value);
    });

    return (
      <>
        <HStack spacing={4}>
          <QueryFilter
            value={searchOptions.query || ""}
            onChange={handleQueryChange}
          />
          <CreditsFilter
            value={searchOptions.credits}
            onChange={handleCreditsChange}
          />
        </HStack>

        <HStack spacing={4}>
          <GradesFilter
            value={searchOptions.grades}
            onChange={handleGradesChange}
          />
          <DaysFilter value={searchOptions.days} onChange={handleDaysChange} />
        </HStack>

        <HStack spacing={4}>
          <TimesFilter
            value={searchOptions.times}
            onChange={handleTimesChange}
          />
          <MajorsFilter
            value={searchOptions.majors}
            allMajors={allMajors}
            onChange={handleMajorsChange}
          />
        </HStack>
      </>
    );
  }
);

// 🔥 최적화: displayName 추가
SearchFilters.displayName = "SearchFilters";

export default SearchFilters;
