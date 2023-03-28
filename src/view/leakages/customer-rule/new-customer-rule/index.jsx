import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Select, Table, Form, notification, Collapse } from "antd";
import LayoutRight from "@component/layout_right";
import {
  INSURANCE_TYPE,
  INSURANCE_TYPE_MAP,
  BUSINESS_TYPES,
  BUSINESS_TYPE_MAP,
  AREA_TYPE_MAP
} from "@common/constant";
import {
  saveOrUpdateCompanyRule,
  // editCompanyRule,
  fetchCompanyList,
  // fetchCompanyRuleDetail,
  // fetchFactorTemplateList,
  fetchRuleList
} from "@action/leakage";
//  import * as Utils from "../../util";
import { getUserInfo } from "../../../../util";
import "./index.less";

const { Option } = Select;
const { Panel } = Collapse;
const { domainType = "" } = getUserInfo();
class RuleAdd extends Component {
  state = {
    domainType: domainType,
    editConfirmShow: false,
    deleteConfirmShow: false,
    promptShow: false,
    promptMsg: "",
    record: {},
    ruleInfo: {},
    riskMap: {},
    fieldSaveError: "",
    enumShow: false,
    selectedRows: [],
    activeKeys: [],
    pagination: {
      pageSize: 20,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    },
    tPagination: {
      pageSize: 20,
      showTotal: total => `共 ${total} 条`
    },
    logPagination: {
      pageSize: 20,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    },
    isCheck: false,
    isAdd: false,
    isEdit: false,
    insuranceCategory: "",
    businessType: "",
    companyId: ""
  };

  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

  componentDidMount() {
    const {
      match: { params: { mode } = {} } = {},
      location: { state = {} } = {}
    } = this.props;
    const { record = {}, conditions = {} } = state;
    this.setState({
      isCheck: mode === "check",
      isAdd: mode === "new",
      isEdit: mode === "edit"
    });
    if (mode === "new") {
      this.setState({ ...conditions }, () => this.loadFactorTemplates());
    } else if (record) {
      this.setState({ ...record }, () => this.loadFactorTemplates());
      const { ruleIds = "" } = record;
      this.setState({ selectedRowKeys: ruleIds && ruleIds.split(",") });
    }

    fetchCompanyList()
      .then(data => {
        const { content: companyList = [] } = data;
        this.setState({ companyList });
      })
      .catch(data => {
        if (data.content) {
          if (data.content) {
            notification.warning(data.content);
          }
        }
      });
  }

