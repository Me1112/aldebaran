const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const glob = require('glob')
const path = require('path')
const options = {
  cwd: path.resolve('src/entry'),
  sync: true
}
const globInstance = new glob.Glob('*.js', options)
const pageEntries = globInstance.found

const pad = function (num, n = 2) {
  let len = num.toString().length
  while (len < n) {
    num = '0' + num
    len++
  }
  return num
}

const date = new Date()
const version = `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}.${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`

let plugins = [
  new CleanWebpackPlugin([path.resolve('dll')], {
    root: path.join(__dirname, '../../'), //根目录
    verbose: true, //开启在控制台输出信息
    dry: false //启用删除文件
  }),
  new webpack.DllPlugin({
    // path 指定manifest文件的输出路径
    path: path.join(__dirname, '../../dll', '[name].manifest.json'),
    name: '_dll_[name]_[chunkhash]' // 和library 一致，输出的manifest.json中的name值
  })
]
pageEntries.forEach((page) => {
  let name = page.replace(/\.\w+$/, '')
  plugins.push(new HtmlWebpackPlugin({
    version,
    filename: `../../${name}.html`,
    inject: 'body',
    template: `template/${name}.html`
  }))
})
module.exports = {
  entry: {
    react: ['react', 'react-dom', 'react-router-dom', 'react-redux', 'react-loadable']
  },
  output: {
    filename: '[name].dll.[contenthash:8].js', // 动态链接库输出的文件名称
    path: path.join(__dirname, '../../dll/static/js'), // 动态链接库输出路径
    libraryTarget: 'var', // 链接库(react.dll.js)输出方式 默认'var'形式赋给变量 b
    library: '_dll_[name]_[chunkhash]' // 全局变量名称 导出库将被以var的形式赋给这个全局变量 通过这个变量获取到里面模块
  },
  plugins: plugins
}
