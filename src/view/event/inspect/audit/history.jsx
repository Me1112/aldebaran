import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Select, DatePicker, notification, Timeline } from 'antd'
import moment from 'moment'
import { getDimensions, getHistoryList } from '../../../../action/event'
import { formatDate } from '../../../../util'
import { RESOURCE_TYPES } from '../../../../common/constant'

const { RangePicker } = DatePicker
const Option = Select.Option

class TimelinePopover extends React.PureComponent {
  static propTypes = {
    top: PropTypes.any,
    left: PropTypes.any,
    ipAddress: PropTypes.any,
    accountName: PropTypes.any,
    mobile: PropTypes.any,
    mobileCity: PropTypes.any,
    ipCity: PropTypes.any,
    visible: PropTypes.any
  }

  render() {
    const { top, left, ipAddress: ip, visible = false, accountName, mobile, mobileCity, ipCity } = this.props
    return <div className="time-line-popover" style={{ top, left, display: visible ? 'block' : 'none' }}>
      <div className="time-line-popover-content">
        <div className="popover-arrow" />
        <div className="popover-inner">
          <p className={'popoverContent-p'}><label>账号：</label>{accountName}</p>
          <p className={'popoverContent-p'}><label>IP：</label>{ip}</p>
          <p className={'popoverContent-p'}><label>IP所在城市：</label>{ipCity}</p>
          <p className={'popoverContent-p'}><label>手机号：</label>{mobile}</p>
          <p className={'popoverContent-p'}><label>手机号所属城市：</label>{mobileCity}</p>
        </div>
      </div>
    </div>
  }
}

export default class BehaviorHistory extends Component {
  state = {
    dimensions: [],
    dimensionValue: '',
    dimension: undefined,
    startTime: formatDate(new Date().getTime()).split(' ')[0] + ' 00:00:00',
    endTime: formatDate(new Date().getTime()).split(' ')[0] + ' 23:59:59'
  }
  static propTypes = {
    eventId: PropTypes.string.isRequired,
    isTesting: PropTypes.bool.isRequired,
    contants: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { eventId, isTesting } = this.props
    this.loadDimensions(eventId, isTesting)
    this.loadHistoryList()
  }

  render() {
    const {
      startTime, endTime, dimensions = [], dimension, text = '', x = 0, y = 0, visible = false,
      historyList = {}, popoverData = {}
    } = this.state
    const { contants } = this.props
    const dateDay = Object.keys(historyList)
    const { riskPolicyMap = {} } = contants
    return <div className={'behavior-history'}>
      <div className="region-zd">
        <RangePicker style={{ width: 230 }}
                     onChange={this.handleDatePicker}
                     defaultValue={[moment(startTime.split(' ')[0], 'YYYY-MM-DD'), moment(endTime.split(' ')[0], 'YYYY-MM-DD')]} />
        <Select style={{ width: 180 }} allowClear placeholder="请选择维度" value={dimension}
                onChange={this.dimensionChange}>
          {
            dimensions.map(d => {
              const { dimension, name } = d
              return <Option key={dimension} value={dimension}>{name}</Option>
            })
          }
        </Select>
        <i className="anticon anticon-search" title="搜索" onClick={this.loadHistoryList} />
        <span className={'region-right-tips'}>{text}</span>
      </div>
      <div style={{ height: 'calc(100% - 50px)', overflowY: 'auto', paddingLeft: '300px' }}>
        <Timeline>
          {
            dateDay.map((item, index) => {
              const values = historyList[item]
              return (<Fragment key={index}>
                <Timeline.Item>{item}</Timeline.Item>
                {
                  values.map((value, vIndex) => {
                    const { time, appName, scenarioName, finalDecision, strategyType, finalScore } = value
                    let { decisionName = '' } = riskPolicyMap[finalDecision] || {}
                    if (strategyType === 'SCORE_CARD') {
                      decisionName = finalScore
                    }
                    return <Timeline.Item key={vIndex} dot={this.timelineDot(value)}>
                      {time} {appName} {scenarioName} {RESOURCE_TYPES[strategyType]}（<span>{decisionName}</span>）
                    </Timeline.Item>
                  })
                }
              </Fragment>)
            })
          }
        </Timeline>
      </div>
      <TimelinePopover top={y} {...popoverData} left={x} visible={visible} />
    </div>
  }

  handleDatePicker = (date, dateStr) => {
    const startTime = date.length === 0 ? '' : dateStr[0] + ' 00:00:00'
    const endTime = date.length === 0 ? '' : dateStr[1] + ' 23:59:59'
    this.setState({
      startTime,
      endTime
    })
  }
  timelineDot = (data) => {
    return <span className={'timeline-dot'} onMouseOver={(e) => {
      this.handleMouseOver(e, data)
    }} onMouseOut={this.handleMouseOut} />
  }
  handleMouseOver = (e, data) => {
    console.log(e)
    this.setState({
      popoverData: data,
      visible: true,
      x: e.clientX - 259, // pageX是以html左上角为原点，相应的clientX是以浏览器左上角为原点
      y: e.clientY - 16
    })
  }

  handleMouseOut = () => {
    this.setState({
      visible: false,
      x: 0,
      y: 0
    })
  }
  loadDimensions = (eventId, isTesting) => {
    try {
      getDimensions({ eventId, isTesting }).then(data => {
        const { content = {} } = data
        this.setState({ ...content })
      })
    } catch (err) {
      notification.warning(err)
    }
  }

  dimensionChange = (value, option = {}) => {
    const { props: { children = '' } = {} } = option
    const text = this.state[value] || ''
    if (text) {
      this.setState({ dimension: value, dimensionValue: text, text: `${children} : ${text}` })
    } else {
      this.setState({ dimension: value, dimensionValue: text, text: '' })
    }
  }

  loadHistoryList = () => {
    const { startTime, endTime, dimensionValue = ' ', dimension = '' } = this.state
    const { isTesting } = this.props
    try {
      getHistoryList({ startTime, endTime, dimensionValue, dimension, isTesting }).then(data => {
        const { content = {} } = data
        let historyList = {}
        content.forEach(item => {
          const { occurTime } = item
          const [day, time] = occurTime.split(' ')
          item.time = time
          if (!historyList[day]) {
            historyList[day] = []
          }
          historyList[day].push(item)
        })
        console.log('historyList', historyList)
        this.setState({ historyList })
      })
    } catch (err) {
      notification.warning(err)
    }
  }
}
