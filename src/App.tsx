import { ScheduleProvider } from "./ScheduleContext.tsx";
import { ScheduleTables } from "./ScheduleTables.tsx";
import ScheduleDndProvider from "./ScheduleDndProvider.tsx";

function App() {
  return (
    <ScheduleProvider>
      <ScheduleDndProvider>
        <ScheduleTables />
      </ScheduleDndProvider>
    </ScheduleProvider>
  );
}

export default App;
