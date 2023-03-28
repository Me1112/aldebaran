import React, { Component, createRef } from 'react'
import { Table, notification, Select, Button, DatePicker, InputNumber, Pagination } from 'antd'
import moment from 'moment'
import { toThousands } from '@util'
import { fetchCaseDetail } from '@action/fraud'
import '../../index.less'
import './index.less'

const { Option } = Select
const { RangePicker } = DatePicker

function buildColumn(option = {}) {
  const { children: title, ...other } = option
  if (title) {
    return { children: [{ ...other, title }] }
  }
  return other
}

export default class AntiFraudOverview extends Component {
  state = {
    startTimeOpen: false,
    endTimeOpen: false,
    statisticsTotal: {},
    rangeTime: [moment(), moment()],
    dataSource: [],
    cases: [],
    reportCompareChar: 'LESS_THAN',
    surveyCompareChar: 'LESS_THAN',
    lookType: 'LESS_THAN',
    ruleCompareChar: 'LESS_THAN',
    pagination: {
      pageSize: 50,
      showSizeChanger: false,
      showTotal: (total) => `共 ${total} 条`
    }
  }
  paginationRef = createRef()
  tableWrapper = createRef()
  pageWrapper = createRef()
  conditionWrapper = createRef()

  componentDidMount() {
    window.addEventListener('resize', this.ff)
    if (this.pageWrapper.current) {
      const { height: pageWrapperHeight } = this.pageWrapper.current.getBoundingClientRect()
      const { height: conditionWrapperHeight } = this.conditionWrapper.current.getBoundingClientRect()
      this.setState({ caseWrapperHeight: pageWrapperHeight - conditionWrapperHeight - 60 }, this.loadCaseDetail)
    }
  }

  componentDidUpdate() {
    if (this.tableWrapper.current) {
      const { height } = this.tableWrapper.current.getBoundingClientRect()
      this.paginationRef.current.style.top = `${height + 80}px`
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.ff)
  }

