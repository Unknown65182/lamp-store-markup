const webpack = require("webpack");
const path = require("path");
// plugins
const HtmlWebpackPlugin = require("html-webpack-plugin");
const RemovePlugin = require("remove-files-webpack-plugin");
const DashboardPlugin = require("webpack-dashboard/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const autoprefixer = require("autoprefixer");
const PnpWebpackPlugin = require(`pnp-webpack-plugin`);

module.exports = (env, argv) => ({
  entry: [path.resolve(__dirname, "src", "js", "index.js")],
  output: {
    filename: argv.mode === "development" ? "[name].[hash].js" : "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [
      ".js",
      ".html",
      ".css",
      ".scss",
      ".json",
      ".jpg",
      ".jpeg",
      ".png",
      ".svg",
      ".webp",
      ".gif",
      ".woff",
      ".woff2",
      ".eot",
      ".ttf",
      ".otf",
    ],
    alias: {
      images: path.resolve(__dirname, "src/assets/images"),
      fonts: path.resolve(__dirname, "src/assets/fonts"),
    },
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  devtool: argv.mode === "development" ? "eval-source-map" : false,
  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    index: "index.html",
    compress: true,
    inline: true,
    historyApiFallback: true,
    overlay: {
      warnings: true,
      errors: true,
    },
    writeToDisk: true,
    port: 8000,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: require.resolve("babel-loader"),
        options: {
          presets: ["@babel/preset-env"],
        },
      },
      {
        test: /\.(scss|css)$/i,
        use: [
          argv.mode === "production"
            ? {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  hmr: true,
                },
              }
            : "style-loader",
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.html$/i,
        use: ["html-loader"],
      },
      {
        test: /\.(gif|png|jpe?g|svg|webp)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[path][name].[ext]",
              outputPath: "images",
              context: "src/assets/images/",
            },
          },
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                enabled: true,
                optimizationLevel: 4,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
          outputPath: "fonts",
          context: "src/assets/fonts/",
        },
      },
    ],
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        parallel: true,
        sourceMap: argv.mode === "development" ? true : false,
      }),
    ],
  },
  plugins: [
    new DashboardPlugin(),
    new RemovePlugin({
      before: {
        include: ["./dist"],
      },
      watch: {
        include: ["./dist"],
      },
      after: {},
    }),
    ...(argv.mode === "development"
      ? []
      : [
          new FixStyleOnlyEntriesPlugin(),
          new MiniCssExtractPlugin({
            filename:
              argv.mode === "development" ? "[name].[hash].css" : "styles.css",
            chunkFilename:
              argv.mode === "development" ? "[id].[hash].css" : "chank.[id]",
          }),
          new OptimizeCssAssetsPlugin({
            assetNameRegExp: /\.optimize\.css$/g,
            cssProcessor: require("cssnano"),
            cssProcessorPluginOptions: {
              preset: ["default", { discardComments: { removeAll: true } }],
            },
            canPrint: true,
          }),
        ]),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [autoprefixer()],
      },
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      inject: true,
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
});
