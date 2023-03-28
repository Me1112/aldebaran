import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Input, Table, Modal, Form, notification, Row, Select } from 'antd'
import {
  SUCCESS
} from '../../../common/constant'
import {
  getAppList,
  deleteApp,
  updateApp,
  saveApp
} from '../../../action/system'
import { Map } from 'immutable'
import { buildUrlParamNew, formatDate } from '../../../util/index'
import { getUserInfo, decisionModalError } from '../../../util'
import './index.less'
import LayoutRight from '../../../component/layout_right'
import { getBusinessListNoNormal, dependenciesApp } from '../../../action/rule'

const confirm = Modal.confirm
const { Option } = Select
const { Item: FormItem } = Form

function mapStateToProps(state) {
  const { system = Map({}), rule = Map({}) } = state
  const { appContent = {} } = system.toJS()
  const { businessLine = [] } = rule.toJS()
  return { appContent, businessLine }
}

function mapDispatchToProps(dispatch) {
  return {
    getAppList: bindActionCreators(getAppList, dispatch),
    deleteApp: bindActionCreators(deleteApp, dispatch),
    updateApp: bindActionCreators(updateApp, dispatch),
    saveApp: bindActionCreators(saveApp, dispatch),
    getBusinessListNoNormal: bindActionCreators(getBusinessListNoNormal, dispatch)
  }
}

const AppForm = Form.create()(
  class aForm extends Component {
    static propTypes = {
      form: PropTypes.any,
      businessLine: PropTypes.any,
      visible: PropTypes.bool.isRequired,
      confirmLoading: PropTypes.bool.isRequired,
      accessInfo: PropTypes.object.isRequired,
      accessError: PropTypes.string.isRequired,
      onCancel: PropTypes.func.isRequired,
      onSave: PropTypes.func.isRequired
    }

    render() {
      const { confirmLoading = false, form, accessInfo, visible, accessError, onCancel, onSave, businessLine = [] } = this.props
      const { appName = '', appIdentification = '', businessLineId } = accessInfo
      const { getFieldProps } = form
      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      }

      return (
        <Modal
          title={`${appName.length > 0 ? '编辑' : '新建'}应用`}
          wrapClassName="edit-confirm-modal"
          visible={visible}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={onCancel}
          confirmLoading={confirmLoading}
          onOk={onSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="应用名称">
              <Input {...getFieldProps('appName', {
                initialValue: appName,
                validate: [{
                  rules: [
                    { required: true, whitespace: true, pattern: /^.{1,50}$/, message: '1-50个字符' }
                  ]
                }]
              })} placeholder="1-50个字符" maxLength="50" />
            </FormItem>
            <FormItem {...formItemLayout} label="应用编码">
              <Input {...getFieldProps('appIdentification', {
                initialValue: appIdentification,
                validate: [{
                  rules: [
                    { required: true, whitespace: true, pattern: /^.{1,50}$/, message: '1-50个字符' }
                  ]
                }]
              })} placeholder="1-50个字符" maxLength="50"
                     disabled={appName.length > 0} />
            </FormItem>
            <FormItem {...formItemLayout} label="业务条线">
              <Select disabled={appName.length > 0} {...getFieldProps('businessLineId', {
                initialValue: businessLineId,
                validate: [{
                  rules: [
                    { required: true, message: '请选择业务条线' }
                  ]
                }]
              })} placeholder="请选择">
                {
                  businessLine.map(item => {
                    return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
                  })
                }
              </Select>
            </FormItem>
            <Row className="save-error">{accessError}</Row>
          </Form>
        </Modal>
      )
    }
  }
)

class AccessList extends Component {
  state = {
    tab: 0,
    record: {},
    appIdentificationVal: '',
    appInfo: {},
    deleteConfirmShow: false,
    editConfirmShow: false,
    accessError: '',
    editConfirmShowX: false
  }

  static propTypes = {
    getAppList: PropTypes.func.isRequired,
    deleteApp: PropTypes.func.isRequired,
    updateApp: PropTypes.func.isRequired,
    saveApp: PropTypes.func.isRequired,
    getBusinessListNoNormal: PropTypes.func.isRequired,
    businessLine: PropTypes.any,
    appContent: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.onAccessQuery()
    this.props.getBusinessListNoNormal()
  }

