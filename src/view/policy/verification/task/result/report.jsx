import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Row, Col, notification, Icon, Table, Card, Select, DatePicker } from 'antd'
import { FLOW_TYPES } from '../../../../../common/decision_constant'
import {
  getOnlineRatios,
  getOnlineDecisionResult,
  getOnlineDecisionResultDaily,
  getOnlineScoreCardResult,
  getOfflineScoreCardResult,
  getOfflineEventRisk,
  getOfflineEffectResult,
  getVerifyResultDate
} from '../../../../../action/data'
import echarts from 'echarts'
import moment from 'moment'
import { formatNumber } from '../../../../../util'
import { Map } from 'immutable'
import { connect } from 'react-redux'
import { CHART_COLOR } from '../../../../../common/constant'

const { SCORE_CARD } = FLOW_TYPES
const { COLOR_THEME, COLOR_RED, COLOR_ORANGE, COLOR_YELLOW } = CHART_COLOR
const highColor = COLOR_RED[0]
const middleColor = COLOR_ORANGE[0]
const lowColor = COLOR_YELLOW[0]

const { Option } = Select
const { RangePicker } = DatePicker

function mapStateToProps(state) {
  const { decision = Map({}) } = state
  const { riskPolicyList = [] } = decision.toJS()
  return { riskPolicyList }
}

function mapDispatchToProps(dispatch) {
  return {}
}

