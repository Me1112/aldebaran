import React, { Fragment } from 'react'
import { Button, notification, Select, Table, Modal } from 'antd'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import LayoutRight from '../../../component/layout_right'
import { getEaList, delEa } from '../../../action/external_access'
import { buildUrlParamNew } from '../../../util'
import { bindActionCreators } from 'redux'
import { getAppSelect, getSceneList } from '../../../action/rule'
import './index.less'

const { confirm, error } = Modal
const { Option } = Select

function mapStateToProps(state) {
  const { rule = Map() } = state
  const { appSelect = [], sceneList = [] } = rule.toJS()
  return {
    appSelect,
    sceneList
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    getAppSelect: bindActionCreators(getAppSelect, dispatch)
  }
}

class ExternalAccess extends React.Component {
  constructor(prop) {
    super(prop)
    this.realParam = {}
    this.state = {
      pagination: {
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      }
    }
  }

  static propTypes = {
    appSelect: PropTypes.array.isRequired,
    getAppSelect: PropTypes.func.isRequired,
    getSceneList: PropTypes.func.isRequired,
    history: PropTypes.any.isRequired,
    sceneList: PropTypes.array.isRequired
  }

  componentDidMount() {
    this.props.getSceneList()
    this.props.getAppSelect()
    const { state } = this.props.history.location
    if (state) {
      const { appId, pageSize, scenarioId, status, current } = state
      let { pagination } = this.state
      pagination.pageSize = pageSize
      pagination.current = current
      console.log('pagination', pagination, current, state)
      this.realParam = { ...this.state }
      this.setState({ appId, scenarioId, status, pagination }, () => {
        this.getDataList(current)
      })
    } else {
      this.realParam = { ...this.state }
      this.getDataList()
    }
  }

