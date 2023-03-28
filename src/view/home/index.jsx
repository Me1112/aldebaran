/* eslint-disable spaced-comment */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Row, Col, notification, Progress, Icon } from 'antd'

import { formatDate, getUserName } from '../../util'
import { APP_NAME } from '../../common/app'
import {
  getIpCity, getRiskStat
} from '../../action/report'
import '../../public/css/iconfont.css'
import '../../container/app/index.less'
import './index.less'
import echarts from 'echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/toolbox'
import '../../public/js/china'
import { geoCoordMap } from '../../public/js/city_position'
import HeadDropdown from '../../component/head'

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    getRiskStat: bindActionCreators(getRiskStat, dispatch),
    getIpCity: bindActionCreators(getIpCity, dispatch)
  }
}

class ScoreIndex extends Component {
  static propTypes = {
    getRiskStat: PropTypes.func.isRequired
  }
  state = {
    beginDate: formatDate(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)).split(' ')[0] + ' 00:00:00',
    endDate: formatDate(new Date().getTime()).split(' ')[0] + ' 23:59:59',
    riskTodayData: [],

    chart: {}, // 全局图对象
    chartOriginData: [], // 原始省区域数据对象
    chartOriginDataCity: [] // 原始市区域数据对象
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.getData()
  }

  render() {
    const { chartOriginDataCity, riskTodayData } = this.state
    const { refuseCount = 0, checkCount = 0, passCount = 0 } = riskTodayData
    let totalCount = refuseCount + checkCount + passCount
    return (
      <div className="content_warp home-index">
        <HeadDropdown>
          <div className="user-info">
            <Icon className="info-head" type="user" />
            <span>{getUserName()}</span>
          </div>
        </HeadDropdown>
        <div className="title-area">
          {APP_NAME}
        </div>
        <div className="main-area">
          <Row gutter={24}>
            <Col className="gutter-row right-area" span={8}>
              <div className="gutter-box pl35 pr15">
                <div className="main-area-warp total-main">
                  <p className="main-area-title">事件总量</p>
                  <div className="main-area-inner">
                    <Progress percent={100} status="active"
                              strokeColor="#1C9477"
                              format={percent => `${totalCount}`} />
                  </div>

                </div>
                <div className="main-area-warp today-main mt40">
                  <p className="main-area-title">事件大盘</p>
                  <div className="main-area-inner">
                    <p>拒绝：{refuseCount}</p>
                    <Progress percent={totalCount ? refuseCount / totalCount * 100 : 0} status="active"
                              strokeColor="#e5204b" format={percent => `${percent.toFixed(1)}%`} />
                    <p>人工审核：{checkCount}</p>
                    <Progress percent={totalCount ? checkCount / totalCount * 100 : 0} status="active"
                              strokeColor="#0d7ffd" format={percent => `${percent.toFixed(1)}%`} />
                    <p>通过：{passCount}</p>
                    <Progress percent={totalCount ? passCount / totalCount * 100 : 0} status="active"
                              strokeColor="#1ea29a" format={percent => `${percent.toFixed(1)}%`} />
                  </div>
                </div>
              </div>
            </Col>
            <Col className="gutter-row left-area" span={16}>
              <div className="gutter-box">
                <div className="left-area-warp">
                  {chartOriginDataCity.length === 0 ? <p className="no-data-tip">暂无数据</p> : ''}
                  <div id="chart_" style={{ height: '100%' }} />
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className="bottom-menu-area">
          {/*<Link to="/rule/collection">*/}
          {/*<div className="bottom-menu-area-icon">*/}
          {/*<i className="iconfont icon-audit" />*/}
          {/*</div>*/}
          {/*<span>信审管理</span>*/}
          {/*</Link>*/}
          {/*<Link to="/limit">*/}
          {/*<div className="bottom-menu-area-icon">*/}
          {/*<i className="iconfont icon-cash" />*/}
          {/*</div>*/}
          {/*<span>额度管理</span>*/}
          {/*</Link>*/}
          <Link to={{
            pathname: `/policy/bazaar/collection`,
            state: { openKeys: ['/policy/bazaar'], defaultSelectedKeys: ['/policy/bazaar/collection'] }
          }}>
            <div className="bottom-menu-area-icon">
              <i className="anticon anticon-rule" />
            </div>
            <span>策略集市</span>
          </Link>
          <Link to={{ pathname: `/policy/index/indicators`, state: { openKeys: ['/policy/index'], defaultSelectedKeys: ['/policy/index/indicators'] } }}>
            <div className="bottom-menu-area-icon">
              <i className="anticon anticon-control" />
            </div>
            <span>指标管理</span>
          </Link>
          <Link
            to={{ pathname: `/risk/market/event-market`, state: { openKeys: ['/risk/market'], defaultSelectedKeys: ['/risk/market/event-market'] } }}>
            <div className="bottom-menu-area-icon">
              <i className="anticon anticon-diagram-bar" />
            </div>
            <span>风险大盘</span>
          </Link>
          <Link to={{ pathname: `/risk/event/list`, state: { openKeys: ['/risk/event'], defaultSelectedKeys: ['/risk/event/list'] } }}>
            <div className="bottom-menu-area-icon">
              <i className="anticon anticon-event" />
            </div>
            <span>事件监控</span>
          </Link>
          <Link to={{ pathname: `/risk/task/verification`, state: { openKeys: ['/risk/task'], defaultSelectedKeys: ['/risk/task/verification'] } }}>
            <div className="bottom-menu-area-icon">
              <i className="anticon anticon-file-exception" />
            </div>
            <span>任务中心</span>
          </Link>
        </div>
      </div>
    )
  }

  getTodayData = async () => {
    let date = formatDate(new Date().getTime()).split(' ')[0]
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
  getIpCity = () => {
    // let { beginDateCity, endDateCity } = this.state
    setTimeout(async () => {
      let chart_ = echarts.init(document.getElementById('chart_'))
      let cityData = [
        { ipCity: '苏州', count: 10 },
        { ipCity: '广州', count: 19 },
        { ipCity: '西安', count: 7 },
        { ipCity: '北京', count: 25 },
        { ipCity: '长沙', count: 25 },
        { ipCity: '武汉', count: 26 },
        { ipCity: '金华', count: 7 }
      ]
      this.setState({
        chartOriginDataCity: cityData
      })
      if (cityData.length === 0) {
        chart_.clear()
        return
      }
      let chartData = []
      // 数据转换
      cityData.forEach((item, index) => {
        chartData.push({ name: item.ipCity, value: item.count })
      })
      let convertData = this.convertData(chartData)
      console.log(convertData)
      let series = [{
        name: '',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: convertData,
        symbolSize: 12,
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: false
          }
        },
        itemStyle: {
          normal: {
            color: '#4b765b'
          },
          emphasis: {
            color: '#4b765b',
            borderColor: '#fff',
            borderWidth: 1
          }
        }
      }]
      chart_.setOption({
        tooltip: {
          show: true,
          formatter: function (params) {
            return params.name + ' : ' + params.value[2]
          }
        },
        geo: {
          map: 'china',
          label: {
            emphasis: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              areaColor: 'rgb(241,246,252)',
              borderWidth: 1,
              borderColor: '#4b765b',
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowBlur: 6
            },
            emphasis: {
              areaColor: '#eee'
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
    }, 0)
  }
  getData = () => {
    this.getTodayData()
    this.getIpCity()
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

export default connect(mapStateToProps, mapDispatchToProps)(ScoreIndex)
