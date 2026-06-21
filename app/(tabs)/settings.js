import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, Image, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import NailongAvatar from '../../src/components/NailongAvatar';
import { MASCOT } from '../../src/data/nailongImages';
import GlassCard from '../../src/components/GlassCard';
import PhaseBackground from '../../src/components/PhaseBackground';
import { useCycle } from '../../src/store/CycleContext';
import { getPhaseTheme } from '../../src/theme/phases';
import { personalize } from '../../src/lib/voice';
import { ensureNotificationPermission, scheduleReminders, cancelReminders } from '../../src/lib/notifications';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { partnerEmail, setPartnerEmail, periodLength, setPeriodLength, status, username, predictions, remindersEnabled, setRemindersEnabled, musicEnabled, setMusicEnabled } = useCycle();
  const [emailDraft, setEmailDraft] = useState(partnerEmail);
  const [saved, setSaved] = useState(false);
  const theme = getPhaseTheme(status.phase);

  function save() {
    setPartnerEmail(emailDraft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function toggleReminders(value) {
    if (value) {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        Alert.alert('Allow notifications', 'Enable notifications for Nailong in your phone settings to get reminders.');
        return;
      }
      await scheduleReminders({ predictions, username });
      setRemindersEnabled(true);
    } else {
      await cancelReminders();
      setRemindersEnabled(false);
    }
  }

  return (
    <PhaseBackground phase={status.phase}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120, paddingHorizontal: 20 }}
      >
        <View className="flex-row items-center mb-4">
          <NailongAvatar size="sm" source={MASCOT.settings} />
          <Image source={require('../../assets/headers/h-settings.png')} style={{ width: 128, height: 32, marginLeft: 12 }} resizeMode="contain" />
        </View>

        <GlassCard className="p-5 mb-3">
          {/* Partner email */}
          <Text className="text-[9px] font-bold tracking-wide text-ink/50 mb-2">Partner email</Text>
          <TextInput
            value={emailDraft}
            onChangeText={setEmailDraft}
            placeholder="partner@email.com"
            placeholderTextColor="#B0B0B0"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={save}
            className="bg-white/60 border border-white/70 rounded-2xl px-4 py-3 text-ink"
          />
          <Text className="text-ink/45 text-[11px] mt-1.5">They'll get gentle nudges from Nailong</Text>

          {/* Period length stepper */}
          <Text className="text-[9px] font-bold tracking-wide text-ink/50 mb-2 mt-5">
            Period length
          </Text>
          <View className="flex-row items-center">
            <StepBtn label="−" color="#FF6B8A" onPress={() => setPeriodLength(Math.max(2, periodLength - 1))} />
            <Text className="flex-1 text-center text-2xl font-bold text-ink">{periodLength} days</Text>
            <StepBtn label="+" color="#3ECFA0" onPress={() => setPeriodLength(Math.min(10, periodLength + 1))} />
          </View>
        </GlassCard>

        <Pressable onPress={save} className="active:opacity-90 mb-4">
          <View
            className="rounded-3xl py-4 items-center border"
            style={{
              backgroundColor: theme.accentSoft,
              borderColor: theme.accent + '70',
            }}
          >
            <Text className="text-ink font-bold text-base">{saved ? '✅ Saved!' : 'Save settings'}</Text>
          </View>
        </Pressable>

        <GlassCard className="p-5 mb-4 flex-row items-center">
          <View className="flex-1 mr-3">
            <Text className="text-ink font-semibold">Reminders</Text>
            <Text className="text-ink/50 text-[11px] mt-0.5">Period heads-ups + a daily check-in nudge from Nailong</Text>
          </View>
          <Switch
            value={remindersEnabled}
            onValueChange={toggleReminders}
            trackColor={{ false: '#E2D8C8', true: '#FF9BB0' }}
            thumbColor={remindersEnabled ? '#FF6B8A' : '#FFFDF5'}
          />
        </GlassCard>

        <GlassCard className="p-5 mb-4 flex-row items-center">
          <View className="flex-1 mr-3">
            <Text className="text-ink font-semibold">Background music</Text>
            <Text className="text-ink/50 text-[11px] mt-0.5">Play a soft tune while using the app</Text>
          </View>
          <Switch
            value={musicEnabled}
            onValueChange={setMusicEnabled}
            trackColor={{ false: '#E2D8C8', true: '#FF9BB0' }}
            thumbColor={musicEnabled ? '#FF6B8A' : '#FFFDF5'}
          />
        </GlassCard>

        <GlassCard className="p-6 items-center mb-4">
          <NailongAvatar size="md" source={MASCOT.watching} />
          <Text className="text-ink/50 text-xs text-center mt-2">{personalize('Nailong and Dad is always watching over you, Mom ❤️', username)}</Text>
        </GlassCard>

      </ScrollView>
      </KeyboardAvoidingView>
    </PhaseBackground>
  );
}

function StepBtn({ label, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="w-11 h-11 rounded-2xl bg-white/60 border border-white/70 items-center justify-center active:opacity-70"
    >
      <Text className="text-xl font-bold" style={{ color }}>
        {label}
      </Text>
    </Pressable>
  );
}