  render() {
    const { appId, scenarioId, status, loading, pagination, dataSource = [] } = this.state
    const { appSelect, sceneList } = this.props
    const columns = [
      {
        title: '应用',
        dataIndex: 'appName',
        key: 'appName',
        width: '15%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      },
      {
        title: '场景',
        dataIndex: 'scenarioName',
        key: 'scenarioName',
        width: '15%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      },
      {
        title: '策略类型',
        dataIndex: 'strategyType',
        key: 'strategyType',
        width: 100,
        render: (text) => {
          switch (text) {
            case 'RULE_SET':
              return '规则集'
            case 'SCORE_CARD':
              return '评分卡'
            case 'DECISION_TREE':
              return '决策树'
            case 'DECISION_STREAM':
              return '决策流'
          }
        }
      },
      {
        title: '策略名',
        width: '15%',
        dataIndex: 'strategyName',
        key: 'strategyName',
        render: (text, record) => {
          const { status, strategyInfo = [] } = record
          const [{ strategyName, rate = 0 } = {}, { strategyName: strategyName2, rate: rate2 = 0 } = {}] = strategyInfo
          let content = strategyName
          let name = strategyName
          if (status === 'AB_TEST') {
            if (strategyInfo.length > 1) {
              content = <div>
                {strategyName}
                <span style={{ color: 'rgba(0,0,0,.45)' }}>({rate}%)</span>
                、
                {strategyName2}
                <span style={{ color: 'rgba(0,0,0,.45)' }}>({rate2}%)</span>
              </div>
              name = [`${strategyName}(${rate}%)`, `${strategyName2}(${rate2}%)`].join('、')
            } else {
              content = <div>
                {strategyName}
                <span style={{ color: 'rgba(0,0,0,.45)' }}>({rate}%)</span>
              </div>
              name = `${strategyName}${rate}%`
            }
          }
          return <div className="text-overflow" title={name}>{content}</div>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: text => {
          return text === 'TESTING' ? <Fragment>
            <span className={'run-status'} />试运行
          </Fragment> : text === 'AB_TEST' ? <Fragment>
            <span className={'run-status gray'} />A/B测试运行
          </Fragment> : <Fragment><span className={'run-status formal'} />正式运行</Fragment>
        }
      }, {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: 200,
        key: 'updateTime'
      }, {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        width: 150,
        render: (text, record) => {
          const { appId, pagination, scenarioId, status } = this.state
          const { pageSize, current } = pagination
          const { firstAccessTime } = record
          const query = {
            appId, pageSize, scenarioId, status, current
          }
          return <Fragment>
            <span className="operation-span" onClick={() => {
              this.props.history.push({
                pathname: '/policy/joinup/config/new',
                state: {
                  ...record,
                  query
                }
              })
            }}>编辑</span>
            <span className="operation-span" onClick={() => {
              firstAccessTime ? error({
                title: '该外部接入已存在正式调用，不可删除！',
                content: '',
                okText: '确定',
                okType: 'primary'
              }) : confirm({
                title: '是否确认删除?',
                content: '',
                okText: '确定',
                okType: 'primary',
                cancelText: '取消',
                onOk: async () => {
                  this.delEa(text)
                }
              })
            }}>删除</span>
            <span className="operation-span" onClick={() => {
              this.props.history.push({
                pathname: '/policy/joinup/config/online-test',
                state: {
                  ...record,
                  query
                }
              })
            }}>测试</span>
          </Fragment>
        }
      }
    ]
    return (
      <Fragment>
        <LayoutRight className="join-up no-bread-crumb">
          <div className="region-zd">
            <Select value={appId} onChange={(e) => this.onSelectChange(e, 'appId')} placeholder="应用" allowClear
                    style={{ width: 180 }}>
              {
                appSelect.map(app => {
                  const { appId, appName } = app
                  return (
                    <Option key={appId} value={appId.toString()}>{appName}</Option>
                  )
                })
              }
            </Select>
            <Select value={scenarioId} placeholder="场景" style={{ width: 180 }}
                    onChange={(e) => this.onSelectChange(e, 'scenarioId')} allowClear>
              {
                sceneList.map((scene) => {
                  const { scenarioDicId, scenarioName } = scene
                  return (
                    <Option key={scenarioDicId} value={scenarioDicId}>{scenarioName}</Option>
                  )
                })
              }
            </Select>
            <Select value={status} placeholder={'运行状态'} style={{ width: 180 }}
                    onChange={(e) => this.onSelectChange(e, 'status')} allowClear>
              <Option key={'TESTING'} value={'TESTING'}>试运行</Option>
              <Option key={'RUNNING'} value={'RUNNING'}>正式运行</Option>
              <Option key={'GRAY_RELEASE'} value={'AB_TEST'}>A/B测试运行</Option>
            </Select>
            <Button type="primary" onClick={() => {
              this.realParam = { ...this.state }
              this.getDataList(1)
            }} style={{ marginRight: '10px' }}>查询</Button>
            <Button type="default" onClick={this.onClearClick}>重置</Button>
            <div style={{ float: 'right' }}>
              <Button type="primary" onClick={this.newJoinUp}>新建</Button>
            </div>
          </div>
          <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
            <Table rowkey="ruleId" className="table-td-no-auto table-layout-fixed" columns={columns}
                   dataSource={dataSource}
                   locale={{ emptyText: '暂无数据' }} loading={loading}
                   onChange={this.handleChange}
                   pagination={pagination} />
          </div>
        </LayoutRight>

      </Fragment>
    )
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.getDataList(pagination.current)
    })
  }
  recordQuery = () => {
    const { appId, pagination, scenarioId, status } = this.state
    const { pageSize, current } = pagination
    const query = {
      appId, pageSize, scenarioId, status, current
    }
    return query
  }
  newJoinUp = () => {
    const query = this.recordQuery()
    this.props.history.push({ pathname: '/policy/joinup/config/new', state: { query } })
  }
  onClearClick = () => {
    this.setState({
      status: undefined, scenarioId: undefined, appId: undefined
    }, () => {
      this.realParam = { ...this.state }
    })
  }
  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }
  getDataList = async (pageNum = 1) => {
    const { status, scenarioId, appId, pagination } = this.realParam
    const { pageSize } = pagination
    const data = {
      appId,
      pageNum,
      pageSize,
      scenarioId,
      status
    }
    this.setState({
      loading: true
    })
    await getEaList(buildUrlParamNew(data)).then(res => {
      if (res.actionStatus === 'SUCCESS') {
        const { content = {} } = res
        const { data = [], page, total } = content
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.getDataList(1)
          return
        }
        data.forEach((item, index) => {
          item.key = `${page}_${index}`
        })
        pagination.total = total
        pagination.current = page
        this.setState({ dataSource: data, loading: false, pagination })
      } else {
        notification.warning(res.content)
        this.setState({
          loading: false
        })
      }
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  delEa = (id) => {
    delEa({ id }).then(res => {
      const { pagination } = this.state
      this.getDataList(pagination.current)
    }).catch((data) => {
      notification.warning(data.content)
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExternalAccess)
