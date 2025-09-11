import { createContext } from "react";
import { Schedule } from "../types.ts";

export interface ScheduleContextType {
  schedulesMap: Record<string, Schedule[]>;
  setSchedulesMap: React.Dispatch<
    React.SetStateAction<Record<string, Schedule[]>>
  >;
  getSchedulesByTableId: (tableId: string) => Schedule[];
  addSchedule: (tableId: string, schedule: Schedule) => void;
  removeSchedule: (tableId: string, index: number) => void;
  updateSchedule: (tableId: string, index: number, schedule: Schedule) => void;
}

export const ScheduleContext = createContext<ScheduleContextType | undefined>(
  undefined
);
