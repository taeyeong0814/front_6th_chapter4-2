# 🚀 React 성능 최적화 프롬프트 가이드

## 📋 프로젝트 개요

이 프로젝트는 시간표 제작 서비스로, 다음과 같은 성능 이슈가 있습니다:

### 현재 성능 문제점

1. **API 호출 최적화**: Promise.all이 직렬 실행되고 중복 호출 발생
2. **검색 성능**: 매 렌더링마다 불필요한 필터링 연산 실행
3. **렌더링 최적화**: 드래그/드롭 시 전체 컴포넌트 리렌더링
4. **상태 관리**: 한 개 스케줄 변경 시 전체 상태 업데이트

### 최적화 목표

- API 호출 시간 20ms 이상 개선
- 드래그/드롭 시 30ms 이하 렌더링 시간
- 검색 시 불필요한 연산 최소화
- 인피니트 스크롤 시 추가 요소만 렌더링

---

## 🎯 1단계: SearchDialog API 호출 최적화

### 📝 프롬프트

````markdown
SearchDialog.tsx의 API 호출 부분을 최적화해주세요.

현재 문제점:

1. fetchAllLectures 함수에서 Promise.all이 직렬로 실행되고 있음
2. 같은 API를 여러 번 중복 호출하고 있음 (캐시 없음)

요구사항:

1. Promise.all이 진짜 병렬로 실행되도록 수정 (await 제거)
2. API 호출 결과를 캐시하여 중복 호출 방지 (클로저 활용)
3. useAutoCallback 훅을 활용하여 함수 최적화
4. API 호출 성능을 20ms 이상 개선

구현 예시:

```javascript
// 기존 (문제 있는) 코드
const fetchAllLectures = async () =>
  await Promise.all([
    (console.log("API Call 1", performance.now()), await fetchMajors()),
    (console.log("API Call 2", performance.now()), await fetchLiberalArts()),
    // ... 중복 호출
  ]);

// 개선된 코드 (캐시 + 병렬 실행)
const createApiCache = () => {
  const cache = new Map();
  return async (key, fetcher) => {
    if (cache.has(key)) return cache.get(key);
    const result = await fetcher();
    cache.set(key, result);
    return result;
  };
};
```
````

참고: 현재 6번의 API 호출이 직렬로 실행되고 있어 병렬화 필요 커밋

````

### 🔧 구현 포인트
- `await` 키워드 제거하여 진짜 병렬 실행
- 클로저를 활용한 API 캐시 구현
- `useAutoCallback`으로 함수 참조 안정화

---

## 🎯 2단계: SearchDialog 불필요한 연산 최적화

### 📝 프롬프트

```markdown
SearchDialog.tsx의 getFilteredLectures 함수와 관련 로직을 최적화해주세요.

현재 문제점:
1. 매 렌더링마다 getFilteredLectures가 실행됨
2. 인피니트 스크롤할 때마다 전체 검색 재실행
3. allMajors 배열이 매번 새로 계산됨

요구사항:
1. useMemo를 사용하여 검색 조건이 변경될 때만 필터링 재실행
2. 검색 조건이 동일하면 이전 결과 재사용
3. allMajors도 메모이제이션
4. useAutoCallback으로 이벤트 핸들러 최적화

구현 예시:
```javascript
// 기존 코드
const getFilteredLectures = () => {
  // 매번 실행되는 필터링 로직
};

const filteredLectures = getFilteredLectures();
const allMajors = [...new Set(lectures.map(lecture => lecture.major))];

// 개선된 코드
const filteredLectures = useMemo(() => {
  const { query = '', credits, grades, days, times, majors } = searchOptions;
  return lectures
    .filter(lecture =>
      lecture.title.toLowerCase().includes(query.toLowerCase()) ||
      lecture.id.toLowerCase().includes(query.toLowerCase())
    )
    // ... 필터링 로직
}, [lectures, searchOptions]);

const allMajors = useMemo(() =>
  [...new Set(lectures.map(lecture => lecture.major))],
  [lectures]
);
````

성능 목표: 검색 조건 변경 시에만 필터링 연산 실행

````

### 🔧 구현 포인트
- `useMemo` 의존성 배열 정확히 설정
- 검색 조건 객체의 깊은 비교 고려
- `useAutoCallback`으로 이벤트 핸들러 최적화

---

## 🎯 3단계: SearchDialog 컴포넌트 분리 및 렌더링 최적화

### 📝 프롬프트

