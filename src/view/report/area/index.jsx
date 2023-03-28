import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Row, Col, DatePicker, notification, Select } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import { Map } from 'immutable'
import { bindActionCreators } from 'redux'
import { buildUrlParamNew, RangePickerRanges } from '../../../util'
import {
  getProvinceReports,
  getCityReports
} from '../../../action/report'
import { getAppList } from '../../../action/system'
import { getSceneList } from '../../../action/rule'
import './index.less'
import echarts from 'echarts'
import '../../../public/js/china'
import { geoCoordMap } from '../../../public/js/city_position'
import {
  CHART_COLOR
} from '../../../common/constant'

const { RangePicker } = DatePicker
const { Option } = Select
const { COLOR_THEME } = CHART_COLOR
const DAYS = {
  TODAY: '今日',
  YESTERDAY: '昨日',
  LAST_7: '近七天',
  LAST_30: '近三十天'
}

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

class ScoreIndex extends Component {
  constructor(props) {
    super(props)
    const ranges = RangePickerRanges['LAST_7']
    const startDate = ranges[0].format('YYYY-MM-DD')
    const endDate = ranges[1].format('YYYY-MM-DD')
    this.state = {
      daySelect: 'LAST_7',
      startDate,
      endDate,
      chart: {}, // 全局图对象
      chartOriginData: [] // 原始省区域数据对象
    }
  }

  static propTypes = {
    getAppList: PropTypes.func.isRequired,
    getSceneList: PropTypes.func.isRequired,
    appSelect: PropTypes.array.isRequired,
    sceneList: PropTypes.array.isRequired
  }

  componentWillMount() {
    // this.getRiskTodayData()
  }

