import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Table, Select, Button, Input, Tabs } from 'antd'
import './index.less'
import {
  getCaseSubject,
  getCaseRisk,
  getAuditList,
  getAuditedCaseList
} from '../../../action/case'
import {
  CASE_SUBJECT,
  CASE_RISK,
  CASE_SOURCE,
  ACTION_FIRST_AUDIT,
  ACTION_LAST_AUDIT,
  CASE_STATUS,
  ACTION_VIEW
} from '../../../common/case'
import { formatDate } from '../../../util'
import { Map } from 'immutable'

const { Option } = Select
const { TabPane } = Tabs

function mapDispatchToProps(dispatch) {
  return {}
}

function mapStateToProps(state) {
  const { common = Map({}) } = state
  const { userPermissions = {} } = common.toJS()
  return {
    userPermissions
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class AuditList extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const { page = 1, size = 10, pageNum = 1, pageSize = 10 } = state
    this.realParam = { ...state }
    this.state = {
      pagination: {
        current: page,
        pageSize: size,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      auditedPagination: {
        current: pageNum,
        pageSize: pageSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      ...state
    }
  }

  static propTypes = {
    location: PropTypes.object,
    userPermissions: PropTypes.any.isRequired,
    history: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { verifiedType } = this.state
    this.getCaseSubject()
    this.getCaseRisk()
    if (verifiedType === 'AUDITED') {
      this.getAuditedList()
    } else {
      this.getAuditList()
    }
    this.handlePermissions(this.props.userPermissions)
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.handlePermissions(nextProps.userPermissions)
  }

  render() {
    const {
      verifiedType = 'AUDITING',
      pagination,
      caseSubject,
      caseSubjectValue,
      caseStatus,
      caseRisk,
      dataSource = [],
      caseSubjects = [],
      caseRisks = [],
      auditedPagination,
      auditedCaseCode,
      auditedCaseRisk,
      auditedCaseStatus,
      auditedDataSource = []
    } = this.state

    const columns = [
      {
        title: '案件编号',
        dataIndex: 'caseCode',
        key: 'caseCode',
        width: 140,
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '涉案主体类型',
        dataIndex: 'caseSubject',
        key: 'caseSubject',
        width: 100,
        render: (text) => {
          return CASE_SUBJECT[text]
        }
      }, {
        title: '主体标识',
        dataIndex: 'caseSubjectValue',
        key: 'caseSubjectValue',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '风险类型',
        dataIndex: 'caseRisks',
        key: 'caseRisks',
        render: (text) => {
          const risks = text.split(',').map(risk => CASE_RISK[risk]).join('、')
          return <div title={risks} className="text-overflow">{risks}</div>
        }
      }, {
        title: '案件来源',
        dataIndex: 'caseSource',
        key: 'caseSource',
        render: (text) => {
          return CASE_SOURCE[text]
        }
      }, {
        title: '当前阶段',
        dataIndex: 'caseStatus',
        key: 'caseStatus',
        render: (text) => {
          return CASE_STATUS[text]
        }
      }, {
        title: '当前阶段开始时间',
        dataIndex: 'currentStartTime',
        key: 'currentStartTime',
        width: 180,
        render: (text) => {
          return formatDate(text)
        }
      }, {
        title: '上一岗',
        dataIndex: 'lastAuditor',
        key: 'lastAuditor',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 70,
        render: (text, record) => {
          const { id, caseStatus } = record
          const { isTrialPermissions, isReviewPermissions } = this.state
          let status = '编辑'
          switch (caseStatus) {
            case ACTION_FIRST_AUDIT:
              status = '初审'
              break
            case ACTION_LAST_AUDIT:
              status = '复审'
              break
          }
          if (caseStatus === ACTION_FIRST_AUDIT && !isTrialPermissions) {
            return null
          } else if (caseStatus === ACTION_LAST_AUDIT && !isReviewPermissions) {
            return null
          }
          return <span className="operation-span"
                       onClick={() => {
                         this.props.history.push({
                           pathname: '/risk/task/audit/detail',
                           state: {
                             id,
                             actionType: caseStatus,
                             backUrl: '/risk/task/audit',
                             breadCrumb: ['风险分析', '案件中心', '案件审核', status],
                             conditions: { ...this.getAuditedCurConditions() }
                           }
                         })
                       }}>{status}</span>
        }
      }]

    const auditedColumns = [
      {
        title: '案件编号',
        dataIndex: 'caseCode',
        key: 'caseCode',
        width: 140,
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '涉案主体类型',
        dataIndex: 'caseSubject',
        key: 'caseSubject',
        width: 100,
        render: (text) => {
          return CASE_SUBJECT[text]
        }
      }, {
        title: '主体标识',
        dataIndex: 'caseSubjectValue',
        key: 'caseSubjectValue',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '风险类型',
        dataIndex: 'caseRisks',
        key: 'caseRisks',
        render: (text) => {
          const risks = text.split(',').map(risk => CASE_RISK[risk]).join('、')
          return <div title={risks} className="text-overflow">{risks}</div>
        }
      }, {
        title: '当前阶段',
        dataIndex: 'caseStatus',
        key: 'caseStatus',
        render: (text) => {
          return CASE_STATUS[text]
        }
      }, {
        title: '当前岗',
        dataIndex: 'currentOperator',
        key: 'currentOperator',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '当前阶段开始时间',
        dataIndex: 'statusStartTime',
        key: 'statusStartTime',
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
          const { id } = record
          return <span className="operation-span"
                       onClick={() => {
                         this.props.history.push({
                           pathname: '/risk/task/audit/detail',
                           state: {
                             id,
                             actionType: ACTION_VIEW,
                             backUrl: '/risk/task/audit',
                             breadCrumb: ['风险分析', '案件中心', '案件审核', '查看'],
                             conditions: { ...this.getCurConditions() }
                           }
                         })
                       }}>查看</span>
        }
      }]

    return (<Tabs type="card" activeKey={verifiedType} className="warning-page tabs-no-border"
                  onChange={this.onTabsTypeChange}>
        <TabPane tab="待处理" key="AUDITING">
          <div className="region-zd">
            <div>
              <Select value={caseSubject} onChange={(e) => this.onSelectChange(e, 'caseSubject')}
                      placeholder="涉案主体类型" allowClear style={{ width: 220 }}>
                {
                  caseSubjects.map(conclusion => {
                    const { subjectName } = conclusion
                    return (
                      <Option key={subjectName} value={subjectName}>{CASE_SUBJECT[subjectName]}</Option>
                    )
                  })
                }
              </Select>
              <Input value={caseSubjectValue} placeholder="主体标识" style={{ width: 220 }} maxLength={50}
                     onChange={(e) => this.onSelectChange(e.target.value, 'caseSubjectValue')} />
              <Select value={caseRisk} onChange={(e) => this.onSelectChange(e, 'caseRisk')} placeholder="风险类型"
                      allowClear style={{ width: 220 }}>
                {
                  caseRisks.map(risk => {
                    return (
                      <Option key={risk} value={risk}>{CASE_RISK[risk]}</Option>
                    )
                  })
                }
              </Select>
              <Select value={caseStatus} placeholder="当前阶段" style={{ width: 220 }}
                      onChange={(e) => this.onSelectChange(e, 'caseStatus')} allowClear>
                {
                  ['FIRST_AUDIT', 'LAST_AUDIT'].map(status => {
                    return (
                      <Option key={status} value={status}>{CASE_STATUS[status]}</Option>
                    )
                  })
                }
              </Select>
              <Button type="primary" onClick={() => this.onEventQuery(1)}
                      style={{ marginRight: 10 }}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
            </div>
          </div>
          <div style={{ height: `calc(100% - 52px)`, overflowY: 'scroll' }}>
            <Table rowKey="id" className="table-layout-fixed" columns={columns}
                   dataSource={dataSource} pagination={pagination} onChange={this.handleChange} />
          </div>
        </TabPane>
        <TabPane tab="已处理" key="AUDITED">
          <div className="region-zd">
            <div>
              <Input value={auditedCaseCode} placeholder="案件编号" style={{ width: 220 }} maxLength={50}
                     onChange={(e) => this.onSelectChange(e.target.value, 'auditedCaseCode')} />
              <Select value={auditedCaseRisk} onChange={(e) => this.onSelectChange(e, 'auditedCaseRisk')}
                      placeholder="风险类型" allowClear style={{ width: 220 }}>
                {
                  caseRisks.map(risk => {
                    return (
                      <Option key={risk} value={risk}>{CASE_RISK[risk]}</Option>
                    )
                  })
                }
              </Select>
              <Select value={auditedCaseStatus} placeholder="当前阶段" style={{ width: 220 }}
                      onChange={(e) => this.onSelectChange(e, 'auditedCaseStatus')} allowClear>
                {
                  ['LAST_AUDIT', 'CLOSED', 'CLASSIFIED'].map(status => {
                    return (
                      <Option key={status} value={status}>{CASE_STATUS[status]}</Option>
                    )
                  })
                }
              </Select>
              <Button type="primary" onClick={() => this.onAuditedEventQuery(1)}
                      style={{ marginRight: 10 }}>查询</Button>
              <Button type="default" onClick={this.onAuditedClearClick}>重置</Button>
            </div>
          </div>
          <div style={{ height: `calc(100% - 52px)`, overflowY: 'scroll' }}>
            <Table rowKey="id" className="table-layout-fixed" columns={auditedColumns}
                   dataSource={auditedDataSource} pagination={auditedPagination} onChange={this.handleChangeAudited} />
          </div>
        </TabPane>
      </Tabs>
    )
  }

  onTabsTypeChange = (verifiedType) => {
    this.setState({ verifiedType }, () => {
      if (verifiedType === 'AUDITED') {
        this.onAuditedEventQuery()
      } else {
        this.onEventQuery()
      }
    })
  }

  handlePermissions = (userPermissions) => {
    const { userPermissions: prop = {} } = this.props
    if (!userPermissions) {
      userPermissions = prop
    }
    let perms = []
    if (userPermissions['/risk/task/audit']) {
      perms = userPermissions['/risk/task/audit'].map(item => item.id)
    }
    const isTrialPermissions = perms.includes(104)
    const isReviewPermissions = perms.includes(105)
    console.log('isTrialPermissions', isTrialPermissions, perms)
    this.setState({ isTrialPermissions, isReviewPermissions })
  }

  getAuditList = (current = 0, limit = 0) => {
    const { pagination } = this.state
    let { caseRisk, caseStatus, caseSubject, caseSubjectValue, page, size } = this.realParam
    if (current !== 0) {
      page = current
    }
    if (limit !== 0) {
      size = limit
    }
    const data = { caseRisk, caseStatus, caseSubject, caseSubjectValue, page, size }
    getAuditList(data).then(data => {
      const { content: { data: dataSource, total } = {} } = data
      pagination.total = total
      this.setState({ pagination, dataSource })
    })
  }

  getAuditedList = (current = 0, limit = 0) => {
    const { auditedPagination } = this.state
    let {
      auditedCaseCode: caseCode, auditedCaseRisk: caseRisks, auditedCaseStatus: caseStatus,
      pageNum, pageSize
    } = this.realParam
    if (current !== 0) {
      pageNum = current
    }
    if (limit !== 0) {
      pageSize = limit
    }
    const data = { caseCode, caseRisks, caseStatus, pageNum, pageSize }
    getAuditedCaseList(data).then(data => {
      const { content: { data: auditedDataSource, total } = {} } = data
      auditedPagination.total = total
      this.setState({ auditedPagination, auditedDataSource })
    })
  }

  getCaseSubject = () => {
    getCaseSubject().then(data => {
      const { content: caseSubjects = [] } = data
      this.setState({ caseSubjects })
    })
  }

  getCaseRisk = () => {
    getCaseRisk().then(data => {
      const { content: caseRisks = [] } = data
      this.setState({ caseRisks })
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.getAuditList(pagination.current, pagination.pageSize)
    })
  }

  handleChangeAudited = (auditedPagination) => {
    this.setState({ auditedPagination }, () => {
      this.getAuditedList(auditedPagination.current, auditedPagination.pageSize)
    })
  }

  onClearClick = () => {
    this.setState({
      caseSubject: undefined,
      caseSubjectValue: '',
      caseStatus: undefined,
      caseRisk: undefined
    })
  }

  onAuditedClearClick = () => {
    this.setState({
      auditedCaseCode: '',
      auditedCaseRisk: undefined,
      auditedCaseStatus: undefined
    })
  }

  getCurConditions = () => {
    const { verifiedType } = this.state
    const {
      caseSubject,
      caseSubjectValue,
      caseStatus,
      caseRisk,
      page,
      size
    } = this.realParam
    return {
      verifiedType,
      caseSubject,
      caseSubjectValue,
      caseStatus,
      caseRisk,
      page,
      size
    }
  }

  getAuditedCurConditions = () => {
    const { verifiedType } = this.state
    const {
      auditedCaseCode, auditedCaseRisk, auditedCaseStatus, pageNum, pageSize
    } = this.realParam
    return {
      verifiedType, auditedCaseCode, auditedCaseRisk, auditedCaseStatus, pageNum, pageSize
    }
  }

  onEventQuery = (pageNum = 0) => {
    const {
      caseRisk, caseStatus, caseSubject, caseSubjectValue, pagination
    } = this.state
    let { current: page, pageSize: size } = pagination
    this.realParam = { caseRisk, caseStatus, caseSubject, caseSubjectValue, page, size }
    this.getAuditList(pageNum)
  }

  onAuditedEventQuery = (page = 0) => {
    const {
      auditedCaseCode, auditedCaseRisk, auditedCaseStatus, auditedPagination
    } = this.state
    let { current: pageNum, pageSize } = auditedPagination
    this.realParam = { auditedCaseCode, auditedCaseRisk, auditedCaseStatus, pageNum, pageSize }
    this.getAuditedList(page)
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }
}