class DataReport extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    this.state = {
      ...state,
      selectedLimit: 50,
      count: 5
    }
  }

  static propTypes = {
    location: PropTypes.object,
    taskInfo: PropTypes.object.isRequired,
    riskPolicyList: PropTypes.array,
    changeInterval: PropTypes.func,
    changeTab: PropTypes.func
  }

  componentDidMount() {
    this.prepareData()
  }

  render() {
    return <Fragment>
      {
        this.renderDataReport()
      }
    </Fragment>
  }

  prepareData = () => {
    const { taskInfo: { taskId, taskDataType, strategyType } = {}, riskPolicyList = [] } = this.props
    const { selectedLimit: interval = 50 } = this.state
    const riskPolicyMap = {}
    riskPolicyList.forEach(riskPolicy => {
      const { decisionCode, decisionName } = riskPolicy
      riskPolicyMap[decisionCode] = decisionName
    })
    switch (taskDataType) {
      case 'OFFLINE_DATA':
        if (strategyType === SCORE_CARD) {
          getOfflineScoreCardResult({ taskId, interval }).then(data => {
            const {
              content: {
                verifyResult: {
                  scoreCardCountList = [],
                  scoreCardRateList: offlineScoreCardRateList = []
                } = {}
              } = {}
            } = data
            const option = {
              title: '',
              chartId: 'offline-score-card',
              chartData: scoreCardCountList,
              chartType: 'bar',
              mapping: {},
              extra: {
                color: COLOR_THEME,
                xAxis: [
                  {
                    type: 'category',
                    data: scoreCardCountList.map(d => d.key),
                    axisTick: {
                      alignWithLabel: true
                    }
                  }
                ],
                tooltip: {
                  trigger: 'item',
                  formatter: '{b} <br/> 事件数: {c}'
                },
                series: [
                  {
                    name: '',
                    type: 'bar',
                    barWidth: '20px',
                    data: scoreCardCountList
                  }
                ]
              }
            }
            this.initChart(option)
            this.setState({
              offlineScoreCardRateList
            })
          }).catch((data) => {
            notification.warn(data.content)
          })
        } else {
          getVerifyResultDate({ taskId }).then(data => {
            const { content: { startDate = 0, endDate = 0 } = {} } = data
            this.startDate = startDate
            this.endDate = endDate
            this.setState({
              startDate: startDate ? moment(startDate) : moment(),
              endDate: endDate ? moment(endDate) : moment()
            }, () => {
              this.getOfflineEventRisk()
            })
          }).catch((data) => {
            notification.warn(data.content)
          })
          this.getOfflineEffectResult()
        }
        break
      default:
        if (strategyType === SCORE_CARD) {
          getOnlineScoreCardResult({ taskId, interval }).then(data => {
            const { content: onlineScoreCardResult = {} } = data
            this.setState({
              onlineScoreCardResult
            }, () => {
              const {
                onlineResult: {
                  scoreCardCountList = []
                } = {},
                verifyResult: {
                  scoreCardCountList: scoreCardCountListVerify = []
                } = {}
              } = onlineScoreCardResult
              const option = {
                title: '',
                chartId: 'online-score-card',
                chartData: scoreCardCountList,
                chartType: 'bar',
                mapping: {},
                extra: {
                  color: COLOR_THEME,
                  xAxis: [
                    {
                      type: 'category',
                      data: scoreCardCountList.map(d => d.key),
                      axisTick: {
                        alignWithLabel: true
                      }
                    }
                  ],
                  tooltip: {
                    trigger: 'item',
                    formatter: '{b} <br/> 事件数: {c}'
                  },
                  series: [
                    {
                      name: '',
                      type: 'bar',
                      barWidth: '20px',
                      data: scoreCardCountList
                    }
                  ]
                }
              }
              const option2 = {
                title: '',
                chartId: 'online-score-card-verify',
                chartData: scoreCardCountListVerify,
                chartType: 'bar',
                mapping: {},
                extra: {
                  color: COLOR_THEME,
                  xAxis: [
                    {
                      type: 'category',
                      data: scoreCardCountListVerify.map(d => d.key),
                      axisTick: {
                        alignWithLabel: true
                      }
                    }
                  ],
                  tooltip: {
                    trigger: 'item',
                    formatter: '{b} <br/> 事件数: {c}'
                  },
                  series: [
                    {
                      name: '',
                      type: 'bar',
                      barWidth: '20px',
                      data: scoreCardCountListVerify
                    }
                  ]
                }
              }
              this.initChart(option)
              this.initChart(option2)
            })
          }).catch((data) => {
            notification.warn(data.content)
          })
        } else {
          getOnlineRatios({ taskId }).then(data => {
            const { content: onlineRatios = {} } = data
            this.setState({
              onlineRatios
            })
          }).catch((data) => {
            notification.warn(data.content)
          })
          getOnlineDecisionResult({ taskId }).then(data => {
            const { content: { onlineResult = [], manualResult = [], verifyResult = [] } = {} } = data

            const option = {
              chartId: 'decision-result-online',
              chartData: onlineResult.map(r => {
                const { decisionCode: key, count: value = 0 } = r
                return { key, value }
              }),
              chartType: 'pie',
              mapping: riskPolicyMap,
              extra: {
                color: this.getRiskColors(onlineResult),
                title: {
                  text: '决策结果分布-生产结果',
                  top: 0,
                  left: 0,
                  textStyle: {
                    fontSize: 14
                  }
                }
              }
            }
            const option2 = {
              chartId: 'decision-result-manual',
              chartData: manualResult.map(r => {
                const { decisionCode: key, count: value = 0 } = r
                return { key, value }
              }),
              chartType: 'pie',
              mapping: riskPolicyMap,
              extra: {
                color: this.getRiskColors(manualResult),
                title: {
                  text: '决策结果分布-人工结果',
                  top: 0,
                  left: 0,
                  textStyle: {
                    fontSize: 14
                  }
                }
              }
            }
            const option3 = {
              chartId: 'decision-result-verify',
              chartData: verifyResult.map(r => {
                const { decisionCode: key, count: value = 0 } = r
                return { key, value }
              }),
              chartType: 'pie',
              mapping: riskPolicyMap,
              extra: {
                color: this.getRiskColors(verifyResult),
                title: {
                  text: '决策结果分布-验证结果',
                  top: 0,
                  left: 0,
                  textStyle: {
                    fontSize: 14
                  }
                }
              }
            }
            this.initChart(option)
            this.initChart(option2)
            this.initChart(option3)
          }).catch((data) => {
            notification.warn(data.content)
          })
          getOnlineDecisionResultDaily({ taskId }).then(data => {
            const { content: { result = [] } = {} } = data
            const option = {
              title: '',
              chartId: 'decision-result-daily',
              chartData: result,
              chartType: 'bar',
              mapping: riskPolicyMap,
              clickEvent: this.dailyChartClick,
              extra: {
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
                }
              }
            }
            this.initChart(option)
          }).catch((data) => {
            notification.warn(data.content)
          })
        }
        break
    }
  }

  initChart = (option = {}) => {
    const { title, chartId, chartData, chartType, mapping, clickEvent, extra = {} } = option
    const chart = echarts.init(document.getElementById(chartId))
    if (clickEvent) {
      chart.off('click', clickEvent)
      chart.on('click', clickEvent)
    }
    let options = {
      // color: ['#7ED321', '#D0021B', '#FACC14', '#4A90E2'],
      title: {
        text: title,
        left: 20,
        top: 20,
        textStyle: {
          fontSize: 14
        }
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: '10%',
        top: 'middle',
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          color: 'rgba(0,0,0,0.65)',
          padding: [3, 0, 0, 0]
        },
        data: chartData.map(c => mapping[c.key])
      }
    }
    switch (chartType) {
      case 'pie':
        options = {
          ...options,
          color: ['#7ED321', '#D0021B', '#FACC14', '#4A90E2'],
          series: [
            {
              name: title,
              type: chartType,
              legendHoverLink: false,
              radius: ['40%', '60%'],
              center: ['30%', '60%'],
              minAngle: 3, // 显示过小值扇形，和data配合不显示0值
              data: chartData.map(d => {
                const { key, value } = d
                return {
                  key,
                  value: Object.prototype.toString.call(value) === '[object Number]' ? formatNumber(value) : undefined,
                  name: mapping[key]
                }
              }),
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
                      fontSize: 12,
                      height: 18
                    },
                    class_b: {
                      color: 'rgba(0, 0, 0, 0.85)',
                      fontSize: 20,
                      height: 25
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
                  borderWidth: chartData.filter(d => d.value !== 0).length > 1 ? 4 : 0,
                  borderColor: '#fff'
                }
              }
            }
          ],
          ...extra
        }
        break
      case 'bar':
        const missCountList = chartData.map(r => {
          const { missCount = 0 } = r
          return missCount
        })
        const mistakeCountList = chartData.map(r => {
          const { mistakeCount = 0 } = r
          return mistakeCount
        })
        const deviationCountList = chartData.map(r => {
          const { deviationCount = 0 } = r
          return deviationCount
        })
        options = {
          ...options,
          color: ['#D0021B', '#FF9A00', '#FFCB00'],
          grid: {
            left: '3%',
            right: '3%',
            bottom: '5%',
            containLabel: true
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
          xAxis: [
            {
              type: 'category',
              data: chartData.map(d => d.date),
              axisTick: {
                alignWithLabel: true
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              },
              splitLine: {
                lineStyle: {
                  type: 'dashed'
                }
              }
            }
          ],
          dataZoom: [{ // 默认缩放显示前10条柱
            show: chartData.length > 10,
            type: 'slider',
            xAxisIndex: [0],
            startValue: 0,
            endValue: 9
          }],
          series: [
            {
              name: '漏报数',
              stack: 'count',
              type: chartType,
              barWidth: '20px',
              data: missCountList
            },
            {
              name: '误报数',
              stack: 'count',
              type: chartType,
              barWidth: '20px',
              data: mistakeCountList
            },
            {
              name: '偏差数',
              stack: 'count',
              type: chartType,
              barWidth: '20px',
              data: deviationCountList
            }
          ],
          ...extra
        }
        break
    }
    chart.setOption(options)
  }

  dailyChartClick = (params) => {
    const { seriesName, name: date = '' } = params
    const data = {
      occurTimeVal: [moment(date), moment(date)],
      eventErrorType: seriesName === '漏报数' ? 'MISSING'
        : seriesName === '误报数' ? 'MISTAKE'
          : seriesName === '偏差数' ? 'DEVIATION' : undefined
    }
    this.props.changeTab && this.props.changeTab(data)
  }

  renderDataReport = () => {
    const { taskInfo: { taskDataType, strategyType } = {} } = this.props
    const {
      onlineRatios: {
        onlineCorrectRatio = 0,
        onlineDeviationRatio = 0,
        onlineMissRatio = 0,
        onlineMistakeRatio = 0,
        verifyCorrectRatio = 0,
        verifyDeviationRatio = 0,
        verifyMissRatio = 0,
        verifyMistakeRatio = 0
      } = {},
      onlineScoreCardResult: {
        onlineResult: {
          // scoreCardCountList = [],
          scoreCardRateList = []
        } = {},
        verifyResult: {
          // scoreCardCountList: scoreCardCountListVerify = [],
          scoreCardRateList: scoreCardRateListVerify = []
        } = {}
      } = {},
      offlineScoreCardRateList = [],
      startDate,
      endDate,
      totalEvent: {
        lowData = 0,
        middleData = 0,
        highData = 0,
        totalData = 0
      } = {}
    } = this.state

    let highPer = (highData / totalData * 100).toFixed(1)
    let middlePer = (middleData / totalData * 100).toFixed(1)
    let lowPer = (100 - highPer - middlePer).toFixed(1)
    if (isNaN(highPer)) highPer = 0
    if (isNaN(middlePer)) middlePer = 0
    if (isNaN(lowPer)) lowPer = 0

    const missRatio = (verifyMissRatio * 1000 - onlineMissRatio * 1000) / 1000
    const mistakeRatio = (verifyMistakeRatio * 1000 - onlineMistakeRatio * 1000) / 1000
    const deviationRatio = (verifyDeviationRatio * 1000 - onlineDeviationRatio * 1000) / 1000
    const correctRatio = (verifyCorrectRatio * 1000 - onlineCorrectRatio * 1000) / 1000

    const onlineScoreCardColumns = [{
      title: '分数段',
      dataIndex: 'key',
      key: 'key',
      width: 150
    }, {
      title: '比例',
      dataIndex: 'rate',
      key: 'rate',
      width: 70,
      render: rate => {
        return `${rate}%`
      }
    }, {
      title: '累计比例',
      dataIndex: 'cumulative',
      key: 'cumulative',
      width: 70,
      render: cumulative => {
        return `${cumulative}%`
      }
    }]
    const limits = [100, 50, 20, 10]
    const lineLimits = [5, 10]

    let dom
    switch (taskDataType) {
      case 'OFFLINE_DATA':
        dom = strategyType === SCORE_CARD ? <Row className="height100">
          <Card className="online-card" title={<Fragment>
            <span>策略效果</span>
            <span className={'query-title'}>
        <Select defaultValue={50} onChange={this.changeLimit} style={{ width: 230 }}>
          {
            limits.map(limit => {
              return (
                <Option key={limit} value={limit}>分段间隔：{limit}</Option>
              )
            })
          }
        </Select>
      </span>
          </Fragment>} bodyStyle={{ padding: 0 }} bordered={false}>
            <div key="scoreCard" className="height100">
              <div className="height100 chart" id="offline-score-card" />
              <div className="height100 grid">
                <Table rowKey="key" size="small" className="table-detail" columns={onlineScoreCardColumns}
                       dataSource={offlineScoreCardRateList}
                       style={{ marginTop: 20, marginRight: 20, marginBottom: 20 }} pagination={false} />
              </div>
            </div>
          </Card>
        </Row> : <Row className="height100">
          <Card className="online-card" title={<Fragment>
            <span>事件趋势</span>
            <span className={'query-title'}>
        <RangePicker style={{ width: 230 }} onChange={this.onTimeChange}
                     value={startDate && endDate ? [startDate, endDate] : []}
                     disabledDate={this.disabledDate}
                     format={'YYYY-MM-DD'} allowClear={false} />
      </span>
          </Fragment>} bodyStyle={{ padding: 0 }} bordered={false}>
            <div key="scoreCard" className="height100">
              <div className="height100 chart" id="offline-event" />
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
            </div>
          </Card>
          <Card className="online-card" title={
            <div>
              <span>策略效果</span>
              <span className={'query-title'}>
        <Select defaultValue={5} onChange={this.changeCountLimit} style={{ width: 230 }}>
          {
            lineLimits.map(limit => {
              return (
                <Option key={limit} value={limit}>前{limit}条</Option>
              )
            })
          }
        </Select>
      </span>
            </div>
          } bodyStyle={{ padding: 0 }}
                bordered={false}>
            <div key="scoreCard" className="height100">
              <div className="height100 chart" id="offline-effect" />
            </div>
          </Card>
        </Row>
        break
      default:
        dom = strategyType === SCORE_CARD ? <Row className="height100">
          <Card className="online-card" title={<Fragment>
            <span>策略效果-生产</span>
            <span className={'query-title'}>
        <Select defaultValue={50} onChange={this.changeLimit} style={{ width: 230 }}>
          {
            limits.map(limit => {
              return (
                <Option key={limit} value={limit}>分段间隔：{limit}</Option>
              )
            })
          }
        </Select>
      </span>
          </Fragment>} bodyStyle={{ padding: 0 }} bordered={false}>
            <div key="scoreCard" className="height100">
              <div className="height100 chart" id="online-score-card" />
              <div className="height100 grid">
                <Table rowKey="key" size="small" className="table-detail" columns={onlineScoreCardColumns}
                       dataSource={scoreCardRateList}
                       style={{ marginTop: 20, marginRight: 20, marginBottom: 20 }} pagination={false} />
              </div>
            </div>
          </Card>
          <Card className="online-card" title="策略效果-验证" bodyStyle={{ padding: 0 }}
                bordered={false}>
            <div key="scoreCard" className="height100">
              <div className="height100 chart" id="online-score-card-verify" />
              <div className="height100 grid">
                <Table rowKey="key" size="small" className="table-detail" columns={onlineScoreCardColumns}
                       dataSource={scoreCardRateListVerify}
                       style={{ marginTop: 20, marginRight: 20, marginBottom: 20 }} pagination={false} />
              </div>
            </div>
          </Card>
        </Row> : <Row gutter={16} className="height100" style={{ margin: 0 }}>
          <Col span={18} className="height100" style={{ padding: 0 }}>
            <Row gutter={16} style={{ height: 120 }}>
              <Col span={8} className="height100">
                <div className="top-rate">
                  <div style={{ height: 44, lineHeight: '44px', borderBottom: '1px dashed rgba(0,0,0,.15)' }}>
                    漏报率
                    <span style={{ float: 'right', color: missRatio >= 0 ? '#D0021B' : '#7ED321' }}>
                    <Icon type={missRatio >= 0 ? 'caret-up' : 'caret-down'} />
                      {Math.abs(missRatio)}%
                    </span>
                  </div>
                  <div style={{ height: 44, lineHeight: '44px' }}>
                    <span style={{ display: 'inline-block', width: '50%' }}>验证版本:<span
                      className="primary-text">{verifyMissRatio}%</span></span>
                    <span style={{ display: 'inline-block', width: '50%' }}>生产版本:<span
                      className="primary-text">{onlineMissRatio}%</span></span>
                  </div>
                </div>
              </Col>
              <Col span={8} className="height100">
                <div className="top-rate">
                  <div style={{ height: 44, lineHeight: '44px', borderBottom: '1px dashed rgba(0,0,0,.15)' }}>
                    误报率
                    <span style={{ float: 'right', color: mistakeRatio >= 0 ? '#D0021B' : '#7ED321' }}>
                    <Icon type={mistakeRatio >= 0 ? 'caret-up' : 'caret-down'} />
                      {Math.abs(mistakeRatio)}%
                    </span>
                  </div>
                  <div style={{ height: 44, lineHeight: '44px' }}>
                    <span style={{ display: 'inline-block', width: '50%' }}>验证版本:<span
                      className="primary-text">{verifyMistakeRatio}%</span></span>
                    <span style={{ display: 'inline-block', width: '50%' }}>生产版本:<span
                      className="primary-text">{onlineMistakeRatio}%</span></span>
                  </div>
                </div>
              </Col>
              <Col span={8} className="height100">
                <div className="top-rate">
                  <div style={{ height: 44, lineHeight: '44px', borderBottom: '1px dashed rgba(0,0,0,.15)' }}>
                    偏差率
                    <span style={{ float: 'right', color: deviationRatio >= 0 ? '#D0021B' : '#7ED321' }}>
                    <Icon type={deviationRatio >= 0 ? 'caret-up' : 'caret-down'} />
                      {Math.abs(deviationRatio)}%
                    </span>
                  </div>
                  <div style={{ height: 44, lineHeight: '44px' }}>
                    <span style={{ display: 'inline-block', width: '50%' }}>验证版本:<span
                      className="primary-text">{verifyDeviationRatio}%</span></span>
                    <span style={{ display: 'inline-block', width: '50%' }}>生产版本:<span
                      className="primary-text">{onlineDeviationRatio}%</span></span>
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={16} style={{ height: 'calc(100% - 136px)', margin: '16px 0 0 0' }}>
              <div className="top-rate" id="decision-result-daily" />
            </Row>
          </Col>
          <Col span={6} className="height100" style={{ paddingLeft: 16, paddingRight: 0 }}>
            <Row style={{ height: 120 }}>
              <div className="top-rate">
                <div style={{ height: 44, lineHeight: '44px', borderBottom: '1px dashed rgba(0,0,0,.15)' }}>
                  准确率
                  <span style={{ float: 'right', color: correctRatio >= 0 ? '#D0021B' : '#7ED321' }}>
                    <Icon type={correctRatio >= 0 ? 'caret-up' : 'caret-down'} />
                    {Math.abs(correctRatio)}%
                  </span>
                </div>
                <div style={{ height: 44, lineHeight: '44px' }}>
                  <span style={{ display: 'inline-block', width: '50%' }}>验证版本:<span
                    className="primary-text">{verifyCorrectRatio}%</span></span>
                  <span style={{ display: 'inline-block', width: '50%' }}>生产版本:<span
                    className="primary-text">{onlineCorrectRatio}%</span></span>
                </div>
              </div>
            </Row>
            <Row style={{ height: 'calc(33.3% - 56px)', marginTop: 16 }}>
              <div className="top-rate" id="decision-result-online" />
            </Row>
            <Row style={{ height: 'calc(33.3% - 56px)', marginTop: 16 }}>
              <div className="top-rate" id="decision-result-manual" />
            </Row>
            <Row style={{ height: 'calc(33.3% - 56px)', marginTop: 16 }}>
              <div className="top-rate" id="decision-result-verify" />
            </Row>
          </Col>
        </Row>
        break
    }
    return dom
  }

  // 根据结果数据的风险等级，从对应等级色系中取渐变色
  getRiskColors = (riskData = []) => {
    const { riskPolicyList = [] } = this.props
    const riskGradeDistribution = { LOW: 0, MIDDLE: 0, HIGH: 0 }
    riskData.forEach(d => {
      const { riskGrade } = riskPolicyList.find(r => r.decisionCode === d.decisionCode) || {}
      riskGradeDistribution[riskGrade] = riskGradeDistribution[riskGrade] + 1
    })
    const { LOW, MIDDLE, HIGH } = riskGradeDistribution
    return [...COLOR_YELLOW.slice(0, LOW).reverse(),
      ...COLOR_ORANGE.slice(0, MIDDLE).reverse(),
      ...COLOR_RED.slice(0, HIGH).reverse()
    ]
  }

  changeLimit = selectedLimit => {
    this.setState({ selectedLimit }, () => {
      this.prepareData()
      this.props.changeInterval && this.props.changeInterval(selectedLimit)
    })
  }

  changeCountLimit = count => {
    this.setState({ count }, () => {
      this.getOfflineEffectResult()
    })
  }

  disabledDate = (current) => {
    if (!this.startDate || !this.endDate) {
      return false
    }
    return !(current.valueOf() >= moment(this.startDate).valueOf() && current.valueOf() <= moment(this.endDate).valueOf())
  }

  onTimeChange = date => {
    this.setState({
      startDate: date[0],
      endDate: date[1]
    }, () => {
      this.getOfflineEventRisk()
    })
  }

  getOfflineEventRisk = () => {
    const { taskInfo: { taskId } = {} } = this.props
    const { startDate, endDate } = this.state
    getOfflineEventRisk({
      taskId,
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD')
    }).then(data => {
      const { content: offlineEventRisk = [] } = data
      let totalEvent = {
        lowData: 0,
        middleData: 0,
        highData: 0,
        totalData: 0
      }
      offlineEventRisk.forEach(risk => {
        const { totalCount = 0 } = risk
        totalEvent.totalData = totalEvent.totalData + totalCount
      })
      const highRiskData = offlineEventRisk.map(risk => {
        const { highRiskCount = 0 } = risk
        totalEvent.highData = totalEvent.highData + highRiskCount
        return highRiskCount
      })
      const middleRiskData = offlineEventRisk.map(risk => {
        const { middleRiskCount = 0 } = risk
        totalEvent.middleData = totalEvent.middleData + middleRiskCount
        return middleRiskCount
      })
      const lowRiskData = offlineEventRisk.map(risk => {
        const { lowRiskCount = 0 } = risk
        totalEvent.lowData = totalEvent.lowData + lowRiskCount
        return lowRiskCount
      })
      const option = {
        title: '',
        chartId: 'offline-event',
        chartData: offlineEventRisk,
        chartType: 'bar',
        mapping: {},
        extra: {
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
          series: [
            {
              name: '高风险',
              stack: 'count',
              type: 'bar',
              barWidth: '20px',
              data: highRiskData
            },
            {
              name: '中风险',
              stack: 'count',
              type: 'bar',
              barWidth: '20px',
              data: middleRiskData
            },
            {
              name: '低风险',
              stack: 'count',
              type: 'bar',
              barWidth: '20px',
              data: lowRiskData
            }
          ]
        }
      }
      this.initChart(option)
      this.setState({
        totalEvent
      })
    }).catch((data) => {
      notification.warn(data.content)
    })
  }

  getOfflineEffectResult = () => {
    const { taskInfo: { taskId, strategyId, strategyType } = {} } = this.props
    const { count = 5 } = this.state
    getOfflineEffectResult({ taskId, count, strategyId, strategyType }).then(data => {
      const { content = [] } = data
      const yAxisData = []
      const ruleSetData = content.sort((a, b) => {
        return a.rate - b.rate
      }).map(rs => {
        const { key, value: times, rate } = rs
        yAxisData.push(key)
        return { key, name: key, value: rate, times }
      })
      const option = {
        title: '',
        chartId: 'offline-effect',
        chartData: ruleSetData,
        chartType: 'bar',
        mapping: {},
        extra: {
          color: COLOR_THEME,
          // title: {
          //   text: `当前版本上线时间: ${onlineDate}`,
          //   left: 20,
          //   top: 10,
          //   textStyle: {
          //     fontSize: 14,
          //     fontWeight: 'normal',
          //     color: 'rgba(0,0,0,0.45)'
          //   }
          // },
          dataZoom: [{
            show: false
          }],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'none'
            },
            formatter: params => {
              let xAxisName = ''
              const tooltips = params.map(param => {
                const { name, marker, data: { value, times } = {} } = param
                xAxisName = name
                return `${marker}触发率:&nbsp;${value.toFixed(1)}%<br/>${marker}触发次数:&nbsp;${times}`
              })
              return `${xAxisName}<br/>${tooltips.join('<br/>')}`
            }
          },
          grid: {
            left: '3%',
            right: '3%',
            bottom: '5%',
            containLabel: true
          },
          xAxis: [{
            type: 'value',
            axisLine: {
              show: false
            },
            axisLabel: {
              show: true,
              interval: 'auto',
              formatter: '{value}%'
            },
            axisTick: {
              show: false
            },
            splitLine: {
              lineStyle: {
                type: 'dashed'
              }
            }
          }],
          yAxis: [{
            type: 'category',
            axisLine: {
              show: yAxisData.length > 0
            },
            axisLabel: {
              formatter: value => { // 每隔30字符换行
                const re = new RegExp('[\u4e00-\u9fa5\\w\\-()\\[\\]]{1,30}', 'g')
                return value.match(re).join('\n')
              }
            },
            splitLine: {
              show: false
            },
            axisTick: {
              alignWithLabel: true
            },
            data: yAxisData
          }],
          series: [{
            type: 'bar',
            barWidth: '20px',
            data: ruleSetData
          }]
        }
      }
      this.initChart(option)
    }).catch((data) => {
      notification.warn(data.content)
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataReport)
