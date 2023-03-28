import superagent from 'superagent'
import { getToken, setValue } from '../util'
import { SUCCESS } from './constant'

const methods = [
  'get',
  'head',
  'post',
  'put',
  'del',
  'options',
  'patch'
]

class _JFetch {
  constructor(opts) {
    this.opts = opts || {}
    // if (!this.opts.baseURI) {
    //   throw new Error('baseURI option is required')
    // }
    methods.forEach(method =>
      (this[method] = (path, { params, data, timeout = 60000 } = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](this.opts.baseURI + path)
        if (params) {
          request.query(params)
        }
        if (!this.opts.headers) {
          this.opts['headers'] = []
        }
        const token = getToken()
        if (token) {
          this.opts.headers['Authorization'] = `Bearer ${token}`
        }
        request.set(this.opts.headers)
        if (data) {
          request.send(data)
        }
        if (timeout) {
          request.timeout(timeout)
        }
        request.then(function (res) {
          // let token = getToken()
          // if (token) {
          //   setToken(token)
          // }
          let data = res.body
          let { actionStatus = '', content = {} } = data
          if (actionStatus === SUCCESS) {
            resolve(data || '')
          } else {
            const { numericErrorCode = -1 } = content
            if (numericErrorCode === 10401005) {
              setValue('error_token', token)
              setValue('error_info', JSON.stringify(data))
              window.location = '/login'
            } else if (Object.getOwnPropertyNames(content).length === 0) {
              data['content'] = { message: '操作失败，请稍后再试！' }
            } else if (typeof content === 'string') {
              data['content'] = { message: content }
            }
            reject(data || '')
          }
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      }))
    )
  }
}

const JFetch = _JFetch

export default JFetch
