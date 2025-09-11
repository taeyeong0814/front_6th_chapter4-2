import { ChakraProvider } from "@chakra-ui/react";
import { ScheduleProvider } from "./ScheduleContext.tsx";
import { ScheduleTables } from "./ScheduleTables.tsx";
import React from "react";

const App = React.memo(() => {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleTables />
      </ScheduleProvider>
    </ChakraProvider>
  );
});

App.displayName = "App";

export default App;
