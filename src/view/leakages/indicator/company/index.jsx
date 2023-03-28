import React, { Component, Fragment, createRef } from 'react'
import { Table, notification, Row, Col, Button } from 'antd'
import moment from 'moment'
import RangeMonthPicker from '@view/leakages/components/range_month_picker'
import { formatNumber2, getCompanyName, getCompanyLogo, toThousands } from '@util'
import {
  fetchIndicatorMonitorIndicatorOverview4Company,
  fetchIndicatorMonitorRuleDerogationTotal4Company
} from '@action/leakage'
import '../index.less'
import './index.less'
import echarts from 'echarts'

const COMPANY_NAME = getCompanyName()
const COMPANY_LOGO = getCompanyLogo() ? `/dms/leakage/company/image/${getCompanyLogo()}` : ''

export default class IndicatorCompany extends Component {
  state = {
    startTimeOpen: false,
    endTimeOpen: false,
    startTimeRD: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeRD: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    startTimeND: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeND: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    startTimeNT: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeNT: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    startTimeAD: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeAD: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    startTimeAT: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeAT: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    statisticsTotal: {},
    rangeTime: [moment().startOf('month'), moment().endOf('month')],
    dataSource: []
  }

  overviewChartRefRD = createRef()
  overviewChartRefND = createRef()
  overviewChartRefNT = createRef()
  overviewChartRefAD = createRef()
  overviewChartRefAT = createRef()

  componentDidMount() {
    fetchIndicatorMonitorRuleDerogationTotal4Company().then((data) => {
      const { content: statisticsTotal = {} } = data
      this.setState({ statisticsTotal })
    }).catch((data) => {
      notification.warning(data.content)
    })
    this.onQuery('RULE_DEROGATION')
    this.onQuery('NUMBER_DETECTION')
    this.onQuery('NUMBER_TRIGGER')
    this.onQuery('AMOUNT_DETECTION')
    this.onQuery('AMOUNT_TRIGGER')
  }

