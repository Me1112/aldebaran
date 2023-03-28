import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Select,
  Input,
  Table,
  Modal,
  notification,
  Switch,
  Pagination,
  Checkbox,
  Row,
  Col,
  Tabs,
  Form,
  Dropdown,
  Menu,
  Icon,
  Tag,
  Spin
} from "antd";
import { FixedSizeList as List } from "react-window";
import classNames from "classnames";
import debounce from "lodash/debounce";
import {
  BUSINESS_TYPES,
  BUSINESS_TYPE_MAP,
  AREA_TYPE,
  AREA_TYPE_MAP
} from "@common/constant";
import {
  fetchRuleList,
  delRule,
  fetchCompanyList,
  fetchActiveRiskTypes,
  fetchRuleInfo,
  fetchRuleHistory,
  confirmRule,
  checkProjectNames,
  fetchRulesByKeyword,
  updateRuleActive,
  fetchRuleLog,
  reduceRule,
  fetchAllRules,
  fetchRules4Company,
  batchOnlineToCompany,
  templateRuleDependencies
} from "@action/leakage";
import { calTextWith, buildUrlParamNew, decisionModalError } from "@util";
import { OPERATE_TYPE_MAP } from "../util";
import * as Utils from "../util";
import "./index.less";
import { getUserInfo } from "../../../util";
const { Option } = Select;
const { confirm } = Modal;
const { TabPane } = Tabs;
const { CheckableTag } = Tag;
const ACTIVED = "ACTIVED";
const UN_ACTIVED = "UN_ACTIVED";
const ACTIVE_MAP = { ACTIVED: "上线", UN_ACTIVED: "下线" };
const ONLINE_HOT_MAP = {
  GENERAL: "通用",
  PARTIAL_GENERAL: "部分通用",
  UNIQUE_COMPANY: "公司独有",
  NOT_ONLINE: "未上线"
};
const { domainType = "" } = getUserInfo();
class Rule extends Component {
  constructor(props) {
    super(props);
    this.onSearchRules = debounce(this.onSearchRules, 800);
    this.state = {
      domainType: domainType,
      listType: "RULE_LIST",
      fetchAllSaving: false,
      viewShow: false,
      copyVisible: false,
      copySaving: false,
      deleteConfirmShow: false,
      promptShow: false,
      promptMsg: "",
      record: {},
      ruleInfo: {},
      fieldSaveError: "",
      enumShow: false,
      fetchAll: false,
      selectedRows: [],
      selectedRisks: [],
      selectedHot: "ALL",
      selectedCompanies: [],
      allRules: [],
      allRuleMap: {},
      selectedRuleIds: [],
      leftSelectedRuleIds: [],
      rightSelectedRuleIds: [],
      pagination: {
        pageSize: 10,
        showSizeChanger: true,
        showTotal: total => `共 ${total} 条`
      },
      logPagination: {
        pageSize: 10,
        showSizeChanger: true,
        showTotal: total => `共 ${total} 条`
      }
    };
  }

  isProjectCheck = false;

  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

  componentDidMount() {
    const {
      location: { state: { pathname, ...state } = {} } = {},
      history
    } = this.props;
    const { pagination } = this.state;
    const { conditions } = state;
    if (conditions) {
      const { pageSize, current, ...other } = conditions;
      this.setState(
        { ...other, pagination: { ...pagination, pageSize, current } },
        () => {
          this.loadRules(current);
          this.loadActiveRiskTypes();
        }
      );
    } else {
      this.loadRules();
      this.loadActiveRiskTypes();
    }
    fetchCompanyList()
      .then(data => {
        const { content: companyList = [] } = data;
        let companyMap = {};
        const showCompanyAll =
          companyList &&
          companyList
            .map(company => {
              const { companyId, companyName } = company;
              companyMap = { ...companyMap, [companyId]: companyName };
              return calTextWith(companyName);
            })
            .reduce((a, b) => a + b) > 888;
        this.setState({
          companyList,
          showCompanyAll,
          companyMap
        });
      })
      .catch(data => {
        if (data.content) {
          notification.warning(data.content);
        }
      });
    history.replace(pathname);
  }

