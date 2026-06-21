import { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import NailongAvatar from '../src/components/NailongAvatar';
import GlassCard from '../src/components/GlassCard';
import PhaseBackground from '../src/components/PhaseBackground';
import { useCycle } from '../src/store/CycleContext';
import { personalize } from '../src/lib/voice';
import { chatWithNailong, API_CONFIGURED } from '../src/lib/api';

// Offline fallback until the Gemini backend URL is configured.
function placeholderReply() {
  const lines = [
    "I hear you, Mom... I'm not fully set up yet though. Soon!",
    "Hold on, Mom — Nailong still needs his personality installed (coming soon).",
    "I'm here, Mom, just not talking properly yet. The real me is coming.",
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function todayKey() {
  const x = new Date();
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export default function Chat() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { status, username, dayLogs } = useCycle();
  const listRef = useRef(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'hi', from: 'nailong', text: personalize("Hey Mom! Wo shi Nailong 💛 how's your cycle going today?", username) },
  ]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg = { id: `u${Date.now()}`, from: 'me', text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setSending(true);
    try {
      let replyText;
      if (API_CONFIGURED) {
        const log = dayLogs[todayKey()] || {};
        const context = {
          username,
          phase: status.phase,
          cycleDay: status.cycleDay,
          mood: log.mood,
          symptoms: log.symptoms,
        };
        const history = next.map((m) => ({ role: m.from === 'nailong' ? 'nailong' : 'user', text: m.text }));
        replyText = await chatWithNailong(history, context);
      } else {
        await new Promise((r) => setTimeout(r, 500));
        replyText = personalize(placeholderReply(), username);
      }
      setMessages((prev) => [...prev, { id: `n${Date.now()}`, from: 'nailong', text: replyText }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: `n${Date.now()}`, from: 'nailong', text: personalize("Sorry Mom, Nailong can't reach his brain right now 🥺 try again in a bit?", username) },
      ]);
    } finally {
      setSending(false);
      listRef.current?.scrollToEnd({ animated: true });
    }
  }

  return (
    <PhaseBackground phase={status.phase} style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white/25 border-b border-white/40">
        <NailongAvatar size="sm" />
        <View className="flex-1 ml-3">
          <Text className="text-ink text-lg font-displayBold">Nailong</Text>
          <Text className="text-ink/50 text-xs">{personalize('Always here for you, Mom 💕', username)}</Text>
        </View>
        <Pressable onPress={() => router.back()} className="p-2 active:opacity-60">
          <Ionicons name="close" size={26} color="#4A4A4A" />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 8}
      >
        <FlatList
          ref={listRef}
          data={sending ? [...messages, { id: 'typing', from: 'nailong', text: '…' }] : messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <Bubble item={item} />}
        />

        <View
          className="flex-row items-end px-3 pt-2 bg-white/25 border-t border-white/40"
          style={{ paddingBottom: insets.bottom + 8 }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Talk to Nailong..."
            placeholderTextColor="#B0B0B0"
            multiline
            className="flex-1 bg-white/60 border border-white/70 rounded-2xl px-4 py-3 text-ink max-h-28 mr-2"
          />
          <Pressable
            onPress={send}
            disabled={sending}
            className="w-11 h-11 rounded-full bg-nailong items-center justify-center active:opacity-80"
          >
            {sending ? <ActivityIndicator color="#4A4A4A" /> : <Ionicons name="arrow-up" size={22} color="#4A4A4A" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </PhaseBackground>
  );
}

function Bubble({ item }) {
  const mine = item.from === 'me';
  if (mine) {
    return (
      <View className="max-w-[80%] self-end">
        <View className="px-4 py-3 rounded-2xl bg-nailong/70 border border-white/60" style={{ borderBottomRightRadius: 4 }}>
          <Text className="text-ink">{item.text}</Text>
        </View>
      </View>
    );
  }
  return (
    <View className="max-w-[80%] self-start flex-row">
      <NailongAvatar size="xs" />
      <GlassCard className="px-4 py-3 ml-2" style={{ borderBottomLeftRadius: 4 }}>
        <Text className="text-ink">{item.text}</Text>
      </GlassCard>
    </View>
  );
}
