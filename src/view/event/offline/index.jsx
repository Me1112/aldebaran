import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Tabs, Input, Form, Row, Select, Button, notification } from 'antd'
import classnames from 'classnames'
import { Link } from 'react-router-dom'
import { EVENT_OFFLINE } from '../../../common/event_constant'
import {
  getAppSelect,
  getSceneSelect
} from '../../../action/rule'
import {
  uploadOffline,
  uploadOfflineStatus,
  downloadCheck
} from '../../../action/event'
import { buildUrlParam } from '../../../util'
import { Map } from 'immutable'
import { SUCCESS } from '../../../common/constant'
import './index.less'

const { TabPane } = Tabs
const { Option } = Select

function mapStateToProps(state) {
  const { rule = Map({}) } = state
  const { appSelect = [], sceneSelect = [] } = rule.toJS()
  return { appSelect, sceneSelect }
}

function mapDispatchToProps(dispatch) {
  return {
    getAppSelect: bindActionCreators(getAppSelect, dispatch),
    getSceneSelect: bindActionCreators(getSceneSelect, dispatch),
    uploadOffline: bindActionCreators(uploadOffline, dispatch),
    uploadOfflineStatus: bindActionCreators(uploadOfflineStatus, dispatch),
    downloadCheck: bindActionCreators(downloadCheck, dispatch)
  }
}

class RuleList extends Component {
  state = {
    appVal: undefined,
    sceneVal: undefined,
    submitShow: false,
    file: {},
    filePath: '',

    appEmpty: false,
    sceneEmpty: false,
    uploadLoading: false,
    emptyError: ''
  }

  static propTypes = {
    getAppSelect: PropTypes.func.isRequired,
    getSceneSelect: PropTypes.func.isRequired,
    uploadOffline: PropTypes.func.isRequired,
    downloadCheck: PropTypes.func.isRequired,
    uploadOfflineStatus: PropTypes.func.isRequired,

    appSelect: PropTypes.array,
    sceneSelect: PropTypes.array
  }

  componentDidMount() {
    this.props.getAppSelect()
    this.props.getSceneSelect()
  }

  render() {
    const { appVal, sceneVal, submitShow, filePath, appEmpty, sceneEmpty, emptyError, uploadLoading } = this.state
    const { appSelect = [], sceneSelect = [] } = this.props

    return (
      <Tabs type="card">
        <TabPane tab="线下事件" key={EVENT_OFFLINE}>
          <div className="region-zd">
            <Row>
              <Select value={appVal} placeholder="请选择应用" style={{ width: 200 }}
                      onChange={this.appChange} allowClear
                      className={classnames({ 'select-empty': appEmpty })}>
                {
                  appSelect.map(app => {
                    const { appId, appName } = app
                    return (
                      <Option key={appId} value={appId.toString()}>{appName}</Option>
                    )
                  })
                }
              </Select>
              <Select value={sceneVal} placeholder="请选择场景" style={{ width: 200 }}
                      onChange={this.sceneChange} allowClear
                      className={classnames({ 'select-empty': sceneEmpty })}>
                {
                  sceneSelect.map(scene => {
                    const { scenarioValue, scenarioName } = scene
                    return (
                      <Option key={scenarioValue} value={scenarioValue.toString()}>{scenarioName}</Option>
                    )
                  })
                }
              </Select>

              <Input readOnly placeholder="上传线下事件" defaultValue={filePath}
                     style={{ width: 200, margin: 10 }}
                     onClick={this.onFileSelect} />
              <Button type="primary" onClick={this.onFileSelect}>浏览</Button>
              {submitShow
                ? <Button type="primary" loading={uploadLoading} onClick={this.uploadEventExcel}>保存</Button>
                : null}
              <form ref="file-up-form" style={{ display: 'none' }}
                    encType="multipart/form-data">
                <input id="file" name="file" ref="upload-input" type="file"
                       onChange={this.uploadChange} />
              </form>
              <span style={{ color: '#FF6C00', cursor: 'pointer' }}
                    onClick={this.onDownloadClick}>下载模版</span>
            </Row>
            <span style={{ color: '#ff2426' }}>{emptyError}</span>
          </div>
          <Row className="service-container">
            <span>线下事件上传后，你可以进入事件【事件管理】－>【<Link to="/event/list">事件查询</Link>】页面查看</span>
          </Row>
        </TabPane>
      </Tabs>
    )
  }

  appChange = (value) => {
    this.setState({ appVal: value })
  }

  sceneChange = (value) => {
    this.setState({ sceneVal: value })
  }

  onFileSelect = () => {
    this.refs['upload-input'].click()
  }

  uploadChange = (e) => {
    const regex = /(.xls)|(.xlsx)$/
    if (!regex.test(e.target.value)) {
      notification.warn({ message: '请选择excel文档' })
    } else {
      const file = e.target.files[0]
      const filePath = e.target.value
      this.setState({ submitShow: true, file, filePath })
    }
  }

  uploadEventExcel = () => {
    if (this.checkSelect()) {
      this.setState({ uploadLoading: true }, async () => {
        const { file, appVal, sceneVal } = this.state
        const { name = '' } = file
        const formData = new window.FormData()
        formData.append('appId', appVal)
        formData.append('scenarioValue', sceneVal)
        formData.append('file', file, name)
        const { promise } = await this.props.uploadOffline(formData)
        promise.then((data) => {
          notification.success({ duration: 2.5, message: '线下事件上传中' })
          this.refs['upload-input'].value = null
          this.timer = setInterval(async () => {
            const { promise } = await this.props.uploadOfflineStatus({})
            promise.then((data) => {
              const { content = {} } = data
              const { excelStatus } = content
              if (excelStatus === 'done') {
                clearInterval(this.timer)
                this.setState({
                  uploadLoading: false,
                  submitShow: false,
                  file: {},
                  filePath: ''
                }, () => {
                  notification.success({ duration: 2.5, message: '线下事件上传成功' })
                })
              }
            }).catch((data) => {
              clearInterval(this.timer)
              const { content = {} } = data
              notification.warn(content)
            })
          }, 2000)
        }).catch((data) => {
          const { content = {} } = data
          this.setState({ uploadLoading: false }, () => {
            this.refs['upload-input'].value = null
            notification.warning({ duration: 2.5, ...content })
          })
        })
      })
    }
  }

  checkSelect = () => {
    let doContinue = true
    let emptyError = ''
    const { appVal = '', sceneVal = '' } = this.state
    const appEmpty = appVal === ''
    const sceneEmpty = sceneVal === ''
    if (appEmpty || sceneEmpty) {
      doContinue = false
      if (appEmpty && sceneEmpty) {
        emptyError = '请选择应用和场景'
      }
      if (appEmpty && !sceneEmpty) {
        emptyError = '请选择应用'
      }
      if (!appEmpty && sceneEmpty) {
        emptyError = '请选择场景'
      }
    }
    this.setState({
      appEmpty,
      sceneEmpty,
      emptyError
    })
    return doContinue
  }

  onDownloadClick = async () => {
    if (this.checkSelect()) {
      const { appVal, sceneVal } = this.state
      const params = { appId: appVal, scenarioValue: sceneVal }
      if (!!appVal && !!sceneVal) {
        const { promise } = await this.props.downloadCheck(params)
        promise.then((data) => {
          const { actionStatus = '' } = data
          if (actionStatus === SUCCESS) {
            window.location.href = `/dms/event/event/downEventTemplate.do?${buildUrlParam(params)}`
          }
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(RuleList))
