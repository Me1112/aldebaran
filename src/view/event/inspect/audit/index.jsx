import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Map } from 'immutable'
import { Button, Modal, notification, Popconfirm, Radio, Select, Tabs } from 'antd'
import RestoreInfo from './restore'
import DecisionInfo from './decision'
import BehaviorHistory from './history'
import './index.less'
import { formatDate } from '../../../../util'
import {
  getPolicyList,
  getRestoreDataList,
  getTopOne,
  handleStatus,
  markEvent,
  verifyUpdate
} from '../../../../action/event'
import { getRestoreDataList4VerifyTask } from '../../../../action/data'
import { bindActionCreators } from 'redux'
import connect from 'react-redux/es/connect/connect'
import LayoutRight from '../../../../component/layout_right'
import { HANDLE_STATUS } from '../../../../common/constant'

const INSPECT_AUDIT_RESTORE = 'INSPECT_AUDIT_RESTORE'
const INSPECT_AUDIT_RESTORE_VERIFY = 'INSPECT_AUDIT_RESTORE_VERIFY'
const INSPECT_AUDIT_DECISION = 'INSPECT_AUDIT_DECISION'
const INSPECT_AUDIT_DECISION_VERIFY = 'INSPECT_AUDIT_DECISION_VERIFY'
const INSPECT_AUDIT_HISTORY = 'INSPECT_AUDIT_HISTORY'
const InspectAuditTabs = {
  INSPECT_AUDIT_RESTORE: '现场还原',
  INSPECT_AUDIT_RESTORE_VERIFY: '现场还原(验证)',
  INSPECT_AUDIT_DECISION: '决策信息',
  INSPECT_AUDIT_DECISION_VERIFY: '决策信息(验证)',
  INSPECT_AUDIT_HISTORY: '行为历史'
}
const { TabPane } = Tabs
const { Option } = Select
const { Group } = Radio
const { confirm } = Modal

function mapStateToProps(state) {
  const { decision = Map({}) } = state
  const { riskPolicyList = [], riskPolicyMap = {}, riskGradesList = [] } = decision.toJS()
  return { riskPolicyList, riskPolicyMap, riskGradesList }
}

function mapDispatchToProps(dispatch) {
  return {
    verifyUpdate: bindActionCreators(verifyUpdate, dispatch)
  }
}

