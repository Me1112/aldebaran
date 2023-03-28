import React, { Component, createRef } from 'react'
import { Table, notification, Row, Col, Select, Button, DatePicker } from 'antd'
import moment from 'moment'
import echarts from 'echarts'
import classNames from 'classnames'
import { formatNumber2, toThousands } from '@util'
import { fetchLastWeekOverview, fetchSystemTypeTable, fetchStatisticByType } from '@action/fraud'
import '../../index.less'
import './index.less'

const { Option } = Select
const { RangePicker } = DatePicker
const NOW = moment()
const WEEK_OF_DAY = parseInt(moment().format('E'))
const CURRENT_WEEK_RANGE = [NOW.clone().weekday(0), NOW]
const LAST_WEEK_RANGE = [NOW.clone().subtract(WEEK_OF_DAY + 7 - 1, 'days'), NOW.clone().subtract(WEEK_OF_DAY, 'days')]
const RECENTLY_1_MONTH_RANGE = [NOW.clone().subtract(1, 'months'), NOW.clone().subtract(1, 'days')]
const RECENTLY_3_MONTHS_RANGE = [NOW.clone().subtract(3, 'months'), NOW.clone().subtract(1, 'days')]
const RECENTLY_6_MONTHS_RANGE = [NOW.clone().subtract(6, 'months'), NOW.clone().subtract(1, 'days')]
const RECENTLY_12_MONTHS_RANGE = [NOW.clone().subtract(12, 'months'), NOW.clone().subtract(1, 'days')]
const CURRENT_YEAR_RANGE = [NOW.clone().startOf('year'), NOW.clone().subtract(1, 'days')]

const RECENTLY_12_WEEKS_RANGE = [NOW.clone().subtract(11, 'weeks').startOf('week'), NOW]
const RECENTLY_12_YEARS_RANGE = [NOW.clone().subtract(12, 'years'), NOW.clone().subtract(1, 'days')]

