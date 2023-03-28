import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Input, Table, Switch, Button, Modal, notification, Select, Form, Row } from 'antd'
import {
  DECISION_STRATEGY_NEW_BASICINFO,
  DECISION_STRATEGY_NEW_CONFIG
} from '../../../common/decision_constant'
import {
  getDecisionStrategyFlowList,
  copyDecisionStrategyFlow,
  delDecisionStrategyFlowItem,
  setDecisionFlowActive,
  decisionStreamDependencies,
  setOnOffLine
} from '../../../action/decision'
import { buildUrlParamNew, formatDate, decisionModalError } from '../../../util'
import { SUCCESS } from '../../../common/constant'
import LayoutRight from '../../../component/layout_right'
import { Map } from 'immutable'
import { bindActionCreators } from 'redux'
import { getBusinessList } from '../../../action/rule'
import connect from 'react-redux/es/connect/connect'
import { STRATEGY_STATUS } from '../../../common/case'

const { confirm } = Modal
const Option = Select.Option
const { Item: FormItem } = Form

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
}

function mapStateToProps(state) {
  const { rule = Map({}) } = state
  const { businessLine = [] } = rule.toJS()
  return { businessLine }
}

function mapDispatchToProps(dispatch) {
  return {
    getBusinessList: bindActionCreators(getBusinessList, dispatch)
  }
}

@connect(mapStateToProps, mapDispatchToProps)
@Form.create()
export default class DecisionStrategy extends Component {
  constructor(props) {
    const { location = {} } = props
    const { state = {} } = location
    const { current = 1, pageSize = 10, ...other } = state
    super(props)
    this.state = {
      searchName: '',
      loading: false,
      dataSource: [],
      deleteConfirmShow: false,
      selectedRowKeys: [],
      noticeInfo: {
        id: '',
        noticeVisible: false,
        noticeContent: '',
        operation: ''
      },
      pagination: {
        current,
        pageSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      ...other
    }
  }

  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.object.isRequired,
    location: PropTypes.object,
    businessLine: PropTypes.any.isRequired,
    getBusinessList: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { pagination } = this.state
    const { current } = pagination
    this.realParam = { ...this.state }
    this.queryList(current)
    this.props.getBusinessList()
  }

