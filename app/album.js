import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, FlatList, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import PhaseBackground from '../src/components/PhaseBackground';
import { useCycle } from '../src/store/CycleContext';
import { supabase, SUPABASE_CONFIGURED, ALBUM_BUCKET } from '../src/lib/supabase';

const COLS = 2;
const PAD = 16;
const GAP = 12;
const TILE = (Dimensions.get('window').width - PAD * 2 - GAP) / COLS;

// Shared photo album: she uploads, both partners (using the app) see the same
// gallery. Stored in a Supabase Storage bucket.
export default function Album() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { status } = useCycle();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
          .filter((f) => f.name && !f.name.startsWith('.'))
          .map((f) => ({
            name: f.name,
            url: supabase.storage.from(ALBUM_BUCKET).getPublicUrl(f.name).data.publicUrl,
          }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function pickAndUpload() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Allow photos', 'Let Nailong access your photos to add to the album.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets[0];
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
          <Text className="text-ink/60 text-center">
            The album isn't connected yet. (Supabase project URL + key need to be added.)
          </Text>
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
          renderItem={({ item }) => (
            <Image source={{ uri: item.url }} style={{ width: TILE, height: TILE, borderRadius: 16, marginBottom: GAP }} />
          )}
        />
      )}

      {SUPABASE_CONFIGURED && (
        <Pressable
          onPress={pickAndUpload}
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
    </PhaseBackground>
  );
}