export default class AntiFraudOverview extends Component {
  state = {
    startTimeOpen: false,
    endTimeOpen: false,
    statisticsTotal: {},
    tablePeriod: 'CURRENT_WEEK',
    chartPeriod: 'RECENTLY_12_WEEKS',
    rangeTime: [moment().startOf('month'), moment().endOf('month')],
    tableRangeTime: CURRENT_WEEK_RANGE,
    chartRangeTime: RECENTLY_12_WEEKS_RANGE,
    dataSource: [],
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    },
    completedPagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }
  caseChartRef = createRef()
  coverageChartRef = createRef()

  componentDidMount() {
    this.loadOverviewData()
    this.loadTableData()
    this.loadChartsData()
  }

  render() {
    const {
      dataSource,
      companyId = '本周',
      systemType,
      statisticsTotal,
      tablePeriod,
      chartPeriod,
      tableRangeTime,
      chartRangeTime,
      tableStatistics = {}
    } = this.state
    let {
      lastWeekCaseNumber = 0,
      lastWeekTriggerNumber = 0,
      lastWeekFraudCaseNumber = 0,
      lastWeekDetectionAmount = 0,
      lastWeekTriggerRate = 0,
      lastWeekTriggerSuccessRate = 0
    } = statisticsTotal
    lastWeekCaseNumber = toThousands(lastWeekCaseNumber)
    lastWeekTriggerNumber = toThousands(lastWeekTriggerNumber)
    lastWeekFraudCaseNumber = toThousands(lastWeekFraudCaseNumber)
    const {
      number: lastWeekDetectionAmountFormat,
      unit: lastWeekDetectionAmountUnit = ''
    } = formatNumber2(lastWeekDetectionAmount, {
      precision: 2,
      simple: false
    })
    lastWeekTriggerRate = formatNumber2(lastWeekTriggerRate * 100, { precision: 2 })
    lastWeekTriggerSuccessRate = formatNumber2(lastWeekTriggerSuccessRate * 100, { precision: 2 })

    let { betweenCaseNumber = 0, betweenFraudNumber = 0 } = tableStatistics
    betweenCaseNumber = toThousands(betweenCaseNumber)
    betweenFraudNumber = toThousands(betweenFraudNumber)

    const columns = [
      {
        title: '系统',
        dataIndex: 'systemName',
        width: 120
      },
      {
        title: '案件',
        children: [
          {
            title: '触发案件量',
            dataIndex: 'triggerCaseNumber',
            width: 102,
            key: 'triggerCaseNumber',
            render: (text) => {
              return toThousands(text)
            }
          },
          {
            title: '触发率',
            dataIndex: 'triggerRate',
            width: 82,
            key: 'triggerRate',
            render: (text) => {
              return `${formatNumber2(text * 100, { precision: 2 })}%`
            }
          }
        ]
      },
      {
        title: '调查',
        children: [
          {
            title: '调查案件量',
            width: 102,
            dataIndex: 'examCaseNumber',
            key: 'examCaseNumber',
            render: (text) => {
              return toThousands(text)
            }
          },
          {
            title: '调查率',
            dataIndex: 'examRate',
            width: 82,
            key: 'examRate',
            render: (text) => {
              return `${formatNumber2(text * 100, { precision: 2 })}%`
            }
          }
        ]
      }, {
        title: '触发成功',
        children: [
          {
            title: '欺诈案件量',
            dataIndex: 'fraudCaseNumber',
            width: 102,
            key: 'fraudCaseNumber',
            render: (text) => {
              return toThousands(text)
            }
          },
          {
            title: '触发成功率',
            dataIndex: 'triggerSuccessRate',
            width: 102,
            key: 'triggerSuccessRate',
            render: (text) => {
              return `${formatNumber2(text * 100, { precision: 2 })}%`
            }
          },
          {
            title: '覆盖率',
            dataIndex: 'coverage',
            width: 82,
            key: 'coverage',
            render: (text) => {
              return `${formatNumber2(text * 100, { precision: 2 })}%`
            }
          }
        ]
      }, {
        title: '减损',
        children: [
          {
            title: '减损金额（元）',
            dataIndex: 'detectionAmount',
            width: 142,
            key: 'detectionAmount',
            render: (text) => {
              return toThousands(text)
            }
          },
          {
            title: '减损覆盖率',
            dataIndex: 'detectionCoverage',
            width: 102,
            key: 'detectionCoverage',
            render: (text) => {
              return `${formatNumber2(text * 100, { precision: 2 })}%`
            }
          }
        ]
      }]
    const disabled = !companyId

    return (<div className="indicator-page m20 overflow">
        <div className="zs-title">反欺诈总览</div>
        <div className="indicator-board">
          <div className="indicator-board-title center">上周反欺诈工作总览</div>
          <Row>
            <Col span={4}>
              <div className="title">上周报案量</div>
              <div className="sum">
                <span title={lastWeekCaseNumber}>{lastWeekCaseNumber}</span>件
              </div>
            </Col>
            <Col span={4}>
              <div className="title">上周触发案件量</div>
              <div className="sum">
                <span title={lastWeekTriggerNumber}>{lastWeekTriggerNumber}</span>件
              </div>
            </Col>
            <Col span={4}>
              <div className="title">上周欺诈案件</div>
              <div className="sum">
                <span title={lastWeekFraudCaseNumber}>{lastWeekFraudCaseNumber}</span>件
              </div>
            </Col>
            <Col span={4}>
              <div className="title">上周欺诈案件减损金额</div>
              <div className="sum">
                <span className={classNames({ 'w36': lastWeekDetectionAmountUnit.length === 2 })}
                      title={lastWeekDetectionAmountFormat}>{lastWeekDetectionAmountFormat}</span>
                {lastWeekDetectionAmountUnit}
              </div>
            </Col>
            <Col span={4}>
              <div className="title">上周案件触发率</div>
              <div className="sum">
                <span title={lastWeekTriggerRate}>{lastWeekTriggerRate}</span>%
              </div>
            </Col>
            <Col span={4}>
              <div className="title">上周触发成功率</div>
              <div className="sum">
                <span title={lastWeekTriggerSuccessRate}>{lastWeekTriggerSuccessRate}</span>%
              </div>
            </Col>
          </Row>
        </div>
        <div className="view-panel">
          <div className="view-panel-title no-border">
            <Select className="mr20" size="small" placeholder="常用统计周期" allowClear={false} style={{ width: 150 }}
                    value={tablePeriod} onChange={this.changeTablePeriod}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="CURRENT_WEEK">本周</Option>
              <Option value="LAST_WEEK">上周</Option>
              <Option value="RECENTLY_1_MONTH">最近一个月</Option>
              <Option value="RECENTLY_3_MONTHS">最近三个月</Option>
              <Option value="RECENTLY_6_MONTHS">最近半年</Option>
              <Option value="RECENTLY_12_MONTHS">最近一年</Option>
              <Option value="CURRENT_YEAR">今年</Option>
            </Select>
            <RangePicker allowClear={false} value={tableRangeTime} size="small" onChange={this.handleChangeTableTime} />
            <Button type="primary" size="small" disabled={disabled} onClick={this.onQueryTable}>查询</Button>
          </div>
          <div className="view-panel-title no-border">
            <span className="total-statistic">本统计期间报案量：{betweenCaseNumber}件</span>
            <span className="total-statistic">本统计期间欺诈案件总量：{betweenFraudNumber}件</span>
          </div>
          <Table rowKey="systemName" className="table-layout-fixed bordered-without-outer" columns={columns} bordered
                 dataSource={dataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
        </div>
        <div className="view-panel">
          <div className="view-panel-title no-border">
            <Select className="mr20" size="small" placeholder="反欺诈系统" allowClear style={{ width: 150 }}
                    value={systemType} onChange={this.changeSystem}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="RULE_ENGINE">规则引擎</Option>
              <Option value="AI_MODEL">智能模型</Option>
              <Option value="SNS">社交网络</Option>
            </Select>
            <Select className="mr20" size="small" placeholder="常用统计周期" allowClear={false} style={{ width: 150 }}
                    value={chartPeriod} onChange={this.changeChartPeriod}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="RECENTLY_12_WEEKS">最近12周</Option>
              <Option value="RECENTLY_12_MONTHS">最近12月</Option>
              <Option value="RECENTLY_12_YEARS">最近12年</Option>
            </Select>
            <RangePicker allowClear={false} value={chartRangeTime} size="small" onChange={this.handleChangeChartTime}
                         onCalendarChange={this.onCalendarChange} disabledDate={this.disabledDate} />
            <Button type="primary" size="small" disabled={disabled} onClick={this.onQueryChart}>查询</Button>
          </div>
          <Row className="mt20" gutter={48}>
            <Col span={12}>
              <div className="part-chart" ref={this.caseChartRef} />
            </Col>
            <Col span={12}>
              <div className="part-pie" ref={this.coverageChartRef} />
            </Col>
          </Row>
        </div>
      </div>
    )
  }

  changeSystem = (systemType) => {
    this.setState({ systemType })
  }

  changeTablePeriod = (tablePeriod) => {
    let { tableRangeTime } = this.state
    switch (tablePeriod) {
      case 'CURRENT_WEEK':
        tableRangeTime = CURRENT_WEEK_RANGE
        break
      case 'LAST_WEEK':
        tableRangeTime = LAST_WEEK_RANGE
        break
      case 'RECENTLY_1_MONTH':
        tableRangeTime = RECENTLY_1_MONTH_RANGE
        break
      case 'RECENTLY_3_MONTHS':
        tableRangeTime = RECENTLY_3_MONTHS_RANGE
        break
      case 'RECENTLY_6_MONTHS':
        tableRangeTime = RECENTLY_6_MONTHS_RANGE
        break
      case 'RECENTLY_12_MONTHS':
        tableRangeTime = RECENTLY_12_MONTHS_RANGE
        break
      case 'CURRENT_YEAR':
        tableRangeTime = CURRENT_YEAR_RANGE
        break
    }
    this.setState({ tablePeriod, tableRangeTime })
  }

  changeChartPeriod = (chartPeriod) => {
    let { chartRangeTime } = this.state
    switch (chartPeriod) {
      case 'RECENTLY_12_WEEKS':
        chartRangeTime = RECENTLY_12_WEEKS_RANGE
        break
      case 'RECENTLY_12_MONTHS':
        chartRangeTime = RECENTLY_12_MONTHS_RANGE
        break
      case 'RECENTLY_12_YEARS':
        chartRangeTime = RECENTLY_12_YEARS_RANGE
        break
    }
    this.setState({ chartPeriod, chartRangeTime })
  }

  loadOverviewData = () => {
    fetchLastWeekOverview().then((res) => {
      const { content: statisticsTotal = {} } = res
      this.setState({ statisticsTotal })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  loadTableData = () => {
    const { tableRangeTime } = this.state
    const [startDate, endDate] = tableRangeTime
    fetchSystemTypeTable({
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    }).then((res) => {
      const { content: [tableStatistics = {}, tableRowMap = {}] = [] } = res
      const { AI_MODEL, RULE_ENGINE, SNS, TOTAL } = tableRowMap
      const dataSource = [{ systemName: '规则引擎', ...RULE_ENGINE },
        { systemName: '智能模型', ...AI_MODEL },
        { systemName: '社交网络', ...SNS },
        { systemName: '总计', ...TOTAL }]
      this.setState({ tableStatistics, dataSource })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  loadChartsData = () => {
    const { chartRangeTime, systemType } = this.state
    const [startDate, endDate] = chartRangeTime
    const unitMap = { week: '周', month: '月', year: '年' }
    fetchStatisticByType({
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      systemType
    }).then((res) => {
      const { content = [] } = res
      let xAxisData = []
      let triggerCaseNumbers = []
      let triggerRates = []
      let triggerSuccessRates = []
      let fraudCaseNumbers = []
      let coverages = []
      content.forEach((row, index) => {
        const {
          triggerCaseNumber = 0,
          triggerRate = 0,
          triggerSuccessRate = 0,
          fraudCaseNumber = 0,
          coverage = 0,
          label
        } = row
        xAxisData = [...xAxisData, `${index + 1}${unitMap[label]}`]
        triggerCaseNumbers = [...triggerCaseNumbers, triggerCaseNumber]
        triggerRates = [...triggerRates, formatNumber2(triggerRate * 100, { precision: 2 })]
        triggerSuccessRates = [...triggerSuccessRates, formatNumber2(triggerSuccessRate * 100, { precision: 2 })]
        fraudCaseNumbers = [...fraudCaseNumbers, fraudCaseNumber]
        coverages = [...coverages, formatNumber2(coverage * 100, { precision: 2 })]
      })
      const caseChart = echarts.init(this.caseChartRef.current)
      caseChart.setOption({
        'color': ['#2C4DA0', '#ED7D31', '#999999'],
        title: {
          top: 20,
          text: '提调案件情况',
          left: 'center'
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross', crossStyle: { color: '#999' } } },
        grid: { containLabel: true, top: 70, left: 30, right: 30 },
        legend: { bottom: 20, data: ['提调案件量', '提调率', '提调成功率'] },
        xAxis: [{
          type: 'category',
          data: xAxisData,
          axisPointer: { type: 'shadow' }
        }],
        yAxis: [{ type: 'value', min: 0 }, {
          type: 'value',
          min: 0,
          axisLabel: { formatter: '{value} %' }
        }],
        series: [{
          name: '提调案件量',
          type: 'bar',
          barMaxWidth: 30,
          data: triggerCaseNumbers
        }, {
          name: '提调率',
          type: 'line',
          yAxisIndex: 1,
          data: triggerRates
        }, {
          name: '提调成功率',
          type: 'line',
          yAxisIndex: 1,
          data: triggerSuccessRates
        }]
      })
      const coverageChart = echarts.init(this.coverageChartRef.current)
      coverageChart.setOption({
        'color': ['#2C4DA0', '#ED7D31'],
        title: {
          top: 20,
          text: '案件覆盖情况',
          left: 'center'
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross', crossStyle: { color: '#999' } } },
        grid: { containLabel: true, top: 70, left: 30, right: 30 },
        legend: { bottom: 20, data: ['识别欺诈案件量', '覆盖率'] },
        xAxis: [{
          type: 'category',
          data: xAxisData,
          axisPointer: { type: 'shadow' }
        }],
        yAxis: [{ type: 'value', min: 0 }, {
          type: 'value',
          min: 0,
          axisLabel: { formatter: '{value} %' }
        }],
        series: [{
          name: '识别欺诈案件量',
          type: 'bar',
          barMaxWidth: 30,
          data: fraudCaseNumbers
        }, {
          name: '覆盖率',
          type: 'line',
          yAxisIndex: 1,
          data: coverages
        }]
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  handleChangeTableTime = (tableRangeTime) => {
    this.setState({ tableRangeTime })
  }

  handleChangeChartTime = (chartRangeTime) => {
    this.setState({ chartRangeTime })
  }

  onCalendarChange = (currentDate) => {
    this.startTimeReset = currentDate.length === 1
    this.startTime = currentDate[0]
  }

  disabledDate = (currentDate) => {
    if (this.startTimeReset) {
      const startTimeString = this.startTime.format('YYYY-MM-DD')
      const st1 = moment(moment(startTimeString).subtract(12, 'years').format('YYYY-MM-DD'))
      const se1 = moment(moment(startTimeString).add(12, 'years').subtract(1, 'days').format('YYYY-MM-DD'))
      return !(moment(currentDate.format('YYYY-MM-DD')).diff(st1) >= 0 && se1.diff(moment(currentDate.format('YYYY-MM-DD'))) >= 0)
    }
    return false
  }

  onQueryTable = () => {
    this.loadTableData()
  }

  onQueryChart = () => {
    this.loadChartsData()
  }
}
