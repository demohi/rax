const { NODE_ENV, DEBUG } = process.env;
const { resolve } = require('path');
const { readFileSync } = require('fs');
const webpack = require('webpack');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
const address = require('address');
const chalk = require('chalk');
const dayjs = require('dayjs');

// const { version: atagVersion } = require('atag/package.json');
const { version: frameworkVersion } = require('../package.json');
const atagVersion = '0.1.32';
/**
 * If debug mode is enabled,
 * it will use local ip to provide atag.js
 */
const isDebug = DEBUG === 'true';
const localIP = address.ip();

const LOCAL_ATAG_SERVE_PORT = 9001;
const LOCAL_FRAMEWORK_SERVE_PORT = 8003;

const ATAG_URL = isDebug
  ? `http://${localIP}:9001/atag.js`
  : `https://g.alicdn.com/code/npm/atag/${atagVersion}/dist/atag.js`;

console.log(`
-----
${chalk.bgGreen('Build for versions')}:
  miniapp-framework: ${chalk.green(frameworkVersion)}
  atag: ${chalk.green(atagVersion)}
-----
`);

module.exports = new Promise((done) => {
  const config = {
    mode: NODE_ENV || 'development',
    devtool: NODE_ENV === 'development' ? 'inline-source-map' : false,
    entry: {
      'index': resolve(__dirname, '../src/container/index'),
    },
    output: {
      globalObject: 'this',
    },
    node: {
      /**
       * Prevent webpack from injecting useless setImmediate polyfill because Vue
       * source contains it (although only uses it if it's native).
       */
      setImmediate: false,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: require('./babel.config'),
        },
        // {
        //   test: /webpack-hot-client/,
        //   loader: 'null-loader',
        // },
        {
          test: /\.(png|jpg|gif)$/,
          loader: 'url-loader',
          options: {
            limit: 8192,
          },
        },
      ],
    },
    externals: [
      function(context, request, callback) {
        // eslint-disable-line
        if (/^@(core|weex-module)\//.test(request)) {
          return callback(null, `commonjs2 ${request}`);
        }
        callback();
      },
    ],
    // disable dev server all!!
    // for Native JSC can not run sockjs
    devServer: {
      hot: false,
      inline: false,
    },
    plugins: [
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      // new webpack.DefinePlugin({
      //   ATAG_URL: JSON.stringify(ATAG_URL),
      // }),

      new webpack.BannerPlugin({
        banner: `MiniApp Framework: ${frameworkVersion} Bulit at: ${dayjs().format('YYYY.MM.DD HH:mm:ss')}`,
      }),
    ],

  };

  done(config);
});
