import { View, Text, ScrollView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../src/components/GlassCard';
import PhaseBackground from '../../src/components/PhaseBackground';
import { useCycle } from '../../src/store/CycleContext';
import { getFoodsForPhase } from '../../src/data/foods';
import { getPhaseTheme, PHASES } from '../../src/theme/phases';
import { daysBetween } from '../../src/lib/cycle';
import { ICON } from '../../src/data/icons';

// Static phase reference shown to everyone, with the active phase highlighted.
const PHASE_GUIDE = [
  { phase: 'menstrual', days: 'Days 1–5', note: 'Rest, warmth, comfort foods', icon: ICON.drop },
  { phase: 'follicular', days: 'Days 6–13', note: 'Energy rises, great for new plans', icon: ICON.plant },
  { phase: 'ovulation', days: 'Days 14–16', note: 'Peak energy and confidence', icon: ICON.star },
  { phase: 'luteal', days: 'Days 17–28', note: 'Wind down, self-care', icon: ICON.moon },
];

const SYMPTOM_COLOR = '#FF6B8A';
const MOOD_COLOR = '#B07FE8';

function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default function Insights() {
  const insets = useSafeAreaInsets();
  const { cycleLength, periodLength, periodStarts, status, predictions, dayLogs } = useCycle();
  const theme = getPhaseTheme(status.phase);
  const food = getFoodsForPhase(status.phase);

  const stats = [
    { label: 'Avg. cycle', value: `${cycleLength} days`, icon: ICON.cal, color: '#F5A623' },
    { label: 'Period length', value: `${periodLength} days`, icon: ICON.drop, color: '#FF6B8A' },
    { label: 'Periods logged', value: `${periodStarts.length}`, icon: ICON.folder, color: '#3ECFA0' },
    {
      label: 'Next period',
      value: predictions ? `${Math.max(0, predictions.daysUntilNextPeriod)} days` : '—',
      icon: ICON.flower,
      color: '#B07FE8',
    },
  ];

  // Cycle history: gaps between consecutive period starts (last 6).
  const cycles = [];
  for (let i = 1; i < periodStarts.length; i++) {
    cycles.push({ at: periodStarts[i], len: daysBetween(periodStarts[i - 1], periodStarts[i]) });
  }
  const recentCycles = cycles.slice(-6);
  const maxCycle = Math.max(...recentCycles.map((c) => c.len), 30);

  // Symptom + mood frequencies across all check-ins.
  const symptomCounts = {};
  const moodCounts = {};
  Object.values(dayLogs).forEach((log) => {
    (log.symptoms || []).forEach((s) => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
    if (log.mood) moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
  });
  const symptomList = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);
  const moodList = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
  const maxSymptom = Math.max(...symptomList.map((s) => s[1]), 1);
  const maxMood = Math.max(...moodList.map((m) => m[1]), 1);

  return (
    <PhaseBackground phase={status.phase}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90, paddingHorizontal: 20 }}
      >
        <Image source={require('../../assets/headers/h-insights.png')} style={{ width: 148, height: 40, marginBottom: 12 }} resizeMode="contain" />

        {/* Stat cards (2 per row) */}
        <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
          {stats.map((s) => (
            <View key={s.label} style={{ width: '50%', padding: 4 }}>
              <GlassCard className="p-4">
                <Image source={s.icon} style={{ width: 30, height: 30, marginBottom: 4 }} resizeMode="contain" />
                <Text className="text-[9px] font-bold tracking-wide text-ink/45">{s.label}</Text>
                <Text className="text-lg font-bold mt-1" style={{ color: s.color }}>
                  {s.value}
                </Text>
              </GlassCard>
            </View>
          ))}
        </View>

        {/* Cycle history chart */}
        <GlassCard className="p-4 mt-3 mb-3">
          <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-3">Cycle history</Text>
          {recentCycles.length === 0 ? (
            <Text className="text-ink/50 text-sm">Log at least two periods to see your cycle lengths.</Text>
          ) : (
            <>
              <View className="flex-row items-end justify-between" style={{ height: 110 }}>
                {recentCycles.map((c) => (
                  <View key={c.at} className="flex-1 items-center justify-end">
                    <Text className="text-[10px] font-bold text-ink/60 mb-1">{c.len}</Text>
                    <View
                      style={{
                        width: '55%',
                        height: Math.max(6, (c.len / maxCycle) * 80),
                        backgroundColor: theme.accent,
                        borderRadius: 6,
                      }}
                    />
                  </View>
                ))}
              </View>
              <View className="flex-row justify-between mt-1">
                {recentCycles.map((c) => (
                  <Text key={c.at} className="flex-1 text-center text-[9px] text-ink/40">
                    {shortDate(c.at)}
                  </Text>
                ))}
              </View>
              <Text className="text-ink/45 text-[11px] mt-2">Days from one period start to the next.</Text>
            </>
          )}
        </GlassCard>

        {/* Symptom patterns */}
        <GlassCard className="p-4 mb-3">
          <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-3">Symptom patterns</Text>
          {symptomList.length === 0 ? (
            <Text className="text-ink/50 text-sm">No symptoms logged yet. Add a check-in on the Log tab.</Text>
          ) : (
            symptomList.map(([name, count]) => (
              <View key={name} className="flex-row items-center mb-2">
                <Text className="text-ink/70 text-xs" style={{ width: 96 }}>
                  {name}
                </Text>
                <View className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}>
                  <View style={{ width: `${(count / maxSymptom) * 100}%`, height: '100%', backgroundColor: SYMPTOM_COLOR, borderRadius: 999 }} />
                </View>
                <Text className="text-ink/60 text-xs font-bold ml-2" style={{ width: 20, textAlign: 'right' }}>
                  {count}
                </Text>
              </View>
            ))
          )}
        </GlassCard>

        {/* Mood trends */}
        <GlassCard className="p-4 mb-3">
          <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-3">Mood trends</Text>
          {moodList.length === 0 ? (
            <Text className="text-ink/50 text-sm">No moods logged yet. Add a check-in on the Log tab.</Text>
          ) : (
            moodList.map(([name, count]) => (
              <View key={name} className="flex-row items-center mb-2">
                <Text className="text-ink/70 text-xs" style={{ width: 96 }}>
                  {name}
                </Text>
                <View className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.45)' }}>
                  <View style={{ width: `${(count / maxMood) * 100}%`, height: '100%', backgroundColor: MOOD_COLOR, borderRadius: 999 }} />
                </View>
                <Text className="text-ink/60 text-xs font-bold ml-2" style={{ width: 20, textAlign: 'right' }}>
                  {count}
                </Text>
              </View>
            ))
          )}
        </GlassCard>

        {/* Current phase food list */}
        <GlassCard className="p-4 mb-3">
          <Text className="text-[10px] font-bold tracking-wide mb-1" style={{ color: theme.accent }}>
            {food.title} — what to eat
          </Text>
          <Text className="text-ink/50 text-sm mb-2">{food.note}</Text>
          {food.foods.map((f, i) => (
            <View key={f.name} className={`py-2 ${i > 0 ? 'border-t border-white/50' : ''}`}>
              <Text className="text-ink font-semibold">{f.name}</Text>
              <Text className="text-ink/55 text-sm">{f.why}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Phase guide */}
        <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-2 px-1">Phase guide</Text>
        <View className="gap-2">
          {PHASE_GUIDE.map((g) => {
            const info = PHASES[g.phase];
            const isActive = g.phase === status.phase;
            return (
              <GlassCard
                key={g.phase}
                className="p-3 flex-row items-center"
                style={isActive ? { backgroundColor: info.accentSoft, borderColor: info.accent + '60' } : undefined}
              >
                <Image source={g.icon} style={{ width: 28, height: 28, marginRight: 12 }} resizeMode="contain" />
                <View className="flex-1">
                  <Text className="text-[10px] font-semibold text-ink/45">{g.days}</Text>
                  <Text className="text-ink font-bold">{info.label}</Text>
                  <Text className="text-ink/50 text-[11px]">{g.note}</Text>
                </View>
                {isActive && (
                  <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: info.accent }}>
                    <Text className="text-white text-[10px] font-bold">Now</Text>
                  </View>
                )}
              </GlassCard>
            );
          })}
        </View>
      </ScrollView>
    </PhaseBackground>
  );
}
