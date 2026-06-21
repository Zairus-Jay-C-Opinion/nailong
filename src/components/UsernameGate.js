import { useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useCycle } from '../store/CycleContext';
import NailongAvatar from './NailongAvatar';
import { MASCOT } from '../data/nailongImages';

// Shown on first open (until a username is set). Asks what Nailong should call
// her; from then on Nailong addresses her as "Mommy <username>".
export default function UsernameGate() {
  const { username, setUsername } = useCycle();
  const [name, setName] = useState('');
  if (username) return null;

  const submit = () => {
    const t = name.trim();
    if (t) setUsername(t);
  };

  return (
    <Modal visible transparent animationType="fade">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: 'rgba(61,44,30,0.45)' }}>
          <View className="w-full rounded-3xl p-6 items-center" style={{ backgroundColor: '#FFFDF5' }}>
            <NailongAvatar size="lg" source={MASCOT.chat} />
            <Text className="text-2xl font-displayBold text-nailong-dark mt-2">Wo shi Nailong 💛</Text>
            <Text className="text-ink/70 text-center mt-2 mb-4">
              What should I call you? I'll call you Mommy and your name!
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#B0B0B0"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={submit}
              className="w-full bg-white border border-rose-light rounded-2xl px-4 py-3 text-ink text-center mb-4"
            />
            <Pressable onPress={submit} disabled={!name.trim()} className="w-full active:opacity-85">
              <View className="rounded-2xl py-3 items-center" style={{ backgroundColor: name.trim() ? '#FF6B8A' : 'rgba(255,107,138,0.4)' }}>
                <Text className="text-white font-bold text-base">Continue</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