```markdown
SearchDialog.tsx를 여러 개의 작은 컴포넌트로 분리하고 렌더링을 최적화해주세요.

분리할 컴포넌트:
1. SearchFilters (검색 조건 입력 폼)
2. LectureTable (강의 목록 테이블)
3. LectureRow (개별 강의 행)
4. MajorFilter (전공 필터)
5. TimeFilter (시간 필터)

최적화 요구사항:
1. React.memo로 각 컴포넌트 래핑
2. props 변경 시에만 리렌더링되도록 최적화
3. LectureRow는 개별적으로 메모이제이션
4. useAutoCallback으로 모든 이벤트 핸들러 최적화
5. 전공 목록과 강의 목록이 개별적으로 리렌더링되지 않도록 분리

구현 예시:
```javascript
// LectureRow 컴포넌트 분리
const LectureRow = React.memo(({ lecture, onAddSchedule }) => {
  const handleAdd = useAutoCallback(() => {
    onAddSchedule(lecture);
  });

  return (
    <Tr>
      <Td>{lecture.id}</Td>
      <Td>{lecture.grade}</Td>
      <Td>{lecture.title}</Td>
      <Td>{lecture.credits}</Td>
      <Td dangerouslySetInnerHTML={{ __html: lecture.major }} />
      <Td dangerouslySetInnerHTML={{ __html: lecture.schedule }} />
      <Td>
        <Button size="sm" colorScheme="green" onClick={handleAdd}>
          추가
        </Button>
      </Td>
    </Tr>
  );
});

// MajorFilter 컴포넌트 분리
const MajorFilter = React.memo(({ majors, selectedMajors, onChange }) => {
  const handleChange = useAutoCallback((values) => {
    onChange(values);
  });

  return (
    <FormControl>
      <FormLabel>전공</FormLabel>
      <CheckboxGroup value={selectedMajors} onChange={handleChange}>
        {/* 필터 UI */}
      </CheckboxGroup>
    </FormControl>
  );
});
````

성능 목표: 스크롤 시 추가되는 행만 렌더링, 기존 행은 리렌더링 방지

````

### 🔧 구현 포인트
- 컴포넌트 분리 시 props 인터페이스 명확히 정의
- `React.memo`의 비교 함수 필요 시 커스터마이징
- 이벤트 핸들러의 참조 안정성 확보

---

## 🎯 4단계: ScheduleContext 상태 관리 최적화

### 📝 프롬프트

```markdown
ScheduleContext.tsx의 상태 관리 구조를 최적화해주세요.

현재 문제점:
1. schedulesMap이 큰 덩어리로 관리되어 한 개 스케줄 변경 시 전체 리렌더링
2. 모든 컴포넌트가 schedulesMap 전체를 의존

요구사항:
1. 개별 테이블별로 상태를 분리하거나
2. selector 패턴을 도입하여 필요한 부분만 구독하도록 개선
3. useAutoCallback으로 setSchedulesMap 함수 최적화
4. 불필요한 리렌더링 방지를 위한 메모이제이션

구현 방향:
```javascript
// 방법 1: Selector 패턴 도입
interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;
  setSchedulesMap: React.Dispatch<React.SetStateAction<Record<string, Schedule[]>>>;
  getSchedulesByTableId: (tableId: string) => Schedule[];
  updateSchedule: (tableId: string, index: number, schedule: Schedule) => void;
}

// 방법 2: 개별 테이블 상태 분리
interface ScheduleContextType {
  schedules: Record<string, Schedule[]>;
  getSchedules: (tableId: string) => Schedule[];
  setSchedules: (tableId: string, schedules: Schedule[]) => void;
  addSchedule: (tableId: string, schedule: Schedule) => void;
  removeSchedule: (tableId: string, index: number) => void;
}
````

구조 개선 방향:

- 각 테이블의 스케줄을 개별적으로 관리
- 또는 useMemo를 활용한 selector 함수 제공
- 상태 업데이트 시 불변성 유지하면서 최소 변경

````

### 🔧 구현 포인트
- Context 분할 또는 Selector 패턴 선택
- 상태 업데이트 로직의 효율성 개선
- 메모이제이션을 통한 불필요한 리렌더링 방지

---

## 🎯 5단계: ScheduleTable 컴포넌트 최적화

### 📝 프롬프트

```markdown
ScheduleTable.tsx의 드래그/드롭 성능을 최적화해주세요.

현재 문제점:
1. 드래그 시 모든 요소가 리렌더링됨
2. DraggableSchedule 컴포넌트가 매번 새로 생성됨
3. getColor 함수가 매 렌더링마다 실행됨

요구사항:
1. DraggableSchedule을 React.memo로 래핑
2. getColor 함수를 useMemo로 메모이제이션
3. useAutoCallback으로 모든 이벤트 핸들러 최적화
4. 드래그 중인 요소만 리렌더링되도록 최적화
5. useDndContext를 활용하여 드래그 상태 최적화

구현 예시:
```javascript
// DraggableSchedule 최적화
const DraggableSchedule = React.memo(({ id, data, bg, onDeleteButtonClick }) => {
  const handleDelete = useAutoCallback(() => {
    onDeleteButtonClick();
  });

  // ... 컴포넌트 로직
});

