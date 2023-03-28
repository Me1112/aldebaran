import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Select,
  Input,
  Table,
  Switch,
  Modal,
  Form,
  Row,
  notification,
  Checkbox,
  Badge,
  Tag
} from "antd";
import classnames from "classnames";
import LayoutRight from "@component/layout_right";
import {
  // FACTOR_TEMPLATE_NEW_TYPES,
  // FACTOR_TEMPLATE_TYPE_MAP,
  SUCCESS,
  ARITHMETIC_OPERATORS,
  ARITHMETIC_OPERATOR_MAP,
  NUMBER_OPERATORS_IN_AGGREGATION,
  NUMBER_OPERATOR_MAP,
  AGGREGATE_NUMBER_OPERATORS,
  AGGREGATE_NOT_NUMBER_OPERATORS,
  AGGREGATE_OPERATOR_MAP,
  INSURANCE_TYPE,
  INSURANCE_TYPE_MAP,
  BUSINESS_TYPES,
  BUSINESS_TYPE_MAP
} from "@common/constant";

import {
  fetchFactorTemplateList,
  addTemplate,
  delTemplate,
  updateTemplateActive,
  templateDependencies,
  fetchListFieldAndStatisticalField,
  fetchActiveFieldNotTypeField,
  fetchTemplateInfo,
  updateTemplate,
  updateTemplateName,
  fetchAllEnumInfo,
  fetchTemplateDependencies,
  batchActiveTemplates,
  batchInactiveTemplates
} from "@action/leakage";
import Enum from "./enum";
import { buildUrlParamNew, decisionModalError, antiModalError } from "@util";
import * as Utils from "../util";
import "./index.less";
import { getUserInfo } from "../../../util";
const { Option } = Select;
const { Item: FormItem } = Form;
const { confirm } = Modal;
const UN_ACTIVED = "UN_ACTIVED";
const ACTIVED = "ACTIVED";
const { domainType = "" } = getUserInfo();
class BasicField extends Component {
  state = {
    domainType: domainType,
    editConfirmShow: false,
    deleteConfirmShow: false,
    promptShow: false,
    promptMsg: "",
    record: {},
    templateInfo: {},
    fieldSaveError: "",
    enumShow: false,
    enumList: [{}],
    selectedRowKeys: [],
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    }
  };

  static propTypes = {
    form: PropTypes.any
  };

  componentDidMount() {
    this.loadFactorTemplates();
  }

  render() {
    const {
      templateInfo,
      fieldSaveError,
      isView = false,
      isModify = false,
      promptShow,
      promptMsg,
      enumList,
      loading = false,
      templateName,
      dataSource = [],
      conditionFieldOfFields = [],
      conditionFields = [],
      selectedRowKeys = [],
      pagination,
      random = "",
      enumTranslate = {},
      insuranceCategory,
      multipleBusinessType
    } = this.state;
    const readOnly = isView || isModify;
    const { fieldId: listFieldId } =
      enumList.find(item => item.fieldType === "LIST") || {};
    const disabled = selectedRowKeys.length === 0;

    const rowSelection = {
      columnWidth: 50,
      selectedRowKeys,
      onChange: this.onRowsSelectChange
    };

    const columns = [
      {
        title: "因子模板名称",
        dataIndex: "templateName",
        key: "templateName",
        width: 200,
        onCell: record => {
          const { templateName } = record;
          return { title: templateName };
        },
        render: text => {
          return <div className="shown-all">{text}</div>;
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
      // {
      //   title: "领域",
      //   dataIndex: "domainType",
      //   key: "domainType",
      //   width: 120,
      //   onCell: record => {
      //     const { domainType } = record;
      //     return { title: FACTOR_TEMPLATE_TYPE_MAP[domainType] };
      //   },
      //   render: text => {
      //     return FACTOR_TEMPLATE_TYPE_MAP[text];
      //   }
      // },
      {
        title: "险种大类",
        dataIndex: "insuranceCategory",
        key: "insuranceCategory",
        width: 120,
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
      },
      {
        title: "因子模板逻辑",
        dataIndex: "templateLogic",
        key: "templateLogic",
        width: "30%",
        render: (text, record) => {
          return Utils._renderExpression(record, { className: "shown-all" });
        }
      },
      {
        title: "激活",
        dataIndex: "activeStatus",
        key: "activeStatus",
        width: 100,
        render: (text, record) => {
          return (
            <Switch
              style={{ width: 55 }}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              checked={record.activeStatus === ACTIVED}
              onChange={checked => this.changeFieldActive(checked, record)}
            />
          );
        }
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime"
        // width: 185
      },
      {
        title: "操作",
        dataIndex: "operations",
        key: "operations",
        fixed: "right",
        width: 120,
        render: (text, record) => {
          const isActive = record.activeStatus === ACTIVED;
          return (
            <Fragment>
              {!isActive && (
                <span
                  className="operation-span"
                  onClick={() => {
                    this.onEditIconClick(record);
                  }}
                >
                  编辑
                </span>
              )}
              {!isActive && (
                <span
                  className="operation-span"
                  onClick={() => {
                    this.onDeleteIconClick(record);
                  }}
                >
                  删除
                </span>
              )}
              {isActive && (
                <span
                  className="operation-span"
                  onClick={() => {
                    this.onEditIconClick(record, "modifyName");
                  }}
                >
                  修改名称
                </span>
              )}
            </Fragment>
          );
        }
      }
    ];

    const {
      id,
      hasAggregation = false,
      templateName: tTemplateName = "",
      // domainType: tDomainType = "ANTI_LEAKAGE",
      businessType: tBusinessType = "",
      insuranceCategory: tInsuranceCategory = "",
      aggregationDto: { aggregationList = [], operatorList = [] } = {},
      conditionList = enumList.filter(item => item.fieldId)
    } = templateInfo;
    const {
      fieldId: aFieldId,
      fieldIdError = false,
      fieldType: aFieldType,
      operatorChar: operatorCharFirst,
      operatorCharError: operatorCharFirstError = false,
      operatorFieldId,
      operatorFieldIdError = false
    } = aggregationList[0] || {};
    const {
      operatorChar,
      operatorCharError = false,
      optCodeSecond,
      optCodeSecondError = false,
      finalOperator = "",
      finalOperatorError = false
    } = operatorList[0] || {};
    const isNumber = aFieldType === "DECIMAL";
    const aggregations = aFieldType
      ? isNumber
        ? AGGREGATE_NUMBER_OPERATORS
        : AGGREGATE_NOT_NUMBER_OPERATORS
      : [];
    const { aggregationType, aggregationTypeError = false } =
      aggregationList[0] || {};

    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3 },
      wrapperCol: { span: 8 }
    };

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          {/* <Select
            placeholder="领域"
            allowClear={false}
            style={{ width: 200 }}
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
            placeholder="环节"
            allowClear
            style={{ width: 200 }}
            value={multipleBusinessType}
            onChange={this.changeBusinessType}
            mode="multiple"
          >
            {BUSINESS_TYPES.map(type => {
              return (
                <Option key={type} value={type}>
                  {BUSINESS_TYPE_MAP[type]}
                </Option>
              );
            })}
          </Select>
          <Select
            placeholder="险种大类"
            allowClear
            style={{ width: 200 }}
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
          <Input
            value={templateName}
            placeholder="因子模板名称"
            style={{ width: 200 }}
            onChange={this.changeKeyword}
          />
          <Button type="primary" onClick={this.onQuery}>
            查询
          </Button>
          <Button onClick={this.onReset}>重置</Button>
          <Button type="primary" className="fr" onClick={this.onCreateBtnClick}>
            新建
          </Button>
          <div style={{ marginTop: "18px" }}>
            <Button
              type="primary"
              disabled={disabled}
              onClick={this.onCloseBtnClick}
            >
              批量关闭
            </Button>
            <Button
              type="primary"
              disabled={disabled}
              onClick={this.onActiveBtnClick}
            >
              批量激活
            </Button>
          </div>
        </div>
        <div>
          <Table
            className="ellipsis"
            rowKey="id"
            columns={columns}
            dataSource={dataSource}
            onChange={this.handleChange}
            pagination={pagination}
            loading={loading}
            rowSelection={rowSelection}
            scroll={{ x: 1300, y: "50vh" }}
          />
        </div>
        <Modal
          title="提示"
          wrapClassName="edit-confirm-modal"
          visible={promptShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={() => this.setState({ promptShow: false })}
          onOk={() => this.setState({ promptShow: false })}
        >
          {promptMsg}
        </Modal>
        <Modal
          title={`${id > 0 ? (isView ? "查看" : "编辑") : "新建"}因子模板`}
          centered
          width={1100}
          bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onFieldSave}
        >
          <Form>
            {/* <FormItem {...formItemLayout} label="领域">
              <Select
                disabled={readOnly || id > 0}
                {...getFieldProps("domainType", {
                  initialValue: tDomainType,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择领域" }]
                    }
                  ]
                })}
                placeholder="请选择"
                getPopupContainer={trigger => trigger.parentElement}
              >
                {FACTOR_TEMPLATE_NEW_TYPES.map(type => {
                  return (
                    <Option key={type} value={type}>
                      {FACTOR_TEMPLATE_TYPE_MAP[type]}
                    </Option>
                  );
                })}
              </Select>
            </FormItem> */}
            <FormItem {...formItemLayout} label="环节">
              <Select
                disabled={readOnly || id > 0}
                {...getFieldProps("businessType", {
                  initialValue: tBusinessType,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择环节" }]
                    }
                  ]
                })}
                placeholder="请选择"
                getPopupContainer={trigger => trigger.parentElement}
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
            <FormItem {...formItemLayout} label="险种大类">
              <Select
                disabled={readOnly || id > 0}
                {...getFieldProps("insuranceCategory", {
                  initialValue: tInsuranceCategory,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择险种大类" }]
                    }
                  ]
                })}
                placeholder="请选择"
                getPopupContainer={trigger => trigger.parentElement}
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
            <FormItem {...formItemLayout} label="因子模板名称">
              <Input
                {...getFieldProps("templateName", {
                  initialValue: tTemplateName,
                  validate: [
                    {
                      rules: [{ required: true, message: "最多255个字符" }]
                    }
                  ]
                })}
                placeholder="最多255个字符"
                maxLength="255"
                disabled={isView}
              />
            </FormItem>
            <Enum
              random={random}
              visible
              disabled={readOnly}
              list={enumList}
              onEnumAdd={this.onEnumAdd}
              onEnumDelete={this.onEnumDelete}
              onEnumChange={this.onEnumChange}
            />
            {listFieldId && (
              <FormItem
                {...{ ...formItemLayout, wrapperCol: { span: 21, offset: 3 } }}
                label=""
                colon={false}
              >
                <Checkbox
                  checked={hasAggregation}
                  onChange={this.onAggregationSwitch}
                  disabled={readOnly}
                >
                  聚合计算
                </Checkbox>
                <br />
                {hasAggregation && (
                  <Fragment>
                    <Select
                      style={{ width: 140 }}
                      className={classnames({ "has-error": fieldIdError })}
                      placeholder=""
                      value={aFieldId}
                      dropdownMenuStyle={{ maxHeight: 160 }}
                      disabled={readOnly}
                      dropdownMatchSelectWidth={false}
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e => {
                        this.onAggregationChange(e, 0, "fieldId");
                      }}
                    >
                      {conditionFieldOfFields.map(item => {
                        const { id, fieldName } = item;
                        return (
                          <Option key={id} value={id} title={fieldName}>
                            {fieldName}
                          </Option>
                        );
                      })}
                    </Select>
                    {isNumber && (
                      <Fragment>
                        <Select
                          style={{ marginLeft: 10 }}
                          className={classnames("w50", {
                            "has-error": operatorCharFirstError
                          })}
                          placeholder=""
                          value={operatorCharFirst}
                          dropdownMenuStyle={{ maxHeight: 160 }}
                          allowClear
                          disabled={readOnly}
                          getPopupContainer={trigger => trigger.parentElement}
                          onChange={e => {
                            this.onAggregationChange(e, 0, "operatorCharFirst");
                          }}
                        >
                          {ARITHMETIC_OPERATORS.map(o => (
                            <Option
                              key={o}
                              value={o}
                              title={ARITHMETIC_OPERATOR_MAP[o]}
                            >
                              {ARITHMETIC_OPERATOR_MAP[o]}
                            </Option>
                          ))}
                        </Select>
                        <Select
                          style={{ width: 140, marginLeft: 10 }}
                          disabled={readOnly}
                          className={classnames({
                            "has-error": operatorFieldIdError
                          })}
                          placeholder=""
                          value={operatorFieldId}
                          dropdownMenuStyle={{ maxHeight: 160 }}
                          allowClear
                          getPopupContainer={trigger => trigger.parentElement}
                          onChange={e => {
                            this.onAggregationChange(e, 0, "operatorFieldId");
                          }}
                        >
                          {conditionFieldOfFields
                            .filter(item => item.fieldType === "DECIMAL")
                            .map(item => {
                              const { id, fieldName } = item;
                              return (
                                <Option key={id} value={id} title={fieldName}>
                                  {fieldName}
                                </Option>
                              );
                            })}
                        </Select>
                      </Fragment>
                    )}
                    <Select
                      disabled={readOnly}
                      className={classnames("w78", {
                        "has-error": aggregationTypeError
                      })}
                      value={aggregationType}
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e => {
                        this.onAggregationChange(e, 0, "aggregationType");
                      }}
                    >
                      {aggregations.map(item => {
                        return (
                          <Option key={item} value={item}>
                            {AGGREGATE_OPERATOR_MAP[item]}
                          </Option>
                        );
                      })}
                    </Select>
                    <Select
                      style={{ marginLeft: 10 }}
                      className={classnames("w50", {
                        "has-error": operatorCharError
                      })}
                      placeholder=""
                      value={operatorChar}
                      dropdownMenuStyle={{ maxHeight: 160 }}
                      allowClear
                      disabled={readOnly}
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e => {
                        this.onAggregationChange(e, 0, "operatorChar");
                      }}
                    >
                      {ARITHMETIC_OPERATORS.map(o => (
                        <Option
                          key={o}
                          value={o}
                          title={ARITHMETIC_OPERATOR_MAP[o]}
                        >
                          {ARITHMETIC_OPERATOR_MAP[o]}
                        </Option>
                      ))}
                    </Select>
                    <Select
                      style={{ width: 140, marginLeft: 10 }}
                      disabled={readOnly}
                      className={classnames({
                        "has-error": optCodeSecondError
                      })}
                      dropdownMatchSelectWidth={false}
                      placeholder=""
                      value={optCodeSecond}
                      dropdownMenuStyle={{ maxHeight: 160 }}
                      allowClear
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e => {
                        this.onAggregationChange(e, 0, "optCodeSecond");
                      }}
                    >
                      {conditionFields
                        .filter(item => item.fieldType === "DECIMAL")
                        .map(item => {
                          const { id, fieldName } = item;
                          return (
                            <Option key={id} value={`${id}`} title={fieldName}>
                              {fieldName}
                            </Option>
                          );
                        })}
                    </Select>
                    <Select
                      style={{ width: 140, marginLeft: 10 }}
                      disabled={readOnly}
                      className={classnames({
                        "has-error": finalOperatorError
                      })}
                      dropdownMatchSelectWidth={false}
                      placeholder=""
                      value={finalOperator}
                      dropdownMenuStyle={{ maxHeight: 160 }}
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e => {
                        this.onAggregationChange(e, 0, "finalOperator");
                      }}
                    >
                      {NUMBER_OPERATORS_IN_AGGREGATION.map(o => (
                        <Option
                          key={o}
                          value={o}
                          title={NUMBER_OPERATOR_MAP[o]}
                        >
                          {NUMBER_OPERATOR_MAP[o]}
                        </Option>
                      ))}
                    </Select>
                    <Input style={{ width: 40, marginLeft: 10 }} disabled />
                    {finalOperator.startsWith("BETWEEN_") && (
                      <Input style={{ width: 40, marginLeft: 10 }} disabled />
                    )}
                  </Fragment>
                )}
              </FormItem>
            )}
            <FormItem
              {...{ ...formItemLayout, wrapperCol: { span: 18 } }}
              label="逻辑表达式"
            >
              {Utils._renderExpression(
                {
                  aggregationDto: { aggregationList, operatorList },
                  conditionList,
                  enumTranslate,
                  hasAggregation
                },
                {
                  className: classnames("template-logic-expression", {
                    "-disabled": readOnly
                  })
                }
              )}
            </FormItem>
            <Row className="save-error">{fieldSaveError}</Row>
          </Form>
        </Modal>
      </LayoutRight>
    );
  }

  onRowsSelectChange = selectedRowKeys => {
    this.setState({ selectedRowKeys });
  };

  onAggregationChange = async (value, index, prop) => {
    const {
      conditionFieldOfFieldMap = {},
      conditionFieldMap = {},
      templateInfo = {}
    } = this.state;
    let { aggregationDto = {} } = templateInfo;
    let { aggregationList = [], operatorList = [] } = aggregationDto;
    let data = {};
    switch (prop) {
      case "fieldId":
        const { id: fieldId, fieldCode, fieldType, fieldName } =
          conditionFieldOfFieldMap[value] || {};
        const item = aggregationList[index] || {};
        const operator = operatorList[index] || {};
        let {
          aggregationType = "",
          aggregationCode = "",
          fieldType: aggFieldType,
          operatorChar: operatorCharFirst,
          operatorFieldCode,
          operatorFieldId
        } = item;
        if (aggregationType) {
          aggregationCode = `${aggregationType.toLocaleLowerCase()}_${fieldCode}`;
        }
        const isNumber = fieldType === "DECIMAL";
        if (
          (isNumber && aggFieldType !== fieldType) ||
          !(
            ["DECIMAL", "STRING", "BOOLEAN", "DATETIME", "ENUM"].includes(
              fieldType
            ) && aggFieldType !== "DECIMAL"
          )
        ) {
          aggregationType = undefined;
        }
        if (!isNumber) {
          operatorCharFirst = undefined;
          operatorFieldCode = undefined;
          operatorFieldId = undefined;
        }
        aggregationList[index] = {
          ...item,
          aggregationType,
          aggregationCode,
          fieldId,
          fieldCode,
          fieldType,
          fieldName,
          operatorFieldId,
          operatorChar: operatorCharFirst,
          operatorFieldCode,
          [prop]: value
        };
        operatorList[index] = {
          ...operator,
          isAggregationType: false,
          optCodeFirst: aggregationCode
        };
        aggregationDto = { ...aggregationDto, aggregationList, operatorList };
        this.setState({ templateInfo: { ...templateInfo, aggregationDto } });
        break;
      case "aggregationType": {
        const item = aggregationList[index] || {};
        const operator = operatorList[index] || {};
        let { aggregationCode = "", fieldCode = "" } = item;
        if (fieldCode) {
          aggregationCode = `${value.toLocaleLowerCase()}_${fieldCode}`;
        }
        aggregationList[index] = { ...item, aggregationCode, [prop]: value };
        operatorList[index] = { ...operator, optCodeFirst: aggregationCode };
        aggregationDto = { ...aggregationDto, aggregationList };
        break;
      }
      case "operatorChar": {
        const {
          content: conditionFields = []
        } = await fetchActiveFieldNotTypeField();
        let conditionFieldMap = {};
        conditionFields.forEach(field => {
          const { id } = field;
          conditionFieldMap = { ...conditionFieldMap, [id]: field };
        });
        data = { ...data, conditionFields, conditionFieldMap };
        const operator = operatorList[index] || {};
        operatorList[index] = {
          ...operator,
          hasCalculation: !!value,
          [prop]: value
        };
        aggregationDto = { ...aggregationDto, operatorList };
        break;
      }
      case "optCodeSecond": {
        const { fieldName: optNameSecond } = conditionFieldMap[value] || {};
        const operator = operatorList[index] || {};
        operatorList[index] = { ...operator, optNameSecond, [prop]: value };
        aggregationDto = { ...aggregationDto, operatorList };
        break;
      }
      case "finalOperator": {
        const operator = operatorList[index] || {};
        operatorList[index] = { ...operator, [prop]: value };
        aggregationDto = { ...aggregationDto, operatorList };
        break;
      }
      case "operatorCharFirst": {
        const item = aggregationList[index] || {};
        aggregationList[index] = { ...item, operatorChar: value };
        aggregationDto = { ...aggregationDto, aggregationList };
        break;
      }
      case "operatorFieldId": {
        const {
          fieldCode: operatorFieldCode,
          fieldType: operatorFieldType,
          fieldName: operatorFieldName
        } = conditionFieldOfFieldMap[value] || {};
        const item = aggregationList[index] || {};
        aggregationList[index] = {
          ...item,
          operatorFieldCode,
          operatorFieldType,
          operatorFieldName,
          [prop]: value
        };
        aggregationDto = { ...aggregationDto, aggregationList };
        break;
      }
    }
    this.setState({
      templateInfo: { ...templateInfo, aggregationDto },
      ...data
    });
  };

  onAggregationSwitch = async e => {
    const hasAggregation = e.target.checked;
    const { templateInfo = {}, enumList = [] } = this.state;
    const { fieldId } = enumList.find(item => item.fieldType === "LIST") || {};
    let state = {};
    if (fieldId && hasAggregation) {
      const {
        content: conditionFieldOfFields = []
      } = await fetchListFieldAndStatisticalField({ id: fieldId });
      let conditionFieldOfFieldMap = {};
      conditionFieldOfFields.forEach(field => {
        const { id } = field;
        conditionFieldOfFieldMap = { ...conditionFieldOfFieldMap, [id]: field };
      });
      state = { conditionFieldOfFields, conditionFieldOfFieldMap };
    }
    this.setState({
      templateInfo: { ...templateInfo, hasAggregation },
      ...state
    });
  };

  onQuery = () => {
    this.loadFactorTemplates();
  };

  onReset = () => {
    this.setState(
      {
        templateName: undefined,
        insuranceCategory: undefined,
        businessType: undefined
      },
      () => {
        this.onQuery();
      }
    );
  };

  loadFactorTemplates = (page = 1) => {
    const {
      pagination,
      domainType,
      templateName,
      insuranceCategory,
      multipleBusinessType
    } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      domainType,
      templateName,
      page,
      size,
      insuranceCategory,
      businessType: multipleBusinessType
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

  onCancel = () => {
    this.setState({
      enumAddVisible: false
    });
  };

  handleChange = pagination => {
    this.setState({ pagination }, () => {
      this.loadFactorTemplates(pagination.current);
    });
  };

  changeDomainType = e => {
    this.setState({ domainType: e });
  };
  changeBusinessType = e => {
    this.setState({ multipleBusinessType: e });
  };

  changeInsuranceCategory = e => {
    this.setState({ insuranceCategory: e });
  };
  changeKeyword = e => {
    this.setState({ templateName: e.target.value });
  };

  changeFieldActive = async (checked, record) => {
    const { pagination: { current = 1 } = {} } = this.state;
    if (checked) {
      updateTemplateActive(record)
        .then(res => {
          record.activeStatus = checked ? ACTIVED : UN_ACTIVED;
          this.setState({ editConfirmShow: false, loading: false }, () => {
            this.loadFactorTemplates(current);
          });
        })
        .catch(data => {
          const { content = {} } = data;
          notification.warn(content);
        });
    } else {
      templateDependencies(buildUrlParamNew({ id: record.id }))
        .then(res => {
          const {
            content: {
              dependenceList = [],
              overThanTen = false,
              totalCount = 0
            } = {}
          } = res;
          if (totalCount === 0) {
            updateTemplateActive(record)
              .then(res => {
                record.activeStatus = checked ? ACTIVED : UN_ACTIVED;
                this.setState(
                  { editConfirmShow: false, loading: false },
                  () => {
                    this.loadFactorTemplates(current);
                  }
                );
              })
              .catch(data => {
                const { content = {} } = data;
                notification.warn(content);
              });
          } else {
            const nameMapError = {
              RULE_TYPE: `规则类型:${overThanTen ? `（${totalCount}）` : ""}`
            };
            decisionModalError(dependenceList, nameMapError, {
              title:
                "该因子模板正在被以下组件使用，无法进行此操作，请取消后重试。",
              ellipsis: overThanTen
            });
          }
        })
        .catch(data => {
          const { content = {} } = data;
          notification.warn(content);
        });
    }
  };

  onCreateBtnClick = () => {
    fetchAllEnumInfo()
      .then(data => {
        const { content: enumTranslate = {} } = data;
        this.setState(
          {
            editConfirmShow: true,
            templateInfo: {},
            enumTranslate,
            fieldSaveError: "",
            enumShow: false,
            enumList: [{}]
          },
          () => {
            this.props.form.resetFields();
          }
        );
      })
      .catch(data => {
        const { content = {} } = data;
        notification.warn(content);
      });
  };

  onCloseBtnClick = () => {
    const { selectedRowKeys = [], pagination } = this.state;
    const ids = selectedRowKeys.map(id => {
      return { id };
    });
    fetchTemplateDependencies(ids)
      .then(data => {
        const { content = [] } = data;
        if (content.length) {
          const rows = content.map((item, index) => {
            const {
              fieldTemplateName: templateName,
              reasonCode: errorReason
            } = item;
            return { templateName, errorReason, key: index };
          });
          antiModalError(rows);
        } else {
          batchInactiveTemplates(ids)
            .then(() => {
              this.setState({ selectedRowKeys: [] }, () => {
                notification.success({ message: "操作成功" });
                this.loadFactorTemplates(pagination.current);
              });
            })
            .catch(data => {
              const { content = {} } = data;
              notification.warn(content);
            });
        }
      })
      .catch(data => {
        const { content = {} } = data;
        notification.warn(content);
      });
  };

  onActiveBtnClick = () => {
    const { selectedRowKeys = [], pagination } = this.state;
    const ids = selectedRowKeys.map(id => {
      return { id };
    });
    batchActiveTemplates(ids)
      .then(() => {
        this.setState({ selectedRowKeys: [] }, () => {
          notification.success({ message: "操作成功" });
          this.loadFactorTemplates(pagination.current);
        });
      })
      .catch(data => {
        const { content = {} } = data;
        notification.warn(content);
      });
  };
  onEditIconClick = (templateInfo, editType = "edit") => {
    const { id } = templateInfo;
    fetchTemplateInfo(id)
      .then(async data => {
        const { content = {} } = data;
        const {
          conditionList = [],
          aggregationDto: { operatorList = [] } = {},
          hasAggregation = false
        } = content;
        let state = {};
        if (hasAggregation) {
          const { fieldId } =
            conditionList.find(item => item.fieldType === "LIST") || {};
          const {
            content: conditionFieldOfFields = []
          } = await fetchListFieldAndStatisticalField({ id: fieldId });
          let conditionFieldOfFieldMap = {};
          conditionFieldOfFields.forEach(field => {
            const { id } = field;
            conditionFieldOfFieldMap = {
              ...conditionFieldOfFieldMap,
              [id]: field
            };
          });
          state = { conditionFieldOfFields, conditionFieldOfFieldMap };
        }
        const { hasCalculation } = operatorList[0] || {};
        if (hasCalculation) {
          const {
            content: conditionFields = []
          } = await fetchActiveFieldNotTypeField();
          let conditionFieldMap = {};
          conditionFields.forEach(field => {
            const { id } = field;
            conditionFieldMap = { ...conditionFieldMap, [id]: field };
          });
          state = { ...state, conditionFields, conditionFieldMap };
        }
        const { content: enumTranslate = {} } = await fetchAllEnumInfo();
        this.setState(
          {
            ...state,
            enumTranslate,
            isView: editType === "view",
            isModify: editType === "modifyName",
            editConfirmShow: true,
            enumList: conditionList,
            templateInfo: content,
            random: Math.random().toString()
          },
          () => {
            this.props.form.resetFields();
            this.props.form.validateFields();
          }
        );
      })
      .catch(data => {
        const { content = {} } = data;
        notification.warn(content);
      });
  };

  onEditCancel = () => {
    this.setState(
      {
        isView: false,
        isModify: false,
        editConfirmShow: false,
        templateInfo: {},
        enumShow: false,
        enumList: [{}],
        fieldSaveError: ""
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onFieldSave = () => {
    this.props.form.validateFields((errors, values) => {
      let {
        enumList = [],
        templateInfo = {},
        isModify,
        pagination
      } = this.state;
      let hasEnumError = false;

      const enumListLen = enumList.length;
      for (let i = 0; i < enumListLen; i++) {
        const item = enumList[i];
        const {
          fieldId,
          fieldType,
          filterType,
          propertyFieldId,
          propertyFieldType,
          operatorChar,
          operatorFieldId,
          subtractFieldId,
          fraudOperatorChar
        } = item;
        enumList[i]["fieldIdError"] = false;
        enumList[i]["filterTypeError"] = false;
        enumList[i]["propertyFieldIdError"] = false;
        enumList[i]["operatorCharError"] = false;
        enumList[i]["operatorFieldIdError"] = false;
        enumList[i]["subtractFieldIdError"] = false;
        if (!fieldId) {
          enumList[i]["fieldIdError"] = true;
          hasEnumError = true;
        } else if (
          fieldType === "DATETIME" &&
          fraudOperatorChar === "SUBTRACTION" &&
          !subtractFieldId
        ) {
          enumList[i]["subtractFieldIdError"] = true;
          hasEnumError = true;
        }
        if (fieldType === "LIST") {
          if (!propertyFieldId) {
            enumList[i]["propertyFieldIdError"] = true;
            hasEnumError = true;
          }
          if (!filterType && propertyFieldType !== "DECIMAL") {
            enumList[i]["filterTypeError"] = true;
            hasEnumError = true;
          }
          if (
            (!operatorChar || !operatorFieldId) &&
            (operatorChar || operatorFieldId)
          ) {
            if (!operatorChar) {
              enumList[i]["operatorCharError"] = true;
              hasEnumError = true;
            }
            if (!operatorFieldId) {
              enumList[i]["operatorFieldIdError"] = true;
              hasEnumError = true;
            }
          }
        } else {
          if (!filterType) {
            enumList[i]["filterTypeError"] = true;
            hasEnumError = true;
          }
        }
      }
      const { hasAggregation = false, aggregationDto = {} } = templateInfo;
      const { aggregationList = [], operatorList = [] } = aggregationDto;
      if (hasAggregation) {
        aggregationList.forEach((item, index) => {
          aggregationList[index]["fieldIdError"] = false;
          aggregationList[index]["aggregationTypeError"] = false;
          aggregationList[index]["operatorCharError"] = false;
          aggregationList[index]["operatorFieldIdError"] = false;
          operatorList[index]["operatorCharError"] = false;
          operatorList[index]["optCodeSecondError"] = false;
          operatorList[index]["finalOperatorError"] = false;
          const {
            fieldId,
            aggregationType,
            operatorFieldId,
            operatorChar: operatorCharFirst
          } = item;
          if (!fieldId) {
            aggregationList[index]["fieldIdError"] = true;
            hasEnumError = true;
          }
          if (!aggregationType) {
            aggregationList[index]["aggregationTypeError"] = true;
            hasEnumError = true;
          }
          const { operatorChar, optCodeSecond, finalOperator } =
            operatorList[index] || {};
          if (
            (!operatorCharFirst || !operatorFieldId) &&
            (operatorCharFirst || operatorFieldId)
          ) {
            if (!operatorCharFirst) {
              operatorList[index]["operatorCharError"] = true;
              hasEnumError = true;
            }
            if (!operatorFieldId) {
              operatorList[index]["operatorFieldIdError"] = true;
              hasEnumError = true;
            }
          }
          if (
            (!operatorChar || !optCodeSecond) &&
            (operatorChar || optCodeSecond)
          ) {
            if (!operatorChar) {
              operatorList[index]["operatorCharError"] = true;
              hasEnumError = true;
            }
            if (!optCodeSecond) {
              operatorList[index]["optCodeSecondError"] = true;
              hasEnumError = true;
            }
          }
          if (!finalOperator) {
            operatorList[index]["finalOperatorError"] = true;
            hasEnumError = true;
          }
        });
        if (!aggregationList.length) {
          aggregationList[0] = {
            fieldIdError: true,
            aggregationTypeError: true
          };
          hasEnumError = true;
        }
        if (!operatorList.length) {
          operatorList[0] = { finalOperatorError: true };
          hasEnumError = true;
        }
      }

      if (errors || hasEnumError) {
        if (hasEnumError) {
          this.setState({
            enumList,
            templateInfo: {
              ...templateInfo,
              aggregationDto: {
                ...aggregationDto,
                aggregationList,
                operatorList
              }
            }
          });
        }
        return;
      }
      this.setState({ loading: true });
      try {
        const { id = "" } = templateInfo;
        const saveData = this._buildData(values);
        const { templateName } = values;
        const isEdit = id > 0;
        const promise = isEdit
          ? isModify
            ? updateTemplateName({
                id,
                name: templateName
              })
            : updateTemplate({ id, domainType: domainType, ...saveData })
          : addTemplate({ ...saveData, domainType: domainType });
        promise
          .then(data => {
            this.setState(
              { selectedRowKeys: [], editConfirmShow: false, loading: false },
              () => {
                this.loadFactorTemplates(isEdit ? pagination.current : 1);
              }
            );
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

  onDeleteIconClick = record => {
    confirm({
      title: "是否确认删除?",
      content: "",
      okText: "确定",
      okType: "primary",
      cancelText: "取消",
      onOk: async () => {
        this.onTemplateDelete();
      },
      onCancel: () => {
        this.onFieldCancel();
      }
    });
    this.setState({
      // deleteConfirmShow: true,
      record
    });
  };

  onFieldCancel = () => {
    this.setState({
      deleteConfirmShow: false,
      fieldSaveError: ""
    });
  };

  onTemplateDelete = async () => {
    const { id } = this.state.record;
    delTemplate({ id })
      .then(res => {
        const { actionStatus = "" } = res;
        if (actionStatus === SUCCESS) {
          this.setState(
            {
              deleteConfirmShow: false
            },
            () => {
              this.loadFactorTemplates();
            }
          );
        }
      })
      .catch(data => {
        const { content = {} } = data;
        const { message = "" } = content;
        this.setState({
          deleteConfirmShow: false,
          promptShow: true,
          promptMsg: message
        });
      });
  };

  onEnumAdd = () => {
    const { enumList } = this.state;
    enumList.push({});
    this.setState({ enumList });
  };

  onEnumDelete = index => {
    const { enumList } = this.state;
    let { templateInfo = {} } = this.state;
    enumList.splice(index, 1);
    const { fieldId: listFieldId } =
      enumList.find(item => item.fieldType === "LIST") || {};
    if (!listFieldId) {
      templateInfo = {
        ...templateInfo,
        hasAggregation: false,
        aggregationDto: {}
      };
    }
    this.setState({ enumList, templateInfo });
  };

  onEnumChange = (value, index, prop) => {
    const { enumList } = this.state;
    let { templateInfo = {} } = this.state;
    if (typeof value === "object") {
      const item = enumList[index] || {};
      enumList[index] = { ...item, ...value };
    } else {
      enumList[index][prop] = value;
    }
    const { fieldId: listFieldId } =
      enumList.find(item => item.fieldType === "LIST") || {};
    if (!listFieldId) {
      templateInfo = {
        ...templateInfo,
        hasAggregation: false,
        aggregationDto: {}
      };
    }
    this.setState({ listFieldId, enumList, templateInfo });
  };

  _buildData = (data = {}) => {
    const { enumList = [], templateInfo = {} } = this.state;
    const { fieldId: listFieldId } =
      enumList.find(item => item.fieldType === "LIST") || {};
    const { aggregationDto = {}, hasAggregation = false } = templateInfo;
    const { aggregationList = [], operatorList = [] } = aggregationDto;
    return {
      aggregationDto: hasAggregation
        ? {
            aggregationList: aggregationList.map(item => {
              const {
                aggregationCode,
                aggregationType,
                fieldCode,
                fieldId,
                fieldType,
                operatorChar,
                operatorFieldCode,
                operatorFieldId
              } = item;
              return {
                aggregationCode,
                aggregationType,
                fieldCode,
                fieldId,
                fieldType,
                operatorChar,
                operatorFieldCode,
                operatorFieldId
              };
            }),
            operatorList: operatorList.map(item => {
              const {
                finalOperator,
                hasCalculation = false,
                isAggregationType,
                operatorChar,
                optCodeFirst,
                optCodeSecond
              } = item;
              return {
                finalOperator,
                hasCalculation,
                isAggregationType,
                operatorChar,
                optCodeFirst,
                optCodeSecond
              };
            })
          }
        : undefined,
      conditionList: enumList.map(item => {
        const {
          fieldCode,
          fieldId,
          fieldType,
          filterType,
          fraudOperatorChar,
          operatorChar,
          operatorFieldCode,
          operatorFieldId,
          operatorFieldType,
          propertyFieldCode,
          propertyFieldId,
          propertyFieldType,
          subtractFieldId,
          subtractFieldName,
          timeUnit,
          operatorType,
          dateFormat
        } = item;
        return {
          fieldCode,
          fieldId,
          fieldType,
          filterType,
          fraudOperatorChar,
          operatorChar,
          operatorFieldCode,
          operatorFieldId,
          operatorFieldType,
          propertyFieldCode,
          propertyFieldId,
          propertyFieldType,
          subtractFieldId,
          subtractFieldName,
          timeUnit,
          operatorType,
          dateFormat,
          hasCalculation: operatorType === "ARITHMETIC"
        };
      }),
      hasAggregation,
      listFieldId,
      ...data
    };
  };
}

export default Form.create()(BasicField);
