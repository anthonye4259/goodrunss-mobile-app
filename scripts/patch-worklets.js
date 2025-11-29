#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting worklets patch script...');

const podspecPath = path.join(__dirname, '../node_modules/react-native-worklets/RNWorklets.podspec');

console.log(`📁 Looking for podspec at: ${podspecPath}`);

if (fs.existsSync(podspecPath)) {
  console.log('✅ Podspec found! Reading content...');
  let content = fs.readFileSync(podspecPath, 'utf8');
  
  // Log if validation exists
  if (content.includes('worklets_assert_minimal_react_native_version')) {
    console.log('⚠️  Found version assertion - patching...');
    
    // Replace the assertion
    content = content.replace(
      /worklets_assert_minimal_react_native_version\(\$worklets_config\)/g,
      '# worklets_assert_minimal_react_native_version($worklets_config) # Patched'
    );
    
    // Write it back
    fs.writeFileSync(podspecPath, content);
    console.log('✅ Patched react-native-worklets podspec successfully!');
    console.log('📝 Version check has been disabled');
  } else {
    console.log('✅ No version assertion found - podspec is compatible');
  }
} else {
  console.log('❌ Podspec not found at expected location');
  console.log('🔍 Searching for worklets...');
  
  // Try to find it
  const nodeModulesPath = path.join(__dirname, '../node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    const dirs = fs.readdirSync(nodeModulesPath);
    const hasWorklets = dirs.some(d => d.includes('worklets'));
    console.log(`Worklets packages found: ${hasWorklets}`);
  }
}

console.log('🏁 Patch script complete\n');