  render() {
    const {
      listType,
      promptShow,
      fetchAllSaving = false,
      offlineShow = false,
      companyShow = false,
      promptMsg,
      domainType,
      riskTypeId,
      // companyId,
      activeStatus,
      projectCheck,
      keyword,
      dataSource = [],
      hDataSource = [],
      dDataSource = [],
      riskList = [],
      companyList = [],
      filterCompanyList = [],
      companyIdList = [],
      selectedCompanyIdList = [],
      selectedOptions = [ACTIVED, UN_ACTIVED],
      pagination,
      logPagination,
      viewShow,
      copyVisible,
      copySaving,
      loading = false,
      record = {},
      selectedRisks = [],
      selectedHot = "ALL",
      selectedCompanies = [],
      showRiskAll,
      showRiskMore = false,
      showCompanyAll,
      showCompanyMore = false,
      filterRules = [],
      selectedRuleIds = [],
      allRuleMap = {},
      companyMap = {},
      riskMap = {},
      modelKeyword,
      modelCompanyId,
      fetchAll,
      leftSelectedRuleIds,
      rightSelectedRuleIds,
      isAntiFraudSearched = false,
      businessType,
      applyRegion
    } = this.state;
    const selectedRisksCount = selectedRisks.length;
    const selectedCompaniesCount = selectedCompanies.length;
    const allRulesCount = filterRules.length;
    const selectedRulesCount = selectedRuleIds.length;
    const selectedRules = selectedRuleIds.map(id => allRuleMap[id] || {});
    const logDataSource = dDataSource.filter(row => {
      const { activeStatus } = row;
      return selectedOptions.includes(activeStatus);
    });
    const { description } = record;
    const isProjectCheck = projectCheck === "CHECK";
    const isAntiFraud = domainType === "ANTI_FRAUD";
    const isRuleList = listType === "RULE_LIST";

    const expandedRowRender = record => {
      const { leakageRuleTempRespList = [] } = record;
      let columns = [
        {
          title: "因子模板编码",
          dataIndex: "code",
          key: "code",
          width: 150,
          onCell: record => {
            const { code } = record;
            return { title: code };
          }
        },
        {
          title: "因子模板名称",
          dataIndex: "name",
          key: "name",
          render: text => {
            return <div className="shown-all">{text}</div>;
          }
        },
        {
          title: "因子模板逻辑",
          dataIndex: "id",
          key: "id",
          render: (text, record) => {
            return Utils._renderExpression(record, {
              className: "shown-all",
              mode: "VIEW"
            });
          }
        }
      ];
      if (isAntiFraudSearched) {
        columns = [
          ...columns
          // {
          //   title: "是否必须因子",
          //   dataIndex: "isRequired",
          //   key: "isRequired",
          //   width: 110,
          //   render: text => {
          //     return text ? "是" : "否";
          //   }
          // },
          // {
          //   title: "因子分值",
          //   dataIndex: "hitScore",
          //   key: "hitScore",
          //   width: 90,
          //   render: text => {
          //     return <div className="shown-all">{text}</div>;
          //   }
          // }
        ];
      }
      columns = [
        ...columns,
        {
          title: "因子是否提示",
          dataIndex: "isTip",
          key: "isTip",
          width: 110,
          render: text => {
            return text ? "是" : "否";
          }
        }
      ];
      return (
        <Table
          rowKey="code"
          columns={columns}
          dataSource={leakageRuleTempRespList}
          pagination={false}
        />
      );
    };

    let columns = [
      {
        title: "规则号",
        dataIndex: "id",
        key: "id",
        width: 100,
        onCell: record => {
          const { id } = record;
          return { title: id };
        }
      },
      // {
      //   title: "风险小类",
      //   dataIndex: "riskTypeName",
      //   key: "riskTypeName",
      //   width: "40%",
      //   render: (text, record) => {
      //     return <div className="shown-all">{text}</div>;
      //   }
      // },
      {
        title: "规则描述",
        dataIndex: "description",
        key: "description",
        width: "30%",
        render: (text, record) => {
          return <div className="shown-all">{text}</div>;
        }
      },
      {
        title: "环节",
        dataIndex: "businessType",
        key: "businessType",
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
        title: "适用地区",
        dataIndex: "applyRegion",
        key: "applyRegion",
        // onCell: record => {
        //   const { applyRegion } = record;
        //   return { title: AREA_TYPE_MAP[applyRegion] };
        // },
        render: text => {
          return (
            text &&
            text.split(",").map((item, index) => (
              <span className="shown-all" title={AREA_TYPE_MAP[item]}>
                {AREA_TYPE_MAP[item]}
                {index !== text.split(",").length - 1 && "、"}
              </span>
            ))
          );
        }
      }
    ];

    // if (isRuleList) {
    //   columns = [
    //     ...columns,
    //     {
    //       title: "上线公司",
    //       dataIndex: "refererCount",
    //       key: "refererCount",
    //       width: 90
    //     }
    //   ];
    // }
    columns = [
      ...columns,
      {
        title: "规则因子数",
        dataIndex: "leakageRuleTempRespList",
        key: "leakageRuleTempRespList",
        width: 120,
        render: (text, record) => {
          const { leakageRuleTempRespList = [] } = record;
          return leakageRuleTempRespList.length;
        }
      }
    ];
    if (isRuleList) {
      columns = [
        ...columns,
        {
          title: "生效时间",
          dataIndex: "effectOfTime",
          key: "effectOfTime",
          width: 180
        },
        {
          title: "激活",
          dataIndex: "activeStatus",
          key: "activeStatus",
          render: (text, record, index) => {
            const { leakageRuleTempRespList = [] } = record;
            return (
              <Switch
                style={{ width: 55 }}
                checkedChildren="ON"
                unCheckedChildren="OFF"
                checked={record.activeStatus === ACTIVED}
                onChange={(checked, e) =>
                  this.changeRuleActive(checked, record, {
                    start: index,
                    end: index + leakageRuleTempRespList.length
                  })
                }
              />
            );
          }
        },
        {
          title: "操作",
          dataIndex: "operations",
          key: "operations",
          width: 180,
          render: (text, record) => {
            const { activeStatus, projectCheck } = record;
            const isActive = activeStatus === ACTIVED;
            const isUnChecked = projectCheck === "UN_CHECK";
            const loggerView = (
              <span
                className="operation-span"
                onClick={() => {
                  this.onViewIconClick(record);
                }}
              >
                日志
              </span>
            );
            // const companyView = (
            //   <span
            //     className="operation-span"
            //     onClick={() => {
            //       this.onCompanyIconClick(record);
            //     }}
            //   >
            //     公司
            //   </span>
            // );
            const copyView = (
              <span
                className="operation-span"
                onClick={() => {
                  this.onEditIconClick(record, "copy");
                }}
              >
                复制
              </span>
            );

            return (
              <Fragment>
                {isUnChecked && this.isProjectCheck && (
                  <div>
                    <span
                      className="operation-span"
                      onClick={() => {
                        this.onCheckIconClick(record);
                      }}
                    >
                      项目名称
                    </span>
                    <span
                      className="operation-span"
                      onClick={() => {
                        this.onConfirmIconClick(record);
                      }}
                    >
                      确认规则
                    </span>
                  </div>
                )}
                {isActive ? (
                  <Fragment>
                    {loggerView}
                    {/* {companyView} */}
                    {copyView}
                  </Fragment>
                ) : (
                  <Fragment>
                    <span
                      className="operation-span"
                      onClick={() => {
                        this.onEditIconClick(record);
                      }}
                    >
                      编辑
                    </span>
                    <span
                      className="operation-span"
                      onClick={() => {
                        this.onDeleteIconClick(record);
                      }}
                    >
                      删除
                    </span>
                  </Fragment>
                )}
                {!isActive && (
                  <Dropdown
                    overlay={
                      <Menu>
                        {!isActive && <Menu.Item>{loggerView}</Menu.Item>}
                        {/* {!isActive && <Menu.Item>{companyView}</Menu.Item>} */}
                        {
                          <Menu.Item>
                            <span
                              className="operation-span"
                              onClick={() => {
                                this.onEditIconClick(record, "copy");
                              }}
                            >
                              复制
                            </span>
                          </Menu.Item>
                        }
                      </Menu>
                    }
                  >
                    <span
                      className="operation-span"
                      onClick={e => e.preventDefault()}
                    >
                      更多
                      <Icon type="down" />
                    </span>
                  </Dropdown>
                )}
              </Fragment>
            );
          }
        }
      ];
    } else {
      columns = [
        ...columns,
        {
          title: "删除时间",
          dataIndex: "updateTime",
          key: "updateTime"
        },
        {
          title: "操作",
          dataIndex: "operations",
          key: "operations",
          fixed: "right",
          width: 120,
          render: (text, record) => {
            return (
              <span
                className="operation-span"
                onClick={() => {
                  this.onReduceIconClick(record);
                }}
              >
                回收
              </span>
            );
          }
        }
      ];
    }

    const hColumns = [
      {
        title: "操作时间",
        dataIndex: "operateTime",
        key: "operateTime",
        width: 190,
        onCell: record => {
          const { operateTime } = record;
          return { title: operateTime };
        }
      },
      {
        title: "操作人",
        dataIndex: "userName",
        key: "userName",
        width: 120,
        onCell: record => {
          const { userName } = record;
          return { title: userName };
        }
      },
      {
        title: "操作简介",
        dataIndex: "operateType",
        key: "operateType",
        width: 160,
        render: text => {
          return OPERATE_TYPE_MAP[text];
        }
      },
      {
        title: "操作说明",
        dataIndex: "templateExpression",
        key: "templateExpression",
        onCell: record => {
          const { templateExpression } = record;
          return { title: templateExpression };
        }
      }
    ];

    const dColumns = [
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
        title: "状态",
        dataIndex: "activeStatus",
        key: "activeStatus",
        width: 80,
        render: text => {
          return ACTIVE_MAP[text];
        }
      },
      {
        title: "最新上线时间",
        dataIndex: "onlineTime",
        key: "onlineTime",
        width: 190
      },
      {
        title: "最新下线时间",
        dataIndex: "offlineTime",
        key: "offlineTime",
        width: 190
      }
    ];

