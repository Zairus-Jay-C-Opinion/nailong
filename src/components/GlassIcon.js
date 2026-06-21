import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Glossy pink "glass tile" icon, in the style of aesthetic iOS icon packs:
// a rounded pink gradient square with a bright top sheen and a white glyph.
// Used for the tab bar so the icons feel cute/3D instead of flat line icons.
export default function GlassIcon({ name, focused, size = 32 }) {
  return (
    <View
      style={{
        shadowColor: '#FF6B8A',
        shadowOpacity: focused ? 0.55 : 0,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: focused ? 5 : 0,
      }}
    >
      <View style={{ width: size, height: size, borderRadius: size * 0.3, overflow: 'hidden', opacity: focused ? 1 : 0.65 }}>
        <LinearGradient
          colors={focused ? ['#FF9BB0', '#FF6B8A'] : ['#FFC8D3', '#FFA9BC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Top sheen for the glassy 3D look */}
          <LinearGradient
            colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '55%' }}
          />
          <Ionicons name={name} size={size * 0.52} color="#FFFFFF" />
        </LinearGradient>
      </View>
    </View>
  );
}