  render() {
    const {
      dataSource,
      rangeTime,
      reportCompareChar,
      reportScore,
      surveyCompareChar,
      surveyScore,
      ruleCompareChar,
      ruleScore,
      aiRiskFlag,
      ruleRiskFlag,
      communityRiskFlag,
      pagination,
      fraudDetailStatistic = {},
      caseWrapperHeight = 0
    } = this.state
    const {
      aiRiskNumber,
      caseNumber,
      detectionAmountTotal,
      determinationAINumber,
      examNumber,
      humanExamNumber,
      isFraudNumber,
      maxScoreNumber,
      reportAINumber,
      ruleRiskNumber,
      snsRiskNumber,
      surveyAINumber
    } = fraudDetailStatistic
    const hasData = dataSource.length > 0
    const columns = [
      {
        title: '序号',
        ...buildColumn({ children: hasData ? '统计数据' : undefined, dataIndex: 'index', width: 90 })
      },
      {
        title: '报案号',
        ...buildColumn({
          children: hasData ? (caseNumber ? `${caseNumber}件` : ' ') : undefined,
          dataIndex: 'caseNo',
          width: 220
        })
      },
      {
        title: '车牌号',
        ...buildColumn({
          children: hasData ? ' ' : undefined,
          dataIndex: 'licensePlate',
          width: 110
        })
      },
      {
        title: '流入风控平台时间',
        ...buildColumn({
          children: hasData ? ' ' : undefined,
          dataIndex: 'enterTime',
          width: 220
        })
      },
      {
        title: '报案AI评分',
        ...buildColumn({
          children: hasData ? (reportAINumber ? `${reportAINumber}件` : ' ') : undefined,
          dataIndex: 'reportScore',
          width: 110
        })
      },
      {
        title: '查勘AI评分',
        ...buildColumn({
          children: hasData ? (surveyAINumber ? `${surveyAINumber}件` : ' ') : undefined,
          dataIndex: 'surveyScore',
          width: 110
        })
      },
      {
        title: '定损AI评分',
        ...buildColumn({
          children: hasData ? (determinationAINumber ? `${determinationAINumber}件` : ' ') : undefined,
          dataIndex: 'determinationScore',
          width: 110
        })
      },
      {
        title: '规则评分',
        ...buildColumn({
          children: hasData ? (maxScoreNumber ? `${maxScoreNumber}件` : ' ') : undefined,
          dataIndex: 'maxScore',
          width: 110
        })
      },
      {
        title: 'AI风险标识',
        ...buildColumn({
          children: hasData ? (aiRiskNumber ? `${aiRiskNumber}件` : ' ') : undefined,
          dataIndex: 'aiRiskFlag',
          width: 110
        })
      },
      {
        title: '规则风险标识',
        ...buildColumn({
          children: hasData ? (ruleRiskNumber ? `${ruleRiskNumber}件` : ' ') : undefined,
          dataIndex: 'ruleRiskFlag',
          width: 120
        })
      },
      {
        title: '社群风险标识',
        ...buildColumn({
          children: hasData ? (snsRiskNumber ? `${snsRiskNumber}件` : ' ') : undefined,
          dataIndex: 'snsRiskFlag',
          width: 120
        })
      },
      {
        title: '手工提调标识',
        ...buildColumn({
          children: hasData ? (humanExamNumber ? `${humanExamNumber}件` : ' ') : undefined,
          dataIndex: 'humanExamFlag',
          width: 120
        })
      },
      {
        title: '提调标识',
        ...buildColumn({
          children: hasData ? (examNumber ? `${examNumber}件` : ' ') : undefined,
          dataIndex: 'examFlag',
          width: 90
        })
      },
      {
        title: '提调时间',
        ...buildColumn({
          children: hasData ? ' ' : undefined,
          dataIndex: 'examTime',
          width: 220
        })
      },
      {
        title: '是否欺诈',
        ...buildColumn({
          children: hasData ? (isFraudNumber ? `${isFraudNumber}件` : ' ') : undefined,
          dataIndex: 'isFraud',
          width: 90
        })
      },
      {
        title: '减损金额（元）',
        ...buildColumn({
          children: hasData ? toThousands(detectionAmountTotal) : undefined,
          dataIndex: 'detectionAmount',
          width: 150
        })
      }]
    // console.log(columns.map(c => c.width).reduce((a, b) => a + b))

    return (<div className="indicator-page m20 overflow hidden" ref={this.pageWrapper}>
        <div className="zs-title">风险案件明细表</div>
        <div className="view-panel" ref={this.conditionWrapper}>
          <div className="view-panel-title no-border">
            <span className="label">统计区间：</span>
            <RangePicker allowClear={false} value={rangeTime} size="small" onChange={this.handleChangeTime} />
          </div>
          <div className="view-panel-title no-border nh mb0">
            <span className="label">报案AI评分：</span>
            <Select className="mr10" size="small" placeholder="常用统计周期" allowClear={false} style={{ width: 88 }}
                    value={reportCompareChar} onChange={(e) => this.changeSelectOrInput('reportCompareChar', e)}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="LESS_THAN">小于</Option>
              <Option value="LESS_EQUALS_THAN">小于等于</Option>
              <Option value="GREATER_THAN">大于</Option>
              <Option value="GREATER_EQUALS_THAN">大于等于</Option>
            </Select>
            <InputNumber value={reportScore} size="small" placeholder="请输入分数" precision={2} style={{ width: 90 }}
                         min={-99999999.99} max={99999999.99}
                         onChange={(e) => this.changeSelectOrInput('reportScore', e)} />
            <span className="label">查勘AI评分：</span>
            <Select className="mr10" size="small" placeholder="常用统计周期" allowClear={false} style={{ width: 88 }}
                    value={surveyCompareChar} onChange={(e) => this.changeSelectOrInput('surveyCompareChar', e)}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="LESS_THAN">小于</Option>
              <Option value="LESS_EQUALS_THAN">小于等于</Option>
              <Option value="GREATER_THAN">大于</Option>
              <Option value="GREATER_EQUALS_THAN">大于等于</Option>
            </Select>
            <InputNumber value={surveyScore} size="small" placeholder="请输入分数" precision={2} style={{ width: 90 }}
                         min={-99999999.99} max={99999999.99}
                         onChange={(e) => this.changeSelectOrInput('surveyScore', e)} />
            <span className="label">规则评分：</span>
            <Select className="mr10" size="small" placeholder="常用统计周期" allowClear={false} style={{ width: 88 }}
                    value={ruleCompareChar} onChange={(e) => this.changeSelectOrInput('ruleCompareChar', e)}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="LESS_THAN">小于</Option>
              <Option value="LESS_EQUALS_THAN">小于等于</Option>
              <Option value="GREATER_THAN">大于</Option>
              <Option value="GREATER_EQUALS_THAN">大于等于</Option>
            </Select>
            <InputNumber value={ruleScore} size="small" placeholder="请输入分数" precision={2} style={{ width: 90 }}
                         min={-99999999.99} max={99999999.99}
                         onChange={(e) => this.changeSelectOrInput('ruleScore', e)} />
          </div>
          <div className="view-panel-title no-border mb0">
            <span className="label">AI风险标识：</span>
            <Select className="mr20" size="small" placeholder="请选择" allowClear style={{ width: 88 }}
                    value={aiRiskFlag} onChange={(e) => this.changeSelectOrInput('aiRiskFlag', e)}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="YES">是</Option>
              <Option value="NO">否</Option>
            </Select>
            <span className="label">规则风险标识：</span>
            <Select className="mr20" size="small" placeholder="请选择" allowClear style={{ width: 88 }}
                    value={ruleRiskFlag} onChange={(e) => this.changeSelectOrInput('ruleRiskFlag', e)}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="YES">是</Option>
              <Option value="NO">否</Option>
            </Select>
            <span className="label">社群风险标识：</span>
            <Select size="small" placeholder="请选择" allowClear style={{ width: 88 }}
                    value={communityRiskFlag} onChange={(e) => this.changeSelectOrInput('communityRiskFlag', e)}
                    getPopupContainer={triggerNode => triggerNode.parentNode}>
              <Option value="YES">是</Option>
              <Option value="NO">否</Option>
            </Select>
            <Button type="primary" size="small" onClick={this.onQuery}>查询</Button>
          </div>
        </div>
        <div className="view-panel af-case">
          <div className="table-wrapper" ref={this.tableWrapper}>
            <Table columns={columns} scroll={{ y: caseWrapperHeight - 112 - 58, x: 2110 }}
                   dataSource={dataSource} locale={{ emptyText: '暂无数据' }} pagination={false} />
          </div>
          <div className="pagination-wrapper" ref={this.paginationRef}>
            <Pagination {...pagination} onChange={this.handleChange} />
          </div>
        </div>
      </div>
    )
  }

