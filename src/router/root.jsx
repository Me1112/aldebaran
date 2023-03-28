import React from 'react'
import { Router, Route, Switch } from 'react-router-dom'
import Loadable from 'react-loadable'
import { createBrowserHistory as createHistory } from 'history'
import { LazyLoading } from '../util/index'

const history = createHistory()

const asyncApp = Loadable({
  loader: () => import('../container/app'/* webpackChunkName: 'app' */),
  loading: LazyLoading
})

const asyncLogin = Loadable({
  loader: () => import('../view/login'/* webpackChunkName: 'login' */),
  loading: LazyLoading
})

class RouteMapping extends React.Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route path="/login" exact component={asyncLogin} />
          <Route component={asyncApp} />
        </Switch>
      </Router>
    )
    // 说明
    // empty Route
    // https://github.com/ReactTraining/react-router/issues/1982  解决人：PFight
    // 解决react-router v4改变查询参数并不会刷新或者说重载组件的问题
  }
}

export default RouteMapping
