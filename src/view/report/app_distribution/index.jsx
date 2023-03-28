import React from 'react'
import { Card, Row, Col, DatePicker } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import echarts from 'echarts'
import './index.less'
import { getAppEvents, getScenarioEvents } from '../../../action/report'
import { DAYS, RangePickerRanges } from '../../../util'
import { CHART_COLOR } from '../../../common/constant'

const { COLOR_THEME, COLOR_RED, COLOR_ORANGE, COLOR_YELLOW } = CHART_COLOR
const { RangePicker } = DatePicker

export default class EventTrend extends React.Component {
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

  componentDidMount() {
    this.getData()
    this.total = echarts.init(document.getElementById('case-amount'))
    this.total.off('click', this.clickChart)
    this.total.on('click', this.clickChart)
    this.total.off('legendscroll', this.legendScroll)
    this.total.on('legendscroll', this.legendScroll)
    this.rate = echarts.init(document.getElementById('scenes-risk-rate'))
    this.high = echarts.init(document.getElementById('high'))
    this.high.off('legendscroll', this.legendScroll)
    this.high.on('legendscroll', e => this.legendScroll(e, 'high'))
    this.middle = echarts.init(document.getElementById('middle'))
    this.middle.off('legendscroll', this.legendScroll)
    this.middle.on('legendscroll', e => this.legendScroll(e, 'middle'))
    this.low = echarts.init(document.getElementById('low'))
    this.low.off('legendscroll', this.legendScroll)
    this.low.on('legendscroll', e => this.legendScroll(e, 'low'))
  }

  render() {
    return <div className="app-distribution">
      <Card className="app-card" title={this.renderHistoryTitle()} bodyStyle={{ padding: 0 }} bordered={false}>
        <div id="case-amount" />
        <div id="scenes-risk-rate" />
      </Card>
      <Row gutter={16} className="height50">
        <Col span={8} className="height100">
          <Card className="app-card-gulp" bodyStyle={{ padding: 0 }} bordered={false}>
            <div id="high" className="height100" />
          </Card>
        </Col>
        <Col span={8} className="height100">
          <Card className="app-card-gulp" bodyStyle={{ padding: 0 }} bordered={false}>
            <div id="middle" className="height100" />
          </Card>
        </Col>
        <Col span={8} className="height100">
          <Card className="app-card-gulp" bodyStyle={{ padding: 0 }} bordered={false}>
            <div id="low" className="height100" />
          </Card>
        </Col>
      </Row>
    </div>
  }

