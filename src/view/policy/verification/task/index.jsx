import React, { Component, Fragment } from 'react'
import { Button, notification, Select, Table, Modal, Input, Form, DatePicker, Radio } from 'antd'
import LayoutRight from '../../../../component/layout_right'
import {
  getValidationTaskList,
  getAppSelect,
  getSceneSelect,
  getOfflineDataSelect,
  getOfflineSceneSelect,
  getStrategySelect,
  getCaseSelect,
  updateTask,
  createTask,
  deleteTask
} from '../../../../action/data'
import { RESOURCE_TYPES } from '../../../../common/constant'
import { formatDate } from '../../../../util'
import PropTypes from 'prop-types'
import moment from 'moment'
import { bindActionCreators } from 'redux'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import './index.less'

const confirm = Modal.confirm
const { Option, OptGroup } = Select
const { Item: FormItem } = Form
const { RangePicker } = DatePicker
const { Group: RadioGroup } = Radio

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
}

function mapStateToProps(state) {
  const { verification = Map({}) } = state
  const { appSelect = [], sceneSelect = [] } = verification.toJS()
  return {
    sceneSelect,
    appSelect
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getAppSelect: bindActionCreators(getAppSelect, dispatch),
    getSceneSelect: bindActionCreators(getSceneSelect, dispatch),
    getOfflineSceneSelect: bindActionCreators(getOfflineSceneSelect, dispatch)
  }
}

