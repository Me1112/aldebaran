const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const baseWebpackConfig = require('./webpack.base.conf')
const webpackFile = require('./webpack.file.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const StringReplacePlugin = require('string-replace-webpack-plugin')
// const vars = require('./vars.config')
// const entry = require("./webpack.entry.conf");
// const webpackCom = require("./webpack.com.conf");

const pad = function (num, n = 2) {
  let len = num.toString().length
  while (len < n) {
    num = '0' + num
    len++
  }
  return num
}

const fs = require('fs')
const gitHEAD = fs.readFileSync('.git/HEAD', 'utf-8').trim() // ref: refs/heads/develop
const ref = gitHEAD.split(': ')[1] // refs/heads/develop
let gitVersion = gitHEAD
if (ref) {
  gitVersion = fs.readFileSync('.git/' + ref, 'utf-8').trim()
}
const verion = fs.readFileSync('version', 'utf-8').trim()
const date = new Date()
const time = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
fs.writeFile(
  path.join(__dirname, '../../version.txt'),
  `${verion} ${time} ${gitVersion}`
)

let config = merge(baseWebpackConfig, {
  /* 设置生产环境 */
  mode: 'production',
  devtool: 'cheap-source-map',
  output: {
    path: path.resolve(webpackFile.proDirectory),
    filename: 'static/js/[name].[contenthash:8].js',
    chunkFilename: 'static/js/[name].[contenthash:8].js',
    publicPath: '/'
  },
  node: {
    fs: "empty"
  },
  plugins: [
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
    new UglifyJsPlugin({
      uglifyOptions: {
        ie8: false,
        mangle: true,
        output: { comments: false },
        compress: {
          warnings: false,
          drop_console: true,
          drop_debugger: true,
          unused: false
        }
      },
      sourceMap: true,
      cache: true
    }),
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
        autoprefixer: { disable: true },
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
        warnings: false, // Uglifyjs 删除没用代码时，不输出警告
        compress: {
          drop_console: true, // 删除所有console语句
          collapse_vars: true,
          reduce_vars: true
        }
      }
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
  ],
  optimization: {
    // minimizer: [
    //     new UglifyJsPlugin({
    //         cache: true,
    //         parallel: true,
    //         sourceMap: true,
    //         uglifyOptions: {
    //             output: {
    //                 comments: false/*删除版权信息*/
    //             },
    //             compress: {
    //                 warnings: false
    //             }
    //         }
    //     })
    // ]
  }
})
// Object.keys(vars.apiProdProxy).map(k => {
//   const setting = vars.apiProdProxy[k]
//   config.module.rules.unshift(
//     {
//       enforce: 'pre',
//       test: /.jsx$/,
//       include: path.join(__dirname, '../../src/action/'),
//       loader: StringReplacePlugin.replace({
//         replacements: [
//           {
//             pattern: eval('/\\' + k + '/ig'),
//             replacement: function (match, offset, string) {
//               return `${setting.target}${match}`
//             }
//           }
//         ]
//       })
//     }
//   )
// })
// let pages = entry;
// for (let chunkName in pages) {
//     let conf = {
//         filename: chunkName + '.html',
//         template: 'index.html',
//         inject: true,
//         title: webpackCom.titleFun(chunkName,pages[chunkName][1]),
//         minify: {
//             removeComments: true,
//             collapseWhitespace: true,
//             removeAttributeQuotes: true
//         },
//         chunks: ['manifest', 'vendor', 'common', chunkName],
//         hash: false,
//         chunksSortMode: 'dependency'
//     };
//     config.plugins.push(new HtmlWebpackPlugin(conf));
// }
/* 清除 pc */
// config.plugins.push(webpackFile.cleanFun([webpackFile.proDirectory]));
/* 拷贝静态资源  */
// webpackFile.copyArr.map(function (data) {
//     return config.plugins.push(data)
// });
module.exports = config
