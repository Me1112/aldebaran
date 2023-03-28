import React, { Fragment } from 'react'
import moment from 'moment'
import { Modal, Table } from 'antd'

export const RangePickerRanges = {
  TODAY: [moment(), moment()],
  YESTERDAY: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
  LAST_7: [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
  LAST_30: [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
  LAST_60: [moment().subtract(60, 'days'), moment().subtract(1, 'days')],
  LAST_90: [moment().subtract(90, 'days'), moment().subtract(1, 'days')]
}

export const DAYS = {
  TODAY: '今日',
  YESTERDAY: '昨日',
  LAST_7: '近七天',
  LAST_30: '近三十天'
}

Date.prototype.format = function (fmt) {
  let o = {
    'Y+': this.getFullYear(),
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours() % 12 === 0 ? 12 : this.getHours() % 12,
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    'S': this.getMilliseconds()
  }
  let week = {
    '0': '星期日',
    '1': '星期一',
    '2': '星期二',
    '3': '星期三',
    '4': '星期四',
    '5': '星期五',
    '6': '星期六'
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '')
      .substr(4 - RegExp.$1.length))
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f'
          : '/u5468')
        : '') + week[this.getDay() + ''])
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k])
        : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

export function formatDate(timestamp, format = 'yyyy-MM-dd HH:mm:ss') {
  if (!timestamp) {
    return ''
  }
  let date = new Date(timestamp)
  return date.format(format)
}

export function timeDistance(distance) {
  let dis = distance / 1000
  let days = parseInt(dis / (24 * 60 * 60))
  let hours = parseInt((dis - days * 24 * 60 * 60) / 3600)
  let minutes = parseInt((dis - days * 24 * 60 * 60 - hours * 3600) / 60)

  return days + '天 (' + hours + '小时' + minutes + '分)'
}

export function isPromise(value) {
  if (value !== null && typeof value === 'object') {
    return value.promise && typeof value.promise.then === 'function'
  }
}

export function throttle(method, context) {
  clearTimeout(method.timedOutId)
  method.timedOutId = setTimeout(function () {
    method.call(context)
  }, 300)
}

export function clear() {
  const token = getValue('error_token')
  const info = getValue('error_info')
  window.localStorage.clear()
  if (token) {
    setValue('error_token', token)
    setValue('error_info', info)
  }
}

export function logout() {
  clear()
  window.location.href = '/login'
}

export function setUserInfo(info) {
  window.localStorage.setItem('cci_aldebaran_login_user_info', JSON.stringify(info))
}

export function getUserInfo() {
  let info = window.localStorage.getItem('cci_aldebaran_login_user_info')
  return info ? JSON.parse(info) : {}
}

export function getUserName() {
  const info = getUserInfo()
  const { loginName = '' } = info
  return loginName
}

export function getCompanyName() {
  const info = getUserInfo()
  const { companyName = '' } = info
  return companyName
}

export function getCompanyLogo() {
  const info = getUserInfo()
  const { companyLogo = '' } = info
  return companyLogo
}

export function isLeakageReportUser() {
  const menu = getUserMenu() || []
  if (menu.length === 1) {
    const { children = [] } = menu[0]
    const [{ children: [{ id } = {}] = [] }] = children
    return id === 804
  }
  return false
}

export function setUserNameAndToken(token, username) {
  setValue('cci_login_token', token)
  setValue('cci_login_username', username)
}

export function setToken(value) {
  setValue('cci_login_token', value)
}

export function getUserMenu() {
  try {
    return JSON.parse(getValue('cci_user_menu'))
  } catch (e) {
    throw new Error('JSON 格式错误')
  }
}

export function getUserPermissions() {
  try {
    return JSON.parse(getValue('cci_user_permissions'))
  } catch (e) {
    throw new Error('JSON 格式错误')
  }
}

export function setUserPermissions(value) {
  try {
    setValue('cci_user_permissions', JSON.stringify(value))
  } catch (e) {
    throw new Error('JSON 格式错误')
  }
}

export function setUserMenu(value) {
  try {
    setValue('cci_user_menu', JSON.stringify(value))
  } catch (e) {
    throw new Error('JSON 格式错误')
  }
}

export function isEmpty(val) {
  return (
    val === undefined ||
    val === null ||
    val === false ||
    val.length <= 0 || (typeof val === 'object' && !Object.getOwnPropertySymbols(val).length && !Object.getOwnPropertyNames(val).length)
  )
}

export function getToken() {
  const info = getUserInfo()
  const { token = '' } = info
  return token
}

export function setValue(key, value) {
  window.localStorage.setItem(key, value)
}

export function getValue(key) {
  return window.localStorage.getItem(key)
}

