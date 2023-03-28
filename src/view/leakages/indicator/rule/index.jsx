import React, { Component } from "react";
import {
  Table,
  notification,
  Row,
  Col,
  Select,
  Button,
  Input,
  DatePicker
} from "antd";
import moment from "moment";
import { formatNumber2, toThousands } from "@util";
import {
  fetchCompanyList,
  fetchIndicatorMonitorStatistics,
  fetchIndicatorMonitorRuleIndicatorList
} from "@action/leakage";
import "../index.less";
import "./index.less";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default class IndicatorRule extends Component {
  state = {
    startTimeOpen: false,
    endTimeOpen: false,
    statisticsTotal: {},
    rangeTime: [moment().startOf("month"), moment().endOf("month")],
    dataSource: [],
    companyList: [],
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    },
    completedPagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    }
  };

  componentDidMount() {
    fetchCompanyList()
      .then(data => {
        const { content: companyList = [] } = data;
        this.setState({ companyList });
      })
      .catch(data => {
        if (data.content) {
          notification.warning(data.content);
        }
      });
  }

  render() {
    const {
      dataSource,
      companyList,
      companyId,
      ruleName,
      rangeTime,
      statisticsTotal
    } = this.state;
    let {
      thisMonthTriggerNumber = 0,
      thisYearTriggerNumber = 0,
      totalTriggerNumber = 0,
      lastMonthDetectionNumber = 0,
      thisYearDetectionNumber = 0,
      totalDetectionNumber = 0
    } = statisticsTotal;
    thisMonthTriggerNumber = toThousands(thisMonthTriggerNumber);
    thisYearTriggerNumber = toThousands(thisYearTriggerNumber);
    totalTriggerNumber = toThousands(totalTriggerNumber);
    lastMonthDetectionNumber = toThousands(lastMonthDetectionNumber);
    thisYearDetectionNumber = toThousands(thisYearDetectionNumber);
    totalDetectionNumber = toThousands(totalDetectionNumber);
    const columns = [
      {
        title: "序号",
        width: 60,
        dataIndex: "index"
      },
      {
        title: "风险大类",
        dataIndex: "riskMainName",
        key: "riskMainName",
        width: 140,
        onCell: record => {
          const { riskMainName } = record;
          return { title: riskMainName };
        }
      },
      {
        title: "风险小类",
        dataIndex: "riskName",
        key: "riskName",
        onCell: record => {
          const { riskName } = record;
          return { title: riskName };
        }
      },
      {
        title: "规则名称",
        dataIndex: "ruleName",
        key: "ruleName",
        onCell: record => {
          const { ruleName } = record;
          return { title: ruleName };
        }
      },
      {
        title: "规则触发次数",
        dataIndex: "ruleTriggerNumber",
        key: "ruleTriggerNumber",
        onCell: record => {
          const { ruleTriggerNumber } = record;
          return { title: toThousands(ruleTriggerNumber) };
        },
        render: text => {
          return toThousands(text);
        }
      },
      {
        title: "检出次数",
        dataIndex: "detectionNumber",
        key: "detectionNumber",
        onCell: record => {
          const { detectionNumber } = record;
          return { title: toThousands(detectionNumber) };
        },
        render: text => {
          return toThousands(text);
        }
      },
      {
        title: "检出率",
        dataIndex: "detectionRate",
        key: "detectionRate",
        onCell: record => {
          const { detectionRate } = record;
          const rate = Number.parseFloat(
            formatNumber2(detectionRate * 100, { precision: 2 })
          );
          return { title: `${rate}%` };
        },
        render: (text = 0) => {
          const rate = Number.parseFloat(
            formatNumber2(text * 100, { precision: 2 })
          );
          return `${rate}%`;
        }
      },
      {
        title: "减损金额",
        dataIndex: "derogationAmount",
        key: "derogationAmount",
        onCell: record => {
          const { derogationAmount } = record;
          return { title: toThousands(derogationAmount) };
        },
        render: text => {
          return toThousands(text);
        }
      }
    ];
    const disabled = !companyId;

    return (
      <div className="indicator-page m20">
        <div className="indicator-board">
          <div className="indicator-board-title">规则检测</div>
          <Row>
            <Col span={4}>
              <div className="title">当月规则触发次数</div>
              <div className="sum">
                <span title={thisMonthTriggerNumber}>
                  {thisMonthTriggerNumber}
                </span>
                次
              </div>
            </Col>
            <Col span={4}>
              <div className="title">本年规则触发次数</div>
              <div className="sum">
                <span title={thisYearTriggerNumber}>
                  {thisYearTriggerNumber}
                </span>
                次
              </div>
            </Col>
            <Col span={4}>
              <div className="title">累计规则触发总次数</div>
              <div className="sum">
                <span title={totalTriggerNumber}>{totalTriggerNumber}</span>次
              </div>
            </Col>
            <Col span={4}>
              <div className="title">上月检出次数</div>
              <div className="sum">
                <span title={lastMonthDetectionNumber}>
                  {lastMonthDetectionNumber}
                </span>
                次
              </div>
            </Col>
            <Col span={4}>
              <div className="title">本年检出次数</div>
              <div className="sum">
                <span title={thisYearDetectionNumber}>
                  {thisYearDetectionNumber}
                </span>
                次
              </div>
            </Col>
            <Col span={4}>
              <div className="title">累计检出总次数</div>
              <div className="sum">
                <span title={totalDetectionNumber}>{totalDetectionNumber}</span>
                次
              </div>
            </Col>
          </Row>
        </div>
        <div className="view-panel la-rule">
          <div className="view-panel-title no-border">
            <Select
              className="mr20"
              size="small"
              placeholder="公司"
              allowClear={false}
              style={{ width: 150 }}
              value={companyId}
              onChange={this.changeCompany}
              getPopupContainer={triggerNode => triggerNode.parentNode}
            >
              {companyList.map(item => {
                const { companyId, companyName } = item;
                return (
                  <Option key={companyId} value={companyId} title={companyName}>
                    {companyName}
                  </Option>
                );
              })}
            </Select>
            <Input
              className="mr20"
              size="small"
              value={ruleName}
              placeholder="规则名称"
              style={{ width: 150 }}
              onChange={this.changeKeyword}
            />
            <RangePicker
              allowClear={false}
              value={rangeTime}
              size="small"
              disabledDate={this.disabledDate}
              onChange={this.handleChangeTime}
              onCalendarChange={this.onCalendarChange}
            />
            <Button
              type="primary"
              size="small"
              disabled={disabled}
              onClick={this.onQuery}
            >
              查询
            </Button>
            <Button
              className="fr"
              type="primary"
              size="small"
              style={{ width: 148 }}
              icon="download"
              disabled={disabled}
              onClick={this.onDownload}
            >
              导出规则统计表
            </Button>
          </div>
          <Table
            rowKey="ruleName"
            className="table-layout-fixed"
            columns={columns}
            dataSource={dataSource}
            locale={{ emptyText: "暂无数据" }}
            pagination={false}
          />
        </div>
      </div>
    );
  }

  onCalendarChange = currentDate => {
    this.startTimeReset = currentDate.length === 1;
    this.startTime = currentDate[0];
  };

  disabledDate = currentDate => {
    if (this.startTimeReset) {
      const startTimeString = this.startTime.format("YYYY-MM-DD");
      const st1 = moment(
        moment(startTimeString)
          .subtract(12, "months")
          .format("YYYY-MM-DD")
      );
      const se1 = moment(
        moment(startTimeString)
          .add(12, "months")
          .subtract(1, "days")
          .format("YYYY-MM-DD")
      );
      return !(
        moment(currentDate.format("YYYY-MM-DD")).diff(st1) >= 0 &&
        se1.diff(moment(currentDate.format("YYYY-MM-DD"))) >= 0
      );
    }
    return false;
  };

  handleChangeTime = rangeTime => {
    this.setState({ rangeTime });
  };

  onDownload = () => {
    const { companyId } = this.state;
    window.location.href = `/dms/leakage/indicatorMonitor/download?companyId=${companyId}`;
  };

  onQuery = () => {
    this.loadIndicatorMonitorRuleIndicatorList();
  };

  loadIndicatorMonitorStatistics = () => {
    const { companyId } = this.state;
    fetchIndicatorMonitorStatistics({ companyId })
      .then(data => {
        const { content: statisticsTotal = {} } = data;
        this.setState({ statisticsTotal });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  loadIndicatorMonitorRuleIndicatorList = () => {
    const { companyId, ruleName = "", rangeTime } = this.state;
    const [startDate, endDate] = rangeTime;
    fetchIndicatorMonitorRuleIndicatorList({
      companyId,
      ruleName,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD")
    })
      .then(data => {
        const { content = [] } = data;
        const dataSource = content.map((row, index) => {
          return { ...row, index: index + 1 };
        });
        this.setState({ dataSource });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  changeKeyword = e => {
    this.setState({ ruleName: e.target.value });
  };

  changeCompany = e => {
    this.setState({ companyId: e }, () => {
      this.loadIndicatorMonitorStatistics();
    });
  };
}
