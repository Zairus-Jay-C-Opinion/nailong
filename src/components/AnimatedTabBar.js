import { useEffect } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedProps, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Bottom tab bar with a real carved "notch": an SVG path whose top edge dips
// into a valley under the active tab, where a floating pink bubble (holding the
// active icon) nests. Both the notch and the bubble spring to the selected tab.
const AnimatedPath = Animated.createAnimatedComponent(Path);

const GLYPHS = { index: 'home', calendar: 'calendar', log: 'water', insights: 'stats-chart', settings: 'settings' };
const LABELS = { index: 'Home', calendar: 'Calendar', log: 'Log', insights: 'Insights', settings: 'Settings' };

const H_MARGIN = 16;
const BAR_H = 66;
const BUBBLE = 52;
const R = 26; // bar corner radius
const NW = 42; // notch half-width
const ND = 22; // notch depth

export default function AnimatedTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const barW = Dimensions.get('window').width - H_MARGIN * 2;
  const tabW = barW / state.routes.length;
  const centerFor = (i) => tabW * i + tabW / 2;

  const cx = useSharedValue(centerFor(state.index));
  useEffect(() => {
    cx.value = withSpring(centerFor(state.index), { damping: 15, stiffness: 130 });
  }, [state.index, tabW]);

  // Build the bar outline (rounded rect with a top-edge valley at cx) in a worklet.
  const pathProps = useAnimatedProps(() => {
    const x = cx.value;
    const w = barW;
    const d =
      `M ${R},0` +
      ` L ${x - NW},0` +
      ` C ${x - NW + 10},0 ${x - 22},${ND} ${x},${ND}` +
      ` C ${x + 22},${ND} ${x + NW - 10},0 ${x + NW},0` +
      ` L ${w - R},0` +
      ` Q ${w},0 ${w},${R}` +
      ` L ${w},${BAR_H - R}` +
      ` Q ${w},${BAR_H} ${w - R},${BAR_H}` +
      ` L ${R},${BAR_H}` +
      ` Q 0,${BAR_H} 0,${BAR_H - R}` +
      ` L 0,${R}` +
      ` Q 0,0 ${R},0 Z`;
    return { d };
  });

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cx.value - BUBBLE / 2 }],
  }));

  const activeName = state.routes[state.index].name;

  return (
    <View style={{ position: 'absolute', left: H_MARGIN, right: H_MARGIN, bottom: insets.bottom + 8, height: BAR_H }}>
      {/* Carved bar */}
      <Svg width={barW} height={BAR_H} style={{ position: 'absolute' }}>
        <AnimatedPath animatedProps={pathProps} fill="rgba(255,255,255,0.94)" stroke="rgba(255,255,255,0.85)" strokeWidth={1} />
      </Svg>

      {/* Labels + inactive icons (touch targets) */}
      <View style={{ flexDirection: 'row', flex: 1 }}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable key={route.key} onPress={onPress} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 9 }}>
              <View style={{ height: 22, justifyContent: 'center' }}>
                {!focused && <Ionicons name={GLYPHS[route.name]} size={21} color="#FFA9BC" />}
              </View>
              <Text style={{ fontSize: 10, fontFamily: 'Fredoka_500Medium', color: focused ? '#FF6B8A' : '#9A9A9A', marginTop: 2 }}>
                {LABELS[route.name]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Floating active bubble nesting in the notch */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -BUBBLE / 2 + 4,
            width: BUBBLE,
            height: BUBBLE,
            borderRadius: BUBBLE / 2,
            shadowColor: '#FF6B8A',
            shadowOpacity: 0.45,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          },
          bubbleStyle,
        ]}
      >
        <View style={{ flex: 1, borderRadius: BUBBLE / 2, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.95)' }}>
          <LinearGradient colors={['#FF9BB0', '#FF6B8A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <LinearGradient
              colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '55%' }}
            />
            <Ionicons name={GLYPHS[activeName]} size={24} color="#FFFFFF" />
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
}
