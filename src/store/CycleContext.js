import { createContext, useContext, useMemo, useState } from 'react';
import {
  averageCycleLength,
  getCycleStatus,
  getPredictions,
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
} from '../lib/cycle';

// App-wide cycle state. For now this lives in memory only; the next iteration
// swaps the internals for AsyncStorage (offline) + Firestore (sync) without
// changing this public API, so screens won't need to change.

const CycleContext = createContext(null);

export function CycleProvider({ children }) {
  // Ascending list of period start dates (ISO strings). Empty = not logged yet.
  const [periodStarts, setPeriodStarts] = useState([]);
  const [periodLength, setPeriodLength] = useState(DEFAULT_PERIOD_LENGTH);
  // Where the "I'm hungry" / "I'm sorry" buttons send to. Set in Settings.
  const [partnerEmail, setPartnerEmail] = useState('');
  // Daily check-ins keyed by local date "YYYY-MM-DD":
  //   { flow, symptoms: string[], mood, note, foods: [{name, verdict}] }
  const [dayLogs, setDayLogs] = useState({});
  // What Nailong calls her — shown as "Mommy <username>". Empty = ask on launch.
  const [username, setUsername] = useState('');

  const value = useMemo(() => {
    const sorted = [...periodStarts].sort((a, b) => new Date(a) - new Date(b));
    const lastPeriodStart = sorted[sorted.length - 1] || null;
    const cycleLength = averageCycleLength(sorted, DEFAULT_CYCLE_LENGTH);

    const status = getCycleStatus(lastPeriodStart, { cycleLength, periodLength });
    const predictions = getPredictions(lastPeriodStart, { cycleLength });

    return {
      // state
      periodStarts: sorted,
      lastPeriodStart,
      cycleLength,
      periodLength,
      partnerEmail,
      dayLogs,
      username,
      // derived
      status,
      predictions,
      // actions
      logPeriodStart(date = new Date()) {
        const iso = new Date(date).toISOString();
        setPeriodStarts((prev) => {
          // Avoid duplicate same-day entries.
          const day = iso.slice(0, 10);
          if (prev.some((d) => d.slice(0, 10) === day)) return prev;
          return [...prev, iso];
        });
      },
      // Merge a daily check-in for a local date key ("YYYY-MM-DD").
      setDayLog(dateKey, partial) {
        setDayLogs((prev) => ({ ...prev, [dateKey]: { ...prev[dateKey], ...partial } }));
      },
      setPeriodLength,
      setPartnerEmail,
      setUsername,
    };
  }, [periodStarts, periodLength, partnerEmail, dayLogs, username]);

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycle() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used inside <CycleProvider>');
  return ctx;
}
