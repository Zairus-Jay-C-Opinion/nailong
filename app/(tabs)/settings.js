import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import NailongAvatar from '../../src/components/NailongAvatar';
import { MASCOT } from '../../src/data/nailongImages';
import GlassCard from '../../src/components/GlassCard';
import PhaseBackground from '../../src/components/PhaseBackground';
import { useCycle } from '../../src/store/CycleContext';
import { getPhaseTheme } from '../../src/theme/phases';
import { personalize } from '../../src/lib/voice';

export default function Settings() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { partnerEmail, setPartnerEmail, periodLength, setPeriodLength, status, username } = useCycle();
  const [emailDraft, setEmailDraft] = useState(partnerEmail);
  const [saved, setSaved] = useState(false);
  const theme = getPhaseTheme(status.phase);

  function save() {
    setPartnerEmail(emailDraft.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PhaseBackground phase={status.phase}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90, paddingHorizontal: 20 }}
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

        <GlassCard className="p-6 items-center mb-4">
          <NailongAvatar size="md" source={MASCOT.watching} />
          <Text className="text-ink/50 text-xs text-center mt-2">{personalize('Nailong and Dad is always watching over you, Mom ❤️', username)}</Text>
        </GlassCard>

        <Text className="text-ink/40 text-xs px-1">
          🔜 Coming soon: notification reminders, cloud sync (Firebase), and Nailong theme options.
        </Text>
      </ScrollView>
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
