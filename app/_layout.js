import '../global.css';
import { useEffect, useState } from 'react';
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
import AnimatedSplash from '../src/components/AnimatedSplash';
import BackgroundMusic from '../src/components/BackgroundMusic';

// Show the animated splash until fonts + saved data are ready (and a short
// minimum so the animation is actually seen).
function Gate({ fontsLoaded, children }) {
  const { hydrated } = useCycle();
  const [minDone, setMinDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), 1700);
    return () => clearTimeout(t);
  }, []);
  if (!(fontsLoaded && hydrated && minDone)) return <AnimatedSplash />;
  return children;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  return (
    <SafeAreaProvider>
      <CycleProvider>
        <Gate fontsLoaded={fontsLoaded}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="chat" options={{ presentation: 'modal' }} />
            <Stack.Screen name="album" options={{ presentation: 'modal' }} />
            <Stack.Screen name="photo" options={{ presentation: 'modal' }} />
          </Stack>
          <UsernameGate />
          <BackgroundMusic />
        </Gate>
      </CycleProvider>
    </SafeAreaProvider>
  );
}
