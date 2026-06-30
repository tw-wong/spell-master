import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { currentWeekNumber, getWeek, Week } from "@/data/words";
import { Status } from "@/lib/score";

type Session = {
  weekNumber: number;
  week: Week;
  setWeekNumber: (n: number) => void;
  statuses: Status[];
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
};

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [weekNumber, setWeekNumberRaw] = useState(currentWeekNumber);
  const week = useMemo(() => getWeek(weekNumber), [weekNumber]);
  const [statuses, setStatuses] = useState<Status[]>(() => week.words.map(() => null));
  const [index, setIndex] = useState(0);

  const setWeekNumber = useCallback((n: number) => {
    setWeekNumberRaw(n);
    setStatuses(getWeek(n).words.map(() => null));
    setIndex(0);
  }, []);

  const value = useMemo(
    () => ({ weekNumber, week, setWeekNumber, statuses, setStatuses, index, setIndex }),
    [weekNumber, week, statuses, index, setWeekNumber],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used within SessionProvider");
  return v;
}
