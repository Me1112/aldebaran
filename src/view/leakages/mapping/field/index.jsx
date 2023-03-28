import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Input, Table, Modal, Form, notification, Select } from "antd";
import LayoutRight from "@component/layout_right";

import {
  fetchFieldMappings,
  addFieldMapping,
  delFieldMapping,
  uploadFieldMapping,
  fetchCompanyList,
  fetchAllActiveFields,
  updateFieldMapping
} from "@action/leakage";
import "./index.less";

const { Item: FormItem } = Form;
const { confirm } = Modal;
const { Option } = Select;

class FieldList extends Component {
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
      searchName,
      companyId,
      fieldCode,
      fieldList = [],
      companyList = [],
      dataSource = [],
      pagination
    } = this.state;
    const {
      id,
      fieldId: cFieldId,
      fieldName: cFieldName = "",
      mappingCode: cMappingCode = ""
    } = fieldInfo;

    let filterFieldList = fieldList
      .filter(item => {
        const { fieldCode = "" } = item;
        return (fieldCode || "")
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
        title: "字段名称",
        dataIndex: "fieldName",
        key: "fieldName",
        onCell: record => {
          const { fieldName } = record;
          return { title: fieldName };
        }
      },
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
        title: "映射字段编码",
        dataIndex: "mappingCode",
        key: "mappingCode",
        onCell: record => {
          const { mappingCode } = record;
          return { title: mappingCode };
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
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
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
            placeholder="字段编码"
            style={{ width: 200 }}
            onChange={this.changeKeyword}
          />
          <Button type="primary" onClick={this.onQuery} disabled={disabled}>
            查询
          </Button>
          <Button onClick={this.onReset}>重置</Button>
          <Button
            className="fr download-ant-btn"
            onClick={this.onDownloadClick}
          >
            下载模板
          </Button>
          <Button
            type="primary"
            className="fr"
            onClick={this.onFileSelect}
            disabled={disabled}
          >
            导入
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
          title={`${isEdit ? (isView ? "查看" : "编辑") : "新建"}字段名映射`}
          centered
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onFieldMappingSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="字段编码">
              <Select
                defaultActiveFirstOption={false}
                filterOption={false}
                showSearch
                onSearch={this.onSearch}
                disabled={isView}
                {...getFieldProps("fieldId", {
                  initialValue: cFieldId,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择字段编码" }]
                    }
                  ]
                })}
                placeholder="请选择"
              >
                {filterFieldList.map(item => {
                  const { id, fieldCode } = item;
                  return (
                    <Option key={id} value={id}>
                      {fieldCode}
                    </Option>
                  );
                })}
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="映射字段编码">
              <Input
                {...getFieldProps("mappingCode", {
                  initialValue: cMappingCode,
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
          </Form>
        </Modal>
      </LayoutRight>
    );
  }

  onSearch = searchName => {
    this.setState({ searchName });
  };

  changeCompany = e => {
    this.setState({ companyId: e });
  };

  onDownloadClick = () => {
    window.location.href = `/dms/leakage/fieldMapping/download`;
  };

  onQuery = () => {
    this.loadProjects();
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

  loadProjects = (page = 1) => {
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
    fetchFieldMappings(data)
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.loadProjects();
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
      this.loadProjects(pagination.current);
    });
  };

  changeKeyword = e => {
    this.setState({ fieldCode: e.target.value });
  };

  onCreateBtnClick = () => {
    fetchAllActiveFields()
      .then(data => {
        const { content: fieldList = [] } = data;
        this.setState(
          {
            searchName: "",
            fieldList,
            editConfirmShow: true,
            fieldInfo: {}
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

  onEditIconClick = (fieldInfo, editType = "edit") => {
    fetchAllActiveFields()
      .then(data => {
        const { content: fieldList = [] } = data;
        this.setState(
          {
            searchName: "",
            fieldList,
            isView: editType === "view",
            editConfirmShow: true,
            fieldInfo
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

  onFieldMappingSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return;
      }
      await this.setState({ loading: true });
      const { companyId, fieldInfo: { id = "" } = {}, pagination } = this.state;
      try {
        await (id
          ? updateFieldMapping({
              id,
              companyId,
              ...values
            })
          : addFieldMapping({
              companyId,
              ...values
            }));
        this.setState({ editConfirmShow: false, loading: false }, () => {
          this.loadProjects(id ? pagination.current : 1);
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
    delFieldMapping({ id })
      .then(() => {
        this.setState(
          {
            deleteConfirmShow: false
          },
          () => {
            this.loadProjects(pagination.current);
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

  onFileSelect = () => {
    this.refs["upload-input"].click();
  };

  uploadChange = e => {
    const { companyId } = this.state;
    const file = e.target.files[0];
    const { name = "" } = file || {};
    const regex = /.csv$/;
    if (!regex.test(e.target.value)) {
      notification.warn({ message: "请选择CSV文件" });
    } else {
      this.setState({ uploadLoading: true }, () => {
        try {
          const formData = new window.FormData();
          formData.append("companyId", companyId);
          formData.append("file", file, name);
          uploadFieldMapping(formData)
            .then(data => {
              const { content: { successCount = 0 } = {} } = data;
              notification.success({
                message: `成功导入${successCount}条数据`
              });
              this.loadProjects();
              this.setState({
                uploadLoading: false
              });
            })
            .catch(data => {
              const { content = {} } = data;
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
    }
  };
}

export default Form.create()(FieldList);
