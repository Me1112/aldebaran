import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Table, Select, DatePicker, notification, Modal, Button } from 'antd'
import {
  getEventQueryList,
  getProvinceList,
  getCityList,
  exportStart,
  exportStatus,
  verifyUpdate
} from '../../../action/event'
import { getAppList } from '../../../action/system'
import { getSceneList } from '../../../action/rule'
import { Map } from 'immutable'
import moment from 'moment'
import { getToken } from '../../../util'
import './index.less'
import { DMS_PREFIX, SUCCESS } from '../../../common/constant'
import LayoutRight from '../../../component/layout_right'
import { getBusinessLinesNoNormal } from '../../../action/common'
import AdvanceQuery from '../../../component/advance_query'

const { RangePicker } = DatePicker
const { Option } = Select

const DecisionList = [{ 'name': '拒绝', 'value': 'reject' },
  { 'name': '通过', 'value': 'pass' }, { 'name': '人工审核', 'value': 'verify' }]
const DATETIME = 'DATETIME'
const BOOLEAN = 'BOOLEAN'
const DECIMAL = 'DECIMAL'
const STRING = 'STRING'
const ENUM = 'ENUM'

function mapStateToProps(state) {
  const { event = Map({}), system = Map({}), rule = Map({}) } = state
  const {
    eventQueryContent = {}, totalCount = 10, provinceList = []
  } = event.toJS()
  const { appSelect = [] } = system.toJS()
  const { sceneList = [] } = rule.toJS()
  return {
    eventQueryContent,
    totalCount,
    sceneList,
    provinceList,
    appSelect
  }
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

class InspectList extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const {
      scenarioNameVal = undefined, beginDateVal = new Date().format('yyyy-MM-dd') + ' 00:00:00',
      endDateVal = new Date().format('yyyy-MM-dd') + ' 23:59:59',
      provinceVal = undefined, ipCityVal = undefined, businessLineId = undefined, businessFields = [], hitRuleIds = [],
      advanceData = {}
    } = state

    this.state = {
      pagination: {
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      businessLineId,
      businessFields,
      hitRuleIds,
      decisionResultVal: 'verify',

      channelVal: undefined,
      scenarioNameVal,

      occurTimeVal: [moment(beginDateVal), moment(endDateVal)],
      beginDateVal,
      endDateVal,
      strategyTypeVal: undefined,

      eventLiushuiIdVal: '',
      accountNameVal: '',
      accountIdVal: '',
      mobileVal: '',

      riskIndexVal: '',
      ipAddressVal: '',

      provinceVal,
      ipCityVal,
      mobileProvinceVal: undefined,
      mobileCityVal: undefined,

      page: 0,
      current: 1,
      size: 10,

      showMore: false,
      showExport: false,
      exportDisable: false,
      showPrompt: false,
      eventId: '',
      decisionResult: '',

      ipCityList: [],
      mobileCityList: [],

      eventQueryContent: {},
      totalCount: 0,
      advanceData,
      ...state
    }
  }

  static propTypes = {
    location: PropTypes.object,
    getSceneList: PropTypes.func.isRequired,
    verifyUpdate: PropTypes.func.isRequired,
    getAppList: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    sceneList: PropTypes.array.isRequired,
    appSelect: PropTypes.array.isRequired
  }

  componentDidMount() {
    this.getBusinessLinesNoNormal()
    this.props.getAppList()
    this.props.getSceneList()
    this.realParam = { ...this.state }
    this.onEventQuery()
  }

  render() {
    const { appSelect, sceneList } = this.props
    const {
      pagination,
      businessLineId,
      appIdVal,
      strategyTypeVal,
      scenarioNameVal,
      occurTimeVal,
      decisionResultVal,
      current,
      size,
      showMore,
      showExport,
      exportDisable,
      showPrompt,
      businessLineList = [],
      beginDateVal,
      endDateVal,
      dataSource = [],
      advanceVisible = false,
      businessFields = [],
      hitRuleIds = []
    } = this.state

    const { total: totalCount = 0 } = pagination

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
        render: () => {
          return <span className={'reason-verify'}>人工审核</span>
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 70,
        render: (text, record) => {
          return <span className="operation-span"
                       onClick={() => {
                         this.props.history.push({
                           pathname: '/risk/task/inspect/detail',
                           state: {
                             operation: true,
                             isTesting: false,
                             ...record,
                             backUrl: '/risk/task/inspect',
                             breadCrumb: ['风险分析', '任务中心', '事件核查', '详情'],
                             conditions: { current, size, ...this.getCurConditions() }
                           }
                         })
                       }}>审核</span>
        }
      }]

    return (<Fragment>
        <LayoutRight breadCrumb={['风险分析', '任务中心', '事件核查']}>
          <div className="region-zd">
            <div style={{ paddingBottom: 20 }}>
              <RangePicker style={{ width: 220 }} onChange={this.occurTimeChange}
                           value={occurTimeVal} allowClear={false}
                           defaultValue={occurTimeVal} format="YYYY-MM-DD" />
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
                      style={{ width: 180 }} disabled={!businessLineId}>
                {
                  appSelect.map(app => {
                    const { appId, appName } = app
                    return (
                      <Option key={appId} value={appId.toString()}>{appName}</Option>
                    )
                  })
                }
              </Select>
              <Select value={scenarioNameVal} placeholder="场景" style={{ width: 180 }}
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
            </div>
            <div>
              <Select value={strategyTypeVal} placeholder={'策略类型'} style={{ width: 220 }}
                      onChange={(e) => this.onSelectChange(e, 'strategyTypeVal')} allowClear>
                <Option key={'RULE_SET'} value={'RULE_SET'}>规则集</Option>
                <Option key={'DECISION_TREE'} value={'DECISION_TREE'}>决策树</Option>
                <Option key={'DECISION_STREAM'} value={'DECISION_STREAM'}>决策流</Option>
              </Select>
              <Select value={decisionResultVal} placeholder="决策结果" style={{ width: 220 }} disabled>
                {
                  DecisionList.map((decision) => {
                    const { name, value } = decision
                    return (
                      <Option key={value} value={value}>{name}</Option>
                    )
                  })
                }
              </Select>
              <Button type="primary" onClick={() => {
                this.realParam = { ...this.state }
                this.onEventQuery()
              }} style={{ marginRight: '10px' }}>查询</Button>
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
          <div style={{ height: `calc(100% - ${showMore ? 201 : 52}px)`, overflowY: 'scroll' }}>
            <Table className="table-layout-fixed inspect-list" columns={columns} dataSource={dataSource}
                   pagination={pagination} onChange={this.handleChange} />
          </div>
        </LayoutRight>
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

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.onEventQuery(pagination.current)
    })
  }

  onClearClick = () => {
    this.setState({
      advanceData: {},
      businessFields: [],
      hitRuleIds: [],
      businessLineId: undefined,
      channelVal: undefined,
      scenarioNameVal: undefined,
      occurTimeVal: [moment(), moment()],
      beginDateVal: new Date().format('yyyy-MM-dd') + ' 00:00:00',
      endDateVal: new Date().format('yyyy-MM-dd') + ' 23:59:59',
      strategyTypeVal: undefined,

      accountNameVal: '',
      accountIdVal: '',
      mobileVal: '',

      riskIndexVal: '',
      decisionResultVal: 'verify',
      ipAddressVal: '',

      provinceVal: undefined,
      ipCityVal: undefined,
      mobileProvinceVal: undefined,
      mobileCityVal: undefined,
      appIdVal: undefined,
      runningStatusVal: undefined,
      cardScoreVal: ''
    }, () => {
      this.realParam = { ...this.state }
    })
  }

  getCurConditions = () => {
    const {
      businessLineId,
      businessFields,
      hitRuleIds,

      channelVal,
      scenarioNameVal,
      beginDateVal,
      endDateVal,
      strategyTypeVal,

      accountNameVal,
      accountIdVal,
      mobileVal,

      riskIndexVal,
      decisionResultVal,
      ipAddressVal,

      provinceVal,
      ipCityVal,
      mobileProvinceVal,
      mobileCityVal,
      appIdVal,
      runningStatusVal,
      cardScoreVal,
      advanceData = {}
    } = this.state
    return {
      businessLineId,
      businessFields,
      hitRuleIds,

      channelVal,
      scenarioNameVal,
      beginDateVal,
      endDateVal,
      strategyTypeVal,

      accountNameVal,
      accountIdVal,
      mobileVal,

      riskIndexVal,
      decisionResultVal,
      ipAddressVal,

      provinceVal,
      ipCityVal,
      mobileProvinceVal,
      mobileCityVal,
      appIdVal,
      runningStatusVal,
      cardScoreVal,
      advanceData
    }
  }

  getCurParams = () => {
    const {
      channelVal,
      scenarioNameVal,
      beginDateVal,
      endDateVal,
      strategyTypeVal,

      accountNameVal,
      accountIdVal,
      mobileVal,

      riskIndexVal,
      decisionResultVal,
      ipAddressVal,

      provinceVal,
      ipCityVal,
      mobileProvinceVal,
      mobileCityVal,
      appIdVal,
      runningStatusVal,
      cardScoreVal
    } = this.state

    return {
      channel: channelVal || '',
      scenarioValue: scenarioNameVal || '',
      beginDate: beginDateVal,
      endDate: endDateVal,
      strategyType: strategyTypeVal,

      accountName: accountNameVal,
      accountId: accountIdVal,
      mobile: mobileVal,

      riskIndex: riskIndexVal,
      decisionResult: decisionResultVal,
      ipAddress: ipAddressVal,

      province: provinceVal || '',
      ipCity: ipCityVal || '',
      mobileProvince: mobileProvinceVal || '',
      mobileCity: mobileCityVal || '',
      appId: appIdVal,
      runningStatus: runningStatusVal,
      cardScore: cardScoreVal
    }
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

  onEventQuery = async (pageNum = 1) => {
    const {
      pagination,
      businessLineId,
      appIdVal,
      scenarioNameVal,
      beginDateVal,
      endDateVal,
      decisionResultVal,
      strategyTypeVal,
      advanceData = {}
    } = this.realParam
    const { pageSize: numPerPage } = pagination
    let data = {
      decisionPolicy: decisionResultVal,
      businessLineId,
      isTesting: false,
      beginDate: beginDateVal,
      endDate: endDateVal,
      appId: appIdVal,
      scenarioValue: scenarioNameVal,
      strategyType: strategyTypeVal,
      'verifyState': 'unaudited',
      pageNum,
      numPerPage,
      ...advanceData
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
      this.realParam = { ...this.state }
      this.onEventQuery()
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
    console.log('dateStr:', dateStr)
    this.setState({
      occurTimeVal: date,
      beginDateVal: dateStr[0] + ' 00:00:00',
      endDateVal: dateStr[1] + ' 23:59:59'
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
}

export default connect(mapStateToProps, mapDispatchToProps)(InspectList)
