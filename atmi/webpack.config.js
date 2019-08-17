var path = require("path"),
    webpack = require("webpack"),
    ExtractTextPlugin = require("extract-text-webpack-plugin"),
    ManifestRevisionPlugin = require("manifest-revision-webpack-plugin"),
    MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDevelopment = !(process.env.NODE_ENV === 'production');

//export NODE_ENV=development
console.debug("isDev:", isDevelopment);

var root = "./static";

module.exports = {
    entry: {
        app_js: [
            root + "/scripts/app.js"
        ],
        main_css: [
            root + "/styles/main.scss"
        ]
    },

    devtool: 'source-map',

    output: {
        
        //publicPath: '/',
		devtoolModuleFilenameTemplate: '../[resource-path]',
        
        path: path.resolve(__dirname, 'public'),
        publicPath: "/assets/",
        filename: "[name].[hash].js",
        chunkFilename: "[id].[hash].chunk"
    },
    resolve: {
        extensions: [".js", ".scss"]
    },
    optimization: {
        minimize: false
    },
    mode: isDevelopment ? "development" : "production",
    module: {
        rules: [
            {
                test: /\.js$/i,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ['env', 'react']
                }
            }, {
                test: /\.s(a|c)ss$/,
                exclude: /\.module.(s(a|c)ss)$/,
                loader: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: isDevelopment
                        }
                    }
                ]
            }, {
                test: /\.css$/,
                //loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
                //loader: 'style-loader!css-loader?modules&importLoaders=1'
                loader: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    //'style-loader'
                ]
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("[name].[hash].css"),
        new ManifestRevisionPlugin(path.resolve(__dirname, "manifest.json"), {
            rootAssetPath: root,
            ignorePaths: ["/styles", "/scripts"]
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
            chunkFilename: '[id].[hash].css'
        }),
        // new webpack.optimize.UglifyJsPlugin(),
        // new webpack.optimize.DedupePlugin(),
        // new webpack.DefinePlugin({
        //     "process.env": {
        //         NODE_ENV: '"production"'
        //     }
        // })
    ]
};
