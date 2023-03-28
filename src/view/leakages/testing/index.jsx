import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Input,
  Table,
  Modal,
  Form,
  notification,
  Upload,
  Select,
  Icon
} from "antd";
import LayoutRight from "@component/layout_right";
import { DMS_PREFIX } from "@common/constant";

import {
  fetchOnlineTestings,
  runOnlineTesting,
  stopOnlineTesting,
  fetchCompanyList
} from "@action/leakage";
import "./index.less";
import { getToken } from "@util";

const { Item: FormItem } = Form;
const { Option } = Select;
const { Search } = Input;
const executeStatusMap = {
  WAITING: "待执行",
  EXECUTING: "执行中",
  FINISHED: "已完成",
  EXCEPTION: "异常退出",
  STOPPED: "已停止"
};

class TestingList extends Component {
  state = {
    editConfirmShow: false,
    uploading: false,
    record: {},
    companyInfo: {}
  };
  beforeUploadFalse = false;

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
    this.loadTestings();
  }

  render() {
    const {
      isView = false,
      loading = false,
      uploading = false,
      companyName,
      fileUrl = "",
      companyList = [],
      dataSource = []
    } = this.state;

    const columns = [
      {
        title: "保险公司",
        dataIndex: "companyName",
        key: "companyName",
        onCell: record => {
          const { companyName } = record;
          return { title: companyName };
        }
      },
      {
        title: "可执行规则数量",
        dataIndex: "ruleCount",
        key: "ruleCount",
        onCell: record => {
          const { ruleCount } = record;
          return { title: ruleCount };
        }
      },
      {
        title: "状态",
        dataIndex: "executeStatus",
        key: "executeStatus",
        width: 100,
        render: text => {
          return executeStatusMap[text] || "";
        }
      },
      {
        title: "执行时间",
        dataIndex: "executeTime",
        key: "executeTime",
        width: 180
      },
      {
        title: "完成时间",
        dataIndex: "finishTime",
        key: "finishTime",
        width: 180
      },
      {
        title: "操作",
        dataIndex: "operations",
        key: "operations",
        width: 120,
        render: (text, record) => {
          const { executeStatus } = record;
          const isExecuting = executeStatus === "EXECUTING";
          const isFinished = executeStatus === "FINISHED";
          return (
            <Fragment>
              {isExecuting && (
                <span
                  className="operation-span"
                  onClick={() => {
                    this.onStopIconClick(record);
                  }}
                >
                  停止
                </span>
              )}
              {isFinished && (
                <span
                  className="operation-span"
                  onClick={() => {
                    this.onExportClick(record);
                  }}
                >
                  导出结果
                </span>
              )}
            </Fragment>
          );
        }
      }
    ];

    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    };

    const companyId = this.props.form.getFieldValue("companyId");
    const disabled = !companyId || uploading || loading;

    const props = {
      action: `/${DMS_PREFIX}/leakage/online/analysis/upload`,
      headers: { Authorization: `Bearer ${getToken()}` },
      disabled,
      showUploadList: false,
      data: { companyId },
      beforeUpload: file => {
        this.beforeUploadFalse = false;
        const isLt100M = file.size / 1024 / 1024 <= 100;
        if (!isLt100M) {
          notification.warning({ message: "文件大小限制在100M以下！" });
          this.beforeUploadFalse = true;
          return false;
        }
        this.setState({
          uploading: true,
          fileUrl: file.name
        });
      }
    };

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Input
            value={companyName}
            placeholder="公司名称"
            style={{ width: 200 }}
            onChange={this.changeKeyword}
          />
          <Button type="primary" onClick={this.onQuery}>
            查询
          </Button>
          <Button onClick={this.onReset}>重置</Button>
          <Button
            type="primary"
            style={{ float: "right" }}
            onClick={this.onCreateBtnClick}
          >
            新增测试
          </Button>
        </div>
        <div style={{ height: "calc(100% - 52px)", overflowY: "scroll" }}>
          <Table
            className="ellipsis"
            rowKey="id"
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            loading={loading}
          />
        </div>
        <Modal
          title="新增测试"
          centered
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          cancelButtonProps={{ disabled: uploading }}
          okButtonProps={{ disabled: uploading }}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onTestingSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="公司">
              <Select
                showSearch
                optionFilterProp="children"
                {...getFieldProps("companyId", {
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择公司" }]
                    }
                  ]
                })}
                placeholder=""
                disabled={uploading}
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
            <FormItem {...formItemLayout} label="案件清单">
              <Upload
                {...getFieldProps("file", {
                  valuePropName: "fileList",
                  getValueFromEvent: this.handleUploadChange,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择案件清单" }]
                    }
                  ]
                })}
                {...props}
              >
                <Search
                  value={fileUrl}
                  style={{ width: 352 }}
                  disabled={disabled}
                  readOnly
                  enterButton={uploading ? <Icon type="loading" /> : "选择文件"}
                />
              </Upload>
            </FormItem>
          </Form>
        </Modal>
      </LayoutRight>
    );
  }

  handleUploadChange = e => {
    const { file: { status, response } = {} } = e;
    if (this.beforeUploadFalse) {
      return [];
    }
    if (status === "done") {
      let { actionStatus, content: { filename = "" } = {} } = response;
      if (actionStatus === "FAIL") {
        this.setState({ uploading: false, fileUrl: "" });
        notification.warning(response.content);
        return [];
      }
      this.setState({ uploading: false, filename });
    }
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  onQuery = () => {
    this.loadTestings();
  };

  onReset = () => {
    this.setState(
      {
        companyName: undefined
      },
      () => {
        this.onQuery();
      }
    );
  };

  loadTestings = () => {
    const { companyName } = this.state;
    const data = {
      companyName
    };
    this.setState({
      loading: true
    });
    fetchOnlineTestings(data)
      .then(res => {
        const { content = [] } = res;
        this.setState({ dataSource: content, loading: false });
      })
      .catch(data => {
        notification.warning(data.content);
        this.setState({
          loading: false
        });
      });
  };

  changeKeyword = e => {
    this.setState({ companyName: e.target.value });
  };

  onCreateBtnClick = () => {
    this.setState(
      {
        editConfirmShow: true,
        companyInfo: {},
        fileUrl: "",
        filename: ""
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onStopIconClick = record => {
    const formData = new window.FormData();
    formData.append("companyId", record.companyId);
    stopOnlineTesting(formData)
      .then(() => {
        this.loadTestings();
      })
      .catch(data => {
        notification.warn(data.content);
      });
  };

  onExportClick = record => {
    const { id, companyId } = record;
    window.location.href = `/${DMS_PREFIX}/leakage/online/analysis/download/${companyId}/${id}`;
  };

  onEditCancel = () => {
    const { loading, uploading } = this.state;
    if (!loading && !uploading) {
      this.setState(
        {
          isView: false,
          editConfirmShow: false
        },
        () => {
          this.props.form.resetFields();
        }
      );
    }
  };

  onTestingSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      console.log(errors, values);
      if (errors) {
        return;
      }
      await this.setState({ loading: true });
      const { filename } = this.state;
      const { companyId } = values;
      const formData = new window.FormData();
      formData.append("companyId", companyId);
      formData.append("filename", filename);
      try {
        this.beforeUploadFalse = true;
        await runOnlineTesting(formData);
        setTimeout(() => {
          this.setState({ editConfirmShow: false, loading: false }, () => {
            this.loadTestings();
          });
        }, 1000);
      } catch (data) {
        notification.warning(data.content);
        this.setState({ loading: false });
      }
    });
  };
}

export default Form.create()(TestingList);
