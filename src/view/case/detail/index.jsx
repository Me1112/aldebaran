import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  Collapse,
  Row,
  Col,
  Form,
  Button,
  Table,
  Select,
  Input,
  DatePicker,
  Modal,
  Popconfirm,
  notification
} from 'antd'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import classnames from 'classnames'
import moment from 'moment'
import './index.less'
import LayoutRight from '../../../component/layout_right'
import { getSceneList, getAppSelect } from '../../../action/rule'
import {
  getCaseSubject,
  getCaseRisk,
  getCaseConclusion,
  createCase,
  getCaseEvents,
  getCaseAssigner,
  getCaseDetails,
  updateCase,
  firstAudit,
  lastAudit
} from '../../../action/case'
import {
  CASE_SUBJECT,
  CASE_RISK,
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_VIEW,
  ACTION_FIRST_AUDIT,
  ACTION_LAST_AUDIT,
  CASE_CONCLUSION
} from '../../../common/case'
import { formatDate } from '../../../util'

const { Panel } = Collapse
const { Item: FormItem } = Form
const { Option } = Select
const { TextArea } = Input

function mapStateToProps(state) {
  const { rule = Map(), decision = Map({}) } = state
  const { appSelect = [], sceneList = [] } = rule.toJS()
  const { riskPolicyMap = {} } = decision.toJS()
  return {
    appSelect,
    sceneList,
    riskPolicyMap
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    getAppSelect: bindActionCreators(getAppSelect, dispatch)
  }
}