  render() {
    const {
      statisticsTotal,
      columnsRD,
      dataSourceRD,
      columnsND,
      dataSourceND,
      columnsNT,
      dataSourceNT,
      columnsAD,
      dataSourceAD,
      columnsAT,
      dataSourceAT,
      startTimeRD,
      endTimeRD,
      startTimeND,
      endTimeND,
      startTimeNT,
      endTimeNT,
      startTimeAD,
      endTimeAD,
      startTimeAT,
      endTimeAT
    } = this.state
    let {
      thisMonthDerogationAmount = 0,
      thisYearDerogationAmount = 0,
      thisYearDerogationRate = 0,
      totalDerogationAmount = 0
    } = statisticsTotal
    const {
      number: thisMonthDerogationAmountFormat,
      unit: thisMonthDerogationAmountUnit
    } = formatNumber2(thisMonthDerogationAmount, {
      precision: 2,
      simple: false
    })
    const {
      number: thisYearDerogationAmountFormat,
      unit: thisYearDerogationAmountUnit
    } = formatNumber2(thisYearDerogationAmount, {
      precision: 2,
      simple: false
    })
    thisYearDerogationRate = formatNumber2(thisYearDerogationRate * 100, { precision: 2 })
    const {
      number: totalDerogationAmountFormat,
      unit: totalDerogationAmountUnit
    } = formatNumber2(totalDerogationAmount, {
      precision: 2,
      simple: false
    })

    return (<div className="indicator-page m20 overflow">
        <div className="indicator-board">
          <div className="indicator-board-title">{COMPANY_NAME}</div>
          <div className="indicator-board-logo">
            <div className="logo">
              {COMPANY_LOGO ? <img src={COMPANY_LOGO} alt={COMPANY_NAME} /> : COMPANY_NAME}
            </div>
            <div className="statistics">
              <Row>
                <Col span={6}>
                  <div className="title">上月减损金额</div>
                  <div className="sum">
                    <span title={thisMonthDerogationAmountFormat}>{thisMonthDerogationAmountFormat}</span>
                    {thisMonthDerogationAmountUnit}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="title">本年减损金额</div>
                  <div className="sum">
                    <span title={thisYearDerogationAmountFormat}>{thisYearDerogationAmountFormat}</span>
                    {thisYearDerogationAmountUnit}
                  </div>
                </Col>
                <Col span={6}>
                  <div className="title">本年减损率</div>
                  <div className="sum">
                    <span title={thisYearDerogationRate}>{thisYearDerogationRate}</span>%
                  </div>
                </Col>
                <Col span={6}>
                  <div className="title">累计减损总金额</div>
                  <div className="sum">
                    <span title={totalDerogationAmountFormat}>{totalDerogationAmountFormat}</span>
                    {totalDerogationAmountUnit}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className="view-panel">
          <div className="view-panel-title">
            <span>规则减损贡献度</span>
            <RangeMonthPicker size="small" value={[startTimeRD, endTimeRD]}
                              onPanelChange={(value, mode) => this.onPanelChange(value, mode, 'RULE_DEROGATION')}
                              getCalendarContainer={triggerNode => triggerNode.parentNode} />
            <Button type="primary" size="small" onClick={() => this.onQuery('RULE_DEROGATION')}>查询</Button>
            <span className="fr">单位: 万元</span>
          </div>
          <Table className="table-layout-fixed" columns={columnsRD} dataSource={dataSourceRD}
                 locale={{ emptyText: '暂无数据' }} pagination={false} />
          <div className="overview-chart" ref={this.overviewChartRefRD} />
        </div>
        <div className="view-panel">
          <div className="view-panel-title">
            <span>件数检出率</span>
            <RangeMonthPicker size="small" value={[startTimeND, endTimeND]}
                              onPanelChange={(value, mode) => this.onPanelChange(value, mode, 'NUMBER_DETECTION')}
                              getCalendarContainer={triggerNode => triggerNode.parentNode} />
            <Button type="primary" size="small" onClick={() => this.onQuery('NUMBER_DETECTION')}>查询</Button>
            <span className="fr">单位: 件</span>
          </div>
          <Table className="table-layout-fixed" columns={columnsND} dataSource={dataSourceND}
                 locale={{ emptyText: '暂无数据' }} pagination={false} />
          <div className="overview-chart" ref={this.overviewChartRefND} />
        </div>
        <div className="view-panel">
          <div className="view-panel-title">
            <span>件数触发率</span>
            <RangeMonthPicker size="small" value={[startTimeNT, endTimeNT]}
                              onPanelChange={(value, mode) => this.onPanelChange(value, mode, 'NUMBER_TRIGGER')}
                              getCalendarContainer={triggerNode => triggerNode.parentNode} />
            <Button type="primary" size="small" onClick={() => this.onQuery('NUMBER_TRIGGER')}>查询</Button>
            <span className="fr">单位: 件</span>
          </div>
          <Table className="table-layout-fixed" columns={columnsNT} dataSource={dataSourceNT}
                 locale={{ emptyText: '暂无数据' }} pagination={false} />
          <div className="overview-chart" ref={this.overviewChartRefNT} />
        </div>
        <div className="view-panel">
          <div className="view-panel-title">
            <span>金额检出率</span>
            <RangeMonthPicker size="small" value={[startTimeAD, endTimeAD]}
                              onPanelChange={(value, mode) => this.onPanelChange(value, mode, 'AMOUNT_DETECTION')}
                              getCalendarContainer={triggerNode => triggerNode.parentNode} />
            <Button type="primary" size="small" onClick={() => this.onQuery('AMOUNT_DETECTION')}>查询</Button>
            <span className="fr">单位: 万元</span>
          </div>
          <Table className="table-layout-fixed" columns={columnsAD} dataSource={dataSourceAD}
                 locale={{ emptyText: '暂无数据' }} pagination={false} />
          <div className="overview-chart" ref={this.overviewChartRefAD} />
        </div>
        <div className="view-panel">
          <div className="view-panel-title">
            <span>金额触发率</span>
            <RangeMonthPicker size="small" value={[startTimeAT, endTimeAT]}
                              onPanelChange={(value, mode) => this.onPanelChange(value, mode, 'AMOUNT_TRIGGER')}
                              getCalendarContainer={triggerNode => triggerNode.parentNode} />
            <Button type="primary" size="small" onClick={() => this.onQuery('AMOUNT_TRIGGER')}>查询</Button>
            <span className="fr">单位: 万元</span>
          </div>
          <Table className="table-layout-fixed" columns={columnsAT} dataSource={dataSourceAT}
                 locale={{ emptyText: '暂无数据' }} pagination={false} />
          <div className="overview-chart" ref={this.overviewChartRefAT} />
        </div>
      </div>
    )
  }

