"use strict"
const path = require("path");

function join (dir = "") {
    return path.join(__dirname, "..", dir);
}

function resolve() {
    return path.resolve(__dirname, "../");
}

module.exports = {
    context: resolve(),
    entry: {
        app: "./src/index.tsx"
    },
    output: {
        filename: "[name].js",
        path: join(),
        publicPath: ""
    },
    devtool: "source-map",
    resolve: {
        extensions: [".ts", "tsx"]
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: "awesome-typescript-loader"
        }, {
            enforce: "pre",
            test: /\.js$/,
            loader: "source-map-loader"
        }]
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    }
}