// ScheduleTable 최적화
const ScheduleTable = ({ tableId, schedules, onScheduleTimeClick, onDeleteButtonClick }) => {
  const getColor = useMemo(() => {
    const lectures = [...new Set(schedules.map(({ lecture }) => lecture.id))];
    const colors = ["#fdd", "#ffd", "#dff", "#ddf", "#fdf", "#dfd"];
    return (lectureId: string) => colors[lectures.indexOf(lectureId) % colors.length];
  }, [schedules]);

  const handleScheduleTimeClick = useAutoCallback((timeInfo) => {
    onScheduleTimeClick?.(timeInfo);
  });

  const handleDeleteButtonClick = useAutoCallback((timeInfo) => {
    onDeleteButtonClick?.(timeInfo);
  });

  // ... 컴포넌트 로직
};
````

성능 목표: 드래그 시 드래그 중인 요소만 리렌더링

````

### 🔧 구현 포인트
- `React.memo`의 비교 함수 커스터마이징
- `useMemo`로 무거운 계산 메모이제이션
- 드래그 상태에 따른 조건부 렌더링

---

## 🎯 6단계: ScheduleDndProvider 드롭 최적화

### 📝 프롬프트

```markdown
ScheduleDndProvider.tsx의 드롭 시 렌더링을 최적화해주세요.

현재 문제점:
1. 드롭 시 schedulesMap 전체가 업데이트되어 모든 컴포넌트 리렌더링
2. handleDragEnd에서 전체 상태 복사 후 수정

요구사항:
1. useAutoCallback으로 handleDragEnd 함수 최적화
2. 상태 업데이트 로직을 더 효율적으로 개선
3. 불변성을 유지하면서 최소한의 상태만 업데이트
4. 드롭된 스케줄과 관련된 컴포넌트만 리렌더링되도록 최적화

구현 예시:
```javascript
// 기존 코드 (비효율적)
const handleDragEnd = (event) => {
  setSchedulesMap({
    ...schedulesMap,
    [tableId]: schedulesMap[tableId].map((targetSchedule, targetIndex) => {
      if (targetIndex !== Number(index)) {
        return { ...targetSchedule }
      }
      return {
        ...targetSchedule,
        day: DAY_LABELS[nowDayIndex + moveDayIndex],
        range: targetSchedule.range.map(time => time + moveTimeIndex),
      }
    })
  })
};

// 개선된 코드 (효율적)
const handleDragEnd = useAutoCallback((event) => {
  const { active, delta } = event;
  const { x, y } = delta;
  const [tableId, index] = active.id.split(':');

  setSchedulesMap(prev => ({
    ...prev,
    [tableId]: prev[tableId].map((schedule, idx) =>
      idx === Number(index)
        ? updateSchedulePosition(schedule, x, y)
        : schedule
    )
  }));
});
````

구현 방향:

- Immer 라이브러리 사용 고려
- 또는 상태 구조 개선으로 필요한 부분만 업데이트

````

### 🔧 구현 포인트
- 상태 업데이트 로직의 효율성 개선
- 불변성 유지하면서 최소 변경
- 드래그 이벤트 핸들러의 성능 최적화

---

## 🎯 7단계: 전체 컴포넌트 메모이제이션 및 최종 최적화

### 📝 프롬프트

```markdown
전체 애플리케이션의 메모이제이션을 완성하고 최종 성능 최적화를 진행해주세요.

최적화 대상:
1. ScheduleTables 컴포넌트 메모이제이션
2. App 컴포넌트의 Provider 구조 최적화
3. 모든 이벤트 핸들러에 useAutoCallback 적용
4. 불필요한 리렌더링 방지를 위한 전체적인 구조 점검

요구사항:
1. React DevTools Profiler로 성능 측정 가능하도록 준비
2. 모든 컴포넌트에 적절한 메모이제이션 적용
3. useAutoCallback 훅을 일관되게 사용
4. 성능 개선 효과를 측정할 수 있는 로깅 추가

구현 예시:
```javascript
// App 컴포넌트 최적화
const App = React.memo(() => {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleDndProvider>
          <ScheduleTables />
        </ScheduleDndProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
});

