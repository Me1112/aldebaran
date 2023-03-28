import React from "react";
import { Button, Card, DatePicker, notification, Select } from "antd";
import classnames from "classnames";
import echarts from "echarts";
import {
  fetchCompanyList,
  fetchDeterminationStatistics
} from "@action/leakage";
import { buildUrlParamOnlyCheckNullOrUnder, RangePickerRanges } from "@util";
import {
  DMS_PREFIX,
  FACTOR_TEMPLATE_TYPE_MAP,
  FACTOR_TEMPLATE_TYPES
} from "@common/constant";
import "./index.less";

const { LAST_30, LAST_60, LAST_90 } = RangePickerRanges;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default class LossAssessment extends React.Component {
  state = {
    selectedTab: "DAY30",
    startDate: LAST_30[0],
    endDate: LAST_30[1],
    domainType: "ANTI_LEAKAGE"
  };
  static propTypes = {};

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
    this.lossAssessment = echarts.init(
      document.getElementById("loss-assessment")
    );
  }

  render() {
    return (
      <div className="loss-assessment">
        <Card
          className="app-card"
          title={this.renderHistoryTitle()}
          bodyStyle={{ padding: 0 }}
          bordered={false}
        >
          <div id="loss-assessment" />
        </Card>
      </div>
    );
  }

  renderHistoryTitle = () => {
    const {
      selectedTab,
      companyList = [],
      companyId,
      domainType,
      startDate,
      endDate
    } = this.state;
    return (
      <span className="ant-card-head-title-query">
        <Select
          placeholder="领域"
          value={domainType}
          onChange={this.changeDomainType}
        >
          {FACTOR_TEMPLATE_TYPES.map(type => {
            return (
              <Option key={type} value={type}>
                {FACTOR_TEMPLATE_TYPE_MAP[type]}
              </Option>
            );
          })}
        </Select>
        <Select
          placeholder="公司"
          showSearch
          optionFilterProp="children"
          value={companyId}
          onChange={this.changeCompany}
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
        <span
          className={classnames("time-tag", {
            active: selectedTab === "DAY30"
          })}
          onClick={this.on30Select}
        >
          近30天
        </span>
        <span
          className={classnames("time-tag", {
            active: selectedTab === "DAY60"
          })}
          onClick={this.on60Select}
        >
          近60天
        </span>
        <span
          className={classnames("time-tag", {
            active: selectedTab === "DAY90"
          })}
          onClick={this.on90Select}
        >
          近90天
        </span>
        <RangePicker
          value={[startDate, endDate]}
          style={{ width: 230 }}
          onChange={this.onTimeChange}
          format={"YYYY-MM-DD"}
          allowClear={false}
        />
        <Button type="primary" onClick={this.onQuery} disabled={!companyId}>
          查询
        </Button>
        <Button onClick={this.onDownloadClick} disabled={!companyId}>
          导出案件明细
        </Button>
      </span>
    );
  };

  onDownloadClick = () => {
    const { companyId, domainType, startDate, endDate } = this.state;
    const data = {
      companyId,
      domainType,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD")
    };
    window.location.href = `/${DMS_PREFIX}/leakage/determination/export?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`;
  };

  onQuery = () => {
    this.loadDeterminationStatistics();
  };

  changeCompany = e => {
    this.setState({ companyId: e });
  };

  changeDomainType = e => {
    this.setState({ domainType: e });
  };

  on30Select = () => {
    const [startDate, endDate] = LAST_30;
    this.setState({ selectedTab: "DAY30", startDate, endDate });
  };

  on60Select = () => {
    const [startDate, endDate] = LAST_60;
    this.setState({ selectedTab: "DAY60", startDate, endDate });
  };

  on90Select = () => {
    const [startDate, endDate] = LAST_90;
    this.setState({ selectedTab: "DAY90", startDate, endDate });
  };

  loadDeterminationStatistics = () => {
    const { companyId, domainType, startDate, endDate } = this.state;
    fetchDeterminationStatistics({
      companyId,
      domainType,
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD")
    }).then(data => {
      const { content: { notPassNumber, passNumber } = {} } = data;
      const option = {
        chart: this.lossAssessment,
        color: ["#0098d9", "#7bd9a5"],
        title: "定损通过统计",
        legend: {
          type: "scroll",
          orient: "vertical",
          left: 10,
          top: 20,
          bottom: 20,
          data: ["定损已通过", "定损未通过"]
        },
        data: [
          {
            name: "定损已通过",
            value: passNumber,
            label: {
              show: true
            },
            labelLine: {
              show: true
            }
          },
          {
            name: "定损未通过",
            value: notPassNumber,
            label: {
              show: true
            },
            labelLine: {
              show: true
            }
          }
        ]
      };
      this.drawPie(option);
    });
  };

  onTimeChange = async date => {
    this.setState({
      selectedTab: "",
      startDate: date[0],
      endDate: date[1]
    });
  };

  drawPie = (option = {}) => {
    const { chart, color, title, subtext, legend, data } = option;
    let options = {
      color,
      title: {
        text: title,
        left: "center",
        top: 20,
        textStyle: {
          fontSize: 18
        },
        subtext,
        subtextStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: "item",
        formatter: "{b} : {c} ({d}%)"
      }
    };
    chart.setOption({
      ...options,
      legend,
      series: [
        {
          type: "pie",
          center: ["50%", "55%"],
          data,
          avoidLabelOverlap: false,
          label: {
            normal: {
              textStyle: {
                color: "#000",
                fontSize: 12
              },
              formatter: "{b}: {d}%"
            }
          }
        }
      ]
    });
  };
}
