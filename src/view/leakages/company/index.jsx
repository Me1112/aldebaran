import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Input,
  Table,
  Modal,
  Form,
  notification,
  Radio,
  Upload,
  Icon,
  Checkbox
} from "antd";
import { v4 } from "uuid";
import LayoutRight from "@component/layout_right";
import { getUserInfo } from "../../../util";
import {
  fetchCompanies,
  addCompany,
  updateCompany,
  delCompany
} from "@action/leakage";
import "./index.less";
import { AREA_TYPE, AREA_TYPE_MAP } from "@common/constant";
const { domainType = "" } = getUserInfo();
const { Item: FormItem } = Form;
const { confirm } = Modal;

class CompanyList extends Component {
  state = {
    domainType: domainType,
    editConfirmShow: false,
    deleteConfirmShow: false,
    record: {},
    companyInfo: {},
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
    this.loadCompanies();
  }

  render() {
    const {
      companyInfo,
      isView = false,
      loading = false,
      uploading = false,
      companyName,
      dataSource = [],
      pagination,
      indeterminate = true,
      checkAll = false,
      checkedAreaList = []
    } = this.state;
    const columns = [
      {
        title: "公司编号",
        dataIndex: "companyCode",
        key: "companyCode",
        onCell: record => {
          const { companyCode } = record;
          return { title: companyCode };
        }
      },
      {
        title: "公司名称",
        dataIndex: "companyName",
        key: "companyName",
        onCell: record => {
          const { companyName } = record;
          return { title: companyName };
        }
      },
      {
        title: "所辖机构",
        dataIndex: "applyRegion",
        key: "applyRegion",
        width: 150,
        render: (text = "") => {
          return text
            .split(",")
            .map(type => AREA_TYPE_MAP[type])
            .join("、");
        }
      },
      // {
      //   title: "应用领域",
      //   dataIndex: "domainType",
      //   key: "domainType",
      //   width: 150,
      //   render: (text = "") => {
      //     return text
      //       .split(",")
      //       .map(type => FACTOR_TEMPLATE_TYPE_MAP[type])
      //       .join("、");
      //   }
      // },
      {
        title: "创建时间",
        dataIndex: "createTime",
        key: "createTime",
        width: 185,
        onCell: record => {
          const { createTime } = record;
          return { title: createTime };
        }
      },
      {
        title: "状态",
        dataIndex: "enableState",
        key: "enableState",
        width: 70,
        render: text => {
          return text ? "正常" : "禁用";
        }
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

    const {
      id,
      enableState: cEnableState = "true",
      licence: cLicence = "",
      companyLogo: cCompanyLogo = "",
      companyCode: cCompanyCode = "",
      companyName: cCompanyName = "",
      abbreviationName: cAbbreviationName = ""
    } = companyInfo;
    const isEdit = id > 0;
    const { getFieldProps } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    };

    const uploadButton = (
      <div>
        <Icon type={uploading ? "loading" : "plus"} />
        <div className="ant-upload-text">点击上传</div>
      </div>
    );

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
          title={`${isEdit ? (isView ? "查看" : "编辑") : "新建"}合作单位`}
          centered
          visible={this.state.editConfirmShow}
          className="leakage-company-modal"
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          uploading
          onOk={isView ? this.onEditCancel : this.onCompanySave}
        >
          <Form>
            <FormItem {...formItemLayout} label="公司名称">
              <Input
                {...getFieldProps("companyName", {
                  initialValue: cCompanyName,
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
            <FormItem {...formItemLayout} label="公司简称">
              <Input
                {...getFieldProps("abbreviationName", {
                  initialValue: cAbbreviationName
                })}
                placeholder="最多20个字符"
                maxLength="20"
                disabled={isView}
              />
            </FormItem>
            <FormItem {...formItemLayout} label="公司LOGO">
              <Upload
                name="file"
                listType="picture-card"
                className="company-avatar-uploader"
                showUploadList={false}
                action="/dms/leakage/company/upload-icon"
                onChange={this.handleUploadChange}
              >
                {cCompanyLogo ? (
                  <img
                    src={`/dms/leakage/company/image/${cCompanyLogo}`}
                    alt="公司LOGO"
                  />
                ) : (
                  uploadButton
                )}
              </Upload>
            </FormItem>
            <FormItem {...formItemLayout} label="公司编号">
              <Input
                {...getFieldProps("companyCode", {
                  initialValue: cCompanyCode,
                  validate: [
                    {
                      rules: [
                        {
                          required: true,
                          whitespace: true,
                          pattern: /^\w+$/,
                          message: "字母数字下划线,最多255个字符"
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
            <FormItem {...formItemLayout} label="序列号">
              <Input
                {...getFieldProps("licence", {
                  initialValue: cLicence,
                  validate: [
                    {
                      rules: [{ required: true, message: "请点击自动生成" }]
                    }
                  ]
                })}
                placeholder="请点击自动生成"
                maxLength="255"
                style={isEdit ? {} : { width: 254 }}
                readOnly
                disabled={isView || isEdit}
              />
              {!isEdit && (
                <Button
                  style={{ marginLeft: 5 }}
                  type="primary"
                  onClick={this.handleGenerate}
                >
                  自动生成
                </Button>
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="状态" className="mb10">
              <Radio.Group
                {...getFieldProps("enableState", {
                  initialValue: `${cEnableState}`,
                  validate: [
                    {
                      rules: [{ required: true }]
                    }
                  ]
                })}
                placeholder="请选择"
              >
                <Radio value="true">正常</Radio>
                <Radio value="false">禁用</Radio>
              </Radio.Group>
            </FormItem>
            {/* <FormItem {...formItemLayout} label="应用领域">
              <Checkbox.Group
                {...getFieldProps("domainType", {
                  initialValue: cDomainType
                })}
                placeholder="请选择"
              >
                <Checkbox value="ANTI_LEAKAGE">反渗漏</Checkbox>
                <Checkbox value="ANTI_FRAUD">反欺诈</Checkbox>
              </Checkbox.Group>
            </FormItem> */}
            <FormItem {...formItemLayout} label="所辖机构">
              <Checkbox
                indeterminate={indeterminate}
                onChange={this.onCheckAllChange}
                checked={checkAll}
                value={"200"}
              >
                全国
              </Checkbox>

              <Checkbox.Group
                {...getFieldProps("applyRegion", {
                  initialValue: checkedAreaList
                })}
                placeholder="请选择"
                onChange={this.onChangeAreaType}
              >
                {AREA_TYPE.slice(1).map(type => {
                  return (
                    <Checkbox key={type} value={type}>
                      {AREA_TYPE_MAP[type]}
                    </Checkbox>
                  );
                })}
              </Checkbox.Group>
            </FormItem>
          </Form>
        </Modal>
      </LayoutRight>
    );
  }
  onCheckAllChange = e => {
    this.setState({
      checkedAreaList: e.target.checked ? AREA_TYPE.slice(1) : [],
      indeterminate: false,
      checkAll: e.target.checked
    });
  };
  onChangeAreaType = checkedAreaList => {
    this.setState({
      checkedAreaList,
      indeterminate:
        !!checkedAreaList.length &&
        checkedAreaList.length < AREA_TYPE.length - 1,
      checkAll: checkedAreaList.length === AREA_TYPE.length - 1
    });
  };
  handleUploadChange = info => {
    const { file: { status, response } = {} } = info;
    this.setState({ uploading: true });
    if (status === "done") {
      const { companyInfo } = this.state;
      const { content: { filename: companyLogo } = {} } = response;
      this.setState({
        uploading: false,
        companyInfo: { ...companyInfo, companyLogo }
      });
    }
  };

  handleGenerate = () => {
    const { companyInfo = {} } = this.state;
    const licence = v4();
    this.setState({ companyInfo: { ...companyInfo, licence } }, () => {
      this.props.form.setFields({
        licence: {
          value: licence
        }
      });
    });
  };

  onQuery = () => {
    this.loadCompanies();
  };
  onChangeAreaType;
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

  loadCompanies = (page = 1) => {
    const { pagination, companyName } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      companyName,
      page,
      size
    };
    this.setState({
      loading: true
    });
    fetchCompanies(data)
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.loadCompanies();
          return;
        }
        data.forEach(item => {
          const { companyId } = item;
          item.id = companyId;
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

  handleChange = pagination => {
    this.setState({ pagination }, () => {
      this.loadCompanies(pagination.current);
    });
  };

  changeKeyword = e => {
    this.setState({ companyName: e.target.value });
  };

  onCreateBtnClick = () => {
    this.setState(
      {
        editConfirmShow: true,
        companyInfo: {}
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onEditIconClick = (companyInfo, editType = "edit") => {
    const { domainType = "", applyRegion = "" } = companyInfo;
    const tempApplyRegion = applyRegion ? applyRegion.split(",") : [];
    this.setState(
      {
        isView: editType === "view",
        editConfirmShow: true,
        companyInfo: {
          ...companyInfo,
          domainType: domainType ? domainType.split(",") : [],
          applyRegion: tempApplyRegion
        },
        checkedAreaList:
          applyRegion === "200" ? AREA_TYPE.slice(1) : tempApplyRegion,
        indeterminate:
          applyRegion !== "200" &&
          tempApplyRegion.length !== AREA_TYPE.length - 1,
        checkAll: applyRegion === "200"
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
        companyInfo: {}
      },
      () => {
        this.props.form.resetFields();
      }
    );
  };

  onCompanySave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return;
      }
      await this.setState({ loading: true });
      try {
        const { pagination, companyInfo } = this.state;
        const { applyRegion = [] } = values;
        const { companyId = "", companyLogo } = companyInfo;
        const isEdit = companyId > 0;
        await (isEdit
          ? updateCompany({
              companyId,
              companyLogo,
              ...values,
              domainType,
              applyRegion:
                AREA_TYPE.length - 1 === applyRegion.length
                  ? "200"
                  : applyRegion.join(",")
            })
          : addCompany({
              companyLogo,
              ...values,
              domainType,
              applyRegion:
                AREA_TYPE.length - 1 === applyRegion.length
                  ? "200"
                  : applyRegion.join(",")
            }));
        this.setState({ editConfirmShow: false, loading: false }, () => {
          this.loadCompanies(isEdit ? pagination.current : 1);
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
    const { record: { companyId } = {}, pagination } = this.state;
    delCompany({ companyId })
      .then(() => {
        this.setState(
          {
            deleteConfirmShow: false
          },
          () => {
            this.loadCompanies(pagination.current);
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

export default Form.create()(CompanyList);
