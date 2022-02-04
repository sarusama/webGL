"use strict"
const config = require("../config");
const {
    merge
} = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseWebpackConfig = require("./webpack.base.conf");

module.exports = merge(baseWebpackConfig, {
    devServer: {
        hot: config.dev.hot,
        compress: true,
        host: config.dev.host,
        port: config.dev.port
    },
    mode: config.dev.mode,
    plugins: [
        // 自动添加打包出来的路径到html中
	    new HtmlWebpackPlugin({
	    	template: "/public/index.html",
	    	inject: true
	    })
	]
});
