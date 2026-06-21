import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Image, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PhaseBackground from '../src/components/PhaseBackground';
import GlassCard from '../src/components/GlassCard';
import { useCycle } from '../src/store/CycleContext';
import { supabase, SUPABASE_CONFIGURED } from '../src/lib/supabase';

// Messenger-style reaction set.
const REACTIONS = ['❤️', '😆', '😮', '😢', '😡', '👍'];

export default function Photo() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { name, url } = useLocalSearchParams();
  const { status, username } = useCycle();
  const author = username || 'Someone';

  const [reactions, setReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!SUPABASE_CONFIGURED || !name) {
      setLoading(false);
      return;
    }
    const [r, c] = await Promise.all([
      supabase.from('photo_reactions').select('*').eq('image', name),
      supabase.from('photo_comments').select('*').eq('image', name).order('created_at', { ascending: true }),
    ]);
    setReactions(r.data || []);
    setComments(c.data || []);
    setLoading(false);
  }, [name]);

  useEffect(() => {
    load();
  }, [load]);

  const myReaction = reactions.find((x) => x.author === author)?.emoji || null;
  const summary = REACTIONS.map((e) => ({ e, n: reactions.filter((r) => r.emoji === e).length })).filter((s) => s.n > 0);

  async function react(emoji) {
    if (!SUPABASE_CONFIGURED) return;
    // optimistic
    setReactions((prev) => {
      const others = prev.filter((r) => r.author !== author);
      return myReaction === emoji ? others : [...others, { image: name, author, emoji }];
    });
    if (myReaction === emoji) {
      await supabase.from('photo_reactions').delete().eq('image', name).eq('author', author);
    } else {
      await supabase.from('photo_reactions').upsert({ image: name, author, emoji }, { onConflict: 'image,author' });
    }
    load();
  }

  async function addComment() {
    const t = text.trim();
    if (!t || !SUPABASE_CONFIGURED) return;
    setText('');
    await supabase.from('photo_comments').insert({ image: name, author, text: t });
    load();
  }

  const W = Dimensions.get('window').width;

  return (
    <PhaseBackground phase={status.phase} style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3 bg-white/25 border-b border-white/40">
        <Text className="text-ink text-lg font-displayBold flex-1">Photo</Text>
        <Pressable onPress={() => router.back()} className="p-2 active:opacity-60">
          <Ionicons name="close" size={26} color="#4A4A4A" />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top + 8}>
        <FlatList
          data={comments}
          keyExtractor={(c) => c.id || `${c.author}${c.created_at}`}
          contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
          ListHeaderComponent={
            <View>
              <View style={{ width: W, height: W }}>
                <Image source={{ uri: url }} style={{ width: W, height: W }} resizeMode="cover" />
                {summary.length > 0 && (
                  <View
                    style={{ position: 'absolute', right: 10, bottom: 10 }}
                    className="flex-row items-center bg-white/90 rounded-full px-2.5 py-1 border border-white"
                  >
                    {summary.map((s) => (
                      <Text key={s.e} style={{ fontSize: 14 }}>{s.e}</Text>
                    ))}
                    <Text className="text-ink/70 text-xs font-bold ml-1">{reactions.length}</Text>
                  </View>
                )}
              </View>

              {/* Reaction bar */}
              <View className="flex-row justify-around px-3 py-3 bg-white/25 border-b border-white/40">
                {REACTIONS.map((e) => (
                  <Pressable key={e} onPress={() => react(e)} className="active:opacity-60">
                    <Text style={{ fontSize: 28, opacity: myReaction === e ? 1 : 0.45, transform: [{ scale: myReaction === e ? 1.15 : 1 }] }}>{e}</Text>
                  </Pressable>
                ))}
              </View>

              {summary.length > 0 && (
                <Text className="text-ink/70 text-sm px-4 py-2">
                  {summary.map((s) => `${s.e} ${s.n}`).join('   ')}
                </Text>
              )}

              <Text className="text-[10px] font-bold tracking-wide text-ink/45 px-4 pt-2 pb-1">Comments</Text>
              {loading && <ActivityIndicator color="#FF6B8A" style={{ marginVertical: 16 }} />}
            </View>
          }
          renderItem={({ item }) => (
            <GlassCard className="p-3 mx-4 mb-2">
              <Text className="text-ink font-semibold text-sm">{item.author}</Text>
              <Text className="text-ink/80">{item.text}</Text>
            </GlassCard>
          )}
          ListEmptyComponent={!loading && <Text className="text-ink/50 text-center mt-4 px-4">No comments yet. Be the first 💬</Text>}
        />

        <View className="flex-row items-end px-3 pt-2 bg-white/25 border-t border-white/40" style={{ paddingBottom: insets.bottom + 8 }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add a comment..."
            placeholderTextColor="#B0B0B0"
            multiline
            className="flex-1 bg-white/60 border border-white/70 rounded-2xl px-4 py-3 text-ink max-h-28 mr-2"
          />
          <Pressable onPress={addComment} className="w-11 h-11 rounded-full bg-nailong items-center justify-center active:opacity-80">
            <Ionicons name="arrow-up" size={22} color="#4A4A4A" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </PhaseBackground>
  );
}
