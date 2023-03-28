import React, { Fragment } from 'react'
import { Button, notification, Select, Table, DatePicker, InputNumber } from 'antd'
import PropTypes from 'prop-types'
import connect from 'react-redux/es/connect/connect'
import LayoutRight from '../../../../component/layout_right'
import { getBusinessLinesNoNormal, getMaxDateInterval } from '../../../../action/common'
import { bindActionCreators } from 'redux'
import { getAppList } from '../../../../action/system'
import { getSceneList } from '../../../../action/rule'

import { getEventQueryList } from '../../../../action/event'
import moment from 'moment'
import { Map } from 'immutable'
import AdvanceQuery from '../../../../component/advance_query'

const { Option } = Select
const { RangePicker } = DatePicker

const DATETIME = 'DATETIME'
const BOOLEAN = 'BOOLEAN'
const DECIMAL = 'DECIMAL'
const STRING = 'STRING'
const ENUM = 'ENUM'

function mapStateToProps(state) {
  const { system = Map({}), rule = Map({}), decision = Map({}) } = state
  const { appSelect = [] } = system.toJS()
  const { sceneList = [] } = rule.toJS()
  const { riskPolicyList = [], riskPolicyMap = {} } = decision.toJS()
  return { appSelect, sceneList, riskPolicyList, riskPolicyMap }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    getAppList: bindActionCreators(getAppList, dispatch)
  }
}

