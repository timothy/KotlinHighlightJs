const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** @type WebpackConfig */
const webExtensionConfig = {
    mode: 'none',
    target: 'webworker',
    entry: {
        'extension': './src/web/extension.ts',
        'test/suite/index': './src/web/test/suite/index.ts'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, './dist/web'),
        libraryTarget: 'commonjs',
        devtoolModuleFilenameTemplate: '../../[resource-path]'
    },
    resolve: {
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.ts', '.js', '.css'],
        fallback: {
            'assert': require.resolve('assert')
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader'
                }]
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new MiniCssExtractPlugin({
            filename: 'styles.css'
        })
    ],
    externals: {
        'vscode': 'commonjs vscode',
    },
    performance: {
        hints: false
    },
    devtool: 'nosources-source-map',
    infrastructureLogging: {
        level: "log",
    },
};

const highlightConfig = {
    ...webExtensionConfig,
    target: 'web',
    entry: {
        'highlight': './src/web/highlight.js'
    },
    output: {
        ...webExtensionConfig.output,
        filename: '[name].bundle.js',
        libraryTarget: 'window'
    }
};

module.exports = [webExtensionConfig, highlightConfig];