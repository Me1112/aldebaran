import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Table, Select, Button, Input } from 'antd'
import './index.less'
import {
  getCaseSubject,
  getArchivedCaseList,
  getCaseRisk
} from '../../../action/case'
import {
  CASE_SUBJECT,
  CASE_RISK,
  ACTION_VIEW
} from '../../../common/case'
import LayoutRight from '../../../component/layout_right'

const { Option } = Select

export default class ProgressList extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const { page = 1, size = 10 } = state
    this.realParam = { ...state }
    this.state = {
      pagination: {
        current: page,
        pageSize: size,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      ...state
    }
  }

  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.getCaseSubject()
    this.getCaseRisk()
    this.getArchivedCaseList()
  }

  render() {
    const {
      pagination,
      caseSubject,
      caseRisk,
      caseSubjectValue,
      dataSource = [],
      caseSubjects = [],
      caseRisks = []
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
        title: '涉案金额',
        dataIndex: 'relatedAmount',
        key: 'relatedAmount',
        render: (text = '--') => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '生成时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 160
      }, {
        title: '复核人',
        dataIndex: 'lastAuditUsername',
        key: 'lastAuditUsername',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '复核时间',
        dataIndex: 'lastAuditTime',
        key: 'lastAuditTime',
        width: 160
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 70,
        render: (text, record) => {
          const { id } = record
          return <Fragment>
            <span className="operation-span"
                  onClick={() => {
                    this.props.history.push({
                      pathname: '/risk/case/archive/detail',
                      state: {
                        id,
                        actionType: ACTION_VIEW,
                        backUrl: '/risk/case/archive',
                        breadCrumb: ['风险分析', '案件中心', '归档案件', '查看'],
                        conditions: { ...this.getCurConditions() }
                      }
                    })
                  }}>查看</span>
          </Fragment>
        }
      }]

    return (<Fragment>
        <LayoutRight className="no-bread-crumb">
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
              <Button type="primary" onClick={() => this.onEventQuery()}
                      style={{ marginRight: 10 }}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
            </div>
          </div>
          <div style={{ height: `calc(100% - 52px)`, overflowY: 'scroll' }}>
            <Table rowKey="id" className="table-layout-fixed" columns={columns}
                   dataSource={dataSource} pagination={pagination} onChange={this.handleChange} />
          </div>
        </LayoutRight>
      </Fragment>
    )
  }

  getArchivedCaseList = (current = 0, limit = 0) => {
    const { pagination } = this.state
    let { caseSubject, caseSubjectValue, caseRisk, page, size } = this.realParam
    if (current !== 0) {
      page = current
    }
    if (limit !== 0) {
      size = limit
    }
    const data = { caseSubject, caseSubjectValue, caseRisk, page, size }
    getArchivedCaseList(data).then(data => {
      const { content: { data: dataSource, total } = {} } = data
      pagination.total = total
      this.setState({ pagination, dataSource })
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
      this.getArchivedCaseList(pagination.current, pagination.pageSize)
    })
  }

  onClearClick = () => {
    this.setState({
      caseSubject: undefined,
      caseSubjectValue: '',
      caseRisk: undefined
    })
  }

  getCurConditions = () => {
    const {
      caseSubject,
      caseSubjectValue,
      caseRisk,
      page,
      size
    } = this.realParam
    return {
      caseSubject,
      caseSubjectValue,
      caseRisk,
      page,
      size
    }
  }

  onEventQuery = () => {
    const {
      caseSubject,
      caseSubjectValue,
      caseRisk,
      pagination
    } = this.state
    let { current: page, pageSize: size } = pagination
    this.realParam = { caseSubject, caseSubjectValue, caseRisk, page, size }
    this.getArchivedCaseList(1)
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }
}
