import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Image, ActivityIndicator, Alert, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy'; // SDK 54 moved the classic API here
import { decode } from 'base64-arraybuffer';
import PhaseBackground from '../src/components/PhaseBackground';
import GlassCard from '../src/components/GlassCard';
import { useCycle } from '../src/store/CycleContext';
import { supabase, SUPABASE_CONFIGURED, ALBUM_BUCKET } from '../src/lib/supabase';

const COLS = 2;
const PAD = 16;
const GAP = 12;
const TILE = (Dimensions.get('window').width - PAD * 2 - GAP) / COLS;
const REACTIONS = ['❤️', '😆', '😮', '😢', '😡', '👍'];

// Shared photo album: she uploads, both partners see the same gallery. Tap a
// photo for reactions + comments; long-press for a quick reaction.
export default function Album() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { status, username } = useCycle();
  const author = username || 'Someone';

  const [items, setItems] = useState([]);
  const [reactionsByImage, setReactionsByImage] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pickerFor, setPickerFor] = useState(null); // image name being reacted to

  const load = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.storage
      .from(ALBUM_BUCKET)
      .list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
    if (!error && data) {
      setItems(
        data
          .filter((f) => f.name && /\.(jpe?g|png|gif|webp|heic)$/i.test(f.name))
          .map((f) => ({
            name: f.name,
            url: supabase.storage.from(ALBUM_BUCKET).getPublicUrl(f.name).data.publicUrl,
          }))
      );
    }
    const { data: rx } = await supabase.from('photo_reactions').select('*');
    const map = {};
    (rx || []).forEach((r) => {
      if (!map[r.image]) map[r.image] = [];
      map[r.image].push(r);
    });
    setReactionsByImage(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function reactToImage(image, emoji) {
    setPickerFor(null);
    if (!SUPABASE_CONFIGURED) return;
    const mine = (reactionsByImage[image] || []).find((r) => r.author === author)?.emoji;
    if (mine === emoji) {
      await supabase.from('photo_reactions').delete().eq('image', image).eq('author', author);
    } else {
      await supabase.from('photo_reactions').upsert({ image, author, emoji }, { onConflict: 'image,author' });
    }
    load();
  }

  function addPhoto() {
    Alert.alert('Add a photo', undefined, [
      { text: 'Take Photo', onPress: () => capture('camera') },
      { text: 'Choose from Library', onPress: () => capture('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function capture(source) {
    let res;
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Allow camera', 'Let Nailong use the camera to take a photo.');
        return;
      }
      res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Allow photos', 'Let Nailong access your photos to add to the album.');
        return;
      }
      res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    }
    if (res.canceled) return;
    await uploadAsset(res.assets[0]);
  }

  async function uploadAsset(asset) {
    try {
      setUploading(true);
      const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      const ext = (asset.uri.split('.').pop() || 'jpg').toLowerCase().split('?')[0];
      const path = `${Date.now()}.${ext}`;
      const contentType = asset.mimeType || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const { error } = await supabase.storage.from(ALBUM_BUCKET).upload(path, decode(base64), { contentType });
      if (error) throw error;
      await load();
    } catch (e) {
      Alert.alert('Upload failed', 'Could not upload that photo. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function summaryFor(name) {
    const list = reactionsByImage[name] || [];
    if (!list.length) return null;
    const unique = [...new Set(list.map((r) => r.emoji))].slice(0, 3);
    return { emojis: unique, count: list.length };
  }

  return (
    <PhaseBackground phase={status.phase} style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center px-4 py-3 bg-white/25 border-b border-white/40">
        <Text className="text-ink text-lg font-displayBold flex-1">Our Album</Text>
        <Pressable onPress={() => router.back()} className="p-2 active:opacity-60">
          <Ionicons name="close" size={26} color="#4A4A4A" />
        </Pressable>
      </View>

      {!SUPABASE_CONFIGURED ? (
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-ink/60 text-center">The album isn't connected yet.</Text>
        </View>
      ) : loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#FF6B8A" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.name}
          numColumns={COLS}
          contentContainerStyle={{ padding: PAD, paddingBottom: insets.bottom + 100 }}
          columnWrapperStyle={{ gap: GAP }}
          ListEmptyComponent={<Text className="text-ink/50 text-center mt-12">No photos yet. Tap + to add one 💛</Text>}
          renderItem={({ item }) => {
            const s = summaryFor(item.name);
            return (
              <Pressable
                onPress={() => router.push({ pathname: '/photo', params: { name: item.name, url: item.url } })}
                onLongPress={() => setPickerFor(item.name)}
                delayLongPress={250}
                style={{ marginBottom: GAP }}
                className="active:opacity-80"
              >
                <View style={{ width: TILE, height: TILE }}>
                  <Image source={{ uri: item.url }} style={{ width: TILE, height: TILE, borderRadius: 16 }} />
                  {s && (
                    <View
                      style={{ position: 'absolute', right: 6, bottom: 6 }}
                      className="flex-row items-center bg-white/90 rounded-full px-2 py-0.5 border border-white"
                    >
                      {s.emojis.map((e) => (
                        <Text key={e} style={{ fontSize: 12 }}>{e}</Text>
                      ))}
                      {s.count > 1 && <Text className="text-ink/70 text-[11px] font-bold ml-1">{s.count}</Text>}
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {SUPABASE_CONFIGURED && (
        <Pressable
          onPress={addPhoto}
          disabled={uploading}
          style={{ position: 'absolute', right: 20, bottom: insets.bottom + 24 }}
          className="active:opacity-85"
        >
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: '#FF6B8A', shadowColor: '#FF6B8A', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 8 }}
          >
            {uploading ? <ActivityIndicator color="#fff" /> : <Ionicons name="add" size={30} color="#fff" />}
          </View>
        </Pressable>
      )}

      {/* Long-press quick reaction picker */}
      <Modal visible={!!pickerFor} transparent animationType="fade" onRequestClose={() => setPickerFor(null)}>
        <Pressable className="flex-1 items-center justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onPress={() => setPickerFor(null)}>
          <Pressable onPress={() => {}}>
            <GlassCard intensity="heavy" className="flex-row px-2 py-2">
              {REACTIONS.map((e) => (
                <Pressable key={e} onPress={() => reactToImage(pickerFor, e)} className="px-2 active:opacity-60">
                  <Text style={{ fontSize: 34 }}>{e}</Text>
                </Pressable>
              ))}
            </GlassCard>
          </Pressable>
        </Pressable>
      </Modal>
    </PhaseBackground>
  );
}