  ff = () => {
    if (this.pageWrapper.current) {
      const { height: pageWrapperHeight } = this.pageWrapper.current.getBoundingClientRect()
      const { height: conditionWrapperHeight } = this.conditionWrapper.current.getBoundingClientRect()
      this.setState({ caseWrapperHeight: pageWrapperHeight - conditionWrapperHeight - 60 })
    }
  }

  handleChange = (current) => {
    const { pagination } = this.state
    this.setState({ pagination: { ...pagination, current } }, () => {
      this.loadCaseDetail(current)
    })
  }

  loadCaseDetail = (page = 1) => {
    const {
      reportCompareChar,
      reportScore,
      surveyCompareChar,
      surveyScore,
      ruleCompareChar,
      ruleScore,
      rangeTime,
      pagination
    } = this.state
    const { pageSize: size } = pagination
    let { aiRiskFlag, ruleRiskFlag, communityRiskFlag } = this.state
    if (aiRiskFlag) {
      aiRiskFlag = aiRiskFlag === 'YES'
    }
    if (ruleRiskFlag) {
      ruleRiskFlag = ruleRiskFlag === 'YES'
    }
    if (communityRiskFlag) {
      communityRiskFlag = communityRiskFlag === 'YES'
    }
    const [startDate, endDate] = rangeTime
    fetchCaseDetail({
      page,
      size,
      reportCompareChar,
      reportScore,
      surveyCompareChar,
      surveyScore,
      ruleCompareChar,
      ruleScore,
      aiRiskFlag,
      ruleRiskFlag,
      communityRiskFlag,
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD')
    }).then(data => {
      const { content: { fraudDetailStatistic = {}, pageList = [], page = 1, total } = {} } = data
      pagination.total = total
      pagination.current = page
      const dataSource = pageList.map((row, index) => {
        return { ...row, key: index + 1, index: (page - 1) * size + index + 1 }
      })
      this.setState({ fraudDetailStatistic, dataSource, pagination }, () => {
        if (this.tableWrapper) {
          this.tableWrapper.current.querySelector('.ant-table-body').scrollTo({ top: 0 })
        }
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  changeSelectOrInput = (type, value) => {
    this.setState({ [type]: value })
  }

  handleChangeTime = (rangeTime) => {
    this.setState({ rangeTime })
  }

  onQuery = () => {
    this.loadCaseDetail()
  }
}
