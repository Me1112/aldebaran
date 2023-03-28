import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getCaseStatus, getCaseType, getCaseCount } from '../../../action/case'
import { CHART_COLOR } from '../../../common/constant'
import { CASE_STATUS, CASE_CONCLUSION } from '../../../common/case'
import { formatNumber } from '../../../util'
import echarts from 'echarts'
import './index.less'
import { notification } from 'antd'

const { COLOR_THEME } = CHART_COLOR

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

class Audit extends Component {
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
    return <div className="audit">
      <div className="case-up">
        <div id="case-status" />
        <div id="case-type" />
      </div>
      <div id="case-count" />
    </div>
  }

  getData = () => {
    getCaseStatus().then(data => {
      const { content: chartData = [] } = data
      const option = {
        title: '案件状态分布',
        chartId: 'case-status',
        chartData,
        chartType: 'pie',
        mapping: CASE_STATUS
      }
      this.initChart(option)
    }).catch((data) => {
      notification.warn(data.content)
    })
    getCaseType().then(data => {
      const { content: chartData = [] } = data
      const option = {
        title: '案件性质分配',
        chartId: 'case-type',
        chartData,
        chartType: 'pie',
        mapping: CASE_CONCLUSION
      }
      this.initChart(option)
    }).catch((data) => {
      notification.warn(data.content)
    })
    getCaseCount().then(data => {
      const { content: chartData = [] } = data
      const option = {
        title: '案件任务量',
        chartId: 'case-count',
        chartData,
        chartType: 'bar',
        mapping: CASE_CONCLUSION
      }
      this.initChart(option)
    }).catch((data) => {
      notification.warn(data.content)
    })
  }

  initChart = (option = {}) => {
    const { title, chartId, chartData, chartType, mapping } = option
    const chart = echarts.init(document.getElementById(chartId))
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
              minAngle: 3,
              data: chartData.map(d => {
                return {
                  value: Object.prototype.toString.call(d.value) === '[object Number]' ? formatNumber(d.value) : undefined,
                  name: mapping[d.key]
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
              axisLabel: {
                interval: 0,
                formatter: value => {
                  const bracketIndex = value.indexOf('(') === -1 ? value.length : value.indexOf('(')
                  return value.slice(0, bracketIndex) + '\n' + value.slice(bracketIndex, value.length)
                }
              },
              axisTick: {
                interval: 0,
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
              barWidth: 20,
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
    chart.on('mouseover', function (e) {
      // 当检测到鼠标悬停事件，取消默认选中高亮
      chart.dispatchAction({
        type: 'downplay',
        seriesIndex: 0,
        dataIndex: 0
      })
      // 高亮显示悬停的那块
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: e.dataIndex
      })
    })
    // 检测鼠标移出后显示之前默认高亮的那块
    chart.on('mouseout', function (e) {
      chart.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        dataIndex: 0
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(Audit)
