import React from 'react'
import { Card, Row, Col, DatePicker, notification } from 'antd'
import classnames from 'classnames'
import moment from 'moment'
import echarts from 'echarts'
import { getReportTendency, getReportCount, getReportDuration } from '../../../action/report'
import { DAYS, RangePickerRanges } from '../../../util'
import { CHART_COLOR } from '../../../common/constant'
import './index.less'

const { COLOR_RED, COLOR_ORANGE } = CHART_COLOR
const { RangePicker } = DatePicker

export default class CallbackReport extends React.Component {
  constructor(props) {
    super(props)
    const ranges = RangePickerRanges['LAST_7']
    const startDate = ranges[0].format('YYYY-MM-DD')
    const endDate = ranges[1].format('YYYY-MM-DD')
    this.state = {
      selectedTab: 'LAST_7',
      startDate,
      endDate
    }
  }

  static propTypes = {}

  componentDidMount() {
    this.getData()
    this.tendency = echarts.init(document.getElementById('tendency'))
    this.count = echarts.init(document.getElementById('count'))
    this.duration = echarts.init(document.getElementById('duration'))
  }

  render() {
    return <div className="app-distribution">
      <Card className="app-card" title={this.renderHistoryTitle()} bodyStyle={{ padding: 0 }} bordered={false}>
        <div id="tendency" className="height100" />
      </Card>
      <Row gutter={16} className="height50">
        <Col span={12} className="height100">
          <Card className="app-card-gulp" title="数据服务统计" bodyStyle={{ padding: 0 }} bordered={false}>
            <div id="count" style={{ height: 'calc(100% - 48px)' }} />
          </Card>
        </Col>
        <Col span={12} className="height100">
          <Card className="app-card-gulp" title="响应耗时分布" bodyStyle={{ padding: 0 }} bordered={false}>
            <div id="duration" style={{ height: 'calc(100% - 48px)' }} />
          </Card>
        </Col>
      </Row>
    </div>
  }

