import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Table, Select, Button, Input, DatePicker, Tabs, notification, Modal, Radio } from 'antd'
import './index.less'
import {
  getWarningList,
  getFinishedList,
  getAuditUserList,
  getInvalidScopeList,
  invalidWarning
} from '../../../action/case'
import { formatDate } from '../../../util'
import { RISK_GRADE, HANDLE_STATUS } from '../../../common/constant'
import moment from 'moment'

const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs
const { Group: RadioGroup } = Radio

export default class WarningList extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const date = new Date().format('yyyy-MM-dd')
    const {
      beginDateVal = date + ' 00:00:00', endDateVal = date + ' 23:59:59', page = 1, size = 10,
      completedBeginDateVal = date + ' 00:00:00', completedEndDateVal = date + ' 23:59:59', completedPage = 1, completedSize = 10
    } = state
    this.realParam = {
      ...state,
      beginDateVal,
      endDateVal,
      page,
      size,
      completedBeginDateVal,
      completedEndDateVal,
      completedPage,
      completedSize
    }
    this.state = {
      occurTimeVal: (!beginDateVal || !endDateVal) ? [] : [moment(beginDateVal), moment(endDateVal)],
      beginDateVal,
      endDateVal,
      completedOccurTimeVal: (!completedBeginDateVal || !completedEndDateVal) ? [] : [moment(completedBeginDateVal), moment(completedEndDateVal)],
      completedBeginDateVal,
      completedEndDateVal,
      pagination: {
        current: page,
        pageSize: size,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      completedPagination: {
        current: completedPage,
        pageSize: completedSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      ...state
    }
  }

  static propTypes = {
    location: PropTypes.object
  }

  componentDidMount() {
    const { userList = [], verifiedType } = this.state
    const { page, size, completedPage, completedSize } = this.realParam
    if (verifiedType === 'COMPLETED') {
      if (userList.length === 0) {
        getAuditUserList().then(data => {
          const { content: userList = [] } = data
          this.setState({ userList }, () => {
            this.getCompletedWarningList(completedPage, completedSize)
          })
        })
      } else {
        this.getCompletedWarningList(completedPage, completedSize)
      }
    } else {
      this.getWarningList(page, size)
      this.getInvalidScopeList()
    }
  }

  render() {
    const {
      pagination,
      occurTimeVal,
      eventId,
      riskGrade,
      dataSource = [],
      verifiedType = 'AUDITING',
      completedPagination,
      completedOccurTimeVal,
      completedEventId,
      handleStatus,
      completedDataSource = [],
      userList = [],
      userId,
      invalidVisible = false,
      invalidScopeList = [],
      invalidScope = 'PAST_SEVEN_DAYS'
    } = this.state

    const columns = [
      {
        title: '预警编号',
        dataIndex: 'warningNo',
        key: 'warningNo',
        width: '20%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '应用',
        dataIndex: 'appName',
        key: 'appName',
        width: '20%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '事件流水号',
        dataIndex: 'eventId',
        key: 'eventId',
        width: 210,
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '预警级别',
        dataIndex: 'riskGrade',
        key: 'riskGrade',
        width: 80,
        render: (text) => {
          const { name = '' } = RISK_GRADE[text] || {}
          return <div title={text} className="text-overflow">{name}</div>
        }
      }, {
        title: '生成时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180,
        render: (text) => {
          return formatDate(text)
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 70,
        render: (text, record) => {
          const {
            beginDateVal,
            endDateVal,
            eventId,
            riskGrade,
            page,
            size,
            completedBeginDateVal,
            completedEndDateVal,
            completedEventId,
            completedUserId,
            completedPage,
            completedSize
          } = this.realParam
          const conditions = {
            verifiedType,
            beginDateVal,
            endDateVal,
            eventId,
            riskGrade,
            page,
            size,
            completedBeginDateVal,
            completedEndDateVal,
            completedEventId,
            completedUserId,
            completedPage,
            completedSize
          }
          return <span className="operation-span"><Link to={{
            pathname: `/risk/task/warning/detail`,
            state: {
              backUrl: '/risk/task/warning',
              conditions,
              ...record,
              isTesting: false,
              breadCrumb: ['风险分析', '任务中心', '预警审核', `审核(${record.eventId})`],
              operation: 'AUDIT'
            }
          }} className={'i-cursor'}>审核</Link></span>
        }
      }]

    const completedColumns = [
      {
        title: '预警编号',
        dataIndex: 'warningNo',
        key: 'warningNo',
        width: '20%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '应用',
        dataIndex: 'appName',
        key: 'appName',
        width: '20%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '事件流水号',
        dataIndex: 'eventId',
        key: 'eventId',
        width: 210,
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '审核结果',
        dataIndex: 'handleStatus',
        key: 'handleStatus',
        width: 100,
        render: (text) => {
          const { name = '' } = HANDLE_STATUS[text] || {}
          return (<div className="text-overflow" title={name}>{name}</div>)
        }
      }, {
        title: '审核人',
        dataIndex: 'auditUserLoginName',
        key: 'auditUserLoginName',
        width: 120,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 104 }} title={text}>{text}</div>)
        }
      }, {
        title: '审核时间',
        dataIndex: 'auditTime',
        key: 'auditTime',
        width: 180
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 70,
        render: (text, record) => {
          const {
            beginDateVal,
            endDateVal,
            eventId,
            riskGrade,
            page,
            size,
            completedBeginDateVal,
            completedEndDateVal,
            completedEventId,
            completedUserId,
            completedPage,
            completedSize,
            userId
          } = this.realParam
          const conditions = {
            verifiedType,
            beginDateVal,
            endDateVal,
            eventId,
            riskGrade,
            page,
            size,
            completedBeginDateVal,
            completedEndDateVal,
            completedEventId,
            completedUserId,
            completedPage,
            completedSize,
            userId
          }
          return <span className="operation-span"><Link to={{
            pathname: `/risk/task/warning/detail`,
            state: {
              backUrl: '/risk/task/warning',
              conditions,
              ...record,
              isTesting: false,
              breadCrumb: ['风险分析', '任务中心', '预警审核', `查看(${record.eventId})`],
              operation: 'VIEW'
            }
          }} className={'i-cursor'}>查看</Link></span>
        }
      }]

    return <Tabs type="card" activeKey={verifiedType} className="warning-page tabs-no-border"
                 onChange={this.onTabsTypeChange}>
      <TabPane tab="待审核" key="AUDITING">
        <div className="region-zd">
          <div>
            <RangePicker style={{ width: 220 }} onChange={this.occurTimeChange}
                         value={occurTimeVal}
                         defaultValue={occurTimeVal} format="YYYY-MM-DD" />
            <Input value={eventId} placeholder="事件流水号" style={{ width: 220 }}
                   maxLength={50}
                   onChange={(e) => this.onSelectChange(e.target.value, 'eventId')} />
            <Select value={riskGrade} onChange={(e) => this.onSelectChange(e, 'riskGrade')} placeholder="风险级别"
                    allowClear style={{ width: 220 }}>
              {
                Object.keys(RISK_GRADE).map(risk => {
                  const { name = '' } = RISK_GRADE[risk]
                  return (
                    <Option key={risk} value={risk}>{name}</Option>
                  )
                })
              }
            </Select>
            <Button type="primary" onClick={() => this.onEventQuery()}
                    style={{ marginRight: 10 }}>查询</Button>
            <Button type="default" onClick={this.onClearClick}>重置</Button>
            <Button type="primary" onClick={this.onInvalidClick} style={{ float: 'right' }}>失效</Button>
          </div>
        </div>
        <div style={{ height: `calc(100% - 52px)`, overflowY: 'scroll' }}>
          <Table rowKey="id" className="table-layout-fixed" columns={columns}
                 dataSource={dataSource} pagination={pagination} onChange={this.handleChange} />
        </div>
        <Modal title="失效" width="400px"
               visible={invalidVisible}
               onCancel={this.onCancel}
               onOk={this.onInvalid}
        >
          <div>
            失效范围：
            <RadioGroup value={invalidScope} onChange={this.onInvalidScopeChange}
                        style={{ width: 'calc(100% - 72px)', verticalAlign: 'top' }}>
              {
                invalidScopeList.map(item => {
                  const { ineffective, name } = item
                  return <Radio key={ineffective} value={ineffective}
                                style={{ width: 130, marginBottom: 10 }}>{name}</Radio>
                })
              }
            </RadioGroup>
          </div>
        </Modal>
      </TabPane>
      <TabPane tab="已完成" key="COMPLETED">
        <div className="region-zd">
          <div>
            <RangePicker style={{ width: 220 }} onChange={this.changeCompletedOccurTime}
                         value={completedOccurTimeVal}
                         defaultValue={completedOccurTimeVal} format="YYYY-MM-DD" />
            <Input value={completedEventId} placeholder="事件流水号" style={{ width: 220 }}
                   maxLength={50}
                   onChange={(e) => this.onSelectChange(e.target.value, 'completedEventId')} />
            <Select value={handleStatus} onChange={(e) => this.onSelectChange(e, 'handleStatus')} placeholder="审核结果"
                    allowClear style={{ width: 220 }}>
              {
                Object.keys(HANDLE_STATUS).map(status => {
                  const { name } = HANDLE_STATUS[status]
                  return <Option key={status} value={status}>{name}</Option>
                })
              }
            </Select>
            <Select value={userId} onChange={(e) => this.onSelectChange(e, 'userId')} placeholder="用户"
                    allowClear style={{ width: 220 }}>
              {
                userList.map(user => {
                  const { userId, userName } = user
                  return (
                    <Option key={userId} value={userId}>{userName}</Option>
                  )
                })
              }
            </Select>
            <Button type="primary" onClick={() => this.onCompletedEventQuery()}
                    style={{ marginRight: 10 }}>查询</Button>
            <Button type="default" onClick={this.onClearCompletedClick}>重置</Button>
          </div>
        </div>
        <div style={{ height: `calc(100% - 52px)`, overflowY: 'scroll' }}>
          <Table rowKey="id" className="table-layout-fixed" columns={completedColumns}
                 dataSource={completedDataSource} pagination={completedPagination}
                 onChange={this.handleChangeCompleted} />
        </div>
      </TabPane>
    </Tabs>
  }

  onTabsTypeChange = (verifiedType) => {
    let { userList = [], userId } = this.state
    this.setState({ verifiedType }, () => {
      if (verifiedType === 'COMPLETED') {
        if (userList.length === 0) {
          getAuditUserList().then(data => {
            const { content: userList = [] } = data
            userList.forEach(user => {
              const { isCurrent, userId: uid } = user
              if (isCurrent) {
                userId = uid
              }
            })
            this.setState({ userList, userId }, () => {
              this.onCompletedEventQuery()
            })
          })
        } else {
          this.onCompletedEventQuery()
        }
      } else {
        this.onEventQuery()
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

  changeCompletedOccurTime = (date, dateStr) => {
    const isClear = date.length === 0
    this.setState({
      completedOccurTimeVal: date,
      completedBeginDateVal: isClear ? '' : dateStr[0] + ' 00:00:00',
      completedEndDateVal: isClear ? '' : dateStr[1] + ' 23:59:59'
    })
  }

  getWarningList = (current = 0, limit = 0) => {
    const { pagination } = this.state
    let { beginDateVal, endDateVal, eventId, riskGrade, page, size } = this.realParam
    if (current !== 0) {
      page = current
    }
    if (limit !== 0) {
      size = limit
    }
    const data = {
      beginDate: beginDateVal,
      endDate: endDateVal,
      eventId,
      riskGrade,
      pageNum: page,
      pageSize: size
    }
    getWarningList(data).then(data => {
      const { content: { data: dataSource, page, total } = {} } = data
      pagination.current = page
      pagination.total = total
      this.setState({ pagination, dataSource })
    })
  }

  getCompletedWarningList = (current = 0, limit = 0) => {
    const { completedPagination } = this.state
    let { completedBeginDateVal, completedEndDateVal, completedEventId, handleStatus, userId, completedPage, completedSize } = this.realParam
    if (current !== 0) {
      completedPage = current
      this.realParam = { ...this.realParam, completedPage }
    }
    if (limit !== 0) {
      completedSize = limit
      this.realParam = { ...this.realParam, completedSize }
    }
    const data = {
      beginDate: completedBeginDateVal,
      endDate: completedEndDateVal,
      eventId: completedEventId,
      handleStatus,
      pageNum: completedPage,
      pageSize: completedSize,
      userId
    }
    getFinishedList(data).then(data => {
      const { content: { data: completedDataSource, page, total } = {} } = data
      completedPagination.current = page
      completedPagination.total = total
      this.setState({ completedPagination, completedDataSource })
    })
  }

  handleChange = (pagination) => {
    const { pagination: { pageSize = 1 } } = this.state
    this.setState({ pagination }, () => {
      const offset = pageSize !== pagination.pageSize ? 1 : pagination.current
      this.getWarningList(offset, pagination.pageSize)
    })
  }

  handleChangeCompleted = (completedPagination) => {
    const { completedPagination: { pageSize = 1 } } = this.state
    this.setState({ completedPagination }, () => {
      const offset = pageSize !== completedPagination.pageSize ? 1 : completedPagination.current
      this.getCompletedWarningList(offset, completedPagination.pageSize)
    })
  }

  onClearClick = () => {
    this.setState({
      occurTimeVal: [moment(), moment()],
      beginDateVal: new Date().format('yyyy-MM-dd') + ' 00:00:00',
      endDateVal: new Date().format('yyyy-MM-dd') + ' 23:59:59',
      eventId: undefined,
      riskGrade: undefined
    })
  }

  getInvalidScopeList = () => {
    getInvalidScopeList().then(res => {
      const { content: invalidScopeList = [] } = res
      this.setState({ invalidScopeList })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onInvalidClick = () => {
    this.setState({
      invalidVisible: true
    })
  }

  onInvalidScopeChange = e => {
    this.setState({
      invalidScope: e.target.value
    })
  }

  onCancel = () => {
    this.setState({
      invalidVisible: false,
      invalidScope: 'PAST_SEVEN_DAYS'
    })
  }

  onInvalid = () => {
    const { invalidScope: ineffective = 'PAST_SEVEN_DAYS' } = this.state
    invalidWarning({
      ineffective
    }).then(() => {
      const { pagination: { current = 1, pageSize = 10 } } = this.state
      this.onCancel()
      this.getWarningList(current, pageSize)
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onClearCompletedClick = () => {
    const { userList = [] } = this.state
    let userId
    userList.forEach(user => {
      const { isCurrent, userId: uid } = user
      if (isCurrent) {
        userId = uid
      }
    })
    this.setState({
      completedOccurTimeVal: [moment(), moment()],
      completedBeginDateVal: new Date().format('yyyy-MM-dd') + ' 00:00:00',
      completedEndDateVal: new Date().format('yyyy-MM-dd') + ' 23:59:59',
      completedEventId: undefined,
      userId,
      handleStatus: undefined
    })
  }

  onEventQuery = (pageNum = 1) => {
    const {
      occurTimeVal,
      beginDateVal,
      endDateVal,
      eventId,
      riskGrade,
      pagination
    } = this.state
    let { current: page, pageSize: size } = pagination
    this.realParam = {
      ...this.realParam,
      occurTimeVal,
      beginDateVal,
      endDateVal,
      eventId,
      riskGrade,
      page,
      size
    }
    this.getWarningList(1)
  }

  onCompletedEventQuery = (pageNum = 1) => {
    const {
      completedOccurTimeVal,
      completedBeginDateVal,
      completedEndDateVal,
      completedEventId,
      completedPagination,
      userId,
      handleStatus
    } = this.state
    let { current: completedPage, pageSize: completedSize } = completedPagination
    this.realParam = {
      ...this.realParam,
      completedOccurTimeVal,
      completedBeginDateVal,
      completedEndDateVal,
      completedEventId,
      completedPage,
      completedSize,
      userId,
      handleStatus
    }
    this.getCompletedWarningList(1)
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }
}
