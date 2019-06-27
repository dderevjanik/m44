const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        m44: path.resolve(__dirname, './index.ts'),
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build', 'js')
    },
    plugins: [
        new CheckerPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    }
};
