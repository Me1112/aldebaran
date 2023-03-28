import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Table, Select, DatePicker, notification, Button, Input } from 'antd'
import { getDataCallbackList } from '../../../action/policy'
import { formatDate } from '../../../util'
import moment from 'moment'
import './index.less'
import LayoutRight from '../../../component/layout_right'
import ViewerModal from '../../../component/viewer_modal'

const { RangePicker } = DatePicker
const { Option } = Select
const CALL_RESOURCES = { STRATEGY: '策略决策', 'TEST': '在线测试' }
const CALL_RESULTS = { SUCCESS: '成功', 'FAILED': '失败' }

export default class CallbackList extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const {
      pageSize = 10,
      current = 1,
      eventId = '',
      callResult = undefined,
      serviceName = '',
      startDateVal = new Date().format('yyyy-MM-dd') + ' 00:00:00',
      endDateVal = new Date().format('yyyy-MM-dd') + ' 23:59:59'
    } = state

    this.state = {
      pagination: {
        current,
        pageSize,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      },
      eventId,
      serviceName,
      callResult,
      occurTimeVal: [moment(startDateVal), moment(endDateVal)],
      startDateVal,
      endDateVal,
      page: current,
      size: pageSize
    }
    this.realParam = this.state
  }

  static propTypes = {
    location: PropTypes.object
  }

  componentDidMount() {
    this.onEventQuery()
  }

  render() {
    const {
      pagination,
      dataSource = [],
      occurTimeVal,
      eventId,
      visible,
      serviceName,
      callResult,
      record = {}
    } = this.state

    const columns = [{
      title: '数据服务名称',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: '15%',
      render: text => {
        return <div title={text} className="text-overflow">{text}</div>
      }
    }, {
      title: '调用时间',
      dataIndex: 'callTime',
      key: 'callTime',
      width: 180,
      render: (text) => {
        text = formatDate(text) || text
        return <div title={text} className="text-overflow">{text}</div>
      }
    }, {
      title: '事件流水号',
      dataIndex: 'eventId',
      key: 'eventId',
      width: '15%',
      render: (text) => {
        return <div title={text} className="text-overflow">{text}</div>
      }
    }, {
      title: '调用来源',
      dataIndex: 'callSource',
      key: 'callSource',
      width: '10%',
      render: (text) => {
        return <div title={text} className="text-overflow">{CALL_RESOURCES[text] || ''}</div>
      }
    }, {
      title: '调用结果',
      dataIndex: 'callResult',
      key: 'callResult',
      width: '10%',
      render: (text) => {
        return <div title={text} className="text-overflow">{CALL_RESULTS[text] || ''}</div>
      }
    }, {
      title: '耗时',
      dataIndex: 'duration',
      key: 'duration',
      width: 100
    }, {
      title: '操作',
      dataIndex: 'operations',
      key: 'operations',
      width: 80,
      render: (text, record) => {
        return <span className="operation-span" onClick={() => this.showCallInfo(record)}>调用信息</span>
      }
    }]

    return (<Fragment>
        <LayoutRight className="no-bread-crumb">
          <div className="region-zd">
            <div style={{ paddingBottom: 20 }}>
              <RangePicker style={{ width: 220 }} onChange={this.occurTimeChange}
                           value={occurTimeVal}
                           defaultValue={occurTimeVal} format="YYYY-MM-DD"
                           onCalendarChange={this.onCalendarChange} />
              <Input placeholder="数据服务名称" style={{ width: 220 }} value={serviceName} maxLength={50}
                     onChange={this.onServiceNameChange} />
              <Input placeholder="事件流水号" style={{ width: 220 }} value={eventId} maxLength={50}
                     onChange={this.onEventIdChange} />
              <Select value={callResult} placeholder="调用结果" style={{ width: 220 }}
                      onChange={(e) => this.onSelectChange(e, 'callResult')} allowClear>
                <Option key="SUCCESS" value="SUCCESS">成功</Option>
                <Option key="FAILED" value="FAILED">失败</Option>
              </Select>
              <Button type="primary" onClick={this.onQueryClick} style={{ marginRight: '10px' }}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
            </div>
          </div>
          <div style={{ height: 'calc(100% - 105px)', overflowY: 'scroll' }}>
            <Table rowKey="id" className="table-layout-fixed event-list" columns={columns} dataSource={dataSource}
                   onChange={this.handleChange} pagination={pagination} />
          </div>
        </LayoutRight>
        <ViewerModal data={record} visible={visible} onCancel={this.onCancel} />
      </Fragment>
    )
  }

  onCancel = () => {
    this.setState({ visible: false })
  }

  showCallInfo = (record) => {
    this.setState({ record, visible: true })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.onEventQuery(pagination.current, pagination.pageSize)
    })
  }

  onClearClick = () => {
    this.setState({
      eventId: '',
      callResult: undefined,
      serviceName: '',
      occurTimeVal: [moment(), moment()],
      startDateVal: new Date().format('yyyy-MM-dd') + ' 00:00:00',
      endDateVal: new Date().format('yyyy-MM-dd') + ' 23:59:59'
    })
  }

  onQueryClick = () => {
    this.realParam = this.state
    this.onEventQuery()
  }

  onEventQuery = (pageNum = 1, limit = 0) => {
    const {
      serviceName,
      startDateVal,
      endDateVal,
      eventId,
      callResult
    } = this.realParam

    const { pagination } = this.state

    const { pageSize } = pagination
    const numPerPage = limit || pageSize

    let data = {
      callResult,
      startDate: startDateVal,
      endDate: endDateVal,
      eventId,
      serviceName,
      pageNum,
      pageSize: numPerPage
    }
    getDataCallbackList(data).then(res => {
      const { content: { data = [], page, total } = {} } = res
      pagination.total = total
      pagination.current = page

      this.setState({
        pagination,
        dataSource: data
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }

  occurTimeChange = (date, dateStr) => {
    const isClear = date.length === 0
    this.setState({
      occurTimeVal: date,
      startDateVal: isClear ? '' : dateStr[0] + ' 00:00:00',
      endDateVal: isClear ? '' : dateStr[1] + ' 23:59:59'
    })
  }

  onCalendarChange = (dates) => {
    this.setState({ occurTimeVal: dates })
  }

  onServiceNameChange = e => {
    this.setState({
      serviceName: e.target.value
    })
  }

  onEventIdChange = e => {
    this.setState({
      eventId: e.target.value
    })
  }
}
