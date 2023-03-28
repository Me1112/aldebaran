import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Progress, Row, Col, DatePicker, notification, Form } from 'antd'
import moment from 'moment'

import { formatDate } from '../../../util'
import {
  getTotalData, getRiskStat
} from '../../../action/report'
import './index.less'
import echarts from 'echarts'
import 'echarts/lib/chart/bar'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'
import LayoutRight from '../../../component/layout_right'

const { RangePicker } = DatePicker
const FormItem = Form.Item

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    getTotalData: bindActionCreators(getTotalData, dispatch),
    getRiskStat: bindActionCreators(getRiskStat, dispatch)
  }
}

class EventMarket extends Component {
  static propTypes = {
    getTotalData: PropTypes.func.isRequired,
    getRiskStat: PropTypes.func.isRequired
  }
  state = {
    todayDate: new Date(),
    beginDate: formatDate(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)).split(' ')[0] + ' 00:00:00',
    endDate: formatDate(new Date().getTime()).split(' ')[0] + ' 23:59:59',

    riskTodayData: {},
    totalData: {}, // 全局统计数据

    chart: {}, // 全局图对象
    chartOriginData: [] // 原始数据对象
  }

  componentWillMount() {
    this.getRiskTodayData()
  }

  componentDidMount() {
    this.setState({
      chart: echarts.init(document.getElementById('chart'))
    }, () => {
      this.getData()
    })
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 15 }
    }
    const { beginDate, endDate, totalData, riskTodayData = {}, chartOriginData } = this.state
    const { refuseCount = 0, checkCount = 0, passCount = 0 } = riskTodayData
    let totalCount = refuseCount + checkCount + passCount
    return (
      <LayoutRight breadCrumb={['风险分析', '风险大盘', '事件大盘']}>
        <div className="report-today">
          <div className="report-header">
            <div className="event-count area">
              <div className="ant-form-item-label">
                <label>今日事件</label>
                <span className="report-data event-count-data">{totalCount}</span>
              </div>
            </div>
            <div className="percent-area area">
              <Form>
                <Row gutter={16}>
                  <Col className="gutter-row" span={8}>
                    <div className="gutter-box">
                      <FormItem
                        {...formItemLayout}
                        label="拒绝："
                      >
                        <Progress
                          percent={totalCount ? Number.parseFloat(Number.parseFloat(refuseCount / totalCount * 100).toFixed(2)) : 0}
                          status="active"
                          strokeColor="#e5204b"
                          format={percent => <span className="report-data">{refuseCount}（{percent}%）</span>}
                          size="small" />
                      </FormItem>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={8}>
                    <div className="gutter-box">
                      <FormItem
                        {...formItemLayout}
                        label="人工审核："
                      >
                        <Progress
                          percent={totalCount ? Number.parseFloat(Number.parseFloat(checkCount / totalCount * 100).toFixed(2)) : 0}
                          status="active"
                          strokeColor="#0d7ffd"
                          format={percent => <span className="report-data">{checkCount}（{percent}%）</span>}
                          size="small" />
                      </FormItem>
                    </div>
                  </Col>
                  <Col className="gutter-row" span={8}>
                    <div className="gutter-box">
                      <FormItem
                        {...formItemLayout}
                        label="通过 ："
                      >
                        <Progress
                          percent={totalCount ? Number.parseFloat(Number.parseFloat(passCount / totalCount * 100).toFixed(2)) : 0}
                          status="active"
                          strokeColor="#1ea29a"
                          format={percent => <span className="report-data">{passCount}（{percent}%）</span>}
                          size="small" />
                      </FormItem>
                    </div>
                  </Col>
                </Row>
              </Form>

            </div>
          </div>
          <div className="region-zd">
            <RangePicker style={{ width: 240 }} onChange={this.onTimeChange}

                         defaultValue={[moment(beginDate.split(' ')[0], 'YYYY-MM-DD'), moment(endDate.split(' ')[0], 'YYYY-MM-DD')]}
                         format={'YYYY-MM-DD'} allowClear={false} />
            {/* <Icon type="search" className="anticon-search" onClick={this.getData} /> */}
          </div>
          <div className="report-area" style={{ height: 'calc(100% - 131px)' }}>
            <Row gutter={24}>
              <Col className="gutter-row left-area" span={16}>
                <div className="gutter-box">
                  <div className="left-area-title">
                    <p className="fl">{`风险事件数据统计（${beginDate.split(' ')[0]} ~ ${endDate.split(' ')[0]}）`}</p>
                    {/* <div className="fr">q</div> */}
                  </div>
                  <div className="left-area-warp">
                    {chartOriginData.length === 0 ? <p className="no-data-tip">暂无数据</p> : ''}
                    <div id="chart" style={{ height: '100%' }} />
                  </div>
                </div>
              </Col>
              <Col className="gutter-row right-area" span={8}>
                <div className="gutter-box pl15 pr15">
                  <div className="total-data">
                    <div className="total-data-item">
                      <p>拒绝数</p>
                      <p className="tr">{totalData.refuseCount}</p>
                    </div>
                    <div className="total-data-item">
                      <p>人工审核数</p>
                      <p className="tr">{totalData.checkCount}</p>
                    </div>
                    <div className="total-data-item">
                      <p>通过数</p>
                      <p className="tr">{totalData.passCount}</p>
                    </div>
                    <div className="total-data-item">
                      <p>事件总量</p>
                      <p className="tr">{totalData.totalCount}</p>
                    </div>
                    <div className="total-data-item">
                      <p>拒绝比例</p>
                      <p className="tr">{Number.parseFloat((totalData.refusePercent || 0) * 100).toFixed(2)}%</p>
                    </div>
                    <div className="total-data-item">
                      <p>风险比例</p>
                      <p className="tr">{Number.parseFloat((totalData.riskPercent || 0) * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </LayoutRight>
    )
  }

  /**
   * 今日数据
   * @returns {Promise<void>}
   */
  getRiskTodayData = async () => {
    let date = formatDate(this.state.todayDate.getTime()).split(' ')[0]
    let beginDate = date + ' 00:00:00'
    let endDate = date + ' 23:59:59'
    const { promise } = await this.props.getRiskStat({ beginDate, endDate })
    promise.then((data) => {
      this.setState({
        riskTodayData: data.content[0] ? data.content[0] : {
          checkCount: 0,
          passCount: 0,
          refuseCount: 0
        }
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  /**
   * 折线图数据
   * @returns {Promise<void>}
   */
  getRiskData = async () => {
    let { beginDate, endDate, chart } = this.state
    const { promise } = await this.props.getRiskStat({ beginDate, endDate })
    promise.then((data) => {
      this.setState({
        chartOriginData: data.content
      })
      if (data.content.length === 0) {
        chart.clear()
        return
      }
      let lineOp = {
        symbolSize: 6
      }
      let series = [{
        data: [],
        name: '拒绝',
        type: 'bar',
        stack: 'bar',
        barMaxWidth: '30%',
        symbolSize: 6,
        itemStyle: {
          color: '#e5204b'
        },
        ...lineOp
      }, {
        data: [],
        name: '人工审核',
        type: 'bar',
        stack: 'bar',
        barMaxWidth: '30%',
        itemStyle: {
          color: '#0d7ffd'
        },
        ...lineOp
      }, {
        data: [],
        name: '通过',
        type: 'bar',
        stack: 'bar',
        barMaxWidth: '30%',
        itemStyle: {
          color: '#1ea29a'
        },
        ...lineOp
      }]
      // [['date', '拒绝', '人工审核', '通过']]
      let xAxis = []
      // 数据转换
      data.content.forEach((item, index) => {
        // chartData.push([item.date, item.refuseCount, item.checkCount, item.passCount])
        xAxis.push(item.date)
        series[0].data.push(item.refuseCount)
        series[1].data.push(item.checkCount)
        series[2].data.push(item.passCount)
      })
      chart.setOption({
        legend: {},
        tooltip: {
          formatter: '{b}<br />{a}数: {c0}'
        },
        xAxis: {
          type: 'category',
          data: xAxis
        },
        yAxis: {
          type: 'value'
        },
        series: series
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  /**
   * 右边统计数据
   * @returns {Promise<void>}
   */
  getTotalData = async () => {
    let { beginDate, endDate } = this.state
    const { promise } = await this.props.getTotalData({ beginDate, endDate })
    promise.then((data) => {
      this.setState({
        totalData: data.content[0]
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getData = () => {
    this.getRiskData()
    this.getTotalData()
  }
  onTimeChange = async (date, dateString) => {
    console.log(date, dateString)
    this.setState({
      beginDate: dateString[0] + ' 00:00:00',
      endDate: dateString[1] + ' 23:59:59'
    }, () => {
      this.getData()
    })
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Form.create()(EventMarket))
