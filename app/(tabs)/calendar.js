import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../../src/components/GlassCard';
import PhaseBackground from '../../src/components/PhaseBackground';
import { useCycle } from '../../src/store/CycleContext';
import { daysBetween } from '../../src/lib/cycle';
import { getPhaseTheme } from '../../src/theme/phases';
import { ICON } from '../../src/data/icons';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Per-day-type swatch colors (translucent fill + readable text), from the design.
const TYPE_STYLE = {
  period: { bg: 'rgba(255,107,138,0.45)', color: '#C0004A' },
  fertile: { bg: 'rgba(245,200,66,0.40)', color: '#9A6800' },
  ovulation: { bg: 'rgba(62,207,160,0.45)', color: '#006644' },
  normal: { bg: 'transparent', color: 'rgba(74,74,74,0.5)' },
};

function fmt(d, opts = { weekday: 'short', month: 'long', day: 'numeric' }) {
  return d ? new Date(d).toLocaleDateString('en-PH', opts) : '—';
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Calendar() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { status, predictions, lastPeriodStart, periodLength } = useCycle();
  const theme = getPhaseTheme(status.phase);

  const today = new Date();
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const cycleLength = status.cycleLength;
  const ovulationDay = cycleLength - 14; // cycle-day index of ovulation

  // Classify any date by where it lands in a repeating cycle anchored on the
  // last logged period. Works forward and backward, so every month is correct.
  function classify(date) {
    if (!lastPeriodStart) return 'normal';
    const diff = daysBetween(lastPeriodStart, date);
    const cd = (((diff % cycleLength) + cycleLength) % cycleLength) + 1; // 1..cycleLength
    if (cd <= periodLength) return 'period';
    if (cd === ovulationDay) return 'ovulation';
    if (cd >= ovulationDay - 5 && cd <= ovulationDay + 1) return 'fertile';
    return 'normal';
  }

  // Build the grid cells for the viewed month, padded so day 1 lands on its weekday.
  const firstOfMonth = new Date(view.year, view.month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(view.year, view.month, day));
  }

  const monthLabel = firstOfMonth.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  const shiftMonth = (delta) => {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <PhaseBackground phase={status.phase}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90, paddingHorizontal: 20 }}
      >
        <Image source={require('../../assets/headers/h-cycle.png')} style={{ width: 164, height: 40, marginBottom: 12 }} resizeMode="contain" />

        {/* Countdown card */}
        {predictions ? (
          <GlassCard className="p-5 mb-3 flex-row items-center">
            <View>
              <Text className="text-5xl font-bold" style={{ color: theme.accent }}>
                {Math.max(0, predictions.daysUntilNextPeriod)}
              </Text>
              <Text className="text-ink/55 text-xs font-semibold mt-0.5">Days until period</Text>
            </View>
            <View className="flex-1 items-end">
              <Text className="text-[10px] font-bold tracking-wide text-ink/45">Expected</Text>
              <Text className="text-ink font-semibold mt-0.5">
                {fmt(predictions.nextPeriod, { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </GlassCard>
        ) : (
          <GlassCard className="p-5 mb-3">
            <Text className="text-ink/60 text-center">Log your period first to see predictions</Text>
          </GlassCard>
        )}

        {/* Legend */}
        <View className="flex-row gap-4 px-1 mb-3">
          {[
            { label: 'Period', t: 'period' },
            { label: 'Fertile', t: 'fertile' },
            { label: 'Ovulation', t: 'ovulation' },
          ].map((l) => (
            <View key={l.label} className="flex-row items-center">
              <View
                className="w-2.5 h-2.5 rounded-full mr-1.5"
                style={{ backgroundColor: TYPE_STYLE[l.t].bg, borderWidth: 1, borderColor: TYPE_STYLE[l.t].color + '40' }}
              />
              <Text className="text-ink/60 text-xs font-semibold">{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Month grid */}
        <GlassCard className="p-4 mb-3">
          {/* Month header with navigation */}
          <View className="flex-row items-center justify-between mb-3">
            <Pressable onPress={() => shiftMonth(-1)} hitSlop={10} className="active:opacity-60">
              <Ionicons name="chevron-back" size={20} color="#8A8A8A" />
            </Pressable>
            <Text className="text-ink font-bold">{monthLabel}</Text>
            <Pressable onPress={() => shiftMonth(1)} hitSlop={10} className="active:opacity-60">
              <Ionicons name="chevron-forward" size={20} color="#8A8A8A" />
            </Pressable>
          </View>

          {/* Weekday headers */}
          <View className="flex-row mb-1">
            {WEEKDAYS.map((d, i) => (
              <Text key={i} className="flex-1 text-center text-[10px] font-bold text-ink/40">
                {d}
              </Text>
            ))}
          </View>

          {/* Day cells, 7 per row */}
          <View className="flex-row flex-wrap">
            {cells.map((date, i) => {
              if (!date) return <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
              const type = classify(date);
              const s = TYPE_STYLE[type];
              const isToday = sameDay(date, today);
              return (
                <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1, padding: 2 }}>
                  <View
                    className="flex-1 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: s.bg,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: theme.accent,
                    }}
                  >
                    <Text className="text-xs font-bold" style={{ color: s.color }}>
                      {date.getDate()}
                    </Text>
                    {type === 'ovulation' && <Text style={{ fontSize: 8, position: 'absolute', top: 1, right: 3 }}>🌟</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Upcoming events */}
        {predictions && (
          <View className="gap-2">
            <EventRow icon={ICON.star} label="Ovulation" color="#3ECFA0" date={predictions.ovulation} />
            <EventRow icon={ICON.plant} label="Fertile window ends" color="#F5A623" date={predictions.fertileEnd} />
            <EventRow icon={ICON.drop} label="Next period" color="#FF6B8A" date={predictions.nextPeriod} />
          </View>
        )}
      </ScrollView>
    </PhaseBackground>
  );
}

function EventRow({ icon, label, color, date }) {
  return (
    <GlassCard className="p-3 flex-row items-center">
      <Image source={icon} style={{ width: 26, height: 26, marginRight: 10 }} resizeMode="contain" />
      <View className="flex-1">
        <Text className="text-[10px] font-bold tracking-wide" style={{ color }}>
          {label}
        </Text>
        <Text className="text-ink font-semibold">{fmt(date)}</Text>
      </View>
    </GlassCard>
  );
}
