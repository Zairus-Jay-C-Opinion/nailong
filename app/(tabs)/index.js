import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import NailongAvatar from '../../src/components/NailongAvatar';
import { MASCOT } from '../../src/data/nailongImages';
import GlassCard from '../../src/components/GlassCard';
import PhaseBackground from '../../src/components/PhaseBackground';
import PhaseRing from '../../src/components/PhaseRing';
import { useCycle } from '../../src/store/CycleContext';
import { getNailongMessage } from '../../src/data/nailongMessages';
import { getFoodsForPhase } from '../../src/data/foods';
import { sendQuickMessage } from '../../src/lib/quickMessage';
import { getPhaseTheme } from '../../src/theme/phases';
import { personalize } from '../../src/lib/voice';

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { status, predictions, partnerEmail, username } = useCycle();
  const [sending, setSending] = useState(null);

  const phase = status.phase;
  const theme = getPhaseTheme(phase);
  const message = personalize(getNailongMessage(phase), username);
  const food = getFoodsForPhase(phase);
  const topFood = food.foods[0];

  async function handleQuick(type) {
    setSending(type);
    try {
      await sendQuickMessage(type, partnerEmail);
      Alert.alert('Sent 💌', type === 'hungry' ? "Told bb you're hungry 🍜" : 'Your sorry was sent 🤍');
    } catch (e) {
      if (e.code === 'NO_PARTNER_EMAIL') {
        Alert.alert('Set partner email', 'Go to Settings and add your partner\'s email to use this.');
      } else {
        Alert.alert('Not sent', 'Something went wrong. Try again later.');
      }
    } finally {
      setSending(null);
    }
  }

  return (
    <PhaseBackground phase={phase}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 90, paddingHorizontal: 20 }}
      >
        {/* App logo */}
        <Image
          source={require('../../assets/nailong-logo.png')}
          style={{ width: 168, height: 33, marginBottom: 16 }}
          resizeMode="contain"
        />

        {/* Greeting + Nailong */}
        <GlassCard className="p-4 mb-3 flex-row items-center">
          <NailongAvatar size="md" />
          <View className="flex-1 ml-4">
            {/* Phase pill */}
            <View
              className="self-start flex-row items-center rounded-full px-3 py-1 mb-1.5"
              style={{ backgroundColor: theme.accentSoft, borderWidth: 1, borderColor: theme.accent + '55' }}
            >
              <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: theme.dot }} />
              <Text className="text-[10px] font-bold tracking-wide" style={{ color: theme.accent }}>
                {theme.label}
              </Text>
            </View>
            <Text className="text-ink text-sm leading-5">{message}</Text>
          </View>
        </GlassCard>

        {/* Cycle ring + stats */}
        <GlassCard className="p-4 mb-3 flex-row items-center">
          {status.cycleDay ? (
            <>
              <PhaseRing cycleDay={status.cycleDay} cycleLength={status.cycleLength} phase={phase} size={130} />
              <View className="flex-1 ml-4">
                <Stat label="Cycle day" value={`${status.cycleDay} / ${status.cycleLength}`} />
                <Stat label="Phase" value={theme.label} />
                <Stat
                  label="Next period"
                  value={
                    predictions && predictions.daysUntilNextPeriod > 0
                      ? `${predictions.daysUntilNextPeriod} days`
                      : 'Soon'
                  }
                />
              </View>
            </>
          ) : (
            <View className="flex-1 items-center py-4">
              <Text className="text-ink/60 text-center mb-3">
                Log your first period so Nailong can track your cycle
              </Text>
              <Pressable
                onPress={() => router.push('/log')}
                className="rounded-full px-5 py-3 active:opacity-80"
                style={{ backgroundColor: theme.accent }}
              >
                <Text className="text-white font-semibold">Log your first period</Text>
              </Pressable>
            </View>
          )}
        </GlassCard>

        {/* Quick message buttons */}
        <View className="flex-row gap-3 mb-3">
          <QuickButton
            image={MASCOT.hungry}
            label="I'm hungry"
            loading={sending === 'hungry'}
            disabled={sending !== null}
            onPress={() => handleQuick('hungry')}
          />
          <QuickButton
            image={MASCOT.sorry}
            label="I'm sorry"
            loading={sending === 'sorry'}
            disabled={sending !== null}
            onPress={() => handleQuick('sorry')}
          />
        </View>

        {/* Food tip */}
        <GlassCard className="p-4 mb-3 flex-row items-center">
          <View style={{ width: 52, alignItems: 'center' }}>
            <Text style={{ fontSize: 40 }}>🥗</Text>
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-[10px] font-bold tracking-wide mb-1" style={{ color: theme.accent }}>
              Eat today
            </Text>
            <Text className="text-ink font-semibold">{topFood.name}</Text>
            <Text className="text-ink/60 text-sm mt-0.5">{topFood.why}</Text>
          </View>
        </GlassCard>

        {/* Chat with Nailong */}
        <Pressable onPress={() => router.push('/chat')} className="active:opacity-80">
          <GlassCard intensity="heavy" className="p-4 flex-row items-center">
            <NailongAvatar size="sm" source={MASCOT.chat} />
            <View className="flex-1 ml-3">
              <Text className="text-ink font-semibold">Talk to Nailong</Text>
              <Text className="text-ink/50 text-sm">{personalize('Anything on your mind, Mom? Nailong is here', username)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8A8A8A" />
          </GlassCard>
        </Pressable>
      </ScrollView>
    </PhaseBackground>
  );
}

// Small label/value pair used in the ring card.
function Stat({ label, value }) {
  return (
    <View className="mb-2">
      <Text className="text-[9px] font-bold tracking-wide text-ink/45">{label}</Text>
      <Text className="text-ink text-sm font-semibold">{value}</Text>
    </View>
  );
}

// Glass quick-message button with a loading state.
function QuickButton({ image, label, loading, disabled, onPress }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} className="flex-1 active:opacity-80">
      <GlassCard className="py-4 items-center">
        {loading ? (
          <ActivityIndicator color="#4A4A4A" />
        ) : (
          <>
            <Image source={image} style={{ width: 44, height: 44, borderRadius: 12 }} resizeMode="contain" />
            <Text className="text-ink font-semibold mt-1">{label}</Text>
          </>
        )}
      </GlassCard>
    </Pressable>
  );
}
