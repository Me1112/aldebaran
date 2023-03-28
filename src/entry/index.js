import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import 'babel-polyfill'
import configureStore from '../store/configure_store'
import RouterMapping from '../router/root'
import { LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import 'moment/locale/zh-cn'

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <LocaleProvider locale={zhCN}>
      <RouterMapping />
    </LocaleProvider>
  </Provider>, document.getElementById('root'))
