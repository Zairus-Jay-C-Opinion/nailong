import { useEffect } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useCycle } from '../store/CycleContext';

// Loops background music while it's enabled in Settings. The bundled
// assets/music.mp3 is a silent placeholder — replace it with a real track.
export default function BackgroundMusic() {
  const { musicEnabled } = useCycle();
  const player = useAudioPlayer(require('../../assets/music.mp3'));

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!player) return;
    try {
      player.loop = true;
      if (musicEnabled) player.play();
      else player.pause();
    } catch (e) {
      // player not ready yet — ignore
    }
  }, [musicEnabled, player]);

  return null;
}
