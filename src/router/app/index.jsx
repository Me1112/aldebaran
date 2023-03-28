module.exports = {
  path: '/',
  getChildRoutes(location, cb) {
    require.ensure([], (require) => {
      cb(null, [
        require('../rules'),
        require('../score'),
        require('../black'),
        require('../event')
      ])
    })
  },
  getComponent(nextState, cb) {
    require.ensure([], (require) => {
      cb(null, require('../../container/app'))
    }, 'app')
  }
}
