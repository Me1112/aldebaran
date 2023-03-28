import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { Map } from 'immutable'
import { Card, Row, Col, DatePicker, Select } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import echarts from 'echarts'
import { getRiskPeriod } from '../../../action/report'
import { DAYS, RangePickerRanges } from '../../../util'
import { CHART_COLOR } from '../../../common/constant'
import { getSceneList } from '../../../action/rule'
import { getAppList } from '../../../action/system'
import './index.less'
import { connect } from 'react-redux'

const { COLOR_THEME, COLOR_RED, COLOR_ORANGE, COLOR_YELLOW } = CHART_COLOR
const { RangePicker } = DatePicker
const { Option } = Select

function mapStateToProps(state) {
  const { system = Map({}), rule = Map({}) } = state
  const { appSelect = [] } = system.toJS()
  const { sceneList = [] } = rule.toJS()
  return {
    sceneList,
    appSelect
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    getAppList: bindActionCreators(getAppList, dispatch)
  }
}

class RiskPeriod extends React.Component {
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
    sceneList: PropTypes.array.isRequired,
    getSceneList: PropTypes.func.isRequired,
    getAppList: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.getAppList()
    this.getData()
    this.riskPeriod = echarts.init(document.getElementById('risk-period'))
    this.sensitive = echarts.init(document.getElementById('sensitive'))
    this.normal = echarts.init(document.getElementById('normal'))
  }

  render() {
    return <div className="app-distribution">
      <Card className="app-card" title={this.renderHistoryTitle()} bodyStyle={{ padding: 0 }} bordered={false}>
        <div id="risk-period" />
      </Card>
      <Row gutter={16} className="height50">
        <Col span={12} className="height100">
          <Card className="app-card-gulp" bodyStyle={{ padding: 0 }} bordered={false}>
            <div id="sensitive" className="height100" />
          </Card>
        </Col>
        <Col span={12} className="height100">
          <Card className="app-card-gulp" bodyStyle={{ padding: 0 }} bordered={false}>
            <div id="normal" className="height100" />
          </Card>
        </Col>
      </Row>
    </div>
  }

  renderHistoryTitle = () => {
    const { selectedTab, startDate, endDate, appId, scenarioValue } = this.state
    const { appSelect = [], sceneList = [] } = this.props
    return <div>
      <span>风险时段</span>
      <span className="query-title">
        {
          Object.keys(DAYS).map(d => <span key={d}
                                           className={classnames('time-tag', { 'active': selectedTab === d })}
                                           onClick={() => this.onDaysSelect(d)}>{DAYS[d]}</span>)
        }
        <RangePicker style={{ width: 230 }} onChange={this.onTimeChange}
                     value={[moment(startDate, 'YYYY-MM-DD'), moment(endDate, 'YYYY-MM-DD')]}
                     format={'YYYY-MM-DD'} allowClear={false} />
                     <Select value={appId} onChange={(e) => this.onSelectChange(e, 'appId')} placeholder="应用" allowClear
                             style={{ width: 160 }}>
            {
              appSelect.map(app => {
                const { appId, appName } = app
                return (
                  <Option key={appId} value={appId.toString()}>{appName}</Option>
                )
              })
            }
          </Select>
          <Select value={scenarioValue} placeholder="场景" style={{ width: 160 }}
                  onChange={(e) => this.onSelectChange(e, 'scenarioValue')} allowClear disabled={!appId}>
            {
              sceneList.map((scene) => {
                const { scenarioDicId, scenarioName, scenarioValue } = scene
                return (
                  <Option key={scenarioDicId} value={scenarioValue}>{scenarioName}</Option>
                )
              })
            }
          </Select>
      </span>
    </div>
  }

  onSelectChange = (value = undefined, field) => {
    const { appSelect = [] } = this.props
    let scenarioValue = field === 'scenarioValue' ? value : this.state.scenarioValue
    this.setState({ [field]: value }, () => {
      if (field === 'appId') { // 应用、场景根据businessLineId联动
        scenarioValue = undefined
        if (value) {
          const { businessLineId = '' } = appSelect.find(app => app.appId.toString() === value) || {}
          this.props.getSceneList({ businessLineId })
        }
      }
      this.setState({
        scenarioValue
      }, () => {
        this.getData()
      })
    })
  }

  getData = () => {
    const { appId, scenarioValue, startDate, endDate } = this.state
    getRiskPeriod({ appId, scenarioValue, startDate, endDate }).then(data => {
      const {
        content: {
          sensitivePeriod: {
            highRiskCount,
            lowRiskCount,
            middleRiskCount
          } = {}, normalPeriod: {
            highRiskCount: nHighRiskCount,
            lowRiskCount: nLowRiskCount,
            middleRiskCount: nMiddleRiskCount
          } = {}, periodList = []
        } = {}
      } = data

      const highData = []
      const middleData = []
      const lowData = []
      const periods = {}
      const xAxisData = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']

      const sensitiveRiskCount = highRiskCount + lowRiskCount + middleRiskCount
      const highLabelShow = sensitiveRiskCount === 0 || highRiskCount > 0
      const middleLabelShow = sensitiveRiskCount === 0 || middleRiskCount > 0
      const lowLabelShow = sensitiveRiskCount === 0 || lowRiskCount > 0

      const normalRiskCount = nHighRiskCount + nLowRiskCount + nMiddleRiskCount
      const nHighLabelShow = normalRiskCount === 0 || nHighRiskCount > 0
      const nMiddleLabelShow = normalRiskCount === 0 || nMiddleRiskCount > 0
      const nLowLabelShow = normalRiskCount === 0 || nLowRiskCount > 0

      periodList.forEach(period => {
        const { hour, riskEventCount = {} } = period
        periods[hour] = riskEventCount
      })
      xAxisData.forEach((hour, index) => {
        const { highRiskCount = 0, middleRiskCount = 0, lowRiskCount = 0 } = periods[index] || {}
        highData.push(highRiskCount)
        middleData.push(middleRiskCount)
        lowData.push(lowRiskCount)
      })

      const option = {
        color: [COLOR_RED[0], COLOR_ORANGE[0], COLOR_YELLOW[0]],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          top: 10,
          // itemWidth: 10,
          itemHeight: 10,
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
            // splitNumber: 15,
            textStyle: {
              fontSize: 10
            }
          },
          data: xAxisData
        }],
        series: [
          {
            name: '高风险',
            type: 'line',
            stack: 'sum',
            areaStyle: {},
            data: highData
          },
          {
            name: '中风险',
            type: 'line',
            stack: 'sum',
            areaStyle: {},
            data: middleData
          },
          {
            name: '低风险',
            type: 'line',
            stack: 'sum',
            areaStyle: {},
            data: lowData
          }
        ]
      }
      console.log('option', option)
      this.riskPeriod.setOption(option)
      const sensitiveOption = {
        chart: this.sensitive,
        color: [{
          color: COLOR_RED[0],
          value: highRiskCount
        }, {
          color: COLOR_ORANGE[0],
          value: middleRiskCount
        }, {
          color: COLOR_YELLOW[0],
          value: lowRiskCount
        }].sort((a, b) => {
          return b.value - a.value
        }).map(c => c.color),
        // color: [COLOR_RED[0], COLOR_ORANGE[0], COLOR_YELLOW[0]],
        title: '敏感时段',
        subtext: '（23:00:00~05:59:59）',
        data: [
          {
            name: '高风险',
            value: highRiskCount,
            label: {
              show: highLabelShow
            },
            labelLine: {
              show: highLabelShow
            }
          },
          {
            name: '中风险',
            value: middleRiskCount,
            label: {
              show: middleLabelShow
            },
            labelLine: {
              show: middleLabelShow
            }
          },
          {
            name: '低风险',
            value: lowRiskCount,
            label: {
              show: lowLabelShow
            },
            labelLine: {
              show: lowLabelShow
            }
          }].sort((a, b) => {
          return b.value - a.value
        })
      }
      this.drawPie(sensitiveOption)
      const normalOption = {
        chart: this.normal,
        color: [{
          color: COLOR_RED[0],
          value: nHighRiskCount
        }, {
          color: COLOR_ORANGE[0],
          value: nMiddleRiskCount
        }, {
          color: COLOR_YELLOW[0],
          value: nLowRiskCount
        }].sort((a, b) => {
          return b.value - a.value
        }).map(c => c.color),
        // color: [COLOR_RED[0], COLOR_ORANGE[0], COLOR_YELLOW[0]],
        title: '正常时段',
        subtext: '（06:00:00~22:59:59）',
        data: [
          {
            name: '高风险',
            value: nHighRiskCount,
            label: {
              show: nHighLabelShow
            },
            labelLine: {
              show: nHighLabelShow
            }
          },
          {
            name: '中风险',
            value: nMiddleRiskCount,
            label: {
              show: nMiddleLabelShow
            },
            labelLine: {
              show: nMiddleLabelShow
            }
          },
          {
            name: '低风险',
            value: nLowRiskCount,
            label: {
              show: nLowLabelShow
            },
            labelLine: {
              show: nLowLabelShow
            }
          }].sort((a, b) => {
          return b.value - a.value
        })
      }
      this.drawPie(normalOption)
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

  drawPie = (option = {}) => {
    const { chart, color = COLOR_THEME, title, subtext, data } = option
    let options = {
      color,
      title: {
        text: title,
        left: 20,
        top: 20,
        textStyle: {
          fontSize: 14
        },
        subtext,
        subtextStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {c} ({d}%)'
      }
    }
    chart.setOption({
      ...options,
      series: [{
        type: 'pie',
        data,
        avoidLabelOverlap: false,
        label: {
          normal: {
            textStyle: {
              color: '#000',
              fontSize: 12
            },
            formatter: '{b}: {d}%'
          }
        }
      }]
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RiskPeriod)