class InspectAudit extends React.Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {}, pathname } = location
    this.state = {
      restoreData: [],
      pathname,
      ...state
    }
  }

  static propTypes = {
    verifyUpdate: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object,
    riskPolicyMap: PropTypes.object.isRequired,
    riskGradesList: PropTypes.array.isRequired,
    riskPolicyList: PropTypes.array.isRequired
  }

  componentDidMount() {
    this.getRestoreDataList()
    const { operation, eventId } = this.state
    if (operation === 'AUDIT') {
      getPolicyList({ eventId }).then(data => {
        const { content: policyList = [] } = data
        this.setState({ policyList })
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { location = {} } = nextProps
    const { state = {} } = location
    this.setState({ ...state })
  }

  render() {
    const {
      tabKey = INSPECT_AUDIT_RESTORE, showPrompt, operation = true, restoreData, breadCrumb = [],
      appId, eventId, scenarioValue = '', originStrategyId, strategyId, strategyType, isTesting = false, decisionResult, finalScore,
      markable, status = 'CORRECT', policyList = [], loading, loadingNext, runningStatus, strategyName,
      eventAuditDetail: { auditResult = '', auditTime, auditUserCode, auditUserName, manualAudit } = {},
      isVerifyTask = false, verifyResult, showDecisionInfo = true, showVerifyInfo = false, taskId, isOffline
    } = this.state

    console.log('renderrender', this.state, this.props)
    const { name: auditResultName = '' } = HANDLE_STATUS[auditResult] || {}
    const { riskPolicyList = [], riskPolicyMap = {}, riskGradesList = [] } = this.props
    const { decisionName: manualAuditName = '' } = riskPolicyMap[manualAudit] || {}
    const riskPolicyCount = riskPolicyList.length
    if (riskPolicyCount > 0) {
      const { decisionName = '' } = riskPolicyList[riskPolicyCount - 1]
      riskPolicyMap.miss = { decisionName: `未命中（${decisionName}）` }
      riskPolicyMap.hit = { decisionName: '命中' }
    }
    const contants = { riskPolicyMap, riskGradesList }
    const list = riskPolicyList.filter(riskPolicy => {
      return riskPolicy.decisionCode !== decisionResult
    })
    // let defaultSelected = list[0].decisionCode
    let { decisionCode: defaultSelected } = list[0] || {}
    if (operation === 'AUDIT' && policyList[0]) {
      defaultSelected = policyList[0].value
    }
    const { changedDecisionResult = defaultSelected } = this.state
    this.changedDecisionResult = changedDecisionResult
    const auditView = operation === 'VIEW' && auditResult
    let actionView = <div className="event-mark">
      {
        operation === 'VIEW' && markable === 'TRUE'
          ? <Popconfirm overlayClassName="mark" icon={null} placement="leftBottom"
                        title={<Fragment>人工结果:
                          <Select value={changedDecisionResult}
                                  style={{ width: 170, marginLeft: 10 }}
                                  onChange={this.changeDecisionResult}>
                            {
                              list.map(riskPolicy => {
                                const { decisionName, decisionCode } = riskPolicy
                                return (
                                  <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>
                                )
                              })
                            }</Select></Fragment>}
                        okText="确定" cancelText="取消"
                        onConfirm={this.markEvent}>
            <Button type="primary" style={{ marginRight: '20px' }}>标记</Button>
          </Popconfirm> : null
      }
      {isVerifyTask
        ? <Button type="primary" onClick={this.returnList} style={{ marginRight: '10px' }}>返回</Button> : null}
      <Button type="default" onClick={this.backList}>退出</Button>
    </div>
    if (auditView) {
      actionView = <div className="event-audit">
        <div><span className="label">审核结果:</span>
          <span className={`content ${auditResult.toLocaleLowerCase()}`}>{auditResultName}</span>
          {
            manualAudit ? <Fragment>
              <span className="label">人工结果:</span>
              <span className="content">{manualAuditName}</span>
            </Fragment> : null
          }</div>
        <div style={{ marginTop: 10 }}>
          <span className="label">审核人:</span><span className="content" title={auditUserName}>{auditUserCode}</span>
          <span className="label">审核时间:</span>
          <span className="content">{formatDate(auditTime)}</span>
        </div>
        <div>
          <Button type="default" onClick={this.backList}>退出</Button>
        </div>
      </div>
    }
    if (operation === 'AUDIT') {
      actionView = <div className="event-audit">
        <div><span className="label">审核结果:</span>
          <Group size="small" name="handleStatus" onChange={this.changeStatus} value={status}>
            <Radio value="CORRECT">预警无误</Radio>
            <Radio value="INCORRECT">预警有误</Radio>
          </Group></div>
        {
          status === 'INCORRECT' ? <div style={{ marginTop: 10 }}>
            <span className="label">人工结果:</span>
            <Select value={changedDecisionResult} style={{ width: 170 }} size="small"
                    getPopupContainer={() => document.getElementById('eventContainer')}
                    onChange={this.changeDecisionResult}>
              {
                policyList.map(riskPolicy => {
                  const { name, value } = riskPolicy
                  return (
                    <Option key={value} value={value}>{name}</Option>
                  )
                })
              }</Select></div> : null
        }
        <div><Button loading={loading} type="primary" onClick={() => this.handleStatus()}>确定</Button>
          <Button type="default" onClick={this.backList}>取消</Button>
          <Button loading={loadingNext} type="default" onClick={() => this.handleStatus(true)}>确定并下一条</Button></div>
      </div>
    }
    const actionHeight = operation === 'AUDIT' || auditView ? 80 : 32
    const abTestWithoutStrategy = runningStatus === 'AB_TEST' && (!strategyName || (!decisionResult && !finalScore))
    const realVerifyTask = false || (isVerifyTask && (verifyResult || strategyType === 'SCORE_CARD') && isOffline)
    const realVerifyTask4Strategy = !isVerifyTask || realVerifyTask
    return (
      <Fragment>
        <LayoutRight className="join-up event-detail" breadCrumb={breadCrumb}>
          <div style={{ height: `calc(100% - ${actionHeight}px)`, overflowY: 'auto' }} id="eventContainer">
            <Tabs type="card" activeKey={tabKey}
                  className={classnames('tabs-no-border inspect-audit',
                    { 'restore-tab': [INSPECT_AUDIT_RESTORE, INSPECT_AUDIT_RESTORE_VERIFY].includes(tabKey) },
                    { 'audit-content': operation === 'AUDIT' })}
                  onChange={this.tabChange}>
              <TabPane tab={`${InspectAuditTabs[INSPECT_AUDIT_RESTORE]}${showVerifyInfo ? '(生产)' : ''}`}
                       key={INSPECT_AUDIT_RESTORE}>
                <RestoreInfo restoreData={restoreData} />
              </TabPane>
              {
                showVerifyInfo
                  ? <TabPane tab={`${InspectAuditTabs[INSPECT_AUDIT_RESTORE_VERIFY]}`}
                             key={INSPECT_AUDIT_RESTORE_VERIFY}>
                    {
                      tabKey === INSPECT_AUDIT_RESTORE_VERIFY ? <RestoreInfo restoreData={restoreData} /> : null
                    }
                  </TabPane> : null
              }
              {
                abTestWithoutStrategy || (isVerifyTask && !showDecisionInfo) ? null
                  : <TabPane tab={`${InspectAuditTabs[INSPECT_AUDIT_DECISION]}${showVerifyInfo ? '(生产)' : ''}`}
                             key={INSPECT_AUDIT_DECISION}>
                    {
                      tabKey === INSPECT_AUDIT_DECISION
                        ? <DecisionInfo contants={contants} appId={appId} eventId={eventId} scenarioValue={scenarioValue}
                                        strategyId={realVerifyTask4Strategy ? strategyId : originStrategyId}
                                        strategyType={strategyType} taskId={taskId} isTesting={isTesting}
                                        isVerifyTask={realVerifyTask} /> : null
                    }
                  </TabPane>
              }
              {
                showVerifyInfo
                  ? <TabPane tab={`${InspectAuditTabs[INSPECT_AUDIT_DECISION_VERIFY]}`}
                             key={INSPECT_AUDIT_DECISION_VERIFY}>
                    {
                      tabKey === INSPECT_AUDIT_DECISION_VERIFY
                        ? <DecisionInfo contants={contants} appId={appId} eventId={eventId} scenarioValue={scenarioValue}
                                        strategyId={strategyId} strategyType={strategyType} taskId={taskId}
                                        isTesting={isTesting} isVerifyTask /> : null
                    }
                  </TabPane> : null
              }
              {
                isVerifyTask ? null
                  : <TabPane tab={InspectAuditTabs[INSPECT_AUDIT_HISTORY]} key={INSPECT_AUDIT_HISTORY}>
                    <BehaviorHistory contants={contants} eventId={eventId} isTesting={isTesting}
                                     visible={tabKey === INSPECT_AUDIT_HISTORY} />
                  </TabPane>
              }
            </Tabs>
          </div>
          {
            actionView
          }
        </LayoutRight>
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
      </Fragment>
    )
  }

  loadNextRow = () => {
    getTopOne().then(data => {
      const { content } = data
      if (!content) {
        confirm({
          title: '预警信号已处理完毕，系统自动退出审核功能。',
          content: '',
          okText: '知道了',
          okType: 'primary',
          className: 'cancel-none',
          onOk: async () => {
            this.backList()
          }
        })
      } else {
        const { breadCrumb = [], isTesting = false, pathname } = this.state
        const breadCrumbLength = breadCrumb.length
        const { eventId } = content
        if (breadCrumbLength > 0) {
          breadCrumb[breadCrumbLength - 1] = `审核(${eventId})`
        }
        getRestoreDataList({
          eventId,
          isTesting
        }).then(data => {
          const { content: { eventDetailBlocks: restoreData = [] } = {} } = data
          const { state = {} } = this.props.location
          this.setState({
            ...content,
            restoreData,
            loading: false,
            loadingNext: false,
            tabKey: INSPECT_AUDIT_RESTORE
          }, () => {
            this.props.history.push({ pathname, state: { ...state, ...content, breadCrumb } })
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
      }
    })
  }

  handleStatus = (next = false) => {
    const { status = 'CORRECT', id, eventId, policyList = [] } = this.state
    this.setState({ loading: !next, loadingNext: next }, () => {
      handleStatus({ handleStatus: status, id, eventId, riskPolicy: this.changedDecisionResult }).then(data => {
        this.setState({
          status: 'CORRECT',
          changedDecisionResult: policyList[0].value
        }, () => {
          if (next) {
            this.loadNextRow()
          } else {
            this.backList()
          }
        })
      }).catch(data => {
        const { content = {} } = data
        notification.warning(content)
      })
    })
  }

  changeStatus = (e) => {
    this.setState({ status: e.target.value })
  }

  markEvent = () => {
    const { eventId, changedDecisionResult } = this.state
    markEvent({ eventId, decisionCode: changedDecisionResult || this.changedDecisionResult }).then(data => {
      this.setState({ markable: 'FALSE' })
    })
  }

  changeDecisionResult = (changedDecisionResult) => {
    this.setState({ changedDecisionResult })
  }

  getRestoreDataList = () => {
    const { taskId, eventId = '', isTesting = false, isVerifyTask, isOffline, tabKey = INSPECT_AUDIT_RESTORE } = this.state
    let promise = null
    if (isVerifyTask && (tabKey !== INSPECT_AUDIT_RESTORE || isOffline)) {
      promise = getRestoreDataList4VerifyTask({ eventId, taskId })
    } else {
      promise = getRestoreDataList({
        eventId,
        isTesting
      })
    }
    promise.then(data => {
      const { content: { eventDetailBlocks: restoreData = [], eventAuditDetail } = {} } = data
      this.setState({
        restoreData,
        eventAuditDetail,
        loading: false,
        loadingNext: false
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  backList = () => {
    const { backUrl = '/risk/task/inspect', conditions = {} } = this.state
    this.props.history.push({ pathname: backUrl, state: { ...conditions } })
  }

  returnList = () => {
    const {
      returnUrl = '/risk/task/inspect',
      backUrl = '/risk/task/inspect', returnConditions = {}, returnBreadCrumb = []
    } = this.state
    this.props.history.push({
      pathname: returnUrl,
      state: { backUrl, ...returnConditions, breadCrumb: returnBreadCrumb }
    })
  }

  tabChange = (activeKey) => {
    let { restoreData = [] } = this.state
    if ([INSPECT_AUDIT_RESTORE, INSPECT_AUDIT_RESTORE_VERIFY].includes(activeKey)) {
      restoreData = []
    }
    this.setState({ tabKey: activeKey, restoreData }, () => {
      if ([INSPECT_AUDIT_RESTORE, INSPECT_AUDIT_RESTORE_VERIFY].includes(activeKey)) {
        this.getRestoreDataList()
      }
    })
  }

  onVerify = async () => {
    const { eventId, decisionResult } = this.state
    const { promise } = await this.props.verifyUpdate({
      eventId,
      decisionResult
    })
    promise.then((data) => {
      this.setState({
        showPrompt: false
      }, () => {
        this.backList()
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InspectAudit)
