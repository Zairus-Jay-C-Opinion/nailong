import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import { CycleProvider } from '../src/store/CycleContext';
import UsernameGate from '../src/components/UsernameGate';

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
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="chat" options={{ presentation: 'modal' }} />
        </Stack>
        <UsernameGate />
      </CycleProvider>
    </SafeAreaProvider>
  );
}
