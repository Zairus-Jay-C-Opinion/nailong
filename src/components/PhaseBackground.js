import { ImageBackground, View } from 'react-native';
import { getPhaseTheme } from '../theme/phases';

// The Nailong characters background image from the Figma design. It's always
// on, behind every screen, regardless of cycle phase or whether a period has
// been logged. A subtle per-phase color wash sits on top so the app's mood
// still shifts through the cycle without hiding the artwork.
const BG = require('../../assets/nailong-bg.png');

export default function PhaseBackground({ phase, children, style }) {
  const theme = getPhaseTheme(phase);

  return (
    <ImageBackground source={BG} resizeMode="cover" className="flex-1" style={style}>
      {/* Soft white scrim mutes the very-saturated yellow of the artwork. */}
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,253,245,0.4)' }}
      />
      {theme.tint !== 'transparent' && (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: theme.tint }}
        />
      )}
      {children}
    </ImageBackground>
  );
}
