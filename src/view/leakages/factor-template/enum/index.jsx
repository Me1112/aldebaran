import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Icon, notification, Row, Select, Radio, Input } from "antd";
import classnames from "classnames";
import {
  fetchActiveFieldNotTypeField,
  fetchActiveFieldListByIdAndType
} from "@action/leakage";
import {
  FIELD_TYPE_MAP,
  BASIC_STRING_OPERATORS,
  LIST_STRING_OPERATORS,
  STRING_OPERATOR_MAP,
  NUMBER_OPERATORS,
  NUMBER_OPERATOR_MAP,
  DATE_OPERATORS,
  DATE_OPERATOR_MAP,
  ENUM_OPERATORS,
  ENUM_OPERATOR_MAP,
  ARITHMETIC_OPERATORS,
  ARITHMETIC_OPERATOR_MAP,
  NUMBER_IN_LIST_OPERATORS,
  NUMBER_IN_LIST_OPERATOR_MAP,
  DATE_IN_LIST_OPERATORS,
  DATE_IN_LIST_OPERATOR_MAP,
  DATE_FRAUD_OPERATORS,
  DATE_FRAUD_OPERATOR_MAP,
  DATE_SUBTRACTION_UNITS,
  DATE_SUBTRACTION_UNIT_MAP,
  DATE_EXTRACTION_TIME_POINT_OPERATORS,
  DATE_EXTRACTION_TIME_POINT_OPERATOR_MAP,
  NUMBER_LIMIT_TIME_OPERATORS,
  NUMBER_LIMIT_TIME_OPERATOR_MAP,
  OPERATE_TYPE_LIST,
  OPERATE_TYPE_MAP,
  DATE_FORMAT_LIST,
  DATE_FORMAT_MAP
} from "@common/constant";
import "./index.less";

const { Option } = Select;

export default class Enum extends Component {
  constructor(props) {
    super(props);
    const { random = "" } = props;
    this.state = {
      searchValue: "",
      conditionFields: [],
      conditionFieldOfFields: [],
      random,
      chooseFilterType: "filter"
    };
  }

  static defaultProps = {
    visible: false,
    disabled: false,
    list: [],
    random: "",
    chooseFilterType: ""
  };

  static propTypes = {
    random: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    list: PropTypes.array,
    onEnumAdd: PropTypes.func,
    onEnumDelete: PropTypes.func,
    onEnumChange: PropTypes.func
  };

  componentWillReceiveProps(nextProps, nextContext) {
    const { random, list } = nextProps;
    if (random !== this.state.random) {
      const { fieldId: listFieldId } =
        list.find(item => item.fieldType === "LIST") || {};
      listFieldId && this.loadActiveFieldListByIdAndType(listFieldId);
      this.setState({ random }, () => {
        this.loadActiveFieldNotTypeFields();
      });
    }
  }

  componentDidMount() {
    const { list } = this.props;
    this.loadActiveFieldNotTypeFields();
    const { fieldId: listFieldId } =
      list.find(item => item.fieldType === "LIST") || {};
    listFieldId && this.loadActiveFieldListByIdAndType(listFieldId);
  }

