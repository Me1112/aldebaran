import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Select,
  Input,
  Table,
  Form,
  Row,
  Col,
  notification,
  Switch,
  Collapse,
  Radio,
  Modal,
  Drawer,
  Icon,
  InputNumber,
  Checkbox,
  Badge,
  Tag,
  TreeSelect
} from "antd";
import classNames from "classnames";
import LayoutRight from "@component/layout_right";
import {
  INSURANCE_TYPE,
  INSURANCE_TYPE_MAP,
  BUSINESS_TYPES,
  BUSINESS_TYPE_MAP,
  AREA_TYPE_TREE_LIST_MAP
} from "@common/constant";

import {
  addRule,
  updateRule,
  fetchCompanyList,
  fetchActiveRiskTypes,
  fetchFactorTemplateList,
  fetchRuleHistory,
  logCopyRule
} from "@action/leakage";
import { OPERATE_TYPE_MAP } from "../../util";
import * as Utils from "../../util";
import "./index.less";
import { getUserInfo } from "../../../../util";
const { TextArea } = Input;
const { Option } = Select;
const { Group: RadioGroup } = Radio;
const { Item: FormItem } = Form;
const { Panel } = Collapse;
const ACTIVED = "ACTIVED";
const { SHOW_PARENT } = TreeSelect;

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
      pageSize: 10,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    },
    tPagination: {
      pageSize: 10,
      showTotal: total => `共 ${total} 条`
    },
    logPagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    }
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
      location: { state: { record } = {} } = {}
    } = this.props;
    let { domainType } = this.state;
    if (mode === "new") {
      this.loadFactorTemplates();
    } else if (record) {
      const { ruleInfo: { domainType: dType } = {} } = record;
      domainType = dType;
      this.setState({ ...record });
    }
    this.loadActiveRiskTypes(domainType);
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
    const { match: { params: { mode } = {} } = {} } = this.props;
    const isCopy = mode === "copy";
    const {
      ruleInfo,
      fieldSaveError,
      isView = false,
      viewShow = false,
      loading = false,
      visible,
      tDataSource = [],
      hDataSource = [],
      logPagination = [],
      riskList = [],
      // companyList = [],
      selectedRowKeys = [],
      selectedRows = [],
      activeKeys = [],
      tPagination,
      templateKey,
      top = -99999,
      left = -99999,
      width = 0,
      inputInfo: { value } = {},
      rows = 10,
      insuranceCategory,
      businessType,
      isAntiFraud = false
    } = this.state;
    const isDefault = visible === undefined;
    const show = isDefault ? true : visible;

    const {
      id = 0,
      ruleName: tRuleName = "",
      label: tLabel = "",
      logicExpression: tLogicExpression = "",
      logicType: tLogicType = "",
      riskTypeId: tRiskTypeId,
      // companyIdList: tCompanyIdList,
      insuranceCategory: tInsuranceCategory,
      businessType: tBusinessType = "",
      applyRegion: tApplyRegion = ""
    } = ruleInfo;
    const disabled = id > 0;
    const tColumns = [
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
        title: "因子模板名称",
        dataIndex: "templateName",
        key: "templateName",
        // width: "30%",
        onCell: record => {
          const { templateName } = record;
          return { title: templateName };
        },
        render: text => {
          return <div className="shown-all">{text}</div>;
        }
      },
      {
        title: "因子模板逻辑",
        dataIndex: "templateLogic",
        key: "templateLogic",
        width: "30%",
        render: (text, record) => {
          return Utils._renderExpression(record, {
            className: "shown-all lh30"
          });
        }
      },
      {
        title: "险种大类",
        dataIndex: "insuranceCategory",
        key: "insuranceCategory",
        // width: 120,
        onCell: record => {
          const { insuranceCategory } = record;
          return { title: INSURANCE_TYPE_MAP[insuranceCategory] };
        },
        render: (text, record, index) => {
          let renderCol;
          let tmpText = INSURANCE_TYPE_MAP[text];
          switch (text) {
            case "VEHICLEINSURANCE":
              renderCol = <Badge status="success" text={tmpText} />;
              break;
            case "NOVEHICLEINSURANCE":
              renderCol = <Badge status="processing" text={tmpText} />;
              break;
            default:
              renderCol = <Badge status="default" text="-" />;
              break;
          }
          return renderCol;
        }
      },
      {
        title: "环节",
        dataIndex: "businessType",
        key: "businessType",
        width: 120,
        onCell: record => {
          const { businessType } = record;
          return { title: BUSINESS_TYPE_MAP[businessType] };
        },
        render: (text, record, index) => {
          let renderCol;
          switch (text) {
            case "UNDERWRITING":
              renderCol = <Tag color="orange">{BUSINESS_TYPE_MAP[text]}</Tag>;
              break;
            case "REPORT":
              renderCol = <Tag color="green">{BUSINESS_TYPE_MAP[text]}</Tag>;
              break;
            case "SURVEY":
              renderCol = <Tag color="blue">{BUSINESS_TYPE_MAP[text]}</Tag>;
              break;
            case "SURVEHICLELOSS":
              renderCol = <Tag color="purple">{BUSINESS_TYPE_MAP[text]}</Tag>;
              break;
            case "SURHUMANINJURY":
              renderCol = <Tag color="pink">{BUSINESS_TYPE_MAP[text]}</Tag>;
              break;
            case "SURMATERIALLOSS":
              renderCol = <Tag color="cyan">{BUSINESS_TYPE_MAP[text]}</Tag>;
              break;
            default:
              renderCol = (
                <Tag color="cyan">{BUSINESS_TYPE_MAP[text] || "-"}</Tag>
              );
              break;
          }
          return renderCol;
        }
      }
    ];
    let rColumns = [
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
        title: "因子模板名称",
        dataIndex: "templateName",
        key: "templateName",
        width: "25%",
        onCell: record => {
          const { templateName } = record;
          return { title: templateName };
        },
        render: text => {
          return <div className="shown-all">{text}</div>;
        }
      }
    ];
    if (isAntiFraud) {
      rColumns = [
        ...rColumns,
        {
          title: "是否必须因子",
          dataIndex: "isRequired",
          key: "isRequired",
          width: 100,
          render: (text = false, record) => {
            return (
              <Checkbox
                checked={text}
                onChange={e =>
                  this.changeTemplateNecessaryFactor(e.target.checked, record)
                }
              />
            );
          }
        },
        {
          title: "因子分值",
          dataIndex: "hitScore",
          key: "hitScore",
          width: 90,
          render: (text, record) => {
            const { hitScoreError = false } = record;
            return (
              <InputNumber
                className={classNames("factor-score", {
                  "has-error": hitScoreError
                })}
                value={text}
                precision={0}
                min={-99999999}
                max={99999999}
                onChange={e => this.changeTemplateFactorScore(e, record)}
              />
            );
          }
        }
      ];
    }
    rColumns = [
      ...rColumns,
      {
        title: "因子模板逻辑",
        dataIndex: "templateLogic",
        key: "templateLogic",
        render: (text, record, index) => {
          return Utils._renderExpression(record, {
            className: "shown-all lh30",
            mode: "EDIT",
            rowIndex: index,
            onChange: this.handleTemplateChange,
            onFocus: this.handleTemplateFocus
          });
        }
      },
      {
        title: "因子是否提示",
        dataIndex: "isTip",
        key: "isTip",
        width: 90,
        render: (text, record) => {
          const { conditionList = [] } = record;
          const disabled =
            conditionList.filter(item => {
              const { filterType = "" } = item;
              return (
                filterType.startsWith("NOT_CONTAINS") ||
                filterType.startsWith("EQUALS_NOT")
              );
            }).length > 0;
          return (
            <Switch
              style={{ width: 55 }}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              disabled={disabled}
              checked={text}
              onChange={checked => this.changeTemplateActive(checked, record)}
            />
          );
        }
      }
    ];

    const hColumns = [
      {
        title: "操作时间",
        dataIndex: "operateTime",
        key: "operateTime",
        width: 180,
        onCell: record => {
          const { operateTime } = record;
          return { title: operateTime };
        }
      },
      {
        title: "操作人",
        dataIndex: "userName",
        key: "userName",
        width: 120,
        onCell: record => {
          const { userName } = record;
          return { title: userName };
        }
      },
      {
        title: "操作简介",
        dataIndex: "operateType",
        key: "operateType",
        width: 160,
        render: text => {
          return OPERATE_TYPE_MAP[text];
        }
      },
      {
        title: "操作说明",
        dataIndex: "templateExpression",
        key: "templateExpression",
        onCell: record => {
          const { templateExpression } = record;
          return { title: templateExpression };
        }
      }
    ];

    const { getFieldProps, getFieldDecorator } = this.props.form;
    const formItem320Layout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 20 }
    };
    const formItem616Layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 }
    };

    const rowSelection = {
      columnWidth: 45,
      columnTitle: "选择",
      hideDefaultSelections: false,
      selectedRowKeys,
      onSelect: this.onRowsSelectChange
    };

    const sRowSelection = {
      columnWidth: 45,
      columnTitle: "选择",
      hideDefaultSelections: false,
      selectedRowKeys,
      onSelect: this.onSetRowsSelectChange
    };

    const logicTypeValue = this.props.form.getFieldValue("logicType");
    const tProps = {
      treeData: AREA_TYPE_TREE_LIST_MAP,
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      searchPlaceholder: "请选择",
      treeDefaultExpandAll: true,
      style: {
        width: "100%"
      }
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
                  因子模板
                  <Input
                    value={templateKey}
                    placeholder="因子模板编码/名称"
                    style={{ width: 200, marginLeft: 10, marginRight: 10 }}
                    onChange={this.changeTemplate}
                    onClick={this.preventDefault}
                    onPressEnter={this.preventDefault}
                  />
                  险种大类
                  <Select
                    placeholder="险种大类"
                    allowClear
                    style={{ width: 200, marginLeft: 10, marginRight: 10 }}
                    value={insuranceCategory}
                    onChange={this.changeInsuranceCategory}
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
                    onChange={this.changeBusinessType}
                  >
                    {BUSINESS_TYPES.map(type => {
                      return (
                        <Option key={type} value={type}>
                          {BUSINESS_TYPE_MAP[type]}
                        </Option>
                      );
                    })}
                  </Select>
                  <Button size="small" type="primary" onClick={this.onTQuery}>
                    查询
                  </Button>
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
                rowSelection={rowSelection}
                onChange={this.handleTChange}
                pagination={tPagination}
              />
            </Panel>
            <Panel header="规则设置" key="SET">
              <Table
                className={classNames("ellipsis", {
                  "table-error": !!fieldSaveError
                })}
                rowKey="id"
                size="small"
                columns={rColumns}
                dataSource={selectedRows}
                rowSelection={sRowSelection}
                pagination={false}
              />
              <Row className="save-error">{fieldSaveError}</Row>
              <Form style={{ marginTop: 10 }}>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem {...formItem320Layout} label="规则名称">
                      <Input
                        {...getFieldProps("ruleName", {
                          initialValue: tRuleName,
                          validate: [
                            {
                              rules: [
                                { required: true, message: "最多200个字符" }
                              ]
                            }
                          ]
                        })}
                        placeholder="最多200个字符"
                        maxLength="200"
                        disabled={isView}
                      />
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItem616Layout} label="规则风险小类">
                      <Select
                        {...getFieldProps("riskTypeId", {
                          initialValue: tRiskTypeId,
                          validate: [
                            {
                              rules: [
                                {
                                  required: true,
                                  message: "请选择规则风险小类"
                                }
                              ]
                            }
                          ]
                        })}
                        placeholder="请选择"
                        showSearch
                        optionFilterProp="children"
                      >
                        {riskList.map(item => {
                          const { id, name } = item;
                          return (
                            <Option key={id} value={id} title={name}>
                              {name}
                            </Option>
                          );
                        })}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItem616Layout} label="逻辑选项">
                      <RadioGroup
                        {...getFieldProps("logicType", {
                          initialValue: tLogicType || "AND",
                          validate: [
                            {
                              rules: [{ required: true }]
                            }
                          ],
                          onChange: this.logicTypeChange
                        })}
                        disabled={isView || isAntiFraud}
                      >
                        <Radio value="AND">与</Radio>
                        <Radio value="OR">或</Radio>
                        <Radio value="CUSTOMIZE">自定义</Radio>
                      </RadioGroup>
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem {...formItem320Layout} label="标签">
                      <Input
                        {...getFieldProps("label", {
                          initialValue: tLabel,
                          validate: [
                            {
                              rules: [
                                { required: true, message: "最多255个字符" }
                              ]
                            }
                          ]
                        })}
                        placeholder="最多255个字符"
                        maxLength="255"
                        disabled={isView}
                      />
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem {...formItem320Layout} label="逻辑运算" required>
                      <Input
                        {...getFieldProps("logicExpression", {
                          initialValue: tLogicExpression
                        })}
                        placeholder=""
                        onKeyUp={this.replaceChineseChars}
                        disabled={isView}
                        readOnly={logicTypeValue !== "CUSTOMIZE"}
                      />
                    </FormItem>
                  </Col>
                  {/* <Col span={24}>
                    <FormItem {...formItem320Layout} label="配置上线公司">
                      <Select
                        mode="multiple"
                        {...getFieldProps("companyIdList", {
                          initialValue: tCompanyIdList
                        })}
                        placeholder="请选择"
                        showSearch
                        optionFilterProp="children"
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
                    </FormItem>
                  </Col> */}
                  <Col span={24}>
                    <FormItem {...formItem320Layout} label="险种大类">
                      <Select
                        {...getFieldProps("insuranceCategory", {
                          initialValue: tInsuranceCategory,
                          validate: [
                            {
                              rules: [
                                {
                                  required: true,
                                  message: "请选择险种大类"
                                }
                              ]
                            }
                          ]
                        })}
                        placeholder="请选择"
                        showSearch
                        optionFilterProp="children"
                      >
                        {INSURANCE_TYPE.map(type => {
                          return (
                            <Option key={type} value={type}>
                              {INSURANCE_TYPE_MAP[type]}
                            </Option>
                          );
                        })}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem {...formItem320Layout} label="环节">
                      <Select
                        {...getFieldProps("businessType", {
                          initialValue: tBusinessType,
                          validate: [
                            {
                              rules: [
                                {
                                  required: true,
                                  message: "请选择环节"
                                }
                              ]
                            }
                          ]
                        })}
                        placeholder="请选择"
                        showSearch
                        optionFilterProp="children"
                      >
                        {BUSINESS_TYPES.map(type => {
                          return (
                            <Option key={type} value={type}>
                              {BUSINESS_TYPE_MAP[type]}
                            </Option>
                          );
                        })}
                      </Select>
                    </FormItem>
                  </Col>
                  <Col span={24}>
                    <FormItem {...formItem320Layout} label="适用地区">
                      {getFieldDecorator("applyRegion", {
                        rules: [
                          {
                            required: true,
                            message: "请选择适用地区"
                          }
                        ],
                        initialValue: tApplyRegion && tApplyRegion.split(",")
                      })(<TreeSelect {...tProps} />)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Panel>
          </Collapse>
        </LayoutRight>
        <div className="view-back">
          {disabled && !isCopy && (
            <Button
              style={{ float: "left" }}
              icon="search"
              onClick={this.onViewIconClick}
            >
              日志
            </Button>
          )}
          <Button type="primary" onClick={this.onRuleSave} loading={loading}>
            确定
          </Button>
          <Button onClick={this.onCancel}>取消</Button>
        </div>
        <Modal
          className="leakage-template-record-value-modal"
          width={width}
          visible={show}
          mask={false}
          footer={null}
          closable={false}
          style={{ top, left }}
          wrapClassName={classNames({ "leakage-template-wrap": isDefault })}
          transitionName=""
          autoFocus
          onCancel={this.handleVisible}
        >
          <TextArea
            rows={rows}
            ref={ref => ref && ref.focus()}
            value={value}
            onChange={this.handleTemplateValue}
          />
        </Modal>
        <Drawer
          className="leakage-rule-drawer"
          placement="top"
          visible={viewShow}
          width="calc(100% - 200px)"
          closable={false}
          mask={false}
          maskClosable={false}
          getContainer={false}
          onClose={this.onViewCancel}
        >
          <div style={{ overflowY: "auto", maxHeight: window.innerHeight / 3 }}>
            <Table
              className="table-detail ellipsis"
              columns={hColumns}
              dataSource={hDataSource}
              pagination={logPagination}
              bordered
              onChange={this.handleLogChange}
            />
          </div>
          <div className="close-bar">
            <Icon type="double-up" onClick={this.onViewCancel} />
          </div>
        </Drawer>
      </Fragment>
    );
  }

  handleLogChange = logPagination => {
    this.setState({ logPagination }, () => {
      this.loadLogs(logPagination.current);
    });
  };

  loadLogs = (page = 1) => {
    const { ruleInfo: { id: ruleId } = {}, logPagination } = this.state;
    fetchRuleHistory({ ruleId, page })
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        const hDataSource = data.map((item, index) => {
          return { ...item, key: index };
        });
        logPagination.total = total;
        logPagination.current = page;
        this.setState({ hDataSource, logPagination });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  preventDefault = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  loadActiveRiskTypes = dType => {
    if (!dType) {
      const { ruleInfo: { domainType } = {} } = this.state;
      dType = domainType;
    }
    fetchActiveRiskTypes({ domainType: dType })
      .then(data => {
        const { content: riskList = [] } = data;
        let riskMap = {};
        riskList.forEach(risk => {
          const { id } = risk;
          riskMap[id] = risk;
        });
        this.setState({ riskList, riskMap });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  changeDomainType = e => {
    let { activeKeys = [] } = this.state;
    if (!activeKeys.includes("SEARCH")) {
      activeKeys = [...activeKeys, "SEARCH"];
    }
    this.setState(
      {
        ruleInfo: { domainType: domainType },
        activeKeys,
        templateKey: undefined,
        tDataSource: [],
        selectedRows: [],
        selectedRowKeys: [],
        fieldSaveError: "",
        businessType: undefined,
        insuranceCategory: undefined
      },
      () => {
        this.loadFactorTemplates();
        this.loadActiveRiskTypes();
        this.props.form.resetFields([
          "ruleName",
          "riskTypeId",
          "companyId",
          "label",
          "logicExpression",
          "businessType",
          "insuranceCategory"
        ]);
        this.props.form.setFields({
          logicType: {
            value: "AND"
          }
        });
      }
    );
  };

  onViewCancel = () => {
    this.setState({
      viewShow: false
    });
  };

  onViewIconClick = () => {
    const {
      ruleInfo: { id: ruleId } = {},
      viewShow = false,
      logPagination
    } = this.state;
    if (viewShow) {
      this.setState({ viewShow: false });
      return;
    }
    fetchRuleHistory({ ruleId })
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        const hDataSource = data.map((item, index) => {
          return { ...item, key: index };
        });
        logPagination.total = total;
        logPagination.current = page;
        this.setState({ viewShow: true, hDataSource, logPagination });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  handleTemplateValue = e => {
    const value = e.target.value;
    const { inputInfo = {} } = this.state;
    const { index, option } = inputInfo;
    this.handleTemplateChange(value, index, option);
  };

  handleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  handleTemplateFocus = (e, index, option = {}) => {
    const { width, top, left } = e.target.getBoundingClientRect();
    const range = window.innerHeight - top;
    let rows = 10;
    const min = 80;
    if (range <= min) {
      rows = 3;
    } else {
      const step = Math.floor((range - min) / 20);
      if (step < 7) {
        rows = 3 + step;
      }
    }
    this.setState({
      visible: true,
      left,
      top,
      width,
      rows,
      inputInfo: { value: e.target.value, index, option }
    });
  };

  handleTemplateChange = (value, index, option = {}) => {
    const {
      rowIndex = 0,
      mode = "left",
      agg = false,
      fieldType = "",
      filterType,
      timeUnit,
      record = false
    } = option;
    let v = value || "";
    if (
      fieldType === "DECIMAL" ||
      agg ||
      (fieldType === "DATETIME" &&
        (timeUnit || filterType === "BETWEEN_THIS_DAY"))
    ) {
      if (
        !/^(-?)([0-9]?|[1-9]\d{0,9}[0-9]\d{0,9})(\.\d{0,4})?$/.test(v) &&
        v !== ""
      ) {
        return;
      }
    } else {
      v = v
        .replace(/，|,，/g, ",")
        .replace(/\(/gi, "（")
        .replace(/\)/gi, "）");
      if (fieldType === "STRING") {
        v = v.replace(/ /g, "");
      }
    }
    const { inputInfo = {} } = this.state;
    let { selectedRows } = this.state;
    selectedRows = selectedRows.map((row, order) => {
      if (order === rowIndex) {
        let { aggregationDto = {}, conditionList = [] } = row;
        let { operatorList = [] } = aggregationDto;
        if (agg) {
          operatorList = this._buildRowData(operatorList, {
            index,
            mode,
            value: v
          });
          aggregationDto = { ...aggregationDto, operatorList };
        } else {
          conditionList = this._buildRowData(conditionList, {
            index,
            mode,
            value: v
          });
        }
        return {
          ...row,
          aggregationDto,
          conditionList
        };
      }
      return row;
    });
    this.setState({
      selectedRows,
      inputInfo: record ? { ...inputInfo, value: v } : inputInfo
    });
  };

  replaceChineseChars = e => {
    const { ruleInfo = {} } = this.state;
    let logicExpression = e.target.value
      .replace(/！/gi, "")
      .replace(/!/gi, "")
      .replace(/（/gi, "(")
      .replace(/）/gi, ")");
    const matchChars = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "_",
      "|",
      "&",
      "(",
      ")"
    ];
    logicExpression = logicExpression
      .split("")
      .map(char => {
        if (matchChars.includes(char)) {
          return char;
        }
        return "";
      })
      .join("");
    this.setState(
      {
        ruleInfo: {
          ...ruleInfo,
          logicExpression
        }
      },
      () => {
        this.props.form.setFields({
          logicExpression: {
            value: logicExpression
          }
        });
      }
    );
  };

  logicTypeChange = e => {
    let { selectedRows = [], ruleInfo, isAntiFraud } = this.state;
    const logicType = e.target.value;
    if (["AND", "OR"].includes(logicType)) {
      const logicExpression = this._generateLogicExpression({
        list: selectedRows,
        logicType,
        isAntiFraud
      });
      ruleInfo = { ...ruleInfo, logicExpression };
      this.props.form.setFields({
        logicExpression: {
          value: logicExpression
        }
      });
    }
    this.setState({ ruleInfo });
  };

  handleActiveKeys = activeKeys => {
    this.setState({ activeKeys });
  };

  onRowsSelectChange = (record, selected) => {
    const { id } = record;
    let {
      activeKeys = [],
      selectedRowKeys = [],
      selectedRows = [],
      ruleInfo,
      isAntiFraud
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
    const logicType = this.props.form.getFieldValue("logicType");
    if (["AND", "OR"].includes(logicType)) {
      const logicExpression = this._generateLogicExpression({
        list: selectedRows,
        logicType,
        isAntiFraud
      });
      ruleInfo = { ...ruleInfo, logicExpression };
      this.props.form.setFields({
        logicExpression: {
          value: logicExpression
        }
      });
    }
    this.setState({ selectedRowKeys, activeKeys, selectedRows, ruleInfo });
  };

  onSetRowsSelectChange = (record, selected) => {
    const { id } = record;
    let {
      selectedRowKeys = [],
      selectedRows = [],
      ruleInfo,
      isAntiFraud
    } = this.state;
    // const { domainType = domainType } = ruleInfo;
    if (selected) {
      selectedRowKeys = [...selectedRowKeys, id];
      selectedRows = [...selectedRows, record];
    } else {
      selectedRows = selectedRows.filter(row => row.id !== id);
      selectedRowKeys = selectedRowKeys.filter(key => key !== id);
    }
    const logicType = this.props.form.getFieldValue("logicType");
    if (["AND", "OR"].includes(logicType)) {
      const logicExpression = this._generateLogicExpression({
        list: selectedRows,
        logicType,
        isAntiFraud
      });
      ruleInfo = { ...ruleInfo, logicExpression };
      this.props.form.setFields({
        logicExpression: {
          value: logicExpression
        }
      });
    }
    this.setState({ selectedRowKeys, selectedRows, ruleInfo });
  };

  changeBusinessType = e => {
    this.setState({ businessType: e });
  };
  changeInsuranceCategory = e => {
    this.setState({ insuranceCategory: e });
  };
  changeTemplate = e => {
    this.setState({ templateKey: e.target.value });
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

  changeTemplateFactorScore = (value, record) => {
    let { selectedRows } = this.state;
    selectedRows = selectedRows.map(row => {
      if (row.id === record.id) {
        return { ...record, hitScore: value };
      }
      return row;
    });
    this.setState({ selectedRows });
  };

  changeTemplateNecessaryFactor = (checked, record) => {
    let { selectedRows, isAntiFraud } = this.state;
    selectedRows = selectedRows.map(row => {
      if (row.id === record.id) {
        return { ...record, isRequired: checked };
      }
      return row;
    });
    this.setState({ selectedRows }, () => {
      // const { domainType = domainType } = ruleInfo;
      const logicType = this.props.form.getFieldValue("logicType");
      if (["AND", "OR"].includes(logicType)) {
        const logicExpression = this._generateLogicExpression({
          list: selectedRows,
          logicType,
          isAntiFraud
        });
        this.props.form.setFields({
          logicExpression: {
            value: logicExpression
          }
        });
      }
    });
  };

  changeTemplateActive = (checked, record) => {
    let { selectedRows } = this.state;
    selectedRows = selectedRows.map(row => {
      if (row.id === record.id) {
        return { ...record, isTip: checked };
      }
      return row;
    });
    this.setState({ selectedRows });
  };

  onEditCancel = () => {
    this.setState(
      {
        isView: false,
        isModify: false,
        editConfirmShow: false,
        ruleInfo: {},
        enumShow: false,
        fieldSaveError: ""
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onRuleSave = () => {
    let {
      ruleInfo = {},
      activeKeys = [],
      selectedRows = [],
      riskMap,
      domainType,
      isAntiFraud
    } = this.state;
    const { id = "" } = ruleInfo;
    this.props.form.validateFieldsAndScroll((errors, values) => {
      let hitScoreErrorChanged = false;
      let matchError = false;
      let noValueError = false;
      let enableTip = false;
      let enableTipCount = 0;
      let enableRequiredCount = 0;
      let codes = [];
      selectedRows = selectedRows.map(row => {
        let {
          isTip = false,
          isRequired = false,
          hasAggregation = false,
          hitScore,
          aggregationDto = {},
          conditionList = [],
          templateCode
        } = row;
        if (isAntiFraud) {
          if (hitScore === undefined) {
            noValueError = true;
            row = { ...row, hitScoreError: noValueError };
          } else {
            if (!hitScoreErrorChanged) {
              hitScoreErrorChanged = row.hitScoreError !== false;
            }
            row = { ...row, hitScoreError: false };
          }
          if (isRequired) {
            codes = [...codes, templateCode];
            enableRequiredCount = enableRequiredCount + 1;
          }
        } else {
          codes = [...codes, templateCode];
        }
        if (isTip) {
          enableTipCount = enableTipCount + 1;
        }
        let { operatorList = [] } = aggregationDto;
        if (hasAggregation) {
          const { list, hasError } = this._buildDataError(operatorList, true);
          if (hasError) {
            noValueError = hasError;
          }
          aggregationDto = { ...aggregationDto, operatorList: list };
        }
        const { list, hasError } = this._buildDataError(conditionList);
        if (hasError) {
          noValueError = hasError;
        }
        return {
          ...row,
          aggregationDto,
          conditionList: list
        };
      });
      const { riskTypeId, logicExpression = "" } = values;
      const logicExpressions = logicExpression
        .replace(/[()]/gi, "")
        .replace(/&&/gi, "")
        .replace(/\|\|/gi, "")
        .replace(/ {2}/gi, " ")
        .split(" ");
      codes.forEach(code => {
        if (!logicExpressions.includes(code)) {
          matchError = true;
          this.props.form.setFields({
            logicExpression: {
              errors: [
                {
                  message: "因子模板编码不匹配"
                }
              ]
            }
          });
        }
      });
      if (!matchError) {
        this.props.form.setFields({
          logicExpression: {
            value: logicExpression,
            errors: null
          }
        });
      }
      const { tipNumber } = riskMap[riskTypeId] || {};
      const tipNumberMap = { ONE: 1, TWO: 2 };
      const tipNumberCount = tipNumberMap[tipNumber] || 0;
      if (!tipNumber) {
        this.setState({ fieldSaveError: "规则风险小类未维护因子提示数量" });
      } else if (enableTipCount !== tipNumberCount) {
        this.setState({ fieldSaveError: `请开启${tipNumberCount}个因子提示` });
      } else if (enableRequiredCount === 0 && isAntiFraud) {
        this.setState({ fieldSaveError: `请勾选至少1个必须因子` });
      } else {
        enableTip = true;
        this.setState({ fieldSaveError: "" });
      }
      const {
        match: { params: { mode, id: originRuleId } = {} } = {},
        location: { state: { record } = {} } = {}
      } = this.props;
      const isCopy = mode === "copy";
      let nameChanged = true;
      if (isCopy) {
        const { ruleName } = ruleInfo;
        const { ruleName: newRuleName } = values;
        if (ruleName === newRuleName) {
          nameChanged = false;
          this.props.form.setFields({
            ruleName: {
              errors: [
                {
                  message: "请修改规则名称，保证规则名称唯一性。"
                }
              ]
            }
          });
        }
      }
      if (errors || !enableTip || noValueError || matchError || !nameChanged) {
        if (!activeKeys.includes("SET")) {
          activeKeys = [...activeKeys, "SET"];
          this.setState({ activeKeys });
        }
        if (noValueError || hitScoreErrorChanged) {
          this.setState({ selectedRows });
        }
        return;
      }
      this.setState({ loading: true });
      try {
        let postData = {
          ...values,
          leakageRuleTempRespList: selectedRows,
          domainType,
          applyRegion: values.applyRegion.join(",")
        };
        if (mode === "edit") {
          const { ruleInfo: { leakageRuleTempRespList = [] } = {} } = record;
          const originCodes = leakageRuleTempRespList.map(row => row.code);
          const addRuleCodeList = selectedRows
            .filter(row => {
              const { templateCode, code = templateCode } = row;
              return !originCodes.includes(code);
            })
            .map(row => {
              const { templateCode, code = templateCode } = row;
              return code;
            });
          const deleteRuleCodeList = leakageRuleTempRespList
            .filter(row => !codes.includes(row.code))
            .map(row => row.code);
          postData = { ...postData, addRuleCodeList, deleteRuleCodeList };
        }
        const isEdit = id > 0;
        const promise =
          isEdit && !isCopy
            ? updateRule({ id, ...postData })
            : addRule(postData);
        promise
          .then(async data => {
            const { content: copiedRuleId } = data;
            if (isCopy) {
              try {
                await logCopyRule({ copiedRuleId, originRuleId });
              } catch (e) {
                notification.warning(e);
              }
            }
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
    let {
      tPagination = false,
      templateKey: templateName,
      // ruleInfo = {},
      businessType,
      insuranceCategory,
      domainType
    } = this.state;
    if (tPagination === false) {
      tPagination = {
        pageSize: 10,
        showTotal: total => `共 ${total} 条`
      };
    }
    const { pageSize: size } = tPagination;
    const data = {
      domainType,
      activeStatus: ACTIVED,
      templateName,
      businessType,
      insuranceCategory,
      page,
      size
    };
    this.setState({
      loading: true
    });
    fetchFactorTemplateList(data)
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
          item.key = id;
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

  _generateLogicExpression = (data = {}) => {
    let { list = [], logicType, isAntiFraud = false } = data;
    switch (logicType) {
      case "AND":
        logicType = "&&";
        break;
      case "OR":
        logicType = "||";
        break;
    }
    return list
      .filter(row => {
        const { isRequired = false } = row;
        return isRequired || !isAntiFraud;
      })
      .map((expression, index) => {
        const { templateCode } = expression;
        return `${index > 0 ? ` ${logicType} ` : ""}${templateCode}`;
      })
      .join("");
  };

  _buildRowData = (list = [], { index, mode, value = "" }) => {
    return list.map((item, m) => {
      if (index === m) {
        switch (mode) {
          case "left":
            if (value.trim() !== "") {
              delete item["leftValueError"];
            }
            item = { ...item, leftValue: value };
            break;
          case "right":
            if (value.trim() !== "") {
              delete item["rightValueError"];
            }
            item = { ...item, rightValue: value };
            break;
          case "rtg":
            if (value.trim() !== "") {
              delete item["recentTimeRangeValueError"];
            }
            item = { ...item, recentTimeRangeValue: value };
            break;
        }
      }
      return item;
    });
  };

  _buildDataError = (list, aggregation = false) => {
    let hasError = false;
    list = list.map(item => {
      const {
        filterType = "",
        finalOperator = "",
        leftValue = "",
        rightValue = "",
        recentTimeRangeValue = ""
      } = item;
      delete item["leftValueError"];
      if (`${leftValue}`.trim() === "") {
        hasError = true;
        item = { ...item, leftValueError: true };
      }
      const operator = aggregation ? finalOperator : filterType;
      if (operator.startsWith("BETWEEN_")) {
        delete item["rightValueError"];
        if (`${rightValue}`.trim() === "") {
          hasError = true;
          item = { ...item, rightValueError: true };
        }
      }
      if (operator.endsWith("_LIMIT_TIME")) {
        delete item["recentTimeRangeValueError"];
        if (`${recentTimeRangeValue}`.trim() === "") {
          hasError = true;
          item = { ...item, recentTimeRangeValueError: true };
        }
      }
      return item;
    });
    return { list, hasError };
  };
}

export default Form.create()(RuleAdd);
