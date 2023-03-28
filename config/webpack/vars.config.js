let varsExports = {}
varsExports.apiDev = ''
varsExports.apiProd = ''
varsExports.apiProdProxy = {
  '/security': {
    changeOrigin: true,
    target: 'http://10.72.100.40',
    secure: false
  },
  '/develop': {
    changeOrigin: true,
    target: 'http://10.72.100.40',
    secure: false
  },
  '/modeling': {
    changeOrigin: true,
    target: 'http://10.72.100.40',
    secure: false
  },
  '/data-engine': {
    changeOrigin: true,
    target: 'http://10.72.100.40',
    secure: false
  },
  '/monitor': {
    changeOrigin: true,
    target: 'http://10.72.100.40',
    secure: false
  }
}
module.exports = varsExports