  render() {
    const { visible, disabled, list } = this.props;
    const listCount = list.length;
    let listFieldId;
    let selectedPropertyFieldIds = [];
    let noListFieldIds = [];
    list.forEach(item => {
      const { fieldType, fieldId, propertyFieldId } = item;
      if (fieldType === "LIST") {
        listFieldId = fieldId;
        if (
          propertyFieldId &&
          !selectedPropertyFieldIds.includes(propertyFieldId)
        ) {
          selectedPropertyFieldIds = [
            ...selectedPropertyFieldIds,
            propertyFieldId
          ];
        }
      } else if (fieldId) {
        noListFieldIds = [...noListFieldIds, fieldId];
      }
    });
    const {
      conditionFields = [],
      conditionFieldOfFields = [],
      conditionFieldMap = {}
    } = this.state;
    return (
      <div
        className="factor-template-condition-enums"
        style={{ display: visible ? "" : "none" }}
      >
        <div className="enum-container">
          {list.map((item, index) => {
            let {
              fieldType,
              fieldId,
              fieldIdError = false,
              subtractFieldId,
              subtractFieldIdError = false,
              fieldName = (conditionFieldMap[fieldId] || {}).fieldName,
              filterType = "",
              filterTypeError = false,
              fraudOperatorChar = "",
              fraudOperatorCharError = false,
              timeUnit = "DAY",
              operatorChar = "",
              operatorCharError = false,
              operatorFieldId = "",
              operatorFieldIdError = false,
              propertyFieldId = "",
              propertyFieldName = "",
              propertyFieldIdError = false,
              propertyFieldType,
              operatorType,
              dateFormat
            } = item;
            console.log("item----->", item);
            let operators = [];
            let operatorMap = {};
            let fType = fieldType;
            let isList = fType === "LIST";
            let isString = fType === "STRING";
            let isNumber = fType === "DECIMAL";
            let isDate = fType === "DATETIME";
            let isBool = fType === "BOOLEAN";
            let isEnum = fType === "ENUM";
            let isStringEqual = filterType === "EQUALS_FIELD";
            let isEnumEqual = filterType === "ENUM_EQUALS_FIELD";
            const isSubtraction = fraudOperatorChar === "SUBTRACTION";
            const isExtractionTimePoint =
              fraudOperatorChar === "EXTRACTION_TIME_POINT";
            if (isList) {
              fType = propertyFieldType;
            }
            let isPropString = fType === "STRING";
            let isPropNumber = fType === "DECIMAL";
            let isPropDate = fType === "DATETIME";
            let isPropBool = fType === "BOOLEAN";
            let isPropEnum = fType === "ENUM";

            switch (fType) {
              case "DECIMAL":
                operators = NUMBER_OPERATORS;
                operatorMap = NUMBER_OPERATOR_MAP;
                if (isList) {
                  operators = NUMBER_IN_LIST_OPERATORS;
                  operatorMap = NUMBER_IN_LIST_OPERATOR_MAP;
                }
                if (!filterType) {
                  filterType = operators[0];
                }
                if (!operatorType) {
                  operatorType = OPERATE_TYPE_LIST[0];
                }

                break;
              case "STRING":
                operators = BASIC_STRING_OPERATORS;
                if (isList) {
                  operators = LIST_STRING_OPERATORS;
                }
                operatorMap = STRING_OPERATOR_MAP;
                break;
              case "BOOLEAN":
                break;
              case "DATETIME":
                if (!dateFormat) {
                  dateFormat = DATE_FORMAT_LIST[0];
                }
                operators = DATE_OPERATORS;
                operatorMap = DATE_OPERATOR_MAP;
                if (isList) {
                  operators = DATE_IN_LIST_OPERATORS;
                  operatorMap = DATE_IN_LIST_OPERATOR_MAP;
                }
                if (isExtractionTimePoint) {
                  operators = DATE_EXTRACTION_TIME_POINT_OPERATORS;
                  operatorMap = DATE_EXTRACTION_TIME_POINT_OPERATOR_MAP;
                }
                break;
              case "ENUM":
                operators = ENUM_OPERATORS;
                operatorMap = ENUM_OPERATOR_MAP;
                break;
              case "LIST":
                break;
            }
            return (
              <Row className="enum-row" key={`${fieldId}-${index}`}>
                {disabled
                  ? null
                  : index === 0 &&
                    listCount > 1 && (
                      <Icon
                        type="minus-circle"
                        style={{ marginLeft: -14 }}
                        onClick={() => this.props.onEnumDelete(index)}
                      />
                    )}
                {disabled ? null : (
                  <Icon
                    type={index === 0 ? "plus-circle" : "minus-circle"}
                    onClick={() => this.onIconClick(index)}
                  />
                )}
                {isSubtraction && <span className="bracket">(</span>}
                <Select
                  className={classnames({ "has-error": fieldIdError })}
                  placeholder=""
                  value={fieldId}
                  dropdownMatchSelectWidth={false}
                  showSearch
                  disabled={disabled}
                  optionLabelProp="title"
                  getPopupContainer={trigger => trigger.parentElement}
                  defaultActiveFirstOption={false}
                  onChange={e => {
                    this.onConditionListChange(e, index, "fieldId");
                  }}
                  dropdownMenuStyle={{ maxHeight: 160 }}
                  filterOption={(inputValue = "", option) => {
                    const { props: { title } = {} } = option;
                    return title
                      .toLowerCase()
                      .includes(inputValue.toLowerCase());
                  }}
                  onSearch={this.onSearch}
                  onFocus={this.onBlur}
                  onBlur={this.onBlur}
                >
                  {conditionFields
                    .filter(item => {
                      const { id, fieldType } = item;
                      return (
                        listFieldId === id ||
                        (!listFieldId && fieldType === "LIST") ||
                        ((!noListFieldIds.includes(id) || id === fieldId) &&
                          fieldType !== "LIST")
                      );
                    })
                    .map(item => {
                      const { id, fieldName, fieldType } = item;
                      const title = `${fieldName}（${FIELD_TYPE_MAP[fieldType]}）`;
                      return (
                        <Option key={id} value={id} title={title}>
                          {this._buildHighlightKeywords(title)}
                        </Option>
                      );
                    })}
                </Select>
                {isString && (
                  <Fragment>
                    <Radio.Group
                      className={classnames({ "has-error": filterTypeError })}
                      disabled={disabled}
                      onChange={e =>
                        this.onConditionListChange(
                          e.target.value,
                          index,
                          "filterType"
                        )
                      }
                      value={filterType}
                    >
                      {operators.map(o => (
                        <Radio key={o} value={o}>
                          {operatorMap[o]}
                        </Radio>
                      ))}
                    </Radio.Group>
                    {isStringEqual ? (
                      <Select
                        className={classnames({ "has-error": fieldIdError })}
                        placeholder=""
                        value={operatorFieldId}
                        dropdownMatchSelectWidth={false}
                        showSearch
                        disabled={disabled}
                        optionLabelProp="title"
                        getPopupContainer={trigger => trigger.parentElement}
                        defaultActiveFirstOption={false}
                        onChange={e => {
                          this.onConditionListChange(
                            e,
                            index,
                            "operatorFieldId"
                          );
                        }}
                        dropdownMenuStyle={{ maxHeight: 160 }}
                        filterOption={(inputValue = "", option) => {
                          const { props: { title } = {} } = option;
                          return title
                            .toLowerCase()
                            .includes(inputValue.toLowerCase());
                        }}
                        onSearch={this.onSearch}
                        onFocus={this.onBlur}
                        onBlur={this.onBlur}
                      >
                        {conditionFields
                          .filter(item => {
                            return item.fieldType === "STRING";
                          })
                          .map(item => {
                            const { id, fieldName, fieldType } = item;
                            const title = `${fieldName}（${FIELD_TYPE_MAP[fieldType]}）`;
                            return (
                              <Option key={id} value={id} title={title}>
                                {this._buildHighlightKeywords(title)}
                              </Option>
                            );
                          })}
                      </Select>
                    ) : (
                      <Input disabled />
                    )}
                  </Fragment>
                )}
                {isDate && (
                  <Fragment>
                    <Select
                      className={classnames("w160", {
                        "has-error": fraudOperatorCharError
                      })}
                      placeholder=""
                      value={fraudOperatorChar || filterType}
                      dropdownMenuStyle={{ maxHeight: 160 }}
                      disabled={disabled}
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e =>
                        this.onConditionChangeFraudOperatorCharOrFilterType(
                          e,
                          index
                        )
                      }
                      dropdownMatchSelectWidth={false}
                    >
                      {DATE_FRAUD_OPERATORS.map(o => (
                        <Option
                          key={o}
                          value={o}
                          title={DATE_FRAUD_OPERATOR_MAP[o]}
                        >
                          {DATE_FRAUD_OPERATOR_MAP[o]}
                        </Option>
                      ))}
                    </Select>
                    <Radio.Group
                      className={classnames({ "has-error": filterTypeError })}
                      onChange={e =>
                        this.onConditionListChange(
                          e.target.value,
                          index,
                          "dateFormat"
                        )
                      }
                      value={dateFormat}
                    >
                      {DATE_FORMAT_LIST.map(o => (
                        <Radio key={o} value={o}>
                          {DATE_FORMAT_MAP[o]}
                        </Radio>
                      ))}
                    </Radio.Group>
                    {!isSubtraction && !isExtractionTimePoint && (
                      <Fragment>
                        <Input disabled />
                        {filterType.startsWith("BETWEEN_") && (
                          <Input disabled />
                        )}
                      </Fragment>
                    )}
                    {isSubtraction && (
                      <Select
                        className={classnames({
                          "has-error": subtractFieldIdError
                        })}
                        placeholder=""
                        value={subtractFieldId}
                        dropdownMatchSelectWidth={false}
                        showSearch
                        disabled={disabled}
                        getPopupContainer={trigger => trigger.parentElement}
                        defaultActiveFirstOption={false}
                        optionLabelProp="title"
                        onChange={e => {
                          this.onConditionListChange(
                            e,
                            index,
                            "subtractFieldId"
                          );
                        }}
                        dropdownMenuStyle={{ maxHeight: 160 }}
                        filterOption={(inputValue = "", option) => {
                          const { props: { title } = {} } = option;
                          return title
                            .toLowerCase()
                            .includes(inputValue.toLowerCase());
                        }}
                        onSearch={this.onSearch}
                        onFocus={this.onBlur}
                        onBlur={this.onBlur}
                      >
                        {conditionFields
                          .filter(item => {
                            return fieldType === item.fieldType;
                          })
                          .map(item => {
                            const { id, fieldName, fieldType } = item;
                            const title = `${fieldName}（${FIELD_TYPE_MAP[fieldType]}）`;
                            return (
                              <Option key={id} value={id} title={title}>
                                {this._buildHighlightKeywords(title)}
                              </Option>
                            );
                          })}
                      </Select>
                    )}
                    {isSubtraction && <span className="bracket">)</span>}
                  </Fragment>
                )}
                {(isNumber ||
                  (isDate && (isSubtraction || isExtractionTimePoint))) && (
                  <Fragment>
                    {isNumber && (
                      <Radio.Group
                        className={classnames({ "has-error": filterTypeError })}
                        onChange={e =>
                          this.onConditionListChange(
                            e.target.value,
                            index,
                            "operatorType"
                          )
                        }
                        value={operatorType}
                      >
                        {OPERATE_TYPE_LIST.map(o => (
                          <Radio key={o} value={o}>
                            {OPERATE_TYPE_MAP[o]}
                          </Radio>
                        ))}
                      </Radio.Group>
                    )}
                    {operatorType === "ARITHMETIC" ? (
                      <Select
                        className={classnames("w50", {
                          "has-error": operatorCharError
                        })}
                        placeholder=""
                        value={operatorChar}
                        dropdownMenuStyle={{ maxHeight: 160 }}
                        disabled={disabled}
                        getPopupContainer={trigger => trigger.parentElement}
                        onChange={e => {
                          this.onConditionListChange(e, index, "operatorChar");
                        }}
                        defaultActiveFirstOption={false}
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
                    ) : (
                      <Select
                        className={classnames("w160", {
                          "has-error": filterTypeError
                        })}
                        placeholder=""
                        value={filterType}
                        dropdownMenuStyle={{ maxHeight: 160 }}
                        disabled={disabled}
                        getPopupContainer={trigger => trigger.parentElement}
                        onChange={e => {
                          this.onConditionListChange(e, index, "filterType", {
                            fType: fieldType,
                            fOperatorChar:
                              fraudOperatorChar || "RECENT_TIME_RANG_DAY"
                          });
                        }}
                        dropdownMatchSelectWidth={false}
                      >
                        {operators.map(o => (
                          <Option key={o} value={o} title={operatorMap[o]}>
                            {operatorMap[o]}
                          </Option>
                        ))}
                      </Select>
                    )}
                    {operatorType === "ARITHMETIC" && (
                      <span>
                        <Select
                          className={classnames({ "has-error": fieldIdError })}
                          placeholder=""
                          value={operatorFieldId}
                          dropdownMatchSelectWidth={false}
                          showSearch
                          disabled={disabled}
                          optionLabelProp="title"
                          getPopupContainer={trigger => trigger.parentElement}
                          defaultActiveFirstOption={false}
                          onChange={e => {
                            this.onConditionListChange(
                              e,
                              index,
                              "operatorFieldId"
                            );
                          }}
                          dropdownMenuStyle={{ maxHeight: 160 }}
                          filterOption={(inputValue = "", option) => {
                            const { props: { title } = {} } = option;
                            return title
                              .toLowerCase()
                              .includes(inputValue.toLowerCase());
                          }}
                          onSearch={this.onSearch}
                          onFocus={this.onBlur}
                          onBlur={this.onBlur}
                        >
                          {conditionFields
                            .filter(item => {
                              return item.fieldType === "DECIMAL";
                            })
                            .map(item => {
                              const { id, fieldName, fieldType } = item;
                              const title = `${fieldName}（${FIELD_TYPE_MAP[fieldType]}）`;
                              return (
                                <Option key={id} value={id} title={title}>
                                  {this._buildHighlightKeywords(title)}
                                </Option>
                              );
                            })}
                        </Select>
                        <Select
                          className={classnames("w160", {
                            "has-error": filterTypeError
                          })}
                          placeholder=""
                          value={filterType}
                          dropdownMenuStyle={{ maxHeight: 160 }}
                          disabled={disabled}
                          getPopupContainer={trigger => trigger.parentElement}
                          onChange={e => {
                            this.onConditionListChange(e, index, "filterType", {
                              fType: fieldType,
                              fOperatorChar:
                                fraudOperatorChar || "RECENT_TIME_RANG_DAY"
                            });
                          }}
                          dropdownMatchSelectWidth={false}
                        >
                          {operators.map(o => (
                            <Option key={o} value={o} title={operatorMap[o]}>
                              {operatorMap[o]}
                            </Option>
                          ))}
                        </Select>
                      </span>
                    )}
                    <Input disabled />
                    {filterType.startsWith("BETWEEN_") && <Input disabled />}
                  </Fragment>
                )}
                {isNumber && filterType.endsWith("_LIMIT_TIME") && (
                  <Fragment>
                    <Select
                      className="w170"
                      placeholder=""
                      value={fraudOperatorChar}
                      dropdownMenuStyle={{ maxHeight: 160 }}
                      disabled={disabled}
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e => {
                        this.onConditionListChange(
                          e,
                          index,
                          "fraudOperatorChar"
                        );
                      }}
                      dropdownMatchSelectWidth={false}
                    >
                      {NUMBER_LIMIT_TIME_OPERATORS.map(o => (
                        <Option
                          key={o}
                          value={o}
                          title={NUMBER_LIMIT_TIME_OPERATOR_MAP[o]}
                        >
                          {NUMBER_LIMIT_TIME_OPERATOR_MAP[o]}
                        </Option>
                      ))}
                    </Select>
                    <Input disabled />
                  </Fragment>
                )}
                {isDate && isSubtraction && (
                  <Select
                    style={{ marginLeft: 10 }}
                    className="w50"
                    dropdownMatchSelectWidth={false}
                    disabled={disabled}
                    placeholder=""
                    value={timeUnit}
                    dropdownMenuStyle={{ maxHeight: "none" }}
                    getPopupContainer={trigger => trigger.parentElement}
                    onChange={e => {
                      this.onConditionListChange(e, index, "timeUnit");
                    }}
                  >
                    {DATE_SUBTRACTION_UNITS.map(o => (
                      <Option
                        key={o}
                        value={o}
                        title={DATE_SUBTRACTION_UNIT_MAP[o]}
                      >
                        {DATE_SUBTRACTION_UNIT_MAP[o]}
                      </Option>
                    ))}
                  </Select>
                )}
                {isBool && (
                  <span style={{ marginLeft: 10 }}>= {fieldName}</span>
                )}
                {isEnum && (
                  <Fragment>
                    <Radio.Group
                      className={classnames({ "has-error": filterTypeError })}
                      disabled={disabled}
                      onChange={e =>
                        this.onConditionListChange(
                          e.target.value,
                          index,
                          "filterType"
                        )
                      }
                      value={filterType}
                    >
                      {operators.map(o => (
                        <Radio key={o} value={o}>
                          {operatorMap[o]}
                        </Radio>
                      ))}
                    </Radio.Group>
                    {isEnumEqual ? (
                      <Select
                        className={classnames({ "has-error": fieldIdError })}
                        placeholder=""
                        value={operatorFieldId}
                        dropdownMatchSelectWidth={false}
                        showSearch
                        disabled={disabled}
                        optionLabelProp="title"
                        getPopupContainer={trigger => trigger.parentElement}
                        defaultActiveFirstOption={false}
                        onChange={e => {
                          this.onConditionListChange(
                            e,
                            index,
                            "operatorFieldId"
                          );
                        }}
                        dropdownMenuStyle={{ maxHeight: 160 }}
                        filterOption={(inputValue = "", option) => {
                          const { props: { title } = {} } = option;
                          return title
                            .toLowerCase()
                            .includes(inputValue.toLowerCase());
                        }}
                        onSearch={this.onSearch}
                        onFocus={this.onBlur}
                        onBlur={this.onBlur}
                      >
                        {conditionFields
                          .filter(item => {
                            return item.fieldType === "ENUM";
                          })
                          .map(item => {
                            const { id, fieldName, fieldType } = item;
                            const title = `${fieldName}（${FIELD_TYPE_MAP[fieldType]}）`;
                            return (
                              <Option key={id} value={id} title={title}>
                                {this._buildHighlightKeywords(title)}
                              </Option>
                            );
                          })}
                      </Select>
                    ) : (
                      <Input disabled />
                    )}
                  </Fragment>
                )}
                {isList && (
                  <Fragment>
                    <Select
                      className={classnames({
                        "has-error": propertyFieldIdError
                      })}
                      placeholder=""
                      value={propertyFieldId}
                      dropdownMenuStyle={{ maxHeight: 160 }}
                      dropdownMatchSelectWidth={false}
                      disabled={disabled}
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e => {
                        this.onConditionListChange(e, index, "propertyFieldId");
                      }}
                    >
                      {conditionFieldOfFields
                        .filter(item => {
                          const { id } = item;
                          return (
                            !selectedPropertyFieldIds.includes(id) ||
                            id === propertyFieldId
                          );
                        })
                        .map(item => {
                          const { id, fieldName } = item;
                          return (
                            <Option key={id} value={id} title={fieldName}>
                              {fieldName}
                            </Option>
                          );
                        })}
                    </Select>
                    {isPropString && (
                      <Fragment>
                        <Select
                          className={classnames({
                            "has-error": filterTypeError
                          })}
                          placeholder=""
                          value={filterType}
                          style={{ width: 150 }}
                          disabled={disabled}
                          getPopupContainer={trigger => trigger.parentElement}
                          onChange={e => {
                            this.onConditionListChange(e, index, "filterType");
                          }}
                        >
                          {operators.map(o => {
                            return (
                              <Option key={o} value={o} title={operatorMap[o]}>
                                {operatorMap[o]}
                              </Option>
                            );
                          })}
                        </Select>
                        <Input disabled />
                      </Fragment>
                    )}
                    {isPropDate && (
                      <Fragment>
                        <Radio.Group
                          className={classnames({
                            "has-error": filterTypeError
                          })}
                          disabled={disabled}
                          onChange={e =>
                            this.onConditionListChange(
                              e.target.value,
                              index,
                              "filterType"
                            )
                          }
                          value={filterType}
                        >
                          {operators.map(o => (
                            <Radio key={o} value={o}>
                              {operatorMap[o]}
                            </Radio>
                          ))}
                        </Radio.Group>
                        <Input disabled />
                      </Fragment>
                    )}
                    {isPropNumber && (
                      <Fragment>
                        <Select
                          className={classnames("w50", {
                            "has-error": operatorCharError
                          })}
                          placeholder=""
                          value={operatorChar}
                          dropdownMenuStyle={{ maxHeight: 160 }}
                          allowClear
                          disabled={disabled}
                          getPopupContainer={trigger => trigger.parentElement}
                          onChange={e => {
                            this.onConditionListChange(
                              e,
                              index,
                              "operatorChar"
                            );
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
                          className={classnames("w160", {
                            "has-error": operatorFieldIdError
                          })}
                          placeholder=""
                          value={operatorFieldId}
                          dropdownMenuStyle={{ maxHeight: 160 }}
                          allowClear
                          disabled={disabled}
                          getPopupContainer={trigger => trigger.parentElement}
                          onChange={e => {
                            this.onConditionListChange(
                              e,
                              index,
                              "operatorFieldId"
                            );
                          }}
                        >
                          {conditionFieldOfFields
                            .filter(
                              item => item.fieldType === propertyFieldType
                            )
                            .map(item => {
                              const { id, fieldName } = item;
                              return (
                                <Option key={id} value={id} title={fieldName}>
                                  {fieldName}
                                </Option>
                              );
                            })}
                        </Select>
                        <Select
                          className={classnames("w160", {
                            "has-error": filterTypeError
                          })}
                          placeholder=""
                          value={filterType}
                          dropdownMenuStyle={{ maxHeight: 160 }}
                          disabled={disabled}
                          getPopupContainer={trigger => trigger.parentElement}
                          onChange={e => {
                            this.onConditionListChange(e, index, "filterType");
                          }}
                        >
                          {operators.map(o => (
                            <Option
                              key={o}
                              value={o}
                              title={NUMBER_OPERATOR_MAP[o]}
                            >
                              {NUMBER_OPERATOR_MAP[o]}
                            </Option>
                          ))}
                        </Select>
                        <Input disabled />
                        {filterType.startsWith("BETWEEN_") && (
                          <Input disabled />
                        )}
                      </Fragment>
                    )}
                    {isPropBool && (
                      <span style={{ marginLeft: 10 }}>
                        = {propertyFieldName}
                      </span>
                    )}
                    {isPropEnum && (
                      <Fragment>
                        <Radio.Group
                          className={classnames({
                            "has-error": filterTypeError
                          })}
                          disabled={disabled}
                          onChange={e =>
                            this.onConditionListChange(
                              e.target.value,
                              index,
                              "filterType"
                            )
                          }
                          value={filterType}
                        >
                          {operators.map(o => (
                            <Radio key={o} value={o}>
                              {operatorMap[o]}
                            </Radio>
                          ))}
                        </Radio.Group>
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </Row>
            );
          })}
        </div>
      </div>
    );
  }

  _buildHighlightKeywords = (text = "") => {
    const { searchValue } = this.state;
    let keywords = text;
    if (searchValue) {
      return text.split(searchValue).map((item, index) => {
        if (index !== 0) {
          return (
            <Fragment key={index}>
              <span className="highlight-keyword">{searchValue}</span>
              {item}
            </Fragment>
          );
        }
        return item;
      });
    }
    return keywords;
  };

  onSearch = e => {
    this.setState({ searchValue: e });
  };

  onBlur = () => {
    this.setState({ searchValue: "" });
  };

  loadActiveFieldNotTypeFields = () => {
    fetchActiveFieldNotTypeField()
      .then(data => {
        const { content: conditionFields = [] } = data;
        let conditionFieldMap = {};
        conditionFields.forEach(field => {
          const { id } = field;
          conditionFieldMap = { ...conditionFieldMap, [id]: field };
        });
        this.setState({ conditionFields, conditionFieldMap });
      })
      .catch(data => {
        const { content = {} } = data;
        notification.warn(content);
      });
  };

  onIconClick = index => {
    if (index === 0) {
      this.props.onEnumAdd();
    } else {
      this.props.onEnumDelete(index);
    }
  };

  loadActiveFieldListByIdAndType = id => {
    fetchActiveFieldListByIdAndType({ id })
      .then(data => {
        const { content: conditionFieldOfFields = [] } = data;
        let conditionFieldOfFieldMap = {};
        conditionFieldOfFields.forEach(field => {
          const { id } = field;
          conditionFieldOfFieldMap = {
            ...conditionFieldOfFieldMap,
            [id]: field
          };
        });
        this.setState({ conditionFieldOfFields, conditionFieldOfFieldMap });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  onConditionChangeFraudOperatorCharOrFilterType = (type, index) => {
    let prop = "filterType";
    let e = {
      [prop]: type,
      fraudOperatorChar: undefined,
      timeUnit: undefined,
      subtractFieldId: undefined,
      subtractFieldName: undefined
    };
    if (["SUBTRACTION", "EXTRACTION_TIME_POINT"].includes(type)) {
      prop = "fraudOperatorChar";
      e = { [prop]: type, filterType: undefined, timeUnit: "DAY" };
      if (type === "EXTRACTION_TIME_POINT") {
        e = { ...e, filterType: "BETWEEN_THIS_DAY", timeUnit: undefined };
      }
    }
    this.props.onEnumChange(e, index, prop);
  };

  onConditionListChange = async (
    e,
    index,
    prop,
    { fType, fOperatorChar } = {}
  ) => {
    const { list } = this.props;
    switch (prop) {
      case "fieldId":
        await this.setState({ searchValue: "" });
        const { conditionFieldMap = {} } = this.state;
        const value = e;
        const { id, ...other } = conditionFieldMap[e] || {};
        e = {
          ...other,
          [prop]: value,
          hasCalculation: false,
          propertyFieldId: undefined,
          filterType: undefined,
          operatorChar: undefined,
          operatorFieldId: undefined,
          subtractFieldId: undefined,
          subtractFieldName: undefined,
          timeUnit: undefined,
          operatorType: undefined,
          dateFormat: undefined
        };
        const { fieldType } = e;
        if (fieldType === "LIST") {
          this.loadActiveFieldListByIdAndType(value);
        } else if (fieldType === "BOOLEAN") {
          e = {
            ...e,
            filterType: "BOOLEAN_EQUALS",
            fraudOperatorChar: undefined
          };
        } else if (fieldType === "DECIMAL") {
          let { filterType = "LESS_THAN" } = list[index] || {};
          if (!NUMBER_OPERATORS.includes(filterType)) {
            filterType = "LESS_THAN";
          }
          e = { ...e, filterType, fraudOperatorChar: undefined };
        } else if (fieldType === "DATETIME") {
          e = {
            ...e,
            filterType: "LESS_THAN_DATE",
            fraudOperatorChar: undefined
          };
        }
        break;
      case "propertyFieldId": {
        const { conditionFieldOfFieldMap = {} } = this.state;
        const value = e;
        const {
          fieldCode: propertyFieldCode,
          fieldType: propertyFieldType,
          fieldName: propertyFieldName
        } = conditionFieldOfFieldMap[e] || {};
        e = {
          propertyFieldCode,
          propertyFieldType,
          propertyFieldName,
          [prop]: value,
          filterType: undefined
        };
        switch (propertyFieldType) {
          case "BOOLEAN":
            e = {
              ...e,
              filterType: "BOOLEAN_EQUALS",
              hasCalculation: false,
              operatorChar: undefined,
              operatorFieldCode: undefined,
              operatorFieldType: undefined,
              operatorFieldName: undefined,
              operatorFieldId: undefined
            };
            break;
          case "DECIMAL":
            const { filterType = "LESS_THAN", propertyFieldType: pFieldType } =
              list[index] || {};
            const sameType = propertyFieldType === pFieldType;
            e = {
              ...e,
              filterType: sameType ? filterType : "LESS_THAN",
              filterTypeError: false
            };
            break;
          default:
            e = {
              ...e,
              hasCalculation: false,
              operatorChar: undefined,
              operatorFieldCode: undefined,
              operatorFieldType: undefined,
              operatorFieldName: undefined,
              operatorFieldId: undefined
            };
        }
        break;
      }
      case "operatorFieldId": {
        const {
          conditionFieldOfFieldMap = {},
          conditionFieldMap = {}
        } = this.state;
        const value = e;
        const {
          fieldCode: operatorFieldCode,
          fieldType: operatorFieldType,
          fieldName: operatorFieldName
        } = Object.keys(conditionFieldOfFieldMap).length
          ? conditionFieldOfFieldMap[e]
          : conditionFieldMap[e] || {};
        e = {
          operatorFieldCode,
          operatorFieldType,
          operatorFieldName,
          [prop]: value
        };
        break;
      }
      case "operatorChar": {
        let operatorData = {};
        if (!e) {
          operatorData = {
            operatorFieldCode: undefined,
            operatorFieldType: undefined,
            operatorFieldId: undefined
          };
        }
        e = { hasCalculation: !!e, [prop]: e, ...operatorData };
        break;
      }
      case "subtractFieldId": {
        await this.setState({ searchValue: "" });
        const { conditionFieldMap = {} } = this.state;
        const value = e;
        const { fieldName: subtractFieldName } = conditionFieldMap[e] || {};
        e = { [prop]: value, subtractFieldName };
        break;
      }
      case "filterType":
        {
          const value = e;
          e = { [prop]: value };
          switch (fType) {
            case "DATETIME":
              break;
            case "DECIMAL":
              e = { ...e, fraudOperatorChar: fOperatorChar };
              if (!value.endsWith("_LIMIT_TIME")) {
                e = { ...e, fraudOperatorChar: undefined };
              }
              break;
            default:
              e = { ...e, fraudOperatorChar: undefined };
          }
        }
        break;
      case "operatorType": {
        if (e === "FILTER") {
          e = {
            e,
            operatorType: undefined,
            operatorChar: undefined,
            operatorFieldId: undefined,
            operatorFieldCode: undefined,
            operatorFieldType: undefined
          };
        } else {
          //   e = { [prop]: e, operatorChar: ARITHMETIC_OPERATORS[0] };
        }
        break;
      }
      case "dateFormat": {
        e = {
          [prop]: e,
          operatorType: undefined
        };
      }
    }
    this.props.onEnumChange(e, index, prop);
  };
}
