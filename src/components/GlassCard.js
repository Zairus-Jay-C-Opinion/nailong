import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useCycle } from '../store/CycleContext';
import { getPhaseTheme } from '../theme/phases';

// Glassmorphism card: a moderate blur of whatever sits behind it, a translucent
// white wash, a faint white top sheen, and a subtle phase-tinted outer glow.
// Fades + rises in on mount.
//
//   intensity  – white wash opacity (light / medium / heavy)
//   blur       – blur strength 0–100 (default 22)
//   delay      – entrance delay in ms (for staggering)
const FROST = {
  light: 'rgba(255,255,255,0.30)',
  medium: 'rgba(255,255,255,0.45)',
  heavy: 'rgba(255,255,255,0.58)',
};

export default function GlassCard({ children, intensity = 'medium', blur = 22, delay = 0, className = '', style, ...rest }) {
  const wash = FROST[intensity] || FROST.medium;
  const { status } = useCycle();
  const theme = getPhaseTheme(status.phase);

  return (
    <Animated.View entering={FadeInDown.duration(450).delay(delay)}>
      <View
        className={`rounded-3xl ${className}`}
        style={[
          {
            shadowColor: theme.accent,
            shadowOpacity: 0.22,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 1 },
            elevation: 3,
          },
          style,
        ]}
        {...rest}
      >
        <BlurView
          intensity={blur}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          className="rounded-3xl overflow-hidden border border-white/60"
          style={StyleSheet.absoluteFill}
        >
          <View style={[StyleSheet.absoluteFill, { backgroundColor: wash }]} />
          <LinearGradient
            colors={['rgba(255,255,255,0.40)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { height: '38%' }]}
            pointerEvents="none"
          />
        </BlurView>
        {children}
      </View>
    </Animated.View>
  );
}