  render() {
    const { loading = false, appInfo, editConfirmShow, accessError, appIdentificationVal } = this.state
    const { appContent } = this.props

    const appList = appContent.result || []
    appList.forEach((s, index) => {
      const { appId } = s
      s.key = appId
      appList[index] = s
    })
    const appColumns = [
      {
        title: '应用名称',
        dataIndex: 'appName',
        key: 'appName',
        width: '15%',
        render: (text) => {
          return <div className="text-overflow" title={text}>{text}</div>
        }
      }, {
        title: '应用编码',
        dataIndex: 'appIdentification',
        key: 'appIdentification',
        width: '15%',
        render: (text) => {
          return <div className="text-overflow" title={text}>{text}</div>
        }
      }, {
        title: '业务条线',
        dataIndex: 'businessLineName',
        key: 'businessLineName',
        width: 150,
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        render: (text) => {
          return formatDate(text)
        },
        width: 200
      }, {
        title: '更新人',
        dataIndex: 'updatedBy',
        key: 'updatedBy',
        width: 200,
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 100,
        render: (text, record) => {
          return <Fragment>
            <span className="operation-span" onClick={() => {
              this.onEditIconClick(record)
            }}>编辑</span>
            <span className="operation-span" onClick={() => {
              this.onDeleteIconClick(record)
            }}>删除</span>
          </Fragment>
        }
      }]

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Input value={appIdentificationVal} placeholder="应用编码" style={{ width: 200 }}
                 onChange={(e) => this.onInputChange(e, 'appIdentificationVal')} />
          <Button type="primary" onClick={this.onAccessQuery}>查询</Button>
          <Button type="primary" style={{ float: 'right' }}
                  onClick={this.onCreateBtnClick}>新建</Button>
        </div>
        <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
          <Table rowkey="ruleId" className="table-layout-fixed" columns={appColumns} dataSource={appList}
                 locale={{ emptyText: '暂无数据' }}
                 pagination={{
                   showTotal: (total) => {
                     return `共 ${total} 条`
                   },
                   showSizeChanger: true
                 }} />
        </div>
        <AppForm wrappedComponentRef={form => (this.appForm = form)}
                 visible={editConfirmShow}
                 accessInfo={appInfo}
                 accessError={accessError}
                 onCancel={this.onEditCancel}
                 onSave={this.onAccessSave}
                 businessLine={this.props.businessLine}
                 confirmLoading={loading}
        />
      </LayoutRight>
    )
  }

  onAccessQuery = () => {
    const { appIdentificationVal } = this.state
    this.props.getAppList({
      appIdentification: appIdentificationVal
    })
  }

  onInputChange = (e, field) => {
    this.setState({
      [field]: e.target.value
    })
  }

  onEditIconClick = (record) => {
    const refs = this.getRefs()
    const { info, editShow, xForm } = refs
    dependenciesApp(buildUrlParamNew({ id: record.appId })).then(res => {
      const { content = [] } = res
      if (content.length === 0) {
        this.setState({
          [info]: record,
          [editShow]: true
        }, () => {
          xForm.props.form.resetFields()
          xForm.props.form.validateFields()
        })
      } else {
        decisionModalError(content)
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onDeleteIconClick = (record) => {
    dependenciesApp(buildUrlParamNew({ id: record.appId })).then(res => {
      const { content = [] } = res
      if (content.length === 0) {
        confirm({
          title: '是否确认删除?',
          content: '',
          okText: '确定',
          okType: 'primary',
          cancelText: '取消',
          onOk: async () => {
            this.onAccessDelete()
          }
        })
        this.setState({
          record
        })
      } else {
        decisionModalError(content)
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onAccessDelete = async () => {
    const { appId } = this.state.record
    const { promise } = await this.props.deleteApp({ appId })
    promise.then((data) => {
      const { actionStatus = '' } = data
      if (actionStatus === SUCCESS) {
        this.setState({
          deleteConfirmShow: false
        }, () => {
          this.onAccessQuery()
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onCreateBtnClick = () => {
    const refs = this.getRefs()
    const { info, editShow, xForm } = refs

    const { tab } = this.state

    this.setState({
      [info]: tab === 0 ? { managePassword: '' } : {},
      [editShow]: true,
      accessError: ''
    }, () => {
      xForm.props.form.resetFields()
    })
  }

  onEditCancel = () => {
    const refs = this.getRefs()
    const { info, editShow, xForm } = refs

    this.setState({
      [info]: {},
      [editShow]: false,
      accessError: ''
    }, () => {
      xForm.props.form.resetFields()
      this.onAccessQuery()
    })
  }

  onAccessSave = () => {
    const refs = this.getRefs()
    const { xForm } = refs

    xForm.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      const now = new Date().getTime()
      const { userId: createId } = getUserInfo()
      const { tab, appInfo } = this.state
      try {
        const { appName: appNameX = '', appId } = appInfo
        const { appName = '', appIdentification = '', businessLineId } = xForm.props.form.getFieldsValue()
        this.setState({ loading: true })

        // TODO: 待王超改好saveApp/updateApp接口后验证
        const { promise } = await (appNameX.length > 0 ? this.props.updateApp({
          tab,
          appId,
          appName,
          // companyId,
          // secretKey,
          businessLineId,
          updateTime: now,
          modifyId: createId
        }) : this.props.saveApp({
          tab,
          appName,
          appIdentification,
          // companyId,
          // secretKey,
          createTime: now,
          businessLineId,
          createId
        }))

        promise.then((data) => {
          const { actionStatus = '' } = data
          if (actionStatus === SUCCESS) {
            this.setState({ editConfirmShow: false, loading: false }, () => {
              this.onAccessQuery()
            })
          }
        }).catch((data) => {
          const { content = {} } = data
          const { message = '' } = content
          this.setState({ loading: false, accessError: message })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }

  getRefs = () => {
    return {
      info: 'appInfo',
      editShow: 'editConfirmShow',
      xForm: this.appForm
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AccessList)
