import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Table,
  Modal,
  Form,
  notification,
  Select,
  Switch,
  Badge,
  Tag,
  message
} from "antd";
import { v4 } from "uuid";
import LayoutRight from "@component/layout_right";
import { getUserInfo } from "../../../util";
import {
  fetchCompanyList,
  fetchCompanyRuleList,
  delCompanyRuleList,
  onLineCompanyRule
  // addCompanyRule,
  // editCompanyRule,
  // fetchCompanyRuleDetail
} from "@action/leakage";
import "./index.less";
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_MAP,
  INSURANCE_TYPE,
  INSURANCE_TYPE_MAP,
  AREA_TYPE
} from "@common/constant";

const { confirm } = Modal;
const { Option } = Select;
const { domainType = "" } = getUserInfo();
class CompanyList extends Component {
  state = {
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
    form: PropTypes.any,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

  componentDidMount() {
    this.loadCompanies();
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
      loading = false,
      companyId,
      dataSource = [],
      companyList = [],
      pagination,
      businessType,
      insuranceCategory
    } = this.state;
    const columns = [
      // {
      //   title: "公司编号",
      //   dataIndex: "companyCode",
      //   key: "companyCode",
      //   onCell: record => {
      //     const { companyCode } = record;
      //     return { title: companyCode };
      //   }
      // },
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
        title: "险种大类",
        dataIndex: "insuranceCategory",
        key: "insuranceCategory",
        // width: 120,
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
        // width: 120,
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
              checked={record.activeStatus === "ACTIVED"}
              disabled={systemDefault}
              onChange={checked => this.changeFieldActive(checked, record)}
            />
          );
        }
      },
      {
        title: "操作",
        dataIndex: "operations",
        key: "operations",
        // width: 120,
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
                  修改
                </span>
              }
              {
                <span
                  className="operation-span"
                  onClick={editType => {
                    this.onEditIconClick(record, (editType = "check"));
                  }}
                >
                  查看
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
    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Select
            placeholder="公司名称"
            allowClear
            style={{ width: 200 }}
            value={companyId}
            onChange={this.changeCompanyName}
          >
            {companyList.map(item => {
              const { companyId, companyName } = item;
              return (
                <Option key={companyId} value={companyId} title={companyId}>
                  {companyName}
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
      </LayoutRight>
    );
  }
  changeCompanyName = e => {
    this.setState({ companyId: e });
  };
  changeBusinessType = e => {
    this.setState({ businessType: e });
  };
  changeInsuranceCategory = e => {
    this.setState({ insuranceCategory: e });
  };
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
        companyId: undefined,
        businessType: undefined,
        insuranceCategory: undefined
      },
      () => {
        this.onQuery();
      }
    );
  };

  loadCompanies = (page = 1) => {
    const {
      pagination,
      companyId,
      businessType,
      insuranceCategory
    } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      companyId,
      page,
      size,
      businessType,
      insuranceCategory,
      domainType: domainType
    };
    this.setState({
      loading: true
    });
    fetchCompanyRuleList(data)
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

  onCreateBtnClick = () => {
    const conditions = this._buildConditions();
    const { companyId, businessType, insuranceCategory } = conditions;
    if (!companyId) {
      return message.error("请选择公司名称！");
    }
    if (!businessType) {
      return message.error("请选择环节！");
    }
    if (!insuranceCategory) {
      return message.error("请选择险种大类！");
    }
    const { history } = this.props;
    const { location: { pathname } = {} } = history;
    history.push({
      pathname: "./customrules/new/customer_rules",
      state: { conditions, pathname }
    });
  };
  _buildConditions = () => {
    const {
      pagination,
      companyId,
      businessType,
      insuranceCategory
    } = this.state;
    const { pageSize, current = 1 } = pagination;
    return {
      companyId,
      businessType,
      insuranceCategory,
      current,
      pageSize
    };
  };
  onEditIconClick = (companyInfo, editType = "edit") => {
    const { companyRuleId } = companyInfo;
    const { history } = this.props;
    const { location: { pathname } = {} } = history;
    history.push({
      pathname: `./customrules/${editType}/${companyRuleId}`,
      state: {
        conditions: companyInfo,
        pathname,
        // record: {
        //   // tPagination: false,
        //   // ruleInfo: content,
        //   // selectedRowKeys,
        //   // activeKeys: ["SET"],
        //   // tDataSource,
        //   // selectedRows: tDataSource
        // },
        record: { activeKeys: ["SET", "SEARCH"], ...companyInfo }
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
    const { record: { companyRuleId } = {}, pagination } = this.state;
    delCompanyRuleList({ companyRuleId })
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

  changeFieldActive = async (checked, record) => {
    const { pagination: { current = 1 } = {} } = this.state;
    const activeStatus = checked ? "ACTIVED" : "UN_ACTIVED";
    onLineCompanyRule({ companyRuleId: record.companyRuleId })
      .then(res => {
        record.activeStatus = activeStatus;
        this.setState({ editConfirmShow: false, loading: false }, () => {
          this.loadCompanies(current);
        });
      })
      .catch(data => {
        const { content = {} } = data;
        notification.warn(content);
      });
  };
}

export default Form.create()(CompanyList);