export function buildUrlParam(param = {}) {
  let url = []
  for (let p in param) {
    if (param[p] && param[p].length > 0) {
      url.push(encodeURIComponent(p) + '=' + encodeURIComponent(param[p]))
    }
  }
  return url.join('&')
}

export function buildUrlParamNew(param = {}) {
  let url = []
  for (let p in param) {
    const value = param[p]
    if (value || value === 0) {
      url.push(encodeURIComponent(p) + '=' + encodeURIComponent(value))
    }
  }
  return url.join('&')
}

export function buildUrlParamOnlyCheckNullOrUnder(param = {}) {
  let url = []
  for (let p in param) {
    const value = param[p]
    if (value !== undefined && value !== null) {
      url.push(encodeURIComponent(p) + '=' + encodeURIComponent(value))
    }
  }
  return url.join('&')
}

export const LazyLoading = (props) => {
  /* eslint-disable react/prop-types */
  const { isLoading, error } = props
  console.log(props)
  // Handle the loading state
  if (isLoading) {
    console.log('MyLoadingComponent=====>', isLoading)
    return null
  } else if (error) {
    console.log('error', error)
    return <div>Sorry, there was a problem loading the page.</div>
  } else {
    console.log('null')
    return null
  }
}

export function getCursorPosition(input) {
  const { selectionStart, selectionEnd } = input
  return { selectionStart, selectionEnd }
  // update the value with our text inserted
  // input.value = value.slice(0, start) + textToInsert + value.slice(end)
  // update cursor to be at the end of insertion
  // input.selectionStart = input.selectionEnd = start + textToInsert.length
}

export function convertTreeData(jsontree, children, callback, deep = 0) {
  if ((typeof jsontree === 'object') && (jsontree.constructor === Object.prototype.constructor)) {
    var arrey = []
    arrey.push(jsontree)
  } else {
    arrey = jsontree
  }
  for (var i = 0; i < arrey.length; i++) {
    var jn = arrey[i]
    // 找到节点,执行相应代码
    if (callback) callback(jn, deep)
    // 遍历节点,执行相应代码
    if (jn[children] && jn[children].length > 0) {
      convertTreeData(jn[children], children, callback, deep + 1)
    }
  }
}

export function initFieldListData(content, eachJudge = {}) {
  const { onlyClassification = false, notNeedField = false } = eachJudge
  let fieldList = []
  if (!onlyClassification) {
    content.forEach(item => {
      fieldList.push(item)
      if (item.generatedFieldList && !notNeedField) {
        item.generatedFieldList.forEach(list => {
          list.fieldName = list.code
          list.fieldDisplayName = list.name
          list.dataType = list.fieldType
          // list.dimensionalityId = item.dimensionalityId
          // list.dimensionalityName = item.dimensionalityName
          fieldList.push(list)
        })
      }
    })
  } else {
    fieldList = content
  }
  let fieldListObj = {}
  fieldList.forEach(item => {
    const { fieldDataCategory } = item
    if (!fieldListObj[fieldDataCategory]) {
      let name = '字段类型'
      switch (fieldDataCategory) {
        case 'FIELD':
          name = '字段类型'
          break
        case 'FACTOR':
          name = '指标类型'
          break
      }
      fieldListObj[fieldDataCategory] = {
        name,
        fieldDataCategory,
        list: []
      }
    }
    fieldListObj[fieldDataCategory].list.push(item)
  })
  return {
    tree: Object.values(fieldListObj),
    list: fieldList
  }
}

export const FieldDataTypeMap = {
  decimal: '数值型',
  string: '字符串',
  boolean: '布尔型',
  date: '日期',
  enum: '枚举型',
  'list': '字符列表'
}
export const FieldDataTypeMapNAE = {
  DECIMAL: '数值型',
  STRING: '字符串',
  BOOLEAN: '布尔型',
  DATETIME: '日期',
  ENUM: '枚举型',
  LIST: '字符列表'
}

export const decisionModalError = (content, nameMap, {
  title = '该策略正在被以下组件使用，无法进行此操作，请取消后重试。',
  ellipsis = false
} = {}) => {
  let map = {}
  content.forEach(item => {
    const { dependencePath, dependenceType } = item
    if (!map[dependenceType]) {
      map[dependenceType] = {
        type: dependenceType,
        list: []
      }
    }
    map[dependenceType].list.push(dependencePath)
  })
  let nameMapError = {
    ExternalAccess: '外部接入',
    RuleSet: '规则集',
    Factor: '指标',
    ScoreCard: '评分卡',
    DecisionTree: '决策树',
    DecisionStream: '决策流'
  }
  if (typeof nameMap === 'object') {
    nameMapError = nameMap
  }
  Modal.error({
    width: 600,
    title,
    content: <React.Fragment>
      {
        Object.keys(map).map((key) => {
          return <div key={key}>
            <div>{nameMapError[key]}</div>
            <div style={{ paddingLeft: '20px' }}>
              {
                map[key].list.map((item, index) => {
                  return <div key={index}>{index + 1}、{item}</div>
                })
              }
            </div>
          </div>
        })
      }
      {
        ellipsis && '...'
      }
    </React.Fragment>
  })
}

