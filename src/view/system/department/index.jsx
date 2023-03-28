import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Layout,
  Icon,
  Input,
  Row,
  Col,
  Modal,
  notification,
  Tree,
  TreeSelect,
  Table,
  Popover,
  List,
  Popconfirm
} from "antd";
import "./index.less";
import {
  getDepartmentSelect,
  getDepartmentSelectFilter,
  getUserList,
  saveDepartment,
  updateDepartment,
  deleteDepartment
} from "../../../action/system";
import { convertTreeSelectData, formatDate } from "../../../util";
import { ADD, EDIT, DELETE, POP_MENUS } from "../../../common/constant";

const { Header, Content, Sider } = Layout;
const FormItem = Form.Item;
const { TreeNode } = Tree;

@Form.create()
export default class DepartmentList extends Component {
  state = {
    searchValue: "",
    renameId: "",
    selectedPath: "",
    selectedName: "",
    show: false,
    saveLoading: false,
    folderList: [],
    modelLoading: false,
    pagination: {
      current: 0,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: total => `共 ${total} 条`
    }
  };

  static propTypes = {
    form: PropTypes.any,
    getFieldDecorator: PropTypes.any
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      modelLoading: false
    });
  }

  componentDidMount() {
    this.loadDepartments();
  }

  render() {
    const { getFieldProps } = this.props.form;
    const {
      selectedPath,
      selectedName,
      show = false,
      loading = false,
      departmentList = [],
      departmentListFilter = [],
      departmentInfo = {},
      pagination,
      dataSource = []
    } = this.state;
    const {
      id = "",
      departmentName = "",
      departmentCode = "",
      parent
    } = departmentInfo;
    const parentDepartments = id !== "" ? departmentListFilter : departmentList; // 上级部门List

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 }
    };

    const columns = [
      {
        title: "账号",
        dataIndex: "loginName",
        key: "loginName",
        width: "15%",
        render: (text, record) => {
          return (
            <div className="text-overflow cell" title={text}>
              {text}
            </div>
          );
        }
      },
      {
        title: "用户姓名",
        dataIndex: "realName",
        key: "realName",
        width: "10%",
        render: (text, record) => {
          return (
            <div className="text-overflow cell" title={text}>
              {text}
            </div>
          );
        }
      },
      {
        title: "所属部门",
        dataIndex: "departmentName",
        width: "15%",
        key: "departmentName",
        render: (text, record) => {
          return (
            <div className="text-overflow cell" title={text}>
              {text}
            </div>
          );
        }
      },
      {
        title: "联系邮箱",
        dataIndex: "email",
        width: 150,
        key: "email",
        render: (text, record) => {
          return (
            <div className="text-overflow cell" title={text}>
              {text}
            </div>
          );
        }
      },
      {
        title: "角色",
        dataIndex: "roleNames",
        width: "15%",
        key: "roleNames",
        render: (text, record) => {
          return (
            <div className="text-overflow cell" title={text}>
              {text}
            </div>
          );
        }
      },
      {
        title: "更新时间",
        dataIndex: "updateTime",
        width: 150,
        key: "updateTime",
        render: (text, record) => {
          return <div>{formatDate(text)}</div>;
        }
      }
    ];

    let layout = (
      <div className={"no-design"}>
        请选择或
        <span className="create-span" onClick={this.showModal}>
          新建
        </span>
        部门
      </div>
    );

    if (selectedPath.length > 0) {
      layout = (
        <Fragment>
          <Header
            style={{
              background: "#fff",
              borderBottom: "1px solid #f0f2f5",
              padding: "0px 0px 0px 20px",
              height: "50px",
              lineHeight: "50px"
            }}
          >
            {selectedName}
          </Header>
          <Content
            style={{
              background: "#fff",
              margin: "0px",
              padding: "0px",
              minHeight: 280,
              height: "100%"
            }}
          >
            <div style={{ height: "100%", overflowY: "scroll", padding: 20 }}>
              <Table
                rowKey="userId"
                className="table-td-no-auto standard-table"
                columns={columns}
                dataSource={dataSource}
                locale={{ emptyText: "暂无数据" }}
                loading={loading}
                onChange={this.handleChange}
                pagination={pagination}
              />
            </div>
          </Content>
        </Fragment>
      );
    }

    return (
      <Layout className={"ant-layout-right"}>
        <Sider
          theme="light"
          style={{ borderRight: "1px solid #e8e8e8" }}
          trigger={null}
        >
          <Row className={"row-operation"}>
            <div style={{ margin: "10px" }}>
              <Col span={20}>
                <Input
                  placeholder="请输入关键字"
                  suffix={
                    <Icon type="search" onClick={this.filterDepartments} />
                  }
                  onChange={this.departmentChange}
                  onPressEnter={this.filterDepartments}
                />
              </Col>
              <Col span={4}>
                <Icon
                  type="plus"
                  className="search-plus-icon"
                  onClick={this.showModal}
                />
              </Col>
            </div>
          </Row>
          <Row className="cci-data-menu-container">
            <Tree onSelect={this.onSelect} selectedKeys={[selectedPath]}>
              {this.renderTreeNodes(departmentList)}
            </Tree>
          </Row>
        </Sider>
        <Layout className={"connection-panel"}>
          {layout}
          <Modal
            title={`${id !== "" ? "编辑" : "新建"}部门`}
            width={500}
            centered
            visible={show}
            maskClosable={false}
            okText="确认"
            cancelText="取消"
            confirmLoading={loading}
            onCancel={this.onEditCancel}
            onOk={this.onDepartmentSave}
          >
            <Form>
              <FormItem {...formItemLayout} label="部门名称">
                <Input
                  {...getFieldProps("departmentName", {
                    initialValue: departmentName,
                    validate: [
                      {
                        rules: [
                          {
                            required: true,
                            whitespace: true,
                            message: "请输入部门名称"
                          },
                          {
                            pattern: /^[\u4e00-\u9fa5\w\-()]{1,50}$/,
                            message:
                              "请输入1到50个字符，支持中文、字母、数字、下划线、-、(、)"
                          }
                        ]
                      }
                    ]
                  })}
                  placeholder="最多50个字符"
                  maxLength="50"
                  autoComplete="off"
                />
              </FormItem>
              <FormItem {...formItemLayout} label="部门编码">
                <Input
                  {...getFieldProps("departmentCode", {
                    initialValue: departmentCode,
                    validate: [
                      {
                        rules: [
                          {
                            required: true,
                            whitespace: true,
                            message: "请输入部门编码"
                          },
                          {
                            pattern: /^[_a-zA-Z0-9]{1,50}$/,
                            message: "请输入1到50个字符，支持字母、数字、下划线"
                          }
                        ]
                      }
                    ]
                  })}
                  disabled={id !== ""}
                  placeholder="最多50个字符"
                  autoComplete="off"
                  maxLength="50"
                />
              </FormItem>
              <FormItem {...formItemLayout} label="上级部门">
                <TreeSelect
                  {...getFieldProps("parent", {
                    initialValue: `${parent}`,
                    validate: [
                      {
                        rules: [
                          {
                            required: parent !== undefined,
                            whitespace: true,
                            message: "请选择上级部门"
                          }
                        ]
                      }
                    ]
                  })}
                  placeholder="请选择上级部门"
                  style={{ width: "100%" }}
                  disabled={parent === undefined}
                  dropdownStyle={{ maxHeight: 300, overflow: "auto" }}
                  treeData={convertTreeSelectData(parentDepartments)}
                />
              </FormItem>
            </Form>
          </Modal>
        </Layout>
      </Layout>
    );
  }

  handleChange = pagination => {
    this.setState({ pagination }, () => {
      this.getUserListData(pagination.current - 1);
    });
  };

  getUserListData = async (page = 0) => {
    const { pagination, selectedPath: departmentId = "" } = this.state;
    const { pageSize: size } = pagination;
    const data = {
      departmentId,
      page,
      size
    };
    this.setState({
      loading: true
    });
    const { payload: { promise } = {} } = await getUserList({ ...data });
    promise
      .then(res => {
        const { content = {} } = res;
        const {
          result: data = [],
          number: page = 0,
          totalElements: total = 0
        } = content;
        if (data.length === 0 && page > 0) {
          // 用户非法操作 前端兼容处理
          this.getUserListData();
          return;
        }
        data.forEach(item => {
          const { id } = item;
          item.key = id;
        });
        pagination.total = total;
        pagination.current = page + 1;
        this.setState({ dataSource: data, loading: false, pagination });
      })
      .catch(data => {
        notification.warning(data.content);
        this.setState({
          loading: false
        });
      });
  };

  loadDepartments = (keyword = "") => {
    getDepartmentSelect(keyword)
      .then(data => {
        const { content: departmentList = [] } = data;
        if (departmentList.length > 0) {
          departmentList[0].root = true;
        }
        this.setState({ departmentList });
      })
      .catch(data => {
        notification.warning(data.content);
      });
  };

  onEditCancel = () => {
    this.props.form.resetFields();
    this.setState({ show: false });
  };

  onDepartmentSave = e => {
    e.preventDefault();
    this.props.form.validateFields(async (err, values) => {
      if (err) {
        return;
      }
      try {
        const {
          departmentInfo = {},
          selectedPath = "",
          searchValue
        } = this.state;
        const { id = "" } = departmentInfo;
        const promise =
          id !== ""
            ? updateDepartment({ id, ...values })
            : saveDepartment({ id, ...values });
        promise
          .then(data => {
            this.props.form.resetFields();
            let state = { show: false };
            if (id !== "" && selectedPath.length > 0) {
              const { departmentName } = values;
              state["selectedName"] = departmentName;
            }
            this.setState(state, () => {
              this.loadDepartments(searchValue);
            });
          })
          .catch(data => {
            notification.warning(data.content);
          });
      } catch (err) {
      } finally {
      }
    });
  };

  departmentChange = e => {
    const searchValue = e.target.value;
    this.setState({ searchValue });
  };

  filterDepartments = () => {
    const { searchValue } = this.state;
    this.loadDepartments(searchValue);
  };

  showModal = () => {
    this.setState({ show: true, departmentInfo: { parent: "" } });
  };

  renderTreeNodes = (data, parent) => {
    return data.map(item => {
      const {
        id,
        departmentName,
        departmentCode,
        children = [],
        root = false
      } = item;
      const hasChildren = children.length > 0;
      const popMenu = root
        ? [ADD]
        : hasChildren
        ? [ADD, EDIT]
        : [ADD, EDIT, DELETE];
      const popOver = (
        <Fragment>
          <span
            className="title-span text-overflow"
            style={{ width: "calc(100% - 22px)" }}
            title={departmentName}
          >
            {departmentName}
          </span>
          <Popover
            overlayClassName={"menu-pop"}
            placement="rightBottom"
            content={
              <List
                size="small"
                bordered
                dataSource={popMenu}
                renderItem={item => {
                  switch (item) {
                    case DELETE:
                      return (
                        <Popconfirm
                          placement="rightBottom"
                          title={"确定要删除吗？"}
                          onCancel={this.preventEvent}
                          onConfirm={e =>
                            this.handlePopOperate(e, {
                              id,
                              departmentCode,
                              parent,
                              departmentName,
                              type: item
                            })
                          }
                          okText="确定"
                          cancelText="取消"
                        >
                          <List.Item onClick={this.preventEvent}>
                            {POP_MENUS[item]}
                          </List.Item>
                        </Popconfirm>
                      );
                    default:
                      return (
                        <List.Item
                          onClick={e =>
                            this.handlePopOperate(e, {
                              id,
                              departmentCode,
                              parent,
                              departmentName,
                              type: item
                            })
                          }
                        >
                          {POP_MENUS[item]}
                        </List.Item>
                      );
                  }
                }}
              />
            }
            trigger="hover"
          >
            <i className="circle-o" />
          </Popover>
        </Fragment>
      );
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode title={popOver} key={id} dataRef={item}>
            {this.renderTreeNodes(children, id)}
          </TreeNode>
        );
      }
      return <TreeNode title={popOver} key={id} {...item} />;
    });
  };

  onSelect = (selectedKeys, e) => {
    const { selectedPath } = this.state;
    const departmentId = selectedKeys.length > 0 ? selectedKeys.pop() : "";
    const {
      node: { props: { title = "" } = {} }
    } = e;
    const same = departmentId === selectedPath;
    this.setState(
      {
        selectedPath: departmentId,
        selectedName: title,
        loading: !same,
        dataSource: []
      },
      () => {
        if (!same) {
          this.getUserListData();
        }
      }
    );
  };

  preventEvent = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  handlePopOperate = async (e, data) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const {
      id = "",
      type = "",
      departmentCode = "",
      parent,
      departmentName = ""
    } = data;
    try {
      switch (type) {
        case ADD:
          this.setState({ show: true, departmentInfo: { parent: id } });
          break;
        case EDIT:
          this.setState(
            {
              show: true,
              departmentInfo: { id, departmentCode, parent, departmentName }
            },
            () => {
              getDepartmentSelectFilter(id)
                .then(data => {
                  const { content: departmentListFilter } = data;
                  this.setState({ departmentListFilter });
                })
                .catch(data => {
                  notification.warning(data.content);
                });
            }
          );
          break;
        case DELETE:
          deleteDepartment({ id })
            .then(data => {
              const { searchValue } = this.state;
              this.setState({ selectedPath: "", selectedName: "" }, () => {
                this.loadDepartments(searchValue);
              });
            })
            .catch(data => {
              notification.warning(data.content);
            });
          break;
      }
    } catch (err) {
    } finally {
    }
  };
}
