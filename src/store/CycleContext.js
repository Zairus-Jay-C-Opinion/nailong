import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  averageCycleLength,
  getCycleStatus,
  getPredictions,
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
} from '../lib/cycle';

// App-wide cycle state, persisted to AsyncStorage so everything survives an app
// restart. Photos/reactions/comments live in Supabase; this handles the local
// cycle data, check-ins, settings, and username.

const CycleContext = createContext(null);
const STORAGE_KEY = 'nailong:state:v1';

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
  // Whether local reminder notifications are on.
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  // False until we've loaded saved data — prevents overwriting storage with
  // defaults and avoids flashing the username prompt before data loads.
  const [hydrated, setHydrated] = useState(false);

  // Load persisted state once on startup.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (Array.isArray(s.periodStarts)) setPeriodStarts(s.periodStarts);
          if (typeof s.periodLength === 'number') setPeriodLength(s.periodLength);
          if (typeof s.partnerEmail === 'string') setPartnerEmail(s.partnerEmail);
          if (s.dayLogs && typeof s.dayLogs === 'object') setDayLogs(s.dayLogs);
          if (typeof s.username === 'string') setUsername(s.username);
          if (typeof s.remindersEnabled === 'boolean') setRemindersEnabled(s.remindersEnabled);
        }
      } catch (e) {
        // ignore corrupt/missing storage
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // Save whenever persisted fields change (after initial load).
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ periodStarts, periodLength, partnerEmail, dayLogs, username, remindersEnabled })
    ).catch(() => {});
  }, [hydrated, periodStarts, periodLength, partnerEmail, dayLogs, username, remindersEnabled]);

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
      remindersEnabled,
      hydrated,
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
      setRemindersEnabled,
    };
  }, [periodStarts, periodLength, partnerEmail, dayLogs, username, remindersEnabled, hydrated]);

  return <CycleContext.Provider value={value}>{children}</CycleContext.Provider>;
}

export function useCycle() {
  const ctx = useContext(CycleContext);
  if (!ctx) throw new Error('useCycle must be used inside <CycleProvider>');
  return ctx;
}
