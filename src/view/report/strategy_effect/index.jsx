import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Card, Select, notification, Table } from 'antd'
import echarts from 'echarts'
import { CHART_COLOR, RESOURCE_TYPES } from '../../../common/constant'
import { STRATEGY_STATUS } from '../../../common/case'
import { formatNumber } from '../../../util'
import {
  getStrategyState,
  getStrategyUsed,
  getStrategyList,
  getStrategyHitRules,
  getStrategyScoreCard,
  getHitDecisionTree,
  getHitDecisionStream
} from '../../../action/report'
import './index.less'

const { Option } = Select
const { COLOR_THEME } = CHART_COLOR

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

class StrategyEffect extends Component {
  state = {}

  componentDidMount() {
    this.getData()
    // if (window.attachEvent) {
    //   window.attachEvent('onresize', this.resize)
    // } else if (window.addEventListener) {
    //   window.addEventListener('resize', this.resize, false)
    // }
  }

  componentWillUnmount() {
    // if (window.detachEvent) {
    //   window.detachEvent('onresize', this.resize)
    // } else if (window.removeEventListener) {
    //   window.removeEventListener('resize', this.resize, false)
    // }
  }

  render() {
    const { strategyType, scoreCardRateList = [] } = this.state
    const columns = [{
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
    return <div className="strategy-effect">
      <div className="strategy-info">
        <div id="strategy-state" />
        <div id="strategy-distribution" />
      </div>
      <Card className="strategy-type" title={this.renderStrategyCondition()} bodyStyle={{ padding: 0 }}
            bordered={false}>
        {
          strategyType === 'SCORE_CARD'
            ? <div key="scoreCard" className="height100">
              <div className="height100 chart" id="scoreCard" />
              <div className="height100 grid">
                <Table rowKey="key" size="small" className="table-detail" columns={columns} dataSource={scoreCardRateList}
                       style={{ marginTop: 20, marginRight: 20, marginBottom: 20 }} pagination={false} />
              </div>
            </div>
            : <div key="strategyChart" id="strategyChart" className="height100" />
        }
      </Card>
    </div>
  }

  renderStrategyCondition = () => {
    const { strategyType } = this.state
    let defaultLimit = 5
    let limits = [5, 10]
    if (strategyType === 'SCORE_CARD') {
      defaultLimit = 50
      limits = [100, 50, 20, 10]
    }
    const { selectedLimit = defaultLimit, selectedId, list = [] } = this.state
    return <div>
      <span>{RESOURCE_TYPES[strategyType]}</span>
      <span className={'query-title'}>
        <Select placeholder="请选择" value={selectedId} onChange={this.changeList} style={{ width: 230 }}>
         {
           list.map(ruleSet => {
             const { strategyId, strategyName, onlineTime } = ruleSet
             return (
               <Option key={strategyId} value={strategyId} time={onlineTime}
                       title={strategyName}>{strategyName}</Option>
             )
           })
         }
        </Select>
        <Select value={selectedLimit} onChange={this.changeLimit} style={{ width: 230 }}>
          {
            limits.map((limit) => {
              let name = `前${limit}条`
              if (strategyType === 'SCORE_CARD') {
                name = `分段间隔：${limit}`
              }
              return (
                <Option key={limit} value={limit}>{name}</Option>
              )
            })
          }
        </Select>
      </span>
    </div>
  }

  changeLimit = (selectedLimit) => {
    this.setState({ selectedLimit }, () => {
      const { selectedId, onlineDate } = this.state
      if (selectedId && onlineDate) {
        this.getStrategyHitRules({ selectedLimit, onlineDate, selectedId })
      }
    })
  }

  changeList = (selectedId, option = {}) => {
    const { props: { time: onlineDate } = {} } = option
    this.setState({ selectedId, onlineDate }, () => {
      const { selectedLimit = 5, selectedId, onlineDate } = this.state
      if (selectedId && onlineDate) {
        this.getStrategyHitRules({ selectedLimit, onlineDate, selectedId })
      }
    })
  }

  clickChart = (params) => {
    const { dataIndex = 0, data: { key } = {} } = params
    let { selectedLimit, strategyType } = this.state
    let clean = false
    if (key !== strategyType) {
      switch (key) {
        case 'SCORE_CARD':
          selectedLimit = 50
          break
        default:
          selectedLimit = 5
      }
      clean = true
    }
    this.setState({ selectedLimit, dataIndex, strategyType: key }, () => {
      this.getStrategyList(key, clean)
    })
  }

  getData = () => {
    getStrategyState().then(data => {
      const { content: chartData = [] } = data
      const option = {
        title: '策略状态分布',
        chartId: 'strategy-state',
        chartData,
        chartType: 'pie',
        mapping: STRATEGY_STATUS
      }
      this.initChart(option)
    }).catch((data) => {
      notification.warn(data.content)
    })
    getStrategyUsed().then(data => {
      const { content: chartData = [] } = data
      let max = -1
      let maxType = ''
      chartData.forEach(data => {
        const { key, value } = data
        if (value > max) {
          max = value
          maxType = key
        }
      })
      if (max > 0) {
        this.getStrategyList(maxType)
      }
      const option = {
        title: '策略应用分布',
        chartId: 'strategy-distribution',
        chartData,
        chartType: 'pie',
        mapping: RESOURCE_TYPES,
        clickEvent: this.clickChart
      }
      this.initChart(option)
    }).catch((data) => {
      notification.warn(data.content)
    })
  }

  drawChart = (option = {}) => {
    const { text, formatter, yAxisData = [], data = [] } = option
    this.strategyType = echarts.init(document.getElementById('strategyChart'))
    this.strategyType.setOption({
      color: COLOR_THEME,
      title: {
        text,
        left: 20,
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
          color: 'rgba(0,0,0,0.45)'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'none'
        },
        formatter
      },
      grid: {
        left: '3%',
        right: '3%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
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
      },
      yAxis: {
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
      },
      series: [{
        type: 'bar',
        barWidth: '20px',
        data
      }]
    })
  }

  getStrategyHitRules = (params = {}) => {
    const { strategyType } = this.state
    const { selectedLimit = 5, onlineDate, selectedId } = params
    switch (strategyType) {
      case 'RULE_SET': {
        getStrategyHitRules({ count: selectedLimit, onlineDate, ruleSetId: selectedId }).then(data => {
          this.handleStrategyData({ ...data, onlineDate })
        })
        break
      }
      case 'SCORE_CARD': {
        const { selectedLimit = 50, onlineDate, selectedId } = params
        getStrategyScoreCard({ interval: selectedLimit, onlineDate, scoreCardId: selectedId }).then(data => {
          const { content: { scoreCardCountList = [], scoreCardRateList = [] } = {} } = data
          const chart = echarts.init(document.getElementById('scoreCard'))
          this.setState({ scoreCardCountList, scoreCardRateList }, () => {
            chart.setOption({
              color: COLOR_THEME,
              title: {
                text: `当前版本上线时间: ${onlineDate}`,
                left: 20,
                top: 10,
                textStyle: {
                  fontSize: 14,
                  fontWeight: 'normal',
                  color: 'rgba(0,0,0,0.45)'
                }
              },
              grid: {
                left: '3%',
                right: '3%',
                bottom: '5%',
                containLabel: true
              },
              tooltip: {
                trigger: 'item',
                axisPointer: {
                  type: 'none'
                },
                formatter: param => {
                  const { name, marker, value } = param
                  return `${name}<br/>${marker}事件数:&nbsp;${value}`
                }
              },
              xAxis: [
                {
                  type: 'category',
                  axisLine: {
                    show: scoreCardCountList.length > 0
                  },
                  data: scoreCardCountList.map(d => d.key),
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
                show: scoreCardCountList.length > 10,
                type: 'slider',
                xAxisIndex: [0],
                startValue: 0,
                endValue: 9
              }],
              series: [
                {
                  type: 'bar',
                  barWidth: '20px',
                  data: scoreCardCountList.map(d => d.value)
                }
              ]
            })
          })
        })
        break
      }
      case 'DECISION_TREE': {
        const { selectedLimit = 5, onlineDate, selectedId } = params
        getHitDecisionTree({ count: selectedLimit, onlineDate, strategyId: selectedId }).then(data => {
          this.handleStrategyData({ ...data, onlineDate })
        })
        break
      }
      case 'DECISION_STREAM': {
        const { selectedLimit = 5, onlineDate, selectedId } = params
        getHitDecisionStream({ count: selectedLimit, onlineDate, strategyId: selectedId }).then(data => {
          this.handleStrategyData({ ...data, onlineDate })
        })
        break
      }
    }
  }

  handleStrategyData = data => {
    const { content = [], onlineDate = '' } = data
    const yAxisData = []
    const ruleSetData = content.sort((a, b) => {
      return a.rate - b.rate
    }).map(rs => {
      const { key: name, value: times, rate } = rs
      yAxisData.push(name)
      return { name, value: rate, times }
    })
    this.drawChart({
      text: `当前版本上线时间: ${onlineDate}`,
      formatter: params => {
        let xAxisName = ''
        const tooltips = params.map(param => {
          const { name, marker, data: { value, times } = {} } = param
          xAxisName = name
          return `${marker}触发率:&nbsp;${value.toFixed(1)}%<br/>${marker}触发次数:&nbsp;${times}`
        })
        return `${xAxisName}<br/>${tooltips.join('<br/>')}`
      },
      yAxisData,
      data: ruleSetData
    })
  }

  getStrategyList = (strategyType, clean = false) => {
    getStrategyList(strategyType).then(data => {
      const { content: list = [] } = data
      let { selectedId, selectedLimit, onlineDate } = this.state
      if ((list.length > 0 && !selectedId) || clean) {
        const { strategyId, onlineTime } = list[0] || {}
        selectedId = strategyId
        onlineDate = onlineTime
      }
      this.setState({ strategyType, list, selectedId, onlineDate }, () => {
        if (selectedId && onlineDate) {
          this.getStrategyHitRules({ selectedLimit, onlineDate, selectedId })
        }
      })
    })
  }

  initChart = (option = {}) => {
    const { title, chartId, chartData, chartType, mapping, clickEvent } = option
    const chart = echarts.init(document.getElementById(chartId))
    if (clickEvent) {
      chart.off('click', clickEvent)
      chart.on('click', clickEvent)
    }
    let options = {
      color: COLOR_THEME,
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
          series: [
            {
              name: title,
              type: chartType,
              legendHoverLink: false,
              radius: ['50%', '70%'],
              center: ['40%', '50%'],
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
                  borderWidth: chartData.filter(d => d.value !== 0).length > 1 ? 4 : 0,
                  borderColor: '#fff'
                }
              }
            }
          ]
        }
        break
      case 'bar':
        options = {
          ...options,
          grid: {
            left: '3%',
            right: '3%',
            bottom: '5%',
            containLabel: true
          },
          tooltip: {
            trigger: 'item',
            formatter: '{b} <br/> 数量: {c}'
          },
          xAxis: [
            {
              type: 'category',
              data: chartData.map(d => d.key),
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
              name: title,
              type: chartType,
              barWidth: '40%',
              data: chartData.map(d => d.value)
            }
          ]
        }
        break
    }
    chart.setOption(options)
    // 设置默认选中高亮部分
    chart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: 0
    })
    chart.on('mouseover', (e) => {
      const { dataIndex = 0 } = this.state
      // 当检测到鼠标悬停事件，取消默认选中高亮
      if (e.dataIndex !== dataIndex) {
        chart.dispatchAction({
          type: 'downplay',
          seriesIndex: 0,
          dataIndex
        })
      }
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
        dataIndex
      })
    })
    // 图例点击切换后高亮新的第一块
    chart.on('legendselectchanged', function (e) {
      const { selected = {} } = e
      const dataIndexCurrent = chartData.findIndex(d => selected[mapping[d.key]])
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

  // resize = () => {
  //   window.setTimeout(() => {
  //     ['case-status', 'case-type', 'case-count'].forEach(chartId => {
  //       echarts.init(document.getElementById(chartId)).resize()
  //     })
  //   }, 10)
  // }
}

export default connect(mapStateToProps, mapDispatchToProps)(StrategyEffect)
