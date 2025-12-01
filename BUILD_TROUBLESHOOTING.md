# Build Troubleshooting

## Current Issue: CocoaPods Installation Failing

### What We Know:
- ✅ JavaScript bundling works (1062 modules)
- ✅ Code compiles locally
- ❌ CocoaPods installation failing on EAS

### Potential Causes:
1. Firebase web SDK (not React Native Firebase) might be causing pod conflicts
2. Some native dependency version incompatibilities
3. Static frameworks configuration might need adjustment

### Next Steps:

#### Option 1: Try Preview Build (Recommended)
Preview builds are less strict and good for testing:
```bash
npx eas-cli build --platform ios --profile preview
```

#### Option 2: Check Detailed Logs
View the full build logs at:
https://expo.dev/accounts/anthonye4259/projects/goodrunss-mobile/builds/2302cdd4-d20b-4566-9126-b2ae63fd9305

Look for specific pod errors like:
- Which pod is failing
- Version conflicts
- Missing dependencies

#### Option 3: Simplify Dependencies
Temporarily remove complex native dependencies:
- Consider removing Firebase web SDK
- Try without react-native-maps first
- Build incrementally

### Firebase Note:
Current setup uses Firebase web SDK (`firebase` package). This works in React Native but might need:
- Hermes enabled/disabled adjustment
- Specific polyfills
- Or migration to React Native Firebase (`@react-native-firebase/*`)

## Build History:
- Fixed 13 major configuration issues
- JavaScript bundling now works
- Native iOS build is the last hurdle


