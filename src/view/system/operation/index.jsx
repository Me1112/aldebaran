import React, { Component } from 'react'
import { Input, Table, Select, DatePicker, Form, notification, Button } from 'antd'
import {
  getOperationTypeList,
  getAuditTypeList,
  getAuditList
} from '../../../action/system'
import { buildUrlParamNew, formatDate } from '../../../util/index'
import './index.less'
import LayoutRight from '../../../component/layout_right'

const { Option } = Select
const { RangePicker } = DatePicker

class RuleList extends Component {
  state = {
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }

  componentDidMount() {
    this.realParam = { ...this.state }
    this.getOperationTypeList()
    this.getAuditTypeList()
    this.getAuditList()
  }

  render() {
    const { dataSource = [], auditType, operateType, auditTypeList = [], operationTypeList = [], pagination, loading = false } = this.state
    const columns = [
      {
        title: '用户',
        dataIndex: 'userName',
        width: 150,
        key: 'userName'
      }, {
        title: '创建时间',
        dataIndex: 'operateTime',
        width: 200,
        key: 'operateTime',
        render: (text, record) => {
          return formatDate(record.operateTime)
        }
      }, {
        title: 'IP',
        dataIndex: 'ip',
        width: 150,
        key: 'ip'
      }, {
        title: '操作类型',
        dataIndex: 'operateName',
        width: 100,
        key: 'operateName'
      }, {
        title: '资源类型',
        dataIndex: 'auditTypeName',
        width: 100,
        key: 'auditTypeName'
      }, {
        title: '操作内容',
        dataIndex: 'comment',
        key: 'comment',
        render: (text, record) => {
          return (<div className="text-overflow cell" title={text}>{text}</div>)
        }
      }]

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Input placeholder="请选择用户" style={{ width: 150 }}
                 onChange={this.nameChange} />
          <Select value={operateType} placeholder="选择操作类型" style={{ width: 150 }}
                  onChange={this.operateTypeChange} allowClear>
            {
              operationTypeList.map(item => {
                return (<Option key={item.key} value={item.key}>{item.name}</Option>)
              })
            }
          </Select>
          <Select value={auditType} placeholder="选择资源类型" style={{ width: 150 }}
                  onChange={this.auditTypeChange} allowClear>
            {
              auditTypeList.map(item => {
                return (<Option key={item.key} value={item.key}>{item.name}</Option>)
              })
            }
          </Select>
          <Input placeholder="请输入操作内容" style={{ width: 150 }} onChange={this.commentChange} />
          <RangePicker style={{ width: 220 }} onChange={this.createTimeChange} />
          <Button type="primary" onClick={() => {
            this.realParam = { ...this.state }
            this.getAuditList(1)
          }}>查询</Button>
        </div>
        <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
          <Table rowkey="ruleId" className="table-td-no-auto" columns={columns} dataSource={dataSource}
                 locale={{ emptyText: '暂无数据' }} loading={loading}
                 onChange={this.handleChange}
                 pagination={pagination} />
        </div>
      </LayoutRight>
    )
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.getAuditList(pagination.current)
    })
  }
  getAuditTypeList = async () => {
    await getAuditTypeList().then(res => {
      const { content = [] } = res
      content.forEach(item => {
        item.key = item.target
      })
      this.setState({ auditTypeList: content })
    })
  }
  getOperationTypeList = async () => {
    await getOperationTypeList().then(res => {
      const { content = [] } = res
      content.forEach(item => {
        item.key = item.index
      })
      this.setState({ operationTypeList: content })
    })
  }
  getAuditList = async (pageNum = 1) => {
    const { userName = '', comment = '', operateType = '', auditType = '', endDate, beginDate, pagination } = this.realParam
    const { pageSize } = pagination
    const data = {
      userName,
      comment,
      operateType,
      auditType,
      beginDate,
      endDate,
      pageNum,
      pageSize
    }
    this.setState({
      loading: true
    })
    console.log(buildUrlParamNew(data))
    await getAuditList(buildUrlParamNew(data)).then(res => {
      if (res.actionStatus === 'SUCCESS') {
        const { content = {} } = res
        const { data = [], page, total } = content
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.getAuditList(1)
          return
        }
        data.forEach((item, index) => {
          item.key = `${page}_${index}`
        })
        pagination.total = total
        pagination.current = page
        this.setState({ dataSource: data, loading: false, pagination })
      } else {
        notification.warning(res.content)
        this.setState({
          loading: false
        })
      }
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  createTimeChange = (date, dateStr) => {
    this.setState({
      beginDate: dateStr[0],
      endDate: dateStr[1]
    })
  }

  nameChange = (e) => {
    this.setState({
      userName: e.target.value
    })
  }
  commentChange = (e) => {
    this.setState({
      comment: e.target.value
    })
  }

  operateTypeChange = (value) => {
    this.setState({
      operateType: value
    })
  }
  auditTypeChange = (value) => {
    this.setState({
      auditType: value
    })
  }
}

export default (Form.create()(RuleList))
