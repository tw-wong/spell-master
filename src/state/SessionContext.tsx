import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { currentWeekNumber, getWeek, getDictation, Week } from "@/data/words";
import { Status } from "@/lib/score";
import { DictationStatus, DictationDetail } from "@/lib/dictation";

type Session = {
  weekNumber: number;
  week: Week;
  setWeekNumber: (n: number) => void;
  statuses: Status[];
  setStatuses: React.Dispatch<React.SetStateAction<Status[]>>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  dictationIndex: number;
  setDictationIndex: React.Dispatch<React.SetStateAction<number>>;
  dictationStatuses: DictationStatus[];
  setDictationStatuses: React.Dispatch<React.SetStateAction<DictationStatus[]>>;
  dictationDetails: (DictationDetail | null)[];
  setDictationDetails: React.Dispatch<React.SetStateAction<(DictationDetail | null)[]>>;
  resetDictation: () => void;
};

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [weekNumber, setWeekNumberRaw] = useState(currentWeekNumber);
  const week = useMemo(() => getWeek(weekNumber), [weekNumber]);

  const [statuses, setStatuses] = useState<Status[]>(() => week.words.map(() => null));
  const [index, setIndex] = useState(0);

  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationStatuses, setDictationStatuses] = useState<DictationStatus[]>(
    () => getDictation(weekNumber).map(() => null),
  );
  const [dictationDetails, setDictationDetails] = useState<(DictationDetail | null)[]>(
    () => getDictation(weekNumber).map(() => null),
  );

  const resetDictation = useCallback(() => {
    const d = getDictation(weekNumber);
    setDictationStatuses(d.map(() => null));
    setDictationDetails(d.map(() => null));
    setDictationIndex(0);
  }, [weekNumber]);

  const setWeekNumber = useCallback((n: number) => {
    setWeekNumberRaw(n);
    setStatuses(getWeek(n).words.map(() => null));
    setIndex(0);
    const d = getDictation(n);
    setDictationStatuses(d.map(() => null));
    setDictationDetails(d.map(() => null));
    setDictationIndex(0);
  }, []);

  const value = useMemo(
    () => ({
      weekNumber, week, setWeekNumber,
      statuses, setStatuses, index, setIndex,
      dictationIndex, setDictationIndex,
      dictationStatuses, setDictationStatuses,
      dictationDetails, setDictationDetails,
      resetDictation,
    }),
    [weekNumber, week, setWeekNumber, statuses, index, dictationIndex, dictationStatuses, dictationDetails, resetDictation],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used within SessionProvider");
  return v;
}
