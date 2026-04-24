const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const path = require('path');
const config = {
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    extraNodeModules: new Proxy({}, {
      get: (target, name) => path.join(__dirname, `node_modules/${name}`),
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