export function convertTreeSelectData(data = [], disableParent = false) {
  return data.map((d, index) => {
    const { children = [], id = '', departmentName: name = '' } = d
    let treeData = { title: name, label: name, value: `${id}`, key: `${id}-${index}` }
    if (children.length > 0) {
      treeData.disabled = disableParent
      treeData.children = convertTreeSelectData(children, disableParent)
    }
    return treeData
  })
}

export function formatNumber(number = 0) {
  if (typeof number !== 'number') {
    return number
  }
  const { parseInt } = Number
  const negative = number < 0
  number = Math.abs(number)
  if (number >= 1000000000) {
    number = parseInt(number / 10000000).toLocaleString() + '千万'
  } else if (number >= 100000) {
    number = parseInt(number / 10000).toLocaleString() + '万'
  } else {
    number = number.toLocaleString()
  }
  return negative ? `-${number}` : number
}

export function noop() {

}

export function formatNumber2(number = 0, { precision = null, simple = true, defaultUnit = '元' } = {}) {
  if (typeof number !== 'number') {
    return number
  }
  const { parseFloat } = Number
  const { pow, round } = Math
  const negative = number < 0
  number = Math.abs(number)
  let unit = ''
  const hasPrecision = precision !== null
  if (number >= 10000000) {
    unit = '千万'
    if (hasPrecision) {
      const multiple = pow(10, precision)
      number = round(number / (10000000 / multiple)) / multiple
    } else {
      number = number / 10000000
    }
    number = parseFloat(number)
  } else if (number >= 10000) {
    unit = '万'
    if (hasPrecision) {
      const multiple = pow(10, precision)
      number = round(number / (10000 / multiple)) / multiple
    } else {
      number = number / 10000
    }
    number = parseFloat(number)
  }
  number = number.toLocaleString()
  if (simple) {
    return negative ? `-${number}${unit}` : `${number}${unit}`
  }
  return { number: negative ? `-${number}` : `${number}`, unit: unit || defaultUnit }
}

export function toThousands(num) {
  if (typeof num !== 'number') {
    return num
  }
  let operator = ''
  num = `${num || 0}`
  if (['+', '-'].indexOf(num[0]) !== -1) {
    operator = num[0]
    num = num.substring(1)
  }
  let points = ''
  const numbers = num.split('.')
  if (numbers.length === 2) {
    num = numbers[0]
    points = numbers[1]
  }
  let result = ''
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result
    num = num.slice(0, num.length - 3)
  }
  if (num) {
    result = operator + num + result
  }
  if (points.length > 0) {
    result = `${result}.${points}`
  }
  return result
}

export const antiModalError = (rows = [], {
  title = '操作错误，请重新操作！'
} = {}) => {
  const errorCodes = {
    DP_ERROR: '已被规则引用',
    LOGIC_ERROR: '字段引用逻辑错误'
  }
  const columns = [
    {
      title: '因子模板名称',
      dataIndex: 'templateName',
      key: 'templateName',
      onCell: (record) => {
        const { templateName } = record
        return { title: templateName }
      },
      render: (text) => {
        return <div className="shown-all">{text}</div>
      }
    }, {
      title: '错误原因',
      dataIndex: 'errorReason',
      key: 'errorReason',
      width: 140,
      render: (text) => {
        return <div className="shown-all error-reason">{errorCodes[text] || text}</div>
      }
    }
  ]
  const dataSource = rows.map((row, index) => {
    return { ...row, key: index }
  })
  Modal.error({
    width: 600,
    title,
    content: <Fragment>
      <span className="error-label">错误提示:</span>
      <Table className="ellipsis" size="small" bordered columns={columns} dataSource={dataSource}
             pagination={false} />
    </Fragment>
  })
}

export function calTextWith(text, {
  canvas = document.createElement('canvas'),
  fontWeight = 400,
  fontSize = 12,
  fontStyle = `normal normal ${fontWeight} ${fontSize}px/1.5 "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
} = {}) {
  const context = canvas.getContext('2d')
  context.font = fontStyle // 设置字体样式
  const { width } = context.measureText(text)
  return width
}
