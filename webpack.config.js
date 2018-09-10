/* eslint import/no-extraneous-dependencies: off */

const path = require("path");
const webpack = require("webpack");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const GenerateAssetWebpackPlugin = require("generate-asset-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const {
  name,
  version,
  description,
  author,
  homepage,
  extensionManifest
} = require("./package.json");

const {
  NODE_ENV = "development"
} = process.env;

// Safe subset of environment vars to be passed to build.
const configEnv = {
  NODE_ENV
};

const isDev = NODE_ENV === "development";

module.exports = {
  entry: {
    background: "./src/background",
    contentScript: "./src/contentScript",
    "app/index": "./src/app/index"
  },
  mode: isDev ? "development" : "production",
  devtool: isDev ? "inline-source-map" : false,
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(configEnv),
      "process.env.NODE_ENV": `"${NODE_ENV}"`
    }),
    new MiniCssExtractPlugin(),
    new GenerateAssetWebpackPlugin({
      filename: "manifest.json",
      fn: buildManifest
    }),
    new HtmlWebpackPlugin({
      title: extensionManifest.name,
      filename: "app/index.html",
      chunks: [ "app/index" ]
    }),
    new CopyWebpackPlugin([
      { from: "src/images/logo.svg", to: "images/" }
    ])
  ],
  module: {
    rules: [
     {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            presets: [
              [
                "@babel/preset-env", {
                  targets: { firefox: "57" },
                  modules: false
                }
              ],
              "@babel/preset-react"
            ],
            plugins: [
              "@babel/plugin-proposal-object-rest-spread",
              "@babel/plugin-proposal-class-properties"
            ]
          }
        }
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "less-loader"
        ]
      },
      {
        test: /\.(jpe?g|gif|png|svg)$/i,
        use: [ "file-loader" ]
      },
      {
        test: /\.(ttf|woff|eot)$/i,
        use: [ "file-loader" ]
      }
    ]
  }
};

function buildManifest(compilation, cb) {
  const manifest = Object.assign(
    {},
    extensionManifest,
    {
      manifest_version: 2,
      // HACK: Accept override in extensionManifest - npm disallows caps &
      // spaces, but we want them in an extension name
      name: extensionManifest.name || name,
      version,
      description,
      author,
      homepage_url: homepage
    }
  );
  return cb(null, JSON.stringify(manifest, null, "  "));
}
