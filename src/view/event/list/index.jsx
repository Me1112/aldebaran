import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, DatePicker, Form, Input, InputNumber, Modal, notification, Popconfirm, Select, Table } from 'antd'
import {
  exportStart,
  exportStatus,
  getCityList,
  getEventQueryList,
  getProvinceList,
  markEvent,
  verifyUpdate
} from '../../../action/event'
import { createCase, eventValidation, getCaseRisk, getCaseSubject } from '../../../action/case'
import { CASE_RISK, CASE_SUBJECT } from '../../../common/case'
import { getAppList } from '../../../action/system'
import { getSceneList } from '../../../action/rule'
import { Map } from 'immutable'
import moment from 'moment'
import { getToken } from '../../../util'
import './index.less'
import { DMS_PREFIX, SUCCESS } from '../../../common/constant'
import LayoutRight from '../../../component/layout_right'
import { getBusinessLinesNoNormal, getMaxDateInterval } from '../../../action/common'
import { Link } from 'react-router-dom'
import AdvanceQuery from '../../../component/advance_query'

const { RangePicker } = DatePicker
const { Option } = Select
const FormItem = Form.Item
const DATETIME = 'DATETIME'
const BOOLEAN = 'BOOLEAN'
const DECIMAL = 'DECIMAL'
const STRING = 'STRING'
const ENUM = 'ENUM'

function mapStateToProps(state) {
  const { event = Map({}), system = Map({}), rule = Map({}), decision = Map({}), common = Map({}) } = state
  const {
    eventQueryContent = {}, totalCount = 10, provinceList = []
  } = event.toJS()
  const { appSelect = [] } = system.toJS()
  const { sceneList = [] } = rule.toJS()
  const { userPermissions = {} } = common.toJS()
  const { riskPolicyList = [], riskPolicyMap = {} } = decision.toJS()
  return {
    eventQueryContent,
    totalCount,
    sceneList,
    userPermissions,
    provinceList,
    appSelect,
    riskPolicyList,
    riskPolicyMap
  }
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    getAppList: bindActionCreators(getAppList, dispatch),
    getProvinceList: bindActionCreators(getProvinceList, dispatch),
    getCityList: bindActionCreators(getCityList, dispatch),
    verifyUpdate: bindActionCreators(verifyUpdate, dispatch)
  }
}