  render() {
    const { pagination, searchName, noticeInfo, dataSource, selectBusinessId, copyVisible = false, copyRecord: { name = '' } = {} } = this.state
    const { noticeVisible, noticeContent } = noticeInfo
    const { form, businessLine = [] } = this.props
    const { getFieldProps } = form
    const colums = [
      {
        title: '决策流编码',
        dataIndex: 'strategyCode',
        key: 'strategyCode',
        width: 300
      },
      {
        title: '决策流名称',
        dataIndex: 'name',
        key: 'name',
        width: 300,
        render: (text, record) => {
          return (<div style={{ maxWidth: 250 }} title={text} className="text-overflow">{text}</div>)
        }
      },
      {
        title: '业务条线',
        dataIndex: 'businessLineName',
        key: 'businessLineName',
        width: 100
      },
      {
        title: '资源节点数',
        dataIndex: 'nodeCount',
        key: 'nodeCount'
      },
      {
        title: '激活',
        dataIndex: 'activeStatus',
        key: 'activeStatus',
        width: 150,
        render: (text, record) => {
          const { strategyStatus, SwitchLoading } = record
          return (
            <Switch style={{ width: 55 }} loading={SwitchLoading} checked={strategyStatus !== 'EDITING'}
                    defaultChecked={false} checkedChildren="ON"
                    onChange={() => {
                      this.activeChange(record)
                    }} unCheckedChildren="OFF" />
          )
        }
      },
      {
        title: '状态',
        dataIndex: 'strategyStatus',
        key: 'strategyStatus',
        render: (text) => {
          return this.getStrategyStatusText(text)
        }
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 230,
        render: (text, record) => {
          return (<span>{formatDate(text)}</span>)
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 100,
        render: (text, record) => {
          const { strategyStatus: status, id } = record
          const isEditing = status === 'EDITING'
          const isActive = status === 'ACTIVE'
          const isOnline = status === 'ONLINE'
          return <Fragment>
            {
              isEditing ? <span className="operation-span" onClick={() => {
                this.newStrategyClick(DECISION_STRATEGY_NEW_CONFIG, record)
              }}>编辑</span> : <span className="operation-span" onClick={() => this.view(record)}>查看</span>
            }
            {
              isEditing ? null : <span className="operation-span" onClick={() => this.confirmCopy(record)}>复制</span>
            }
            {
              isEditing ? <span className="operation-span" onClick={() => {
                confirm({
                  title: '是否确认删除?',
                  content: '',
                  okText: '确定',
                  okType: 'primary',
                  cancelText: '取消',
                  onOk: async () => {
                    this.onFlowDelete()
                  }
                })
                this.setState({
                  delId: id
                })
              }}>删除</span> : null
            }
            {
              isActive ? <span className="operation-span" onClick={() => {
                  this.onOfflineDecisionFlow({ id })
                }}>上线</span>
                : isOnline ? <span className="operation-span" onClick={() => {
                  this.onOfflineDecisionFlow({ id })
                }}>下线</span>
                : null
            }
          </Fragment>
        }
      }
    ]

    return <LayoutRight className="no-bread-crumb">
      <div className="region-zd">
        <Input placeholder="决策流名称/决策流编码" value={searchName} maxLength={'50'} onChange={this.nameChange}
               style={{ width: 200 }} />
        <Select placeholder="请选择业务条线" style={{ width: 200 }} allowClear value={selectBusinessId}
                onChange={this.selectBusiness}>
          {
            businessLine.map(item => {
              return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
            })
          }
        </Select>
        <Button type="primary" onClick={() => {
          this.realParam = { ...this.state }
          this.queryList(1)
        }} style={{ marginRight: '10px' }}>查询</Button>
        <div style={{ float: 'right' }}>
          <Button type="primary" onClick={this.newStrategyClick}>新建</Button>
        </div>
      </div>
      <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
        <Table rowkey="indicatorsID" dataSource={dataSource}
               columns={colums}
               pagination={pagination}
               onChange={this.handleChange}
               loading={this.state.loading} />
      </div>
      <Modal
        title="提示"
        visible={noticeVisible}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
        onCancel={this.cancelNoticeWindow}
        onOk={this.okNoticeWindow}
      >
        {noticeContent}
      </Modal>
      <Modal
        title="决策流复制"
        visible={copyVisible}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
        onCancel={this.copyCancel}
        onOk={this.copyStrategyFlow}
      >
        <Form>
          <Row className="form-row-item">
            <FormItem {...formItemLayout} label="决策流名称">
              <Input {...getFieldProps('name', {
                initialValue: name,
                validate: [{
                  rules: [
                    { required: true, whitespace: true, message: '最多50个字符' }
                  ]
                }]
              })} placeholder="最多50个字符" maxLength="50" />
            </FormItem>
          </Row>
        </Form>
      </Modal>
    </LayoutRight>
  }

  view = record => {
    const { searchName, pagination, selectBusinessId } = this.realParam
    const { pageSize, current } = pagination
    const state = {
      tabKey: DECISION_STRATEGY_NEW_CONFIG,
      searchName,
      selectBusinessId,
      pageSize,
      current,
      isView: true,
      ...record
    }
    this.props.history.push({ pathname: '/policy/bazaar/strategy-flow/new', state })
  }

  getStrategyStatusText = strategyStatus => {
    return STRATEGY_STATUS[strategyStatus]
  }

  selectBusiness = e => {
    this.setState({ selectBusinessId: e })
  }
  onOfflineDecisionFlow = (data) => {
    const { UpLoading } = this.state
    if (UpLoading) {
      return
    }
    try {
      const { id } = data
      decisionStreamDependencies(buildUrlParamNew({ id })).then(res => {
        let { content = [] } = res
        if (content.length > 0) {
          decisionModalError(content)
        } else {
          setOnOffLine(data).then((data) => {
            const { pagination } = this.state
            const { current = 1 } = pagination
            this.queryList(current)
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        }
      })
    } catch (err) {
    }
  }

  copyCancel = () => {
    this.setState({
      copyVisible: false,
      copyRecord: {}
    }, () => {
      this.props.form.resetFields()
    })
  }

  confirmCopy = record => {
    this.setState({
      copyVisible: true,
      copyRecord: record
    }, () => {
      this.props.form.resetFields()
    })
  }

  okNoticeWindow = async () => {
    const { noticeInfo } = this.state
    const { id, operation = '' } = noticeInfo
    switch (operation) {
      case 'DEL':
        try {
          const { promise } = await delDecisionStrategyFlowItem({ id })
          promise.then((data) => {
            const { actionStatus = '', content = {} } = data
            if (actionStatus === SUCCESS) {
              console.log(content)
              noticeInfo.id = ''
              noticeInfo.operation = ''
              noticeInfo.noticeVisible = false
              this.setState({ selectedRowKeys: [], noticeInfo }, () => {
                this.queryList()
              })
            }
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } catch (err) {
        }
        break
      case 'COPY':
        this.copyStrategyFlow()
        break
      default:
        noticeInfo.noticeVisible = false
        this.setState({ noticeInfo })
    }
  }

  cancelNoticeWindow = () => {
    const { noticeInfo } = this.state
    noticeInfo.id = ''
    noticeInfo.operation = ''
    noticeInfo.noticeVisible = false
    this.setState({ noticeInfo })
  }

  copyStrategyFlow = () => {
    const { copyRecord: { id = '' } = {} } = this.state
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      try {
        let { name } = values
        const { promise } = copyDecisionStrategyFlow({ id, name })
        promise.then(() => {
          this.setState({
            copyVisible: false,
            copyRecord: {}
          }, () => {
            this.queryList()
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }

  activeChange = async (obj) => {
    const { id } = obj
    const data = {
      id
    }
    obj.SwitchLoading = true
    const { dataSource } = this.state
    dataSource.forEach(item => {
      if (item.id === id) {
        item = obj
      }
    })
    await this.setState({ dataSource })
    await setDecisionFlowActive(data).then(res => {
      notification['success']({
        message: '激活修改成功'
      })
      const { pagination } = this.state
      const { current = 1 } = pagination
      this.queryList(current)
    }).catch(err => {
      console.log(err)
      notification.warn({
        message: err.content.message
      })
      const { pagination } = this.state
      const { current = 1 } = pagination
      this.queryList(current)
    })
    obj.SwitchLoading = false
    const { dataSource: newData } = this.state
    newData.forEach(item => {
      if (item.id === id) {
        item = obj
      }
    })
    this.setState({ newData })
  }

  onFlowDelete = async (e) => {
    const id = this.state.delId
    const data = {
      id
    }
    await delDecisionStrategyFlowItem(data).then(res => {
      notification['success']({
        message: '删除成功'
      })
      const { pagination } = this.state
      const { current = 1 } = pagination
      this.queryList(current)
    }).catch(data => {
      console.log(data)
      const { content = {} } = data
      notification.warn(content)
    })
  }
  nameChange = (e) => {
    const value = e.target.value
    this.setState({ searchName: value })
  }

  newStrategyClick = (key, record) => {
    const { searchName, pagination, selectBusinessId } = this.realParam
    const { pageSize, current } = pagination
    const state = {
      tabKey: DECISION_STRATEGY_NEW_BASICINFO
    }
    if (typeof key === 'string') {
      state.tabKey = key
    }
    if (record) {
      Object.assign(state, { ...record, selectBusinessId, searchName, current, pageSize })
    }
    this.props.history.push({ pathname: '/policy/bazaar/strategy-flow/new', state })
  }
  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.queryList(pagination.current)
    })
  }
  queryList = (page = 1) => {
    const { searchName, pagination, selectBusinessId: businessLineId } = this.realParam
    const { pageSize } = pagination
    const data = {
      value: searchName,
      businessLineId,
      page,
      size: pageSize
    }
    this.getList(buildUrlParamNew(data))
  }
  getList = async (data) => {
    const { pagination } = this.state
    await getDecisionStrategyFlowList(data).then(res => {
      console.log(res)
      const { total, page } = res.content
      const dataSource = res.content.data.map(item => {
        item.key = item.id
        return item
      })
      pagination.total = total
      pagination.current = page
      this.setState({
        dataSource,
        pagination
      })
    }).catch(err => {
      console.log(err)
      notification.warn({
        message: '查询失败'
      })
    })
  }
}
