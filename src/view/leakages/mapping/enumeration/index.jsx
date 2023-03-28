import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import {
  Button,
  Input,
  Table,
  Modal,
  Form,
  notification,
  Select,
  Checkbox,
  Icon
} from "antd";
import LayoutRight from "@component/layout_right";

import {
  fetchEnumMappings,
  addEnumMapping,
  delEnumMapping,
  fetchCompanyList,
  updateEnumMapping,
  fetchNoMappingEnumFields
} from "@action/leakage";
import "./index.less";
import { noop } from "@util";

const { Item: FormItem } = Form;
const { confirm } = Modal;
const { Option } = Select;

class EnumerationList extends Component {
  state = {
    editConfirmShow: false,
    deleteConfirmShow: false,
    record: {},
    fieldInfo: {},
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
      fieldInfo,
      isView = false,
      loading = false,
      continued = false,
      searchName,
      companyId,
      fieldCode,
      fieldList = [],
      enumOptionList = [],
      enumOptions = [],
      companyList = [],
      dataSource = [],
      pagination,
      optionValue,
      mappingValue
    } = this.state;
    let { id, fieldId: cFieldId, fieldName: cFieldName = "" } = fieldInfo;
    let modalDisabled = enumOptionList.length === 0;
    if (!modalDisabled) {
      modalDisabled =
        enumOptionList.filter(item => !item.mappingValue).length > 0;
    }
    const enumOptionsCount = enumOptions.length;

    let filterFieldList = fieldList
      .filter(item => {
        const { fieldName = "" } = item;
        return (fieldName || "")
          .toLocaleLowerCase()
          .includes((searchName || "").toLocaleLowerCase());
      })
      .slice(0, 200);
    if (cFieldId) {
      const matchList = filterFieldList.filter(item => {
        const { id } = item;
        return id === cFieldId;
      });
      if (!matchList.length) {
        filterFieldList = [
          ...filterFieldList,
          { id: cFieldId, fieldName: cFieldName }
        ];
      }
    }

    const columns = [
      {
        title: "枚举字段编码",
        dataIndex: "fieldCode",
        key: "fieldCode",
        onCell: record => {
          const { fieldCode } = record;
          return { title: fieldCode };
        }
      },
      {
        title: "枚举字段名称",
        dataIndex: "fieldName",
        key: "fieldName",
        onCell: record => {
          const { fieldName } = record;
          return { title: fieldName };
        }
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 180
      },
      {
        title: "操作",
        dataIndex: "operations",
        key: "operations",
        width: 120,
        render: (text, record) => {
          return (
            <Fragment>
              {
                <span
                  className="operation-span"
                  onClick={() => {
                    this.onEditIconClick(record);
                  }}
                >
                  编辑
                </span>
              }
              {
                <span
                  className="operation-span"
                  onClick={() => {
                    this.onDeleteIconClick(record);
                  }}
                >
                  删除
                </span>
              }
            </Fragment>
          );
        }
      }
    ];

