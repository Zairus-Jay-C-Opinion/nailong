import { useEffect } from 'react';
import { View, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, FadeIn } from 'react-native-reanimated';
import { useCycle } from '../store/CycleContext';
import { getPhaseTheme } from '../theme/phases';
import { pickMascot } from '../data/nailongImages';

// Real Nailong art (transparent cut-outs), shown free over a soft phase ring.
// Gently bobs up and down (continuous, UI-thread) and cross-fades when the pose
// changes. Pass `source` to pin a specific pose; otherwise it cycles by phase.
const SIZES = { xs: 30, sm: 52, md: 88, lg: 132 };

export default function NailongAvatar({ size = 'md', phase, source }) {
  const { status } = useCycle();
  const p = phase || status.phase || 'unknown';
  const theme = getPhaseTheme(p);
  const dim = SIZES[size] || SIZES.md;
  const ring = dim;          // colored disc fills the box
  const imgSize = dim * 0.8; // character sits inside the disc (no spill)
  const src = source || pickMascot(p);

  const bob = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * bob.value }] }));

  return (
    <View style={{ width: dim, height: dim, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: ring,
          height: ring,
          borderRadius: ring / 2,
          backgroundColor: theme.accentSoft,
          borderWidth: 2,
          borderColor: theme.accent + '55',
        }}
      />
      <Animated.View
        key={source ? 'fixed' : p}
        entering={FadeIn.duration(400)}
        style={[{ width: imgSize, height: imgSize, borderRadius: imgSize * 0.24, overflow: 'hidden' }, bobStyle]}
      >
        <Image source={src} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}
