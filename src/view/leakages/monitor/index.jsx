import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, Select, Input, Table, notification, Pagination } from "antd";
import debounce from "lodash/debounce";
import LayoutRight from "@component/layout_right";
import {
  // FACTOR_TEMPLATE_NEW_TYPES,
  // FACTOR_TEMPLATE_TYPE_MAP,
  TRIGGER_TYPES,
  TRIGGER_TYPE_MAP
} from "@common/constant";

import {
  fetchMonitorList,
  fetchCompanyList,
  fetchLicensePlateByCompanyCodeAndCaseNo,
  fetchExecTimeByDomainTypeAndCompanyCodeAndCaseNoAndLicensePlate
} from "@action/leakage";
import * as Utils from "../util";
import "./index.less";
import { getUserInfo } from "../../../util";
const { Option } = Select;
const { domainType = "" } = getUserInfo();

export default class Monitor extends Component {
  constructor(props) {
    super(props);
    this.debounceCaseNo = debounce(this.debounceCaseNo, 500);
    this.state = {
      domainType: domainType,
      viewShow: false,
      deleteConfirmShow: false,
      promptMsg: "",
      record: {},
      ruleInfo: {},
      fieldSaveError: "",
      enumShow: false,
      selectedRows: [],
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
        showTotal: total => `共 ${total} 条`
      }
    };
  }

  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

  componentDidMount() {
    const {
      location: { state: { pathname, ...state } = {} } = {}
    } = this.props;
    const { conditions } = state;
    if (conditions) {
      const { current, caseNo, licensePlate } = conditions;
      this.setState({ ...conditions }, () => {
        this.loadMonitors(current);
        this.debounceCaseNo(caseNo);
        licensePlate && this.changeLicensePlate(licensePlate, false);
      });
    }
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
    const { history } = this.props;
    const { location: { pathname } = {} } = history;
    const {
      domainType,
      licensePlate,
      caseNo,
      companyCode,
      executeTime,
      description,
      triggerResultType = "ALL",
      dataSource = [],
      licensePlateList = [],
      executeTimeList = [],
      companyList = [],
      pagination,
      loading = false,
      pagination: { pageSize, current = 1 } = {}
    } = this.state;

    const columns = [
      {
        title: "规则描述",
        dataIndex: "description",
        key: "description",
        render: (text, record) => {
          const { id, rowSpan } = record;
          return {
            children: (
              <div className="shown-all">
                <Link
                  to={{
                    pathname: `${pathname}/${id}`,
                    state: {
                      pathname,
                      conditions: {
                        pageSize,
                        current,
                        domainType,
                        companyCode,
                        caseNo,
                        licensePlate,
                        executeTime,
                        description,
                        triggerResultType
                      }
                    }
                  }}
                >
                  {text}
                </Link>
              </div>
            ),
            props: {
              rowSpan
            }
          };
        }
      },
      {
        title: "触发结果",
        dataIndex: "triggerResult",
        key: "triggerResult",
        width: 90,
        render: (text, record) => {
          const { rowSpan } = record;
          return {
            children: TRIGGER_TYPE_MAP[text],
            props: {
              rowSpan
            }
          };
        }
      },
      {
        title: "因子模板名称",
        dataIndex: "templateName",
        key: "templateName",
        render: text => {
          let record = {};
          try {
            record = JSON.parse(text);
          } catch (e) {
            console.log(e);
          }
          return Utils._renderExpression(record, {
            className: "shown-all",
            mode: "VIEW"
          });
        }
      },
      {
        title: "因子模板编码",
        dataIndex: "templateCode",
        key: "templateCode",
        width: 160,
        onCell: record => {
          const { templateCode } = record;
          return { title: templateCode };
        }
      },
      {
        title: "因子触发结果",
        dataIndex: "perTriggerResult",
        key: "perTriggerResult",
        width: 120,
        render: text => {
          return TRIGGER_TYPE_MAP[text];
        }
      },
      {
        title: "运算逻辑",
        dataIndex: "logicExpression",
        key: "logicExpression",
        render: (text, record) => {
          const { rowSpan } = record;
          return {
            children: <div className="shown-all">{text}</div>,
            props: {
              rowSpan
            }
          };
        }
      }
    ];

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd mb0">
          {/* <Select
            placeholder="领域"
            style={{ width: 200, marginBottom: 20 }}
            value={domainType}
            onChange={this.changeDomainType}
          >
            {FACTOR_TEMPLATE_NEW_TYPES.map(type => {
              return (
                <Option key={type} value={type}>
                  {FACTOR_TEMPLATE_TYPE_MAP[type]}
                </Option>
              );
            })}
          </Select> */}
          <Select
            placeholder="公司"
            showSearch
            optionFilterProp="children"
            style={{ width: 200 }}
            value={companyCode}
            onChange={this.changeCompany}
          >
            {companyList.map(item => {
              const { companyCode, companyName } = item;
              return (
                <Option
                  key={companyCode}
                  value={companyCode}
                  title={companyName}
                >
                  {companyName}
                </Option>
              );
            })}
          </Select>
          <Input
            value={caseNo}
            placeholder="案件号"
            style={{ width: 200 }}
            onChange={this.changeCaseNo}
            disabled={!companyCode}
          />
          <Select
            placeholder="车牌"
            showSearch
            optionFilterProp="children"
            style={{ width: 200 }}
            value={licensePlate}
            onChange={this.changeLicensePlate}
            disabled={!licensePlateList.length}
          >
            {licensePlateList.map(lp => {
              return (
                <Option key={lp} value={lp} title={lp}>
                  {lp}
                </Option>
              );
            })}
          </Select>
          <Select
            placeholder="执行时间"
            showSearch
            optionFilterProp="children"
            style={{ width: 200 }}
            value={executeTime}
            onChange={this.changeExecuteTime}
            disabled={!executeTimeList.length}
          >
            {executeTimeList.map(et => {
              return (
                <Option key={et} value={et} title={et}>
                  {et}
                </Option>
              );
            })}
          </Select>
          <Input
            value={description}
            placeholder="规则描述"
            style={{ width: 200 }}
            onChange={this.changeDescription}
          />
          <Select
            placeholder="触发结果"
            style={{ width: 100 }}
            value={triggerResultType}
            onChange={this.changeTriggerResultType}
          >
            {TRIGGER_TYPES.map(type => {
              return (
                <Option key={type} value={type}>
                  {TRIGGER_TYPE_MAP[type]}
                </Option>
              );
            })}
          </Select>
          <Button
            type="primary"
            style={{ marginBottom: 20 }}
            onClick={this.onQuery}
            disabled={!licensePlateList.length || !executeTime}
          >
            查询
          </Button>
        </div>
        <div style={{ height: "calc(100% - 52px)", overflowY: "scroll" }}>
          <Table
            id="leakageRuleTable"
            className="table-detail ellipsis"
            columns={columns}
            dataSource={dataSource}
            bordered
            pagination={false}
            loading={loading}
          />
          <Pagination
            {...pagination}
            onChange={this.handleChange}
            onShowSizeChange={this.handleShowSizeChange}
            style={{ float: "right", margin: "16px 0" }}
          />
        </div>
      </LayoutRight>
    );
  }

  changeTriggerResultType = triggerResultType => {
    this.setState({ triggerResultType });
  };

  onQuery = () => {
    this.loadMonitors();
  };

  loadMonitors = (page = 1) => {
    const {
      pagination,
      domainType,
      companyCode,
      caseNo,
      licensePlate,
      executeTime,
      description,
      triggerResultType
    } = this.state;
    if (!companyCode || !caseNo || !licensePlate || !executeTime) {
      return;
    }
    const { pageSize: size } = pagination;
    const data = {
      domainType,
      companyCode,
      caseNo,
      licensePlate,
      executeTime,
      description,
      triggerResultType,
      page,
      size
    };
    this.setState({
      loading: true
    });
    fetchMonitorList(data)
      .then(res => {
        const { content: dataSourceAll = [] } = res;
        const total = dataSourceAll.length;
        // const { data = [], page = 1, total = 0 } = content
        // if (data.length === 0 && page > 1) {
        //   // 用户非法操作 前端兼容处理
        //   this.loadMonitors()
        //   return
        // }
        let dataSource = [];
        dataSourceAll.slice((page - 1) * size, page * size).forEach(item => {
          const { id, hitTemplateList = [] } = item;
          const rowSpan = hitTemplateList.length;
          hitTemplateList.forEach((template, index) => {
            const { triggerResult: perTriggerResult, ...other } = template;
            dataSource = [
              ...dataSource,
              {
                ...item,
                perTriggerResult,
                ...other,
                key: `${id}_${index}`,
                rowSpan: index === 0 ? rowSpan : 0
              }
            ];
          });
        });
        pagination.total = total;
        pagination.current = page;
        this.setState({ dataSource, loading: false, pagination });
      })
      .catch(data => {
        notification.warning(data.content);
        this.setState({
          loading: false
        });
      });
  };

  handleChange = page => {
    const { pagination } = this.state;
    this.setState({ pagination: { ...pagination, current: page } }, () => {
      this.loadMonitors(page);
    });
  };

  handleShowSizeChange = (_, pageSize) => {
    const { pagination } = this.state;
    this.setState({ pagination: { ...pagination, pageSize } }, () => {
      this.loadMonitors();
    });
  };

  changeCompany = e => {
    this.setState({
      companyCode: e,
      licensePlateList: [],
      executeTimeList: [],
      licensePlate: undefined,
      executeTime: undefined,
      caseNo: undefined
    });
  };

  // changeDomainType = e => {
  //   this.setState({
  //     domainType: e,
  //     companyCode: undefined,
  //     licensePlateList: [],
  //     executeTimeList: [],
  //     licensePlate: undefined,
  //     executeTime: undefined,
  //     caseNo: undefined,
  //     description: undefined,
  //     triggerResultType: undefined
  //   });
  // };

  debounceCaseNo = caseNo => {
    const { domainType, companyCode } = this.state;
    caseNo &&
      fetchLicensePlateByCompanyCodeAndCaseNo({
        caseNo,
        companyCode,
        domainType
      })
        .then(data => {
          const { content: licensePlateList = [] } = data;
          this.setState({ licensePlateList });
        })
        .catch(data => {
          notification.warning(data.content);
        });
  };

  changeCaseNo = e => {
    const caseNo = e.target.value;
    this.setState({
      caseNo,
      licensePlateList: [],
      licensePlate: undefined,
      executeTimeList: [],
      executeTime: undefined
    });
    this.debounceCaseNo(caseNo);
  };

  changeLicensePlate = (licensePlate, clean = true) => {
    this.setState({ licensePlate }, () => {
      const { caseNo, domainType, companyCode, executeTime } = this.state;
      fetchExecTimeByDomainTypeAndCompanyCodeAndCaseNoAndLicensePlate({
        caseNo,
        companyCode,
        domainType,
        licensePlate
      })
        .then(data => {
          const { content: executeTimeList = [] } = data;
          this.setState({
            executeTimeList,
            executeTime: clean ? undefined : executeTime
          });
        })
        .catch(data => {
          notification.warning(data.content);
        });
    });
  };

  changeDescription = e => {
    this.setState({ description: e.target.value });
  };

  changeExecuteTime = executeTime => {
    this.setState({ executeTime });
  };
}