// ScheduleTables 컴포넌트 최적화
const ScheduleTables = React.memo(() => {
  const { schedulesMap } = useScheduleContext();

  const handleScheduleTimeClick = useAutoCallback((tableId, timeInfo) => {
    // 시간표 클릭 로직
  });

  const handleDeleteButtonClick = useAutoCallback((tableId, timeInfo) => {
    // 삭제 버튼 클릭 로직
  });

  return (
    <VStack spacing={4}>
      {Object.entries(schedulesMap).map(([tableId, schedules]) => (
        <ScheduleTable
          key={tableId}
          tableId={tableId}
          schedules={schedules}
          onScheduleTimeClick={(timeInfo) => handleScheduleTimeClick(tableId, timeInfo)}
          onDeleteButtonClick={(timeInfo) => handleDeleteButtonClick(tableId, timeInfo)}
        />
      ))}
    </VStack>
  );
});
````

최종 목표:

- 드래그/드롭 시 30ms 이하 렌더링 시간
- 검색 시 불필요한 연산 최소화
- 인피니트 스크롤 시 추가 요소만 렌더링

````

### 🔧 구현 포인트
- 전체 컴포넌트 트리의 메모이제이션 전략
- Provider 구조의 최적화
- 성능 측정 및 로깅 시스템 구축

---

## 🎯 8단계: 성능 테스트 및 배포 준비

### 📝 프롬프트

```markdown
성능 최적화 완료 후 테스트 및 배포를 준비해주세요.

테스트 항목:
1. React DevTools Profiler로 렌더링 시간 측정
2. 드래그/드롭 성능 테스트
3. 검색 및 인피니트 스크롤 성능 테스트
4. API 호출 최적화 효과 확인

배포 준비:
1. gh-pages를 이용한 배포 설정
2. 성능 개선 내용 문서화
3. Pull Request 템플릿에 체크리스트 완성

성능 측정 예시:
```javascript
// 성능 측정 유틸리티
const measurePerformance = (name, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} 실행 시간: ${end - start}ms`);
  return result;
};

// 사용 예시
const filteredLectures = measurePerformance('필터링', () => {
  return getFilteredLectures();
});
````

최종 확인사항:

- 모든 TODO 주석 제거
- 성능 개선 효과 정량화
- 코드 품질 및 가독성 확보
- React DevTools Profiler로 최적화 효과 확인

````

### 🔧 구현 포인트
- 성능 측정 도구 활용
- 배포 설정 및 문서화
- 최종 코드 품질 검토

---

## 🛠️ 추가 권장사항

### useAutoCallback 활용 전략
```javascript
// 모든 이벤트 핸들러에 적용
const handleClick = useAutoCallback(() => {
  // 클릭 로직
});

// 콜백 함수에 적용
const handleDataChange = useAutoCallback((newData) => {
  // 데이터 변경 로직
});
````

### 컴포넌트 분리 원칙

1. **단일 책임**: 각 컴포넌트는 하나의 역할만 담당
2. **재사용성**: 다른 곳에서도 사용 가능한 범용 컴포넌트
3. **테스트 가능성**: 독립적으로 테스트 가능한 구조
4. **성능**: 메모이제이션으로 최적화 가능한 크기

### 메모이제이션 전략

```javascript
// React.memo: 컴포넌트 레벨
const MyComponent = React.memo(({ data }) => {
  // 컴포넌트 로직
});

// useMemo: 값 레벨
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// useCallback: 함수 레벨
const handleClick = useCallback(() => {
  // 클릭 로직
}, [dependency]);
```

---

## 📊 성능 측정 가이드

### React DevTools Profiler 사용법

1. **Profiler 탭 열기**
2. **Start profiling** 클릭
3. **성능 테스트 실행** (드래그/드롭, 검색 등)
4. **Stop profiling** 클릭
5. **결과 분석**: 렌더링 시간, 컴포넌트별 성능 확인

### 측정 기준

- **드래그/드롭**: 30ms 이하
- **검색 필터링**: 10ms 이하
- **인피니트 스크롤**: 5ms 이하
- **API 호출**: 20ms 이상 개선

---

## 🎯 최종 체크리스트

### 기본 과제

- [ ] API 호출 최적화 (Promise.all 병렬화 + 캐시)
- [ ] SearchDialog 불필요한 연산 최적화
- [ ] SearchDialog 불필요한 리렌더링 최적화

### 심화 과제

- [ ] 시간표 블록 드래그시 렌더링 최적화
- [ ] 시간표 블록 드롭시 렌더링 최적화

### 추가 최적화

- [ ] 컴포넌트 분리 및 메모이제이션
- [ ] useAutoCallback 일관적 사용
- [ ] 성능 측정 및 문서화
- [ ] 배포 준비 완료

---

이 가이드를 따라 진행하시면 과제 요구사항을 모두 충족하면서 성능을 크게 개선할 수 있을 것입니다! 🚀
