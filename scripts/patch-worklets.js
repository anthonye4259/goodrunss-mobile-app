#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const podspecPath = path.join(__dirname, '../node_modules/react-native-worklets/RNWorklets.podspec');

if (fs.existsSync(podspecPath)) {
  let content = fs.readFileSync(podspecPath, 'utf8');
  
  // Comment out the version assertion line
  content = content.replace(
    /worklets_assert_minimal_react_native_version\(\$worklets_config\)/,
    '# worklets_assert_minimal_react_native_version($worklets_config) # Patched for RN 0.76.5'
  );
  
  fs.writeFileSync(podspecPath, content);
  console.log('✅ Patched react-native-worklets podspec to work with RN 0.76.5');
} else {
  console.log('⚠️  react-native-worklets podspec not found, skipping patch');
}

