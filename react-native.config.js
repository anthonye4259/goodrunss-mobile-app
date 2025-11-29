module.exports = {
  dependencies: {
    'react-native-worklets': {
      platforms: {
        ios: null, // Disable auto-linking to avoid podspec validation
        android: null,
      },
    },
  },
};
