const {
    getDefaultConfig,
    mergeConfig,
} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const {
    resolver: { assetExts, sourceExts },
    transformer,
} = defaultConfig;

const config = {
    transformer: {
        ...transformer,
        babelTransformerPath: require.resolve(
            'react-native-svg-transformer'
        ),
    },
    resolver: {
        assetExts: assetExts.filter(
            (ext) => ext !== 'svg'
        ),
        sourceExts: [...sourceExts, 'svg'],
    },
};

module.exports = mergeConfig(defaultConfig, config);