  componentDidMount() {
    this.props.getAppList()
    this.setState({
      chart: echarts.init(document.getElementById('chart')),
      chart_: echarts.init(document.getElementById('chart_'))
    }, () => {
      this.getData()
    })
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
    const {
      appSelect = [],
      sceneList = []
    } = this.props

    const {
      startDate,
      endDate,
      appId,
      scenarioValue,
      daySelect = 'LAST_7'
    } = this.state

    return (
      <div className="area">
        <div className="region-zd">
          <span className="title">区域风险</span>
          <div className="content">
            {
              Object.keys(DAYS).map(d => <span key={d}
                                               className={classnames('days-select', { 'selected': daySelect === d })}
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
            <Select value={scenarioValue} placeholder="场景" style={{ width: 160, marginRight: 0 }}
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
          </div>
        </div>
        <div className="report-area">
          <Row gutter={24}>
            <Col className="gutter-row left-area" span={16}>
              <div className="left-area-title clearfix" />
              <div className="left-area-warp">
                <div id="chart" style={{ height: '100%', overflow: 'hidden' }} />
              </div>
            </Col>
            <Col className="gutter-row right-area" span={8}>
              <div className="right-area-title clearfix" />
              <div className="right-area-warp">
                <div id="chart_" style={{ height: '100%', overflow: 'hidden' }} />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  // resize = () => {
  //   const { chart, chart_ } = this.state
  //   if (chart && chart_) {
  //     window.setTimeout(() => {
  //       chart.resize()
  //       chart_.resize()
  //     }, 10)
  //   }
  // }

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

  /**
   * 地图数据
   */
  getProvinceReports = () => {
    let { startDate, endDate, appId, scenarioValue, chart } = this.state
    getProvinceReports(buildUrlParamNew({ startDate, endDate, appId, scenarioValue })).then((data) => {
      let { content: provinceData = [] } = data
      this.setState({
        chartOriginData: provinceData
      })
      if (provinceData.length === 0) {
        chart.clear()
        return
      }
      let chartProvinceData = []
      let chartCityData = []
      // 数据转换
      provinceData.forEach(item => {
        const { province = '', riskCount = 0, cityList = [] } = item
        chartProvinceData.push({ name: province, value: riskCount })
        cityList.forEach(item => {
          const { city = '', riskCount = 0 } = item
          chartCityData.push({ name: city, value: riskCount })
        })
      })
      chartCityData = chartCityData.sort((a, b) => a.value - b.value)
      let series = [{
        name: '省区域风险分布',
        type: 'map',
        roam: false,
        geoIndex: 0,
        label: {
          show: false
        },
        data: chartProvinceData
      }, {
        name: '市区域风险分布',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: this.convertData(chartCityData),
        symbolSize: function (val, params) {
          const { dataIndex } = params
          const numPerSize = chartCityData.length / 10
          return 5 + dataIndex / numPerSize
        },
        tooltip: {
          formatter: params => {
            const { name = '', value = '' } = params
            return `${name} : ${value[2]}`
          }
        },
        label: {
          normal: {
            formatter: '{b}',
            position: 'right',
            show: false
          },
          emphasis: {
            show: true
          }
        },
        itemStyle: {
          normal: {
            color: '#FF6643'
          }
        }
      }]
      if (chartProvinceData.length > 0) {
        chart.setOption({
          title: {
            text: '风险区域分布',
            left: 20,
            top: 10,
            textStyle: {
              fontSize: 14,
              color: 'rgba(0,0,0,0.85)'
            }
          },
          tooltip: {
            show: true,
            formatter: function (params) {
              if (params.data) {
                return params.name + '：' + params.data['value']
              }
            }
          },
          visualMap: {
            seriesIndex: 0,
            show: false,
            min: 0,
            max: chartProvinceData.sort((a, b) => b.value - a.value)[0].value,
            calculable: true,
            itemWidth: 12,
            inRange: {
              color: [COLOR_THEME[COLOR_THEME.length - 1], COLOR_THEME[0]]
            },
            textStyle: {
              color: '#666'
            }
          },
          geo: {
            map: 'china',
            label: {
              emphasis: {
                show: true
              }
            },
            itemStyle: {
              normal: {
                areaColor: 'rgb(241,246,252)',
                borderWidth: 1,
                borderColor: '#1d94a1'
              },
              emphasis: {
                areaColor: '#f1f6fc'
              }
            },
            regions: [{
              name: '南海诸岛',
              value: 0,
              itemStyle: {
                normal: {
                  opacity: 0,
                  label: {
                    show: false
                  }
                }
              }
            }]
          },
          series: series
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getCityReports = () => {
    let { startDate, endDate, appId, scenarioValue, chart_ } = this.state
    getCityReports(buildUrlParamNew({ startDate, endDate, appId, scenarioValue })).then((data) => {
      let { content: cityData = [] } = data
      cityData.reverse()
      this.setState({
        cityData
      })
      if (cityData.length === 0) {
        chart_.clear()
        return
      }
      const cities = cityData.map(d => d.city)
      const series0Data = cityData.map(d => d.highRiskCount)
      const series1Data = cityData.map(d => d.middleRiskCount)

      let series = [{
        name: '高风险事件数',
        type: 'bar',
        barGap: 0,
        barWidth: 20,
        data: series0Data
      }, {
        name: '中风险事件数',
        type: 'bar',
        barGap: 0,
        barWidth: 20,
        data: series1Data
      }]
      if (cityData.length > 0) {
        chart_.setOption({
          grid: {
            containLabel: true
          },
          color: ['#D0021B', '#FF9A00'],
          title: {
            text: '风险城市TOP10',
            left: 0,
            top: 10,
            textStyle: {
              fontSize: 14,
              color: 'rgba(0,0,0,0.85)'
            }
          },
          tooltip: {
            show: true
          },
          legend: {
            data: ['高风险事件数', '中风险事件数'],
            top: 10,
            right: 0,
            itemWidth: 10,
            itemHeight: 2
          },
          xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
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
          },
          yAxis: {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            data: cities
          },
          series: series
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getData = () => {
    this.getProvinceReports()
    this.getCityReports()
  }

  onDaysSelect = day => {
    const ranges = RangePickerRanges[day]
    const startDate = ranges[0].format('YYYY-MM-DD')
    const endDate = ranges[1].format('YYYY-MM-DD')

    this.setState({
      daySelect: day,
      startDate,
      endDate
    }, () => {
      this.getData()
    })
  }

  onTimeChange = async (date, dateString) => {
    this.setState({
      daySelect: '',
      startDate: dateString[0],
      endDate: dateString[1]
    }, () => {
      this.getData()
    })
  }

  convertData = (data) => {
    let res = []
    let geoCoord
    for (var i = 0; i < data.length; i++) {
      geoCoord = geoCoordMap[data[i].name]
      if (geoCoord) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value)
        })
      }
    }
    return res
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ScoreIndex)