    const canOffline = selectedCompanyIdList.length > 0;

    const selectedCompanyList = companyList.filter(company => {
      const { companyId } = company;
      return companyIdList.includes(companyId);
    });

    const options = [
      { label: "当前上线", value: ACTIVED },
      { label: "当前下线", value: UN_ACTIVED }
    ];

    return (
      <Fragment>
        <Tabs
          type="card"
          activeKey={listType}
          onChange={this.onChangeListTab}
          className="tabs-no-border"
        >
          <TabPane tab="规则池" key="RULE_LIST">
            <div className="region-zd rule">
              <div className="left">
                <div className="content">
                  {/* <Select
                    placeholder="领域"
                    style={{ width: 100 }}
                    value={domainType}
                    onChange={this.changeDomainType}
                    getPopupContainer={node => {
                      return node.parentElement.parentElement.parentElement
                        .parentElement.parentElement;
                    }}
                  >
                    {FACTOR_TEMPLATE_NEW_TYPES.map(type => {
                      return (
                        <Option key={type} value={type}>
                          {FACTOR_TEMPLATE_TYPE_MAP[type]}
                        </Option>
                      );
                    })}
                  </Select> */}
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
                    placeholder="适用地区"
                    allowClear
                    style={{ width: 200 }}
                    value={applyRegion}
                    onChange={this.changeApplyRegionType}
                  >
                    {AREA_TYPE.map(type => {
                      return (
                        <Option key={type} value={type}>
                          {AREA_TYPE_MAP[type]}
                        </Option>
                      );
                    })}
                  </Select>
                  <Select
                    placeholder="规则风险小类"
                    showSearch
                    optionFilterProp="children"
                    allowClear
                    style={{ width: 150 }}
                    value={riskList.length ? riskTypeId : undefined}
                    onChange={this.changeRiskType}
                    getPopupContainer={node => {
                      return node.parentElement.parentElement.parentElement
                        .parentElement.parentElement;
                    }}
                  >
                    {riskList.map(item => {
                      const { id, name } = item;
                      return (
                        <Option key={id} value={id} title={name}>
                          {name}
                        </Option>
                      );
                    })}
                  </Select>
                  {/* <Select
                    placeholder="公司"
                    allowClear
                    style={{ width: 150 }}
                    value={companyList.length ? companyId : undefined}
                    showSearch
                    optionFilterProp="children"
                    onChange={this.changeCompany}
                    getPopupContainer={node => {
                      return node.parentElement.parentElement.parentElement
                        .parentElement.parentElement;
                    }}
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
                  </Select> */}
                  <Input
                    value={keyword}
                    placeholder="规则名称/模板编码"
                    style={{ width: 150 }}
                    onChange={this.changeKeyword}
                  />
                  <Select
                    placeholder="状态"
                    style={{ width: 100 }}
                    value={activeStatus}
                    allowClear
                    onChange={this.changeActiveStatus}
                    getPopupContainer={node => {
                      return node.parentElement.parentElement.parentElement
                        .parentElement.parentElement;
                    }}
                  >
                    <Option value={ACTIVED}>激活</Option>
                    <Option value={UN_ACTIVED}>未激活</Option>
                  </Select>
                  <Checkbox
                    checked={isProjectCheck}
                    disabled={isAntiFraud}
                    onChange={this.changeProjectCheck}
                  >
                    项目校验
                  </Checkbox>
                  <Button type="primary" onClick={this.onQuery}>
                    查询
                  </Button>
                  <Button onClick={this.onReset}>重置</Button>
                </div>
              </div>
              <div className="right">
                <Button type="primary" onClick={this.onCreateBtnClick}>
                  新建
                </Button>
                {/* <Button
                  type="primary"
                  onClick={this.onCopyBtnClick}
                  disabled={isAntiFraud}
                >
                  批量配置
                </Button> */}
              </div>
            </div>
            <div
            // style={{
            //   height: "calc(100% - 52px)",
            //   overflowY: "auto",
            //   float: "left"
            // }}
            >
              <Table
                rowKey="id"
                className="table-detail ellipsis"
                columns={columns}
                expandedRowRender={expandedRowRender}
                dataSource={dataSource}
                pagination={false}
                loading={loading}
                scroll={{ x: 1500, y: "50vh" }}
                // pagination={pagination}
              />
              <Pagination
                {...pagination}
                onChange={this.handleChange}
                onShowSizeChange={this.handleShowSizeChange}
                style={{ float: "right", margin: "16px 0" }}
              />
            </div>
          </TabPane>
          <TabPane tab="已删除规则池" key="DEL_RULE_LIST">
            <div className="region-zd rule">
              {/* <Select
                placeholder="领域"
                style={{ width: 100 }}
                value={domainType}
                onChange={this.changeDomainType}
              >
                {FACTOR_TEMPLATE_NEW_TYPES.map(type => {
                  return (
                    <Option key={type} value={type}>
                      {FACTOR_TEMPLATE_TYPE_MAP[type]}
                    </Option>
                  );
                })}
              </Select> */}
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
                placeholder="适用地区"
                allowClear
                style={{ width: 200 }}
                value={applyRegion}
                onChange={this.changeApplyRegionType}
              >
                {AREA_TYPE.map(type => {
                  return (
                    <Option key={type} value={type}>
                      {AREA_TYPE_MAP[type]}
                    </Option>
                  );
                })}
              </Select>
              <Select
                placeholder="规则风险小类"
                showSearch
                optionFilterProp="children"
                allowClear
                style={{ width: 150 }}
                value={riskList.length ? riskTypeId : undefined}
                onChange={this.changeRiskType}
              >
                {riskList.map(item => {
                  const { id, name } = item;
                  return (
                    <Option key={id} value={id} title={name}>
                      {name}
                    </Option>
                  );
                })}
              </Select>
              <Input
                value={keyword}
                placeholder="规则名称/模板编码"
                style={{ width: 150 }}
                onChange={this.changeKeyword}
              />
              <Button type="primary" onClick={this.onQuery}>
                查询
              </Button>
              <Button onClick={this.onReset}>重置</Button>
            </div>
            <div>
              <Table
                rowKey="id"
                className=" ellipsis"
                columns={columns}
                dataSource={dataSource}
                // bordered
                pagination={false}
                loading={loading}
                scroll={{ x: 1300, y: "50vh" }}
              />
              <Pagination
                {...pagination}
                onChange={this.handleChange}
                onShowSizeChange={this.handleShowSizeChange}
                style={{ float: "right", margin: "16px 0" }}
              />
            </div>
          </TabPane>
        </Tabs>
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
          title="请选择下线公司"
          wrapClassName="offline-modal"
          visible={offlineShow}
          maskClosable={false}
          footer={
            <Fragment>
              <Button
                style={{ float: "left" }}
                disabled={!canOffline}
                onClick={this.onOffline}
              >
                下线并复制规则
              </Button>
              <Button
                type="primary"
                disabled={!canOffline}
                onClick={this.onOnlyOffline}
              >
                仅下线
              </Button>
            </Fragment>
          }
          onCancel={() => this.setState({ offlineShow: false })}
          onOk={() => this.setState({ offlineShow: false })}
        >
          <Select
            value={selectedCompanyIdList}
            mode="multiple"
            placeholder="请选择"
            showSearch
            optionFilterProp="children"
            onChange={this.onChangeCompany}
          >
            {selectedCompanyList.map(item => {
              const { companyId, companyName } = item;
              return (
                <Option key={companyId} value={companyId} title={companyName}>
                  {companyName}
                </Option>
              );
            })}
          </Select>
        </Modal>
        <Modal
          title="日志"
          centered
          width={1100}
          className="leakage-rule-modal"
          bodyStyle={{ overflowY: "hidden" }}
          visible={viewShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.onViewCancel}
          onOk={this.onViewCancel}
        >
          <Table
            className="table-detail ellipsis"
            columns={hColumns}
            dataSource={hDataSource}
            pagination={logPagination}
            bordered
            scroll={{ y: 310 }}
            onChange={this.handleLogChange}
          />
        </Modal>
        <Modal
          title={
            <Fragment>
              <div title={description}>{description}</div>
              <div>
                <Button onClick={this.onCancel}>取消</Button>
                <Button type="primary" onClick={this.onOnline}>
                  确定
                </Button>
              </div>
            </Fragment>
          }
          centered
          destroyOnClose
          width={800}
          className="leakage-head-btn-modal"
          visible={companyShow}
          maskClosable={false}
          closable={false}
          bodyStyle={{ minHeight: 350 }}
          footer={null}
        >
          <div>
            配置公司:{" "}
            <Select
              placeholder="请选择"
              mode="multiple"
              value={selectedCompanyIdList}
              onChange={this.onChangeCompany}
              optionFilterProp="children"
              getPopupContainer={node => {
                return node.parentElement.parentElement;
              }}
            >
              {filterCompanyList.map(item => {
                const { companyId, companyName } = item;
                return (
                  <Option key={companyId} value={companyId} title={companyName}>
                    {companyName}
                  </Option>
                );
              })}
            </Select>
            <Checkbox.Group
              options={options}
              value={selectedOptions}
              onChange={this.onChangeOption}
            />
          </div>
          <Table
            className="table-detail ellipsis"
            columns={dColumns}
            dataSource={logDataSource}
            pagination={false}
            bordered
          />
        </Modal>
        <Modal
          title={
            <Fragment>
              <div>批量配置</div>
              <div>
                <Button onClick={this.onCancel} disabled={fetchAllSaving}>
                  取消
                </Button>
                <Button
                  type="primary"
                  disabled={fetchAllSaving}
                  onClick={this.onBatchOnlineToCompany}
                >
                  确定
                </Button>
              </div>
            </Fragment>
          }
          centered
          width={1100}
          bodyStyle={{ maxHeight: 590, overflowX: "hidden" }}
          className="leakage-head-btn-modal"
          visible={copyVisible}
          confirmLoading={copySaving}
          maskClosable={false}
          closable={false}
          footer={null}
        >
          <Spin spinning={fetchAll || fetchAllSaving}>
            <div className="row">
              <div className="main">
                <div
                  className={classNames("main-content", { more: showRiskMore })}
                >
                  <CheckableTag
                    checked={selectedRisksCount === 0}
                    onChange={this.handleChecked("RISK", "ALL")}
                  >
                    全部
                  </CheckableTag>
                  {riskList.map(item => {
                    const { id, name } = item;
                    return (
                      <CheckableTag
                        key={id}
                        checked={selectedRisks.includes(id)}
                        onChange={this.handleChecked("RISK", id)}
                      >
                        {name}
                      </CheckableTag>
                    );
                  })}
                </div>
              </div>
              <div className="left">风险小类:</div>
              {showRiskAll && (
                <div
                  className="right"
                  onClick={this.onSwitchMore("RISK", showRiskMore)}
                >
                  {showRiskMore ? "收起" : "全部"}
                </div>
              )}
            </div>
            <div className="row">
              <div className="main">
                <div className="main-content">
                  <CheckableTag
                    checked={selectedHot === "ALL"}
                    onChange={this.handleChecked("HOT", "ALL")}
                  >
                    全部
                  </CheckableTag>
                  <CheckableTag
                    checked={selectedHot === "GENERAL"}
                    onChange={this.handleChecked("HOT", "GENERAL")}
                  >
                    通用
                  </CheckableTag>
                  <CheckableTag
                    checked={selectedHot === "PARTIAL_GENERAL"}
                    onChange={this.handleChecked("HOT", "PARTIAL_GENERAL")}
                  >
                    部分通用
                  </CheckableTag>
                  <CheckableTag
                    checked={selectedHot === "UNIQUE_COMPANY"}
                    onChange={this.handleChecked("HOT", "UNIQUE_COMPANY")}
                  >
                    公司独有
                  </CheckableTag>
                  <CheckableTag
                    checked={selectedHot === "NOT_ONLINE"}
                    onChange={this.handleChecked("HOT", "NOT_ONLINE")}
                  >
                    未上线
                  </CheckableTag>
                </div>
              </div>
              <div className="left">上线热度:</div>
            </div>
            <div className="row">
              <div className="main">
                <div
                  className={classNames("main-content", {
                    more: showCompanyMore
                  })}
                >
                  <CheckableTag
                    checked={selectedCompaniesCount === 0}
                    onChange={this.handleChecked("COMPANY", "ALL")}
                  >
                    全部
                  </CheckableTag>
                  {companyList.map(item => {
                    const { companyId, companyName } = item;
                    return (
                      <CheckableTag
                        key={companyId}
                        checked={selectedCompanies.includes(companyId)}
                        onChange={this.handleChecked("COMPANY", companyId)}
                      >
                        {companyName}
                      </CheckableTag>
                    );
                  })}
                </div>
              </div>
              <div className="left">上线公司:</div>
              {showCompanyAll && (
                <div
                  className="right"
                  onClick={this.onSwitchMore("COMPANY", showCompanyMore)}
                >
                  {showCompanyMore ? "收起" : "全部"}
                </div>
              )}
            </div>
            {selectedRisksCount ||
            selectedHot !== "ALL" ||
            selectedCompaniesCount ? (
              <div className="row condition">
                <div className="main">
                  <div className="main-content more">
                    {selectedRisksCount > 0 && (
                      <Fragment>
                        <div className="label">风险小类:</div>
                        {selectedRisks.map((id, index) => {
                          return (
                            <Tag
                              key={id}
                              closable
                              className={classNames({
                                mr0: selectedRisksCount === index + 1
                              })}
                              onClose={this.handleRemove("RISK", id)}
                            >
                              {riskMap[id]}
                            </Tag>
                          );
                        })}
                      </Fragment>
                    )}
                    {selectedHot !== "ALL" && (
                      <Fragment>
                        <div className="label">上线热度:</div>
                        <Tag
                          closable
                          className="mr0"
                          onClose={this.handleRemove("HOT", selectedHot)}
                        >
                          {ONLINE_HOT_MAP[selectedHot]}
                        </Tag>
                      </Fragment>
                    )}
                    {selectedCompaniesCount > 0 && (
                      <Fragment>
                        <div className="label">上线公司:</div>
                        {selectedCompanies.map((id, index) => {
                          return (
                            <Tag
                              key={id}
                              closable
                              className={classNames({
                                mr0: selectedCompaniesCount === index + 1
                              })}
                              onClose={this.handleRemove("COMPANY", id)}
                            >
                              {companyMap[id]}
                            </Tag>
                          );
                        })}
                      </Fragment>
                    )}
                  </div>
                </div>
                <div className="left">已选条件:</div>
                <div className="right" onClick={this.handleRemove("ALL")}>
                  清空
                </div>
              </div>
            ) : null}
            <div className="rules-wrapper">
              <div className="list">
                <div className="list-header">
                  根据您的筛选，共有
                  <span className="highlight">{allRulesCount}</span>条规则。
                  <Button
                    type="primary"
                    size="small"
                    onClick={this.handleRuleQuery}
                  >
                    查询
                  </Button>
                  <Input
                    placeholder="输入名称关键字"
                    size="small"
                    value={modelKeyword}
                    onChange={this.handleModelKeyword}
                  />
                </div>
                <div className="list-body">
                  <List
                    height={300}
                    itemCount={allRulesCount}
                    itemData={filterRules}
                    itemSize={26}
                    width={485}
                  >
                    {row => {
                      const { index, style, data = [] } = row;
                      const { id, description } = data[index];
                      return (
                        <div style={style} title={description}>
                          <Checkbox
                            disabled={selectedRuleIds.includes(id)}
                            checked={leftSelectedRuleIds.includes(id)}
                            onChange={this.handleChecked("LEFT", id)}
                          >
                            {description}
                          </Checkbox>
                        </div>
                      );
                    }}
                  </List>
                </div>
              </div>
              <div className="operation">
                <Icon
                  type="caret-right"
                  onClick={this.handleTransfer("RIGHT")}
                />
                <Icon type="caret-left" onClick={this.handleTransfer("LEFT")} />
                <Icon
                  type="vertical-left"
                  onClick={this.handleTransfer("RIGHT_ALL")}
                />
                <Icon
                  type="vertical-right"
                  onClick={this.handleTransfer("LEFT_ALL")}
                />
              </div>
              <div className="list">
                <div className="list-header">
                  目标公司:
                  <Select
                    size="small"
                    placeholder="请选择公司"
                    value={modelCompanyId}
                    onChange={this.handleModelCompanyId}
                    showSearch
                    optionFilterProp="children"
                    getPopupContainer={node => {
                      return node.parentElement;
                    }}
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
                  <div className="fr">
                    已添加
                    <span className="highlight">{selectedRulesCount}</span>
                    条规则
                  </div>
                </div>
                <div className="list-body">
                  <List
                    height={300}
                    itemCount={selectedRulesCount}
                    itemData={selectedRules}
                    itemSize={26}
                    width={485}
                  >
                    {row => {
                      const { index, style, data = [] } = row;
                      const { id, description } = data[index];
                      return (
                        <div style={style} title={description}>
                          <Checkbox
                            checked={rightSelectedRuleIds.includes(id)}
                            onChange={this.handleChecked("RIGHT", id)}
                          >
                            {description}
                          </Checkbox>
                        </div>
                      );
                    }}
                  </List>
                </div>
              </div>
            </div>
          </Spin>
        </Modal>
      </Fragment>
    );
  }

  handleLogChange = logPagination => {
    this.setState({ logPagination }, () => {
      this.loadLogs(logPagination.current);
    });
  };

  handleTransfer = type => () => {
    let {
      selectedRuleIds,
      leftSelectedRuleIds,
      rightSelectedRuleIds,
      filterRules = []
    } = this.state;
    switch (type) {
      case "LEFT":
        selectedRuleIds = selectedRuleIds.filter(
          id => !rightSelectedRuleIds.includes(id)
        );
        this.setState({ selectedRuleIds, rightSelectedRuleIds: [] });
        break;
      case "RIGHT":
        if (leftSelectedRuleIds.length) {
          selectedRuleIds = [...leftSelectedRuleIds, ...selectedRuleIds];
          this.setState({ selectedRuleIds, leftSelectedRuleIds: [] });
        }
        break;
      case "LEFT_ALL":
        this.setState({
          selectedRuleIds: [],
          leftSelectedRuleIds: [],
          rightSelectedRuleIds: []
        });
        break;
      case "RIGHT_ALL":
        if (filterRules.length) {
          const newSelectedRuleIds = filterRules
            .filter(rule => !selectedRuleIds.includes(rule.id))
            .map(rule => rule.id);
          selectedRuleIds = [...newSelectedRuleIds, ...selectedRuleIds];
          this.setState({
            selectedRuleIds,
            leftSelectedRuleIds: [],
            rightSelectedRuleIds: []
          });
        }
        break;
    }
  };

  handleRuleQuery = () => {
    const { filterAllRules = [], modelKeyword = "" } = this.state;
    const filterRules = filterAllRules.filter(rule => {
      const { description = "" } = rule;
      return description.toLowerCase().includes(modelKeyword.toLowerCase());
    });
    this.setState({ filterRules });
  };

  handleModelKeyword = e => {
    this.setState({ modelKeyword: e.target.value });
  };

  handleModelCompanyId = modelCompanyId => {
    this.setState({ modelCompanyId, fetchAll: true }, () => {
      fetchRules4Company({ companyId: modelCompanyId })
        .then(data => {
          const { content = [] } = data;
          const selectedRuleIds = content.map(rule => rule.id);
          this.setState({ selectedRuleIds, fetchAll: false });
        })
        .catch(data => {
          notification.warning(data.content);
        });
    });
  };

  onSwitchMore = (type, more = false) => () => {
    switch (type) {
      case "RISK":
        this.setState({ showRiskMore: !more });
        break;
      case "COMPANY":
        this.setState({ showCompanyMore: !more });
        break;
    }
  };

  handleChecked = (type, value) => () => {
    let {
      selectedRisks,
      selectedCompanies,
      leftSelectedRuleIds,
      rightSelectedRuleIds
    } = this.state;
    switch (type) {
      case "RISK":
        if (value === "ALL") {
          selectedRisks = [];
        } else {
          if (selectedRisks.includes(value)) {
            selectedRisks = selectedRisks.filter(risk => risk !== value);
          } else {
            selectedRisks = [...selectedRisks, value];
          }
        }
        this.setState({ selectedRisks }, this.loadAllRules);
        break;
      case "HOT":
        this.setState({ selectedHot: value }, this.loadAllRules);
        break;
      case "COMPANY":
        if (value === "ALL") {
          selectedCompanies = [];
        } else {
          if (selectedCompanies.includes(value)) {
            selectedCompanies = selectedCompanies.filter(
              risk => risk !== value
            );
          } else {
            selectedCompanies = [...selectedCompanies, value];
          }
        }
        this.setState({ selectedCompanies }, this.loadAllRules);
        break;
      case "LEFT":
        if (leftSelectedRuleIds.includes(value)) {
          leftSelectedRuleIds = leftSelectedRuleIds.filter(id => id !== value);
        } else {
          leftSelectedRuleIds = [...leftSelectedRuleIds, value];
        }
        this.setState({ leftSelectedRuleIds });
        break;
      case "RIGHT":
        if (rightSelectedRuleIds.includes(value)) {
          rightSelectedRuleIds = rightSelectedRuleIds.filter(
            id => id !== value
          );
        } else {
          rightSelectedRuleIds = [...rightSelectedRuleIds, value];
        }
        this.setState({ rightSelectedRuleIds });
        break;
    }
  };

  handleRemove = (type, value) => () => {
    let { selectedRisks, selectedCompanies } = this.state;
    switch (type) {
      case "RISK":
        selectedRisks = selectedRisks.filter(risk => risk !== value);
        this.setState({ selectedRisks }, this.loadAllRules);
        break;
      case "HOT":
        this.setState({ selectedHot: "ALL" }, this.loadAllRules);
        break;
      case "ConOnlineOMPANY":
        selectedCompanies = selectedCompanies.filter(risk => risk !== value);
        this.setState({ selectedCompanies }, this.loadAllRules);
        break;
      default:
        this.setState(
          { selectedRisks: [], selectedHot: "ALL", selectedCompanies: [] },
          this.loadAllRules
        );
    }
  };

  onChangeOption = selectedOptions => {
    this.setState({ selectedOptions });
  };

  onOnline = () => {
    const { record, pagination } = this.state;
    const { id } = record;
    updateRuleActive({
      activeStatus: ACTIVED,
      id
    })
      .then(() => {
        this.setState({ companyShow: false }, () => {
          this.loadRules(pagination.current);
        });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  onBatchOnlineToCompany = () => {
    const { selectedRuleIds: ruleIds, modelCompanyId: companyId } = this.state;
    this.setState({ fetchAllSaving: true });
    batchOnlineToCompany({ ruleIds, companyId })
      .then(() => {
        this.setState({ copyVisible: false }, this.loadRules);
      })
      .catch(data => {
        this.setState({ fetchAllSaving: false });
        notification.warning(data.content);
      });
  };

  onOffline = () => {
    const { selectedCompanyIdList, record } = this.state;
    const { id } = record;
    updateRuleActive({
      activeStatus: UN_ACTIVED,
      compList: selectedCompanyIdList,
      id
    })
      .then(() => {
        this.setState({ offlineShow: false }, () => {
          this.onEditIconClick(record, "copy");
        });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  onOnlyOffline = () => {
    const {
      selectedCompanyIdList,
      record: { id },
      pagination
    } = this.state;
    updateRuleActive({
      activeStatus: UN_ACTIVED,
      compList: selectedCompanyIdList,
      id
    })
      .then(() => {
        this.setState({ offlineShow: false }, () => {
          this.loadRules(pagination.current);
        });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  onChangeCompany = selectedCompanyIdList => {
    this.setState({ selectedCompanyIdList });
  };

  loadActiveRiskTypes = () => {
    const { domainType } = this.state;
    fetchActiveRiskTypes({ domainType })
      .then(data => {
        const { content: riskList = [] } = data;
        let riskMap = {};
        const showRiskAll =
          riskList
            .map(risk => {
              const { id, name } = risk;
              riskMap = { ...riskMap, [id]: name };
              return calTextWith(name);
            })
            .reduce((a, b) => a + b) > 888;
        this.setState({
          riskList,
          showRiskAll,
          riskMap
        });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  onChangeListTab = listType => {
    this.onReset(null, { listType });
  };

  onBlur = () => {
    const companyId = this.props.form.getFieldValue("sourceCompanyId");
    this.loadRulesByKeyword({ companyId });
  };

  onSearchRules = keyword => {
    const companyId = this.props.form.getFieldValue("sourceCompanyId");
    this.loadRulesByKeyword({ companyId, keyword });
  };

  loadRulesByKeyword = (data = {}) => {
    fetchRulesByKeyword(data)
      .then(res => {
        const { content: rules = [] } = res;
        this.setState({ rules });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  preventDefault = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  onViewCancel = () => {
    this.setState({
      viewShow: false,
      copyVisible: false,
      companyVisible: false,
      ruleInfo: {},
      enumShow: false,
      fieldSaveError: ""
    });
  };

  onCopyCancel = () => {
    const { copySaving } = this.state;
    if (!copySaving) {
      this.setState({
        viewShow: false,
        copyVisible: false,
        copySaving: false,
        ruleInfo: {},
        enumShow: false,
        fieldSaveError: ""
      });
    }
  };

  loadLogs = (page = 1) => {
    const { logPagination, record } = this.state;
    const { id: ruleId } = record;
    fetchRuleHistory({ ruleId, page })
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        const hDataSource = data.map((item, index) => {
          return { ...item, key: index };
        });
        logPagination.total = total;
        logPagination.current = page;
        this.setState({ hDataSource, viewShow: true, logPagination });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  onViewIconClick = record => {
    this.setState({ record }, this.loadLogs);
  };

  onCompanyIconClick = async record => {
    const { companyList = [] } = this.state;
    const { id } = record;
    try {
      const { content: { companyIdList = [] } = {} } = await fetchRuleInfo(id);
      const { content = [] } = await fetchRuleLog({ ruleId: id });
      const dDataSource = content.map((row, index) => {
        return { ...row, key: index };
      });
      this.setState({
        record,
        companyShow: true,
        companyIdList,
        filterCompanyList: companyList.filter(
          company => !companyIdList.includes(company.companyId)
        ),
        selectedCompanyIdList: [],
        dDataSource,
        selectedOptions: [ACTIVED, UN_ACTIVED]
      });
    } catch (e) {
      notification.warning(e);
    }
  };

  onQuery = () => {
    this.loadRules();
  };

  onReset = (_, options = {}) => {
    this.setState(
      {
        keyword: undefined,
        companyId: undefined,
        activeStatus: undefined,
        projectCheck: undefined,
        riskTypeId: undefined,
        domainType: domainType,
        businessType: undefined,
        applyRegion: undefined,
        ...options
      },
      () => {
        this.onQuery();
      }
    );
  };

  loadRules = (page = 1) => {
    const {
      listType,
      pagination,
      domainType,
      companyId,
      activeStatus,
      projectCheck,
      riskTypeId,
      keyword,
      businessType,
      applyRegion
    } = this.state;
    this.isProjectCheck = projectCheck === "CHECK";
    const { pageSize: size } = pagination;
    const data = {
      deletedFlag: listType === "DEL_RULE_LIST",
      domainType,
      activeStatus,
      projectCheck,
      companyId,
      riskTypeId,
      keyword,
      page,
      size,
      businessType,
      applyRegion
    };
    this.setState({
      isAntiFraudSearched: domainType === "ANTI_FRAUD",
      loading: true
    });
    fetchRuleList(data)
      .then(res => {
        const { content = {} } = res;
        const { data = [], page = 1, total = 0 } = content;
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.loadRules();
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

  onCancel = () => {
    this.setState({
      companyShow: false,
      copyVisible: false
    });
  };

  handleChange = page => {
    const { pagination } = this.state;
    this.setState({ pagination: { ...pagination, current: page } }, () => {
      this.loadRules(page);
    });
  };

  handleShowSizeChange = (_, pageSize) => {
    const { pagination } = this.state;
    this.setState({ pagination: { ...pagination, pageSize } }, () => {
      this.loadRules();
    });
  };

  changeRiskType = e => {
    this.setState({ riskTypeId: e });
  };

  changeCompany = e => {
    this.setState({ companyId: e });
  };

  changeDomainType = e => {
    this.setState(
      {
        domainType: e,
        keyword: undefined,
        companyId: undefined,
        activeStatus: undefined,
        projectCheck: undefined,
        riskTypeId: undefined
      },
      () => {
        this.loadActiveRiskTypes();
      }
    );
  };
  changeBusinessType = e => {
    this.setState({ businessType: e });
  };
  changeApplyRegionType = e => {
    this.setState({ applyRegion: e });
  };
  changeActiveStatus = e => {
    this.setState({ activeStatus: e });
  };

  changeProjectCheck = e => {
    this.setState({ projectCheck: e.target.checked ? "CHECK" : "UN_CHECK" });
  };

  changeKeyword = e => {
    this.setState({ keyword: e.target.value });
  };

  changeRuleActive = async (checked, record) => {
    const { pagination: { current = 1 } = {} } = this.state;
    const { id } = record;
    const activeStatus = checked ? "ACTIVED" : "UN_ACTIVED";
    if (checked) {
      updateRuleActive({
        activeStatus: activeStatus,
        id
      })
        .then(res => {
          record.activeStatus = activeStatus;
          this.setState({ editConfirmShow: false, loading: false }, () => {
            this.loadRules(current);
          });
        })
        .catch(data => {
          const { content = {} } = data;
          notification.warn(content);
        });
    } else {
      templateRuleDependencies(buildUrlParamNew({ id: record.id }))
        .then(res => {
          const {
            content: {
              dependenceList = [],
              overThanTen = false,
              totalCount = 0
            } = {}
          } = res;
          if (totalCount === 0) {
            updateRuleActive({
              activeStatus: activeStatus,
              id
            })
              .then(res => {
                record.activeStatus = checked ? ACTIVED : UN_ACTIVED;
                this.setState(
                  { editConfirmShow: false, loading: false },
                  () => {
                    this.loadRules(current);
                  }
                );
              })
              .catch(data => {
                const { content = {} } = data;
                notification.warn(content);
              });
          } else {
            const nameMapError = {
              CUSTOM_RULE_TYPE: `合作单位名称:${
                overThanTen ? `（${totalCount}）` : ""
              }`
            };
            decisionModalError(dependenceList, nameMapError, {
              title:
                "该规则模板正在被以下合作单位使用，无法进行此操作，请取消后重试。",
              ellipsis: overThanTen
            });
          }
        })
        .catch(data => {
          const { content = {} } = data;
          notification.warn(content);
        });
    }
  };

  onCopyBtnClick = () => {
    this.setState(
      {
        fetchAllSaving: false,
        copyVisible: true,
        modelKeyword: undefined,
        modelCompanyId: undefined,
        selectedRuleIds: [],
        selectedRisks: [],
        selectedHot: "ALL",
        selectedCompanies: [],
        allRules: [],
        allRuleMap: {},
        filterRules: []
      },
      this.loadAllRules
    );
  };

  loadAllRules = () => {
    const {
      selectedHot: onlineHeat,
      selectedCompanies: referCompanyIdList = [],
      selectedRisks: riskTypeIdList = []
    } = this.state;
    let { allRules = [], allRuleMap = {} } = this.state;
    this.setState({ fetchAll: true });
    fetchAllRules({ onlineHeat, referCompanyIdList, riskTypeIdList })
      .then(data => {
        const { content = [] } = data;
        if (allRules.length === 0) {
          allRules = content;
          content.forEach(rule => {
            const { id } = rule;
            allRuleMap = { ...allRuleMap, [id]: rule };
          });
        }
        this.setState({
          fetchAll: false,
          allRules,
          allRuleMap,
          filterRules: content,
          filterAllRules: content
        });
      })
      .catch(data => {
        notification.warn(data.content);
      });
  };

  onCreateBtnClick = () => {
    const conditions = this._buildConditions();
    const { history } = this.props;
    const { location: { pathname } = {} } = history;
    history.push({
      pathname: "./management/new/rule",
      state: { conditions, pathname }
    });
  };

  onEditIconClick = (ruleInfo, editType = "edit") => {
    const { id } = ruleInfo;
    fetchRuleInfo(id)
      .then(async data => {
        const { content = {} } = data;
        const { leakageRuleTempRespList = [] } = content;
        let selectedRowKeys = [];
        const tDataSource = leakageRuleTempRespList.map(template => {
          let { id, code, name, conditionList = [] } = template;
          conditionList = conditionList.map(item => {
            const {
              filterType = "",
              rightValue = "",
              recentTimeRangeValue = ""
            } = item;
            // 修补旧有数据
            if (
              filterType.endsWith("_LIMIT_TIME") &&
              !filterType.startsWith("BETWEEN_")
            ) {
              if (rightValue.length > 0) {
                delete item["rightValue"];
                if (recentTimeRangeValue === "") {
                  return { ...item, recentTimeRangeValue: rightValue };
                }
              }
            }
            return item;
          });
          selectedRowKeys = [...selectedRowKeys, id];
          return {
            ...template,
            conditionList,
            templateCode: code,
            templateName: name
          };
        });
        const conditions = this._buildConditions();
        const { history } = this.props;
        const { location: { pathname } = {} } = history;
        history.push({
          pathname: `./management/${editType}/${id}`,
          state: {
            conditions,
            pathname,
            record: {
              tPagination: false,
              ruleInfo: content,
              selectedRowKeys,
              activeKeys: ["SET"],
              tDataSource,
              selectedRows: tDataSource
            }
          }
        });
      })
      .catch(data => {
        const { content = {} } = data;
        notification.warn(content);
      });
  };

  onReduceIconClick = record => {
    const { id: ruleId } = record;
    const { pagination } = this.state;
    reduceRule({ ruleId })
      .then(() => {
        this.loadRules(pagination.current);
      })
      .catch(data => {
        notification.warning(data.content);
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
        this.onRuleDelete();
      },
      onCancel: () => {
        this.onRuleCancel();
      }
    });
    this.setState({
      // deleteConfirmShow: true,
      record
    });
  };

  onConfirmIconClick = record => {
    confirm({
      title: "是否确认该规则条件配置无误?",
      content: "",
      okText: "确定",
      okType: "primary",
      cancelText: "取消",
      onOk: async () => {
        this.onRuleConfirm();
      },
      onCancel: () => {
        this.onRuleCancel();
      }
    });
    this.setState({
      // deleteConfirmShow: true,
      record
    });
  };

  onCheckIconClick = record => {
    checkProjectNames(record)
      .then(data => {
        const { content = [] } = data;
        const promptMsg = (
          <Row>
            {content.map(rule => {
              return (
                <Col
                  key={rule}
                  title={rule}
                  className="text-overflow"
                  span={24}
                >
                  {rule}
                </Col>
              );
            })}
          </Row>
        );
        this.setState({
          deleteConfirmShow: false,
          promptShow: true,
          promptMsg
        });
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

  onRuleCancel = () => {
    this.setState({
      deleteConfirmShow: false,
      fieldSaveError: ""
    });
  };

  onRuleDelete = async () => {
    const { record: { id } = {}, pagination } = this.state;
    delRule({ id })
      .then(res => {
        this.setState(
          {
            deleteConfirmShow: false
          },
          () => {
            this.loadRules(pagination.current);
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

  onRuleConfirm = async () => {
    const { record: { id } = {}, pagination } = this.state;
    confirmRule({ id })
      .then(res => {
        this.setState(
          {
            deleteConfirmShow: false
          },
          () => {
            this.loadRules(pagination.current);
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

  _buildConditions = () => {
    const {
      pagination,
      domainType,
      companyId,
      riskTypeId,
      keyword,
      activeStatus,
      projectCheck
    } = this.state;
    const { pageSize, current = 1 } = pagination;
    return {
      domainType,
      companyId,
      activeStatus,
      projectCheck,
      riskTypeId,
      keyword,
      current,
      pageSize
    };
  };
}

export default Form.create()(Rule);
