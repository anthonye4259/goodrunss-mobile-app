const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable support for package exports
config.resolver.unstable_enablePackageExports = true;

module.exports = withNativeWind(config, { input: './global.css' });

