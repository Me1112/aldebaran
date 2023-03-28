import React, { Component, Fragment } from 'react'
import { Table, notification, Icon, Modal, Button, Popover, Select, Form, DatePicker } from 'antd'
import {
  getJobList,
  getJobFailDetail,
  updateJobFrequency,
  manualExecute
} from '../../../action/system'
import { formatDate } from '../../../util/index'
import LayoutRight from '../../../component/layout_right'
import moment from 'moment'
import './index.less'
import PropTypes from 'prop-types'

const { Option } = Select
const { Item: FormItem } = Form
const { RangePicker } = DatePicker

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 }
}

const JOB_FREQUENCY = {
  EVERY_TEN_MIN: '10分钟',
  EVERY_THIRTY_MIN: '30分钟',
  O_CLOCK: '1小时'
}

const JOB_STATUS = {
  WAITING: '等待中',
  EXECUTING: '执行中'
}

const JOB_RESULT = {
  SUCCESS: '成功',
  FAILED: '失败'
}

@Form.create()
export default class Job extends Component {
  state = {
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }

  static propTypes = {
    form: PropTypes.any
  }

  componentDidMount() {
    this.getJobList()
  }

  render() {
    const { form } = this.props
    const { getFieldProps } = form
    const {
      dataSource = [],
      loading = false,
      failDetailList = [],
      failDetailVisible = false,
      pagination = {},
      frequencyVisible = {},
      manualExecuteVisible = false
    } = this.state
    const columns = [
      {
        title: '任务名称',
        dataIndex: 'jobName',
        key: 'jobName',
        width: '15%',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '执行频率',
        dataIndex: 'jobExecuteFrequency',
        key: 'jobExecuteFrequency',
        width: '10%',
        render: (text, record) => {
          const { id } = record
          const content = <div style={{ width: 240 }}>
            <Form>
              <FormItem {...formItemLayout} label="执行频率">
                <Select {...getFieldProps('jobExecuteFrequency', {
                  validate: [{
                    rules: [
                      { required: true, message: '请选择' }
                    ]
                  }]
                })} placeholder="请选择">
                  {
                    Object.keys(JOB_FREQUENCY).map(field => {
                      return <Option key={field} value={field}>
                        {JOB_FREQUENCY[field]}
                      </Option>
                    })
                  }
                </Select>
              </FormItem>
            </Form>
            <div style={{ textAlign: 'right' }}>
              <Button type="primary"
                      size={'small'}
                      onClick={() => this.onFrequencySave(id)}>保存</Button>
              <Button style={{ marginLeft: 10 }}
                      size={'small'}
                      onClick={() => this.onFrequencyCancel(id)}>取消</Button>
            </div>
          </div>
          return <Fragment>
            <div className="text-overflow" title={JOB_FREQUENCY[text]}
                 style={{ display: 'inline-block', verticalAlign: 'text-bottom' }}>{JOB_FREQUENCY[text]}</div>
            <Popover placement="bottomRight" visible={frequencyVisible[id]} content={content} trigger="click"
                     onVisibleChange={visible => this.onVisibleChange(visible, id)}>
              <Icon type="edit" onClick={() => this.onFrequencyOpen(record)} />
            </Popover>
          </Fragment>
        }
      }, {
        title: '当前状态',
        dataIndex: 'executeStatus',
        key: 'executeStatus',
        width: '10%',
        render: (text, record) => {
          return (<div className="text-overflow" title={JOB_STATUS[text]}>{JOB_STATUS[text]}</div>)
        }
      }, {
        title: '下一次执行时间',
        dataIndex: 'nextFireTime',
        key: 'nextFireTime',
        width: '15%',
        render: (text, record) => {
          return formatDate(record.nextFireTime)
        }
      }, {
        title: '上一次执行结果',
        dataIndex: 'executeResult',
        key: 'executeResult',
        width: '10%',
        render: (text, record) => {
          return <Fragment>
            <Icon type="circle"
                  style={{ color: text === 'SUCCESS' ? '#34b527' : '#df2322', position: 'relative', top: 2 }} />
            {JOB_RESULT[text]}
          </Fragment>
        }
      }, {
        title: '上一次执行时间',
        dataIndex: 'preFireTime',
        key: 'preFireTime',
        width: '15%',
        render: (text, record) => {
          return formatDate(record.preFireTime)
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 140,
        render: (text, record) => {
          const { failedCount = 0, executeStatus } = record
          return <Fragment>
            {
              failedCount > 0
                ? <span className="operation-span" onClick={() => this.viewFailDetail(record)}>失败明细</span> : null
            }
            {
              executeStatus === 'WAITING'
                ? <span className="operation-span" onClick={() => this.onManualExecuteClick(record)}>手动执行</span> : null
            }
          </Fragment>
        }
      }]
    const failDetailColumns = [
      {
        title: '预计执行时间',
        dataIndex: 'predictionTime',
        key: 'predictionTime',
        width: '25%',
        render: (text, record) => {
          return formatDate(record.predictionTime)
        }
      }, {
        title: '上一次执行结果',
        dataIndex: 'executeResult',
        key: 'executeResult',
        width: '25%',
        render: (text, record) => {
          return <Fragment>
            <Icon type="circle"
                  style={{ color: text === 'SUCCESS' ? '#34b527' : '#df2322', position: 'relative', top: 2 }} />
            {JOB_RESULT[text]}
          </Fragment>
        }
      }, {
        title: '实际开始时间',
        dataIndex: 'executeTime',
        key: 'executeTime',
        width: '25%',
        render: (text, record) => {
          return formatDate(record.executeTime)
        }
      }, {
        title: '实际结束时间',
        dataIndex: 'finishTime',
        key: 'finishTime',
        width: '25%',
        render: (text, record) => {
          return formatDate(record.finishTime)
        }
      }]
    const failDetailBeginDate = moment().subtract(7, 'days').format('YYYY-MM-DD')
    const failDetailEndDate = moment().format('YYYY-MM-DD')

    return (
      <LayoutRight className="no-bread-crumb">
        <div style={{ height: '100%', overflowY: 'scroll' }}>
          <Table rowKey="id" className="table-td-no-auto" columns={columns} dataSource={dataSource}
                 locale={{ emptyText: '暂无数据' }} loading={loading}
                 pagination={false} />
        </div>
        <Modal
          title="失败明细"
          visible={failDetailVisible}
          centered
          width={800}
          maskClosable={false}
          onCancel={this.onCancel}
          footer={<Button type="default" onClick={this.onCancel}>关闭窗口</Button>}
        >
          <div style={{ maxHeight: 550, overflow: 'auto' }}>
            <span style={{ fontWeight: 'bolder' }}>{failDetailBeginDate}~{failDetailEndDate}的失败任务如下：</span>
            <Table rowKey="executeTime" className="table-layout-fixed" size="small"
                   columns={failDetailColumns} dataSource={failDetailList} pagination={pagination}
                   onChange={this.handleChange} />
          </div>
        </Modal>
        <Modal
          title="手动执行"
          visible={manualExecuteVisible}
          centered
          width={450}
          maskClosable={false}
          onCancel={this.onManualExecuteCancel}
          onOk={this.onManualExecute}
        >
          <div>
            <div>
              <Icon type="warning-circle" style={{ color: '#f5a623' }} />
              <span style={{ color: 'rgba(0,0,0,.45)' }}>
              提醒：手动执行确认后立即执行，会对该时间范围内的数据进行覆盖更新。执行期间原系统调度的任务将延后执行！
              </span>
            </div>
            <Form>
              <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} label="时间范围">
                <RangePicker showTime={{ format: 'HH:mm:ss' }}
                             format="YYYY-MM-DD" style={{ width: '100%' }} allowClear
                             disabledDate={this.disabledDate} {...getFieldProps('timeRange', {
                  validate: [{
                    rules: [
                      { required: true, message: '请选择时间' }
                    ]
                  }]
                })} />
              </FormItem>
            </Form>
          </div>
        </Modal>
      </LayoutRight>
    )
  }

