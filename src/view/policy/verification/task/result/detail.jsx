import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Map } from 'immutable'
import moment from 'moment'
import './index.less'
import { Button, Input, Select, Table, DatePicker, notification, InputNumber } from 'antd'
import { getTaskResultList, getVerifyResultDate, getUsedScenarios } from '../../../../../action/data'
import { formatDate } from '../../../../../util'
import { RISK_GRADE } from '../../../../../common/constant'
import { FLOW_TYPES } from '../../../../../common/decision_constant'

const { Option } = Select
const { RangePicker } = DatePicker
const { SCORE_CARD } = FLOW_TYPES

class DataDetail extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const { beginDateVal, endDateVal, page = 1, size = 10, scenarioValue, scenarioSelected, toDetail = false } = state
    this.state = {
      pagination: {
        current: page,
        pageSize: size,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      occurTimeVal: !beginDateVal || !endDateVal ? [] : [moment(beginDateVal), moment(endDateVal)],
      ...state,
      scenarioSelected: toDetail ? scenarioSelected : scenarioValue
    }
    this.realParam = { ...this.state }
  }

  static propTypes = {
    initState: PropTypes.object,
    taskInfo: PropTypes.object.isRequired,
    breadCrumb: PropTypes.array.isRequired,
    riskPolicyMap: PropTypes.object.isRequired,
    riskPolicyList: PropTypes.array.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
  }

  componentDidMount() {
    this.getVerifyResultDate()
    const { taskDataType } = this.state
    if (taskDataType === 'OFFLINE_DATA') {
      this.getUsedScenarios()
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { initState = {} } = nextProps
    const { occurTimeVal: [beginDate, endDate] = [moment(), moment()], eventErrorType } = initState
    if (JSON.stringify(initState) !== '{}') {
      this.setState({
        beginDateVal: beginDate.format('YYYY-MM-DD 00:00:00'),
        endDateVal: endDate.format('YYYY-MM-DD 23:59:59'),
        eventErrorType
      }, () => {
        this.realParam = this.state
        this.onEventQuery()
      })
    } else {
      this.setState({
        eventErrorType: undefined
      }, () => {
        this.getVerifyResultDate()
      })
    }
  }

  render() {
    const { breadCrumb, riskPolicyMap, riskPolicyList = [] } = this.props
    const {
      taskDataType, occurTimeVal = null, eventId, eventErrorType, scenarioSelected, sceneList = [],
      pagination, dataSource = [], strategyType, decisionResult, lowerLimit = null, upperLimit = null
    } = this.state
    const isOffline = taskDataType === 'OFFLINE_DATA'
    const isScoreCard = strategyType === SCORE_CARD
    console.log('tender', isScoreCard, this.props)
    let columns = [
      {
        title: '事件流水号',
        dataIndex: 'eventId',
        key: 'eventId',
        width: '15%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '进件时间',
        dataIndex: 'occurTime',
        key: 'occurTime',
        width: 180,
        render: text => {
          return formatDate(text)
        }
      }, {
        title: '账号',
        dataIndex: 'account',
        key: 'account',
        width: 200,
        render: text => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '生产结果',
        dataIndex: 'onlineResult',
        key: 'onlineResult',
        width: 120,
        render: (text, { onlineScore }) => {
          if (isScoreCard) {
            return onlineScore
          }
          const { riskGrade, decisionName } = riskPolicyMap[text] || {}
          const { css } = RISK_GRADE[riskGrade] || {}
          return <span className={css}>{decisionName}</span>
        }
      }
    ]
    if (!isScoreCard) {
      columns = [...columns, {
        title: '人工结果',
        dataIndex: 'manualResult',
        key: 'manualResult',
        width: 120,
        render: text => {
          const { riskGrade, decisionName } = riskPolicyMap[text] || {}
          const { css } = RISK_GRADE[riskGrade] || {}
          return <span className={css}>{decisionName}</span>
        }
      }]
    }
    columns = [...columns, {
      title: '验证结果',
      dataIndex: 'verifyResult',
      key: 'verifyResult',
      width: 120,
      render: (text, { verifyScore }) => {
        if (isScoreCard) {
          return verifyScore
        }
        const { riskGrade, decisionName } = riskPolicyMap[text] || {}
        const { css } = RISK_GRADE[riskGrade] || {}
        return <span className={css}>{decisionName}</span>
      }
    }]
    if (isOffline) {
      columns = [
        {
          title: '事件流水号',
          dataIndex: 'eventId',
          key: 'eventId',
          width: '15%',
          render: text => {
            return <div title={text} className="text-overflow">{text}</div>
          }
        }, {
          title: '场景',
          dataIndex: 'scenarioName',
          key: 'scenarioName',
          width: '15%',
          render: text => {
            return <div title={text} className="text-overflow">{text}</div>
          }
        }, {
          title: '进件时间',
          dataIndex: 'occurTime',
          key: 'occurTime',
          width: 180,
          render: text => {
            return formatDate(text)
          }
        }, {
          title: '账号',
          dataIndex: 'account',
          key: 'account',
          width: 200,
          render: text => {
            return (<div className="text-overflow" title={text}>{text}</div>)
          }
        }, {
          title: '决策结果',
          dataIndex: 'verifyResult',
          key: 'verifyResult',
          width: 120,
          render: (text, { verifyScore }) => {
            if (isScoreCard) {
              return verifyScore
            }
            const { riskGrade, decisionName } = riskPolicyMap[text] || {}
            const { css } = RISK_GRADE[riskGrade] || {}
            return <span className={css}>{decisionName}</span>
          }
        }
      ]
    }

    columns = [...columns, {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (text, record) => {
        const { eventId, verifyResult, verifyScore } = record
        let showDecisionInfo = true
        let showVerifyInfo = false
        if (isOffline) {
          if (isScoreCard) {
            if (verifyScore === undefined) {
              showDecisionInfo = false
            }
          } else {
            if (verifyResult === undefined) {
              showDecisionInfo = false
            }
          }
        } else {
          showVerifyInfo = true
        }
        const { conditions } = this.state
        return <span className="operation-span" onClick={() => {
          this.props.history.push({
            pathname: '/policy/verification/task/result/detail',
            state: {
              ...record,
              showVerifyInfo,
              showDecisionInfo,
              isOffline,
              isVerifyTask: true,
              returnUrl: '/policy/verification/task/result',
              backUrl: '/policy/verification/task',
              breadCrumb: [...breadCrumb, `详情(${eventId})`],
              conditions,
              returnBreadCrumb: breadCrumb,
              returnConditions: { ...this.getCurrentParams(), toDetail: true }
            }
          })
        }}>详情</span>
      }
    }]
    return <Fragment>
      <div className="region-zd">
        <div style={{ paddingBottom: 20 }}>
          <RangePicker style={{ width: 220 }} onChange={this.occurTimeChange}
                       value={occurTimeVal} allowClear
                       defaultValue={occurTimeVal} format="YYYY-MM-DD"
                       onCalendarChange={this.onCalendarChange}
                       disabledDate={this.disabledDate} />
          <Input placeholder="事件流水号" style={{ width: 220 }} value={eventId}
                 onChange={(e) => this.onFieldChange(e.target.value, 'eventId')} />
          {
            isOffline ? <Select value={sceneList.length > 0 ? scenarioSelected : undefined}
                                onChange={(e) => this.onFieldChange(e, 'scenarioSelected')}
                                placeholder="场景" allowClear style={{ width: 220 }}>
              {
                sceneList.map((scene) => {
                  const { scenarioValue, scenarioName } = scene
                  return (
                    <Option key={scenarioValue} value={scenarioValue}>{scenarioName}</Option>
                  )
                })
              }
            </Select> : null
          }
          {
            isOffline || (!isOffline && isScoreCard) ? null
              : <Select value={eventErrorType} onChange={(e) => this.onFieldChange(e, 'eventErrorType')}
                        placeholder="数据类型" allowClear style={{ width: 220 }}>
                <Option key="MISSING" value="MISSING">漏报数据</Option>
                <Option key="MISTAKE" value="MISTAKE">误报数据</Option>
                <Option key="DEVIATION" value="DEVIATION">偏差数据</Option>
              </Select>
          }
          {
            isOffline && !isScoreCard
              ? <Select value={decisionResult} onChange={(e) => this.onFieldChange(e, 'decisionResult')}
                        placeholder="决策结果" allowClear style={{ width: 220 }}>
                {
                  riskPolicyList.map(riskPolicy => {
                    const { decisionName, decisionCode } = riskPolicy
                    return (
                      <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>
                    )
                  })
                }
              </Select> : null
          }
          {
            isOffline && isScoreCard
              ? <Fragment>
                <InputNumber value={lowerLimit} onChange={e => this.onFieldChange(e, 'lowerLimit')}
                             style={{ width: 88, marginRight: 5 }} maxLength={10}
                             placeholder={'评分下限'} />
                ~
                <InputNumber value={upperLimit} onChange={e => this.onFieldChange(e, 'upperLimit')}
                             style={{ width: 88, marginLeft: 5, marginRight: 10 }} maxLength={10}
                             placeholder={'评分上限'} />
              </Fragment> : null
          }
          <Button type="primary" onClick={this.onQueryClick} style={{ marginRight: '10px' }}>查询</Button>
          <Button type="default" onClick={this.onClearClick}>重置</Button>
        </div>
      </div>
      <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
        <Table rowKey="eventId" className="table-layout-fixed" columns={columns} dataSource={dataSource}
               onChange={this.handleChange}
               pagination={pagination} />
      </div>
    </Fragment>
  }

  getCurrentParams = () => {
    const { taskInfo = {} } = this.props
    const {
      pagination: { current: page, pageSize: size },
      beginDateVal,
      endDateVal,
      eventId,
      eventErrorType,
      decisionResult,
      lowerLimit,
      upperLimit,
      scenarioSelected
    } = this.realParam
    return {
      ...taskInfo,
      page,
      size,
      beginDateVal,
      endDateVal,
      eventId,
      eventErrorType,
      decisionResult,
      lowerLimit,
      upperLimit,
      scenarioSelected
    }
  }

  occurTimeChange = async (date = [], dateString) => {
    if (date.length > 0) {
      this.setState({ beginDateVal: dateString[0] + ' 00:00:00', endDateVal: dateString[1] + ' 23:59:59' })
    } else {
      this.setState({ beginDateVal: undefined, endDateVal: undefined, occurTimeVal: [] })
    }
  }

  getVerifyResultDate = () => {
    const { taskInfo: { taskId } } = this.props
    getVerifyResultDate({ taskId }).then(data => {
      const { content: { startDate = 0, endDate = 0 } = {} } = data
      let beginDateVal
      let endDateVal
      let occurTimeVal = []
      if (startDate) {
        beginDateVal = `${moment(startDate).format('YYYY-MM-DD')} 00:00:00`
        occurTimeVal.push(moment(beginDateVal))
      }
      if (endDate) {
        endDateVal = `${moment(endDate).format('YYYY-MM-DD')} 23:59:59`
        occurTimeVal.push(moment(endDateVal))
      }
      this.startDate = startDate
      this.endDate = endDate
      this.setState({ beginDateVal, endDateVal, occurTimeVal }, () => {
        this.realParam = { ...this.state }
        this.onEventQuery()
      })
    })
  }

  handleChange = (pagination) => {
    const { pageSize } = pagination
    const { pagination: { pageSize: size = 10 } = {} } = this.realParam
    if (pageSize !== size) {
      pagination.current = 1
    }
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.onEventQuery(pagination.current, pagination.pageSize)
    })
  }

  onCalendarChange = (dates) => {
    this.setState({ occurTimeVal: dates })
  }

  disabledDate = (current) => {
    if (!this.startDate || !this.endDate) {
      return false
    }
    const zero = {
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    }
    return !(current.set(zero).valueOf() >= moment(this.startDate).set(zero).valueOf() &&
      current.set(zero).valueOf() <= moment(this.endDate).set(zero).valueOf())
  }

  onFieldChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }

  onClearClick = () => {
    const { scenarioValue } = this.state
    this.setState({
      eventId: undefined,
      eventErrorType: undefined,
      occurTimeVal: !this.startDate || !this.endDate ? [] : [moment(this.startDate), moment(this.endDate)],
      beginDateVal: undefined,
      endDateVal: undefined,
      scenarioSelected: scenarioValue,
      decisionResult: undefined,
      lowerLimit: null,
      upperLimit: null
    })
  }

  onQueryClick = () => {
    this.realParam = this.state
    this.onEventQuery()
  }

  onEventQuery = (page = 1, limit = 0) => {
    const { taskInfo: { conditions = {}, ...others } = {} } = this.props
    console.log(conditions)
    const {
      eventId,
      beginDateVal,
      endDateVal,
      eventErrorType,
      decisionResult,
      lowerLimit,
      upperLimit,
      scenarioSelected: scenarioValue
    } = this.realParam

    const { pagination } = this.state
    const { pageSize } = pagination

    let data = {
      ...others,
      beginDate: beginDateVal,
      endDate: endDateVal,
      eventId,
      eventErrorType,
      decisionResult,
      lowerLimit,
      upperLimit,
      scenarioValue,
      page,
      size: limit || pageSize
    }
    getTaskResultList(data).then(res => {
      const { content: { data = [], page, total } = {} } = res
      pagination.total = total
      pagination.current = page

      this.setState({
        pagination,
        dataSource: data
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  getUsedScenarios = () => {
    const { taskInfo: { taskId } } = this.props
    getUsedScenarios({ taskId }).then(data => {
      const { content: sceneList = [] } = data
      this.setState({ sceneList })
    })
  }
}

function mapStateToProps(state) {
  const { decision = Map({}) } = state
  const { riskPolicyMap = {}, riskPolicyList = [] } = decision.toJS()
  return { riskPolicyMap, riskPolicyList }
}

export default withRouter(connect(mapStateToProps)(DataDetail))
