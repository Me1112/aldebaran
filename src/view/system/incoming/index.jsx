import React, { Component, Fragment } from 'react'
import { Button, Table, Select, Tabs, DatePicker, Icon, notification } from 'antd'
import {
  getIncomingList,
  getCallbackInfo,
  getCallbackLogList
} from '../../../action/system'
import { getMaxDateInterval } from '../../../action/common'
import ViewerModal from '../../../component/viewer_modal'
import moment from 'moment'
import './index.less'

const { Option } = Select
const { TabPane } = Tabs
const { RangePicker } = DatePicker

const JOB_RESULT = {
  SUCCESS: '成功',
  FAILED: '失败'
}

export default class IncomingList extends Component {
  state = {
    selectedTab: 'INCOMING',
    status: 'FAILED',
    callbackStatus: 'FAILED',
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    },
    callbackPagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }

  componentDidMount() {
    this.realParam = { ...this.state }
    this.getMaxDateInterval()
    this.onIncomingQuery()
  }

  render() {
    const {
      selectedTab = 'INCOMING',
      occurTimeVal = [moment(), moment()],
      callbackOccurTimeVal = [moment(), moment()],
      status,
      callbackStatus,
      hasCallback,
      pagination,
      callbackPagination,
      dataSource = [],
      callbackDataSource = [],
      infoVisible = false,
      infoTitle = '',
      info = {}
    } = this.state

    const incomingColumns = [
      {
        title: '进件时间',
        dataIndex: 'occurTime',
        key: 'occurTime',
        width: 180
      }, {
        title: '事件流水号',
        dataIndex: 'eventId',
        key: 'eventId',
        width: '20%',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '进件结果',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        render: text => {
          return <Fragment>
            <Icon type="circle"
                  style={{ color: text === 'SUCCESS' ? '#34b527' : '#df2322', position: 'relative', top: 2 }} />
            {JOB_RESULT[text]}
          </Fragment>
        }
      }, {
        title: '错误信息',
        dataIndex: 'errorMsg',
        key: 'errorMsg',
        width: '30%',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '是否已回调',
        dataIndex: 'hasCallback',
        key: 'hasCallback',
        width: '10%',
        render: text => {
          return text === 'true' ? '是' : '否'
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 150,
        render: (text, record) => {
          const { hasCallback } = record
          return <Fragment>
            <span className="operation-span" onClick={() => this.viewInfo(record, 'incoming')}>进件信息</span>
            {
              hasCallback === 'true'
                ? <span className="operation-span" onClick={() => this.viewInfo(record, 'callback')}>回调信息</span> : null
            }
          </Fragment>
        }
      }]

    const columns = [{
      title: '事件流水号',
      dataIndex: 'eventId',
      key: 'eventId',
      width: '20%',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '回调时间',
      dataIndex: 'callbackTime',
      key: 'callbackTime',
      width: 180
    }, {
      title: '回调结果',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      render: text => {
        return <Fragment>
          <Icon type="circle"
                style={{ color: text === 'SUCCESS' ? '#34b527' : '#df2322', position: 'relative', top: 2 }} />
          {JOB_RESULT[text]}
        </Fragment>
      }
    }, {
      title: '错误信息',
      dataIndex: 'errorMsg',
      key: 'errorMsg',
      width: '30%',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '操作',
      dataIndex: 'operations',
      key: 'operations',
      width: 80,
      render: (text, record) => {
        return <span className="operation-span" onClick={() => this.viewInfo(record, 'callbackDetail')}>回调信息</span>
      }
    }]

    return (<Fragment>
        <Tabs type="card" activeKey={selectedTab} className="verification-page tabs-no-border"
              onChange={this.onTabsTypeChange}>
          <TabPane tab="进件明细" key="INCOMING">
            <div className="region-zd">
              <RangePicker style={{ width: 220 }} format="YYYY-MM-DD" value={occurTimeVal}
                           onChange={this.occurTimeChange} onCalendarChange={this.onCalendarChange}
                           disabledDate={this.disabledDate} />
              <Select value={status} placeholder="进件结果" style={{ width: 200 }}
                      onChange={this.changeStatus} allowClear>
                <Option value="SUCCESS">成功</Option>
                <Option value="FAILED">失败</Option>
              </Select>
              <Select value={hasCallback} placeholder="是否已回调" style={{ width: 200 }}
                      onChange={this.changeHasCallback} allowClear>
                <Option value="true">是</Option>
                <Option value="false">否</Option>
              </Select>
              <Button type="primary" onClick={() => {
                this.realParam = { ...this.state }
                this.onIncomingQuery(1)
              }}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
            </div>
            <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
              <Table rowKey="id" className="table-layout-fixed table-td-no-auto"
                     columns={incomingColumns} dataSource={dataSource}
                     onChange={this.handleChange} locale={{ emptyText: '暂无数据' }} pagination={pagination} />
            </div>
          </TabPane>
          <TabPane tab="回调明细" key="CALLBACK">
            <div className="region-zd">
              <RangePicker style={{ width: 220 }} format="YYYY-MM-DD" value={callbackOccurTimeVal}
                           onChange={this.callbackOccurTimeChange} onCalendarChange={this.onCallbackCalendarChange}
                           disabledDate={this.disabledCallbackDate} />
              <Select value={callbackStatus} placeholder="进件结果" style={{ width: 200 }}
                      onChange={this.changeCallbackStatus} allowClear>
                <Option value="SUCCESS">成功</Option>
                <Option value="FAILED">失败</Option>
              </Select>
              <Button type="primary" onClick={() => {
                this.realParam = { ...this.state }
                this.onCallbackQuery(1)
              }}>查询</Button>
              <Button type="default" onClick={this.onCallbackClearClick}>重置</Button>
            </div>
            <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
              <Table rowKey="id" className="table-layout-fixed table-td-no-auto"
                     columns={columns} dataSource={callbackDataSource}
                     onChange={this.handleCallbackChange} locale={{ emptyText: '暂无数据' }}
                     pagination={callbackPagination} />
            </div>
          </TabPane>
        </Tabs>
        <ViewerModal title={infoTitle} visible={infoVisible} data={info} onCancel={this.onInfoCancel} />
      </Fragment>
    )
  }

  onCancel = () => {
    this.setState({
      verifyVisible: false
    })
  }

  onTabsTypeChange = (type) => {
    this.setState({ selectedTab: type }, () => {
      if (type === 'INCOMING') {
        this.onIncomingQuery()
      } else {
        this.onCallbackQuery()
      }
    })
  }

  handleChange = (pagination) => {
    const { pagination: { pageSize = 1 } } = this.state
    this.setState({ pagination }, () => {
      const offset = pageSize !== pagination.pageSize ? 1 : pagination.current
      this.onIncomingQuery(offset, pagination.pageSize)
    })
  }

  handleCallbackChange = (callbackPagination) => {
    const { callbackPagination: { pageSize = 1 } } = this.state
    this.setState({ callbackPagination }, () => {
      const offset = pageSize !== callbackPagination.pageSize ? 1 : callbackPagination.current
      this.onCallbackQuery(offset, callbackPagination.pageSize)
    })
  }

  occurTimeChange = (date) => {
    this.setState({
      occurTimeVal: date
    })
  }

  callbackOccurTimeChange = (date) => {
    this.setState({
      callbackOccurTimeVal: date
    })
  }

  onCalendarChange = (dates) => {
    this.setState({ occurTimeVal: dates })
  }

  onCallbackCalendarChange = (dates) => {
    this.setState({ callbackOccurTimeVal: dates })
  }

  disabledDate = (current) => {
    const { occurTimeVal = [moment(), moment()], maxDateInterval = 0 } = this.state
    const startDay = occurTimeVal[0]
    const endDay = occurTimeVal[1]
    const startStr = startDay ? startDay.format('YYYY-MM-DD') : ''
    if (startDay && endDay) {
      return false
    }
    return startStr && !(current.valueOf() >= startDay.valueOf() && current.valueOf() < moment(startStr).add(maxDateInterval, 'days').valueOf())
  }

  disabledCallbackDate = (current) => {
    const { callbackOccurTimeVal = [moment(), moment()], maxDateInterval = 0 } = this.state
    const startDay = callbackOccurTimeVal[0]
    const endDay = callbackOccurTimeVal[1]
    const startStr = startDay ? startDay.format('YYYY-MM-DD') : ''
    if (startDay && endDay) {
      return false
    }
    return startStr && !(current.valueOf() >= startDay.valueOf() && current.valueOf() < moment(startStr).add(maxDateInterval, 'days').valueOf())
  }

  getMaxDateInterval = () => {
    getMaxDateInterval().then(data => {
      const { content: maxDateInterval = 0 } = data
      this.setState({
        maxDateInterval
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  changeStatus = (status) => {
    this.setState({ status })
  }

  changeCallbackStatus = (callbackStatus) => {
    this.setState({ callbackStatus })
  }

  changeHasCallback = (hasCallback) => {
    this.setState({ hasCallback })
  }

  onIncomingQuery = (offset = 0, limit = 0) => {
    const { pagination } = this.state
    const { occurTimeVal: [start, end] = [moment(), moment()], status, hasCallback } = this.realParam
    const { current = 1, pageSize = 10 } = pagination
    const pageNum = offset || current
    limit = limit || pageSize
    getIncomingList({
      startTime: start ? start.format('YYYY-MM-DD 00:00:00') : undefined,
      endTime: end ? end.format('YYYY-MM-DD 23:59:59') : undefined,
      status,
      hasCallback,
      pageNum,
      pageSize: limit
    }).then(data => {
      const { content: { data: dataSource, page, total } = {} } = data
      pagination.current = page
      pagination.total = total
      this.setState({ pagination, dataSource })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onCallbackQuery = (offset = 0, limit = 0) => {
    const { callbackPagination } = this.state
    const { callbackOccurTimeVal: [start, end] = [moment(), moment()], callbackStatus: status } = this.realParam
    const { current = 1, pageSize = 10 } = callbackPagination
    const pageNum = offset || current
    limit = limit || pageSize
    getCallbackLogList({
      startTime: start ? start.format('YYYY-MM-DD 00:00:00') : undefined,
      endTime: end ? end.format('YYYY-MM-DD 23:59:59') : undefined,
      status,
      pageNum,
      pageSize: limit
    }).then(data => {
      const { content: { data: callbackDataSource, page, total } = {} } = data
      callbackPagination.current = page
      callbackPagination.total = total
      this.setState({ callbackPagination, callbackDataSource })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onClearClick = () => {
    this.setState({
      occurTimeVal: [moment(), moment()],
      status: 'FAILED',
      hasCallback: undefined
    })
  }

  onCallbackClearClick = () => {
    this.setState({
      callbackOccurTimeVal: [moment(), moment()],
      callbackStatus: 'FAILED'
    })
  }

  viewInfo = (record, type) => {
    switch (type) {
      case 'incoming':
        const { inputParams: requestParams = {}, responseData: responseParams = {} } = record
        this.setState({
          infoVisible: true,
          infoTitle: '进件信息',
          info: {
            requestParams,
            responseParams
          }
        })
        break
      case 'callback':
        const { eventId = '' } = record
        getCallbackInfo({ eventId }).then(data => {
          const { content: { inputParams: requestParams = {}, responseData: responseParams = {} } = {} } = data
          this.setState({
            infoVisible: true,
            infoTitle: '回调信息',
            info: {
              requestParams,
              responseParams
            }
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
        break
      case 'callbackDetail':
        const { inputParams = {}, responseData = {} } = record
        this.setState({
          infoVisible: true,
          infoTitle: '回调信息',
          info: {
            requestParams: inputParams,
            responseParams: responseData
          }
        })
        break
    }
  }

  onInfoCancel = () => {
    this.setState({
      infoVisible: false,
      info: {}
    })
  }
}
