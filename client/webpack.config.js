const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
// const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: [
        path.resolve(__dirname, 'src', 'index.js')
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    devServer: {
        historyApiFallback: true,
        open: true,
        hot: true,
        compress: true,
        static: {
            directory: path.join(__dirname, "./")
        }
    },
    devtool: "source-map",
    resolve: {
        modules: [path.join(__dirname, 'src'), 'node_modules'],
        alias: {
            react: path.join(__dirname, 'node_modules', 'react'),
            process: "process/browser"
        },
        fallback: {
            "fs": false,
            "path": false,
            "buffer": require.resolve("buffer/"),
            "assert": false,
            // "url": false,
            // "util": false,
            // "crypto": false,
            // "process/browser": require.resolve("process/browser")
        } 
    },
    module: {
        rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
            }
        },
        {
            test: /\.css$/,
            use: [
            {
                loader: 'style-loader',
            },
            {
                loader: 'css-loader',
            },
            ],
        },
        {
            test: /\.(gif|svg|jpg|png)$/,
            loader: "file-loader",
            options: {
                name: '/src/images/[name].[ext]'
            }
        },
        // {
        //     test: /\.m?js/,
        //     resolve: {
        //         fullySpecified: false
        //     }
        // }
        ],
    },
    // target: 'node',
    // externalsPresets: { node: true },
    // externals: [nodeExternals(), 'pg', 'sqlite3', 'tedious', 'pg-hstore'],
    plugins: [
        new HtmlWebPackPlugin({
            template: './src/index.html',
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
    ],        
};