@Form.create()
class VerificationTask extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const { pageNum = 1, pageSize = 10 } = state
    this.realParam = { ...state }
    this.state = {
      pagination: {
        current: pageNum,
        pageSize: pageSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      ...state
    }
  }

  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.object,
    location: PropTypes.object,
    appSelect: PropTypes.array.isRequired,
    sceneSelect: PropTypes.array.isRequired,
    getAppSelect: PropTypes.func.isRequired,
    getSceneSelect: PropTypes.func.isRequired,
    getOfflineSceneSelect: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.realParam = { ...this.state }
    const { pageNum } = this.realParam
    this.getDataList(pageNum)
    this.props.getAppSelect()
    this.getOfflineDataSelect()
  }

  render() {
    const { form, appSelect = [], sceneSelect = [] } = this.props
    const {
      name, status, loading, pagination, dataSource = [], record = {}, visible = false, offlineDataSelect = [],
      strategySelect = [], caseSelect = [], isView = false
    } = this.state
    const { getFieldProps } = form
    const {
      taskName = '', taskDataType = 'HISTORIC_ONLINE_DATA', appId, scenarioId, startTime: onlineDataStartTime = '',
      endTime: onlineDataEndTime = '', strategyId, strategyType, executionStrategy: taskExecutionStrategy = 'RUN_IMMEDIATELY',
      executionTime: taskExecutionTime, offlineDataId, caseSampleId
    } = record
    const timeRange = taskName ? [moment(onlineDataStartTime), moment(onlineDataEndTime)] : undefined
    const columns = [
      {
        title: '任务名称',
        dataIndex: 'taskName',
        key: 'taskName',
        width: '15%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      },
      {
        title: '验证策略',
        dataIndex: 'strategyName',
        key: 'strategyName',
        width: '15%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      },
      {
        title: '任务状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (text, { finishedPercent = 0 }) => {
          let css = ''
          switch (text) {
            case 'WAITING':
              css = 'task-waiting'
              text = '等待中'
              break
            case 'EXECUTING':
              css = 'task-executing'
              text = `执行中(${finishedPercent}%)`
              break
            case 'FINISHED':
              css = 'task-finished'
              text = '已完成'
              break
          }
          return <span className={`risk-grade ${css}`}>{text}</span>
        }
      },
      {
        title: '任务耗时',
        dataIndex: 'timeSpent',
        key: 'timeSpent',
        width: 150,
        render: text => {
          return text !== undefined ? `${text}分钟` : '--'
        }
      }, {
        title: '创建人',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: 200,
        render: text => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 180,
        key: 'createTime',
        render: text => {
          return formatDate(text)
        }
      }, {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        render: (text, record) => {
          const { status, taskName } = record
          return <Fragment>
            {
              status === 'WAITING' ? <span className="operation-span" onClick={() => {
                this.onEdit(record)
              }}>编辑</span> : null
            }
            {
              status === 'WAITING' ? <span className="operation-span" onClick={() => {
                confirm({
                  title: '是否确认删除?',
                  content: '',
                  okText: '确定',
                  okType: 'primary',
                  cancelText: '取消',
                  onOk: async () => {
                    this.delData(record)
                  }
                })
              }}>删除</span> : null
            }
            {
              status !== 'WAITING' ? <span className="operation-span" onClick={() => {
                this.onView(record)
              }}>查看</span> : null
            }
            {
              status === 'FINISHED' ? <span className="operation-span" onClick={() => {
                this.props.history.push({
                  pathname: '/policy/verification/task/result',
                  state: {
                    ...record,
                    backUrl: '/policy/verification/task',
                    breadCrumb: ['验证任务', `结果(${taskName})`],
                    conditions: this.getCurrentParams()
                  }
                })
              }}>结果</span> : null
            }
          </Fragment>
        }
      }
    ]

    const {
      appId: appIdVal,
      scenarioId: scenarioIdVal,
      taskDataType: taskDataTypeVal,
      offlineDataId: offlineDataIdVal,
      taskExecutionStrategy: taskExecutionStrategyVal
    } = form.getFieldsValue()

    return (
      <Fragment>
        <LayoutRight className="no-bread-crumb">
          <div className="region-zd">
            <Input value={name} placeholder="任务名称" style={{ width: 200 }}
                   onChange={(e) => this.onInputChange(e, 'name')} />
            <Select value={status} onChange={(e) => this.onSelectChange(e, 'status')} placeholder="任务状态" allowClear
                    style={{ width: 180 }}>
              <Option key="WAITING" value="WAITING">等待中</Option>
              <Option key="EXECUTING" value="EXECUTING">执行中</Option>
              <Option key="FINISHED" value="FINISHED">已完成</Option>
            </Select>
            <Button type="primary" onClick={() => {
              this.realParam = { ...this.state }
              this.getDataList(1)
            }} style={{ marginRight: '10px' }}>查询</Button>
            <Button type="default" onClick={this.onClearClick}>重置</Button>
            <div style={{ float: 'right' }}>
              <Button type="primary" onClick={this.newData}>新建</Button>
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
        <Modal
          title={`${isView ? '查看' : taskName.length > 0 ? '编辑' : '新建'}验证任务`}
          wrapClassName="edit-confirm-modal"
          width={800}
          visible={visible}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.onCancel}
          onOk={this.onSave}
          footer={isView ? <Button type="default" onClick={this.onCancel}>关闭窗口</Button>
            : <Fragment>
              <Button type="default" onClick={this.onCancel}>取消</Button>
              <Button type="primary" onClick={this.onSave}>确认</Button>
            </Fragment>}
        >
          <Form>
            <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} label="任务名称">
              <Input disabled={isView} {...getFieldProps('name', {
                initialValue: taskName,
                validate: [{
                  rules: [
                    { required: true, whitespace: true, pattern: /^.{1,50}$/, message: '1-50个字符' }
                  ]
                }]
              })} placeholder="不超过50个字符" maxLength="50" />
            </FormItem>
            <FormItem labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} label="验证数据">
              <RadioGroup disabled={taskName.length > 0 || isView} {...getFieldProps('taskDataType', {
                initialValue: taskDataType,
                onChange: this.onTaskDataTypeChange
              })} >
                <Radio value="HISTORIC_ONLINE_DATA">线上历史数据</Radio>
                <Radio value="OFFLINE_DATA">线下离线数据</Radio>
                <Radio value="CASE_SAMPLE_DATA">案例样本数据</Radio>
              </RadioGroup>
            </FormItem>
            <div>
              {
                taskDataTypeVal !== 'OFFLINE_DATA'
                  ? <FormItem {...formItemLayout} className="form-item-half" label="应用">
                    <Select disabled={taskName.length > 0 || isView} {...getFieldProps('appId', {
                      initialValue: appId,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择' }
                        ]
                      }],
                      onChange: this.onAppChange
                    })} allowClear dropdownMatchSelectWidth={false} placeholder="请选择">
                      {
                        appSelect.map(app => {
                          const { appId, appName } = app
                          return (
                            <Option key={appId} value={appId}>{appName}</Option>
                          )
                        })
                      }
                    </Select>
                  </FormItem>
                  : <FormItem {...formItemLayout} className="form-item-half" label="数据名称">
                    <Select disabled={taskName.length > 0 || isView} {...getFieldProps('offlineDataId', {
                      initialValue: offlineDataId,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择' }
                        ]
                      }],
                      onChange: this.onOfflineDataIdChange
                    })} allowClear dropdownMatchSelectWidth={false} placeholder="请选择">
                      {
                        offlineDataSelect.map(item => {
                          const { id, dataName } = item
                          return <Option key={id} value={id}>{dataName}</Option>
                        })
                      }
                    </Select>
                  </FormItem>
              }
              <FormItem {...formItemLayout} className="form-item-half" label="场景">
                <Select
                  disabled={taskName.length > 0 || isView || !(appIdVal || offlineDataIdVal)} {...getFieldProps('scenarioId', {
                  initialValue: scenarioId,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择' }
                    ]
                  }],
                  onChange: this.onScenarioIdChange
                })} allowClear dropdownMatchSelectWidth={false} placeholder="请选择">
                  {
                    sceneSelect.map((scene) => {
                      const { id, scenarioName } = scene
                      return (
                        <Option key={id} value={id}>{scenarioName}</Option>
                      )
                    })
                  }
                </Select>
              </FormItem>
            </div>
            <div>
              {
                taskDataTypeVal === 'HISTORIC_ONLINE_DATA'
                  ? <FormItem {...formItemLayout} className="form-item-half" label="时间">
                    <RangePicker disabled={taskName.length > 0 || isView} showTime={{ format: 'HH:mm:ss' }}
                                 format="YYYY-MM-DD" style={{ width: '100%' }} allowClear
                                 onCalendarChange={this.onCalendarChange}
                                 disabledDate={this.disabledRangeDate}
                                 {...getFieldProps('timeRange', {
                                   initialValue: timeRange,
                                   validate: [{
                                     rules: [
                                       { required: true, message: '请选择时间' }
                                     ]
                                   }]
                                 })} />
                  </FormItem> : taskDataTypeVal === 'CASE_SAMPLE_DATA'
                  ? <FormItem {...formItemLayout} className="form-item-half" label="案件编号">
                    <Select
                      disabled={taskName.length > 0 || isView || !appIdVal || !scenarioIdVal} {...getFieldProps('caseSampleId', {
                      initialValue: caseSampleId,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择' }
                        ]
                      }]
                    })} allowClear dropdownMatchSelectWidth={false} placeholder="请选择">
                      {
                        caseSelect.map(item => {
                          const { id, caseCode, caseSubject, caseSubjectValue } = item
                          return <Option key={id}
                                         value={id}>{`${caseCode}/${caseSubject}(${caseSubjectValue})`}</Option>
                        })
                      }
                    </Select>
                  </FormItem> : null
              }
              <FormItem {...formItemLayout} className="form-item-half" label="验证策略">
                <Select
                  disabled={taskName.length > 0 || isView || (!appIdVal && !offlineDataIdVal) || !scenarioIdVal} {...getFieldProps('strategyId', {
                  initialValue: taskName.length > 0 ? `${strategyId}@${strategyType}` : undefined,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择' }
                    ]
                  }]
                })} allowClear dropdownMatchSelectWidth={false} placeholder="请选择">
                  {
                    strategySelect.length > 0 ? Object.keys(RESOURCE_TYPES).map(type => {
                      const filterStrategySelect = strategySelect.filter(s => s.strategyType === type)
                      const typeName = RESOURCE_TYPES[type]
                      return filterStrategySelect.length > 0 ? <OptGroup key={typeName} value={typeName}>
                        {
                          filterStrategySelect.map(item => {
                            const { strategyId, strategyName, strategyType } = item
                            return <Option key={strategyId}
                                           value={`${strategyId}@${strategyType}`}>{strategyName}</Option>
                          })
                        }
                      </OptGroup> : null
                    }) : null
                  }
                </Select>
              </FormItem>
            </div>
            <div>
              <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} className="form-item-half" label="执行时间">
                <RadioGroup disabled={isView} {...getFieldProps('taskExecutionStrategy', {
                  initialValue: taskExecutionStrategy,
                  onChange: this.onTaskExecutionStrategyChange
                })}>
                  <Radio value="RUN_IMMEDIATELY">立即执行</Radio>
                  <Radio value="RUN_AT_TIME">定时执行</Radio>
                </RadioGroup>
              </FormItem>
              {
                taskExecutionStrategyVal === 'RUN_AT_TIME'
                  ? <FormItem style={{ display: 'inline-block' }} label="">
                    <DatePicker disabled={isView} placeholder="请选择定时执行时间"
                                showTime={{ format: 'HH:mm:ss' }}
                                disabledDate={this.disabledDate}
                                format="YYYY-MM-DD HH:mm:ss" style={{ width: 200, left: -80 }}
                                allowClear {...getFieldProps('taskExecutionTime', {
                      initialValue: taskExecutionTime ? moment(taskExecutionTime) : undefined,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择定时执行时间' }
                        ]
                      }]
                    })} />
                  </FormItem> : null
              }
            </div>
          </Form>
        </Modal>
      </Fragment>
    )
  }

  onInputChange = (e, field) => {
    this.setState({
      [field]: e.target.value
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
      this.getDataList(pagination.current)
    })
  }

  newData = () => {
    this.setState({
      visible: true
    })
  }

  onCancel = () => {
    this.setState({
      visible: false,
      record: {},
      isView: false
    }, () => {
      this.props.form.resetFields()
    })
  }

  onSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      const { record: { id = '', taskName = '' } = {} } = this.state
      const {
        name,
        taskDataType,
        appId,
        scenarioId,
        timeRange,
        strategyId,
        offlineDataId,
        caseSampleId,
        taskExecutionStrategy,
        taskExecutionTime
      } = values
      if (errors) {
        return
      }
      let data = {
        name,
        taskDataType,
        scenarioId,
        strategyId: Number(strategyId.split('@')[0]),
        taskStrategyType: strategyId.split('@')[1],
        taskExecutionStrategy
      }
      switch (taskDataType) {
        case 'HISTORIC_ONLINE_DATA':
          const onlineDataStartTime = timeRange[0].format('YYYY-MM-DD 00:00:00')
          const onlineDataEndTime = timeRange[1].format('YYYY-MM-DD 23:59:59')
          data = {
            ...data,
            appId,
            onlineDataStartTime,
            onlineDataEndTime
          }
          break
        case 'OFFLINE_DATA':
          data = {
            ...data,
            offlineDataId
          }
          break
        case 'CASE_SAMPLE_DATA':
          data = {
            ...data,
            appId,
            caseSampleId
          }
          break
      }
      if (taskExecutionStrategy === 'RUN_AT_TIME') {
        data = {
          ...data,
          taskExecutionTime: taskExecutionTime.format('YYYY-MM-DD HH:mm:ss')
        }
      }
      const promise = taskName ? updateTask({ id, ...data }) : createTask(data)
      promise.then(() => {
        this.onCancel()
        this.getDataList()
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    })
  }

  onTaskDataTypeChange = () => {
    this.props.form.setFieldsValue({
      appId: undefined,
      scenarioId: undefined,
      timeRange: undefined,
      strategyId: undefined,
      offlineDataId: undefined,
      caseSampleId: undefined
    })
  }

  onOfflineDataIdChange = offlineDataId => {
    if (offlineDataId) {
      this.props.getOfflineSceneSelect({ offlineDataId })
    }
    this.props.form.setFieldsValue({ scenarioId: undefined, strategyId: undefined })
  }

  onAppChange = appId => {
    if (appId) {
      this.props.getSceneSelect({ appId })
    }
    this.props.form.setFieldsValue({ scenarioId: undefined, strategyId: undefined })
  }

  onScenarioIdChange = scenarioId => {
    const taskDataTypeVal = this.props.form.getFieldValue('taskDataType')
    let appIdVal = this.props.form.getFieldValue('appId')
    if (taskDataTypeVal === 'OFFLINE_DATA') { // 线下离线数据
      const { offlineDataSelect = [] } = this.state
      const offlineDataIdVal = this.props.form.getFieldValue('offlineDataId')
      const { appId } = offlineDataSelect.find(offlineData => offlineData.id === offlineDataIdVal) || {}
      appIdVal = appId
    }
    if (appIdVal && scenarioId) {
      if (taskDataTypeVal === 'CASE_SAMPLE_DATA') {
        this.getCaseSelect({ appId: appIdVal, scenarioId })
      }
      this.getStrategySelect({ appId: appIdVal, scenarioId, taskDataType: taskDataTypeVal })
      this.props.form.setFieldsValue({ caseSampleId: undefined })
    }
  }

  disabledDate = (date) => {
    if (!date) {
      return false
    }
    return date.valueOf() < moment(moment().format('YYYY/MM/DD')).valueOf()
  }

  onCalendarChange = (dates) => {
    this.setState({ timeRangeVal: dates })
  }

  disabledRangeDate = (current) => {
    const { timeRangeVal: [start, end] = [moment(), moment()] } = this.state
    const todayM = moment(moment().format('YYYY-MM-DD'))
    if (!current) {
      return false
    }
    if ((!start && !end) || (start && end)) {
      return current.valueOf() > todayM.valueOf() ||
        current.valueOf() < todayM.subtract(30, 'days').valueOf()
    }
    const startStr = start.format('YYYY-MM-DD')
    return !(current.valueOf() >= start.valueOf() &&
      current.valueOf() < moment(startStr).add(30, 'days').valueOf()) ||
      current.valueOf() > todayM.valueOf()
  }

  getOfflineDataSelect = () => {
    getOfflineDataSelect().then(data => {
      const { content: offlineDataSelect = [] } = data
      this.setState({
        offlineDataSelect
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  getStrategySelect = data => {
    getStrategySelect(data).then(data => {
      const { content: strategySelect = [] } = data
      this.setState({
        strategySelect
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  getCaseSelect = data => {
    getCaseSelect(data).then(data => {
      const { content: caseSelect = [] } = data
      this.setState({
        caseSelect
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  onTaskExecutionStrategyChange = () => {
    this.props.form.setFieldsValue({ taskExecutionTime: undefined })
  }

  onClearClick = () => {
    this.setState({
      name: '', status: undefined
    }, () => {
      this.realParam = { ...this.state }
    })
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }

  getDataList = async (pageNum = 1) => {
    const { name, status, pagination } = this.realParam
    const { pageSize } = pagination
    const data = {
      pageNum,
      pageSize,
      name,
      status
    }
    this.setState({
      loading: true
    })
    await getValidationTaskList(data).then(res => {
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
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  onEdit = record => {
    this.getSelectRelative(record)
    this.setState({
      record,
      visible: true
    })
  }

  onView = record => {
    this.setState({
      isView: true
    }, () => {
      this.onEdit(record)
    })
  }

  delData = record => {
    const { id = '' } = record
    deleteTask({ id }).then(() => {
      this.getDataList()
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  getSelectRelative = record => {
    const { taskDataType, appId, scenarioId, offlineDataId } = record
    switch (taskDataType) {
      case 'HISTORIC_ONLINE_DATA':
        this.props.getSceneSelect({ appId })
        break
      case 'OFFLINE_DATA':
        this.props.getOfflineSceneSelect({ offlineDataId })
        break
      case 'CASE_SAMPLE_DATA':
        this.props.getSceneSelect({ appId })
        this.getCaseSelect({ appId, scenarioId })
        break
    }
    this.getStrategySelect({ appId, scenarioId, taskDataType })
  }

  getCurrentParams = () => {
    const { name, status, pagination: { current: pageNum, pageSize } } = this.realParam
    return { name, status, pageNum, pageSize }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerificationTask)
