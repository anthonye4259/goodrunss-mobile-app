#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting worklets patch script...');

const workletsDir = path.join(__dirname, '../node_modules/react-native-worklets');
const podspecPath = path.join(workletsDir, 'RNWorklets.podspec');
const bundledPodspecPath = path.join(__dirname, '../patches/RNWorklets.podspec');

// Check if worklets directory exists
if (!fs.existsSync(workletsDir)) {
  console.log('❌ react-native-worklets not installed');
  process.exit(0);
}

console.log(`📁 Checking for podspec at: ${podspecPath}`);

// If podspec doesn't exist, copy from our bundled version
if (!fs.existsSync(podspecPath)) {
  console.log('⚠️  Podspec not found! Copying bundled version...');

  if (fs.existsSync(bundledPodspecPath)) {
    fs.copyFileSync(bundledPodspecPath, podspecPath);
    console.log('✅ Copied bundled RNWorklets.podspec');
  } else {
    console.log('❌ Bundled podspec not found at:', bundledPodspecPath);
    process.exit(1);
  }
} else {
  console.log('✅ Podspec found! Reading content...');
  let content = fs.readFileSync(podspecPath, 'utf8');

  // Patch version assertion if needed
  if (content.includes('worklets_assert_minimal_react_native_version')) {
    console.log('⚠️  Found version assertion - patching...');

    content = content.replace(
      /worklets_assert_minimal_react_native_version\(\$worklets_config\)/g,
      '# worklets_assert_minimal_react_native_version($worklets_config) # Patched'
    );

    fs.writeFileSync(podspecPath, content);
    console.log('✅ Patched react-native-worklets podspec successfully!');
    console.log('📝 Version check has been disabled');
  } else {
    console.log('✅ No version assertion found - podspec is compatible');
  }
}

// Verify podspec exists
if (fs.existsSync(podspecPath)) {
  const stats = fs.statSync(podspecPath);
  console.log(`✅ Verified: podspec exists (${stats.size} bytes)`);
} else {
  console.log('❌ ERROR: podspec still missing!');
  process.exit(1);
}

console.log('🏁 Patch script complete\n');
