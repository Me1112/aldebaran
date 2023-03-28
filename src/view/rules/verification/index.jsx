import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Input, Table, Select, Form, Tabs, Checkbox, notification } from 'antd'
import {
  getVerificationList,
  updateVerification,
  getBusinessList,
  getVerificationTypes,
  getVerificationInfo
} from '../../../action/rule'
import {
  getVerificationAllList
} from '../../../action/common'
import { Map } from 'immutable'
import { formatDate } from '../../../util/index'
import Verify from '../../../component/verify'
import './index.less'

const { Option } = Select
const { TabPane } = Tabs

function mapStateToProps(state) {
  const { rule = Map({}) } = state
  const { businessLine = [] } = rule.toJS()
  return { businessLine }
}

function mapDispatchToProps(dispatch) {
  return {
    getVerificationAllList: bindActionCreators(getVerificationAllList, dispatch),
    getBusinessList: bindActionCreators(getBusinessList, dispatch)
  }
}

class VerificationList extends Component {
  state = {
    verifiedType: undefined,
    verificationTypes: [],
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    },
    completedPagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }

  static propTypes = {
    getVerificationAllList: PropTypes.func.isRequired,
    getBusinessList: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    businessLine: PropTypes.array.isRequired
  }

  componentDidMount() {
    this.getVerificationTypes()
    this.props.getBusinessList()
    this.props.getVerificationAllList()
    const { state = undefined } = this.props.location
    this.realParam = { ...this.state }
    if (state) {
      const { ruleSetId = undefined } = state
      this.setState({
        operationTypeVal: ruleSetId
      }, () => {
        this.onVerificationQuery()
      })
    } else {
      this.onVerificationQuery()
    }
  }

  render() {
    const {
      verifiedType = 'AUDITING', businessLineId, verificationType, verificationTypes, name,
      completedBusinessLineId, completedName, onlyMine = true, pagination,
      dataSource = [], completedDataSource = [], completedPagination, verifyVisible = false, verifyInfo = {}, record = {}
    } = this.state
    const { businessLine } = this.props

    const auditingColumns = [
      {
        title: '策略编码',
        dataIndex: 'strategyCode',
        key: 'strategyCode',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '策略名称',
        dataIndex: 'strategyName',
        key: 'strategyName',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '业务条线',
        dataIndex: 'businessLineName',
        key: 'businessLineName',
        width: 120
      }, {
        title: '审批类型',
        dataIndex: 'operationName',
        key: 'operationName',
        width: 120
      }, {
        title: '申请人',
        dataIndex: 'proposer',
        key: 'proposer',
        width: 120,
        render: (text, record) => {
          return (<div className="text-overflow" style={{ width: 104 }} title={text}>{text}</div>)
        }
      }, {
        title: '申请时间',
        dataIndex: 'applyTime',
        key: 'applyTime',
        width: 180,
        render: (text) => {
          return formatDate(text)
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 100,
        render: (text, record) => {
          const { verificationId, operation } = record
          return ['FIRST_ONLINE', 'OFFLINE'].indexOf(operation) !== -1 ? <Fragment>
            <span className="operation-span" onClick={() => this.updateVerification({
              status: 'pass',
              verificationIds: verificationId
            })}>批准</span>
            <span className="operation-span" onClick={() => this.updateVerification({
              status: 'reject',
              verificationIds: verificationId
            })}>驳回</span>
          </Fragment> : <span className="operation-span" onClick={() => this.doVerify(record)}>审批</span>
        }
      }]
    const completedColumns = [
      {
        title: '策略编码',
        dataIndex: 'strategyCode',
        key: 'strategyCode',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '策略名称',
        dataIndex: 'strategyName',
        key: 'strategyName',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '业务条线',
        dataIndex: 'businessLineName',
        key: 'businessLineName',
        width: 120
      }, {
        title: '审批类型',
        dataIndex: 'operationName',
        key: 'operationName',
        width: 120
      }, {
        title: '版本号',
        dataIndex: 'version',
        key: 'version'
      }, {
        title: '审批结果',
        dataIndex: 'verificationResultDesc',
        key: 'verificationResultDesc'
      }, {
        title: '申请人',
        dataIndex: 'proposer',
        key: 'proposer',
        width: 120,
        render: (text, record) => {
          return (<div className="text-overflow" style={{ width: 104 }} title={text}>{text}</div>)
        }
      }, {
        title: '审批人',
        dataIndex: 'verifier',
        key: 'verifier',
        width: 120,
        render: (text, record) => {
          return (<div className="text-overflow" style={{ width: 104 }} title={text}>{text}</div>)
        }
      }, {
        title: '审批时间',
        dataIndex: 'verifyTime',
        key: 'verifyTime',
        width: 180,
        render: (text) => {
          return formatDate(text)
        }
      }]

    return (<Fragment>
        <Tabs type="card" activeKey={verifiedType} className="verification-page tabs-no-border"
              onChange={this.onTabsTypeChange}>
          <TabPane tab="待审批" key="AUDITING">
            <div className="region-zd">
              <Input placeholder="策略编码/策略名称" value={name} maxLength={'50'} onChange={this.changeName}
                     style={{ width: 200 }} />
              <Select value={businessLineId} placeholder="业务条线" style={{ width: 200 }}
                      onChange={this.changeBusinessLine} allowClear>
                {
                  businessLine.map(businessLine => {
                    const { lineId, lineName } = businessLine
                    return (
                      <Option key={lineId} value={lineId}>{lineName}</Option>
                    )
                  })
                }
              </Select>
              <Select value={verificationType} placeholder="审批类型" style={{ width: 200 }}
                      onChange={this.changeVerificationType} allowClear>
                {
                  verificationTypes.map(verificationType => {
                    const { key, value } = verificationType
                    return (
                      <Option key={key} value={key}>{value}</Option>
                    )
                  })
                }
              </Select>
              <Button type="primary" onClick={() => {
                this.realParam = { ...this.state }
                this.onVerificationQuery(1)
              }}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
            </div>
            <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
              <Table rowKey="verificationId" className="table-layout-fixed table-td-no-auto"
                     columns={auditingColumns} dataSource={dataSource}
                     onChange={this.handleChange} locale={{ emptyText: '暂无数据' }} pagination={pagination} />
            </div>
          </TabPane>
          <TabPane tab="已完成" key="COMPLETED">
            <div className="region-zd">
              <Input placeholder="策略编码/策略名称" value={completedName} maxLength={'50'} onChange={this.changeCompletedName}
                     style={{ width: 200 }} />
              <Select value={completedBusinessLineId} placeholder="业务条线" style={{ width: 200 }}
                      onChange={this.changeCompletedBusinessLine} allowClear>
                {
                  businessLine.map(businessLine => {
                    const { lineId, lineName } = businessLine
                    return (
                      <Option key={lineId} value={lineId}>{lineName}</Option>
                    )
                  })
                }
              </Select>
              <Checkbox checked={onlyMine} onChange={this.onChangeOnlyMine}>只看我的</Checkbox>
              <Button type="primary" onClick={() => {
                this.realParam = { ...this.state }
                this.onCompletedVerificationQuery(1)
              }}>查询</Button>
              <Button type="default" onClick={this.onClearCompletedClick}>重置</Button>
            </div>
            <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
              <Table rowKey="verificationId" className="table-layout-fixed table-td-no-auto"
                     columns={completedColumns} dataSource={completedDataSource}
                     onChange={this.handleChangeCompleted} locale={{ emptyText: '暂无数据' }}
                     pagination={completedPagination} />
            </div>
          </TabPane>
        </Tabs>
        <Verify visible={verifyVisible} info={verifyInfo} record={record}
                onCancel={this.onCancel}
                updateVerification={this.updateVerification} />
      </Fragment>
    )
  }

  onCancel = () => {
    this.setState({
      verifyVisible: false
    })
  }

  updateVerification = (data) => {
    updateVerification(data).then(() => {
      this.onVerificationQuery()
      this.onCancel()
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  doVerify = record => {
    const { verificationId = '' } = record
    getVerificationInfo(verificationId).then(data => {
      const { content: verifyInfo = {} } = data
      this.setState({
        verifyVisible: true,
        verifyInfo,
        record
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onChangeOnlyMine = e => {
    this.setState({
      onlyMine: e.target.checked
    })
  }

  onTabsTypeChange = (type) => {
    const { verifiedType } = this.state
    this.setState({ verifiedType: type }, () => {
      if (!verifiedType && type === 'COMPLETED') {
        this.onCompletedVerificationQuery()
      }
    })
  }

  handleChange = (pagination) => {
    const { pagination: { pageSize = 1 } } = this.state
    this.setState({ pagination }, () => {
      const offset = pageSize !== pagination.pageSize ? 1 : pagination.current
      this.onVerificationQuery(offset, pagination.pageSize)
    })
  }

  handleChangeCompleted = (completedPagination) => {
    const { completedPagination: { pageSize = 1 } } = this.state
    this.setState({ completedPagination }, () => {
      const offset = pageSize !== completedPagination.pageSize ? 1 : completedPagination.current
      this.onCompletedVerificationQuery(offset, completedPagination.pageSize)
    })
  }

  onClearClick = () => {
    this.setState({
      name: '',
      businessLineId: undefined,
      verificationType: undefined
    })
  }

  onClearCompletedClick = () => {
    this.setState({
      completedName: '',
      completedBusinessLineId: undefined,
      onlyMine: true
    })
  }

  changeName = (e) => {
    this.setState({ name: e.target.value })
  }

  changeCompletedName = (e) => {
    this.setState({ completedName: e.target.value })
  }

  changeBusinessLine = (businessLineId) => {
    this.setState({ businessLineId })
  }

  changeCompletedBusinessLine = (completedBusinessLineId) => {
    this.setState({ completedBusinessLineId })
  }

  changeVerificationType = (verificationType) => {
    this.setState({ verificationType })
  }

  getVerificationTypes = () => {
    getVerificationTypes().then(data => {
      const { content: verificationTypes = [] } = data
      this.setState({ verificationTypes })
    })
  }

  onVerificationQuery = (offset = 0, limit = 0) => {
    const { pagination } = this.state
    const { businessLineId, verificationType, name } = this.realParam
    const { current = 1, pageSize = 10 } = pagination
    const pageNum = offset || current
    limit = limit || pageSize
    getVerificationList({
      businessLineId,
      keyword: name,
      operation: verificationType,
      done: false,
      onlyMine: false,
      pageNum,
      pageSize: limit
    }).then(data => {
      const { content: { data: dataSource, page, total } = {} } = data
      pagination.current = page
      pagination.total = total
      this.setState({ pagination, dataSource })
    })
  }

  onCompletedVerificationQuery = (offset = 0, limit = 0) => {
    const { completedPagination } = this.state
    const {
      completedBusinessLineId: businessLineId, verificationType, completedName, onlyMine = true
    } = this.realParam
    const { current = 1, pageSize = 10 } = completedPagination
    const pageNum = offset || current
    limit = limit || pageSize
    getVerificationList({
      businessLineId,
      keyword: completedName,
      operation: verificationType,
      done: true,
      onlyMine,
      pageNum,
      pageSize: limit
    }).then(data => {
      const { content: { data: completedDataSource, page, total } = {} } = data
      completedPagination.current = page
      completedPagination.total = total
      this.setState({ completedPagination, completedDataSource })
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(VerificationList))
