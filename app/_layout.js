import '../global.css';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { CycleProvider, useCycle } from '../src/store/CycleContext';
import UsernameGate from '../src/components/UsernameGate';

// Hold the UI until persisted data has loaded (avoids flashing the name prompt
// or an empty state before saved data hydrates).
function Gate({ children }) {
  const { hydrated } = useCycle();
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: '#FFF7E0' }} />;
  return children;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  // Brief blank until the bubbly font is ready, so headers don't flash in a
  // different typeface.
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <CycleProvider>
        <Gate>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat" options={{ presentation: 'modal' }} />
            <Stack.Screen name="album" options={{ presentation: 'modal' }} />
            <Stack.Screen name="photo" options={{ presentation: 'modal' }} />
          </Stack>
          <UsernameGate />
        </Gate>
      </CycleProvider>
    </SafeAreaProvider>
  );
}
