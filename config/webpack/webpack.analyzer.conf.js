const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

const prodConfig = merge(baseWebpackConfig, {
  output: {
    filename: 'static/js/[name].[contenthash:8].js'
  },
  plugins: [
    new BundleAnalyzerPlugin(
      {
        // Can be `server`, `static` or `disabled`.
        // In `server` mode analyzer will start HTTP server to show bundle report.
        // In `static` mode single HTML file with bundle report will be generated.
        // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
        analyzerMode: 'server',
        // Host that will be used in `server` mode to start HTTP server.
        analyzerHost: '127.0.0.1',
        // Port that will be used in `server` mode to start HTTP server.
        analyzerPort: 8888,
        // Path to bundle report file that will be generated in `static` mode.
        // Relative to bundles output directory.
        reportFilename: 'report.html',
        // Automatically open report in default browser
        openAnalyzer: true,
        // If `true`, Webpack Stats JSON file will be generated in bundles output directory
        generateStatsFile: false,
        // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
        // Relative to bundles output directory.
        statsFilename: 'stats.json',
        // Options for `stats.toJson()` method.
        // For example you can exclude sources of your modules from stats file with `source: false` option.
        // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
        statsOptions: null,
        // Log level. Can be 'info', 'warn', 'error' or 'silent'.
        logLevel: 'info'
      }
    ),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CleanWebpackPlugin([path.resolve('dist')], {
      root: path.join(__dirname, '../../'), //根目录
      verbose: true, //开启在控制台输出信息
      dry: false //启用删除文件
    }),
    new CopyWebpackPlugin([
      { from: path.resolve('dll/static'), to: path.resolve('dist/static') },
      { from: path.resolve('version.txt'), to: path.resolve('dist') }
    ]),
    new webpack.DllReferencePlugin({
      manifest: require(path.join(__dirname, '../../dll', 'react.manifest.json'))
    }),
    new webpack.HashedModuleIdsPlugin(),
    // new HtmlIncludeAssetsPlugin({
    //     assets: ['js/react.dll.js'],
    //     append: false
    // }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {
        discardComments: { removeAll: true },
        // 避免 cssnano 重新计算 z-index
        safe: true
      },
      canPrint: true
    }),
    new ParallelUglifyPlugin({
      workerCount: 4, // 开启几个子进程去并发的执行压缩，默认是当前电脑的cpu数量减1
      uglifyJS: {
        output: {
          beautify: false, // 不需要格式化
          comments: false // 保留注释
        },
        compress: {
          warnings: false, // Uglifyjs 删除没用代码时，不输出警告
          drop_console: true, // 删除所有console语句
          collapse_vars: true,
          reduce_vars: true
        }
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'common',
          chunks: 'initial',
          minChunks: 2,
          maxInitialRequests: 5,
          minSize: 0
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendor',
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
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'react-router-dom': 'ReactRouterDOM',
    'react-redux': 'ReactRedux',
    'redux': 'Redux',
    'redux-thunk': 'ReduxThunk',
    'jsplumb': 'jsPlumb',
    'echarts': 'echarts',
    'babel-polyfill': 'window' // polyfill 直接写 {} 也是可以的
  }
})

module.exports = prodConfig
