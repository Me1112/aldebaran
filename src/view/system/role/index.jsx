// 角色管理
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import {
  Input,
  Table,
  Button,
  Modal,
  notification,
  Form,
  Tabs,
  TreeSelect,
  Tree
} from 'antd'
import { Map } from 'immutable'
import { SUCCESS } from '../../../common/constant'
import { convertTreeSelectData, formatDate } from '../../../util'
import {
  getRoleList,
  addRole,
  updateRole,
  deleteRole,
  selectAllActionByRole,
  getDepartmentSelect,
  getSettingUserList,
  updateUserRoleInfo
} from '../../../action/system'
import './index.less'
import { GET_ROLE_LIST, GET_USER_LIST } from '../../../common/system_constant'
import LayoutRight from '../../../component/layout_right'

const confirm = Modal.confirm
const { Item: FormItem } = Form
const { TabPane } = Tabs
const { TreeNode } = Tree

const pagination = {
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: () => {
  },
  onShowSizeChange(current, pageSize) {
    console.log('Current: ', current, '; PageSize: ', pageSize)
  },
  onChange(current) {
    console.log('Current: ', current)
  }
}

// const CheckboxGroup = Checkbox.Group

function mapStateToProps(state) {
  const { system = Map({}) } = state
  const { roleInfo = {} } = system.toJS()
  return { roleInfo }
}

function mapDispatchToProps(dispatch) {
  return {
    getRoleList: bindActionCreators(getRoleList, dispatch),
    addRole: bindActionCreators(addRole, dispatch),
    updateRole: bindActionCreators(updateRole, dispatch),
    deleteRole: bindActionCreators(deleteRole, dispatch)
  }
}

class ScoreIndex extends Component {
  state = {
    editModalShow: false,
    editType: '',

    columns: [{
      title: '角色编码',
      width: '20%',
      dataIndex: 'roleCode',
      key: 'roleCode',
      render: text => {
        return <div className="text-overflow" title={text}>{text}</div>
      }
    }, {
      title: '角色名称',
      width: '20%',
      dataIndex: 'roleName',
      key: 'roleName',
      render: text => {
        return <div className="text-overflow" title={text}>{text}</div>
      }
    }, {
      title: '更新人',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: '20%',
      render: text => {
        return <div className="text-overflow" title={text}>{text}</div>
      }
    }, {
      title: '更新时间',
      width: '20%',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (text, record) => {
        return (<div>{formatDate(text)}</div>)
      }
    }, {
      title: '操作',
      dataIndex: 'operations',
      key: 'operations',
      width: 150,
      render: (text, record) => {
        return <Fragment>
            <span className="operation-span" onClick={() => {
              this.onEditIconClick(record)
            }}>编辑</span>
          <span className="operation-span" onClick={() => this.onUserConfigIconClick(record)}>配置用户</span>
          <span className="operation-span" onClick={() => this.onDeleteIconClick(record)}>删除</span>
        </Fragment>
      }
    }],
    pagination,
    userPagination: pagination,

    // 编辑新建角色表单
    // userId: '',
    // roleId: '',
    // tab: 1,
    // actionIds: [],
    roleName: '',
    createId: 1,

    currentObj: {}
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    getRoleList: PropTypes.func.isRequired,
    addRole: PropTypes.func.isRequired,
    roleInfo: PropTypes.object.isRequired,
    updateRole: PropTypes.func.isRequired,
    deleteRole: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.props.getRoleList()
  }

  render() {
    const { result: list = [] } = this.props.roleInfo
    const {
      loading = false,
      pagination,
      userPagination,
      roleCode,
      roleName,
      userConfigShow = false,
      settingUserLists = [],
      selectedRowKeys = [],
      departmentList = [],
      loginNameSearch,
      userCodeSearch,
      departmentIdSearch = '',
      actionByRole = [],
      actionIds = [],
      expandedKeys = []
    } = this.state
    console.log('expandedKeys', expandedKeys)
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    }