  onQuery = (overviewType) => {
    const {
      startTimeRD,
      endTimeRD,
      startTimeND,
      endTimeND,
      startTimeNT,
      endTimeNT,
      startTimeAD,
      endTimeAD,
      startTimeAT,
      endTimeAT
    } = this.state
    let startMonth
    let endMonth
    switch (overviewType) {
      case 'RULE_DEROGATION':
        startMonth = startTimeRD.format('YYYY-MM')
        endMonth = endTimeRD.format('YYYY-MM')
        break
      case 'NUMBER_DETECTION':
        startMonth = startTimeND.format('YYYY-MM')
        endMonth = endTimeND.format('YYYY-MM')
        break
      case 'NUMBER_TRIGGER':
        startMonth = startTimeNT.format('YYYY-MM')
        endMonth = endTimeNT.format('YYYY-MM')
        break
      case 'AMOUNT_DETECTION':
        startMonth = startTimeAD.format('YYYY-MM')
        endMonth = endTimeAD.format('YYYY-MM')
        break
      case 'AMOUNT_TRIGGER':
        startMonth = startTimeAT.format('YYYY-MM')
        endMonth = endTimeAT.format('YYYY-MM')
        break
    }
    this.loadIndicatorMonitorIndicatorOverview({
      startMonth,
      endMonth,
      indicatorType: overviewType
    })
  }

  loadIndicatorMonitorIndicatorOverview = (parameters = {}) => {
    let columns = [
      {
        title: <Fragment>&nbsp;</Fragment>,
        dataIndex: 'name',
        key: 'name',
        width: 150,
        onCell: (record) => {
          return { title: record.name }
        }
      }]
    const { indicatorType } = parameters
    let legendData = ['减损总金额', '减损贡献度']
    let xAxisData = []
    let amounts = []
    let rates = []
    let indicatorMaps = []
    let dataSource = []
    let overviewChart = null
    let columnKey = ''
    let dataSourceKey = ''
    switch (indicatorType) {
      case 'RULE_DEROGATION':
        columnKey = 'columnsRD'
        dataSourceKey = 'dataSourceRD'
        overviewChart = echarts.init(this.overviewChartRefRD.current)
        indicatorMaps = ['减损总金额', '上报项目总金额', '减损贡献度']
        dataSource = indicatorMaps.map(name => {
          return { key: `RD_${name}`, name }
        })
        break
      case 'NUMBER_DETECTION':
        columnKey = 'columnsND'
        dataSourceKey = 'dataSourceND'
        overviewChart = echarts.init(this.overviewChartRefND.current)
        legendData = ['核减任务流总量', '件数检出率']
        indicatorMaps = ['核减任务流总量', '触发任务流总量', '件数检出率']
        dataSource = indicatorMaps.map(name => {
          return { key: `ND_${name}`, name }
        })
        break
      case 'NUMBER_TRIGGER':
        columnKey = 'columnsNT'
        dataSourceKey = 'dataSourceNT'
        overviewChart = echarts.init(this.overviewChartRefNT.current)
        legendData = ['触发任务流总量', '件数触发率']
        indicatorMaps = ['触发任务流总量', '调用任务流总量', '件数触发率']
        dataSource = indicatorMaps.map(name => {
          return { key: `NT_${name}`, name }
        })
        break
      case 'AMOUNT_DETECTION':
        columnKey = 'columnsAD'
        dataSourceKey = 'dataSourceAD'
        overviewChart = echarts.init(this.overviewChartRefAD.current)
        legendData = ['减损总金额', '金额检出率']
        indicatorMaps = ['减损总金额', '触发规则总金额', '金额检出率']
        dataSource = indicatorMaps.map(name => {
          return { key: `AD_${name}`, name }
        })
        break
      case 'AMOUNT_TRIGGER':
        columnKey = 'columnsAT'
        dataSourceKey = 'dataSourceAT'
        overviewChart = echarts.init(this.overviewChartRefAT.current)
        legendData = ['触发规则总金额', '金额触发率']
        indicatorMaps = ['触发规则总金额', '上报项目总金额', '金额触发率']
        dataSource = indicatorMaps.map(name => {
          return { key: `AT_${name}`, name }
        })
        break
    }

    fetchIndicatorMonitorIndicatorOverview4Company(parameters).then((data) => {
      const { content = [] } = data
      content.forEach(item => {
        const { month, monthIndicatorMap = {} } = item
        xAxisData = [...xAxisData, month]
        columns = [...columns, {
          title: month,
          dataIndex: month,
          key: month,
          onCell: (record) => {
            return { title: record[month] }
          }
        }]
        indicatorMaps.forEach((item, index) => {
          let value = monthIndicatorMap[item]
          switch (indicatorType) {
            case 'RULE_DEROGATION':
              switch (item) {
                case '减损贡献度':
                  const rate = formatNumber2(value * 100, { precision: 2 })
                  rates = [...rates, rate]
                  value = `${rate}%`
                  break
                default:
                  value = Math.round(value / (10000 / 100)) / 100
                  switch (item) {
                    case '减损总金额':
                      amounts = [...amounts, value]
                      break
                    case '累计减损总金额':
                      amounts = [...amounts, value]
                      break
                  }
                  value = toThousands(value)
              }
              break
            case 'NUMBER_DETECTION':
              switch (item) {
                case '件数检出率':
                  const rate = formatNumber2(value * 100, { precision: 2 })
                  rates = [...rates, rate]
                  value = `${rate}%`
                  break
                default:
                  switch (item) {
                    case '核减任务流总量':
                      amounts = [...amounts, value]
                      break
                    case '累计核减任务流总量':
                      amounts = [...amounts, value]
                      break
                  }
                  value = toThousands(value)
              }
              break
            case 'NUMBER_TRIGGER':
              switch (item) {
                case '件数触发率':
                  const rate = formatNumber2(value * 100, { precision: 2 })
                  rates = [...rates, rate]
                  value = `${rate}%`
                  break
                default:
                  switch (item) {
                    case '触发任务流总量':
                      amounts = [...amounts, value]
                      break
                    case '累计触发任务流总量':
                      amounts = [...amounts, value]
                      break
                  }
                  value = toThousands(value)
              }
              break
            case 'AMOUNT_DETECTION':
              switch (item) {
                case '金额检出率':
                  const rate = formatNumber2(value * 100, { precision: 2 })
                  rates = [...rates, rate]
                  value = `${rate}%`
                  break
                default:
                  value = Math.round(value / (10000 / 100)) / 100
                  switch (item) {
                    case '减损总金额':
                      amounts = [...amounts, value]
                      break
                    case '累计减损总金额':
                      amounts = [...amounts, value]
                      break
                  }
                  value = toThousands(value)
              }
              break
            case 'AMOUNT_TRIGGER':
              switch (item) {
                case '金额触发率':
                  const rate = formatNumber2(value * 100, { precision: 2 })
                  rates = [...rates, rate]
                  value = `${rate}%`
                  break
                default:
                  value = Math.round(value / (10000 / 100)) / 100
                  switch (item) {
                    case '触发规则总金额':
                      amounts = [...amounts, value]
                      break
                    case '累计触发规则总金额':
                      amounts = [...amounts, value]
                      break
                  }
                  value = toThousands(value)
              }
              break
          }
          const row = dataSource[index]
          dataSource[index] = { ...row, [month]: value }
        })
      })
      overviewChart.setOption(this._buildBarLineOption({
        xAxisData,
        legendData,
        amounts,
        rates
      }))
      overviewChart.resize()
      this.setState({ [columnKey]: columns, [dataSourceKey]: dataSource })
    }).catch((data) => {
      notification.warning(data.content ? data.content : { message: data.message })
    })
  }

