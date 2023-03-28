import React from 'react'
import { Card, Row, Col, DatePicker, Select, notification } from 'antd'
import CCIStatistic from '../../../component/statistic'
import { getTodayEvent, getTotalEvent } from '../../../action/report'
import echarts from 'echarts'
import { connect } from 'react-redux'
import './index.less'
import { DAYS, RangePickerRanges } from '../../../util'
import classnames from 'classnames'
import moment from 'moment'
import { Map } from 'immutable'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { getAppSelect, getSceneList } from '../../../action/rule'
import { CHART_COLOR } from '../../../common/constant'

const { COLOR_RED, COLOR_ORANGE, COLOR_YELLOW } = CHART_COLOR
const { RangePicker } = DatePicker
const Option = Select.Option
const gridStyle = {
  width: '25%'
}

const highColor = COLOR_RED[0]
const middleColor = COLOR_ORANGE[0]
const lowColor = COLOR_YELLOW[0]

function absValue(value) {
  const abs = Math.abs(value)
  return isNaN(abs) ? '--' : abs
}

function mapStateToProps(state) {
  const { rule = Map() } = state
  const { appSelect = [], sceneList = [] } = rule.toJS()
  return {
    appSelect,
    sceneList
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    getAppSelect: bindActionCreators(getAppSelect, dispatch)
  }
}

