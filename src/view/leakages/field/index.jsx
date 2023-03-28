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
  Icon,
  Badge,
  Tag
} from "antd";
import LayoutRight from "@component/layout_right";
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_MAP,
  FIELD_TYPES,
  FIELD_TYPE_MAP,
  SUCCESS,
  INSURANCE_TYPE,
  INSURANCE_TYPE_MAP
} from "@common/constant";
import {
  fetchBasicFieldList,
  addField,
  updateFieldActive,
  fieldDependencies,
  fetchFields4List,
  addFieldEnum,
  updateField,
  delField,
  addFieldList,
  downloadFiledFile,
  exportFiledFile,
  importFiledFile,
  onDownLoadTemplate
} from "@action/leakage";
import Enum from "./enum";
import { buildUrlParamNew, decisionModalError } from "@util";
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
    editConfirmShow: false,
    deleteConfirmShow: false,
    promptShow: false,
    promptMsg: "",
    record: {},
    fieldInfo: {},
    fieldSaveError: "",
    enumShow: false,
    enumList: [{ key: "", value: "" }],
    activeFields: [],
    filteredActiveFields: [],
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
    this.loadBasicFields();
  }

  render() {
    const {
      fieldInfo,
      fieldSaveError,
      isView = false,
      enumAddVisible = false,
      enumOptionData = [],
      enumAddData = [],
      containFieldList = [],
      promptShow,
      promptMsg,
      enumShow,
      enumList,
      loading = false,
      businessType,
      fieldType,
      keyword,
      insuranceCategory,
      dataSource = [],
      activeFields = [],
      filteredActiveFields = [],
      pagination
    } = this.state;
    const enumAddDataValues = enumAddData.map(item => item.value);

    const columns = [
      {
        title: "字段编码",
        dataIndex: "fieldCode",
        key: "fieldCode",
        onCell: record => {
          const { fieldCode } = record;
          return { title: fieldCode };
        }
      },
      {
        title: "字段名称",
        dataIndex: "fieldName",
        key: "fieldName",
        onCell: record => {
          const { fieldName } = record;
          return { title: fieldName };
        }
      },
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
        title: "字段类型",
        dataIndex: "fieldType",
        key: "fieldType",
        width: 120,
        render: (text, record) => {
          const { activeStatus } = record;
          const dataTypeName = FIELD_TYPE_MAP[text];
          return ["ENUM", "LIST"].includes(text) && activeStatus === ACTIVED ? (
            <span
              className="wa-primary-color"
              style={{ cursor: "pointer" }}
              onClick={() => this.onEnumCreate(record)}
            >
              {dataTypeName}
              <Icon
                className="wa-primary-color"
                type="plus-circle-o"
                style={{ position: "relative", top: 1 }}
              />
            </span>
          ) : (
            dataTypeName
          );
        }
      },
      {
        title: "激活",
        dataIndex: "activeStatus",
        key: "activeStatus",
        width: 100,
        render: (text, record) => {
          const { systemDefault = false } = record;
          return (
            <Switch
              style={{ width: 55 }}
              checkedChildren="ON"
              unCheckedChildren="OFF"
              checked={record.activeStatus === ACTIVED}
              disabled={systemDefault}
              onChange={checked => this.changeFieldActive(checked, record)}
            />
          );
        }
      },
      {
        title: "描述",
        dataIndex: "description",
        key: "description",
        onCell: record => {
          const { description } = record;
          return { title: description };
        }
      },
      {
        title: "操作",
        dataIndex: "operations",
        key: "operations",
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
            </Fragment>
          );
        }
      }
    ];

    const {
      id,
      fieldCode = "",
      fieldName = "",
      fieldType: fFieldType = undefined,
      description = "",
      businessType: fBusinessType,
      insuranceCategory: fBInsuranceCategory
    } = fieldInfo;
    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    };

    const isEnum = fFieldType === "ENUM";
    const isList = fFieldType === "LIST";
    let title = "";
    if (isEnum) {
      title = "枚举";
    } else if (isList) {
      title = "列表";
    }

    const fieldTypeValue = this.props.form.getFieldValue("fieldType");

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
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
          <Select
            placeholder="环节"
            allowClear
            style={{ width: 200 }}
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
          <Select
            placeholder="字段类型"
            allowClear
            style={{ width: 200 }}
            value={fieldType}
            onChange={this.changeFieldType}
          >
            {FIELD_TYPES.map(type => {
              return (
                <Option key={type} value={type}>
                  {FIELD_TYPE_MAP[type]}
                </Option>
              );
            })}
          </Select>
          <Input
            value={keyword}
            placeholder="字段编码/名称"
            style={{ width: 200 }}
            onChange={this.changeKeyword}
          />
          <Button type="primary" onClick={this.onQuery}>
            查询
          </Button>
          <Button onClick={this.onReset}>重置</Button>
          <div style={{ marginTop: "18px" }}>
            <Button type="primary" onClick={this.onCreateBtnClick}>
              新建
            </Button>
            <Button type="primary" onClick={this.onFileSelect}>
              批量导入
            </Button>
            <Button onClick={this.onExportBtnClick} className="export-btn">
              导出
            </Button>
            <Button onClick={this.onDownloadClick} className="download-ant-btn">
              下载批量导入模板
            </Button>
            <form
              ref="file-up-form"
              style={{ display: "none" }}
              encType="multipart/form-data"
            >
              <input
                id="file"
                name="file"
                ref="upload-input"
                type="file"
                onChange={this.uploadChange}
              />
            </form>
          </div>
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
          title={`${id > 0 ? (isView ? "查看" : "编辑") : "新建"}基础字段`}
          centered
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onFieldSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="字段名称">
              <Input
                {...getFieldProps("fieldName", {
                  initialValue: fieldName,
                  validate: [
                    {
                      rules: [{ required: true, message: "最多50个字符" }]
                    }
                  ]
                })}
                placeholder="最多50个字符"
                maxLength="50"
                disabled={isView}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="字段编码">
              <Input
                {...getFieldProps("fieldCode", {
                  initialValue: fieldCode,
                  validate: [
                    {
                      rules: [
                        {
                          required: true,
                          whitespace: true,
                          pattern: /^\w+$/,
                          message: "字母数字下划线,最多50个字符"
                        }
                      ]
                    }
                  ]
                })}
                placeholder="字母数字下划线,最多50个字符"
                maxLength="50"
                disabled={isView}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="字段类型">
              <Select
                {...getFieldProps("fieldType", {
                  initialValue: fFieldType,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择字段类型" }]
                    }
                  ]
                })}
                placeholder="请选择字段类型"
                onSelect={this.dataTypeSelect}
                disabled={isView}
              >
                {FIELD_TYPES.map(type => {
                  return (
                    <Option key={type} value={type}>
                      {FIELD_TYPE_MAP[type]}
                    </Option>
                  );
                })}
              </Select>
            </FormItem>
            <Enum
              type={fieldTypeValue}
              visible={enumShow}
              disabled={isView}
              list={enumList}
              onEnumAdd={this.onEnumAdd}
              onEnumDelete={this.onEnumDelete}
              onEnumChange={this.onEnumChange}
            />
            <FormItem {...formItemLayout} label="业务类型">
              <Select
                disabled={isView}
                {...getFieldProps("insuranceCategory", {
                  initialValue: fBInsuranceCategory,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择业务类型" }]
                    }
                  ]
                })}
                placeholder="请选择"
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
            <FormItem {...formItemLayout} label="环节">
              <Select
                disabled={isView}
                {...getFieldProps("businessType", {
                  initialValue: fBusinessType,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择业务类型" }]
                    }
                  ]
                })}
                placeholder="请选择"
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
            <FormItem {...formItemLayout} label="描述">
              <Input.TextArea
                {...getFieldProps("description", {
                  initialValue: description,
                  validate: [
                    {
                      rules: [{ required: true, message: "请填写描述" }]
                    }
                  ]
                })}
                rows={4}
                placeholder="最多200个字符"
                maxLength="200"
                disabled={isView}
              />
            </FormItem>
            <Row className="save-error">{fieldSaveError}</Row>
          </Form>
        </Modal>
        <Modal
          width={600}
          title={`添加${title}值`}
          className="basic-field-list-modal"
          visible={enumAddVisible}
          onCancel={this.onCancel}
          onOk={this.onOk}
        >
          {isEnum && (
            <div className="header">
              {enumOptionData
                .map(enumOption => {
                  const { key = "", value = "" } = enumOption;
                  return `${key}-${value}`;
                })
                .join("; ")}
            </div>
          )}
          {isEnum &&
            enumAddData.map((enumAdd, index) => {
              const { key = "", value = "" } = enumAdd;
              return (
                <div key={index} className="enum-add">
                  <div className="item">
                    <span>key:</span>
                    <Input
                      value={key}
                      onChange={e => this.changeEnum(e, "key", index)}
                      placeholder="请输入"
                    />
                  </div>
                  <div className="item">
                    <span>value:</span>
                    <Input
                      value={value}
                      onChange={e => this.changeEnum(e, "value", index)}
                      placeholder="请输入"
                    />
                  </div>
                  <Icon
                    type="delete"
                    onClick={() => {
                      this.removeEnum(index);
                    }}
                  />
                </div>
              );
            })}
          {isList &&
            containFieldList.map(field => {
              const { basicFieldId } = field;
              return (
                <div key={basicFieldId} className="enum-add">
                  <Select value={basicFieldId} disabled>
                    {activeFields.map(item => {
                      const { id, fieldName } = item;
                      return (
                        <Option key={id} value={id} title={fieldName}>
                          {fieldName}
                        </Option>
                      );
                    })}
                  </Select>
                </div>
              );
            })}
          {isList &&
            enumAddData.map((enumAdd, index) => {
              const { value } = enumAdd;
              return (
                <div key={index} className="enum-add">
                  <Select
                    value={value}
                    showSearch
                    optionFilterProp="children"
                    onChange={e => this.changeList(e, "value", index)}
                  >
                    {filteredActiveFields
                      .filter(item => {
                        const { id } = item;
                        return !enumAddDataValues.includes(id) || value === id;
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
                  <Icon
                    type="delete"
                    onClick={() => {
                      this.removeEnum(index);
                    }}
                  />
                </div>
              );
            })}
          <div className="layout-create" onClick={this.createEnum}>
            添加项
          </div>
        </Modal>
      </LayoutRight>
    );
  }

  onQuery = () => {
    this.loadBasicFields();
  };

  onReset = () => {
    this.setState(
      {
        keyword: undefined,
        businessType: undefined,
        fieldType: undefined,
        insuranceCategory: undefined
      },
      () => {
        this.onQuery();
      }
    );
  };

  loadBasicFields = (page = 1) => {
    const {
      pagination,
      businessType,
      fieldType,
      keyword,
      insuranceCategory
    } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      businessType,
      fieldType,
      keyword,
      page,
      size,
      insuranceCategory
    };
    this.setState({
      loading: true
    });
    fetchBasicFieldList(data)
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.loadBasicFields();
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

  changeEnum = (e, field, index) => {
    const { enumAddData = [] } = this.state;
    enumAddData[index] = { ...enumAddData[index], [field]: e.target.value };
    this.setState({
      enumAddData
    });
  };

  changeList = (value, field, index) => {
    const { enumAddData = [] } = this.state;
    enumAddData[index] = { ...enumAddData[index], [field]: value };
    this.setState({
      enumAddData
    });
  };

  createEnum = () => {
    const { enumAddData = [] } = this.state;
    enumAddData.push({ key: undefined, value: undefined });
    this.setState({
      enumAddData
    });
  };

  removeEnum = index => {
    const { enumAddData = [] } = this.state;
    enumAddData.splice(index, 1);
    this.setState({
      enumAddData
    });
  };

  onOk = () => {
    const {
      enumAddData = [],
      fieldInfo: { id = "", fieldType } = {}
    } = this.state;
    const isEnum = fieldType === "ENUM";
    const isList = fieldType === "LIST";
    const hasEmpty =
      enumAddData.findIndex(enumAdd => {
        const { key = "", value = "" } = enumAdd;
        return (key.length === 0 && isEnum) || value.length === 0;
      }) !== -1;
    const hasDuplicatedKey = this.hasDuplicatedKey(enumAddData);
    if (hasEmpty) {
      if (isEnum) {
        notification.warning({
          message: "请将枚举值信息填写完整"
        });
      }
      if (isList) {
        notification.warning({
          message: "请将列表值信息填写完整"
        });
      }
      return;
    }
    if (isEnum && hasDuplicatedKey) {
      notification.warning({
        message: "枚举值key重复"
      });
      return;
    }
    let promise;
    if (isEnum) {
      const enumOptionList = enumAddData.map(enumAdd => {
        const { key, value } = enumAdd;
        return { optionKey: key, optionValue: value };
      });
      promise = addFieldEnum({ id, enumOptionList });
    } else if (isList) {
      const containFieldIds = enumAddData.map(enumAdd => {
        const { value } = enumAdd;
        return value;
      });
      promise = addFieldList({ id, containFieldIds });
    }
    promise &&
      promise
        .then(() => {
          this.setState(
            {
              record: {},
              enumAddVisible: false,
              enumAddData: []
            },
            () => {
              const { pagination: { current = 1 } = {} } = this.state;
              this.loadBasicFields(current);
            }
          );
        })
        .catch(data => {
          const { content = {} } = data;
          notification.warn(content);
        });
  };

  onCancel = () => {
    this.setState({
      enumAddVisible: false
    });
  };

  onEnumCreate = async record => {
    const { fieldType, enumOption = "{}", containFieldList = [] } = record;
    let data = { enumAddData: [] };
    switch (fieldType) {
      case "ENUM":
        const { data: enumOptionData = [] } = JSON.parse(enumOption);
        data = { ...data, enumOptionData };
        break;
      case "LIST":
        const { content: activeFields = [] } = await fetchFields4List();
        const containFieldIDs = containFieldList.map(item => item.basicFieldId);
        const filteredActiveFields = activeFields.filter(
          item => !containFieldIDs.includes(item.id)
        );
        data = {
          ...data,
          containFieldList,
          activeFields,
          filteredActiveFields
        };
        break;
    }
    this.setState({
      fieldInfo: record,
      enumAddVisible: true,
      ...data
    });
  };

  handleChange = pagination => {
    this.setState({ pagination }, () => {
      this.loadBasicFields(pagination.current);
    });
  };

  changeBusinessType = e => {
    this.setState({ businessType: e });
  };
  changeInsuranceCategory = e => {
    this.setState({ insuranceCategory: e });
  };
  changeFieldType = e => {
    this.setState({ fieldType: e });
  };

  changeKeyword = e => {
    this.setState({ keyword: e.target.value });
  };

  changeFieldActive = async (checked, record) => {
    const { pagination: { current = 1 } = {} } = this.state;
    if (checked) {
      updateFieldActive({
        ...record,
        activeStatus: checked ? ACTIVED : UN_ACTIVED
      })
        .then(res => {
          record.activeStatus = checked ? ACTIVED : UN_ACTIVED;
          this.setState({ editConfirmShow: false, loading: false }, () => {
            this.loadBasicFields(current);
          });
        })
        .catch(data => {
          const { content = {} } = data;
          notification.warn(content);
        });
    } else {
      fieldDependencies(buildUrlParamNew({ id: record.id }))
        .then(res => {
          const { content = [] } = res;
          if (content.length === 0) {
            updateFieldActive({
              ...record,
              activeStatus: checked ? ACTIVED : UN_ACTIVED
            })
              .then(res => {
                record.activeStatus = checked ? ACTIVED : UN_ACTIVED;
                this.setState(
                  { editConfirmShow: false, loading: false },
                  () => {
                    this.loadBasicFields(current);
                  }
                );
              })
              .catch(data => {
                const { content = {} } = data;
                notification.warn(content);
              });
          } else {
            const nameMapError = {
              LIST_TYPE: "列表类型:",
              TEMPLATE_TYPE: "因子模板类型:",
              BASIC_INFO_TYPE: "基础信息类型:"
            };
            decisionModalError(content, nameMapError, {
              title:
                "该基础字段正在被以下组件使用，无法进行此操作，请取消后重试。"
            });
          }
        })
        .catch(data => {
          const { content = {} } = data;
          notification.warn(content);
        });
    }
  };

  dataTypeSelect = (value = "") => {
    this.setState({
      enumShow: ["ENUM", "LIST"].includes(value),
      enumList: [{ key: "", value: "" }]
    });
  };

  onCreateBtnClick = () => {
    this.setState(
      {
        editConfirmShow: true,
        fieldInfo: {},
        fieldSaveError: "",
        enumShow: false,
        enumList: [{ key: "", value: "" }]
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };
  onExportBtnClick = () => {
    const { businessType, fieldType, keyword, insuranceCategory } = this.state;
    const data = {
      businessType,
      fieldType,
      keyword,
      insuranceCategory
    };
    exportFiledFile(data);
  };
  onDownloadClick = () => {
    onDownLoadTemplate();
  };
  onFileSelect = () => {
    this.refs["upload-input"].click();
  };
  uploadChange = e => {
    const file = e.target.files[0];
    const { name = "" } = file || {};
    this.setState({ uploadLoading: true }, () => {
      try {
        const formData = new window.FormData();
        formData.append("file", file, name);
        importFiledFile(formData)
          .then(data => {
            const { content } = data;
            if (content) {
              return this.showConfirm(content);
            }
            notification.error({
              message: `导入成功！`
            });
            this.loadBasicFields();
            this.setState({
              uploadLoading: false
            });
          })
          .catch(data => {
            const { content } = data;
            notification.warning({ duration: 2.5, ...content });
            this.setState({
              uploadLoading: false
            });
          });
      } catch (err) {
        this.setState({
          uploadLoading: false
        });
        notification.warning(err);
      } finally {
        this.refs["upload-input"].value = null;
      }
    });
  };
  showConfirm(content) {
    confirm({
      title: "导入失败!",
      content: `请手动下载导入文件...`,
      okText: "下载",
      cancelText: "取消",
      onOk() {
        downloadFiledFile({ path: content });
      },
      onCancel() {
        console.log("Cancel");
      }
    });
  }
  onEditIconClick = (fieldInfo, editType = "edit") => {
    const { fieldType, enumOption, containFieldList = [] } = fieldInfo;
    this.editType = editType;
    let data = {};
    switch (fieldType) {
      case "ENUM":
        data = {
          ...data,
          enumList: JSON.parse(enumOption).data,
          enumShow: true
        };
        break;
      case "LIST":
        const enumList = containFieldList.map(item => {
          const { basicFieldId } = item;
          return { value: basicFieldId };
        });
        data = {
          ...data,
          enumList,
          enumShow: true
        };
        break;
    }
    this.setState(
      {
        isView: editType === "view",
        editConfirmShow: true,
        fieldInfo,
        ...data
      },
      () => {
        this.props.form.resetFields();
        this.props.form.validateFields();
      }
    );
  };

  onEditCancel = () => {
    this.setState(
      {
        isView: false,
        editConfirmShow: false,
        fieldInfo: {},
        enumShow: false,
        enumList: [{ key: "", value: "" }],
        fieldSaveError: ""
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onFieldSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      const { fieldType } = values;
      const isEnum = fieldType === "ENUM";
      const isList = fieldType === "LIST";
      let { enumList = [], pagination } = this.state;
      let hasEnumError = false;
      if (isEnum || isList) {
        const hasDuplicatedKey = this.hasDuplicatedKey(enumList);
        if (isEnum && hasDuplicatedKey) {
          notification.warning({
            message: "枚举值key重复"
          });
          return;
        }
        const enumListLen = enumList.length;
        for (let i = 0; i < enumListLen; i++) {
          const item = enumList[i];
          const { key = "", value = "" } = item;
          enumList[i]["keyError"] = false;
          enumList[i]["valueError"] = false;
          if (key.trim() === "" && isEnum) {
            enumList[i]["keyError"] = true;
            hasEnumError = true;
          }
          if ((!isList && value.trim().length === 0) || (isList && !value)) {
            enumList[i]["valueError"] = true;
            hasEnumError = true;
          }
        }
      }
      if (errors || hasEnumError) {
        if (hasEnumError) {
          this.setState({ enumList });
        }
        return;
      }
      await this.setState({ loading: true });
      try {
        let editFieldResponse = {};
        const { id = "" } = this.state.fieldInfo;
        const {
          fieldCode = "",
          fieldName = "",
          fieldType = "",
          description = "",
          businessType,
          insuranceCategory
        } = this.props.form.getFieldsValue();
        const enumOption =
          fieldType === "ENUM" ? JSON.stringify({ data: enumList }) : "";
        const containFieldIds = isList
          ? enumList.map(({ value }) => value)
          : undefined;
        const queryData = {
          name: fieldName,
          code: fieldCode,
          fieldType: fieldType.toUpperCase(),
          businessType,
          description,
          enumOption,
          containFieldIds,
          insuranceCategory,
          domainType
        };
        const isEdit = id > 0;
        editFieldResponse = await (isEdit
          ? updateField({
              id,
              ...queryData
            })
          : addField({
              ...queryData
            }));
        const { promise } = editFieldResponse;
        promise
          .then(data => {
            const { actionStatus = "" } = data;
            if (actionStatus === SUCCESS) {
              this.setState({ editConfirmShow: false, loading: false }, () => {
                this.loadBasicFields(isEdit ? pagination.current : 1);
              });
            }
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
      deleteConfirmShow: false,
      fieldSaveError: ""
    });
  };

  onFieldDelete = async () => {
    const { record: { id } = {}, pagination } = this.state;
    delField({ id })
      .then(res => {
        const { actionStatus = "" } = res;
        if (actionStatus === SUCCESS) {
          this.setState(
            {
              deleteConfirmShow: false
            },
            () => {
              this.loadBasicFields(pagination.current);
            }
          );
        }
      })
      .catch(data => {
        notification.warning(data.content);
        this.setState({
          deleteConfirmShow: false,
          promptShow: true
        });
      });
  };

  onEnumAdd = () => {
    const { enumList } = this.state;
    enumList.push({ key: "", value: "" });
    this.setState({ enumList });
  };

  onEnumDelete = index => {
    const { enumList } = this.state;
    enumList.splice(index, 1);
    this.setState({ enumList });
  };

  onEnumChange = (value, index, prop, setState = false) => {
    const { enumList } = this.state;
    enumList[index][prop] = value;
    if (setState) {
      this.setState({ enumList });
    }
  };

  hasDuplicatedKey = enumList => {
    const keys = enumList.map(e => e.key);
    return keys.length > [...new Set(keys)].length;
  };
}

export default Form.create()(BasicField);
