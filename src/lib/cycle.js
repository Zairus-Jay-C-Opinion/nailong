// Cycle math. Pure functions, no UI, no storage — easy to test and reuse.
//
// A "cycle" is measured from the first day of one period to the day before the
// next period starts. Day 1 = first day of bleeding.

export const DEFAULT_CYCLE_LENGTH = 28; // days, period start to next period start
export const DEFAULT_PERIOD_LENGTH = 5; // days of bleeding

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Whole days from `from` to `to` (ignores time-of-day). */
export function daysBetween(from, to) {
  const a = new Date(from).setHours(0, 0, 0, 0);
  const b = new Date(to).setHours(0, 0, 0, 0);
  return Math.round((b - a) / MS_PER_DAY);
}

/** Add `n` days to a date, returning a new Date. */
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/**
 * Average gap between consecutive period start dates.
 * Falls back to the default when there isn't enough history.
 * @param {Date[]|string[]} periodStarts - ascending list of period start dates
 */
export function averageCycleLength(periodStarts, fallback = DEFAULT_CYCLE_LENGTH) {
  if (!periodStarts || periodStarts.length < 2) return fallback;
  const sorted = [...periodStarts].sort((a, b) => new Date(a) - new Date(b));
  let total = 0;
  for (let i = 1; i < sorted.length; i++) {
    total += daysBetween(sorted[i - 1], sorted[i]);
  }
  return Math.round(total / (sorted.length - 1));
}

/**
 * Figure out where `today` sits in the cycle.
 * @returns {{ cycleDay: number, phase: string, cycleLength: number }}
 *   phase is one of: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
 */
export function getCycleStatus(lastPeriodStart, {
  today = new Date(),
  cycleLength = DEFAULT_CYCLE_LENGTH,
  periodLength = DEFAULT_PERIOD_LENGTH,
} = {}) {
  if (!lastPeriodStart) {
    return { cycleDay: null, phase: 'unknown', cycleLength };
  }

  // Day 1 is the period start itself, so +1.
  const cycleDay = daysBetween(lastPeriodStart, today) + 1;
  const ovulationDay = cycleLength - 14; // luteal phase is ~14 days

  let phase;
  if (cycleDay <= periodLength) {
    phase = 'menstrual';
  } else if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
    phase = 'ovulation';
  } else if (cycleDay < ovulationDay - 1) {
    phase = 'follicular';
  } else {
    phase = 'luteal';
  }

  return { cycleDay, phase, cycleLength };
}

/**
 * Key upcoming predictions based on the last period start.
 * @returns {{ nextPeriod: Date, ovulation: Date, fertileStart: Date, fertileEnd: Date, daysUntilNextPeriod: number }}
 */
export function getPredictions(lastPeriodStart, {
  today = new Date(),
  cycleLength = DEFAULT_CYCLE_LENGTH,
} = {}) {
  if (!lastPeriodStart) return null;

  const nextPeriod = addDays(lastPeriodStart, cycleLength);
  const ovulation = addDays(lastPeriodStart, cycleLength - 14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);

  return {
    nextPeriod,
    ovulation,
    fertileStart,
    fertileEnd,
    daysUntilNextPeriod: daysBetween(today, nextPeriod),
  };
}
