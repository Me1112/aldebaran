import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Input, Table, Switch, Button, Modal, notification, Select, Form, Row } from 'antd'
import {
  DECISION_STRATEGY_NEW_BASICINFO,
  DECISION_STRATEGY_NEW_CONFIG
} from '../../../common/decision_constant'
import {
  getDecisionStrategyList,
  delDecisionStrategyItem,
  setDecisionActive,
  onOfflineDecision,
  dependenciesTree,
  copyDecisionStrategyTree
} from '../../../action/decision'
import { buildUrlParamNew, decisionModalError, formatDate } from '../../../util'
import LayoutRight from '../../../component/layout_right'
import { Map } from 'immutable'
import { bindActionCreators } from 'redux'
import { getBusinessList } from '../../../action/rule'
import connect from 'react-redux/es/connect/connect'
import { STRATEGY_STATUS } from '../../../common/case'

const confirm = Modal.confirm
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
export default class DecisionStrategy extends React.Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const { decisionName, selectBusinessId, current = 1, pageSize = 10 } = state
    this.state = {
      decisionName,
      selectBusinessId,
      loading: false,
      dataSource: [],
      deleteConfirmShow: false,
      pagination: {
        current,
        pageSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      }
    }
  }

  static propTypes = {
    form: PropTypes.any,
    location: PropTypes.object,
    history: PropTypes.object.isRequired,
    businessLine: PropTypes.any.isRequired,
    getBusinessList: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.realParam = { ...this.state }
    this.queryList()
    this.props.getBusinessList()
  }

  render() {
    const { pagination, decisionName, selectBusinessId, copyVisible = false, copyRecord: { name: decisionTreeName = '' } = {} } = this.state
    const { form, businessLine = [] } = this.props
    const { getFieldProps } = form

    const dataSource = this.state.dataSource
    const colums = [
      {
        title: '决策树编码',
        dataIndex: 'strategyCode',
        key: 'strategyCode',
        width: 300,
        render: (text, record) => {
          return (<div style={{ maxWidth: 250 }} title={text} className="text-overflow">{text}</div>)
        }
      },
      {
        title: '决策树名称',
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
        title: '因子数',
        dataIndex: 'factorNumber',
        key: 'factorNumber'
      },
      {
        title: '节点深度',
        dataIndex: 'nodeDepth',
        key: 'nodeDepth'
      },
      {
        title: '激活',
        dataIndex: 'isActive',
        key: 'isActive',
        width: 150,
        render: (text, record) => {
          const { strategyStatus, SwitchLoading } = record
          return (
            <Switch style={{ width: 55 }} loading={SwitchLoading} checked={strategyStatus !== 'EDITING'}
                    checkedChildren="ON"
                    onChange={() => {
                      this.activeChange(record)
                    }} defaultChecked={text}
                    unCheckedChildren="OFF" />
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
                    this.onBlackDelete()
                  }
                })
                this.setState({
                  delId: id
                  // deleteConfirmShow: true
                })
              }}>删除</span> : null
            }
            {
              isActive ? <span className="operation-span" onClick={() => {
                  this.onOfflineDecision({ id })
                }}>上线</span>
                : isOnline ? <span className="operation-span" onClick={() => {
                  this.onOfflineDecision({ id })
                }}>下线</span>
                : null
            }
          </Fragment>
        }
      }
    ]

    return <LayoutRight className="no-bread-crumb">
      <div className="region-zd">
        <Input placeholder="决策树编码/决策树名称" value={decisionName} maxLength={'50'} onChange={this.nameChange}
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
        title="决策树复制"
        visible={copyVisible}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
        onCancel={this.copyCancel}
        onOk={this.copyStrategyTree}
      >
        <Form>
          <Row className="form-row-item">
            <FormItem {...formItemLayout} label="决策树名称">
              <Input {...getFieldProps('name', {
                initialValue: decisionTreeName,
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

  getStrategyStatusText = strategyStatus => {
    return STRATEGY_STATUS[strategyStatus]
  }

  view = record => {
    const { decisionName, pagination, selectBusinessId } = this.realParam
    const { pageSize, current } = pagination
    const state = {
      tabKey: DECISION_STRATEGY_NEW_CONFIG,
      decisionName,
      selectBusinessId,
      pageSize,
      current,
      isView: true,
      ...record
    }
    this.props.history.push({ pathname: '/policy/bazaar/strategy/new', state })
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

  copyStrategyTree = () => {
    const { copyRecord: { id = '' } = {} } = this.state
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      try {
        let { name } = values
        const { promise } = copyDecisionStrategyTree({ id, name })
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

  selectBusiness = e => {
    this.setState({ selectBusinessId: e })
  }
  onOfflineDecision = (data) => {
    const { UpLoading } = this.state
    if (UpLoading) {
      return
    }
    try {
      const { id } = data
      dependenciesTree(buildUrlParamNew({ id })).then(res => {
        let { content = [] } = res
        if (content.length > 0) {
          decisionModalError(content)
        } else {
          const { promise } = onOfflineDecision(data)
          promise.then((data) => {
            const { pagination } = this.state
            const { current = 1 } = pagination
            this.queryList(current)
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        }
      }).catch(err => {
        console.log(err)
        notification.warn({
          message: err.content.message
        })
      })
    } catch (err) {
    }
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
    await setDecisionActive(data).then(res => {
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
  onBlackDelete = async (e) => {
    const id = this.state.delId
    const data = {
      id
    }
    await delDecisionStrategyItem(data).then(res => {
      notification['success']({
        message: '删除成功'
      })
      const { pagination } = this.state
      const { current = 1 } = pagination
      this.queryList(current)
    }).catch(err => {
      const { content = {} } = err
      notification.warn(content)
    })
  }
  nameChange = (e) => {
    const value = e.target.value
    this.setState({ decisionName: value })
  }

  newStrategyClick = (key, record) => {
    const { decisionName, pagination, selectBusinessId } = this.realParam
    const { pageSize, current } = pagination
    const state = {
      tabKey: DECISION_STRATEGY_NEW_BASICINFO,
      decisionName,
      selectBusinessId,
      pageSize,
      current
    }
    if (typeof key === 'string') {
      state.tabKey = key
    }
    if (record) {
      Object.assign(state, record)
    }
    this.props.history.push({ pathname: '/policy/bazaar/strategy/new', state })
  }
  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.queryList(pagination.current)
    })
  }
  queryList = (page = 1) => {
    const { decisionName, pagination, selectBusinessId: businessLineId } = this.realParam
    const { pageSize } = pagination
    const data = {
      name: decisionName,
      businessLineId,
      pageNum: page,
      pageSize
    }
    this.getList(buildUrlParamNew(data))
  }
  getList = async (data) => {
    const { pagination } = this.state
    await getDecisionStrategyList(data).then(res => {
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