  render() {
    const {
      loading = false,
      tDataSource = [],
      companyList = [],
      selectedRowKeys = [],
      activeKeys = [],
      tPagination,
      insuranceCategory,
      businessType,
      companyId,
      isCheck,
      isAdd,
      isEdit
    } = this.state;
    const tColumns = [
      {
        title: "规则号",
        dataIndex: "id",
        key: "id",
        width: 100,
        onCell: record => {
          const { id } = record;
          return { title: id };
        }
      },
      {
        title: "规则描述",
        dataIndex: "description",
        key: "description",
        width: "40%",
        onCell: record => {
          const { description } = record;
          return { title: description };
        },
        render: text => {
          return <div className="shown-all">{text}</div>;
        }
      },
      // {
      //   title: "风险类型",
      //   dataIndex: "templateLogic",
      //   key: "templateLogic",
      //   render: (text, record) => {
      //     return Utils._renderExpression(record, {
      //       className: "shown-all lh30"
      //     });
      //   }
      // },
      {
        title: "适用区域",
        dataIndex: "applyRegion",
        key: "applyRegion",
        width: 180,
        // onCell: record => {
        //   const { applyRegion } = record;
        //   return { title: AREA_TYPE_MAP[applyRegion] };
        // },

        render: text => {
          return (
            text &&
            text.split(",").map((item, index) => (
              <span className="text-overflow" title={AREA_TYPE_MAP[item]}>
                {AREA_TYPE_MAP[item]}
                {index !== text.split(",").length - 1 && "、"}
              </span>
            ))
          );
        }
      }
    ];

    const rowSelection = {
      columnWidth: 45,
      columnTitle: "选择",
      hideDefaultSelections: false,
      selectedRowKeys,
      onSelect: this.onRowsSelectChange
      // getCheckboxProps: record => ({
      //   checked: record.checked // Column configuration not to be checked
      // })
    };

    return (
      <Fragment>
        <LayoutRight className="leakage-rule-layout no-bread-crumb">
          {/* <Row style={{ marginBottom: 10 }}>
            <Select
              disabled={disabled}
              placeholder="领域"
              style={{ width: 100 }}
              value={tDomainType}
              onChange={this.changeDomainType}
            >
              {FACTOR_TEMPLATE_NEW_TYPES.map(type => {
                return (
                  <Option key={type} value={type}>
                    {FACTOR_TEMPLATE_TYPE_MAP[type]}
                  </Option>
                );
              })}
            </Select>
            <span className="rule-tips">
              提示：需要先选择领域类型，才会显示因子模板可选列表。
            </span>
          </Row> */}
          <Collapse activeKey={activeKeys} onChange={this.handleActiveKeys}>
            <Panel
              header={
                <Fragment>
                  <span style={{ marginRight: "24px" }}>
                    {isAdd ? "新增" : isEdit ? "修改" : "查看"}配置
                  </span>
                  公司名称
                  <Select
                    placeholder="公司名称"
                    allowClear
                    style={{ width: 200, marginLeft: 10, marginRight: 10 }}
                    value={companyId}
                    disabled
                  >
                    {companyList.map(item => {
                      const { companyId, companyName } = item;
                      return (
                        <Option
                          key={companyId}
                          value={companyId}
                          title={companyName}
                        >
                          {companyName}
                        </Option>
                      );
                    })}
                  </Select>
                  险种大类
                  <Select
                    placeholder="险种大类"
                    allowClear
                    style={{ width: 200, marginLeft: 10, marginRight: 10 }}
                    value={insuranceCategory}
                    disabled
                    // onChange={this.changeInsuranceCategory}
                  >
                    {INSURANCE_TYPE.map(type => {
                      return (
                        <Option key={type} value={type}>
                          {INSURANCE_TYPE_MAP[type]}
                        </Option>
                      );
                    })}
                  </Select>
                  环节
                  <Select
                    placeholder="环节"
                    allowClear
                    style={{ width: 200, marginLeft: 10, marginRight: 10 }}
                    value={businessType}
                    disabled
                    // onChange={this.changeBusinessType}
                  >
                    {BUSINESS_TYPES.map(type => {
                      return (
                        <Option key={type} value={type}>
                          {BUSINESS_TYPE_MAP[type]}
                        </Option>
                      );
                    })}
                  </Select>
                  {/* <Button size="small" type="primary" onClick={this.onTQuery}>
                    查询
                  </Button> */}
                </Fragment>
              }
              key="SEARCH"
            >
              <Table
                className="ellipsis"
                rowKey="id"
                size="small"
                columns={tColumns}
                dataSource={tDataSource}
                rowSelection={!isCheck && rowSelection}
                onChange={this.handleTChange}
                pagination={tPagination}
              />
            </Panel>
          </Collapse>
        </LayoutRight>
        <div className="view-back">
          <div>
            {!isCheck && (
              <Button
                type="primary"
                onClick={this.onRuleSave}
                loading={loading}
              >
                发布
              </Button>
            )}
            <Button onClick={this.onCancel}>取消</Button>
          </div>
        </div>
      </Fragment>
    );
  }

  preventDefault = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleActiveKeys = activeKeys => {
    console.log(activeKeys, 'activeKeys: ["SET"]');
    this.setState({ activeKeys });
  };

  onRowsSelectChange = (record, selected) => {
    const { id } = record;
    let {
      activeKeys = [],
      selectedRowKeys = [],
      selectedRows = [],
      ruleInfo
    } = this.state;
    if (selected) {
      selectedRowKeys = [...selectedRowKeys, id];
      selectedRows = [...selectedRows, record];
    } else {
      selectedRows = selectedRows.filter(row => row.id !== id);
      selectedRowKeys = selectedRowKeys.filter(key => key !== id);
    }
    if (selectedRowKeys.length && !activeKeys.includes("SET")) {
      activeKeys = [...activeKeys, "SET"];
    }
    this.setState({
      selectedRowKeys,
      activeKeys,
      selectedRows,
      ruleInfo
    });
  };