@connect(mapStateToProps, mapDispatchToProps)
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

  static propTypes = {
    appSelect: PropTypes.array.isRequired,
    getAppSelect: PropTypes.func.isRequired,
    getSceneList: PropTypes.func.isRequired,
    sceneList: PropTypes.array.isRequired
  }

  componentDidMount() {
    this.props.getAppSelect()
    this.getTodayEvent()
    this.getData()
  }

  render() {
    const { todayEvent = {}, totalEvent = {} } = this.state
    const { highRiskCount = {}, lowRiskCount = {}, middleRiskCount = {}, totalCount = {} } = todayEvent
    const {
      lowData = 0,
      middleData = 0,
      highData = 0,
      totalData = 0
    } = totalEvent
    let highPer = (highData / totalData * 100).toFixed(1)
    let middlePer = (middleData / totalData * 100).toFixed(1)
    let lowPer = (100 - highPer - middlePer).toFixed(1)
    if (isNaN(highPer)) highPer = 0
    if (isNaN(middlePer)) middlePer = 0
    if (isNaN(lowPer)) lowPer = 0
    const empty = ['--', undefined]

    return <div className={'event-trend'} style={{ overflow: 'auto' }}>
      <Card title={this.renderTodayTitle()} bordered={false}>
        <Card.Grid style={gridStyle}>
          <div className="card-grid-title">
            事件总数：
          </div>
          <CCIStatistic className={'total-statistic'} type formatValue valueStyle={{ color: '#3f8600' }}
                        value={totalCount.eventCount} />
          <div className={'total-statistic-sml'}>
            <CCIStatistic
              style={{ marginRight: '10px' }}
              title="比昨日:"
              value={totalCount.thanYesterday}
              precision={2}
              formatValue={absValue}
              suffix={empty.includes(totalCount.thanYesterday) ? '' : '%'}
            />
            <CCIStatistic
              title="比七日均值:"
              value={totalCount.than7Average}
              precision={2}
              formatValue={absValue}
              suffix={empty.includes(totalCount.than7Average) ? '' : '%'}
            />
          </div>
        </Card.Grid>
        <Card.Grid style={gridStyle}>
          <div className="card-grid-title">
            高风险数：
          </div>
          <CCIStatistic className={'total-statistic total-statistic-block '} type formatValue
                        value={highRiskCount.eventCount} />
          <div className="statistic-risk">
            <CCIStatistic
              title="比昨日:"
              value={highRiskCount.thanYesterday}
              precision={2}
              formatValue={absValue}
              suffix={empty.includes(highRiskCount.thanYesterday) ? '' : '%'}
            />
            <CCIStatistic
              title="比七日均值:"
              value={highRiskCount.than7Average}
              precision={2}
              formatValue={absValue}
              suffix={empty.includes(highRiskCount.than7Average) ? '' : '%'}
            />
          </div>
          <div className={'gard-chart'} id="high-chart" />
        </Card.Grid>
        <Card.Grid style={gridStyle}>
          <div className="card-grid-title">
            中风险数：
          </div>
          <CCIStatistic className={'total-statistic total-statistic-block '} type formatValue
                        value={middleRiskCount.eventCount} />
          <div className="statistic-risk">
            <CCIStatistic
              title="比昨日:"
              value={middleRiskCount.thanYesterday}
              formatValue={absValue}
              precision={2}
              suffix={empty.includes(middleRiskCount.thanYesterday) ? '' : '%'}
            />
            <CCIStatistic
              title="比七日均值:"
              value={middleRiskCount.than7Average}
              formatValue={absValue}
              precision={2}
              suffix={empty.includes(middleRiskCount.than7Average) ? '' : '%'}
            />
          </div>
          <div className={'gard-chart'} id="middle-chart" />
        </Card.Grid>
        <Card.Grid style={gridStyle}>
          <div className="card-grid-title">
            低风险数：
          </div>
          <CCIStatistic className={'total-statistic total-statistic-block '} type value={lowRiskCount.eventCount} />
          <div className="statistic-risk">
            <CCIStatistic
              title="比昨日:"
              value={lowRiskCount.thanYesterday}
              formatValue={absValue}
              precision={2}
              suffix={empty.includes(lowRiskCount.thanYesterday) ? '' : '%'}
            />
            <CCIStatistic
              title="比七日均值:"
              value={lowRiskCount.than7Average}
              formatValue={absValue}
              precision={2}
              suffix={empty.includes(lowRiskCount.than7Average) ? '' : '%'}
            />
          </div>
          <div className={'gard-chart'} id="low-chart" />
        </Card.Grid>
      </Card>
      <Card className="history-card" title={this.renderHistoryTitle()} bodyStyle={{ padding: 0 }} bordered={false}>
        <div id="big-card" />
        <div className="right-info">
          <div className="info-title">
            事件详情：
          </div>
          <Row>
            <Col span={8}>事件总数：</Col>
            <Col span={14}>{totalData}</Col>
          </Row>
          <Row>
            <Col span={8}>高风险数：</Col>
            <Col span={14} style={{ color: highColor }}>{highData}({highPer}%)</Col>
          </Row>
          <Row>
            <Col span={8}>中风险数：</Col>
            <Col span={14} style={{ color: middleColor }}>{middleData}({middlePer}%)</Col>
          </Row>
          <Row>
            <Col span={8}>低风险数：</Col>
            <Col span={14} style={{ color: lowColor }}>{lowData}({lowPer}%)</Col>
          </Row>
        </div>
      </Card>
    </div>
  }

  renderTodayTitle = () => {
    const { todayEvent = {} } = this.state
    const { updateTime } = todayEvent
    return <div>
      <span>今日数据</span>
      <span className={'update-data-title'}>
        数据更新时间：{updateTime}
      </span>
    </div>
  }
  renderHistoryTitle = () => {
    const { selectedTab, startDate, endDate, scenarioValue, appId } = this.state
    const { appSelect, sceneList } = this.props
    return <div>
      <span>历史数据</span>
      <span className={'query-title'}>
       {
         Object.keys(DAYS).map(d => <span key={d}
                                          className={classnames('time-tag', { 'active': selectedTab === d })}
                                          onClick={() => this.onDaysSelect(d)}>{DAYS[d]}</span>)
       }
        <RangePicker style={{ width: 230 }} onChange={this.onTimeChange}
                     value={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
                     format={'YYYY-MM-DD'} allowClear={false} />
        <Select allowClear placeholder={'应用'} value={appId} onChange={this.changeAppId}>
         {
           appSelect.map(app => {
             const { appId, appName } = app
             return (
               <Option key={appId} value={appId}>{appName}</Option>
             )
           })
         }
        </Select>
        <Select allowClear disabled={!appId} placeholder={'场景'} value={scenarioValue} onChange={this.scenarioChange}>
          {
            sceneList.map((scene) => {
              const { scenarioValue, scenarioName } = scene
              return (
                <Option key={scenarioValue} value={scenarioValue}>{scenarioName}</Option>
              )
            })
          }
        </Select>
      </span>
    </div>
  }
  scenarioChange = e => {
    this.setState({ scenarioValue: e }, () => {
      this.getData()
    })
  }
  changeAppId = e => {
    this.businessLineId = ''
    this.props.appSelect.forEach(item => {
      if (item.appId === e) {
        this.businessLineId = item.businessLineId
      }
    })
    this.setState({ scenarioValue: undefined, appId: e }, () => {
      if (!(e === '' || e === undefined)) {
        this.props.getSceneList({ businessLineId: this.businessLineId })
      }
      this.getData()
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
  getData = () => {
    const { startDate, endDate, scenarioValue, appId } = this.state
    const data = {
      startDate, endDate, scenarioValue, appId
    }
    this.getTotalEvent(data)
  }

  getTotalEvent = (data) => {
    getTotalEvent(data).then(res => {
      const { content = [] } = res
      const xAxisData = []
      const lowData = []
      const middleData = []
      const highData = []
      let totalEvent = {
        lowData: 0,
        middleData: 0,
        highData: 0,
        totalData: 0
      }
      this.rate = echarts.init(document.getElementById('big-card'))
      content.forEach(data => {
        const { date, lowRiskCount, middleRiskCount, highRiskCount, totalCount } = data
        xAxisData.push(date)
        lowData.push(lowRiskCount)
        middleData.push(middleRiskCount)
        highData.push(highRiskCount)
        totalEvent.lowData = totalEvent.lowData + lowRiskCount
        totalEvent.totalData = totalEvent.totalData + totalCount
        totalEvent.highData = totalEvent.highData + highRiskCount
        totalEvent.middleData = totalEvent.middleData + middleRiskCount
      })
      this.setState({ totalEvent })
      const option = {
        color: [COLOR_RED[0], COLOR_ORANGE[0], COLOR_YELLOW[0]],
        title: {
          text: '趋势图',
          left: 20,
          top: 20,
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          },
          formatter: params => {
            let xAxisName = ''
            const tooltips = params.map(param => {
              const { name, marker, seriesName, value } = param
              xAxisName = name
              return `${marker}${seriesName}:&nbsp;${value}`
            })
            return `${xAxisName}<br/>${tooltips.join('<br/>')}`
          }
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
            formatter: '{value}'
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
            }
          },
          axisLine: {
            show: xAxisData.length > 0
          },
          axisTick: {
            alignWithLabel: true
          },
          data: xAxisData
        }],
        dataZoom: [{ // 默认缩放显示前10条柱
          show: content.length > 10,
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
    }).catch((data) => {
      notification.warn(data.content)
    })
  }

  getTodayEvent = () => {
    getTodayEvent().then(res => {
      const { content = {} } = res
      this.setState({ todayEvent: content })
      const { highRiskCount = {}, lowRiskCount = {}, middleRiskCount = {}, totalCount = {} } = content
      const highCount = highRiskCount.eventCount
      const middleCount = middleRiskCount.eventCount
      const lowCount = lowRiskCount.eventCount
      const total = totalCount.eventCount

      const percentH = (total ? ((highCount / total) * 100) : 0).toFixed(1)
      const percentM = (total ? ((middleCount / total) * 100) : 0).toFixed(1)
      const percentL = (total ? (100 - percentH - percentM) : 0).toFixed(1)

      this.initChart({
        chartId: 'high-chart',
        chartType: 'pie',
        color: highCount > 0 ? [highColor, '#e8e8e8'] : ['#e8e8e8'],
        chartData: [{
          value: highCount,
          name: '高风险',
          label: {
            normal: {
              show: true,
              position: 'center',
              formatter: percentH + '%'
            }
          },
          itemStyle: {
            normal: {
              color: highCount > 0 ? highColor : '#e8e8e8'
            },
            emphasis: {
              color: highCount > 0 ? highColor : '#e8e8e8'
            }
          }
        }, {
          value: total - highCount,
          name: '其他风险',
          label: {
            normal: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              color: '#e8e8e8'
            },
            emphasis: {
              color: '#e8e8e8'
            }
          }
        }]
      })
      this.initChart({
        chartId: 'middle-chart',
        chartType: 'pie',
        color: middleCount > 0 ? [middleColor, '#e8e8e8'] : ['#e8e8e8'],
        chartData: [{
          value: middleCount,
          name: '中风险',
          label: {
            normal: {
              show: true,
              position: 'center',
              formatter: percentM + '%'
            }
          },
          itemStyle: {
            normal: {
              color: middleCount > 0 ? middleColor : '#e8e8e8'
            },
            emphasis: {
              color: middleCount > 0 ? middleColor : '#e8e8e8'
            }
          }
        }, {
          value: total - middleCount,
          name: '其他风险',
          label: {
            normal: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              color: '#e8e8e8'
            },
            emphasis: {
              color: '#e8e8e8'
            }
          }
        }]
      })
      this.initChart({
        chartId: 'low-chart',
        chartType: 'pie',
        color: lowCount > 0 ? [lowColor, '#e8e8e8'] : ['#e8e8e8'],
        chartData: [{
          value: lowCount,
          name: '低风险',
          label: {
            normal: {
              show: true,
              position: 'center',
              formatter: percentL + '%'
            }
          },
          itemStyle: {
            normal: {
              color: lowCount > 0 ? lowColor : '#e8e8e8'
            },
            emphasis: {
              color: lowCount > 0 ? lowColor : '#e8e8e8'
            }
          }
        }, {
          value: total - lowCount,
          name: '其他风险',
          label: {
            normal: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              color: '#e8e8e8'
            },
            emphasis: {
              color: '#e8e8e8'
            }
          }
        }]
      })
    }).catch((data) => {
      notification.warn(data.content)
    })
  }

  initChart = (option = {}) => {
    const { title, chartId, chartData, chartType, color } = option
    const chart = echarts.init(document.getElementById(chartId))
    let options = {
      color: color,
      hoverAnimation: false,
      title: {
        text: title,
        left: 20,
        top: 20,
        textStyle: {
          fontSize: 14
        }
      },
      // tooltip: {
      //   trigger: 'item',
      //   formatter: '{a} <br/>{b} : {c} ({d}%)'
      // },
      legend: {
        show: false
      }
    }
    switch (chartType) {
      case 'pie':
        options = {
          ...options,
          series: [
            {
              name: title,
              type: chartType,
              radius: ['55%', '75%'],
              center: ['60%', '50%'],
              data: chartData,
              hoverAnimation: false,
              avoidLabelOverlap: false,
              label: {
                normal: {
                  position: 'center'
                }
              }
            }
          ]
        }
    }
    chart.setOption(options)
  }
}