  legendScroll = (params = {}, type = '') => {
    let chart = this.total
    switch (type) {
      case 'high':
        chart = this.high
        break
      case 'middle':
        chart = this.middle
        break
      case 'low':
        chart = this.low
        break
    }
    const { dataIndex = 0 } = this.state
    chart.dispatchAction({
      type: 'downplay',
      seriesIndex: 0
    })
    chart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex
    })
  }

  clickChart = (params) => {
    const { startDate, endDate } = this.state
    const { dataIndex = 0, data: { appId } = {} } = params
    console.log(dataIndex, appId)
    this.setState({ dataIndex }, () => {
      this.getScenarioEvents({ appId, startDate, endDate })
    })
  }

  renderHistoryTitle = () => {
    const { selectedTab, startDate, endDate } = this.state
    return <div>
      <span>应用分布</span>
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
    getAppEvents({ startDate, endDate }).then(data => {
      const { content = {} } = data
      let appId = ''
      let max = -1
      const { totalCountList = [] } = content
      totalCountList.forEach(total => {
        const { appId: id, count } = total
        if (count > max) {
          max = count
          appId = id
        }
      })
      this.getScenarioEvents({ appId, startDate, endDate }, content)
    })
  }

  onTimeChange = async (date, dateString) => {
    this.setState({
      dataIndex: 0,
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
      dataIndex: 0,
      selectedTab: tab,
      startDate,
      endDate
    }, () => {
      this.getData()
    })
  }

  getScenarioEvents = (params, info) => {
    if (info) {
      const { totalCountList = [], highRiskCountList = [], middleRiskCountList = [], lowRiskCountList = [] } = info
      const legendData = []
      const data = totalCountList.map(d => {
        const { appName: name, count: value, appId } = d
        legendData.push(name)
        return { value: value || undefined, name, appId }
      })
      this.totalOption = { total: true, chart: this.total, color: COLOR_THEME, title: '应用分布图-事件量', legendData, data }
      this.drawPie(this.totalOption)
      const highLegendData = []
      const highData = highRiskCountList.map(d => {
        const { appName: name, count: value } = d
        highLegendData.push(name)
        return { value: value || undefined, name }
      })
      this.highOption = {
        chart: this.high,
        color: COLOR_RED,
        title: '应用分布图-高风险',
        legendData: highLegendData,
        data: highData
      }
      this.drawPie(this.highOption)
      const middleLegendData = []
      const middleData = middleRiskCountList.map(d => {
        const { appName: name, count: value } = d
        middleLegendData.push(name)
        return { value: value || undefined, name }
      })
      this.middleOption = {
        chart: this.middle,
        color: COLOR_ORANGE,
        title: '应用分布图-中风险',
        legendData: middleLegendData,
        data: middleData
      }
      this.drawPie(this.middleOption)
      const lowLegendData = []
      const lowData = lowRiskCountList.map(d => {
        const { appName: name, count: value } = d
        lowLegendData.push(name)
        return { value: value || undefined, name }
      })
      this.lowOption = {
        chart: this.low,
        color: COLOR_YELLOW,
        title: '应用分布图-低风险',
        legendData: lowLegendData,
        data: lowData
      }
      this.drawPie(this.lowOption)
    }
    if (params.appId) {
      getScenarioEvents(params).then(data => {
        const { content = [] } = data
        const xAxisData = []
        const lowData = []
        const middleData = []
        const highData = []
        content.forEach(data => {
          const { scenarioName, lowRiskRate, middleRiskRate, highRiskRate } = data
          xAxisData.push(scenarioName)
          lowData.push(lowRiskRate)
          middleData.push(middleRiskRate)
          highData.push(highRiskRate)
        })
        const option = {
          color: [COLOR_RED[0], COLOR_ORANGE[0], COLOR_YELLOW[0]],
          title: {
            text: '场景风险率',
            left: 20,
            top: 20,
            textStyle: {
              fontSize: 14
            }
          },
          tooltip: {
            confine: true,
            trigger: 'axis',
            axisPointer: {
              type: 'none'
            },
            formatter: params => {
              let xAxisName = ''
              const tooltips = params.map(param => {
                const { name, marker, seriesName, value } = param
                xAxisName = name
                return `${marker}${seriesName}:&nbsp;${value}%`
              })
              return `${xAxisName}<br/>${tooltips.join('<br/>')}`
            }
          },
          legend: {
            bottom: 0,
            itemWidth: 10,
            itemHeight: 2,
            textStyle: {
              color: 'rgba(0,0,0,0.65)',
              padding: [3, 0, 0, 0]
            },
            data: ['高风险', '中风险', '低风险']
          },
          grid: { // 图表的位置
            top: 60,
            left: 20,
            right: 20,
            bottom: 25,
            containLabel: true
          },
          yAxis: [{
            type: 'value',
            axisLabel: {
              show: true,
              interval: 'auto',
              formatter: '{value}%'
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            // max: 100,
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
              // splitNumber: 15,
              textStyle: {
                fontSize: 10
              },
              formatter: function (name) {
                return name ? name.length <= 6 ? name : name.slice(0, 6) + '…' : ''
              },
              tooltip: {
                show: true
              }
            },
            axisTick: {
              alignWithLabel: true
            },
            data: xAxisData
          }],
          dataZoom: [{ // 默认缩放显示前10条柱
            show: xAxisData.length > 10,
            type: 'slider',
            xAxisIndex: [0],
            startValue: 0,
            endValue: 9
          }],
          series: [
            {
              name: '高风险',
              type: 'bar',
              stack: 'sum',
              barWidth: '20px',
              data: highData
            },
            {
              name: '中风险',
              type: 'bar',
              stack: 'sum',
              barWidth: '20px',
              data: middleData
            },
            {
              name: '低风险',
              type: 'bar',
              stack: 'sum',
              barWidth: '20px',
              data: lowData
            }
          ]
        }
        this.rate.setOption(option)
      })
    } else {
      this.rate.clear()
    }
  }

  drawPie = (option = {}) => {
    const { total = false, chart, color = COLOR_THEME, title, legendData = [], data, ...otherOption } = option
    chart.clear()
    let options = {
      color,
      title: {
        text: title,
        left: 20,
        top: 20,
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        show: true,
        confine: true
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        pageIconSize: 10,
        right: '10%',
        top: 'middle',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: 'rgba(0,0,0,0.65)',
          padding: [3, 0, 0, 0]
        },
        data: legendData,
        formatter: function (name) {
          return name.length <= 6 ? name : name.slice(0, 6) + '…'
        },
        tooltip: {
          show: true
        }
      }
    }
    chart.setOption({
      ...options,
      ...otherOption,
      series: [{
        type: 'pie',
        legendHoverLink: false,
        radius: ['45%', '60%'],
        center: ['40%', '55%'],
        minAngle: 3,
        ...otherOption,
        data,
        avoidLabelOverlap: false,
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
            borderWidth: data.filter(d => d.value !== 0).length > 1 ? 4 : 0,
            borderColor: '#fff'
          }
        }
      }]
    })
    const { dataIndex = 0 } = this.state
    chart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: total ? dataIndex : 0
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
      const { dataIndex = 0 } = this.state
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: total ? dataIndex : 0
      })
    })
    // 图例点击切换后高亮新的第一块
    chart.on('legendselectchanged', function (e) {
      const { selected = {} } = e
      const dataIndexCurrent = data.findIndex(d => selected[d.name])
      chart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0
      })
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: dataIndexCurrent
      })
    })
  }
}
