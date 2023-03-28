import React, { Component, Fragment, createRef } from 'react'
import { Table, Tabs, Row, Col, Select, Button, notification } from 'antd'
import echarts from 'echarts'
import moment from 'moment'
import classNames from 'classnames'
import RangeMonthPicker from '../../components/range_month_picker'
import '../index.less'
import {
  fetchIndicatorMonitorRuleDerogationTotal,
  fetchIndicatorMonitorNumberDetectionTotal,
  fetchIndicatorMonitorNumberOfTriggerTotal,
  fetchIndicatorMonitorAmountOfDetectionTotal,
  fetchIndicatorMonitorAmountOfTriggerTotal,
  fetchIndicatorMonitorCompanyOverview, fetchIndicatorMonitorIndicatorOverview, fetchIndicatorMonitorYearsFromSql
} from '@action/leakage'
import { formatNumber2, toThousands } from '@util'

const { TabPane } = Tabs
const { Option } = Select

export default class IndicatorOverview extends Component {
  state = {
    open: false,
    overviewRDSelected: 'LAST_12_MONTH',
    overviewNDSelected: 'LAST_12_MONTH',
    overviewNTSelected: 'LAST_12_MONTH',
    overviewADSelected: 'LAST_12_MONTH',
    overviewATSelected: 'LAST_12_MONTH',
    overviewType: 'RULE_DEROGATION',
    startTimeRD: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeRD: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    startTimeND: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeND: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    startTimeNT: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeNT: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    startTimeAD: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeAD: moment(moment().subtract(1, 'months').format('YYYY-MM-DD')),
    startTimeAT: moment(moment().subtract(12, 'months').format('YYYY-MM-DD')),
    endTimeAT: moment(moment().subtract(1, 'months').format('YYYY-MM-DD'))
  }

  overviewChartRefRD = createRef()
  partChartRefRD = createRef()
  partPieRefRD = createRef()
  overviewChartRefND = createRef()
  partChartRefND = createRef()
  partPieRefND = createRef()
  overviewChartRefNT = createRef()
  partChartRefNT = createRef()
  partPieRefNT = createRef()
  overviewChartRefAD = createRef()
  partChartRefAD = createRef()
  partPieRefAD = createRef()
  overviewChartRefAT = createRef()
  partChartRefAT = createRef()
  partPieRefAT = createRef()

  componentDidMount() {
    this.loadOverviewStatistics()
    this.loadIndicatorMonitorIndicatorOverview()
    this.loadIndicatorMonitorCompanyOverview()
  }

