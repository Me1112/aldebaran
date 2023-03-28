const glob = require('glob')
const path = require('path')
const tinyColor = require('tinycolor2')
const StringReplacePlugin = require('string-replace-webpack-plugin')
const vars = require('./vars.config')
const entryDir = resolve('../../src/entry')
let theme = require('../theme/default')
const primaryColor = theme['primary-color']
theme = { ...theme, ['primary-color-alpha-10']: tinyColor(primaryColor).setAlpha(.1).toRgbString(), ['primary-color-alpha-05']: tinyColor(primaryColor).setAlpha(.05).toRgbString() }
const options = {
  cwd: resolve('../../src/entry'),
  sync: true
}
const json = require('../../package.json')//引进package.json
const globInstance = new glob.Glob('*.js', options)
const pageEntries = globInstance.found
const entries = {}
entries.vendor = Object.keys(json.dependencies).filter(k => [ 'react', 'react-dom', 'react-router-dom', 'react-redux', 'react-loadable', 'antd' ].indexOf(k) === -1) //把 package.json dependencies字段的值放进 vendor中

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const devMode = process.env.NODE_ENV !== 'production'

const HappyPack = require('happypack')
const os = require('os') // 系统操作函数
const cups = devMode ? os.cpus().length : Math.floor(os.cpus().length / 2)
const happyThreadPool = HappyPack.ThreadPool({ size: cups < 1 ? 1 : cups }) // 指定线程池个数

function resolve(dir) {
  return path.join(__dirname, dir)
}

let plugins = [
  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  new webpack.NamedChunksPlugin(
    chunk => chunk.name || Array.from(chunk.modulesIterable, m => m.id).join('_')
  ),
  new webpack.DefinePlugin({ // 定义环境变量
    'process.env': JSON.stringify(process.env.NODE_ENV)
  }),
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: devMode ? 'static/css/[name].css' : 'static/css/[name].[contenthash:8].css',
    chunkFilename: devMode ? 'static/css/[id].css' : 'static/css/[id].[contenthash:8].css'
  }),
  new HappyPack({
    id: 'happy-babel',
    loaders: [ 'babel-loader?cacheDirectory' ],
    threadPool: happyThreadPool,
    verbose: true
  })
]

pageEntries.forEach((page) => {
  let name = page.replace(/\.\w+$/, '')
  entries[name] = path.join(entryDir, page)
  plugins.push(new HtmlWebpackPlugin({
    // version: dirVars.version,
    template: resolve(`../../dll/${name}.html`),
    // favicon: resolve('../../src/public/img/favicon.ico'),
    inject: 'body',
    filename: `${name}.html`,
    chunksSortMode: 'dependency',
    chunks: [ 'vendor', 'common', name ]
  }))
})

module.exports = {
  entry: entries,
  output: {
    path: resolve('../../dist'),
    filename: '[name].js'
  },
  optimization: {
    // runtimeChunk: {
    //   name: 'manifest'
    // },
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]src[\\/]/,
          name: 'common',
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0,
          priority: 1,
          reuseExistingChunk: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
          priority: 10,
          enforce: true
        }
        // styles: {
        //     name: 'styles',
        //     test: /\.(css|less)$/,
        //     chunks: 'all',
        //     minChunks: 2,
        //     enforce: true
        // }
      }
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        enforce: 'pre',
        test: /src[\\/]common[\\/]index.jsx$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /__SITE_URL__/ig,
              replacement: function (match, offset, string) {
                return devMode ? vars.apiDev : vars.apiProd
              }
            }
          ]
        })
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'happypack/loader?id=happy-babel',
        loader: 'babel-loader',
        include: [ resolve('../../src') ],
        exclude: /node_modules/
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.less$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              sourceMap: true,
              javascriptEnabled: true,
              modifyVars: theme
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader?limit=2048&name=static/img/[name].[md5:hash:hex:7].[ext]'
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)\??.*$/,
        loader: 'url-loader?limit=2048&name=static/font/[name].[ext]?v=[md5:hash:hex:16]'
      },
      {
        test: /\.swf$/,
        loader: 'file?name=static/js/[name].[ext]'
      }
    ],
    noParse: function (content) { // content 从入口开始解析的模块路径
      return /no-parser/.test(content) // 返回true则忽略对no-parser.js的解析
    }
  },
  resolve: {
    modules: [ // 优化模块查找路径
      resolve('../../src'),
      resolve('../../node_modules') // 指定node_modules所在位置 当你import第三方模块式 直接从这个路径下搜寻
    ],
    alias: {
      '@src': resolve('../../src'),
      '@action': resolve('../../src/action'),
      '@common': resolve('../../src/common'),
      '@component': resolve('../../src/component'),
      '@public': resolve('../../src/public'),
      '@reducer': resolve('../../src/reducer'),
      '@router': resolve('../../src/router'),
      '@store': resolve('../../src/store'),
      '@util': resolve('../../src/util'),
      '@view': resolve('../../src/view')
    },
    extensions: [ '.js', '.json', '.jsx', '.css', '.less', '.scss', '.sass', '.pcss' ]
  },
  plugins: plugins
}
