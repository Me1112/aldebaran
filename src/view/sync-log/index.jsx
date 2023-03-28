import React, { Component } from "react";
import { Button, Table, Form, notification, Select, DatePicker } from "antd";
import LayoutRight from "@component/layout_right";
import { getUserInfo } from "../../util";
import { fetchCompanyList } from "@action/leakage";
import { getLogList } from "@action/async-log";
import moment from "moment";
import "./index.less";
const { RangePicker } = DatePicker;
const { Option } = Select;
const { domainType = "" } = getUserInfo();
const dateFormat = "YYYY-MM-DD";
class AsyncLogList extends Component {
  state = {
    companyInfo: {},
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    },
    startDate: moment().format(dateFormat),
    endDate: moment().format(dateFormat)
  };

  componentDidMount() {
    this.loadLogList();
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
      loading = false,
      companyId,
      dataSource = [],
      companyList = [],
      pagination
    } = this.state;
    const columns = [
      {
        title: "案件号",
        dataIndex: "caseNo",
        key: "caseNo",
        width: 80,
        onCell: record => {
          const { caseNo } = record;
          return { title: caseNo };
        }
      },
      {
        title: "进件参数",
        dataIndex: "inputParam",
        key: "inputParam",
        onCell: record => {
          const { inputParam } = record;
          return { title: inputParam };
        }
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 180,
        onCell: record => {
          const { createTime } = record;
          return { title: createTime };
        }
      },
      {
        title: "状态",
        dataIndex: "statusName",
        key: "statusName",
        width: 120,
        onCell: record => {
          const { statusName } = record;
          return { title: statusName };
        }
      },

      {
        title: "进件结果",
        dataIndex: "leakageHitRuleList",
        key: "leakageHitRuleList",
        render: (text, record) => {
          const data = text
            .map(
              risk =>
                risk.description +
                " - " +
                (risk.triggerResult === "NOT_TRIGGER" ? "未命中" : "命中")
            )
            .join("、");
          return (
            <div className="text-overflow" title={data}>
              {data}
            </div>
          );
        },
        onCell: record => {
          const { leakageHitRuleList } = record;
          return { title: JSON.stringify(leakageHitRuleList) };
        }
      }
    ];
    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Select
            placeholder="公司名称"
            allowClear
            style={{ width: 200 }}
            value={companyId}
            onChange={this.changeCompanyName}
          >
            {companyList.map(item => {
              const { companyId, companyName } = item;
              return (
                <Option key={companyId} value={companyId} title={companyId}>
                  {companyName}
                </Option>
              );
            })}
          </Select>
          <RangePicker
            defaultValue={[moment(), moment()]}
            format={dateFormat}
            onChange={this.changeRangePicker}
            style={{ width: 220 }}
          />
          <Button type="primary" onClick={this.onQuery}>
            查询
          </Button>
          <Button onClick={this.onReset}>重置</Button>
        </div>
        <div style={{ height: "calc(100% - 52px)", overflowY: "scroll" }}>
          <Table
            className="ellipsis"
            rowKey="id"
            columns={columns}
            dataSource={dataSource}
            loadLogList
            onChange={this.handleChange}
            pagination={pagination}
            loading={loading}
          />
        </div>
      </LayoutRight>
    );
  }
  changeCompanyName = e => {
    this.setState({ companyId: e });
  };
  changeRangePicker = async val => {
    const that = this;
    that.setState({
      startDate: val.length > 1 ? val[0].format(dateFormat) : "",
      endDate: val.length > 1 ? val[1].format(dateFormat) : ""
    });
  };
  onQuery = () => {
    const { startDate, endDate } = this.state;
    if (!startDate && !endDate) {
      return notification.warning({ message: "请将时间段补充完整！" });
    }
    this.loadLogList();
  };
  onReset = () => {
    this.setState(
      {
        companyId: undefined,
        endDate: moment().format(dateFormat),
        startDate: moment().format(dateFormat)
      },
      () => {
        this.onQuery();
      }
    );
  };

  loadLogList = (page = 1) => {
    const { pagination, companyId, endDate, startDate } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      companyId,
      page,
      size,
      endDate: endDate,
      startDate: startDate,
      domainType: domainType
    };
    this.setState({
      loading: true
    });
    getLogList(data)
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.loadLogList();
          return;
        }
        data.forEach(item => {
          const { companyId } = item;
          item.id = companyId;
        });
        pagination.total = total;
        pagination.current = page;
        this.setState({ dataSource: data, loading: false, pagination });
      })
      .catch(data => {
        notification.warning(data.content);
        this.setState({
          loading: false
        });
      });
  };

  handleChange = pagination => {
    this.setState({ pagination }, () => {
      this.loadLogList(pagination.current);
    });
  };
}

export default Form.create()(AsyncLogList);