  renderHistoryTitle = () => {
    const { selectedTab, startDate, endDate } = this.state
    return <div>
      <span>调用量趋势</span>
      <span className="query-title">
        {
          Object.keys(DAYS).map(d => <span key={d}
                                           className={classnames('time-tag', { 'active': selectedTab === d })}
                                           onClick={() => this.onDaysSelect(d)}>{DAYS[d]}</span>)
        }
        <RangePicker style={{ width: 230 }} onChange={this.onTimeChange}
                     value={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
                     format={'YYYY-MM-DD'} allowClear={false} />
      </span>
    </div>
  }

  getData = () => {
    const { startDate, endDate } = this.state
    getReportTendency({ startDate, endDate }).then(data => {
      const { content: tendencyList = [] } = data
      const xAxisData = tendencyList.map(tendency => tendency.date)
      const tendencySuccessList = tendencyList.map(tendency => tendency.successCount)
      const tendencyFailedList = tendencyList.map(tendency => tendency.failedCount)
      const option = {
        color: [COLOR_RED[0], COLOR_ORANGE[0]],
        tooltip: {
          confine: true,
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          }
        },
        legend: {
          top: 10,
          itemHeight: 10,
          textStyle: {
            color: 'rgba(0,0,0,0.65)',
            padding: [3, 0, 0, 0]
          },
          data: ['成功', '失败']
        },
        grid: { // 图表的位置
          top: 60,
          left: 20,
          right: 20,
          bottom: 20,
          containLabel: true
        },
        yAxis: [{
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            }
          },
          show: true
        }],
        xAxis: [{
          type: 'category',
          axisLabel: {
            interval: 0,
            show: true,
            textStyle: {
              fontSize: 10
            }
          },
          axisTick: {
            interval: 0,
            alignWithLabel: true
          },
          data: xAxisData
        }],
        dataZoom: [{
          show: xAxisData.length > 10,
          type: 'slider',
          xAxisIndex: [0],
          startValue: 0,
          endValue: 9
        }],
        series: [
          {
            name: '失败',
            type: 'bar',
            stack: 'sum',
            barWidth: 20,
            data: tendencyFailedList
          }, {
            name: '成功',
            type: 'bar',
            stack: 'sum',
            barWidth: 20,
            data: tendencySuccessList
          }
        ]
      }
      this.tendency.setOption(option)
    }).catch((data) => {
      notification.warning(data.content)
    })
    getReportCount({ startDate, endDate }).then(data => {
      const { content: countList = [] } = data
      const xAxisData = countList.map(count => count.key)
      const countData = countList.map(count => count.value)
      const option = {
        color: [COLOR_ORANGE[0]],
        tooltip: {
          confine: true,
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          }
        },
        grid: {
          top: 30,
          left: 20,
          right: 20,
          bottom: 20,
          containLabel: true
        },
        yAxis: [{
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed'
            }
          },
          show: true
        }],
        xAxis: [{
          type: 'category',
          axisLabel: {
            interval: 0,
            show: true,
            textStyle: {
              fontSize: 10
            },
            formatter: function (name) {
              return name ? name.length <= 5 ? name : name.slice(0, 5) + '…' : ''
            },
            tooltip: {
              show: true
            }
          },
          axisTick: {
            interval: 0,
            alignWithLabel: true
          },
          data: xAxisData
        }],
        dataZoom: [{
          show: xAxisData.length > 10,
          type: 'slider',
          xAxisIndex: [0],
          startValue: 0,
          endValue: 9
        }],
        series: [
          {
            name: '数据服务量',
            type: 'bar',
            barWidth: 20,
            data: countData
          }
        ]
      }
      this.count.setOption(option)
      if (countList.length > 0) { // 默认渲染数据服务量最大的响应耗时分布
        const { key: serviceName = '' } = countList.sort((a, b) => b.value - a.value)[0] || {}
        this.drawDuration(serviceName)
      } else {
        this.duration.clear()
      }
      this.count.off('click')
      this.count.on('click', e => {
        this.drawDuration(e.name)
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  drawDuration = (serviceName) => {
    const { startDate, endDate } = this.state
    getReportDuration({ startDate, endDate, serviceName }).then(data => {
      const { content = [] } = data
      const durationData = content.map(d => {
        const { key: name, value } = d
        return { name, value }
      })
      const option = {
        color: ['#E7F97A', '#F9EA3D', '#F6B343', '#F67543', '#D7273C'],
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: '5%',
          top: 'middle',
          icon: 'circle',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            color: 'rgba(0,0,0,0.65)',
            padding: [3, 0, 0, 0]
          },
          data: content.map(c => c.key)
        },
        series: [{
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['40%', '50%'],
          minAngle: 3,
          data: durationData,
          avoidLabelOverlap: false,
          legendHoverLink: false,
          label: {
            normal: {
              show: false,
              position: 'center',
              formatter: [
                '{class_a|{b}}',
                '{class_b|{c}}',
                '{class_a|{d}%}'
              ].join('\n'),
              rich: {
                class_a: {
                  color: 'rgba(0, 0, 0, 0.45)',
                  fontSize: 14,
                  height: 22
                },
                class_b: {
                  color: 'rgba(0, 0, 0, 0.85)',
                  fontSize: 30,
                  height: 38
                }
              }
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: '30',
                fontWeight: 'bold'
              }
            }
          },
          itemStyle: {
            normal: {
              borderWidth: durationData.filter(data => data.value !== 0).length > 0 ? 4 : 0,
              borderColor: '#fff'
            }
          }
        }]
      }
      const chart = this.duration
      chart.clear()
      chart.setOption(option)
      // 设置默认选中高亮部分
      let maxValue = -1
      let maxValueIndex = 0
      durationData.forEach((d, index) => {
        if (d.value > maxValue) {
          maxValue = d.value
          maxValueIndex = index
        }
      })
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: maxValueIndex
      })
      chart.on('mouseover', (e) => {
        // 当检测到鼠标悬停事件，取消默认选中高亮
        chart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        })
        // 高亮显示悬停的那块
        chart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: e.dataIndex
        })
      })
      // 检测鼠标移出后显示之前默认高亮的那块
      chart.on('mouseout', () => {
        chart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        })
        chart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: maxValueIndex
        })
      })
      // 图例点击切换后高亮新的第一块
      chart.on('legendselectchanged', function (e) {
        const { selected = {} } = e
        let maxValue = -1
        let maxValueIndex = 0
        durationData.forEach((d, index) => {
          if (selected[d.name] && d.value > maxValue) {
            maxValue = d.value
            maxValueIndex = index
          }
        })
        chart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0
        })
        chart.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: maxValueIndex
        })
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  onTimeChange = async (date, dateString) => {
    this.setState({
      selectedTab: '',
      startDate: dateString[0],
      endDate: dateString[1]
    }, () => {
      this.getData()
    })
  }

  onDaysSelect = tab => {
    const ranges = RangePickerRanges[tab]
    const startDate = ranges[0].format('YYYY-MM-DD')
    const endDate = ranges[1].format('YYYY-MM-DD')

    this.setState({
      selectedTab: tab,
      startDate,
      endDate
    }, () => {
      this.getData()
    })
  }
}
