const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Respect package.json "exports" maps so @supabase/realtime-js resolves its
// platform-specific files (e.g. ./lib/websocket-factory) correctly.
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: './global.css' });
