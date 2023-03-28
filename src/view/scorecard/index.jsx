import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Input, Table, Switch, Button, Modal, notification, Select, Form, Row } from 'antd'
import { buildUrlParamNew, decisionModalError } from '../../util'
import { getScorecardList, copyScorecard, delScorecard, activeScorecard, onOffLine } from '../../action/scorecard'
import './index.less'
import { SUCCESS } from '../../common/constant'
import LayoutRight from '../../component/layout_right'
import { dependenciesScorecard, getBusinessList } from '../../action/rule'
import { Map } from 'immutable'
import connect from 'react-redux/es/connect/connect'
import { bindActionCreators } from 'redux'
import { STRATEGY_STATUS } from '../../common/case'

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
  state = {
    keyword: '',
    loading: false,
    dataSource: [],
    deleteConfirmShow: false,
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }
  static propTypes = {
    form: PropTypes.any,
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
    const { pagination, keyword, selectBusinessId, copyVisible = false, copyRecord: { name = '' } = {} } = this.state
    const { form, businessLine = [] } = this.props
    const { getFieldProps } = form
    const dataSource = this.state.dataSource
    const colums = [
      {
        title: '评分卡编码',
        dataIndex: 'modelCode',
        key: 'modelCode',
        width: 300,
        render: (text, record) => {
          return (<div style={{ maxWidth: 250 }} title={text} className="text-overflow">{text}</div>)
        }
      },
      {
        title: '评分卡名称',
        dataIndex: 'name',
        key: 'name',
        width: 300,
        render: (text, record) => {
          return (<div style={{ maxWidth: 250 }} title={text} className="text-overflow">{text}</div>)
        }
      }, {
        title: '业务条线',
        dataIndex: 'businessLineName',
        key: 'businessLineName',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      },
      {
        title: '初始评分',
        dataIndex: 'baseScore',
        key: 'baseScore'
      },
      {
        title: '激活',
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: (text, record) => {
          const { strategyStatus, SwitchLoading } = record
          return (
            <Switch style={{ width: 55 }} loading={SwitchLoading} checked={strategyStatus !== 'EDITING'}
                    checkedChildren="ON"
                    onChange={() => {
                      this.activeChange(record)
                    }} defaultChecked={!!text}
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
          return (<span>{text}</span>)
        }
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 150,
        render: (text, record) => {
          const { id, strategyStatus: status } = record
          const isEditing = status === 'EDITING'
          const isActive = status === 'ACTIVE'
          const isOnline = status === 'ONLINE'
          return <Fragment>
            {
              isEditing ? <span className="operation-span"
                                onClick={() => this.newStrategyClick('config', record)}>编辑</span>
                : <span className="operation-span"
                        onClick={() => this.view(record)}>查看</span>
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
                  })
                }}>删除</span>
                : isActive ? <span className="operation-span" onClick={() => this.onLineRuleSet(record)}>上线</span>
                : isOnline ? <span className="operation-span" onClick={() => this.offLineRuleSet(record)}>下线</span>
                  : null
            }
          </Fragment>
        }
      }
    ]

    return <LayoutRight className="no-bread-crumb">
      <div className="region-zd">
        <Input placeholder="评分卡名称/评分卡编码" value={keyword} maxLength={'50'} onChange={this.nameChange}
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
        title="评分卡复制"
        visible={copyVisible}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
        onCancel={this.copyCancel}
        onOk={this.copyScorecard}
      >
        <Form>
          <Row className="form-row-item">
            <FormItem {...formItemLayout} label="评分卡名称">
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

  getStrategyStatusText = strategyStatus => {
    return STRATEGY_STATUS[strategyStatus]
  }

  selectBusiness = e => {
    this.setState({ selectBusinessId: e })
  }
  onLineOfflineRuleSet = async (data) => {
    const { UpLoading } = this.state
    if (UpLoading) {
      return
    }
    try {
      await this.setState({ UpLoading: true })
      await onOffLine(data).then((data) => {
        const { actionStatus = '' } = data
        if (actionStatus === SUCCESS) {
          const { pagination } = this.state
          const { current = 1 } = pagination
          this.queryList(current)
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      }).finally(() => {
        this.setState({ UpLoading: false })
      })
    } catch (err) {
    }
  }

  onLineRuleSet = (record) => {
    const { id } = record
    confirm({
      title: '上线当前评分卡，会自动下线已上线的评分卡。是否继续？',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        this.onLineOfflineRuleSet({ id })
      },
      onCancel: () => {
        // this.cancelNoticeWindow()
      }
    })
  }

  offLineRuleSet = (record) => {
    const { id } = record
    dependenciesScorecard(buildUrlParamNew({ id })).then(res => {
      let { content = [] } = res
      if (content.length > 0) {
        decisionModalError(content)
      } else {
        this.onLineOfflineRuleSet({ id })
      }
    })
  }

  copyScorecard = () => {
    const { copyRecord: { id = '' } = {} } = this.state
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      try {
        let { name } = values
        copyScorecard({ id, name }).then(() => {
          this.setState({
            copyVisible: false,
            copyRecord: {}
          }, () => {
            const { pagination } = this.state
            const { current = 1 } = pagination
            this.queryList(current)
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
  activeChange = async (record) => {
    const { id } = record
    const data = {
      id
    }
    const { dataSource } = this.state
    record.SwitchLoading = true
    dataSource.forEach(item => {
      if (item.id === record.id) {
        item = record
      }
    })
    await this.setState({ dataSource })
    await activeScorecard(data).then(res => {
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
    const { dataSource: newData } = this.state
    record.SwitchLoading = false
    newData.forEach(item => {
      if (item.id === record.id) {
        item = record
      }
    })
    await this.setState({ newData })
    this.setState({ SwitchLoading: false })
  }
  onBlackDelete = async (e) => {
    const id = this.state.delId
    const data = {
      id
    }
    await delScorecard(data).then(res => {
      notification['success']({
        message: '删除成功'
      })
      const { pagination } = this.state
      const { current = 1 } = pagination
      this.queryList(current)
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  nameChange = (e) => {
    const value = e.target.value
    this.setState({ keyword: value })
  }

  view = record => {
    this.newStrategyClick('config', record, true)
  }

  newStrategyClick = (key, record, isView = false) => {
    const state = {
      tabKey: 'basicInfo',
      isView
    }
    if (typeof key === 'string') {
      state.tabKey = key
    }
    if (record) {
      Object.assign(state, record)
    }
    this.props.history.push({ pathname: '/policy/bazaar/list/new', state })
  }
  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.queryList(pagination.current)
    })
  }
  queryList = (page = 1) => {
    const { keyword, pagination, selectBusinessId: businessLineId } = this.realParam
    const { pageSize: size } = pagination
    const data = {
      keyword,
      businessLineId,
      page: page,
      size
    }
    this.getList(buildUrlParamNew(data))
  }
  getList = async (data) => {
    const { pagination } = this.state
    await getScorecardList(data).then(res => {
      console.log(res)
      const { content = {} } = res
      const { total, page, data = [] } = content
      if (data.length === 0 && page > 1) {
        // 用户非法操作 前端兼容处理
        this.queryList(1)
        return
      }
      const dataSource = data.map((item, index) => {
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