    const userColumns = [{
      title: '用户名',
      width: '20%',
      dataIndex: 'loginName',
      key: 'loginName',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '用户姓名',
      width: '20%',
      dataIndex: 'realName',
      key: 'realName',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '用户工号',
      width: '20%',
      dataIndex: 'userCode',
      key: 'userCode',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '所属部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: '25%',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }]
    const rowSelection = {
      columnWidth: 30,
      selectedRowKeys,
      onChange: this.onRowsSelectChange,
      onSelectAll: this.onRowsSelectAll
    }
    return (
      <LayoutRight className="no-bread-crumb" type={'tabs'}>
        <Tabs type="card" defaultActiveKey={GET_ROLE_LIST} className={'tabs-no-border scorecard-new'}
              onChange={this.onChangeTab}>
          <TabPane tab="用户管理" key={GET_USER_LIST} forceRender />
          <TabPane tab="角色管理" key={GET_ROLE_LIST} forceRender>
            <div className="region-zd clearfix">
              <Button type="primary" style={{ float: 'right' }}
                      onClick={() => {
                        this.onOperateEditModal(true, 'add')
                      }}>新建</Button>
            </div>
            <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
              <Table className="table-layout-fixed" columns={this.state.columns} pagination={pagination}
                     onChange={this.onChange}
                     rowKey="roleId"
                     dataSource={list} locale={{ emptyText: '暂无数据' }} />
            </div>
            <Modal
              title={`${this.state.editType === 'add' ? '新建' : '编辑'}角色`} width="600px"
              wrapClassName="edit-confirm-modal"
              visible={this.state.editModalShow}
              maskClosable={false}
              okText="确认"
              cancelText="取消"
              confirmLoading={loading}
              onCancel={() => {
                this.onOperateEditModal(false)
              }}
              onOk={() => {
                this.onSave()
              }}
            >
              <Form>
                <FormItem
                  {...formItemLayout}
                  label="角色编码"
                >
                  {getFieldDecorator('roleCode', {
                    rules: [{
                      required: true,
                      pattern: /^\d{1,50}$/,
                      message: '请输入角色编码，仅支持最多50位数字'
                    }],
                    initialValue: roleCode
                  })(
                    <Input maxLength="50" placeholder="请输入角色编码，仅支持最多50位数字"
                           disabled={this.state.editType !== 'add'} />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="角色名"
                >
                  {getFieldDecorator('roleName', {
                    rules: [{
                      required: true, message: '请输入角色名'
                    }],
                    initialValue: roleName
                  })(
                    <Input maxLength="20" placeholder="请输入角色名" />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="权限分配"
                >
                  {getFieldDecorator('privilegeIds', {
                    rules: [{
                      required: true, message: '请选择权限'
                    }],
                    initialValue: actionIds
                  })(<div className="form-tree-container">
                      <Tree checkable
                            onExpand={this.onExpand}
                            expandedKeys={expandedKeys}
                            onCheck={this.onCheck}
                            checkedKeys={actionIds}>
                        {this.renderTreeNodes(actionByRole)}
                      </Tree>
                    </div>
                  )}
                </FormItem>
              </Form>
            </Modal>
            <Modal
              title="配置用户" width="800px"
              wrapClassName="edit-confirm-modal"
              visible={userConfigShow}
              maskClosable={false}
              okText="确认"
              cancelText="取消"
              onCancel={() => {
                this.setState({
                  userConfigShow: false
                })
              }}
              onOk={this.onUserConfigSave}
            >
              <div className="region-zd clearfix">
                <Input placeholder="用户姓名/用户名" style={{ width: 180 }} value={loginNameSearch} onChange={(e) => {
                  this.setState({ loginNameSearch: e.target.value })
                }} />
                <Input placeholder="用户工号" style={{ width: 180 }} value={userCodeSearch} onChange={(e) => {
                  this.setState({ userCodeSearch: e.target.value })
                }} />
                <TreeSelect allowClear placeholder="部门" style={{ width: 180 }} value={departmentIdSearch}
                            dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                            treeData={convertTreeSelectData(departmentList)}
                            onChange={this.onDepartmentChange}
                />
                <Button type="primary" onClick={this.getSettingUserList}>查询</Button>
                <Button type="default" onClick={this.onClearClick}>重置</Button>
              </div>
              <Table rowKey="userId" className="table-layout-fixed"
                     rowSelection={rowSelection}
                     columns={userColumns} pagination={userPagination}
                     onChange={this.onUserChange} size="small"
                     dataSource={settingUserLists} locale={{ emptyText: '暂无数据' }} />
            </Modal>
          </TabPane>
        </Tabs>
      </LayoutRight>
    )
  }

  renderTreeNodes = actionByRole => {
    return actionByRole.map(item => {
      const { id = '', children, privilegeName = '' } = item
      if (children) {
        return (
          <TreeNode title={privilegeName} key={id} dataRef={item}>
            {this.renderTreeNodes(children)}
          </TreeNode>
        )
      }
      return <TreeNode title={privilegeName} key={id} dataRef={item} />
    })
  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys
    })
  }

  onCheck = checkedKeys => {
    this.setState({ actionIds: checkedKeys })
  }

  onChangeTab = (key) => {
    if (key === GET_USER_LIST) {
      this.props.history.push({ pathname: '/leakage/system/user' })
    } else {
      this.props.history.push({ pathname: '/leakage/system/role' })
    }
  }
  /**
   * 操作模态框
   * @param show
   * @param type
   */
  onOperateEditModal = (show, type, opt) => {
    this.setState({
      editModalShow: show,
      editType: show ? type : 'add'
    })
    if (!show) {
      this.props.form.resetFields()
    } else {
      if (type === 'add') {
        this.setState({
          roleCode: '',
          roleName: ''
        })
        this.selectAllActionByRole()
      } else {
        this.setState({
          roleCode: opt.roleCode,
          roleName: opt.roleName,
          currentObj: opt
        })
        this.selectAllActionByRole(opt.roleId)
      }
    }
  }

  selectAllActionByRole = (roleId = '') => {
    selectAllActionByRole(roleId).then(data => {
      const { content: actionByRole = [] } = data
      let actionIds = []
      let expandedKeys = []
      this.initActionIds(actionByRole, actionIds, expandedKeys)
      this.setState({
        actionByRole,
        actionIds,
        expandedKeys
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  initActionIds = (actionByRole, actionIds, expandedKeys) => {
    actionByRole.forEach(item => {
      const { id = '', children = [], checked = 0 } = item
      if (checked) {
        actionIds.push(`${id}`)
      }
      expandedKeys.push(`${id}`)
      if (children.length > 0) {
        this.initActionIds(children, actionIds, expandedKeys)
      }
    })
  }

  onEditIconClick = (record) => {
    this.onOperateEditModal(true, 'edit', {
      roleId: record.roleId,
      roleCode: record.roleCode,
      roleName: record.roleName
    })
  }

  onUserConfigIconClick = record => {
    this.setState({
      record,
      loginNameSearch: undefined,
      userCodeSearch: undefined,
      departmentIdSearch: '',
      userPagination: pagination,
      userConfigShow: true
    }, () => {
      this.getDepartmentSelect()
      this.getSettingUserList()
    })
  }

  onUserConfigSave = () => {
    const { record: { roleId = '' } = {}, selectedRowKeys = [] } = this.state
    updateUserRoleInfo({
      roleId,
      userIds: selectedRowKeys.join(',')
    }).then(() => {
      this.setState({
        userConfigShow: false
      }, () => {
        this.props.getRoleList()
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  onRowsSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  // 改写全选回调(兼顾多页)
  onRowsSelectAll = selected => {
    const { settingUserLists = [] } = this.state
    const allKeys = settingUserLists.map(settingUser => settingUser.userId)
    const selectedRowKeys = selected ? allKeys : []
    this.setState({ selectedRowKeys })
  }

  getDepartmentSelect = (name = '') => {
    getDepartmentSelect(name).then(data => {
      const { content: departmentList } = data
      this.setState({ departmentList })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  onDepartmentChange = (value) => {
    this.setState({ departmentIdSearch: value })
  }

  getSettingUserList = () => {
    const {
      record: { roleId = '' } = {},
      loginNameSearch = '',
      departmentIdSearch = '',
      userCodeSearch = ''
    } = this.state
    getSettingUserList(roleId).then(data => {
      const { content = [] } = data
      const settingUserLists = content.filter(d => {
        const { loginName = '', realName = '', userCode = '', departmentId = '' } = d
        return (loginName.indexOf(loginNameSearch) !== -1 || realName.indexOf(loginNameSearch) !== -1) &&
          userCode.indexOf(userCodeSearch) !== -1 && ['', departmentId.toString()].indexOf(departmentIdSearch) !== -1
      })
      const selectedRowKeys = settingUserLists.filter(d => d.checked).map(d => d.userId)
      this.setState({ settingUserLists, selectedRowKeys })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  onClearClick = () => {
    this.setState({
      loginNameSearch: undefined,
      userCodeSearch: undefined,
      departmentIdSearch: ''
    })
  }

  onUserChange = (userPagination) => {
    this.setState({
      userPagination
    })
  }

  onDeleteIconClick = (record) => {
    confirm({
      title: '确认删除角色?',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        const { promise } = await this.props.deleteRole({ id: record.roleId })
        promise.then((data) => {
          if (data.actionStatus === SUCCESS) {
            notification.success({ message: '删除成功' })
            this.props.getRoleList()
          }
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      }
    })
  }
  onChange = (pagination) => {
    this.setState({
      pagination
    })
  }
  onSave = () => {
    this.props.form.validateFields(['roleCode', 'roleName'], async (errors, values) => {
      const { actionIds = [] } = this.state
      if (errors) {
        console.log('Errors in form!!!')
        return
      }
      if (actionIds.length === 0) {
        notification.warning({ message: '请选择权限' })
        return
      }
      let saveFun
      if (this.state.editType === 'add') {
        saveFun = this.props.addRole({ ...values, privilegeIds: actionIds.join() })
      } else {
        saveFun = this.props.updateRole({
          ...values,
          privilegeIds: actionIds.join(),
          roleId: this.state.currentObj.roleId
        })
      }
      await this.setState({ loading: true })
      const { promise } = await saveFun
      this.setState({ loading: false })
      promise.then((data) => {
        this.onOperateEditModal(false)
        this.props.getRoleList()
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    })
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Form.create()(ScoreIndex))

// module.exports = ScoreIndex
