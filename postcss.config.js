module.exports = {
  plugins: [
    require('precss'),
    require('postcss-cssnext')
  ],
  autoprefixer: {
    browsers: ['> 1%', 'ie >= 9']
  }
}