    const isEdit = id > 0;
    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 15 }
    };
    const formTailLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 15, offset: 8 }
    };

    const disabled = !companyId;

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Select
            placeholder="公司"
            allowClear
            style={{ width: 200 }}
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
          <Input
            value={fieldCode}
            placeholder="枚举字段编码或名称"
            style={{ width: 200 }}
            onChange={this.changeKeyword}
          />
          <Button type="primary" onClick={this.onQuery} disabled={disabled}>
            查询
          </Button>
          <Button onClick={this.onReset}>重置</Button>
          <Button
            type="primary"
            className="fr"
            onClick={this.onCreateBtnClick}
            disabled={disabled}
          >
            新建
          </Button>
        </div>
        <div style={{ height: "calc(100% - 52px)", overflowY: "scroll" }}>
          <Table
            className="ellipsis"
            rowKey="id"
            columns={columns}
            dataSource={dataSource}
            onChange={this.handleChange}
            pagination={pagination}
            loading={loading}
          />
        </div>
        <Modal
          title={`${isEdit ? (isView ? "查看" : "编辑") : "新建"}枚举值映射`}
          centered
          width={800}
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          okButtonProps={{ disabled: modalDisabled }}
          onOk={isView ? this.onEditCancel : this.onEnumMappingSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="枚举字段名称">
              <Select
                defaultActiveFirstOption={false}
                filterOption={false}
                showSearch
                onSearch={this.onSearch}
                disabled={isView || isEdit}
                {...getFieldProps("fieldId", {
                  initialValue: cFieldId,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择枚举字段名称" }]
                    }
                  ],
                  onChange: value => this.changeRecord(value, "fieldId")
                })}
                placeholder="请选择"
              >
                {filterFieldList.map(item => {
                  const { id, fieldName } = item;
                  return (
                    <Option key={id} value={id}>
                      {fieldName}
                    </Option>
                  );
                })}
              </Select>
            </FormItem>
            {enumOptionList.map((item, index) => {
              const { key, value, mappingValue } = item;
              return (
                <FormItem
                  key={`${value}${index}`}
                  {...formItemLayout}
                  label={`${key}-${value}`}
                >
                  <Input
                    {...getFieldProps(`${value}${index}`, {
                      initialValue: mappingValue,
                      validate: [
                        {
                          rules: [
                            {
                              required: true,
                              whitespace: true,
                              message: "请输入"
                            }
                          ]
                        }
                      ],
                      onChange: value => this.handleMappingValue(value, index)
                    })}
                    maxLength="50"
                    disabled={isView}
                  />
                  <Icon
                    type="minus-circle"
                    className="mapping-icon"
                    onClick={() => this.handleRemove(index)}
                  />
                </FormItem>
              );
            })}
            {enumOptionsCount > 0 && (
              <FormItem
                {...formItemLayout}
                label={
                  <Select
                    value={optionValue}
                    style={{ width: "90%" }}
                    allowClear
                    onChange={this.handleOptionValue}
                  >
                    {enumOptions.map(item => {
                      const { key, value } = item;
                      return (
                        <Option
                          key={value}
                          value={value}
                          title={`${key}-${value}`}
                        >
                          {key}-{value}
                        </Option>
                      );
                    })}
                  </Select>
                }
              >
                <Input
                  value={mappingValue}
                  maxLength="50"
                  disabled={!optionValue}
                  onChange={this.handleMappingValue}
                />
                <Icon
                  type="plus-circle"
                  className={classNames("mapping-icon", {
                    disabled: !optionValue
                  })}
                  onClick={optionValue ? this.handleAdd : noop}
                />
              </FormItem>
            )}
            {!id && (
              <FormItem {...formTailLayout}>
                <Checkbox
                  disabled={isView}
                  {...getFieldProps("continued", {
                    initialValue: continued,
                    valuePropName: "checked"
                  })}
                >
                  连续添加
                </Checkbox>
              </FormItem>
            )}
          </Form>
        </Modal>
      </LayoutRight>
    );
  }

  handleAdd = () => {
    let {
      enumOptionList,
      optionValue,
      mappingValue,
      enumOptions = []
    } = this.state;
    let optionKey;
    enumOptions.forEach(item => {
      const { key, value } = item;
      if (value === optionValue) {
        optionKey = key;
      }
    });
    enumOptionList = [
      ...enumOptionList,
      { key: optionKey, value: optionValue, mappingValue }
    ];
    this.setState({
      enumOptionList,
      optionValue: undefined,
      mappingValue: undefined
    });
  };

  handleRemove = index => {
    let { enumOptionList } = this.state;
    enumOptionList = enumOptionList.filter((_, i) => i !== index);
    this.setState({ enumOptionList });
  };

  handleMappingValue = (e, index) => {
    let state = { mappingValue: e.target.value };
    if (index !== undefined) {
      let { enumOptionList } = this.state;
      enumOptionList = enumOptionList.map((item, i) => {
        if (i === index) {
          return { ...item, ...state };
        }
        return item;
      });
      state = { enumOptionList };
    }
    this.setState({ ...state });
  };

  handleOptionValue = optionValue => {
    this.setState({ optionValue });
  };

  changeRecord = (value, fieldName) => {
    let {
      fieldInfo,
      fieldList = [],
      enumOptionList = [],
      enumOptions = []
    } = this.state;
    const fieldListCount = fieldList.length;
    for (let i = 0; i < fieldListCount; i++) {
      const { id, enumOption } = fieldList[i] || {};
      if (id === value && enumOption) {
        const { data } = JSON.parse(enumOption) || {};
        fieldInfo = { ...fieldInfo, enumOption };
        enumOptionList = data;
        enumOptions = data;
        break;
      }
    }
    fieldInfo = { ...fieldInfo, [fieldName]: value };
    this.setState({ fieldInfo, enumOptionList, enumOptions });
  };

  onSearch = searchName => {
    this.setState({ searchName });
  };

  changeCompany = e => {
    this.setState({ companyId: e });
  };

  onQuery = () => {
    this.loadEnumMappings();
  };

  onReset = () => {
    const { pagination } = this.state;
    this.setState({
      pagination: { ...pagination, current: 1, total: 0 },
      dataSource: [],
      fieldCode: undefined,
      companyId: undefined
    });
  };

  loadEnumMappings = (page = 1) => {
    const { pagination, fieldCode, companyId } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      companyId,
      fieldCode,
      page,
      size
    };
    this.setState({
      loading: true
    });
    fetchEnumMappings(data)
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.loadEnumMappings();
          return;
        }
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
      this.loadEnumMappings(pagination.current);
    });
  };

  changeKeyword = e => {
    this.setState({ fieldCode: e.target.value });
  };

  onCreateBtnClick = () => {
    const { companyId } = this.state;
    fetchNoMappingEnumFields({ companyId })
      .then(data => {
        const { content: fieldList = [] } = data;
        this.setState(
          {
            searchName: "",
            fieldList,
            editConfirmShow: true,
            fieldInfo: {},
            optionValue: undefined,
            mappingValue: undefined,
            enumOptionList: [],
            enumOptions: []
          },
          () => {
            this.props.form.resetFields();
          }
        );
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  onEditIconClick = (fieldInfo, editType = "edit") => {
    const { companyId } = this.state;
    const { id: mappingId, fieldId, enumOption } = fieldInfo;
    const { data: enumOptionList = [] } = JSON.parse(enumOption) || {};
    fetchNoMappingEnumFields({ companyId, mappingId })
      .then(data => {
        const { content: fieldList = [] } = data;
        let enumOptions = [];
        const fieldListCount = fieldList.length;
        for (let i = 0; i < fieldListCount; i++) {
          const { id, enumOption } = fieldList[i] || {};
          if (id === fieldId && enumOption) {
            const { data } = JSON.parse(enumOption) || {};
            fieldInfo = { ...fieldInfo, enumOption };
            enumOptions = data;
            break;
          }
        }
        this.setState(
          {
            searchName: "",
            fieldList,
            isView: editType === "view",
            editConfirmShow: true,
            fieldInfo,
            optionValue: undefined,
            mappingValue: undefined,
            enumOptionList,
            enumOptions
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

  onEditCancel = () => {
    this.setState(
      {
        isView: false,
        editConfirmShow: false,
        fieldInfo: {}
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onEnumMappingSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return;
      }
      await this.setState({ loading: true });
      const { fieldId, continued } = values;
      const {
        companyId,
        fieldInfo: { id = "" } = {},
        pagination,
        enumOptionList = []
      } = this.state;
      const enumOptions = enumOptionList.map(item => {
        const {
          key,
          optionKey = key,
          value,
          optionValue = value,
          mappingValue
        } = item;
        return { optionKey, optionValue, mappingValue };
      });
      try {
        await (id
          ? updateEnumMapping({
              id,
              companyId,
              fieldId,
              enumOptionList: enumOptions
            })
          : addEnumMapping({
              companyId,
              fieldId,
              enumOptionList: enumOptions
            }));
        this.setState({ editConfirmShow: continued, loading: false }, () => {
          if (continued) {
            fetchNoMappingEnumFields({ companyId })
              .then(data => {
                const { content: fieldList = [] } = data;
                this.setState(
                  {
                    searchName: "",
                    fieldList,
                    editConfirmShow: true,
                    fieldInfo: {},
                    optionValue: undefined,
                    mappingValue: undefined,
                    enumOptionList: [],
                    enumOptions: []
                  },
                  () => {
                    this.props.form.resetFields(["fieldId"]);
                  }
                );
              })
              .catch(data => {
                notification.warning(data.content);
              });
          }
          this.loadEnumMappings(id ? pagination.current : 1);
        });
      } catch (data) {
        notification.warning(data.content);
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
        this.onFieldDelete();
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
      deleteConfirmShow: false
    });
  };

  onFieldDelete = async () => {
    const { record: { id } = {}, pagination } = this.state;
    delEnumMapping({ id })
      .then(() => {
        this.setState(
          {
            deleteConfirmShow: false
          },
          () => {
            this.loadEnumMappings(pagination.current);
          }
        );
      })
      .catch(data => {
        notification.warning(data.content);
        this.setState({
          deleteConfirmShow: false
        });
      });
  };
}

export default Form.create()(EnumerationList);