  onFrequencySave = (id) => {
    const jobExecuteFrequency = this.props.form.getFieldValue('jobExecuteFrequency')
    updateJobFrequency({
      id,
      jobExecuteFrequency
    }).then(() => {
      this.onFrequencyCancel(id)
      this.getJobList()
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onFrequencyOpen = record => {
    const { id, jobExecuteFrequency } = record
    const { frequencyVisible = {} } = this.state
    this.setState({
      frequencyVisible: { ...frequencyVisible, [id]: true }
    }, () => {
      this.props.form.setFieldsValue({ jobExecuteFrequency })
    })
  }

  onFrequencyCancel = id => {
    const { frequencyVisible = {} } = this.state
    this.setState({
      frequencyVisible: { ...frequencyVisible, [id]: false }
    }, () => {
      this.props.form.resetFields()
    })
  }

  onVisibleChange = (visible, id) => {
    if (!visible) {
      this.onFrequencyCancel(id)
    }
  }

  getJobList = () => {
    getJobList().then(res => {
      const { content: dataSource = [] } = res
      this.setState({ dataSource })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  viewFailDetail = record => {
    this.setState({
      record
    }, () => {
      this.getJobFailDetail()
    })
  }

  getJobFailDetail = () => {
    const {
      record: {
        id: jobId = ''
      } = {},
      pagination: {
        current: pageNum = 1,
        pageSize = 10
      } = {}
    } = this.state
    getJobFailDetail({
      jobId,
      pageNum,
      pageSize
    }).then(res => {
      const { content: { data: failDetailList = [], total = 0 } = {} } = res
      this.setState({
        failDetailVisible: true,
        pagination: {
          ...this.state.pagination,
          total
        },
        failDetailList
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onCancel = () => {
    this.setState({
      failDetailVisible: false,
      pagination: {
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      }
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.getJobFailDetail()
    })
  }

  onManualExecuteClick = record => {
    this.setState({
      record,
      manualExecuteVisible: true
    })
  }

  onManualExecuteCancel = () => {
    this.setState({
      manualExecuteVisible: false
    }, () => {
      this.props.form.resetFields()
    })
  }

  disabledDate = (current) => {
    return !(current && current.valueOf() >= moment().subtract(8, 'days').valueOf() && current.valueOf() <= moment().valueOf())
  }

  onManualExecute = () => {
    this.props.form.validateFields(['timeRange'], (err, values) => {
      if (!err) {
        const { record: { id } = {} } = this.state
        const { timeRange: [start = moment(), end = moment()] = [] } = values
        manualExecute({
          id,
          startDate: start.format('YYYY-MM-DD'),
          endDate: end.format('YYYY-MM-DD')
        }).then(() => {
          this.onManualExecuteCancel()
          this.getJobList()
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
      }
    })
  }
}
