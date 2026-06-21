import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { getPhaseTheme } from '../theme/phases';

// Circular progress ring showing how far into the cycle she is.
export default function PhaseRing({ cycleDay, cycleLength = 28, phase, size = 140 }) {
  const theme = getPhaseTheme(phase);
  const stroke = 10;
  const r = (size - stroke) / 2 - 6;
  const circ = 2 * Math.PI * r;
  const pct = cycleDay ? Math.min(cycleDay / cycleLength, 1) : 0;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.dot} />
            <Stop offset="100%" stopColor={theme.accent} />
          </LinearGradient>
        </Defs>
        <Circle cx={center} cy={center} r={r} stroke="rgba(255,255,255,0.45)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View className="items-center justify-center">
        <Text className="text-5xl font-bold" style={{ color: theme.accent }}>
          {cycleDay ?? '–'}
        </Text>
        <Text className="text-ink/50 text-xs font-semibold -mt-1">Day</Text>
      </View>
    </View>
  );
}
