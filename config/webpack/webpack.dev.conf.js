/*
 * @Author: yanchq@we-ai.com.cn yanchq@we-ai.com.cn
 * @Date: 2023-03-03 17:44:42
 * @LastEditors: yanchq@we-ai.com.cn yanchq@we-ai.com.cn
 * @LastEditTime: 2023-03-20 17:46:09
 * @FilePath: \aldebaran\config\webpack\webpack.dev.conf.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const webpack = require("webpack"); //引入webpack
const opn = require("opn"); //打开浏览器
const merge = require("webpack-merge"); //webpack配置文件合并
const path = require("path");
const baseWebpackConfig = require("./webpack.base.conf"); //基础配置
const webpackFile = require("./webpack.file.conf"); //一些路径配置

let config = merge(baseWebpackConfig, {
  /*设置开发环境*/
  mode: "development",
  output: {
    path: path.resolve(webpackFile.devDirectory),
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].js",
    publicPath: ""
  },
  node: {
    fs: "empty"
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    /*设置热更新*/
    new webpack.HotModuleReplacementPlugin()
    // new HtmlWebpackPlugin({
    //     // version: dirVars.version,
    //     template: 'template/index.html',
    //     // favicon: 'src/public/img/favicon.ico',
    //     inject: 'body',
    //     filename: `index.html`,
    //     chunksSortMode: 'dependency',
    //     chunks: ['vendor', 'common', 'index']
    // }),
    /* common 业务公共代码，vendor引入第三方 */
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: ["common", "vendor"],
    // }),
    // /* 防止 vendor hash 变化 */
    // // extract webpack runtime and module manifest to its own file in order to
    // // prevent vendor hash from being updated whenever app bundle is updated
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'manifest',
    //     chunks: ['vendor']
    // }),
  ],
  /*设置api转发*/
  devServer: {
    host: "0.0.0.0",
    port: 9528,
    compress: true, // 开启Gzip压缩
    hot: true,
    inline: true,
    stats: {
      colors: {
        green: "\u001b[32m"
      }
    },
    contentBase: path.resolve(webpackFile.dllDirectory),
    historyApiFallback: true,
    disableHostCheck: true,
    proxy: {
      "/dms/": {
        changeOrigin: true,
        // target: "http://10.72.100.23:7322",
        // target: 'http://10.72.100.52:9010',
         target: "http://10.72.100.23:7788",
       //  target: "http://10.72.100.27:7788",
        secure: false
      },
      "/uaa/": {
        changeOrigin: true,
        //target: "http://10.72.100.23:7322",
        // target: 'http://10.72.100.52:9010',
         target: "http://10.72.100.23:7788",
        // target: "http://10.72.100.27:7788",
        secure: false
      }
    },
    /*打开浏览器 并打开本项目网址*/
    after() {
      opn("http://localhost:" + this.port);
    }
  }
});
module.exports = config;
