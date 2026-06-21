import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, SUPABASE_CONFIGURED } from '../lib/supabase';
import {
  averageCycleLength,
  getCycleStatus,
  getPredictions,
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
} from '../lib/cycle';

// App-wide cycle state.
//  - SHARED (Supabase `cycle_state`, one row): periodStarts, periodLength,
//    dayLogs, partnerEmail — synced across both phones.
//  - LOCAL (AsyncStorage): username + remindersEnabled (per-device), plus an
//    offline cache of everything for instant/offline load.

const CycleContext = createContext(null);
const STORAGE_KEY = 'nailong:state:v1';
const SHARED_ID = 'shared';

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
  // hydrated: local cache loaded (UI can render). canPush: remote pull attempted,
  // safe to start pushing shared changes to Supabase (avoids clobbering remote).
  const [hydrated, setHydrated] = useState(false);
  const canPush = useRef(false);

  // Apply the shared blob from Supabase onto local state.
  const applyShared = useCallback((d) => {
    if (!d) return;
    if (Array.isArray(d.periodStarts)) setPeriodStarts(d.periodStarts);
    if (typeof d.periodLength === 'number') setPeriodLength(d.periodLength);
    if (d.dayLogs && typeof d.dayLogs === 'object') setDayLogs(d.dayLogs);
    if (typeof d.partnerEmail === 'string') setPartnerEmail(d.partnerEmail);
  }, []);

  const pullShared = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) return;
    try {
      const { data } = await supabase.from('cycle_state').select('data').eq('id', SHARED_ID).maybeSingle();
      if (data?.data) applyShared(data.data);
    } catch (e) {
      // offline / table missing — keep local
    }
  }, [applyShared]);

  // Startup: load local cache fast (offline-friendly), then pull shared from cloud.
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
      }
      setHydrated(true); // show cached data immediately
      await pullShared(); // then sync from cloud (overrides shared fields)
      canPush.current = true; // now safe to push our changes
    })();
  }, [pullShared]);

  // Re-pull shared data when the app comes back to the foreground (so the other
  // phone's changes show up).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && canPush.current) pullShared();
    });
    return () => sub.remove();
  }, [pullShared]);

  // Local cache: save everything to AsyncStorage on change (offline + instant load).
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ periodStarts, periodLength, partnerEmail, dayLogs, username, remindersEnabled })
    ).catch(() => {});
  }, [hydrated, periodStarts, periodLength, partnerEmail, dayLogs, username, remindersEnabled]);

  // Cloud sync: push shared fields to Supabase on change (after the initial pull).
  useEffect(() => {
    if (!hydrated || !SUPABASE_CONFIGURED || !canPush.current) return;
    supabase
      .from('cycle_state')
      .upsert({ id: SHARED_ID, data: { periodStarts, periodLength, dayLogs, partnerEmail }, updated_at: new Date().toISOString() })
      .then(() => {}, () => {});
  }, [hydrated, periodStarts, periodLength, dayLogs, partnerEmail]);

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