class ExternalAccess extends React.Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const {
      pageSize = 10,
      current = 1,
      beginDate = new Date().format('yyyy-MM-dd') + ' 00:00:00',
      endDate = new Date().format('yyyy-MM-dd') + ' 23:59:59',
      businessLineId,
      appId,
      scenarioId,
      strategyTypeVal,
      decisionResultVal,
      beginScore,
      endScore,
      advanceVisible,
      businessFields,
      hitRuleIds,
      advanceData
    } = state
    this.state = {
      pagination: {
        current,
        pageSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      beginDate,
      endDate,
      occurTimeVal: (!beginDate || !endDate) ? [] : [moment(beginDate), moment(endDate)],
      businessLineId,
      appId,
      scenarioId,
      strategyTypeVal,
      decisionResultVal,
      beginScore,
      endScore,
      advanceVisible,
      businessFields,
      hitRuleIds,
      advanceData
    }
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object,
    appSelect: PropTypes.array.isRequired,
    getAppList: PropTypes.func.isRequired,
    getSceneList: PropTypes.func.isRequired,
    sceneList: PropTypes.array.isRequired,
    riskPolicyList: PropTypes.array.isRequired,
    riskPolicyMap: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.getBusinessLinesNoNormal()
    this.realParam = { ...this.state }
    const {
      pagination: {
        current,
        pageSize
      }
    } = this.state
    this.getDataList(current, pageSize)
    this.getMaxDateInterval()
  }

  render() {
    const {
      businessLineList = [],
      occurTimeVal = [moment(), moment()],
      beginDate,
      endDate,
      businessLineId,
      appId,
      scenarioId,
      strategyTypeVal,
      decisionResultVal,
      beginScore = 0,
      endScore = 0,
      loading,
      pagination,
      dataSource = [],
      advanceVisible = false,
      businessFields = [],
      hitRuleIds = []
    } = this.state
    const { appSelect, sceneList, riskPolicyList = [], riskPolicyMap = {} } = this.props
    const columns = [
      {
        title: '',
        dataIndex: 'runningStatus',
        key: 'runningStatus',
        width: 30,
        render: (text) => {
          return text === 'TESTING' ? <div className={'running-status'}>试</div> : null
        }
      }, {
        title: '事件流水号',
        dataIndex: 'eventId',
        key: 'eventId',
        width: '20%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '应用',
        dataIndex: 'appName',
        key: 'appName',
        width: '10%',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '场景',
        dataIndex: 'scenarioName',
        key: 'scenarioName',
        width: '10%',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '时间',
        dataIndex: 'occurTime',
        key: 'occurTime',
        width: 180
      }, {
        title: '账号',
        dataIndex: 'account',
        key: 'account',
        width: '10%',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: 'IP地址',
        dataIndex: 'ip',
        key: 'ip',
        width: 120
      }, {
        title: '决策结果',
        dataIndex: 'decisionResult',
        key: 'decisionResult',
        width: 140,
        render: (text, record) => {
          const { decisionResult, finalScore } = record
          if (decisionResult) {
            const decision = riskPolicyMap[decisionResult] || {}
            const { decisionName = '', riskGrade = '' } = decision
            return <span className={`risk-grade risk-grade-${riskGrade.toLocaleLowerCase()} text-overflow`}>
              {decisionName}{finalScore !== undefined ? ` (${finalScore})` : ''}
            </span>
          }
          return finalScore
        }
      }, {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 70,
        render: (text, record) => {
          const {
            beginDate,
            endDate,
            businessLineId,
            appId,
            scenarioId,
            strategyTypeVal,
            decisionResultVal,
            beginScore = 0,
            endScore = 0,
            advanceVisible = false,
            businessFields = [],
            hitRuleIds = [],
            advanceData = {}
          } = this.state
          const { pageSize, current } = pagination
          const conditions = {
            beginDate,
            endDate,
            businessLineId,
            appId,
            scenarioId,
            strategyTypeVal,
            decisionResultVal,
            beginScore,
            endScore,
            advanceVisible,
            businessFields,
            hitRuleIds,
            advanceData,
            pageSize,
            current
          }
          return <span className="operation-span"
                       onClick={() => {
                         this.props.history.push({
                           pathname: '/policy/joinup/testing/detail',
                           state: {
                             backUrl: '/policy/joinup/testing',
                             ...record,
                             conditions,
                             breadCrumb: ['策略配置', '外部接入', '测试数据', '详情'],
                             operation: false,
                             isTesting: true
                           }
                         })
                       }}>详情</span>
        }
      }
    ]
    return (
      <Fragment>
        <LayoutRight className="join-up no-bread-crumb">
          <div className="region-zd">
            <div style={{ paddingBottom: 20 }}>
              <RangePicker style={{ width: 220 }} onChange={this.occurTimeChange}
                           value={occurTimeVal}
                           defaultValue={occurTimeVal} format="YYYY-MM-DD"
                           onCalendarChange={this.onCalendarChange}
                           disabledDate={this.disabledDate} />
              <Select value={businessLineId} onChange={(e) => this.onSelectChange(e, 'businessLineId')}
                      placeholder="业务条线" allowClear style={{ width: 220 }}>
                {
                  businessLineList.map(businessLine => {
                    const { lineId, lineName } = businessLine
                    return (
                      <Option key={lineId} value={lineId.toString()}>{lineName}</Option>
                    )
                  })
                }
              </Select>
              <Select value={appId} onChange={(e) => this.onSelectChange(e, 'appId')} placeholder="应用" allowClear
                      style={{ width: 220 }} disabled={!businessLineId}>
                {
                  appSelect.map(app => {
                    const { appId, appName } = app
                    return (
                      <Option key={appId} value={appId.toString()}>{appName}</Option>
                    )
                  })
                }
              </Select>
              <Select value={scenarioId} placeholder="场景" style={{ width: 220 }}
                      onChange={(e) => this.onSelectChange(e, 'scenarioId')} allowClear disabled={!businessLineId}>
                {
                  sceneList.map((scene) => {
                    const { scenarioDicId, scenarioValue, scenarioName } = scene
                    return (
                      <Option key={scenarioDicId} value={scenarioValue}>{scenarioName}</Option>
                    )
                  })
                }
              </Select>
            </div>
            <div>
              <Select value={strategyTypeVal} placeholder={'策略类型'} style={{ width: 220 }}
                      onChange={(e) => this.onSelectChange(e, 'strategyTypeVal')} allowClear>
                <Option key={'RULE_SET'} value={'RULE_SET'}>规则集</Option>
                <Option key={'SCORE_CARD'} value={'SCORE_CARD'}>评分卡</Option>
                <Option key={'DECISION_TREE'} value={'DECISION_TREE'}>决策树</Option>
                <Option key={'DECISION_STREAM'} value={'DECISION_STREAM'}>决策流</Option>
              </Select>
              {
                strategyTypeVal ? ['RULE_SET', 'DECISION_TREE', 'DECISION_STREAM'].indexOf(strategyTypeVal) !== -1
                  ? <Select value={decisionResultVal} placeholder="决策结果" style={{ width: 220 }}
                            onChange={(e) => this.onSelectChange(e, 'decisionResultVal')} allowClear>
                    {
                      riskPolicyList.map(riskPolicy => {
                        const { decisionName, decisionCode } = riskPolicy
                        return (
                          <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>
                        )
                      })
                    }
                  </Select>
                  : <Fragment>
                    <InputNumber value={beginScore} onChange={e => this.changeBaseScore(e, 'beginScore')}
                                 style={{ width: 100, marginRight: 5 }} maxLength={10}
                                 placeholder={'评分下限'} />
                    ~
                    <InputNumber value={endScore} onChange={e => this.changeBaseScore(e, 'endScore')}
                                 style={{ width: 100, marginLeft: 5, marginRight: 10 }} maxLength={10}
                                 placeholder={'评分上限'} />
                  </Fragment> : null
              }
              <Button type="primary" onClick={() => {
                this.realParam = { ...this.state }
                this.getDataList(1)
              }} style={{ marginRight: '10px' }}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
              <a style={{ textDecoration: 'underline' }} onClick={this.onAdvanceQueryClick}>高级查询</a>
            </div>
          </div>
          <div style={{ height: 'calc(100% - 105px)', overflowY: 'scroll' }}>
            <Table rowkey="ruleId" className="table-layout-fixed table-td-no-auto"
                   columns={columns} dataSource={dataSource}
                   locale={{ emptyText: '暂无数据' }} loading={loading}
                   onChange={this.handleChange}
                   pagination={pagination} />
          </div>
        </LayoutRight>

        <AdvanceQuery visible={advanceVisible}
                      isTesting
                      beginDate={beginDate}
                      endDate={endDate}
                      businessLineId={businessLineId}
                      appId={appId}
                      scenarioValue={scenarioId}
                      businessFields={businessFields}
                      hitRuleIds={hitRuleIds}
                      callback={this.advanceCallback}
                      onClose={this.onClose}
                      onQuery={this.onQuery} />
      </Fragment>
    )
  }

  getBusinessLinesNoNormal = () => {
    getBusinessLinesNoNormal().then(data => {
      const { content: businessLineList = [] } = data
      this.setState({
        businessLineList
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  occurTimeChange = (date, dateStr) => {
    const isClear = date.length === 0
    this.setState({
      occurTimeVal: date,
      beginDate: isClear ? '' : dateStr[0] + ' 00:00:00',
      endDate: isClear ? '' : dateStr[1] + ' 23:59:59'
    })
  }

  getMaxDateInterval = () => {
    getMaxDateInterval().then(data => {
      const { content: maxDateInterval = 0 } = data
      this.setState({
        maxDateInterval
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  onCalendarChange = (dates) => {
    this.setState({ occurTimeVal: dates })
  }

  disabledDate = (current) => {
    const { occurTimeVal, maxDateInterval = 0 } = this.state
    const startDay = occurTimeVal[0]
    const endDay = occurTimeVal[1]
    if (!current || !startDay || (startDay && endDay)) {
      return false
    }
    const startStr = startDay.format('YYYY-MM-DD')
    return !(current.valueOf() >= startDay.valueOf() && current.valueOf() < moment(startStr).add(maxDateInterval, 'days').valueOf())
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.getDataList(pagination.current, pagination.pageSize)
    })
  }

  onClearClick = () => {
    const date = new Date().format('yyyy-MM-dd')
    this.setState({
      advanceData: {},
      businessFields: [],
      hitRuleIds: [],
      occurTimeVal: [moment(), moment()],
      beginDate: date + ' 00:00:00',
      endDate: date + ' 23:59:59',
      businessLineId: undefined,
      appId: undefined,
      scenarioId: undefined,
      strategyTypeVal: undefined,
      decisionResultVal: undefined,
      beginScore: 0,
      endScore: 0
    })
  }

  onAdvanceQueryClick = () => {
    const { businessLineId = '' } = this.state
    if (businessLineId) {
      this.setState({
        advanceVisible: true
      })
    } else {
      notification.warning({
        message: '请选择业务条线'
      })
    }
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value }, () => {
      if (field === 'businessLineId') {
        this.setState({
          appId: undefined,
          scenarioId: undefined
        }, () => {
          this.props.getSceneList({
            [field]: value
          })
          this.props.getAppList({
            [field]: value
          })
        })
      }
    })
  }

  changeBaseScore = (e, field) => {
    this.setState({
      [field]: e
    })
  }

  getDataList = async (pageNum = 1, limit = 0) => {
    const date = new Date().format('yyyy-MM-dd')
    const {
      businessLineId,
      beginDate = date + ' 00:00:00',
      endDate = date + ' 23:59:59',
      appId,
      scenarioId: scenarioValue,
      strategyTypeVal: strategyType,
      decisionResultVal: decisionPolicy,
      beginScore = 0,
      endScore = 0,
      pagination,
      advanceData = {}
    } = this.realParam
    const { pageSize } = pagination
    const numPerPage = limit || pageSize
    let data = {
      businessLineId,
      isTesting: true,
      beginDate,
      endDate,
      appId,
      scenarioValue,
      strategyType,
      pageNum,
      numPerPage,
      ...advanceData
    }
    if (['RULE_SET', 'DECISION_TREE', 'DECISION_STREAM'].indexOf(strategyType) !== -1) {
      data = {
        ...data,
        decisionPolicy
      }
    }
    if (strategyType === 'SCORE_CARD') {
      data = {
        ...data,
        beginScore,
        endScore
      }
    }
    this.setState({
      loading: true
    })

    const { promise } = await getEventQueryList(data)
    promise.then(res => {
      const { content = {} } = res
      const { pageModel: { result: data = [], pageNum: page, totalCount: total } = {} } = content
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
      this.onClose()
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  advanceCallback = state => {
    this.setState({
      ...state
    })
  }

  onClose = () => {
    this.setState({
      advanceVisible: false
    })
  }

  onQuery = (businessFields, hitRuleIdList) => {
    let doubleBusinessFieldList = []
    let integerBusinessFieldList = []
    let strBusinessFieldList = []
    let enumBusinessFieldList = []
    let dateTimeBusinessFieldList = []
    businessFields.forEach(businessField => {
      const { fieldType = '', field: fieldName = '', operator: operatorCharacter = '', value = '' } = businessField
      const field = {
        fieldName,
        operatorCharacter,
        value
      }
      switch (fieldType) {
        case BOOLEAN:
        case STRING:
          strBusinessFieldList.push(field)
          break
        case ENUM:
          enumBusinessFieldList.push(field)
          break
        case DATETIME:
          dateTimeBusinessFieldList.push(field)
          break
        case DECIMAL:
          doubleBusinessFieldList.push(field)
          break
      }
    })

    this.setState({
      advanceData: {
        doubleBusinessFieldList,
        integerBusinessFieldList,
        strBusinessFieldList,
        enumBusinessFieldList,
        dateTimeBusinessFieldList,
        hitRuleIdList
      }
    }, () => {
      this.realParam = { ...this.state }
      this.getDataList()
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExternalAccess)
