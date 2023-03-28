import React, { Fragment } from "react";
import {
  Checkbox,
  Input,
  Radio,
  DatePicker,
  TimePicker,
  Select,
  Button
} from "antd";
import moment from "moment";
import classNames from "classnames";
import {
  AGGREGATE_OPERATOR_MAP,
  ARITHMETIC_OPERATOR_MATH_MAP,
  BOOLEAN_OPERATOR_VIEW_MAP,
  DATE_IN_LIST_OPERATOR_VIEW_MAP,
  DATE_OPERATOR_VIEW_MAP,
  DATE_SUBTRACTION_UNIT_MAP,
  ENUM_OPERATOR_VIEW_MAP,
  DATE_HOURS,
  NUMBER_IN_LIST_OPERATOR_MATH_MAP,
  NUMBER_LIMIT_TIME_OPERATOR_VIEW_MAP,
  NUMBER_OPERATOR_MATH_MAP,
  STRING_OPERATOR_MAP
} from "@common/constant";

const { Option } = Select;

const DECIMAL_WIDTH = 110;
const VIEW_WIDTH = 30;

function noop() {}

function _buildExpression(
  list = [],
  {
    listFields = [],
    enumTranslate = {},
    bracket = false,
    isList = false,
    mode = "SLAT",
    rowIndex = 0,
    onChange = noop,
    onFocus = noop,
    onShow = noop
  } = {}
) {
  const listCount = list.length;
  const isEdit = mode === "EDIT";
  const isSlat = mode === "SLAT";
  const likeSlat = ["SLAT", "EDIT"].includes(mode);
  return (
    <Fragment>
      {bracket && <span className="highlight-bracket">( </span>}
      {list.map((item, index) => {
        let {
          conditionListIndex,
          fieldName = "",
          fieldType,
          fieldCode,
          filterType = "",
          propertyFieldName,
          propertyFieldCode,
          propertyFieldType,
          operatorChar,
          operatorFieldName = "",
          leftValue = "",
          leftValueError = false,
          rightValue = "",
          rightValueError = false,
          recentTimeRangeValue = "",
          recentTimeRangeValueError = false,
          fraudOperatorChar,
          subtractFieldName,
          timeUnit,
          operatorType,
          dateFormat
        } = item;
        const lValue = isEdit ? leftValue : "";
        const rValue = isEdit ? rightValue : "";
        const rtgValue = isEdit ? recentTimeRangeValue : "";
        if (isList) {
          fieldType = propertyFieldType;
        }
        const isMac = navigator.userAgent.includes("Mac OS X");
        const isString = fieldType === "STRING";
        const isEditString = false; // isString && isEdit
        const width = isEdit ? (isString ? "100%" : DECIMAL_WIDTH) : VIEW_WIDTH;
        let operatorMap = [];
        let limitTimeExpression = null;
        let subtractionExpression = null;
        let extractionTimePointExpression = null;
        let timeUnitExpression = null;
        let operatorExpression = null;
        let isStringEqual = false;
        switch (fieldType) {
          case "DECIMAL":
            operatorMap = NUMBER_OPERATOR_MATH_MAP;
            if (filterType.endsWith("_LIMIT_TIME")) {
              limitTimeExpression = (
                <Fragment>
                  近{" "}
                  {likeSlat ? (
                    <Input
                      style={{ width }}
                      className={classNames({
                        "has-error": recentTimeRangeValueError
                      })}
                      size="small"
                      disabled={!isEdit}
                      value={rtgValue}
                      onChange={e =>
                        onChange(e.target.value, conditionListIndex, {
                          mode: "rtg",
                          fieldType,
                          rowIndex
                        })
                      }
                    />
                  ) : (
                    <span className="value">{recentTimeRangeValue}</span>
                  )}{" "}
                  {NUMBER_LIMIT_TIME_OPERATOR_VIEW_MAP[fraudOperatorChar]}
                  {" , "}
                </Fragment>
              );
            }
            if (isList) {
              operatorMap = NUMBER_IN_LIST_OPERATOR_MATH_MAP;
            }
            if (operatorType === "ARITHMETIC") {
              operatorExpression = (
                <Fragment>
                  {ARITHMETIC_OPERATOR_MATH_MAP[operatorChar]}
                  {operatorFieldName}
                </Fragment>
              );
            }
            break;
          case "STRING":
            switch (filterType) {
              case "EQUALS_FIELD":
                isStringEqual = true;
                const booleanMap = { true: "是", false: "否" };
                operatorExpression = (
                  <Fragment>
                    ={operatorFieldName} 属于{" "}
                    {isEdit ? (
                      <Radio.Group
                        className={classNames({ "has-error": leftValueError })}
                        value={lValue}
                        disabled={!isEdit}
                        onChange={e =>
                          onChange(e.target.value, conditionListIndex, {
                            mode: "left",
                            rowIndex
                          })
                        }
                      >
                        <Radio value="true">是</Radio>
                        <Radio value="false">否</Radio>
                      </Radio.Group>
                    ) : (
                      <span className="value">{booleanMap[leftValue]}</span>
                    )}
                  </Fragment>
                );
                operatorMap = "";
                break;
              default:
                operatorMap = STRING_OPERATOR_MAP;
            }
            break;
          case "BOOLEAN":
            operatorMap = BOOLEAN_OPERATOR_VIEW_MAP;
            break;
          case "DATETIME":
            operatorMap = DATE_OPERATOR_VIEW_MAP;
            switch (fraudOperatorChar) {
              case "SUBTRACTION":
                subtractionExpression = (
                  <Fragment>- {subtractFieldName}</Fragment>
                );
                timeUnitExpression = DATE_SUBTRACTION_UNIT_MAP[timeUnit];
                break;
              case "EXTRACTION_TIME_POINT":
                extractionTimePointExpression =
                  DATE_OPERATOR_VIEW_MAP[fraudOperatorChar];
                break;
            }
            if (isList) {
              operatorMap = DATE_IN_LIST_OPERATOR_VIEW_MAP;
            }
            break;
          case "ENUM":
            operatorMap = ENUM_OPERATOR_VIEW_MAP;
            break;
          case "LIST":
            return (
              <Fragment key={index}>
                {fieldName}[{" "}
                {_buildExpression(listFields, {
                  enumTranslate,
                  mode,
                  rowIndex,
                  isList: true,
                  onChange,
                  onFocus
                })}{" "}
                ]
              </Fragment>
            );
        }
        let expression = `${fieldName}`;
        let andWord = null;
        let boolFieldName = fieldName;
        if (isList) {
          boolFieldName = propertyFieldName;
          expression = (
            <Fragment>
              {(operatorChar || operatorFieldName) && (
                <span className="highlight-bracket">( </span>
              )}
              {boolFieldName}
              {` ${ARITHMETIC_OPERATOR_MATH_MAP[operatorChar] ||
                ""} ${operatorFieldName}`}
              {(operatorChar || operatorFieldName) && (
                <span className="highlight-bracket"> )</span>
              )}
            </Fragment>
          );
        } else {
          const { fieldType: preFieldType } = list[index - 1] || {};
          if (preFieldType === "LIST") {
            andWord = <span className="highlight-character"> 且 </span>;
          }
        }
        if (filterType.startsWith("BETWEEN_")) {
          if (filterType === "BETWEEN_CROSS_DAY") {
            let leftSlatComponent = (
              <Input
                style={{ width }}
                size="small"
                disabled={!isEdit}
                value={lValue}
              />
            );
            let rightSlatComponent = (
              <Input
                style={{ width }}
                size="small"
                disabled={!isEdit}
                value={rValue}
              />
            );
            if (isEdit) {
              leftSlatComponent = (
                <Select
                  style={{ width: 50 }}
                  className={classNames("no-ellipsis", {
                    "has-error": leftValueError
                  })}
                  size="small"
                  value={lValue}
                  dropdownClassName="no-ellipsis"
                  getPopupContainer={trigger => trigger.parentElement}
                  onChange={e =>
                    onChange(e, conditionListIndex, {
                      mode: "left",
                      fieldType,
                      filterType,
                      timeUnit,
                      rowIndex
                    })
                  }
                >
                  {DATE_HOURS.map(hour => {
                    return (
                      <Option key={hour} value={hour}>
                        {hour}
                      </Option>
                    );
                  })}
                </Select>
              );
              rightSlatComponent = (
                <Select
                  style={{ width: 50 }}
                  className={classNames("no-ellipsis", {
                    "has-error": rightValueError
                  })}
                  size="small"
                  value={rValue}
                  dropdownClassName="no-ellipsis"
                  getPopupContainer={trigger => trigger.parentElement}
                  onChange={e =>
                    onChange(e, conditionListIndex, {
                      mode: "right",
                      fieldType,
                      filterType,
                      timeUnit,
                      rowIndex
                    })
                  }
                >
                  {DATE_HOURS.map(hour => {
                    return (
                      <Option key={hour} value={hour}>
                        {hour}
                      </Option>
                    );
                  })}
                </Select>
              );
            }
            expression = (
              <Fragment>
                {andWord}
                {"0 <= "}
                {expression}
                {extractionTimePointExpression}
                {"<"}{" "}
                {likeSlat ? (
                  leftSlatComponent
                ) : (
                  <span className="value">{leftValue}</span>
                )}{" "}
                {"或"}{" "}
                {likeSlat ? (
                  rightSlatComponent
                ) : (
                  <span className="value">{rightValue}</span>
                )}{" "}
                {"<="} {expression}
                {extractionTimePointExpression} {"< 24"}
              </Fragment>
            );
          } else {
            const [o1 = "", o2 = ""] = operatorMap[filterType] || [];
            let leftSlatComponent = (
              <Input
                style={{ width }}
                className={classNames({ "has-error": leftValueError })}
                size="small"
                disabled={!isEdit}
                value={lValue}
                onChange={e =>
                  onChange(e.target.value, conditionListIndex, {
                    mode: "left",
                    fieldType,
                    filterType,
                    timeUnit,
                    rowIndex
                  })
                }
              />
            );
            let rightSlatComponent = (
              <Input
                style={{ width }}
                className={classNames({ "has-error": rightValueError })}
                size="small"
                disabled={!isEdit}
                value={rValue}
                onChange={e =>
                  onChange(e.target.value, conditionListIndex, {
                    mode: "right",
                    fieldType,
                    filterType,
                    timeUnit,
                    rowIndex
                  })
                }
              />
            );
            if (fieldType === "DATETIME" && isEdit && !timeUnit) {
              switch (filterType) {
                case "BETWEEN_THIS_DAY":
                  leftSlatComponent = (
                    <Select
                      style={{ width: 50 }}
                      className={classNames("no-ellipsis", {
                        "has-error": leftValueError
                      })}
                      size="small"
                      value={lValue}
                      dropdownClassName="no-ellipsis"
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e =>
                        onChange(e, conditionListIndex, {
                          mode: "left",
                          fieldType,
                          filterType,
                          timeUnit,
                          rowIndex
                        })
                      }
                    >
                      {DATE_HOURS.map(hour => {
                        const v = Number(rValue);
                        let greatThan = false;
                        if (rValue.length) {
                          greatThan = Number(hour) >= v;
                        }
                        return (
                          <Option key={hour} value={hour} disabled={greatThan}>
                            {hour}
                          </Option>
                        );
                      })}
                    </Select>
                  );
                  rightSlatComponent = (
                    <Select
                      style={{ width: 50 }}
                      className={classNames("no-ellipsis", {
                        "has-error": rightValueError
                      })}
                      size="small"
                      value={rValue}
                      dropdownClassName="no-ellipsis"
                      getPopupContainer={trigger => trigger.parentElement}
                      onChange={e =>
                        onChange(e, conditionListIndex, {
                          mode: "right",
                          fieldType,
                          filterType,
                          timeUnit,
                          rowIndex
                        })
                      }
                    >
                      {DATE_HOURS.map(hour => {
                        const v = Number(lValue);
                        let lessThan = false;
                        if (lValue.length) {
                          lessThan = Number(hour) <= v;
                        }
                        return (
                          <Option key={hour} value={hour} disabled={lessThan}>
                            {hour}
                          </Option>
                        );
                      })}
                    </Select>
                  );
                  break;
                default:
                  leftSlatComponent =
                    dateFormat === "YMDHMS" ? (
                      <DatePicker
                        className={classNames({
                          "has-error": leftValueError,
                          mac: isMac
                        })}
                        size="small"
                        format="YYYY-MM-DD HH:mm:ss"
                        allowClear={false}
                        showTime
                        showToday={false}
                        getCalendarContainer={trigger =>
                          trigger.parentElement.parentElement
                        }
                        value={lValue ? moment(lValue) : null}
                        disabledDate={current => {
                          return (
                            current &&
                            rValue &&
                            moment(current.format("YYYY-MM-DD")) >
                              moment(moment(rValue).format("YYYY-MM-DD"))
                          );
                        }}
                        onChange={(_, e) =>
                          onChange(e, conditionListIndex, {
                            mode: "left",
                            fieldType,
                            rowIndex
                          })
                        }
                      />
                    ) : (
                      <TimePicker
                        className={classNames({
                          "has-error": leftValueError,
                          mac: isMac
                        })}
                        size="small"
                        format="HH:mm"
                        allowClear={false}
                        value={lValue ? moment(lValue, "HH:mm") : null}
                        onChange={(_, e) =>
                          onChange(e, conditionListIndex, {
                            mode: "left",
                            fieldType,
                            rowIndex
                          })
                        }
                      />
                    );
                  rightSlatComponent =
                    dateFormat === "YMDHMS" ? (
                      <DatePicker
                        className={classNames({
                          "has-error": rightValueError,
                          mac: isMac
                        })}
                        size="small"
                        format="YYYY-MM-DD HH:mm:ss"
                        allowClear={false}
                        showTime
                        showToday={false}
                        getCalendarContainer={trigger =>
                          trigger.parentElement.parentElement
                        }
                        value={rValue ? moment(rValue) : null}
                        disabledDate={current => {
                          return (
                            current &&
                            lValue &&
                            moment(current.format("YYYY-MM-DD")) <
                              moment(moment(lValue).format("YYYY-MM-DD"))
                          );
                        }}
                        onChange={(_, e) =>
                          onChange(e, conditionListIndex, {
                            mode: "right",
                            fieldType,
                            rowIndex
                          })
                        }
                      />
                    ) : (
                      <TimePicker
                        className={classNames({
                          "has-error": rightValueError,
                          mac: isMac
                        })}
                        size="small"
                        format="HH:mm"
                        allowClear={false}
                        value={rValue ? moment(rValue, "HH:mm") : null}
                        onChange={(_, e) =>
                          onChange(e, conditionListIndex, {
                            mode: "right",
                            fieldType,
                            rowIndex
                          })
                        }
                      />
                    );
              }
            }
            expression = (
              <Fragment>
                {andWord}
                {limitTimeExpression}
                {likeSlat ? (
                  leftSlatComponent
                ) : (
                  <span className="value">{leftValue}</span>
                )}{" "}
                {timeUnitExpression} {o1} {expression} {operatorExpression}
                {extractionTimePointExpression} {subtractionExpression} {o2}{" "}
                {likeSlat ? (
                  rightSlatComponent
                ) : (
                  <span className="value">{rightValue}</span>
                )}{" "}
                {timeUnitExpression}
              </Fragment>
            );
          }
        } else {
          switch (fieldType) {
            case "BOOLEAN":
              const booleanMap = { true: "是", false: "否" };
              expression = (
                <Fragment>
                  {andWord}
                  {expression} ={" "}
                  {isEdit ? (
                    <Radio.Group
                      className={classNames({ "has-error": leftValueError })}
                      value={lValue}
                      onChange={e =>
                        onChange(e.target.value, conditionListIndex, {
                          mode: "left",
                          rowIndex
                        })
                      }
                    >
                      <Radio value="true">是</Radio>
                      <Radio value="false">否</Radio>
                    </Radio.Group>
                  ) : isSlat ? (
                    boolFieldName
                  ) : (
                    <span className="value">
                      {booleanMap[leftValue] || boolFieldName}
                    </span>
                  )}
                </Fragment>
              );
              break;
            case "ENUM":
              const code = isList ? propertyFieldCode : fieldCode;
              const enumTranslates = enumTranslate[code] || [];
              const multi = leftValue.split(",").length > 1;
              let keyValueMap = {};
              if (!likeSlat) {
                enumTranslates.forEach(item => {
                  const { key, value } = item;
                  keyValueMap[value] = key;
                });
              }
              switch (filterType) {
                case "ENUM_EQUALS_FIELD":
                  const booleanMap = { true: "是", false: "否" };
                  operatorExpression = (
                    <Fragment>
                      {operatorFieldName} 属于{" "}
                      {isEdit ? (
                        <Radio.Group
                          className={classNames({
                            "has-error": leftValueError
                          })}
                          value={lValue}
                          disabled={!isEdit}
                          onChange={e =>
                            onChange(e.target.value, conditionListIndex, {
                              mode: "left",
                              rowIndex
                            })
                          }
                        >
                          <Radio value="true">是</Radio>
                          <Radio value="false">否</Radio>
                        </Radio.Group>
                      ) : isSlat ? (
                        boolFieldName
                      ) : (
                        <span className="value">
                          {booleanMap[leftValue] || boolFieldName}
                        </span>
                      )}
                    </Fragment>
                  );
                  expression = (
                    <Fragment>
                      {andWord}
                      {expression} {operatorMap[filterType]}
                      {operatorExpression}
                    </Fragment>
                  );
                  break;
                case "ENUM_EQUALS":
                  expression = (
                    <Fragment>
                      {andWord}
                      {expression} {operatorMap[filterType]}
                      {filterType ? (
                        <Fragment>
                          {" "}
                          {likeSlat ? (
                            <Radio.Group
                              disabled={!isEdit}
                              name={code}
                              value={lValue}
                              className={classNames({
                                "has-error": leftValueError
                              })}
                              onChange={e =>
                                onChange(e.target.value, conditionListIndex, {
                                  mode: "left",
                                  rowIndex
                                })
                              }
                            >
                              {enumTranslates.map(item => {
                                const { key, value } = item;
                                return (
                                  <Radio key={value} value={value}>
                                    {key}
                                  </Radio>
                                );
                              })}
                            </Radio.Group>
                          ) : (
                            <Fragment>
                              {multi ? "[" : ""}
                              <span className="value">
                                {keyValueMap[leftValue] || ""}
                              </span>
                              {multi ? "]" : ""}
                            </Fragment>
                          )}
                        </Fragment>
                      ) : null}
                    </Fragment>
                  );
                  break;
                case "ENUM_BELONG":
                  let checkValue = leftValue;
                  if (isSlat) {
                    checkValue = [];
                  } else if (typeof leftValue !== "object") {
                    if (`${leftValue}`.length) {
                      checkValue = `${leftValue}`.split(",");
                    } else {
                      checkValue = [];
                    }
                  }
                  expression = (
                    <Fragment>
                      {andWord}
                      {expression} {operatorMap[filterType]}
                      {filterType ? (
                        <Fragment>
                          {" "}
                          {likeSlat ? (
                            <Checkbox.Group
                              disabled={!isEdit}
                              name={code}
                              value={checkValue}
                              className={classNames({
                                "has-error": leftValueError
                              })}
                              onChange={checkedValue =>
                                onChange(
                                  checkedValue.join(","),
                                  conditionListIndex,
                                  {
                                    mode: "left",
                                    rowIndex
                                  }
                                )
                              }
                            >
                              {enumTranslates.map(item => {
                                const { key, value } = item;
                                return (
                                  <Checkbox key={value} value={value}>
                                    {key}
                                  </Checkbox>
                                );
                              })}
                            </Checkbox.Group>
                          ) : (
                            <Fragment>
                              {multi ? "[" : ""}
                              <span className="value">
                                {checkValue
                                  .map(value => keyValueMap[value] || "")
                                  .join(",")}
                              </span>
                              {multi ? "]" : ""}
                            </Fragment>
                          )}
                        </Fragment>
                      ) : null}
                    </Fragment>
                  );
                  break;
                case "ENUM_NOT_BELONG":
                  let checkValues = leftValue;
                  if (isSlat) {
                    checkValues = [];
                  } else if (typeof leftValue !== "object") {
                    if (`${leftValue}`.length) {
                      checkValues = `${leftValue}`.split(",");
                    } else {
                      checkValues = [];
                    }
                  }
                  expression = (
                    <Fragment>
                      {andWord}
                      {expression} {operatorMap[filterType]}
                      {filterType ? (
                        <Fragment>
                          {" "}
                          {likeSlat ? (
                            <Checkbox.Group
                              disabled={!isEdit}
                              name={code}
                              value={checkValues}
                              className={classNames({
                                "has-error": leftValueError
                              })}
                              onChange={checkedValues =>
                                onChange(
                                  checkedValues.join(","),
                                  conditionListIndex,
                                  {
                                    mode: "left",
                                    rowIndex
                                  }
                                )
                              }
                            >
                              {enumTranslates.map(item => {
                                const { key, value } = item;
                                return (
                                  <Checkbox key={value} value={value}>
                                    {key}
                                  </Checkbox>
                                );
                              })}
                            </Checkbox.Group>
                          ) : (
                            <Fragment>
                              {multi ? "[" : ""}
                              <span className="value">
                                {checkValues
                                  .map(value => keyValueMap[value] || "")
                                  .join(",")}
                              </span>
                              {multi ? "]" : ""}
                            </Fragment>
                          )}
                        </Fragment>
                      ) : null}
                    </Fragment>
                  );
                  break;
              }
              break;
            default:
              const slatInput = (
                <Input
                  style={{ width }}
                  className={classNames({ "has-error": leftValueError })}
                  size="small"
                  disabled={!isEdit}
                  value={lValue}
                  onFocus={e =>
                    isString
                      ? onFocus(e, conditionListIndex, {
                          mode: "left",
                          fieldType,
                          filterType,
                          timeUnit,
                          rowIndex,
                          record: true
                        })
                      : noop()
                  }
                  onChange={e =>
                    isString
                      ? noop()
                      : onChange(e.target.value, conditionListIndex, {
                          mode: "left",
                          fieldType,
                          filterType,
                          timeUnit,
                          rowIndex
                        })
                  }
                />
              );
              let slatComponent = !isStringEqual ? slatInput : null;

              if (isEditString && !isStringEqual) {
                slatComponent = (
                  <div className="slot">
                    {slatInput}
                    <Button
                      size="small"
                      onClick={() =>
                        onShow &&
                        onShow(
                          {
                            itemModalTitle: expression,
                            itemModalVisible: true
                          },
                          conditionListIndex,
                          {
                            mode: "left",
                            fieldType,
                            filterType,
                            timeUnit,
                            rowIndex
                          }
                        )
                      }
                    >
                      选择
                    </Button>
                  </div>
                );
              }
              if (fieldType === "DATETIME" && isEdit && !timeUnit) {
                slatComponent =
                  dateFormat === "YMDHMS" ? (
                    <DatePicker
                      className={classNames({
                        "has-error": leftValueError,
                        mac: isMac
                      })}
                      size="small"
                      format="YYYY-MM-DD HH:mm:ss"
                      allowClear={false}
                      showTime
                      getCalendarContainer={trigger =>
                        trigger.parentElement.parentElement
                      }
                      value={lValue ? moment(lValue) : null}
                      onChange={(_, e) =>
                        onChange(e, conditionListIndex, {
                          mode: "left",
                          fieldType,
                          rowIndex
                        })
                      }
                    />
                  ) : (
                    <TimePicker
                      className={classNames({
                        "has-error": leftValueError,
                        mac: isMac
                      })}
                      size="small"
                      format="HH:mm"
                      allowClear={false}
                      value={lValue ? moment(lValue, "HH:mm") : null}
                      onChange={(_, e) =>
                        onChange(e, conditionListIndex, {
                          mode: "left",
                          fieldType,
                          rowIndex
                        })
                      }
                    />
                  );
              }
              expression = (
                <Fragment>
                  {andWord}
                  {limitTimeExpression}
                  {expression}
                  {operatorExpression}
                  {subtractionExpression} {operatorMap[filterType]}
                  {filterType ? (
                    <Fragment>
                      {" "}
                      {likeSlat ? (
                        slatComponent
                      ) : (
                        <span className="value">
                          {leftValue === "true" ? "" : leftValue}
                        </span>
                      )}
                    </Fragment>
                  ) : null}{" "}
                  {/* {operatorExpression} */}
                  {timeUnitExpression}
                </Fragment>
              );
          }
        }
        return (
          <Fragment key={index}>
            {expression}
            {index < listCount - 1 && (
              <span className="highlight-character"> 且 </span>
            )}
          </Fragment>
        );
      })}
      {bracket && <span className="highlight-bracket"> )</span>}
    </Fragment>
  );
}

