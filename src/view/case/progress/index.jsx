import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Table, Select, Button, Input, notification, Modal } from 'antd'
import './index.less'
import {
  getCaseSubject,
  getCaseStatuses,
  getCaseConclusion,
  getCaseList,
  archiveCase
} from '../../../action/case'
import {
  CASE_SUBJECT,
  CASE_RISK,
  CASE_STATUS,
  CASE_CONCLUSION,
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
    this.getCaseStatuses()
    this.getCaseConclusion()
    this.getCaseList()
  }

  render() {
    const {
      pagination,
      caseSubject,
      caseSubjectValue,
      caseConclusion,
      caseStatus,
      dataSource = [],
      caseSubjects = [],
      caseStatuses = [],
      caseConclusions = [],
      archiveCaseShow = false
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
        title: '当前阶段',
        dataIndex: 'caseStatus',
        key: 'caseStatus',
        render: (text) => {
          return CASE_STATUS[text]
        }
      }, {
        title: '案件结论',
        dataIndex: 'caseConclusion',
        key: 'caseConclusion',
        render: (text) => {
          return CASE_CONCLUSION[text] || '--'
        }
      }, {
        title: '当前处理人',
        dataIndex: 'currentOperatorName',
        key: 'currentOperatorName',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '生成时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 160
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 100,
        render: (text, record) => {
          const { id, caseStatus, caseConclusion } = record
          // caseStatus === 'CLOSED'
          // caseConclusion === 'CONFIRMED_CASE'
          return <Fragment>
            <span className="operation-span"
                  onClick={() => {
                    this.props.history.push({
                      pathname: '/risk/case/progress/detail',
                      state: {
                        id,
                        actionType: ACTION_VIEW,
                        backUrl: '/risk/case/progress',
                        breadCrumb: ['风险分析', '案件中心', '审核进度', '查看'],
                        conditions: { ...this.getCurConditions() }
                      }
                    })
                  }}>查看</span>
            {
              caseStatus === 'CLOSED' && caseConclusion === 'CONFIRMED_CASE'
                ? <span className="operation-span" onClick={() => this.onArchiveCaseClick(record)}>归档</span> : null
            }
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
              <Select value={caseStatus} onChange={(e) => this.onSelectChange(e, 'caseStatus')} placeholder="当前阶段"
                      allowClear style={{ width: 220 }}>
                {
                  caseStatuses.map(risk => {
                    return (
                      <Option key={risk} value={risk}>{CASE_STATUS[risk]}</Option>
                    )
                  })
                }
              </Select>
              <Select value={caseConclusion} placeholder="案件结论" style={{ width: 220 }}
                      onChange={(e) => this.onSelectChange(e, 'caseConclusion')} allowClear>
                {
                  caseConclusions.map(source => {
                    return (
                      <Option key={source} value={source}>{CASE_CONCLUSION[source]}</Option>
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
        <Modal
          title=""
          centered
          visible={archiveCaseShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          width={400}
          onCancel={() => {
            this.setState({
              archiveCaseShow: false
            })
          }}
          onOk={this.archiveCase}
        >
          是否确定进行归档？归档后案件不可再进行任何操作。
        </Modal>
      </Fragment>
    )
  }

  onArchiveCaseClick = record => {
    this.setState({
      record,
      archiveCaseShow: true
    })
  }

  archiveCase = () => {
    const { record: { id: caseId = '' } = {} } = this.state
    archiveCase({ caseId }).then(() => {
      this.setState({
        archiveCaseShow: false
      }, () => {
        this.getCaseList()
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getCaseList = (current = 0, limit = 0) => {
    const { pagination } = this.state
    let { caseStatus, caseConclusion, caseSubject, caseSubjectValue, page, size } = this.realParam
    if (current !== 0) {
      page = current
    }
    if (limit !== 0) {
      size = limit
    }
    const data = { caseStatus, caseConclusion, caseSubject, caseSubjectValue, page, size }
    getCaseList(data).then(data => {
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

  getCaseStatuses = () => {
    getCaseStatuses().then(data => {
      const { content: caseStatuses = [] } = data
      this.setState({ caseStatuses })
    })
  }

  getCaseConclusion = () => {
    getCaseConclusion().then(data => {
      const { content: caseConclusions = [] } = data
      this.setState({ caseConclusions })
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.getCaseList(pagination.current, pagination.pageSize)
    })
  }

  onClearClick = () => {
    this.setState({
      caseSubject: undefined,
      caseSubjectValue: '',
      caseConclusion: undefined,
      caseStatus: undefined
    })
  }

  getCurConditions = () => {
    const {
      caseSubject,
      caseSubjectValue,
      caseConclusion,
      caseStatus,
      page,
      size
    } = this.realParam
    return {
      caseSubject,
      caseSubjectValue,
      caseConclusion,
      caseStatus,
      page,
      size
    }
  }

  onEventQuery = (pageNum = 1) => {
    const {
      caseStatus, caseConclusion, caseSubject, caseSubjectValue,
      pagination
    } = this.state
    let { current: page, pageSize: size } = pagination
    this.realParam = { caseStatus, caseConclusion, caseSubject, caseSubjectValue, page, size }
    this.getCaseList(1)
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }
}