class EventList extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const {
      pageSize = 10,
      current = 1,
      businessLineId,
      appIdVal,
      scenarioNameVal = undefined,
      beginDateVal = new Date().format('yyyy-MM-dd') + ' 00:00:00',
      endDateVal = new Date().format('yyyy-MM-dd') + ' 23:59:59',
      decisionResultVal = undefined,
      strategyTypeVal,
      beginScore = null,
      endScore = null,
      advanceVisible = false,
      businessFields = [],
      hitRuleIds = [],
      advanceData = {}
    } = state

    this.state = {
      pagination: {
        current,
        pageSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      businessLineId,
      appIdVal,
      channelVal: undefined,
      scenarioNameVal,
      strategyTypeVal,
      beginScore,
      endScore,
      advanceVisible,
      businessFields,
      hitRuleIds,
      occurTimeVal: (!beginDateVal || !endDateVal) ? [] : [moment(beginDateVal), moment(endDateVal)],
      beginDateVal,
      endDateVal,
      eventLiushuiIdVal: '',
      accountNameVal: '',
      accountIdVal: '',
      mobileVal: '',

      riskIndexVal: '',
      decisionResultVal,
      ipAddressVal: '',
      mobileProvinceVal: undefined,
      mobileCityVal: undefined,

      page: 0,
      current: 1,
      size: 10,

      showExport: false,
      exportDisable: false,
      showPrompt: false,
      eventId: '',
      decisionResult: '',

      ipCityList: [],
      mobileCityList: [],

      eventQueryContent: {},
      totalCount: 0,
      advanceData
    }

    this.realParam = this.state
  }

  static propTypes = {
    location: PropTypes.object,
    form: PropTypes.any,
    getSceneList: PropTypes.func.isRequired,
    getProvinceList: PropTypes.func.isRequired,
    verifyUpdate: PropTypes.func.isRequired,
    getAppList: PropTypes.func.isRequired,
    sceneList: PropTypes.array.isRequired,
    appSelect: PropTypes.array.isRequired,
    riskPolicyList: PropTypes.array.isRequired,
    userPermissions: PropTypes.any.isRequired,
    riskPolicyMap: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.getBusinessLinesNoNormal()
    this.props.getAppList()
    this.props.getSceneList()
    this.props.getProvinceList()
    this.onEventQuery()
    this.getCaseRisk()
    this.handlePermissions(this.props.userPermissions)
    this.getMaxDateInterval()
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.handlePermissions(nextProps.userPermissions)
  }

  render() {
    const { sceneList, appSelect, riskPolicyMap = {}, riskPolicyList = [] } = this.props
    const { getFieldDecorator } = this.props.form
    const {
      pagination,
      dataSource = [],
      scenarioNameVal,
      decisionResultVal,
      occurTimeVal,
      eventId,
      showExport,
      exportDisable,
      appIdVal,
      strategyTypeVal,
      showPrompt,
      businessLineList = [],
      businessLineId = undefined,
      beginDateVal,
      endDateVal,
      beginScore = null,
      endScore = null,
      advanceVisible = false,
      businessFields = [],
      caseRiskList = [],
      caseSubjectList = [],
      conversionListDate = {},
      hitRuleIds = []
    } = this.state

    const { total: totalCount = 0 } = pagination
    const { scenarioValue } = conversionListDate
    dataSource.forEach((s, index) => {
      const { eventId } = s
      s.key = eventId
      dataSource[index] = s
    })

    const columns = [
      {
        title: '',
        dataIndex: 'runningStatus',
        key: 'runningStatus',
        width: 30,
        render: (text) => {
          return text === 'TESTING' ? <div className="running-status">试</div>
            : text === 'AB_TEST' ? <div className="running-status ab-test">A/B</div> : null
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
        width: 120,
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '策略名称',
        dataIndex: 'strategyName',
        key: 'strategyName',
        width: '10%',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '决策结果',
        dataIndex: 'decisionResult',
        key: 'decisionResult',
        width: 90,
        render: (text, record) => {
          const { decisionResult, finalScore } = record
          if (decisionResult) {
            const decision = riskPolicyMap[decisionResult] || {}
            const { decisionName = '', riskGrade = '' } = decision || {}
            return <span className={`risk-grade risk-grade-${riskGrade.toLocaleLowerCase()} text-overflow`}>
              {decisionName}{finalScore !== undefined ? ` (${finalScore})` : ''}
            </span>
          }
          return finalScore
        }
      }, {
        title: '人工结果',
        dataIndex: 'verifyResult',
        key: 'verifyResult',
        width: 90,
        render: (text) => {
          if (!text) {
            return ''
          }
          const { decisionName = '', riskGrade = '' } = riskPolicyMap[text] || {}
          return <span className={`risk-grade risk-grade-${riskGrade.toLocaleLowerCase()} text-overflow`}>
            {decisionName}</span>
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 135,
        render: (text, record, index) => {
          const { decisionResult } = record
          const list = riskPolicyList.filter(riskPolicy => {
            return riskPolicy.decisionCode !== decisionResult
          })
          const { decisionCode: changedDecisionResultDefault } = list[0] || {}
          const { eventId, markable, changedDecisionResult = changedDecisionResultDefault } = record
          const {
            beginDateVal,
            endDateVal,
            businessLineId,
            appIdVal,
            scenarioNameVal,
            strategyTypeVal,
            decisionResultVal,
            beginScore = null,
            endScore = null,
            advanceVisible = false,
            businessFields = [],
            hitRuleIds = [],
            advanceData = {}
          } = this.state
          const { pageSize, current } = pagination
          const conditions = {
            beginDateVal,
            endDateVal,
            businessLineId,
            appIdVal,
            scenarioNameVal,
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
          return <Fragment><span className="operation-span"><Link to={{
            pathname: `/risk/event/list/detail`,
            state: {
              backUrl: '/risk/event/list',
              conditions,
              ...record,
              isTesting: false,
              breadCrumb: ['风险分析', '事件监控', '事件信息', `详情(${eventId})`],
              operation: 'VIEW'
            }
          }} className={'i-cursor'}>详情</Link></span>
            {
              this.state.isQueryPermissions
                ? <span className="operation-span"
                        onClick={() => this.conversionShow(record)}>转化</span> : null
            }
            {
              markable === 'TRUE'
                ? <Popconfirm overlayClassName="mark" icon={null} placement="leftBottom"
                              title={<Fragment>人工结果:
                                <Select value={changedDecisionResult}
                                        style={{ width: 170, marginLeft: 10 }}
                                        onChange={(value) => this.changeDecisionResult(value, index)}>
                                  {
                                    list.map(riskPolicy => {
                                      const { decisionName, decisionCode } = riskPolicy
                                      return (
                                        <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>
                                      )
                                    })
                                  }</Select></Fragment>}
                              okText="确定" cancelText="取消"
                              onConfirm={() => this.markEvent(index, changedDecisionResult)}>
                  <span className="operation-span">标记</span>
                </Popconfirm> : null
            }
          </Fragment>
        }
      }]

    return (<Fragment>
        <LayoutRight className="no-bread-crumb">
          <div className="region-zd">
            <div style={{ paddingBottom: 20 }}>
              <RangePicker style={{ width: 220 }} onChange={this.occurTimeChange}
                           value={occurTimeVal}
                           defaultValue={occurTimeVal} format="YYYY-MM-DD"
                           onCalendarChange={this.onCalendarChange}
                           disabledDate={this.disabledDate} />
              <Input placeholder="事件流水号" style={{ width: 220 }} value={eventId} onChange={this.onEventIdChange} />
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
              <Select value={appIdVal} onChange={(e) => this.onSelectChange(e, 'appIdVal')} placeholder="应用" allowClear
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
            </div>
            <div>
              <Select value={scenarioNameVal} placeholder="场景" style={{ width: 220 }}
                      onChange={(e) => this.onSelectChange(e, 'scenarioNameVal')} allowClear disabled={!businessLineId}>
                {
                  sceneList.map((scene) => {
                    const { scenarioDicId, scenarioName, scenarioValue } = scene
                    return (
                      <Option key={scenarioDicId} value={scenarioValue}>{scenarioName}</Option>
                    )
                  })
                }
              </Select>
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
              <Button type="primary" onClick={this.onQueryClick} style={{ marginRight: '10px' }}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
              <a style={{ textDecoration: 'underline' }} onClick={this.onAdvanceQueryClick}>高级查询</a>
            </div>
          </div>
          <Modal
            title="事件导出"
            wrapClassName="edit-confirm-modal"
            visible={showExport}
            maskClosable={false}
            confirmLoading={exportDisable}
            okText="确认"
            cancelText="取消"
            style={{ textAlign: 'center' }}
            onCancel={this.exportCancel}
            onOk={this.exportEvent}
          >
            选择确定，将导出{totalCount}条数据
          </Modal>
          <Modal
            title="提示"
            wrapClassName="edit-confirm-modal"
            visible={showPrompt}
            maskClosable={false}
            okText="确认"
            cancelText="取消"
            onCancel={() => this.setState({ showPrompt: false })}
            onOk={this.onVerify}
          >
            决策结果修改后，将无法再次修改，是否继续？
          </Modal>
          <div style={{ height: 'calc(100% - 105px)', overflowY: 'scroll' }}>
            <Table className="table-layout-fixed event-list" columns={columns} dataSource={dataSource}
                   onChange={this.handleChange}
                   pagination={pagination} />
          </div>
        </LayoutRight>

        <Modal title="案件转化"
               visible={this.state.conversionVisible} okText="确认"
               onOk={this.onOk}
               onCancel={this.onCancel}
               cancelText="取消">
          <Form>

            <FormItem {...formItemLayout} label={'应用'}>
              {
                getFieldDecorator('appId', {
                  rules: [{
                    required: true, message: '请选择应用'
                  }]
                })(
                  <Select placeholder="应用"
                          style={{ width: '100%' }} disabled>
                    {
                      appSelect.map(app => {
                        const { appId, appName } = app
                        return (
                          <Option key={appId} value={appId}>{appName}</Option>
                        )
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label={'场景'}>
              {
                getFieldDecorator('scenarioValues', {
                  initialValue: [scenarioValue],
                  rules: [{
                    required: true, message: '请选择场景'
                  }],
                  onChange: this.scenarioValueChange
                })(
                  <Select placeholder="场景"
                          mode="multiple"
                          style={{ width: '100%' }}>
                    {
                      sceneList.map((scene) => {
                        const { scenarioDicId, scenarioName, scenarioValue } = scene
                        return (
                          <Option key={scenarioDicId} value={scenarioValue}>{scenarioName}</Option>
                        )
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label={'风险类型'}>
              {
                getFieldDecorator('caseRisks', {
                  rules: [{
                    required: true, message: '请选择'
                  }]
                })(
                  <Select placeholder="请选择"
                          mode="multiple"
                          style={{ width: '100%' }}>
                    {
                      caseRiskList.map((key) => {
                        return (
                          <Option key={key} value={key}>{CASE_RISK[key]}</Option>
                        )
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label={'案件主体类型'}>
              {
                getFieldDecorator('caseSubjectName', {
                  rules: [{
                    required: true, message: '请选择'
                  }],
                  onChange: this.caseSubjectCodeChange
                })(
                  <Select placeholder="请选择"
                          style={{ width: '100%' }}>
                    {
                      caseSubjectList.map((data) => {
                        const { subjectName, subjectCode } = data
                        return (
                          <Option key={subjectCode} value={subjectName}>{CASE_SUBJECT[subjectName]}</Option>
                        )
                      })
                    }
                  </Select>
                )
              }
            </FormItem>
            <FormItem {...formItemLayout} label={'案件主体标识'}>
              {
                getFieldDecorator('caseSubjectValue', {
                  rules: [{
                    required: true, message: '案件主体标识不存在'
                  }]
                })(
                  <Input placeholder="案件主体标识" style={{ width: '100%' }} disabled />
                )
              }
            </FormItem>
          </Form>
        </Modal>
        <AdvanceQuery visible={advanceVisible}
                      beginDate={beginDateVal}
                      endDate={endDateVal}
                      businessLineId={businessLineId}
                      appId={appIdVal}
                      scenarioValue={scenarioNameVal}
                      businessFields={businessFields}
                      hitRuleIds={hitRuleIds}
                      callback={this.advanceCallback}
                      onClose={this.onClose}
                      onQuery={this.onQuery} />
      </Fragment>
    )
  }

  changeDecisionResult = (changedDecisionResult, index) => {
    const { dataSource } = this.state
    dataSource[index].changedDecisionResult = changedDecisionResult
    this.setState({ dataSource })
  }

  markEvent = (index, decisionResult) => {
    const { dataSource, pagination } = this.state
    const { eventId, changedDecisionResult } = dataSource[index]
    markEvent({ eventId, decisionCode: changedDecisionResult || decisionResult }).then(data => {
      this.onEventQuery(pagination.current)
    })
  }

  handlePermissions = (userPermissions) => {
    const { userPermissions: prop = {} } = this.props
    if (!userPermissions) {
      userPermissions = prop
    }
    let perms = []
    if (userPermissions['/risk/event/list']) {
      perms = userPermissions['/risk/event/list'].map(item => item.id)
    }
    const isQueryPermissions = perms.includes(93)
    const isCreatePermissions = perms.includes(100)
    console.log('isQueryPermissions', isQueryPermissions, perms)
    this.setState({ isCreatePermissions, isQueryPermissions })
  }
  onCancel = () => {
    this.props.form.resetFields()
    this.setState({ conversionVisible: false })
  }
  onOk = e => {
    this.props.form.validateFields((err, values) => {
      console.log('onSubmit', values)
      if (!err) {
        const { caseSubjectName, scenarioValues, caseRisks } = values
        const { caseSubjectList = [], conversionListDate } = this.state
        const { subjectCode: caseSubjectCode } = caseSubjectList.find(item => item.subjectName === caseSubjectName)
        const { occurTime, eventId } = conversionListDate
        let data = {
          ...values,
          caseSubjectCode,
          endTime: occurTime,
          startTime: occurTime,
          relatedEventIds: eventId,
          caseSource: 'EVENT_TRANSFER',
          scenarioValues: scenarioValues.join(','),
          caseRisks: caseRisks.join(',')
        }
        createCase(data).then(res => {
          this.onCancel()
        }).catch((data) => {
          notification.warning(data.content)
        })
      }
    })
  }

  scenarioValueChange = e => {
    const { conversionListDate = {} } = this.state
    const { scenarioValue } = conversionListDate
    // let { scenarioValues } = this.props.form.getFieldsValue(['scenarioValues']) || []
    if (scenarioValue && e.indexOf(scenarioValue) === -1) {
      e.unshift(scenarioValue)
      console.log('scenarioValueChange', e)
      this.props.form.setFieldsValue({ scenarioValues: e })
    }
  }
  caseSubjectCodeChange = e => {
    const { conversionListDate = {} } = this.state
    const { account, merchantNo, transAccountNo, cardNo, businessLineId } = conversionListDate
    let caseSubjectValue
    switch (e) {
      case 'ACCOUNT': {
        caseSubjectValue = account
        break
      }
      case 'MERCHANT': {
        caseSubjectValue = merchantNo
        break
      }
      case 'BANK_CARD': {
        if (businessLineId === 2) {
          caseSubjectValue = cardNo
        } else if (businessLineId === 3) {
          caseSubjectValue = transAccountNo
        }
        break
      }
    }
    this.props.form.setFieldsValue({ caseSubjectValue })
  }
  getCaseRisk = () => {
    getCaseRisk().then(res => {
      const { content = [] } = res
      this.setState({
        caseRiskList: content
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }
  getCaseSubject = (businessLineId) => {
    getCaseSubject({ businessLineId }).then(res => {
      const { content = [] } = res
      this.setState({
        caseSubjectList: content
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  conversionShow = (data) => {
    const { appId, eventId } = data
    const { appSelect } = this.props
    eventValidation({ eventId }).then(res => {
      const { businessLineId } = appSelect.find(item => appId === item.appId)
      this.getCaseSubject(businessLineId)
      this.props.form.setFieldsValue({ appId })
      this.setState({ conversionVisible: true, conversionListDate: { ...data, businessLineId } })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }
  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.onEventQuery(pagination.current, pagination.pageSize)
    })
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

  onClearClick = () => {
    this.setState({
      eventId: undefined,
      advanceData: {},
      businessFields: [],
      hitRuleIds: [],
      businessLineId: undefined,
      beginScore: null,
      endScore: null,
      appIdVal: undefined,
      scenarioNameVal: undefined,
      occurTimeVal: [moment(), moment()],
      beginDateVal: new Date().format('yyyy-MM-dd') + ' 00:00:00',
      endDateVal: new Date().format('yyyy-MM-dd') + ' 23:59:59',
      deviceFingerprintVal: '',

      eventLiushuiIdVal: '',
      accountNameVal: '',
      accountIdVal: '',
      mobileVal: '',

      finalScoreVal: '',
      hitrulesVal: '',
      decisionResultVal: undefined,
      ipAddressVal: '',

      provinceVal: undefined,
      ipCityVal: undefined,
      mobileProvinceVal: undefined,
      strategyTypeVal: undefined,
      runningStatusVal: undefined,
      cardScoreVal: undefined,
      mobileCityVal: undefined
    })
  }

  getCurParams = () => {
    const {
      appIdVal,
      scenarioNameVal,
      beginDateVal,
      endDateVal,
      deviceFingerprintVal,

      eventLiushuiIdVal,
      accountNameVal,
      accountIdVal,
      mobileVal,

      finalScoreVal,
      hitrulesVal,
      decisionResultVal,
      ipAddressVal,

      provinceVal,
      ipCityVal,
      mobileProvinceVal,
      strategyTypeVal,
      runningStatusVal,
      cardScoreVal,
      mobileCityVal
    } = this.state

    return {
      strategyType: strategyTypeVal,
      runningStatus: runningStatusVal,
      cardScore: cardScoreVal,
      appId: appIdVal,
      scenarioValue: scenarioNameVal || '',
      beginDate: beginDateVal,
      endDate: endDateVal,
      deviceFingerprint: deviceFingerprintVal,

      eventLiushuiId: eventLiushuiIdVal,
      accountName: accountNameVal,
      accountId: accountIdVal,
      mobile: mobileVal,

      finalScore: finalScoreVal,
      hitrules: hitrulesVal,
      decisionResult: decisionResultVal || '',
      ipAddress: ipAddressVal,

      province: provinceVal || '',
      ipCity: ipCityVal || '',
      mobileProvince: mobileProvinceVal || '',
      mobileCity: mobileCityVal || ''
    }
  }

  changeBaseScore = (e, field) => {
    this.setState({
      [field]: e
    })
  }

  onQueryClick = () => {
    this.realParam = this.state
    this.onEventQuery()
  }

  onEventQuery = async (pageNum = 1, limit = 0) => {
    const {
      businessLineId,
      appIdVal,
      scenarioNameVal,
      beginDateVal,
      endDateVal,
      eventId,
      decisionResultVal,
      strategyTypeVal,
      beginScore = null,
      endScore = null,
      advanceData = {}
    } = this.realParam

    const { pagination } = this.state

    const { pageSize } = pagination
    const numPerPage = limit || pageSize

    let data = {
      businessLineId,
      isTesting: false,
      beginDate: beginDateVal,
      endDate: endDateVal,
      eventId,
      appId: appIdVal,
      scenarioValue: scenarioNameVal,
      strategyType: strategyTypeVal,
      pageNum,
      numPerPage,
      ...advanceData
    }
    if (['RULE_SET', 'DECISION_TREE', 'DECISION_STREAM'].indexOf(strategyTypeVal) !== -1) {
      data = {
        ...data,
        decisionPolicy: decisionResultVal
      }
    }
    if (strategyTypeVal === 'SCORE_CARD') {
      data = {
        ...data,
        beginScore,
        endScore
      }
    }
    const { promise } = await getEventQueryList(data)
    promise.then(res => {
      const { content = {} } = res
      const { pageModel: { result: data = [], pageNum: page, totalCount: total } = {} } = content
      pagination.total = total
      pagination.current = page

      this.setState({
        pagination,
        dataSource: data
      })
      this.onClose()
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value }, () => {
      if (field === 'businessLineId') {
        this.setState({
          appIdVal: undefined,
          scenarioNameVal: undefined
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

  occurTimeChange = (date, dateStr) => {
    const isClear = date.length === 0
    this.setState({
      occurTimeVal: date,
      beginDateVal: isClear ? '' : dateStr[0] + ' 00:00:00',
      endDateVal: isClear ? '' : dateStr[1] + ' 23:59:59'
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
    const { occurTimeVal = [], maxDateInterval = 0 } = this.state
    if (occurTimeVal.length === 0) {
      return false
    }
    const startDay = occurTimeVal[0]
    const endDay = occurTimeVal[1]
    const startStr = startDay.format('YYYY-MM-DD')
    if (startDay && endDay) {
      return false
    }
    return !(current.valueOf() >= startDay.valueOf() && current.valueOf() < moment(startStr).add(maxDateInterval, 'days').valueOf())
  }

  onEventIdChange = e => {
    this.setState({
      eventId: e.target.value
    })
  }

  exportCancel = () => {
    this.setState({
      showExport: false,
      exportDisable: false
    })
  }

  exportEvent = () => {
    this.setState({ exportDisable: true }, async () => {
      const { promise } = await exportStart(this.getCurParams())
      promise.then((data) => {
        const { actionStatus = '', content = {} } = data
        if (actionStatus === SUCCESS) {
          const { exportFileName, exportFileStatus } = content
          this.timer = setInterval(() => {
            const { promise } = exportStatus({
              csvStatus: exportFileStatus
            })
            promise.then((data) => {
              const { content = {} } = data
              const { exportStatus } = content
              if (exportStatus === 'done') {
                clearInterval(this.timer)
                this.setState({
                  showExport: false,
                  exportDisable: false
                }, () => {
                  window.location.href = `/${DMS_PREFIX}/event/event/exportDone.do?fileName=${exportFileName}&token=${getToken()}`
                })
              }
            }).catch((data) => {
              clearInterval(this.timer)
              const { content = {} } = data
              notification.warn(content)
            })
          }, 2000)
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    })
  }

  onVerify = async () => {
    const { eventId, decisionResult } = this.state
    const { promise } = await this.props.verifyUpdate({
      eventId,
      decisionResult
    })
    promise.then((data) => {
      const { actionStatus = '' } = data
      if (actionStatus === SUCCESS) {
        this.setState({
          showPrompt: false
        }, () => {
          this.onEventQuery()
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
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
      this.onQueryClick()
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(EventList))
