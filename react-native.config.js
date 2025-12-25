module.exports = {
  dependencies: {
    // react-native-worklets needs to be linked for react-native-reanimated
    'react-native-worklets': {
      platforms: {
        // Enable iOS linking - required by react-native-reanimated
        ios: {
          podspecPath: './node_modules/react-native-worklets/RNWorklets.podspec'
        },
        android: null,
      },
    },
  },
};