export function _renderExpression(
  record = {},
  {
    className = "template-logic-expression",
    mode = "SLAT",
    rowIndex = 0,
    onChange = noop,
    onFocus = noop,
    onShow = noop
  }
) {
  const isEdit = mode === "EDIT";
  const width = isEdit ? DECIMAL_WIDTH : VIEW_WIDTH;
  const likeSlat = ["SLAT", "EDIT"].includes(mode);
  const {
    aggregationDto: { aggregationList = [], operatorList = [] } = {},
    conditionList = [],
    enumTranslate = {},
    hasAggregation = false
  } = record;
  let listFields = [];
  let otherFields = [];
  let renderFields = [];
  let matchListField = false;
  conditionList.forEach((item, index) => {
    const { fieldType } = item;
    const isList = fieldType === "LIST";
    const record = { ...item, conditionListIndex: index };
    if (!matchListField || !isList) {
      renderFields = [...renderFields, record];
    }
    if (isList) {
      matchListField = isList;
      listFields = [...listFields, record];
    } else {
      otherFields = [...otherFields, record];
    }
  });
  let hasListField = listFields.length > 0;
  const hasOtherField = otherFields.length > 0;
  const multiOtherField = otherFields.length > 1;
  const hasAgg = aggregationList.length > 0;
  const multiAggCount = aggregationList.length;
  const multiAgg = multiAggCount > 1;
  return (
    <div className={className}>
      {_buildExpression(renderFields, {
        listFields,
        enumTranslate,
        bracket:
          hasAggregation &&
          hasAgg &&
          ((hasListField && hasOtherField) || multiOtherField),
        mode,
        rowIndex,
        onChange,
        onFocus,
        onShow
      })}
      {hasAggregation && hasAgg && (
        <span className="highlight-character"> 且 </span>
      )}
      {hasAggregation && multiAgg && (
        <span className="highlight-bracket">( </span>
      )}
      {hasAggregation &&
        aggregationList.map((item, index) => {
          const {
            fieldName,
            aggregationType,
            operatorChar: operatorCharFirst,
            operatorFieldName
          } = item;
          const {
            operatorChar,
            optNameSecond,
            finalOperator = "",
            leftValue = "",
            leftValueError = false,
            rightValue = "",
            rightValueError = false
          } = operatorList[index] || {};
          const lValue = isEdit ? leftValue : "";
          const rValue = isEdit ? rightValue : "";
          const aggregationName = AGGREGATE_OPERATOR_MAP[aggregationType];
          let expression = (
            <Fragment>
              {(operatorChar || optNameSecond) && (
                <span className="highlight-bracket">( </span>
              )}
              {operatorCharFirst || operatorFieldName ? (
                <Fragment>
                  <span className="highlight-bracket">( </span>
                  {fieldName} {ARITHMETIC_OPERATOR_MATH_MAP[operatorCharFirst]}{" "}
                  {operatorFieldName}
                  <span className="highlight-bracket"> )</span>
                </Fragment>
              ) : (
                fieldName
              )}
              {aggregationName && <Fragment>[{aggregationName}]</Fragment>}
              {(operatorChar || optNameSecond) && (
                <Fragment>
                  {" "}
                  {ARITHMETIC_OPERATOR_MATH_MAP[operatorChar] || ""}{" "}
                  {optNameSecond}
                </Fragment>
              )}
              {(operatorChar || optNameSecond) && (
                <span className="highlight-bracket"> )</span>
              )}
            </Fragment>
          );
          if (finalOperator.startsWith("BETWEEN_")) {
            const [o1 = "", o2 = ""] =
              NUMBER_OPERATOR_MATH_MAP[finalOperator] || [];
            expression = (
              <Fragment>
                {likeSlat ? (
                  <Input
                    style={{ width }}
                    className={classNames({ "has-error": leftValueError })}
                    size="small"
                    disabled={!isEdit}
                    value={lValue}
                    onChange={e =>
                      onChange(e.target.value, index, {
                        mode: "left",
                        agg: true,
                        rowIndex
                      })
                    }
                  />
                ) : (
                  <span className="value">{leftValue}</span>
                )}{" "}
                {o1} {expression} {o2}{" "}
                {likeSlat ? (
                  <Input
                    style={{ width }}
                    className={classNames({ "has-error": rightValueError })}
                    size="small"
                    disabled={!isEdit}
                    value={rValue}
                    onChange={e =>
                      onChange(e.target.value, index, {
                        mode: "right",
                        agg: true,
                        rowIndex
                      })
                    }
                  />
                ) : (
                  <span className="value">{rightValue}</span>
                )}
              </Fragment>
            );
          } else {
            expression = (
              <Fragment>
                {expression} {NUMBER_OPERATOR_MATH_MAP[finalOperator]}{" "}
                {likeSlat ? (
                  <Input
                    style={{ width }}
                    className={classNames({ "has-error": leftValueError })}
                    size="small"
                    disabled={!isEdit}
                    value={lValue}
                    onChange={e =>
                      onChange(e.target.value, index, {
                        mode: "left",
                        agg: true,
                        rowIndex
                      })
                    }
                  />
                ) : (
                  <span className="value">{leftValue}</span>
                )}
              </Fragment>
            );
          }
          return (
            <Fragment key={index}>
              {expression}
              {index === multiAggCount - 1 ? null : (
                <span className="highlight-character"> 且 </span>
              )}
            </Fragment>
          );
        })}
      {hasAggregation && multiAgg && (
        <span className="highlight-bracket"> )</span>
      )}
    </div>
  );
}

export const OPERATE_TYPE_MAP = {
  CREATE_RULE: "创建规则",
  COPY_RULE: "复制规则",
  UPDATE_RULE: "编辑规则",
  DELETE_TEMPLATE: "删除因子",
  CREATE_TEMPLATE: "创建因子",
  UPDATE_RISK_TYPE: "修改风险小类",
  UPDATE_RULE_NAME: "修改规则名称",
  UPDATE_RULE_LABEL: "修改标签",
  UPDATE_RULE_LOGIC: "修改规则逻辑表达式"
};
