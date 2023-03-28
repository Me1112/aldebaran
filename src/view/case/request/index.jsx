import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Table, Select, Button, Input, Modal, notification } from 'antd'
import './index.less'
import {
  getCaseSubject,
  getCaseRisk,
  getCaseSource,
  getCreatedList,
  getCaseAssigner,
  assignCases
} from '../../../action/case'
import {
  CASE_SUBJECT,
  CASE_RISK,
  CASE_SOURCE,
  ACTION_ADD,
  ACTION_EDIT,
  ACTION_FIRST_AUDIT
} from '../../../common/case'
import LayoutRight from '../../../component/layout_right'

const { Option } = Select

export default class RequestList extends Component {
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
    this.getCaseSource()
    this.getCreatedList()
  }

  render() {
    const {
      pagination,
      caseSubject,
      caseSubjectValue,
      caseSource,
      caseRisk,
      dataSource = [],
      caseSubjects = [],
      caseRisks = [],
      caseSources = [],
      selectedRowKeys = [],
      assignerList = [],
      assigneeId,
      assignShow
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
        title: '关联事件数',
        dataIndex: 'eventNumber',
        key: 'eventNumber',
        render: (text) => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      }, {
        title: '案件来源',
        dataIndex: 'caseSource',
        key: 'caseSource',
        render: (text) => {
          return CASE_SOURCE[text]
        }
      }, {
        title: '生成用户',
        dataIndex: 'createdUserName',
        key: 'createdUserName',
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
        width: 70,
        render: (text, record) => {
          const { id } = record
          return <span className="operation-span"
                       onClick={() => {
                         this.props.history.push({
                           pathname: '/risk/case/request/detail',
                           state: {
                             id,
                             actionType: ACTION_EDIT,
                             backUrl: '/risk/case/request',
                             breadCrumb: ['风险分析', '案件中心', '案件申请', '编辑'],
                             conditions: { ...this.getCurConditions() }
                           }
                         })
                       }}>编辑</span>
        }
      }]

    const rowSelection = {
      columnWidth: 30,
      selectedRowKeys,
      onChange: this.onRowsSelectChange
    }

    return (<Fragment>
        <LayoutRight className="no-bread-crumb">
          <div className="region-zd">
            <div>
              <Select value={caseSubject} onChange={(e) => this.onSelectChange(e, 'caseSubject')}
                      placeholder="涉案主体类型" allowClear style={{ width: 220, marginBottom: 20 }}>
                {
                  caseSubjects.map(conclusion => {
                    const { subjectName } = conclusion
                    return (
                      <Option key={subjectName} value={subjectName}>{CASE_SUBJECT[subjectName]}</Option>
                    )
                  })
                }
              </Select>
              <Input value={caseSubjectValue} placeholder="主体标识" style={{ width: 220, marginBottom: 20 }} maxLength={50}
                     onChange={(e) => this.onSelectChange(e.target.value, 'caseSubjectValue')} />
              <Select value={caseRisk} onChange={(e) => this.onSelectChange(e, 'caseRisk')} placeholder="风险类型"
                      allowClear style={{ width: 220, marginBottom: 20 }}>
                {
                  caseRisks.map(risk => {
                    return (
                      <Option key={risk} value={risk}>{CASE_RISK[risk]}</Option>
                    )
                  })
                }
              </Select>
              <Select value={caseSource} placeholder="案件来源" style={{ width: 220, marginBottom: 20 }}
                      onChange={(e) => this.onSelectChange(e, 'caseSource')} allowClear>
                {
                  caseSources.map(source => {
                    return (
                      <Option key={source} value={source}>{CASE_SOURCE[source]}</Option>
                    )
                  })
                }
              </Select>
              <Button type="primary" onClick={() => this.onEventQuery()}
                      style={{ marginRight: 10, marginBottom: 20 }}>查询</Button>
              <Button type="default" onClick={this.onClearClick} style={{ marginBottom: 20 }}>重置</Button>
            </div>
            <div>
              <Button type="primary" onClick={() => this.newCase()} style={{ marginRight: 10 }}>单笔录入</Button>
              <Button type="default" onClick={this.showAssignAuditor}
                      disabled={selectedRowKeys.length === 0}>分派</Button>
            </div>
          </div>
          <div style={{ height: `calc(100% - 105px)`, overflowY: 'scroll' }}>
            <Table rowKey="id" className="table-layout-fixed" rowSelection={rowSelection} columns={columns}
                   dataSource={dataSource} pagination={pagination} onChange={this.handleChange} />
          </div>
        </LayoutRight>
        <Modal
          title="分派"
          className="case-assign-modal"
          visible={assignShow}
          centered
          width={400}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.cancelAssignWindow}
          onOk={this.okAssignWindow}>
          <div className="events-tip">此次分派案件的数量为：<span className="assign-amount">{selectedRowKeys.length}</span></div>
          提交给：<Select placeholder="请选择分派用户" style={{ width: 290 }} value={assigneeId} onChange={this.changeAssigner}>
          {
            assignerList.map((subject) => {
              const { userId, username } = subject
              return (
                <Option key={userId} value={userId} title={username}>{username}</Option>
              )
            })
          }
        </Select>
        </Modal>
      </Fragment>
    )
  }

  cancelAssignWindow = () => {
    this.setState({ assignShow: false, assigneeId: undefined, assignerList: [] })
  }

  okAssignWindow = () => {
    const { assigneeId, selectedRowKeys: caseIds = [] } = this.state
    const data = { assigneeId, caseIds }
    assignCases(data).then(data => {
      this.setState({ assignShow: false, assigneeId: undefined, assignerList: [], selectedRowKeys: [] }, () => {
        this.getCreatedList()
        notification.success({ message: '分派成功' })
      })
    }).catch(data => {
      const { content = {} } = data
      this.setState({ assignShow: false, assigneeId: undefined, assignerList: [] }, () => {
        notification.warn(content)
      })
    })
  }

  changeAssigner = (assigneeId) => {
    this.setState({ assigneeId })
  }

  showAssignAuditor = () => {
    getCaseAssigner({ caseStatus: ACTION_FIRST_AUDIT }).then(data => {
      const { content: assignerList = [] } = data
      const { userId: assigneeId } = assignerList[0] || {}
      this.setState({ assigneeId, assignerList, assignShow: true })
    })
  }

  onRowsSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  getCreatedList = (current = 0, limit = 0) => {
    const { pagination } = this.state
    let { caseRisk, caseSource, caseSubject, caseSubjectValue, page, size } = this.realParam
    if (current !== 0) {
      page = current
    }
    if (limit !== 0) {
      size = limit
    }
    const data = { caseRisk, caseSource, caseSubject, caseSubjectValue, page, size }
    getCreatedList(data).then(data => {
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

  getCaseSource = () => {
    getCaseSource().then(data => {
      const { content: caseSources = [] } = data
      this.setState({ caseSources })
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.getCreatedList(pagination.current, pagination.pageSize)
    })
  }

  newCase = () => {
    this.props.history.push({
      pathname: '/risk/case/request/detail',
      state: {
        backUrl: '/risk/case/request',
        breadCrumb: ['风险分析', '案件中心', '案件申请', '新增'],
        actionType: ACTION_ADD,
        conditions: { ...this.getCurConditions() }
      }
    })
  }

  onClearClick = () => {
    this.setState({
      caseSubject: undefined,
      caseSubjectValue: '',
      caseSource: undefined,
      caseRisk: undefined
    })
  }

  getCurConditions = () => {
    const {
      caseSubject,
      caseSubjectValue,
      caseSource,
      caseRisk,
      page,
      size
    } = this.realParam
    return {
      caseSubject,
      caseSubjectValue,
      caseSource,
      caseRisk,
      page,
      size
    }
  }

  onEventQuery = (pageNum = 1) => {
    const {
      caseRisk, caseSource, caseSubject, caseSubjectValue,
      pagination
    } = this.state
    let { current: page, pageSize: size } = pagination
    this.realParam = { caseRisk, caseSource, caseSubject, caseSubjectValue, page, size }
    this.getCreatedList(1)
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }
}
