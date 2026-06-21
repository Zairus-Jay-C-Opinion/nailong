import { useEffect } from 'react';
import { View, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

// Animated loading screen shown while fonts + saved data load. Nailong pops in
// and gently bounces, with the logo beneath. Background matches the static
// native splash (#FFF7E0) so the transition is seamless.
export default function AnimatedSplash() {
  const scale = useSharedValue(0.7);
  const bob = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.6)) });
    bob.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: -12 * bob.value }, { scale: scale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF7E0', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={style}>
        <Image
          source={require('../../assets/mascot/ovulation1.png')}
          style={{ width: 170, height: 170 }}
          resizeMode="contain"
        />
      </Animated.View>
      <Image
        source={require('../../assets/nailong-logo.png')}
        style={{ width: 190, height: 38, marginTop: 18 }}
        resizeMode="contain"
      />
    </View>
  );
}
