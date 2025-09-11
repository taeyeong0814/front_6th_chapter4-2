# 🎯 드래그 & 드롭 최적화 노트

## 📋 중요한 발견사항

### ScheduleDndProvider의 렌더링 최적화 효과

**핵심 발견**: `<ScheduleDndProvider>`를 컴포넌트에 감싸는 것만으로도 드래그 시 다른 곳의 리렌더링이 일어나지 않는다.

### 현재 코드 구조 (ScheduleTables.tsx)

```jsx
<ScheduleTable
  key={`schedule-table-${index}`}
  schedules={schedules}
  tableId={tableId}
  onScheduleTimeClick={(timeInfo) => setSearchInfo({ tableId, ...timeInfo })}
  onDeleteButtonClick={({ day, time }) =>
    setSchedulesMap((prev) => ({
      ...prev,
      [tableId]: prev[tableId].filter(
        (schedule) => schedule.day !== day || !schedule.range.includes(time)
      ),
    }))
  }
/>
```

### 최적화 포인트

1. **ScheduleDndProvider 래핑 효과**

   - 드래그 시 다른 컴포넌트들의 불필요한 리렌더링 방지
   - DnD 컨텍스트를 통한 렌더링 최적화

2. **추가 최적화 가능한 부분**
   - `onScheduleTimeClick` 콜백 함수 최적화
   - `onDeleteButtonClick` 콜백 함수 최적화
   - `useAutoCallback` 적용

### 구현 방향

```jsx
// 최적화된 ScheduleTables 컴포넌트
const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState(null);

  // useAutoCallback으로 콜백 함수 최적화
  const handleScheduleTimeClick = useAutoCallback((tableId, timeInfo) => {
    setSearchInfo({ tableId, ...timeInfo });
  });

  const handleDeleteButtonClick = useAutoCallback((tableId, { day, time }) => {
    setSchedulesMap((prev) => ({
      ...prev,
      [tableId]: prev[tableId].filter(
        (schedule) => schedule.day !== day || !schedule.range.includes(time)
      ),
    }));
  });

  return (
    <ScheduleDndProvider>
      {/* 드래그 시 다른 컴포넌트 리렌더링 방지 효과 */}
      {Object.entries(schedulesMap).map(([tableId, schedules], index) => (
        <ScheduleTable
          key={`schedule-table-${index}`}
          schedules={schedules}
          tableId={tableId}
          onScheduleTimeClick={(timeInfo) =>
            handleScheduleTimeClick(tableId, timeInfo)
          }
          onDeleteButtonClick={({ day, time }) =>
            handleDeleteButtonClick(tableId, { day, time })
          }
        />
      ))}
    </ScheduleDndProvider>
  );
};
```

### 성능 개선 효과

1. **드래그 시**: 다른 컴포넌트 리렌더링 방지
2. **드롭 시**: 필요한 컴포넌트만 업데이트
3. **전체적인**: DnD 컨텍스트를 통한 효율적인 상태 관리

### 추가 고려사항

- `useAutoCallback`으로 콜백 함수 참조 안정화
- 불필요한 props 변경 방지
- 메모이제이션을 통한 추가 최적화 가능

---

## 🎯 심화과제 적용 방안

### 1단계: ScheduleDndProvider 래핑 확인

- 현재 구조에서 드래그 시 리렌더링 최적화 효과 확인

### 2단계: 콜백 함수 최적화

- `useAutoCallback` 적용
- 불필요한 함수 재생성 방지

### 3단계: 추가 메모이제이션

- `React.memo` 적용
- props 변경 시에만 리렌더링

이 정보를 바탕으로 드래그 & 드롭 최적화를 진행할 수 있습니다.