  changeBusinessType = e => {
    this.setState({ businessType: e });
  };
  changeInsuranceCategory = e => {
    this.setState({ insuranceCategory: e });
  };

  onTQuery = e => {
    e.preventDefault();
    e.stopPropagation();
    this.loadFactorTemplates(1, () => {
      let { activeKeys = [] } = this.state;
      if (!activeKeys.includes("SEARCH")) {
        activeKeys = [...activeKeys, "SEARCH"];
        this.setState({ activeKeys });
      }
    });
  };

  onCancel = () => {
    const {
      location: { state: { pathname, ...state } = {} } = {}
    } = this.props;
    this.props.history.push({ pathname, state });
  };

  handleTChange = tPagination => {
    this.setState({ tPagination }, () => {
      this.loadFactorTemplates(tPagination.current);
    });
  };

  onRuleSave = () => {
    let {
      companyId,
      domainType,
      businessType,
      insuranceCategory,
      selectedRowKeys
    } = this.state;
    this.props.form.validateFieldsAndScroll((errors, values) => {
      const { match: { params: { mode } = {} } = {} } = this.props;
      const isCheck = mode === "check";
      this.setState({ loading: true });
      try {
        let postData = {
          ...values,
          companyId,
          domainType,
          businessType,
          insuranceCategory,
          ruleIds: selectedRowKeys && selectedRowKeys.join(",")
        };
        const promise = !isCheck && saveOrUpdateCompanyRule(postData);
        promise
          .then(async data => {
            // const { content } = data;
            // if (isCheck) {
            //   try {
            //     await logCopyRule({ copiedRuleId, originRuleId });
            //   } catch (e) {
            //     notification.warning(e);
            //   }
            // }
            this.onCancel();
            // this.setState({ editConfirmShow: false, loading: false }, () => {
            //   this.loadRules(isEdit ? pagination.current : 1)
            // })
          })
          .catch(data => {
            notification.warning(data.content);
            this.setState({ loading: false });
            // this.props.form.setFields({
            //   fieldDisplayName: {
            //     errors: [{
            //       message
            //     }]
            //   }
            // })
          });
      } catch (err) {
        this.setState({ loading: false });
      }
    });
  };

  loadFactorTemplates = (page = 1, callback) => {
    const {
      match: { params: { mode } = {} } = {},
      location: { state = {} } = {}
    } = this.props;
    const { record = {}, conditions = {} } = state;
    const { ruleIds = "" } = record;
    this.setState({ ...conditions });
    let {
      tPagination = false,
      businessType,
      insuranceCategory,
      companyId
    } = this.state;
    if (tPagination === false) {
      tPagination = {
        pageSize: 10,
        showTotal: total => `共 ${total} 条`
      };
    }
    const { pageSize: size } = tPagination;
    const tempData = {
      domainType: domainType,
      businessType,
      insuranceCategory,
      page,
      size,
      companyId,
      activeStatus: "ACTIVED"
    };

    const data =
      mode === "check"
        ? { showRuleIds: ruleIds, ...tempData }
        : mode === "edit"
        ? { checkedRuleIds: ruleIds, ...tempData }
        : tempData;
    this.setState({
      loading: true
    });
    fetchRuleList(data)
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.loadFactorTemplates();
          return;
        }
        data.forEach(item => {
          const { id } = item;
          item.key = id.toString();
          item.id = id.toString();
        });
        tPagination.total = total;
        tPagination.current = page;
        this.setState(
          { tDataSource: data, loading: false, tPagination },
          () => {
            callback && callback();
          }
        );
      })
      .catch(data => {
        notification.warning(data.content);
        this.setState({
          loading: false
        });
      });
  };
}

export default Form.create()(RuleAdd);