class CaseDetail extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location

    this.state = {
      pagination: {
        current: 1,
        pageSize: 5,
        showSizeChanger: false,
        showTotal: (total) => `共 ${total} 条`
      },
      eventsPagination: {
        current: 1,
        pageSize: 5,
        showSizeChanger: false,
        showTotal: (total) => `共 ${total} 条`
      },
      ...state
    }
  }

  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object.isRequired,
    getAppSelect: PropTypes.func.isRequired,
    getSceneList: PropTypes.func.isRequired,
    appSelect: PropTypes.array.isRequired,
    sceneList: PropTypes.array.isRequired,
    riskPolicyMap: PropTypes.object.isRequired,
    form: PropTypes.any
  }

  componentDidMount() {
    this.props.getAppSelect()
    this.getCaseRisk()
    this.getCaseConclusion()
    const { actionType } = this.state
    if (actionType !== ACTION_ADD) {
      this.getCaseDetails()
    }
  }

  render() {
    const { riskPolicyMap } = this.props
    const formItemLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 16
      }
    }

    const operate = {
      title: '操作',
      dataIndex: 'operations',
      key: 'operations',
      width: 70,
      render: (text, record) => {
        const { eventId } = record
        return <span className="operation-span" onClick={() => this.delRelatedEvents(eventId)}>删除</span>
      }
    }

    const columns = [
      {
        title: '事件编号',
        dataIndex: 'eventId',
        key: 'eventId',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '场景',
        dataIndex: 'scenarioName',
        key: 'scenarioName',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '发生时间',
        dataIndex: 'occurTime',
        key: 'occurTime',
        width: 180,
        render: (text) => {
          return formatDate(text)
        }
      }, {
        title: '交易金额',
        dataIndex: 'payAmount',
        key: 'payAmount',
        width: 140,
        render: (text, record) => {
          const { payAmount = '--', transAmount = '--' } = record
          let amount = '--'
          switch (businessLineId) {
            case 2:
              amount = transAmount
              break
            case 3:
              amount = payAmount
              break
          }
          return <div title={amount} className="text-overflow">{amount}</div>
        }
      }, {
        title: '决策结果',
        dataIndex: 'decisionResult',
        key: 'decisionResult',
        width: 100,
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
      }]

    const relatedEventsColumns = [...columns]

    const { appSelect, sceneList, form } = this.props
    const { getFieldDecorator } = form
    const {
      caseCode = '', appId, scenarioValues = [], caseRisk = [], caseRisks = [], caseSubjectName, caseSubjectValue = '',
      startTimeM = null, endTimeM = null, description, caseSubject = [], breadCrumb = [], actionType = ACTION_VIEW,
      eventsShow, caseConclusion = [], saving, assigning, caseEvents = [], businessLineId,
      pagination, eventsPagination, selectedRowKeys = [], relatedEvents = [], assignerList = [], assignVisible, assigneeId,
      firstAuditConclusion, firstAuditDescription = '', lastAuditConclusion, lastAuditDescription = ''
    } = this.state

    const { appName, scenarioNameView, caseRiskNameView, caseSubjectNameView, startTime, endTime } = this.state
    if (actionType !== ACTION_VIEW) {
      relatedEventsColumns.push(operate)
    }
    const actions = [ACTION_ADD, ACTION_EDIT, ACTION_FIRST_AUDIT, ACTION_LAST_AUDIT].includes(actionType)
    const edit = [ACTION_EDIT, ACTION_FIRST_AUDIT, ACTION_LAST_AUDIT].includes(actionType)
    const audit = [ACTION_FIRST_AUDIT, ACTION_LAST_AUDIT].includes(actionType)
    const lastStep = [ACTION_LAST_AUDIT].includes(actionType)
    const addEvents = !(appId && scenarioValues.length > 0 && caseRisk.length > 0 && caseSubjectName && caseSubjectValue &&
      startTimeM && endTimeM)

    const rowSelection = {
      columnWidth: 30,
      selectedRowKeys,
      onChange: this.onRowsSelectChange
    }

    const selectedEventAmount = selectedRowKeys.length
    const relatedEventsAmount = relatedEvents.length
    const totalEventAmount = caseEvents.length
    let relatedEventsTotalAmount = 0
    let hasRelatedEventsAmount = false
    relatedEvents.forEach(event => {
      const { payAmount = '--', transAmount = '--' } = event
      switch (businessLineId) {
        case 2:
          if (transAmount !== '--') {
            relatedEventsTotalAmount = relatedEventsTotalAmount + transAmount
            hasRelatedEventsAmount = true
          }
          break
        case 3:
          if (payAmount !== '--') {
            relatedEventsTotalAmount = relatedEventsTotalAmount + payAmount
            hasRelatedEventsAmount = true
          }
          break
      }
    })
    if (!hasRelatedEventsAmount) {
      relatedEventsTotalAmount = '--'
    }
    let totalAmount = 0
    let hasAmount = false
    caseEvents.filter(event => {
      const { eventId } = event
      return selectedRowKeys.includes(eventId)
    }).forEach(event => {
      const { payAmount = '--', transAmount = '--' } = event
      switch (businessLineId) {
        case 2:
          if (transAmount !== '--') {
            totalAmount = totalAmount + transAmount
            hasAmount = true
          }
          break
        case 3:
          if (payAmount !== '--') {
            totalAmount = totalAmount + payAmount
            hasAmount = true
          }
          break
      }
    })
    if (!hasAmount) {
      totalAmount = '--'
    }

    let defaultActiveKeys = ['basic', 'events', 'firstAudit', 'lastAudit']
    if (actionType === ACTION_LAST_AUDIT) {
      defaultActiveKeys = ['events', 'firstAudit', 'lastAudit']
    }

    return (<Fragment>
        <LayoutRight className={classnames('case-detail', { 'actions': actions }, { 'view': !actions })}
                     breadCrumb={breadCrumb}>
          {
            actionType === ACTION_VIEW
              ? <Button style={{ marginLeft: 20, marginTop: 20 }} onClick={this.returnList}>返回列表</Button> : null
          }
          <Collapse bordered={false} defaultActiveKey={defaultActiveKeys}>
            <Panel header="基本信息" key="basic">
              <Row>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="案件编号">
                    <span>{caseCode}</span>
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="涉及应用">
                    {getFieldDecorator('appId', {
                      initialValue: appId,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择涉及应用' }
                        ]
                      }],
                      onChange: this.changeAppId
                    })(
                      actionType === ACTION_VIEW ? <span>{appName}</span>
                        : <Select placeholder="请选择" style={{ width: '100%' }} disabled={edit || lastStep}>
                          {
                            appSelect.map(app => {
                              const { appId, appName, businessLineId } = app
                              return (
                                <Option key={appId} value={appId} bld={businessLineId}>{appName}</Option>
                              )
                            })
                          }
                        </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="涉及场景">
                    {getFieldDecorator('scenarioValues', {
                      initialValue: scenarioValues,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择涉及场景' }
                        ]
                      }],
                      onChange: this.changeScenarioValues
                    })(
                      actionType === ACTION_VIEW ? <span>{scenarioNameView}</span>
                        : <Select placeholder="请选择" style={{ width: '100%' }} mode="multiple"
                                  optionFilterProp="children" disabled={audit || lastStep}>
                          {
                            appId && sceneList.map((scene) => {
                              const { scenarioValue, scenarioName } = scene
                              return (
                                <Option key={scenarioValue} value={scenarioValue}>{scenarioName}</Option>
                              )
                            })
                          }
                        </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="风险类型">
                    {getFieldDecorator('caseRisks', {
                      initialValue: caseRisks,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择风险类型' }
                        ]
                      }],
                      onChange: this.changeCaseRisks
                    })(
                      actionType === ACTION_VIEW ? <span>{caseRiskNameView}</span>
                        : <Select placeholder="请选择" style={{ width: '100%' }} mode="multiple"
                                  optionFilterProp="children" disabled={edit || lastStep}>
                          {
                            caseRisk.map(risk => {
                              return (
                                <Option key={risk} value={risk}>{CASE_RISK[risk]}</Option>
                              )
                            })
                          }
                        </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="涉案主体类型">
                    {getFieldDecorator('caseSubjectName', {
                      initialValue: caseSubjectName,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择涉案主体类型' }
                        ]
                      }],
                      onChange: this.changeCaseSubjectName
                    })(
                      actionType === ACTION_VIEW ? <span>{caseSubjectNameView}</span>
                        : <Select placeholder="请选择" style={{ width: '100%' }} disabled={edit || lastStep}>
                          {
                            caseSubject.map((subject) => {
                              const { subjectCode, subjectName } = subject
                              return (
                                <Option key={subjectName} value={subjectName}
                                        sc={subjectCode}>{CASE_SUBJECT[subjectName]}</Option>
                              )
                            })
                          }
                        </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="主体标识">
                    {getFieldDecorator('caseSubjectValue', {
                      initialValue: caseSubjectValue,
                      validate: [{
                        rules: [
                          { required: true, message: '请输入主体标识' }
                        ]
                      }],
                      onChange: this.changeCaseSubjectValue
                    })(
                      actionType === ACTION_VIEW ? <span>{caseSubjectValue}</span>
                        : <Input placeholder="不超过50个字符" maxLength="50" style={{ width: '100%' }}
                                 disabled={edit || lastStep} />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="开始时间">
                    {getFieldDecorator('startTime', {
                      initialValue: startTimeM,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择开始时间' }
                        ]
                      }],
                      onChange: this.changeStartTime
                    })(
                      actionType === ACTION_VIEW ? <span>{startTime}</span>
                        : <DatePicker placeholder="请选择开始时间" showTime={{ format: 'HH:mm:ss' }}
                                      format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }}
                                      disabled={audit || lastStep}
                                      disabledDate={this.disabledStartDate}
                                      disabledTime={this.disabledStartTime}
                                      allowClear={false} />
                    )}
                  </FormItem>
                </Col>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="结束时间">
                    {getFieldDecorator('endTime', {
                      initialValue: endTimeM,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择结束时间' }
                        ]
                      }],
                      onChange: this.changeEndTime
                    })(
                      actionType === ACTION_VIEW ? <span>{endTime}</span>
                        : <DatePicker placeholder="请选择结束时间" showTime={{ format: 'HH:mm:ss' }}
                                      format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }}
                                      disabled={audit || lastStep}
                                      disabledDate={this.disabledEndDate}
                                      disabledTime={this.disabledEndTime}
                                      allowClear={false} />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={11}>
                  <FormItem {...formItemLayout} label="描述">
                    {getFieldDecorator('description', {
                      initialValue: description,
                      validate: [{
                        rules: [
                          { message: '不超过200个字符' }
                        ]
                      }],
                      onChange: this.changeDescription
                    })(
                      actionType === ACTION_VIEW ? <span>{description}</span>
                        : <TextArea rows={4} placeholder={audit || lastStep ? '' : '不超过200个字符'} maxLength="200"
                                    disabled={audit || lastStep} />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Panel>
            <Panel header="关联事件" key="events">
              <Row style={{ height: 48 }}>
                {
                  actionType !== ACTION_VIEW
                    ? <Button icon="plus" disabled={addEvents} onClick={this.showEvents}>添加关联事件</Button> : null
                }
                <span className="fr">
                  <span>涉案总金额：</span>
                  <span className="amount">{relatedEventsTotalAmount}</span>
                </span>
              </Row>
              <Row>
                <Table rowKey="eventId" className="table-layout-fixed" columns={relatedEventsColumns}
                       dataSource={relatedEvents} pagination={eventsPagination} onChange={this.handleEventsChange} />
              </Row>
            </Panel>
            {
              [ACTION_FIRST_AUDIT, ACTION_LAST_AUDIT].includes(actionType) || (ACTION_VIEW === actionType && firstAuditConclusion)
                ? <Panel header="初审意见" key="firstAudit">
                  <Row className="conclusion">
                    初审结论：{
                    actionType === ACTION_VIEW
                      ? <span>{CASE_CONCLUSION[firstAuditConclusion]}</span>
                      : <Select value={firstAuditConclusion || 'CONFIRMED_CASE'} placeholder="初审结论"
                                style={{ width: 360, marginBottom: 20 }}
                                onChange={(e) => this.onSelectChange(e, 'firstAuditConclusion')} disabled={lastStep}>
                        {
                          caseConclusion.map(conclusion => {
                            return (
                              <Option key={conclusion} value={conclusion}>{CASE_CONCLUSION[conclusion]}</Option>
                            )
                          })
                        }
                      </Select>
                  }
                  </Row>
                  <Row>
                    <span className="top-label">初审描述：</span>
                    {actionType === ACTION_VIEW ? <span>{firstAuditDescription}</span>
                      : <TextArea style={{ width: 360, marginBottom: 20 }} rows={4}
                                  placeholder={lastStep ? '' : '不超过200个字符'}
                                  maxLength="200"
                                  disabled={lastStep} value={firstAuditDescription}
                                  onChange={(e) => this.onSelectChange(e.target.value, 'firstAuditDescription')} />
                    }
                  </Row>
                </Panel> : null
            }
            {
              [ACTION_LAST_AUDIT].includes(actionType) || (ACTION_VIEW === actionType && lastAuditConclusion)
                ? <Panel header="复审意见" key="lastAudit">
                  <Row className="conclusion">
                    复审结论：{
                    actionType === ACTION_VIEW
                      ? <span>{CASE_CONCLUSION[lastAuditConclusion]}</span>
                      : <Select value={lastAuditConclusion || 'CONFIRMED_CASE'} placeholder="复审结论"
                                style={{ width: 360, marginBottom: 20 }}
                                onChange={(e) => this.onSelectChange(e, 'lastAuditConclusion')}>
                        {
                          caseConclusion.map(conclusion => {
                            return (
                              <Option key={conclusion} value={conclusion}>{CASE_CONCLUSION[conclusion]}</Option>
                            )
                          })
                        }
                      </Select>
                  }
                  </Row>
                  <Row>
                    <span className="top-label">复审描述：</span>
                    {
                      actionType === ACTION_VIEW
                        ? <span>{lastAuditDescription}</span>
                        : <TextArea style={{ width: 360, marginBottom: 20 }} rows={4} placeholder="不超过200个字符"
                                    maxLength="200"
                                    value={lastAuditDescription}
                                    onChange={(e) => this.onSelectChange(e.target.value, 'lastAuditDescription')} />
                    }
                  </Row>
                </Panel> : null
            }
          </Collapse>
          {
            actions ? <div className="case-actions">
              <Button type="default" onClick={this.returnList} style={{ marginRight: '20px' }}
                      disabled={saving || assigning}>取消</Button>
              <Button type="primary" onClick={() => this.onSave()} style={{ marginRight: '20px' }}
                      disabled={saving || assigning || relatedEventsAmount === 0} loading={saving}>保存</Button>
              {
                actionType === ACTION_LAST_AUDIT
                  ? <Button type="default" onClick={() => this.onSave(true)} style={{ marginRight: '20px' }}
                            disabled={saving || assigning || relatedEventsAmount === 0}
                            loading={assigning}>保存并结案</Button>
                  : <Popconfirm overlayClassName="assign-auditor" icon={null} placement="topRight" title={<Fragment>
                    提交给：<Select placeholder="请选择分派用户" style={{ width: 200 }}
                                dropdownStyle={{ maxHeight: 100, overflow: 'auto' }}
                                dropdownClassName="assign-auditor"
                                disabled={lastStep} visible={assignVisible} value={assigneeId}
                                onChange={this.changeAssigner}>
                    {
                      assignerList.map((subject) => {
                        const { userId, username } = subject
                        return (
                          <Option key={userId} value={userId} title={username}>{username}</Option>
                        )
                      })
                    }
                  </Select>
                  </Fragment>} onConfirm={() => this.onSave(false, true)} okText="提交" cancelText="">
                    <Button type="default" onClick={this.showAssignAuditor} style={{ marginRight: '20px' }}
                            disabled={saving || assigning || relatedEventsAmount === 0} loading={assigning}>保存并分派</Button>
                  </Popconfirm>
              }
            </div> : null
          }
        </LayoutRight>
        <Modal
          title="添加关联事件"
          className="case-event-modal"
          visible={eventsShow}
          centered
          width={950}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.cancelEventsWindow}
          onOk={this.okEventsWindow}>
          <div className="events-tip">已选择数量（<span
            className="case-amount">{selectedEventAmount}</span>/{totalEventAmount}），涉案总金额：<span
            className="case-total">{totalAmount}</span></div>
          <Table rowKey="eventId" rowSelection={rowSelection} className="table-layout-fixed inspect-list"
                 columns={columns} dataSource={caseEvents} pagination={pagination} onChange={this.handleChange} />
        </Modal>
      </Fragment>
    )
  }

  handleEventsChange = (eventsPagination) => {
    this.setState({ eventsPagination })
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }

  changeAssigner = (assigneeId) => {
    this.setState({ assigneeId })
  }

  getCaseDetails = () => {
    const { id } = this.state
    getCaseDetails({ id }).then(data => {
      const {
        content: {
          appId, appName, businessLineId, caseCode, caseRisks, caseSubjectCode, caseSubjectName, caseSubjectValue,
          startTime, endTime, relatedEventList: relatedEvents, scenarioList = [], description = '', auditRecordList = []
        } = {}
      } = data
      const scenarioValues = scenarioList.map(scenario => {
        const { scenarioValue } = scenario
        return scenarioValue
      })
      const scenarioNameView = scenarioList.map(scenario => {
        const { scenarioName } = scenario
        return scenarioName
      }).join(',')
      const caseRiskNameView = caseRisks.split(',').map(risk => {
        return CASE_RISK[risk]
      }).join(',')
      const selectedRowKeys = relatedEvents.map(event => {
        const { eventId } = event
        return eventId
      })
      let firstAuditId = 0
      let firstAuditConclusion = ''
      let firstAuditDescription = ''
      let lastAuditId = 0
      let lastAuditConclusion = ''
      let lastAuditDescription = ''
      auditRecordList.forEach(audit => {
        const { recordId, caseStatus, caseConclusion, description = '' } = audit
        switch (caseStatus) {
          case ACTION_FIRST_AUDIT:
            firstAuditId = recordId
            firstAuditConclusion = caseConclusion
            firstAuditDescription = description
            break
          case ACTION_LAST_AUDIT:
            lastAuditId = recordId
            lastAuditConclusion = caseConclusion
            lastAuditDescription = description
            break
        }
      })
      this.props.getSceneList({ businessLineId })
      this.getCaseSubject({ businessLineId })
      this.setState({
        firstAuditId,
        firstAuditConclusion,
        firstAuditDescription: firstAuditDescription.trim(),
        lastAuditId,
        lastAuditConclusion,
        lastAuditDescription: lastAuditDescription.trim(),
        caseCode,
        appId,
        businessLineId,
        appSelect: [{ appId, appName, businessLineId }],
        scenarioValues,
        caseRisks: caseRisks.split(','),
        caseSubjectCode,
        caseSubjectName,
        caseSubjectValue: caseSubjectValue.trim(),
        startTime,
        endTime,
        startTimeM: moment(startTime),
        endTimeM: moment(endTime),
        description: description.trim(),
        relatedEvents,
        relatedEventIds: selectedRowKeys,
        selectedRowKeys,
        appName,
        scenarioNameView,
        caseRiskNameView,
        caseSubjectNameView: CASE_SUBJECT[caseSubjectName]
      })
    })
  }

  delRelatedEvents = (id) => {
    const { relatedEvents = [], selectedRowKeys = [] } = this.state
    const newRelatedEvents = relatedEvents.filter(event => {
      const { eventId } = event
      return eventId !== id
    })
    const newSelectedRowKeys = selectedRowKeys.filter(eventId => {
      return eventId !== id
    })
    this.setState({
      relatedEvents: newRelatedEvents,
      relatedEventIds: newSelectedRowKeys,
      selectedRowKeys: newSelectedRowKeys
    })
  }

  showAssignAuditor = () => {
    const { assignVisible, actionType } = this.state
    if ([ACTION_ADD, ACTION_EDIT, ACTION_FIRST_AUDIT].includes(actionType)) {
      let caseStatus
      switch (actionType) {
        case ACTION_ADD:
        case ACTION_EDIT:
          caseStatus = ACTION_FIRST_AUDIT
          break
        case ACTION_FIRST_AUDIT:
          caseStatus = ACTION_LAST_AUDIT
          break
      }
      getCaseAssigner({ caseStatus }).then(data => {
        const { content: assignerList = [] } = data
        const { userId: assigneeId } = assignerList[0] || {}
        this.setState({ assigneeId, assignerList, assignVisible: !assignVisible })
      })
    }
  }

  handleChange = (pagination) => {
    this.setState({ pagination })
  }

  onRowsSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  disabledStartDate = (startValue) => {
    const { endTime, endTimeM } = this.state
    if (!startValue || !endTimeM) {
      return false
    }
    return startValue.valueOf() > endTimeM.valueOf() || startValue.valueOf() < moment(endTime).subtract(90, 'days').valueOf()
  }

  disabledStartTime = (date = moment()) => {
    const { endTimeM = moment() } = this.state
    const hours = endTimeM.hours() // 0~23
    const minutes = endTimeM.minutes() // 0~59
    const seconds = endTimeM.seconds() // 0~59
    if (!date) {
      return false
    }
    // 当日只能选择当前时间之后的时间点
    if (date.format('YYYY-MM-DD') === endTimeM.format('YYYY-MM-DD')) {
      return {
        disabledHours: () => this.range(hours + 1, 60),
        disabledMinutes: () => date.hours() === hours ? this.range(minutes + 1, 60) : [],
        disabledSeconds: () => date.hours() === hours && date.minutes() === minutes ? this.range(seconds + 1, 60) : []
      }
    }
  }

  disabledEndDate = (endValue) => {
    const { startTime, startTimeM } = this.state
    if (!endValue || !startTimeM) {
      return false
    }
    return endValue.valueOf() < startTimeM.valueOf() || endValue.valueOf() > moment(startTime).add(90, 'days').valueOf()
  }

  disabledEndTime = (date = moment()) => {
    const { startTimeM = moment() } = this.state
    const hours = startTimeM.hours()
    const minutes = startTimeM.minutes()
    const seconds = startTimeM.seconds()
    if (!date) {
      return false
    }
    // 当日只能选择当前时间之后的时间点
    if (date.format('YYYY-MM-DD') === startTimeM.format('YYYY-MM-DD')) {
      return {
        disabledHours: () => this.range(0, hours),
        disabledMinutes: () => date.hours() === hours ? this.range(0, minutes) : [],
        disabledSeconds: () => date.hours() === hours && date.minutes() === minutes ? this.range(0, seconds) : []
      }
    }
  }

  range = (start, end) => {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }

  okEventsWindow = () => {
    const { selectedRowKeys, caseEvents } = this.state
    const relatedEvents = caseEvents.filter(event => {
      const { eventId } = event
      return selectedRowKeys.includes(eventId)
    })
    this.setState({ relatedEvents, relatedEventIds: selectedRowKeys, eventsShow: false })
  }

  cancelEventsWindow = () => {
    const { relatedEventIds } = this.state
    this.setState({ selectedRowKeys: relatedEventIds, eventsShow: false })
  }

  showEvents = () => {
    const { pagination, appId, caseSubjectCode, caseSubjectValue, scenarioValues, startTime, endTime, id: caseId } = this.state
    pagination.current = 1
    const data = {
      caseId,
      appId,
      caseSubjectCode,
      caseSubjectValue,
      scenarioValues: scenarioValues.join(','),
      startTime,
      endTime
    }
    getCaseEvents(data).then(data => {
      const { content: caseEvents = [] } = data
      this.setState({ pagination, caseEvents, eventsShow: true })
    })
  }

  changeCaseSubjectValue = (e) => {
    const { target: { value: caseSubjectValue } = {} } = e
    this.setState({ caseSubjectValue })
  }

  changeDescription = (description) => {
    this.setState({ description })
  }

  changeStartTime = (startTimeM, startTime) => {
    this.setState({ startTimeM, startTime })
  }

  changeEndTime = (endTimeM, endTime) => {
    this.setState({ endTimeM, endTime })
  }

  changeCaseRisks = (caseRisks) => {
    this.setState({ caseRisks })
  }

  changeCaseSubjectName = (caseSubjectName, option) => {
    const { props: { sc: caseSubjectCode } = {} } = option || {}
    this.setState({ caseSubjectCode, caseSubjectName })
  }

  getCaseSubject = (data = {}) => {
    getCaseSubject(data).then(data => {
      const { content: caseSubject = [] } = data
      this.setState({ caseSubject })
    })
  }

  getCaseRisk = () => {
    getCaseRisk().then(data => {
      const { content: caseRisk = [] } = data
      this.setState({ caseRisk })
    })
  }

  getCaseConclusion = () => {
    getCaseConclusion().then(data => {
      const { content: caseConclusion = [] } = data
      this.setState({ caseConclusion })
    })
  }

  changeScenarioValues = (scenarioValues) => {
    this.setState({ scenarioValues })
  }

  changeAppId = (appId, option) => {
    if (appId === '') {
      return
    }
    const { props: { bld: businessLineId } = {} } = option || {}
    this.props.form.resetFields(['scenarioValues', 'caseSubjectName'])
    this.setState({
      businessLineId,
      appId,
      scenarioValues: [],
      caseSubjectCode: undefined,
      caseSubjectName: undefined
    }, () => {
      this.props.getSceneList({ businessLineId })
      this.getCaseSubject({ businessLineId })
    })
  }

  onSave = (endCase = false, needAssigner = false) => {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      try {
        const {
          appId, caseRisks = [], scenarioValues = [], caseSource = 'USER_CREATE', caseSubjectValue,
          caseSubjectName, description = ''
        } = values
        const {
          actionType, id, caseSubjectCode, startTime, endTime, relatedEventIds = [], assigneeId,
          firstAuditId, firstAuditConclusion = 'CONFIRMED_CASE', firstAuditDescription = '',
          lastAuditId, lastAuditConclusion = 'CONFIRMED_CASE', lastAuditDescription = ''
        } = this.state
        let data = {
          appId,
          caseRisks: caseRisks.join(','),
          scenarioValues: scenarioValues.join(','),
          caseSource,
          caseSubjectValue,
          caseSubjectName,
          caseSubjectCode,
          description,
          startTime,
          endTime,
          relatedEventIds: relatedEventIds.join(','),
          assigneeId
        }
        let promise

        switch (actionType) {
          case ACTION_FIRST_AUDIT:
            if (needAssigner && !assigneeId) {
              notification.warn({ message: '请选择分派用户' })
              return
            }
            this.setState({ saving: true })
            data = {
              auditOpinion: {
                caseConclusion: firstAuditConclusion,
                description: firstAuditDescription,
                id: firstAuditId
              },
              auditor: assigneeId,
              fraudCaseId: id,
              relatedEventIds: relatedEventIds.join(','),
              stateTrans: !!assigneeId
            }
            promise = firstAudit(data)
            break
          case ACTION_LAST_AUDIT:
            this.setState({ saving: true })
            data = {
              auditOpinion: {
                caseConclusion: lastAuditConclusion,
                description: lastAuditDescription,
                id: lastAuditId
              },
              auditor: assigneeId,
              fraudCaseId: id,
              relatedEventIds: relatedEventIds.join(','),
              stateTrans: endCase
            }
            promise = lastAudit(data)
            break
          default:
            this.setState({ saving: true })
            if (id) {
              data = {
                id,
                scenarioValues: scenarioValues.join(','),
                description,
                startTime,
                endTime,
                relatedEventIds: relatedEventIds.join(','),
                assigneeId: needAssigner ? assigneeId : undefined
              }
              promise = updateCase(data)
            } else {
              promise = createCase(data)
            }
        }

        promise.then(data => {
          this.setState({ saving: false, eventsShow: false }, () => {
            this.returnList()
          })
        }).catch(data => {
          const { content = {} } = data
          this.setState({ saving: false, eventsShow: false }, () => {
            notification.warn(content)
          })
        })
      } catch (err) {
        this.setState({ saving: false, eventsShow: false })
      }
    })
  }

  returnList = () => {
    const { backUrl, conditions = {} } = this.state
    this.props.history.push({ pathname: backUrl, state: { ...conditions } })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(CaseDetail))