  onPanelChange = (value, mode, overviewType) => {
    let [startTime, endTime] = value
    const [mode1, mode2] = mode
    const diff = endTime.diff(startTime, 'months')
    if (mode1 === 'date') {
      if (diff > 11) {
        endTime = endTime.clone().subtract(diff - 11, 'months')
      }
    } else if (mode2 === 'date') {
      if (diff > 11) {
        startTime = startTime.clone().add(diff - 11, 'months')
      }
    }
    switch (overviewType) {
      case 'RULE_DEROGATION':
        this.setState({ startTimeRD: startTime, endTimeRD: endTime })
        break
      case 'NUMBER_DETECTION':
        this.setState({ startTimeND: startTime, endTimeND: endTime })
        break
      case 'NUMBER_TRIGGER':
        this.setState({ startTimeNT: startTime, endTimeNT: endTime })
        break
      case 'AMOUNT_DETECTION':
        this.setState({ startTimeAD: startTime, endTimeAD: endTime })
        break
      case 'AMOUNT_TRIGGER':
        this.setState({ startTimeAT: startTime, endTimeAT: endTime })
        break
    }
  }

  _buildBarLineOption = ({ xAxisData, legendData, amounts, rates } = {}) => {
    return {
      color: ['#1c9577', '#ed7d31'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      grid: {
        containLabel: true,
        top: 30,
        left: 30,
        right: 30
      },
      legend: {
        bottom: 10,
        data: legendData
      },
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          min: 0
        },
        {
          type: 'value',
          min: 0,
          axisLabel: {
            formatter: '{value} %'
          }
        }
      ],
      series: [
        {
          name: legendData[0],
          type: 'bar',
          barMaxWidth: 100,
          data: amounts
        },
        {
          name: legendData[1],
          type: 'line',
          yAxisIndex: 1,
          data: rates
        }
      ]
    }
  }
}
