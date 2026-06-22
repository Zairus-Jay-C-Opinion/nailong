import { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// A single twinkling sparkle. Fades + scales in a loop on a stagger so the
// whole screen feels alive.
function Twinkle({ x, y, size, delay }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity: 0.15 + 0.85 * t.value,
    transform: [{ scale: 0.6 + 0.7 * t.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFFDF2',
          shadowColor: '#FFF6C8',
          shadowOpacity: 0.9,
          shadowRadius: size,
          shadowOffset: { width: 0, height: 0 },
        },
        style,
      ]}
    />
  );
}

// Animated loading screen shown while fonts + saved data load. The full Nailoong
// splash artwork fades in, gently breathes/bobs, and sparkles twinkle over it.
// Background matches the artwork's warm yellow so any edge bleed is seamless.
export default function AnimatedSplash() {
  const fade = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    // Fade + pop in.
    fade.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    // Slow, endless breathe (scale) + tiny bob.
    breathe.value = withDelay(
      300,
      withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true)
    );
  }, []);

  const artStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [
      { scale: (0.98 + 0.02 * fade.value) + 0.025 * breathe.value },
      { translateY: -6 * breathe.value },
    ],
  }));

  // A few sparkles scattered around the characters.
  const sparkles = [
    { x: width * 0.14, y: height * 0.30, size: 10, delay: 0 },
    { x: width * 0.82, y: height * 0.26, size: 8, delay: 250 },
    { x: width * 0.22, y: height * 0.52, size: 7, delay: 500 },
    { x: width * 0.78, y: height * 0.50, size: 11, delay: 150 },
    { x: width * 0.50, y: height * 0.18, size: 9, delay: 700 },
    { x: width * 0.88, y: height * 0.66, size: 7, delay: 400 },
    { x: width * 0.10, y: height * 0.70, size: 9, delay: 600 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#EAC24E', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Image
        source={require('../../assets/splash.png')}
        style={[{ position: 'absolute', width, height }, artStyle]}
        resizeMode="contain"
      />
      {sparkles.map((s, i) => (
        <Twinkle key={i} {...s} />
      ))}
    </View>
  );
}
