import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, Image, Modal, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MASCOT } from '../../src/data/nailongImages';
import GlassCard from '../../src/components/GlassCard';
import PhaseBackground from '../../src/components/PhaseBackground';
import NailongAvatar from '../../src/components/NailongAvatar';
import { useCycle } from '../../src/store/CycleContext';
import { classifyFood, FOOD_REACTION } from '../../src/lib/foodReaction';
import { personalize } from '../../src/lib/voice';
import { ICON } from '../../src/data/icons';

function formatDate(d, opts = { weekday: 'long', month: 'long', day: 'numeric' }) {
  return new Date(d).toLocaleDateString('en-PH', opts);
}

function isSameDay(a, b) {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

// Local "YYYY-MM-DD" key (avoids the UTC shift that toISOString can cause).
function keyOf(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}
function keyToDate(key) {
  return formatDate(`${key}T00:00:00`);
}

const FLOWS = ['Light', 'Medium', 'Heavy'];
const SYMPTOMS = ['Cramps', 'Headache', 'Backache', 'Bloating', 'Fatigue', 'Nausea', 'Tender breasts', 'Acne'];
const MOODS = [
  { l: 'Good', icon: ICON.moodGood },
  { l: 'Meh', icon: ICON.moodMeh },
  { l: 'Low', icon: ICON.moodLow },
  { l: 'Irritable', icon: ICON.moodIrritable },
  { l: 'Anxious', icon: ICON.moodAnxious },
  { l: 'Tired', icon: ICON.moodTired },
];
const moodIcon = (label) => (MOODS.find((m) => m.l === label) || {}).icon;

function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full px-3 py-1.5 mr-2 mb-2 border active:opacity-80"
      style={{
        backgroundColor: selected ? 'rgba(255,107,138,0.28)' : 'rgba(255,255,255,0.5)',
        borderColor: selected ? '#FF6B8A' : 'rgba(255,255,255,0.7)',
      }}
    >
      <Text className="text-sm font-semibold" style={{ color: selected ? '#C0004A' : '#4A4A4A' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function Log() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { logPeriodStart, removePeriodStart, periodStarts, status, dayLogs, setDayLog, username } = useCycle();

  const today = new Date();
  const [tab, setTab] = useState('log'); // 'log' | 'history'
  const [selectedDate, setSelectedDate] = useState(today);
  const [showPicker, setShowPicker] = useState(false);
  const [justLogged, setJustLogged] = useState(false);

  // Today's check-in form (flow / symptoms / mood / note).
  const todayKey = keyOf(today);
  const existing = dayLogs[todayKey] || {};
  const [flow, setFlow] = useState(existing.flow || null);
  const [symptoms, setSymptoms] = useState(existing.symptoms || []);
  const [mood, setMood] = useState(existing.mood || null);
  const [note, setNote] = useState(existing.note || '');
  const [savedCheckin, setSavedCheckin] = useState(false);

  // Food check
  const [foodInput, setFoodInput] = useState('');
  const [foodReaction, setFoodReaction] = useState(null);
  const todayFoods = (dayLogs[todayKey] && dayLogs[todayKey].foods) || [];
  function logFood() {
    const name = foodInput.trim();
    if (!name) return;
    const verdict = classifyFood(name);
    setFoodReaction(FOOD_REACTION[verdict]);
    setDayLog(todayKey, { foods: [...todayFoods, { name, verdict }] });
    setFoodInput('');
  }

  const history = [...periodStarts].reverse();
  const recentStart = periodStarts.length > 0 ? periodStarts[periodStarts.length - 1] : null;
  const loggedToday = recentStart && isSameDay(recentStart, today);
  const periodActive = loggedToday || status.phase === 'menstrual';

  // Saved check-ins (most recent first), skipping empty ones.
  const checkins = Object.entries(dayLogs)
    .filter(([, v]) => v && (v.flow || (v.symptoms && v.symptoms.length) || v.mood || (v.note && v.note.trim()) || (v.foods && v.foods.length)))
    .sort((a, b) => b[0].localeCompare(a[0]));

  function logDate(date) {
    logPeriodStart(date);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2500);
  }
  function confirmDelete(date) {
    Alert.alert(
      'Delete this period start?',
      `Remove ${formatDate(date)}? This updates your predictions and syncs to both phones.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removePeriodStart(date) },
      ]
    );
  }
  function toggleSymptom(s) {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function saveCheckin() {
    setDayLog(todayKey, { flow, symptoms, mood, note });
    setSavedCheckin(true);
    setTimeout(() => setSavedCheckin(false), 2000);
  }
  function onPickerChange(event, date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && date) setSelectedDate(date);
    } else if (date) {
      setSelectedDate(date);
    }
  }

  const selectedIsToday = isSameDay(selectedDate, today);

  return (
    <PhaseBackground phase={status.phase}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120, paddingHorizontal: 20 }}
        >
          <Image source={require('../../assets/headers/h-log.png')} style={{ width: 167, height: 40, marginBottom: 12 }} resizeMode="contain" />

          {/* Segmented control */}
          <View className="flex-row bg-white/40 rounded-full p-1 mb-4 border border-white/60">
            {[
              { id: 'log', label: 'Log' },
              { id: 'history', label: 'History' },
            ].map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                className="flex-1 rounded-full py-2 items-center active:opacity-80"
                style={{ backgroundColor: tab === t.id ? '#FF6B8A' : 'transparent' }}
              >
                <Text className="font-bold" style={{ color: tab === t.id ? '#FFFFFF' : 'rgba(74,74,74,0.55)' }}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === 'log' ? (
            <>
              {/* Quick: log today */}
              <Pressable onPress={() => logDate(today)} disabled={periodActive} className="active:opacity-90 mb-3">
                <View
                  className="rounded-3xl py-8 items-center border"
                  style={{
                    backgroundColor: periodActive ? 'rgba(255,255,255,0.45)' : 'rgba(255,107,138,0.32)',
                    borderColor: periodActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,150,170,0.6)',
                    shadowColor: '#FF6B8A',
                    shadowOpacity: periodActive ? 0.05 : 0.3,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 8 },
                    elevation: 4,
                  }}
                >
                  <View className="mb-1.5">
                    <NailongAvatar size="md" phase="menstrual" source={periodActive ? MASCOT.logged : MASCOT.log} />
                  </View>
                  <Text className="text-base font-bold" style={{ color: periodActive ? 'rgba(74,74,74,0.5)' : '#4A4A4A' }}>
                    {loggedToday ? 'Logged for today!' : periodActive ? 'Period already logged' : 'Log today as my period start'}
                  </Text>
                </View>
              </Pressable>

              {/* Log a different (past) date */}
              <GlassCard className="p-4 mb-3">
                <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-2">Started on another day?</Text>
                <Text className="text-ink/55 text-sm mb-3">
                  Pick the day your last period began — even if it already passed — and Nailong predicts the next one.
                </Text>
                <Pressable
                  onPress={() => setShowPicker(true)}
                  className="flex-row items-center justify-between rounded-2xl bg-white/60 border border-white/70 px-4 py-3 mb-3 active:opacity-80"
                >
                  <Text className="text-ink font-semibold">{formatDate(selectedDate)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#FF6B8A" />
                </Pressable>
                <Pressable onPress={() => logDate(selectedDate)} className="active:opacity-85">
                  <View className="rounded-2xl py-3 items-center" style={{ backgroundColor: 'rgba(255,107,138,0.5)', borderWidth: 1, borderColor: 'rgba(255,150,170,0.6)' }}>
                    <Text className="text-ink font-bold">
                      {selectedIsToday ? 'Log today' : `Log ${formatDate(selectedDate, { month: 'short', day: 'numeric' })}`}
                    </Text>
                  </View>
                </Pressable>
              </GlassCard>

              {justLogged && (
                <GlassCard className="p-4 mb-3">
                  <Text className="text-center text-ink font-semibold">
                    Got it! I'll update your predictions. Take good care of yourself 💕
                  </Text>
                </GlassCard>
              )}

              {/* Daily check-in */}
              <GlassCard className="p-4 mb-3">
                <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-3">Today's check-in</Text>

                <Text className="text-ink font-semibold mb-2">Flow</Text>
                <View className="flex-row flex-wrap mb-3">
                  {FLOWS.map((f) => (
                    <Chip key={f} label={f} selected={flow === f} onPress={() => setFlow(flow === f ? null : f)} />
                  ))}
                </View>

                <Text className="text-ink font-semibold mb-2">Symptoms</Text>
                <View className="flex-row flex-wrap mb-3">
                  {SYMPTOMS.map((s) => (
                    <Chip key={s} label={s} selected={symptoms.includes(s)} onPress={() => toggleSymptom(s)} />
                  ))}
                </View>

                <Text className="text-ink font-semibold mb-2">Mood</Text>
                <View className="flex-row flex-wrap mb-3">
                  {MOODS.map((m) => {
                    const sel = mood === m.l;
                    return (
                      <Pressable
                        key={m.l}
                        onPress={() => setMood(sel ? null : m.l)}
                        className="rounded-full pl-2 pr-3.5 py-2 mr-2 mb-2 border flex-row items-center active:opacity-80"
                        style={{ backgroundColor: sel ? 'rgba(255,107,138,0.28)' : 'rgba(255,255,255,0.5)', borderColor: sel ? '#FF6B8A' : 'rgba(255,255,255,0.7)' }}
                      >
                        <Image source={m.icon} style={{ width: 18, height: 18, marginRight: 6 }} resizeMode="contain" />
                        <Text className="text-sm font-semibold" style={{ color: sel ? '#C0004A' : '#4A4A4A' }}>{m.l}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text className="text-ink font-semibold mb-2">Notes</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Anything you want to remember about today..."
                  placeholderTextColor="#B0B0B0"
                  multiline
                  className="bg-white/70 border border-white/80 rounded-2xl px-4 py-3 text-ink mb-3"
                  style={{ minHeight: 72, textAlignVertical: 'top' }}
                />

                <Pressable onPress={saveCheckin} className="active:opacity-85">
                  <View className="rounded-2xl py-3 items-center" style={{ backgroundColor: 'rgba(255,107,138,0.5)', borderWidth: 1, borderColor: 'rgba(255,150,170,0.6)' }}>
                    <Text className="text-ink font-bold">{savedCheckin ? 'Saved 💗' : 'Save check-in'}</Text>
                  </View>
                </Pressable>
              </GlassCard>

              {/* Food check — Nailong reacts to what you ate */}
              <GlassCard className="p-4 mb-3">
                <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-2">Food check</Text>
                <Text className="text-ink/55 text-sm mb-3">Tell Nailong what you ate and see what he thinks.</Text>
                <TextInput
                  value={foodInput}
                  onChangeText={setFoodInput}
                  placeholder="e.g. kangkong, fried chicken, soda"
                  placeholderTextColor="#B0B0B0"
                  returnKeyType="done"
                  onSubmitEditing={logFood}
                  className="bg-white/70 border border-white/80 rounded-2xl px-4 py-3 text-ink mb-3"
                />
                <Pressable onPress={logFood} className="active:opacity-85">
                  <View className="rounded-2xl py-3 items-center" style={{ backgroundColor: 'rgba(255,107,138,0.5)', borderWidth: 1, borderColor: 'rgba(255,150,170,0.6)' }}>
                    <Text className="text-ink font-bold">Check with Nailong</Text>
                  </View>
                </Pressable>

                {foodReaction && (
                  <View className="items-center mt-3">
                    <NailongAvatar size="md" source={MASCOT[foodReaction.mood]} />
                    <Text className="text-ink text-center text-sm mt-2">{personalize(foodReaction.message, username)}</Text>
                  </View>
                )}

                {todayFoods.length > 0 && (
                  <View className="mt-3">
                    <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-2">Today's meals</Text>
                    {todayFoods.map((f, i) => (
                      <View key={i} className="flex-row items-center justify-between py-1">
                        <Text className="text-ink/70 text-sm flex-1 mr-2">{f.name}</Text>
                        <Text
                          className="text-xs font-bold"
                          style={{ color: f.verdict === 'good' ? '#1A8F5B' : f.verdict === 'bad' ? '#C0004A' : '#9A6800' }}
                        >
                          {f.verdict === 'good' ? 'Healthy' : f.verdict === 'bad' ? 'Treat' : 'Okay'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </GlassCard>
            </>
          ) : (
            <>
              {/* Period starts */}
              <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-2 px-1">Period starts</Text>
              {history.length === 0 ? (
                <GlassCard className="p-6 mb-4">
                  <Text className="text-ink/50 text-center">No periods logged yet.</Text>
                </GlassCard>
              ) : (
                <View className="gap-2 mb-4">
                  {history.map((d, i) => (
                    <GlassCard key={d} className="p-3 flex-row items-center">
                      <Image source={ICON.drop} style={{ width: 26, height: 26, marginRight: 10 }} resizeMode="contain" />
                      <View className="flex-1">
                        <Text className="text-ink font-semibold">{formatDate(d)}</Text>
                        {i === 0 && <Text className="text-ink/45 text-[10px] font-semibold">Most recent</Text>}
                      </View>
                      <Pressable
                        onPress={() => confirmDelete(d)}
                        hitSlop={10}
                        className="p-2 rounded-full active:opacity-70"
                        accessibilityLabel={`Delete period start ${formatDate(d)}`}
                      >
                        <Ionicons name="trash-outline" size={20} color="#C0004A" />
                      </Pressable>
                    </GlassCard>
                  ))}
                </View>
              )}

              {/* Check-in history */}
              <Text className="text-[10px] font-bold tracking-wide text-ink/45 mb-2 px-1">Check-ins</Text>
              {checkins.length === 0 ? (
                <GlassCard className="p-6">
                  <Text className="text-ink/50 text-center">No check-ins yet. Save one from the Log tab!</Text>
                </GlassCard>
              ) : (
                <View className="gap-2">
                  {checkins.map(([k, v]) => (
                    <GlassCard key={k} className="p-3">
                      <Text className="text-ink font-semibold mb-1">{keyToDate(k)}</Text>
                      <View className="flex-row flex-wrap">
                        {v.flow && <Text className="text-ink/70 text-sm mr-3">Flow: {v.flow}</Text>}
                        {v.mood && (
                          <View className="flex-row items-center">
                            <Text className="text-ink/70 text-sm">Mood: </Text>
                            <Image source={moodIcon(v.mood)} style={{ width: 16, height: 16, marginRight: 4 }} resizeMode="contain" />
                            <Text className="text-ink/70 text-sm">{v.mood}</Text>
                          </View>
                        )}
                      </View>
                      {v.symptoms && v.symptoms.length > 0 && (
                        <Text className="text-ink/70 text-sm mt-0.5">Symptoms: {v.symptoms.join(', ')}</Text>
                      )}
                      {v.foods && v.foods.length > 0 && (
                        <Text className="text-ink/70 text-sm mt-0.5">Meals: {v.foods.map((f) => f.name).join(', ')}</Text>
                      )}
                      {v.note ? <Text className="text-ink/55 text-sm mt-1 italic">“{v.note}”</Text> : null}
                    </GlassCard>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Android: native dialog pops up imperatively. */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker value={selectedDate} mode="date" display="default" maximumDate={today} onChange={onPickerChange} />
      )}

      {/* iOS: calendar in a bottom-sheet popup. */}
      {Platform.OS === 'ios' && (
        <Modal visible={showPicker} transparent animationType="slide" onRequestClose={() => setShowPicker(false)}>
          <Pressable className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setShowPicker(false)}>
            <Pressable onPress={() => {}} style={{ backgroundColor: '#FFFDF5', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, paddingBottom: insets.bottom + 16 }}>
              <Text className="text-ink font-bold text-center mb-1">Pick your period start date</Text>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="inline"
                themeVariant="light"
                accentColor="#FF6B8A"
                maximumDate={today}
                onChange={onPickerChange}
                style={{ height: 360, alignSelf: 'stretch' }}
              />
              <Pressable onPress={() => setShowPicker(false)} className="rounded-2xl py-3 items-center mt-2" style={{ backgroundColor: 'rgba(255,107,138,0.5)' }}>
                <Text className="text-ink font-bold">Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </PhaseBackground>
  );
}
