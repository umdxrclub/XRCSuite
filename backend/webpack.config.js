let nodeExternals = require("webpack-node-externals")

module.exports = {
    entry: './run.ts',
    target: 'node',
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['env', {
                                'targets': {
                                'node': 'current'
                                }
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: "./backend.js"
    }
}