  render() {
    const {
      overviewRDSelected,
      overviewNDSelected,
      overviewNTSelected,
      overviewADSelected,
      overviewATSelected,
      overviewRDYear,
      overviewRDYears = [],
      overviewNDYear,
      overviewNDYears = [],
      overviewNTYear,
      overviewNTYears = [],
      overviewADYear,
      overviewADYears = [],
      overviewATYear,
      overviewATYears = [],
      overviewType,
      startTimeRD,
      endTimeRD,
      startTimeND,
      endTimeND,
      startTimeNT,
      endTimeNT,
      startTimeAD,
      endTimeAD,
      startTimeAT,
      endTimeAT,
      rdStatistics = {},
      ndStatistics = {},
      ntStatistics = {},
      adStatistics = {},
      atStatistics = {},
      partColumns = [],
      partDataSource = [],
      overviewColumns = [],
      overviewDataSource = []
    } = this.state
    let {
      lastMonthDerogationAmount = 0,
      thisYearDerogationAmount = 0,
      thisYearDerogationRate = 0,
      totalDerogationAmount = 0
    } = rdStatistics
    const {
      number: lastMonthDerogationAmountFormat,
      unit: lastMonthDerogationAmountUnit
    } = formatNumber2(lastMonthDerogationAmount, {
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
    let {
      lastMonthDerogationTask = 0,
      thisYearDerogationTask = 0,
      thisYearDetectionRate = 0
    } = ndStatistics
    lastMonthDerogationTask = toThousands(lastMonthDerogationTask)
    thisYearDerogationTask = toThousands(thisYearDerogationTask)
    thisYearDetectionRate = formatNumber2(thisYearDetectionRate * 100, { precision: 2 })
    let {
      lastMonthTriggerNumber = 0,
      thisYearTriggerNumber = 0,
      thisYearTriggerRate = 0
    } = ntStatistics
    lastMonthTriggerNumber = toThousands(lastMonthTriggerNumber)
    thisYearTriggerNumber = toThousands(thisYearTriggerNumber)
    thisYearTriggerRate = formatNumber2(thisYearTriggerRate * 100, { precision: 2 })
    let {
      lastMonthRuleDetectionAmount = 0,
      thisYearRuleDetectionAmount = 0,
      thisYearAmountDetectionRate = 0
    } = adStatistics
    const {
      number: lastMonthRuleDetectionAmountFormat,
      unit: lastMonthRuleDetectionAmountUnit
    } = formatNumber2(lastMonthRuleDetectionAmount, {
      precision: 2,
      simple: false
    })
    const {
      number: thisYearRuleDetectionAmountFormat,
      unit: thisYearRuleDetectionAmountUnit
    } = formatNumber2(thisYearRuleDetectionAmount, {
      precision: 2,
      simple: false
    })
    thisYearAmountDetectionRate = formatNumber2(thisYearAmountDetectionRate * 100, { precision: 2 })
    let {
      lastMonthRuleTriggerAmount = 0,
      thisYearRuleTriggerAmount = 0,
      thisYearAmountRate = 0
    } = atStatistics
    const {
      number: lastMonthRuleTriggerAmountFormat,
      unit: lastMonthRuleTriggerAmountUnit
    } = formatNumber2(lastMonthRuleTriggerAmount, {
      precision: 2,
      simple: false
    })
    const {
      number: thisYearRuleTriggerAmountFormat,
      unit: thisYearRuleTriggerAmountUnit
    } = formatNumber2(thisYearRuleTriggerAmount, {
      precision: 2,
      simple: false
    })
    thisYearAmountRate = formatNumber2(thisYearAmountRate * 100, { precision: 2 })

    return (<Fragment>
        <Tabs type="card" activeKey={overviewType} className="indicator-page tabs-no-border"
              onChange={this.onTabsTypeChange}>
          <TabPane tab="规则减损贡献度" key="RULE_DEROGATION">
            <div className="indicator-board">
              <div className="indicator-board-title">规则减损贡献度</div>
              <Row>
                <Col span={6}>
                  <div className="title">上月减损金额</div>
                  <div className="sum">
                    <span title={lastMonthDerogationAmountFormat}>{lastMonthDerogationAmountFormat}</span>
                    {lastMonthDerogationAmountUnit}
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
                    <span>{thisYearDerogationRate}</span>%
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
            <div className="view-panel">
              <div className="view-panel-title">
                <span>总览</span>
                <span
                  className={classNames('quick-time', { 'active': overviewRDSelected === 'LAST_12_MONTH' })}
                  onClick={() => this.onChangeMode('LAST_12_MONTH')}
                >
                  过去12个月
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewRDSelected === 'CURRENT_YEAR' })}
                  onClick={() => this.onChangeMode('CURRENT_YEAR')}
                >
                  本年度
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewRDSelected === 'BY_YEAR' })}
                  onClick={() => this.onChangeMode('BY_YEAR')}
                >
                  按年
                </span>
                {
                  overviewRDSelected === 'BY_YEAR' &&
                  <Select placeholder="年份" size="small" value={overviewRDYear} style={{ width: 80 }}
                          onChange={this.onChangeYear}
                          getPopupContainer={triggerNode => triggerNode.parentNode}>
                    {
                      overviewRDYears.map(year => {
                        return <Option key={year} value={year} title={year}>{year}</Option>
                      })
                    }
                  </Select>
                }
                <span className="fr">单位: 万元</span>
              </div>
              <Table className="table-layout-fixed" columns={overviewColumns}
                     dataSource={overviewDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <div className="overview-chart" ref={this.overviewChartRefRD} />
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>保司分览</span>
                <RangeMonthPicker size="small" value={[startTimeRD, endTimeRD]} onPanelChange={this.onPanelChange}
                                  getCalendarContainer={triggerNode => triggerNode.parentNode} />
                <Button type="primary" size="small" onClick={this.loadIndicatorMonitorCompanyOverview}>查询</Button>
                <span className="fr">单位: 万元</span>
              </div>
              <Table className="table-layout-fixed" columns={partColumns}
                     dataSource={partDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <Row className="mt20" gutter={48}>
                <Col span={12}>
                  <div className="part-chart" ref={this.partChartRefRD} />
                </Col>
                <Col span={12}>
                  <div className="part-pie" ref={this.partPieRefRD} />
                </Col>
              </Row>
            </div>
          </TabPane>
          <TabPane tab="件数检出率" key="NUMBER_DETECTION">
            <div className="indicator-board">
              <div className="indicator-board-title">件数检出率</div>
              <Row>
                <Col span={8}>
                  <div className="title">上月规则核减任务流数</div>
                  <div className="sum">
                    <span title={lastMonthDerogationTask}>{lastMonthDerogationTask}</span>件
                  </div>
                </Col>
                <Col span={8}>
                  <div className="title">本年规则核减任务流数</div>
                  <div className="sum">
                    <span title={thisYearDerogationTask}>{thisYearDerogationTask}</span>件
                  </div>
                </Col>
                <Col span={8}>
                  <div className="title">本年件数检出率</div>
                  <div className="sum">
                    <span>{thisYearDetectionRate}</span>%
                  </div>
                </Col>
              </Row>
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>总览</span>
                <span
                  className={classNames('quick-time', { 'active': overviewNDSelected === 'LAST_12_MONTH' })}
                  onClick={() => this.onChangeMode('LAST_12_MONTH')}
                >
                  过去12个月
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewNDSelected === 'CURRENT_YEAR' })}
                  onClick={() => this.onChangeMode('CURRENT_YEAR')}
                >
                  本年度
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewNDSelected === 'BY_YEAR' })}
                  onClick={() => this.onChangeMode('BY_YEAR')}
                >
                  按年
                </span>
                {
                  overviewNDSelected === 'BY_YEAR' &&
                  <Select placeholder="年份" size="small" value={overviewNDYear} style={{ width: 80 }}
                          onChange={this.onChangeYear}
                          getPopupContainer={triggerNode => triggerNode.parentNode}>
                    {
                      overviewNDYears.map(year => {
                        return <Option key={year} value={year} title={year}>{year}</Option>
                      })
                    }
                  </Select>
                }
                <span className="fr">单位: 件</span>
              </div>
              <Table className="table-layout-fixed" columns={overviewColumns}
                     dataSource={overviewDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <div className="overview-chart" ref={this.overviewChartRefND} />
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>保司分览</span>
                <RangeMonthPicker size="small" value={[startTimeND, endTimeND]} onPanelChange={this.onPanelChange}
                                  getCalendarContainer={triggerNode => triggerNode.parentNode} />
                <Button type="primary" size="small" onClick={this.loadIndicatorMonitorCompanyOverview}>查询</Button>
                <span className="fr">单位: 件</span>
              </div>
              <Table className="table-layout-fixed" columns={partColumns}
                     dataSource={partDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <Row className="mt20" gutter={48}>
                <Col span={12}>
                  <div className="part-chart" ref={this.partChartRefND} />
                </Col>
                <Col span={12}>
                  <div className="part-pie" ref={this.partPieRefND} />
                </Col>
              </Row>
            </div>
          </TabPane>
          <TabPane tab="件数触发率" key="NUMBER_TRIGGER">
            <div className="indicator-board">
              <div className="indicator-board-title">件数触发率</div>
              <Row>
                <Col span={8}>
                  <div className="title">上月触发规则的任务流数</div>
                  <div className="sum">
                    <span title={lastMonthTriggerNumber}>{lastMonthTriggerNumber}</span>件
                  </div>
                </Col>
                <Col span={8}>
                  <div className="title">本年触发规则的任务流数</div>
                  <div className="sum">
                    <span title={thisYearTriggerNumber}>{thisYearTriggerNumber}</span>件
                  </div>
                </Col>
                <Col span={8}>
                  <div className="title">本年件数触发率</div>
                  <div className="sum">
                    <span>{thisYearTriggerRate}</span>%
                  </div>
                </Col>
              </Row>
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>总览</span>
                <span
                  className={classNames('quick-time', { 'active': overviewNTSelected === 'LAST_12_MONTH' })}
                  onClick={() => this.onChangeMode('LAST_12_MONTH')}
                >
                  过去12个月
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewNTSelected === 'CURRENT_YEAR' })}
                  onClick={() => this.onChangeMode('CURRENT_YEAR')}
                >
                  本年度
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewNTSelected === 'BY_YEAR' })}
                  onClick={() => this.onChangeMode('BY_YEAR')}
                >
                  按年
                </span>
                {
                  overviewNTSelected === 'BY_YEAR' &&
                  <Select placeholder="年份" size="small" value={overviewNTYear} style={{ width: 80 }}
                          onChange={this.onChangeYear}
                          getPopupContainer={triggerNode => triggerNode.parentNode}>
                    {
                      overviewNTYears.map(year => {
                        return <Option key={year} value={year} title={year}>{year}</Option>
                      })
                    }
                  </Select>
                }
                <span className="fr">单位: 件</span>
              </div>
              <Table className="table-layout-fixed" columns={overviewColumns}
                     dataSource={overviewDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <div className="overview-chart" ref={this.overviewChartRefNT} />
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>保司分览</span>
                <RangeMonthPicker size="small" value={[startTimeNT, endTimeNT]} onPanelChange={this.onPanelChange}
                                  getCalendarContainer={triggerNode => triggerNode.parentNode} />
                <Button type="primary" size="small" onClick={this.loadIndicatorMonitorCompanyOverview}>查询</Button>
                <span className="fr">单位: 件</span>
              </div>
              <Table className="table-layout-fixed" columns={partColumns}
                     dataSource={partDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <Row className="mt20" gutter={48}>
                <Col span={12}>
                  <div className="part-chart" ref={this.partChartRefNT} />
                </Col>
                <Col span={12}>
                  <div className="part-pie" ref={this.partPieRefNT} />
                </Col>
              </Row>
            </div>
          </TabPane>
          <TabPane tab="金额检出率" key="AMOUNT_DETECTION">
            <div className="indicator-board">
              <div className="indicator-board-title">金额检出率</div>
              <Row>
                <Col span={8}>
                  <div className="title">上月触发规则核减金额</div>
                  <div className="sum">
                    <span title={lastMonthRuleDetectionAmountFormat}>{lastMonthRuleDetectionAmountFormat}</span>
                    {lastMonthRuleDetectionAmountUnit}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="title">本年触发规则核减金额</div>
                  <div className="sum">
                    <span title={thisYearRuleDetectionAmountFormat}>{thisYearRuleDetectionAmountFormat}</span>
                    {thisYearRuleDetectionAmountUnit}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="title">本年金额检出率</div>
                  <div className="sum">
                    <span>{thisYearAmountDetectionRate}</span>%
                  </div>
                </Col>
              </Row>
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>总览</span>
                <span
                  className={classNames('quick-time', { 'active': overviewADSelected === 'LAST_12_MONTH' })}
                  onClick={() => this.onChangeMode('LAST_12_MONTH')}
                >
                  过去12个月
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewADSelected === 'CURRENT_YEAR' })}
                  onClick={() => this.onChangeMode('CURRENT_YEAR')}
                >
                  本年度
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewADSelected === 'BY_YEAR' })}
                  onClick={() => this.onChangeMode('BY_YEAR')}
                >
                  按年
                </span>
                {
                  overviewADSelected === 'BY_YEAR' &&
                  <Select placeholder="年份" size="small" value={overviewADYear} style={{ width: 80 }}
                          onChange={this.onChangeYear}
                          getPopupContainer={triggerNode => triggerNode.parentNode}>
                    {
                      overviewADYears.map(year => {
                        return <Option key={year} value={year} title={year}>{year}</Option>
                      })
                    }
                  </Select>
                }
                <span className="fr">单位: 万元</span>
              </div>
              <Table className="table-layout-fixed" columns={overviewColumns}
                     dataSource={overviewDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <div className="overview-chart" ref={this.overviewChartRefAD} />
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>保司分览</span>
                <RangeMonthPicker size="small" value={[startTimeAD, endTimeAD]} onPanelChange={this.onPanelChange}
                                  getCalendarContainer={triggerNode => triggerNode.parentNode} />
                <Button type="primary" size="small" onClick={this.loadIndicatorMonitorCompanyOverview}>查询</Button>
                <span className="fr">单位: 万元</span>
              </div>
              <Table className="table-layout-fixed" columns={partColumns}
                     dataSource={partDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <Row className="mt20" gutter={48}>
                <Col span={12}>
                  <div className="part-chart" ref={this.partChartRefAD} />
                </Col>
                <Col span={12}>
                  <div className="part-pie" ref={this.partPieRefAD} />
                </Col>
              </Row>
            </div>
          </TabPane>
          <TabPane tab="金额触发率" key="AMOUNT_TRIGGER">
            <div className="indicator-board">
              <div className="indicator-board-title">金额触发率</div>
              <Row>
                <Col span={8}>
                  <div className="title">上月触发规则总金额</div>
                  <div className="sum">
                    <span title={lastMonthRuleTriggerAmountFormat}>{lastMonthRuleTriggerAmountFormat}</span>
                    {lastMonthRuleTriggerAmountUnit}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="title">本年触发规则总金额</div>
                  <div className="sum">
                    <span title={thisYearRuleTriggerAmountFormat}>{thisYearRuleTriggerAmountFormat}</span>
                    {thisYearRuleTriggerAmountUnit}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="title">本年金额触发率</div>
                  <div className="sum">
                    <span>{thisYearAmountRate}</span>%
                  </div>
                </Col>
              </Row>
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>总览</span>
                <span
                  className={classNames('quick-time', { 'active': overviewATSelected === 'LAST_12_MONTH' })}
                  onClick={() => this.onChangeMode('LAST_12_MONTH')}
                >
                  过去12个月
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewATSelected === 'CURRENT_YEAR' })}
                  onClick={() => this.onChangeMode('CURRENT_YEAR')}
                >
                  本年度
                </span>
                <span
                  className={classNames('quick-time', { 'active': overviewATSelected === 'BY_YEAR' })}
                  onClick={() => this.onChangeMode('BY_YEAR')}
                >
                  按年
                </span>
                {
                  overviewATSelected === 'BY_YEAR' &&
                  <Select placeholder="年份" size="small" value={overviewATYear} style={{ width: 80 }}
                          onChange={this.onChangeYear}
                          getPopupContainer={triggerNode => triggerNode.parentNode}>
                    {
                      overviewATYears.map(year => {
                        return <Option key={year} value={year} title={year}>{year}</Option>
                      })
                    }
                  </Select>
                }
                <span className="fr">单位: 万元</span>
              </div>
              <Table className="table-layout-fixed" columns={overviewColumns}
                     dataSource={overviewDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <div className="overview-chart" ref={this.overviewChartRefAT} />
            </div>
            <div className="view-panel">
              <div className="view-panel-title">
                <span>保司分览</span>
                <RangeMonthPicker size="small" value={[startTimeAT, endTimeAT]} onPanelChange={this.onPanelChange}
                                  getCalendarContainer={triggerNode => triggerNode.parentNode} />
                <Button type="primary" size="small" onClick={this.loadIndicatorMonitorCompanyOverview}>查询</Button>
                <span className="fr">单位: 万元</span>
              </div>
              <Table className="table-layout-fixed" columns={partColumns}
                     dataSource={partDataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
              <Row className="mt20" gutter={48}>
                <Col span={12}>
                  <div className="part-chart" ref={this.partChartRefAT} />
                </Col>
                <Col span={12}>
                  <div className="part-pie" ref={this.partPieRefAT} />
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Fragment>
    )
  }

  onChangeYear = (year) => {
    const { overviewType } = this.state
    switch (overviewType) {
      case 'RULE_DEROGATION':
        this.setState({ overviewRDYear: year }, this.loadIndicatorMonitorIndicatorOverview)
        break
      case 'NUMBER_DETECTION':
        this.setState({ overviewNDYear: year }, this.loadIndicatorMonitorIndicatorOverview)
        break
      case 'NUMBER_TRIGGER':
        this.setState({ overviewNTYear: year }, this.loadIndicatorMonitorIndicatorOverview)
        break
      case 'AMOUNT_DETECTION':
        this.setState({ overviewADYear: year }, this.loadIndicatorMonitorIndicatorOverview)
        break
      case 'AMOUNT_TRIGGER':
        this.setState({ overviewATYear: year }, this.loadIndicatorMonitorIndicatorOverview)
        break
    }
  }

  onChangeMode = (overviewSelected) => {
    const { overviewType } = this.state
    let overviewSelectedKey = ''
    switch (overviewType) {
      case 'RULE_DEROGATION':
        overviewSelectedKey = 'overviewRDSelected'
        break
      case 'NUMBER_DETECTION':
        overviewSelectedKey = 'overviewNDSelected'
        break
      case 'NUMBER_TRIGGER':
        overviewSelectedKey = 'overviewNTSelected'
        break
      case 'AMOUNT_DETECTION':
        overviewSelectedKey = 'overviewADSelected'
        break
      case 'AMOUNT_TRIGGER':
        overviewSelectedKey = 'overviewATSelected'
        break
    }
    this.setState({ [overviewSelectedKey]: overviewSelected }, () => {
      if (overviewSelected === 'BY_YEAR') {
        fetchIndicatorMonitorYearsFromSql({ indicatorType: overviewType }).then((data) => {
          const { content = [] } = data
          let yearsKey = ''
          let yearKey = ''
          switch (overviewType) {
            case 'RULE_DEROGATION':
              yearsKey = 'overviewRDYears'
              yearKey = 'overviewRDYear'
              break
            case 'NUMBER_DETECTION':
              yearsKey = 'overviewNDYears'
              yearKey = 'overviewNDYear'
              break
            case 'NUMBER_TRIGGER':
              yearsKey = 'overviewNTYears'
              yearKey = 'overviewNTYear'
              break
            case 'AMOUNT_DETECTION':
              yearsKey = 'overviewADYears'
              yearKey = 'overviewADYear'
              break
            case 'AMOUNT_TRIGGER':
              yearsKey = 'overviewATYears'
              yearKey = 'overviewATYear'
              break
          }
          this.setState({ [yearsKey]: content, [yearKey]: content[0] }, () => {
            content[0] && this.loadIndicatorMonitorIndicatorOverview()
          })
        }).catch((data) => {
          notification.warning(data.content)
        })
      } else {
        this.loadIndicatorMonitorIndicatorOverview()
      }
    })
  }

  loadOverviewStatistics = () => {
    const { overviewType } = this.state
    switch (overviewType) {
      case 'RULE_DEROGATION':
        fetchIndicatorMonitorRuleDerogationTotal().then((data) => {
          const { content: rdStatistics = {} } = data
          this.setState({ rdStatistics })
        }).catch((data) => {
          notification.warning(data.content)
        })
        break
      case 'NUMBER_DETECTION':
        fetchIndicatorMonitorNumberDetectionTotal().then((data) => {
          const { content: ndStatistics = {} } = data
          this.setState({ ndStatistics })
        }).catch((data) => {
          notification.warning(data.content)
        })
        break
      case 'NUMBER_TRIGGER':
        fetchIndicatorMonitorNumberOfTriggerTotal().then((data) => {
          const { content: ntStatistics = {} } = data
          this.setState({ ntStatistics })
        }).catch((data) => {
          notification.warning(data.content)
        })
        break
      case 'AMOUNT_DETECTION':
        fetchIndicatorMonitorAmountOfDetectionTotal().then((data) => {
          const { content: adStatistics = {} } = data
          this.setState({ adStatistics })
        }).catch((data) => {
          notification.warning(data.content)
        })
        break
      case 'AMOUNT_TRIGGER':
        fetchIndicatorMonitorAmountOfTriggerTotal().then((data) => {
          const { content: atStatistics = {} } = data
          this.setState({ atStatistics })
        }).catch((data) => {
          notification.warning(data.content)
        })
        break
    }
  }

  loadIndicatorMonitorIndicatorOverview = () => {
    const { overviewType } = this.state
    let overviewSelectedKey = ''
    switch (overviewType) {
      case 'RULE_DEROGATION':
        overviewSelectedKey = 'overviewRDSelected'
        break
      case 'NUMBER_DETECTION':
        overviewSelectedKey = 'overviewNDSelected'
        break
      case 'NUMBER_TRIGGER':
        overviewSelectedKey = 'overviewNTSelected'
        break
      case 'AMOUNT_DETECTION':
        overviewSelectedKey = 'overviewADSelected'
        break
      case 'AMOUNT_TRIGGER':
        overviewSelectedKey = 'overviewATSelected'
        break
    }
    let overviewData = { indicatorType: overviewType }
    switch (this.state[overviewSelectedKey]) {
      case 'LAST_12_MONTH':
        overviewData = {
          ...overviewData,
          startMonth: moment().subtract(12, 'months').format('YYYY-MM'),
          endMonth: moment().subtract(1, 'months').format('YYYY-MM')
        }
        break
      case 'CURRENT_YEAR':
        overviewData = {
          ...overviewData,
          startMonth: moment().format('YYYY-01'),
          endMonth: moment().format('YYYY-12')
        }
        break
      case 'BY_YEAR':
        let yearKey = ''
        switch (overviewType) {
          case 'RULE_DEROGATION':
            yearKey = 'overviewRDYear'
            break
          case 'NUMBER_DETECTION':
            yearKey = 'overviewNDYear'
            break
          case 'NUMBER_TRIGGER':
            yearKey = 'overviewNTYear'
            break
          case 'AMOUNT_DETECTION':
            yearKey = 'overviewADYear'
            break
          case 'AMOUNT_TRIGGER':
            yearKey = 'overviewATYear'
            break
        }
        overviewData = {
          ...overviewData,
          startMonth: `${this.state[yearKey]}-01`,
          endMonth: `${this.state[yearKey]}-12`
        }
        break
    }
    let overviewColumns = [
      {
        title: <Fragment>&nbsp;</Fragment>,
        dataIndex: 'name',
        key: 'name',
        width: ['NUMBER_DETECTION', 'NUMBER_TRIGGER', 'AMOUNT_TRIGGER'].includes(overviewType) ? 165 : 150,
        onCell: (record) => {
          return { title: record.name }
        }
      }]
    let rates = []
    let amounts1 = []
    let amounts2 = []
    let legendData = ['减损总金额', '累计减损总金额', '减损贡献度']
    let xAxisData = []
    let indicatorMaps = []
    let overviewDataSource = []
    let overviewChart = null
    switch (overviewType) {
      case 'RULE_DEROGATION':
        overviewChart = echarts.init(this.overviewChartRefRD.current)
        indicatorMaps = ['减损总金额', '累计减损总金额', '上报项目总金额', '减损贡献度']
        overviewDataSource = indicatorMaps.map(name => {
          return { key: `OVERVIEW_${name}`, name }
        })
        break
      case 'NUMBER_DETECTION':
        overviewChart = echarts.init(this.overviewChartRefND.current)
        legendData = ['核减任务流总量', '核减累计任务流', '件数检出率']
        indicatorMaps = ['核减任务流总量', '累计核减任务流总量', '触发任务流总量', '件数检出率']
        overviewDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        break
      case 'NUMBER_TRIGGER':
        overviewChart = echarts.init(this.overviewChartRefNT.current)
        legendData = ['触发任务流总量', '累计触发任务流总量', '件数触发率']
        indicatorMaps = ['触发任务流总量', '累计触发任务流总量', '调用任务流总量', '件数触发率']
        overviewDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        break
      case 'AMOUNT_DETECTION':
        overviewChart = echarts.init(this.overviewChartRefAD.current)
        legendData = ['减损总金额', '累计减损总金额', '金额检出率']
        indicatorMaps = ['减损总金额', '累计减损总金额', '触发规则总金额', '金额检出率']
        overviewDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        break
      case 'AMOUNT_TRIGGER':
        overviewChart = echarts.init(this.overviewChartRefAT.current)
        legendData = ['触发规则总金额', '累计触发规则总金额', '金额触发率']
        indicatorMaps = ['触发规则总金额', '累计触发规则总金额', '上报项目总金额', '金额触发率']
        overviewDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        break
    }
    fetchIndicatorMonitorIndicatorOverview(overviewData).then((data) => {
      const { content = [] } = data
      content.forEach(item => {
        const { month, monthIndicatorMap = {} } = item
        xAxisData = [...xAxisData, month]
        overviewColumns = [...overviewColumns, {
          title: month,
          dataIndex: month,
          key: month,
          onCell: (record) => {
            return { title: record[month] }
          }
        }]
        indicatorMaps.forEach((item, index) => {
          let value = monthIndicatorMap[item]
          switch (overviewType) {
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
                      amounts1 = [...amounts1, value]
                      break
                    case '累计减损总金额':
                      amounts2 = [...amounts2, value]
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
                      amounts1 = [...amounts1, value]
                      break
                    case '累计核减任务流总量':
                      amounts2 = [...amounts2, value]
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
                      amounts1 = [...amounts1, value]
                      break
                    case '累计触发任务流总量':
                      amounts2 = [...amounts2, value]
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
                      amounts1 = [...amounts1, value]
                      break
                    case '累计减损总金额':
                      amounts2 = [...amounts2, value]
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
                      amounts1 = [...amounts1, value]
                      break
                    case '累计触发规则总金额':
                      amounts2 = [...amounts2, value]
                      break
                  }
                  value = toThousands(value)
              }
              break
          }
          const row = overviewDataSource[index]
          overviewDataSource[index] = { ...row, [month]: value }
        })
      })
      overviewChart.setOption(this._buildTwoBarLineOption({
        xAxisData,
        legendData,
        amounts1,
        amounts2,
        rates
      }))
      overviewChart.resize()
      this.setState({ overviewColumns, overviewDataSource })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  loadIndicatorMonitorCompanyOverview = () => {
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
      endTimeAT,
      overviewType
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
    const data = {
      startMonth,
      endMonth,
      indicatorType: overviewType
    }
    let partColumns = [
      {
        title: <Fragment>&nbsp;</Fragment>,
        dataIndex: 'name',
        key: 'name',
        width: 150,
        onCell: (record) => {
          return { title: record.name }
        }
      }]
    let partDataSource = []
    let legendData = []
    let pieTitle = ''
    let indicatorMaps = []
    let partChart = null
    let partPie = null
    switch (overviewType) {
      case 'RULE_DEROGATION':
        partChart = echarts.init(this.partChartRefRD.current)
        partPie = echarts.init(this.partPieRefRD.current)
        indicatorMaps = ['减损总金额', '上报项目总金额', '减损贡献度']
        partDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        legendData = ['减损总金额', '减损贡献度']
        pieTitle = '减损总金额'
        break
      case 'NUMBER_DETECTION':
        partChart = echarts.init(this.partChartRefND.current)
        partPie = echarts.init(this.partPieRefND.current)
        indicatorMaps = ['核减任务流总量', '触发任务流总量', '件数检出率']
        partDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        legendData = ['核减任务流总量', '件数检出率']
        pieTitle = '核减任务流总量'
        break
      case 'NUMBER_TRIGGER':
        partChart = echarts.init(this.partChartRefNT.current)
        partPie = echarts.init(this.partPieRefNT.current)
        indicatorMaps = ['触发任务流总量', '调用任务流总量', '件数触发率']
        partDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        legendData = ['触发任务流总量', '件数触发率']
        pieTitle = '触发任务流总量'
        break
      case 'AMOUNT_DETECTION':
        partChart = echarts.init(this.partChartRefAD.current)
        partPie = echarts.init(this.partPieRefAD.current)
        indicatorMaps = ['减损总金额', '触发规则总金额', '金额检出率']
        partDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        legendData = ['减损总金额', '金额检出率']
        pieTitle = '减损总金额'
        break
      case 'AMOUNT_TRIGGER':
        partChart = echarts.init(this.partChartRefAT.current)
        partPie = echarts.init(this.partPieRefAT.current)
        indicatorMaps = ['触发规则总金额', '上报项目总金额', '金额触发率']
        partDataSource = indicatorMaps.map(name => {
          return { key: name, name }
        })
        legendData = ['触发规则总金额', '金额触发率']
        pieTitle = '触发规则总金额'
        break
    }
    let rates = []
    let amounts = []
    let xAxisData = []
    let pieData = []
    fetchIndicatorMonitorCompanyOverview(data).then((data) => {
      const { content = [] } = data
      content.forEach(item => {
        const { companyName, indicatorMap = {} } = item
        xAxisData = [...xAxisData, companyName]
        partColumns = [...partColumns, {
          title: companyName,
          dataIndex: companyName,
          key: companyName,
          onCell: (record) => {
            return { title: record[companyName] }
          }
        }]
        indicatorMaps.forEach((item, index) => {
          let value = indicatorMap[item]
          switch (item) {
            case '减损贡献度':
            case '件数检出率':
            case '件数触发率':
            case '金额检出率':
            case '金额触发率':
              const rate = formatNumber2(value * 100, { precision: 2 })
              rates = [...rates, Number.parseFloat(rate)]
              value = `${rate}%`
              break
            case '触发规则总金额':
              value = Math.round(value / (10000 / 100)) / 100
              if (overviewType === 'AMOUNT_TRIGGER') {
                amounts = [...amounts, value]
                pieData = [...pieData, { name: companyName, value }]
              }
              value = toThousands(value)
              break
            case '减损总金额':
              value = Math.round(value / (10000 / 100)) / 100
              amounts = [...amounts, value]
              pieData = [...pieData, { name: companyName, value }]
              value = toThousands(value)
              break
            case '核减任务流总量':
              amounts = [...amounts, value]
              pieData = [...pieData, { name: companyName, value }]
              value = toThousands(value)
              break
            case '调用任务流总量':
              value = toThousands(value)
              break
            case '触发任务流总量':
              if (overviewType === 'NUMBER_TRIGGER') {
                amounts = [...amounts, value]
                pieData = [...pieData, { name: companyName, value }]
              }
              value = toThousands(value)
              break
            default:
              value = Math.round(value / (10000 / 100)) / 100
              value = toThousands(value)
          }
          const row = partDataSource[index]
          partDataSource[index] = { ...row, [companyName]: value }
        })
      })
      partChart.setOption(this._buildBarLineOption({ xAxisData, legendData, amounts, rates }))
      partChart.resize()
      const option = {
        color: ['#5de6c7', '#ffd977', '#3dbffc', '#ff9483', '#cccbff', '#ffcc00', '#8ae381', '#e1dd86', '#5bc3e9', '#caa0a5', '#d4c5ee', '#edcc5b'],
        title: {
          top: 30,
          text: pieTitle,
          left: 'center'
        },
        tooltip: {
          trigger: 'item'
        },
        grid: {
          containLabel: true,
          top: 30,
          left: 30,
          right: 30
        },
        legend: {
          type: 'scroll',
          bottom: 10,
          data: xAxisData
        },
        series: [
          {
            name: pieTitle,
            type: 'pie',
            radius: ['40%', '60%'],
            label: {
              formatter: '{d}%'
            },
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      }
      partPie.setOption(option)
      partPie.resize()
      console.log('partDataSource', option, partDataSource, xAxisData, legendData, amounts, rates)
      this.setState({ partColumns, partDataSource })
    }).catch((data) => {
      notification.warning(data.content)
    })
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

  _buildTwoBarLineOption = ({ xAxisData, legendData, amounts1, amounts2, rates }) => {
    return {
      color: ['#1c9577', '#efc300', '#ed7d31'],
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
          data: amounts1
        },
        {
          name: legendData[1],
          type: 'bar',
          barMaxWidth: 100,
          data: amounts2
        },
        {
          name: legendData[2],
          type: 'line',
          yAxisIndex: 1,
          data: rates
        }
      ]
    }
  }

  onTabsTypeChange = (overviewType) => {
    this.setState({ overviewType }, () => {
      this.loadOverviewStatistics()
      this.loadIndicatorMonitorIndicatorOverview()
      this.loadIndicatorMonitorCompanyOverview()
    })
  }

  onPanelChange = (value, mode) => {
    const { overviewType } = this.state
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
}
