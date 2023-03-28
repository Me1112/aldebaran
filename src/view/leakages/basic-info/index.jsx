import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Select,
  Input,
  Table,
  Modal,
  Form,
  Row,
  notification,
  Checkbox
} from "antd";
import LayoutRight from "@component/layout_right";
import {
  FACTOR_TEMPLATE_TYPES,
  FACTOR_TEMPLATE_TYPE_MAP
} from "@common/constant";

import {
  fetchBasicInfoList,
  addBasicInfo,
  delBasicInfo,
  updateBasicInfo,
  fetchActiveFieldByType
} from "@action/leakage";
import "./index.less";

const { Option } = Select;
const { Item: FormItem } = Form;
const { confirm } = Modal;
const ACTIVED = "ACTIVED";

class BasicInfo extends Component {
  state = {
    domainType: "ANTI_LEAKAGE",
    editConfirmShow: false,
    deleteConfirmShow: false,
    promptShow: false,
    promptMsg: "",
    record: {},
    basicInfo: {},
    fieldSaveError: "",
    enumShow: false,
    enumList: [{}],
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
    this.loadBasicInfoList();
    fetchActiveFieldByType({ fieldType: "CUMULATIVE" })
      .then(data => {
        const { content: categoryList = [] } = data;
        this.setState({ categoryList });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  }

  render() {
    const {
      basicInfo,
      fieldSaveError,
      isView = false,
      promptShow,
      promptMsg,
      loading = false,
      continued = false,
      domainType,
      categoryId,
      keyword,
      dataSource = [],
      categoryList = [],
      pagination
    } = this.state;
    const readOnly = isView;

    const columns = [
      {
        title: "领域",
        dataIndex: "domainType",
        key: "domainType",
        width: 120,
        onCell: record => {
          const { domainType } = record;
          return { title: FACTOR_TEMPLATE_TYPE_MAP[domainType] };
        },
        render: text => {
          return FACTOR_TEMPLATE_TYPE_MAP[text];
        }
      },
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
        onCell: record => {
          const { name } = record;
          return { title: name };
        }
      },
      {
        title: "统计类",
        dataIndex: "categoryName",
        key: "categoryName",
        onCell: record => {
          const { categoryName } = record;
          return { title: categoryName };
        }
      },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 190
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
      name: tName = "",
      domainType: tDomainType = "ANTI_LEAKAGE",
      categoryId: tCategoryId
    } = basicInfo;

    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 }
    };
    const formTailLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19, offset: 4 }
    };

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Select
            placeholder="领域"
            allowClear={false}
            style={{ width: 200 }}
            value={domainType}
            onChange={this.changeBusinessType}
          >
            {FACTOR_TEMPLATE_TYPES.map(type => {
              return (
                <Option key={type} value={type}>
                  {FACTOR_TEMPLATE_TYPE_MAP[type]}
                </Option>
              );
            })}
          </Select>
          <Select
            placeholder="类别"
            allowClear
            style={{ width: 200 }}
            value={categoryId}
            onChange={this.changeCategory}
          >
            {categoryList.map(item => {
              const { id, fieldName } = item;
              return (
                <Option key={id} value={id} title={fieldName}>
                  {fieldName}
                </Option>
              );
            })}
          </Select>
          <Input
            value={keyword}
            placeholder="名称"
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
          title={`${id > 0 ? (isView ? "查看" : "编辑") : "新建"}基础信息`}
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
            <FormItem {...formItemLayout} label="领域">
              <Select
                disabled={readOnly}
                {...getFieldProps("domainType", {
                  initialValue: tDomainType,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择领域" }]
                    }
                  ]
                })}
                placeholder="请选择"
              >
                {FACTOR_TEMPLATE_TYPES.map(type => {
                  return (
                    <Option key={type} value={type}>
                      {FACTOR_TEMPLATE_TYPE_MAP[type]}
                    </Option>
                  );
                })}
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="名称">
              <Input
                {...getFieldProps("name", {
                  initialValue: tName,
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
            <FormItem {...formItemLayout} label="类别">
              <Select
                disabled={readOnly}
                {...getFieldProps("categoryId", {
                  initialValue: tCategoryId,
                  validate: [
                    {
                      rules: [{ required: true, message: "请选择类别" }]
                    }
                  ]
                })}
                placeholder="请选择"
              >
                {categoryList.map(item => {
                  const { id, fieldName } = item;
                  return (
                    <Option key={id} value={id} title={fieldName}>
                      {fieldName}
                    </Option>
                  );
                })}
              </Select>
            </FormItem>
            {!id && (
              <FormItem {...formTailLayout}>
                <Checkbox
                  disabled={readOnly}
                  {...getFieldProps("continued", {
                    initialValue: continued,
                    valuePropName: "checked"
                  })}
                >
                  连续添加
                </Checkbox>
              </FormItem>
            )}
            <Row className="save-error">{fieldSaveError}</Row>
          </Form>
        </Modal>
      </LayoutRight>
    );
  }

  onQuery = () => {
    this.loadBasicInfoList();
  };

  onReset = () => {
    this.setState(
      {
        categoryId: undefined,
        keyword: undefined,
        domainType: "ANTI_LEAKAGE"
      },
      () => {
        this.onQuery();
      }
    );
  };

  loadBasicInfoList = (page = 1) => {
    const { pagination, domainType, keyword, categoryId } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      domainType,
      keyword,
      categoryId,
      page,
      size
    };
    this.setState({
      loading: true
    });
    fetchBasicInfoList(data)
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.loadBasicInfoList();
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
      this.loadBasicInfoList(pagination.current);
    });
  };

  changeBusinessType = e => {
    this.setState({ domainType: e });
  };

  changeCategory = e => {
    this.setState({ categoryId: e });
  };

  changeKeyword = e => {
    this.setState({ keyword: e.target.value });
  };

  onCreateBtnClick = () => {
    this.setState(
      {
        editConfirmShow: true,
        basicInfo: {},
        fieldSaveError: "",
        enumShow: false,
        enumList: [{}]
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onEditIconClick = (basicInfo, editType = "edit") => {
    this.setState(
      {
        isView: editType === "view",
        editConfirmShow: true,
        basicInfo
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
        basicInfo: {},
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
      let { basicInfo = {}, pagination } = this.state;

      if (errors) {
        return;
      }
      this.setState({ loading: true });
      try {
        const { id = "" } = basicInfo;
        const { continued, ...other } = values;
        const isEdit = id > 0;
        const promise = isEdit
          ? updateBasicInfo({ id, ...other })
          : addBasicInfo(other);
        promise
          .then(data => {
            this.setState(
              { editConfirmShow: continued, loading: false },
              () => {
                if (continued) {
                  this.props.form.resetFields(["name"]);
                }
                this.loadBasicInfoList(isEdit ? pagination.current : 1);
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
    const { record: { id } = {}, pagination } = this.state;
    delBasicInfo({ id })
      .then(res => {
        this.setState(
          {
            deleteConfirmShow: false
          },
          () => {
            this.loadBasicInfoList(pagination.current);
          }
        );
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
}

export default Form.create()(BasicInfo);
