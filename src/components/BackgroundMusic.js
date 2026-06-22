import { useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useCycle } from '../store/CycleContext';

// Loops background music while it's enabled in Settings. We wait for the player
// to finish loading (status.isLoaded) before calling play() — calling it too
// early silently no-ops, which is why music didn't start at launch.
export default function BackgroundMusic() {
  const { musicEnabled } = useCycle();
  const player = useAudioPlayer(require('../../assets/music.mp3'));
  const status = useAudioPlayerStatus(player);

  // Allow audio even when the phone's silent switch is on.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!player || !status?.isLoaded) return;
    try {
      player.loop = true;
      if (musicEnabled && !status.playing) player.play();
      else if (!musicEnabled && status.playing) player.pause();
    } catch (e) {
      // player not ready yet — ignore; the status change re-runs this effect.
    }
  }, [musicEnabled, status?.isLoaded, status?.playing, player]);

  return null;
}
