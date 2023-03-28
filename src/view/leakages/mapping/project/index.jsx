import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Button, Input, Table, Modal, Form, notification, Select } from "antd";
import LayoutRight from "@component/layout_right";

import {
  fetchProjectNameMappings,
  addProjectNameMapping,
  updateProjectNameMapping,
  delProjectNameMapping,
  uploadProjectNameMapping,
  fetchCompanyList,
  fetchProjectNameList
} from "@action/leakage";
import "./index.less";

const { Item: FormItem } = Form;
const { confirm } = Modal;
const { Option } = Select;

class ProjectList extends Component {
  state = {
    editConfirmShow: false,
    deleteConfirmShow: false,
    record: {},
    projectInfo: {},
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
      projectInfo,
      isView = false,
      loading = false,
      companyId,
      searchName = "",
      projectName,
      companyList = [],
      projectNameList = [],
      dataSource = [],
      pagination
    } = this.state;

    const {
      id,
      mappingName: cMappingName = "",
      projectNameId: cProjectNameId,
      projectName: cProjectName
    } = projectInfo;

    let filterProjectNameList = projectNameList
      .filter(item => {
        const { projectName = "" } = item;
        return (projectName || "")
          .toLocaleLowerCase()
          .includes((searchName || "").toLocaleLowerCase());
      })
      .slice(0, 200);
    if (cProjectNameId) {
      const matchList = filterProjectNameList.filter(item => {
        const { id } = item;
        return id === cProjectNameId;
      });
      if (!matchList.length) {
        filterProjectNameList = [
          ...filterProjectNameList,
          { id: cProjectNameId, projectName: cProjectName }
        ];
      }
    }

    const columns = [
      {
        title: "原始项目名称",
        dataIndex: "projectName",
        key: "projectName",
        onCell: record => {
          const { projectName } = record;
          return { title: projectName };
        }
      },
      {
        title: "映射项目名称",
        dataIndex: "mappingName",
        key: "mappingName",
        onCell: record => {
          const { mappingName } = record;
          return { title: mappingName };
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
            value={projectName}
            placeholder="项目名称"
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
          title={`${isEdit ? (isView ? "查看" : "编辑") : "新建"}项目名映射`}
          centered
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onProjectNameMappingSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="原始项目名称">
              <Select
                defaultActiveFirstOption={false}
                filterOption={false}
                showSearch
                onSearch={this.onSearch}
                disabled={isView}
                {...getFieldProps("projectNameId", {
                  initialValue: cProjectNameId,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择原始项目名称" }]
                    }
                  ]
                })}
                placeholder="请选择"
              >
                {filterProjectNameList.map(item => {
                  const { id, projectName } = item;
                  return (
                    <Option key={id} value={id}>
                      {projectName}
                    </Option>
                  );
                })}
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="映射项目名称">
              <Input
                {...getFieldProps("mappingName", {
                  initialValue: cMappingName,
                  validate: [
                    {
                      rules: [
                        {
                          required: true,
                          whitespace: true,
                          message: "最多255个字符"
                        }
                      ]
                    }
                  ]
                })}
                placeholder="最多255个字符"
                maxLength="255"
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
    window.location.href = `/dms/leakage/projectNameMapping/download`;
  };

  onQuery = () => {
    this.loadProjects();
  };

  onReset = () => {
    const { pagination } = this.state;
    this.setState({
      pagination: { ...pagination, current: 1, total: 0 },
      dataSource: [],
      projectName: undefined,
      companyId: undefined
    });
  };

  loadProjects = (page = 1) => {
    const { pagination, projectName, companyId } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      companyId,
      projectName,
      page,
      size
    };
    this.setState({
      loading: true
    });
    fetchProjectNameMappings(data)
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
    this.setState({ projectName: e.target.value });
  };

  onCreateBtnClick = () => {
    fetchProjectNameList()
      .then(data => {
        const { content: projectNameList = [] } = data;
        this.setState(
          {
            searchName: "",
            projectNameList,
            editConfirmShow: true,
            projectInfo: {}
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

  onEditIconClick = (projectInfo, editType = "edit") => {
    fetchProjectNameList()
      .then(data => {
        const { content: projectNameList = [] } = data;
        this.setState(
          {
            searchName: "",
            projectNameList,
            isView: editType === "view",
            editConfirmShow: true,
            projectInfo
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
        projectInfo: {}
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onProjectNameMappingSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return;
      }
      await this.setState({ loading: true });
      const {
        companyId,
        projectInfo: { id = "" } = {},
        pagination
      } = this.state;
      try {
        await (id
          ? updateProjectNameMapping({
              id,
              companyId,
              ...values
            })
          : addProjectNameMapping({
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
    delProjectNameMapping({ id })
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
          uploadProjectNameMapping(formData)
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

export default Form.create()(ProjectList);
