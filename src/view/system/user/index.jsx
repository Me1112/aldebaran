// 用户管理
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
  Checkbox,
  Switch,
  Row,
  Col,
  TreeSelect
} from 'antd'
import { Map } from 'immutable'
import { ACTIVED, UN_ACTIVED, SUCCESS } from '../../../common/constant'
import { convertTreeSelectData, formatDate } from '../../../util'
import {
  getUserList,
  addUser,
  updateUser,
  updateStatus,
  deleteUser,
  getCanCreateRoles,
  getRolesByUserId,
  resetPassword,
  getDepartmentSelect
} from '../../../action/system'
import './index.less'
import { GET_ROLE_LIST, GET_USER_LIST } from '../../../common/system_constant'
import LayoutRight from '../../../component/layout_right'

const confirm = Modal.confirm
const { Item: FormItem } = Form
const { TabPane } = Tabs

function mapStateToProps(state) {
  const { system = Map({}) } = state
  const { userInfo = {}, canCreateRoles = [] } = system.toJS()
  return { userInfo, canCreateRoles }
}

function mapDispatchToProps(dispatch) {
  return {
    getUserList: bindActionCreators(getUserList, dispatch),
    addUser: bindActionCreators(addUser, dispatch),
    updateUser: bindActionCreators(updateUser, dispatch),
    updateStatus: bindActionCreators(updateStatus, dispatch),
    deleteUser: bindActionCreators(deleteUser, dispatch),
    getCanCreateRoles: bindActionCreators(getCanCreateRoles, dispatch),
    getRolesByUserId: bindActionCreators(getRolesByUserId, dispatch),
    resetPassword: bindActionCreators(resetPassword, dispatch)
  }
}

class ScoreIndex extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    getUserList: PropTypes.func.isRequired,
    addUser: PropTypes.func.isRequired,
    userInfo: PropTypes.object.isRequired,
    updateUser: PropTypes.func.isRequired,
    updateStatus: PropTypes.func.isRequired,
    deleteUser: PropTypes.func.isRequired,
    form: PropTypes.object.isRequired,
    getCanCreateRoles: PropTypes.func.isRequired,
    canCreateRoles: PropTypes.array,
    getRolesByUserId: PropTypes.func.isRequired,
    resetPassword: PropTypes.func.isRequired
  }
  state = {
    editModalShow: false,
    editType: '',

    // selectedRowKeys: [], // 批量选择模型
    loginNameSearch: '',
    columns: [{
      title: '账号',
      width: '15%',
      dataIndex: 'loginName',
      key: 'loginName',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '用户姓名',
      width: '10%',
      dataIndex: 'realName',
      key: 'realName',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '用户工号',
      width: '15%',
      dataIndex: 'userCode',
      key: 'userCode',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '所属部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: '15%',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '激活',
      dataIndex: 'userStatus',
      key: 'userStatus',
      width: 100,
      render: (text, record) => {
        const { SwitchLoadingId } = this.state
        return <Switch style={{ width: 55 }} loading={SwitchLoadingId === record.userId} defaultChecked={false}
                       checked={record.userStatus === ACTIVED} checkedChildren="ON"
                       unCheckedChildren="OFF"
                       onChange={(checked) => {
                         this.onChangeStatus(checked, record)
                       }} />
      }
    }, {
      title: '拥有角色',
      dataIndex: 'roleNames',
      key: 'roleNames',
      width: '15%',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '更新时间',
      width: 150,
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
          <span className="operation-span" onClick={() => this.onEditIconClick(record)}>编辑</span>
          <span className="operation-span" onClick={() => this.onDeleteIconClick(record)}>删除</span>
          <span className="operation-span" onClick={() => this.onResetPsdIconClick(record)}>更改密码</span>
        </Fragment>
      }
    }],
    pagination: {
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
    },

    // 编辑新建用户表单
    roleIds: [],
    loginName: '',
    loginPassword: '',
    nickName: '',
    userStatus: true,

    currentObj: {}, // 当前操作的数据

    passReadOnly: true, // 新建用户Modal密码只读
    nameReadOnly: true // 新建用户Modal用户名只读
  }

  componentDidMount() {
    this.getData()
    this.getDepartmentSelect()
    this.props.getCanCreateRoles({ userId: 1 })
  }

  render() {
    const { result: list = [] } = this.props.userInfo
    const {
      loading = false, pagination, userId = '', loginName, realName, loginPassword, roleIds, passReadOnly,
      departmentList = [], userCode = '', departmentId = '', email = '', loginNameSearch = '',
      userCodeSearch = '', departmentIdSearch = ''
    } = this.state
    const { getFieldDecorator } = this.props.form
    let { canCreateRoles } = this.props
    if (!canCreateRoles) {
      canCreateRoles = []
    }
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    }
    return (
      <LayoutRight className="no-bread-crumb" type={'tabs'}>
        <Tabs type="card" defaultActiveKey={GET_USER_LIST} className={'tabs-no-border scorecard-new'}
              onChange={this.onChangeTab}>
          <TabPane tab="用户管理" key={GET_USER_LIST} forceRender>
            <div className="region-zd clearfix">
              <Input placeholder="用户姓名/用户名" style={{ width: 200 }} value={loginNameSearch} onChange={(e) => {
                this.setState({ loginNameSearch: e.target.value })
              }} />
              <Input placeholder="用户工号" style={{ width: 200 }} value={userCodeSearch} onChange={(e) => {
                this.setState({ userCodeSearch: e.target.value })
              }} />
              <TreeSelect placeholder="部门" style={{ width: 200 }} value={departmentIdSearch}
                          dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                          treeData={convertTreeSelectData(departmentList)}
                          onChange={this.onDepartmentChange}
              />
              <Button type="primary" onClick={this.getData}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
              <div style={{ float: 'right' }}>
                <Button type="primary" onClick={() => {
                  this.onOperateEditModal(true, 'add')
                }}>新建</Button>
              </div>
            </div>
            <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
              <Table className="table-layout-fixed" columns={this.state.columns} pagination={pagination}
                     onChange={this.onChange}
                     rowKey="userId"
                     dataSource={list} locale={{ emptyText: '暂无数据' }} />
            </div>
            <Modal
              title={`${this.state.editType === 'add' ? '新建' : '编辑'}用户`} width="650px"
              wrapClassName="edit-confirm-modal user-modal"
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
                  label="用户名"
                >
                  {getFieldDecorator('loginName', {
                    rules: [{
                      required: true, message: '请输入6到20位字符', max: 20, min: 6
                    }],
                    initialValue: loginName
                  })(
                    <Input placeholder="请输入用户名" disabled={userId !== ''} maxLength={20} />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="用户姓名"
                >
                  {getFieldDecorator('realName', {
                    rules: [{
                      required: true, message: '请输入2到20位字符', max: 20, min: 2
                    }],
                    initialValue: realName
                  })(
                    <Input placeholder="请输入用户姓名" disabled={userId !== ''} maxLength={20} />
                  )}
                </FormItem>
                {
                  this.state.editType === 'add'
                    ? <FormItem
                      {...formItemLayout}
                      label="密码"
                    >
                      {getFieldDecorator('loginPassword', {
                        rules: [{
                          required: true, message: '请输入密码'
                        }, {
                          pattern: /^(?!^\d+$)(?!^[a-zA-Z_]+$)[a-zA-Z_\d]{8,30}$/, message: '请输入8到30位数字字母组合'
                        }],
                        initialValue: loginPassword
                      })(
                        <Input type="text"
                               ref={ref => (this.passInput = ref)}
                               placeholder="请输入密码"
                               readOnly={passReadOnly}
                               onFocus={(e) => this.readOnlyChange(e, 'passReadOnly', false)}
                               onBlur={(e) => this.readOnlyChange(e, 'passReadOnly', true)}
                               onChange={this.onPassChange} />
                      )}
                    </FormItem> : ''
                }
                {
                  this.state.editType === 'add'
                    ? <FormItem
                      {...formItemLayout}
                      label="确认密码"
                    >
                      {getFieldDecorator('loginPasswordCheck', {
                        rules: [{
                          required: true, message: '请确认密码'
                        }, {
                          pattern: /^(?!^\d+$)(?!^[a-zA-Z_]+$)[a-zA-Z_\d]{8,30}$/, message: '请输入8到30位数字字母组合'
                        }],
                        initialValue: loginPassword
                      })(
                        <Input type="text"
                               ref={ref => (this.passInput = ref)}
                               placeholder="请输入密码"
                               readOnly={passReadOnly}
                               onFocus={(e) => this.readOnlyChange(e, 'passReadOnly', false)}
                               onBlur={(e) => this.readOnlyChange(e, 'passReadOnly', true)}
                               onChange={this.onPassChange} />
                      )}
                    </FormItem> : ''
                }
                <FormItem
                  {...formItemLayout}
                  label="用户工号"
                >
                  {getFieldDecorator('userCode', {
                    rules: [{
                      required: true, message: '请输入1到20位字符', max: 20, min: 1
                    }],
                    initialValue: userCode
                  })(
                    <Input placeholder="请输入用户工号" maxLength={20} />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="所属部门"
                >
                  {getFieldDecorator('departmentId', {
                    rules: [{
                      required: true, message: '请选择所属部门'
                    }],
                    initialValue: `${departmentId}`
                  })(
                    <TreeSelect placeholder="请选择所属部门" style={{ width: '100%' }}
                                dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                                treeData={convertTreeSelectData(departmentList)}
                    />
                  )}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="联系邮箱"
                >
                  {getFieldDecorator('email', {
                    rules: [{
                      required: true,
                      pattern: /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/,
                      message: '请输入50位以内的有效邮箱地址'
                    }],
                    initialValue: email
                  })(
                    <Input placeholder="请输入邮箱地址" maxLength={50} />
                  )}
                </FormItem>
                <FormItem
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="拥有角色"
                  style={{ width: '100%' }}
                >
                  {getFieldDecorator('roleIds', {
                    rules: [{
                      required: true, message: '请选择角色'
                    }],
                    initialValue: roleIds
                  })(
                    <Checkbox.Group style={{
                      width: '100%',
                      marginTop: 9,
                      border: '1px solid #d9d9d9',
                      padding: 10,
                      maxHeight: 250,
                      overflow: 'auto'
                    }}>
                      <Row>
                        {
                          canCreateRoles.map((item) => {
                            const { roleId = '', roleCode = '', roleName = '' } = item
                            const checkboxLabel = `${roleCode}-${roleName}`
                            return (
                              <Col span={12} key={roleId}>
                                <Checkbox value={roleId}>
                                  <span style={{ display: 'inline-block', width: 190, verticalAlign: 'text-top' }}
                                        title={checkboxLabel} className="text-overflow">{checkboxLabel}</span>
                                </Checkbox>
                              </Col>
                            )
                          })
                        }
                      </Row>
                    </Checkbox.Group>
                  )}
                </FormItem>
              </Form>
            </Modal>
          </TabPane>
          <TabPane tab="角色管理" key={GET_ROLE_LIST} forceRender />
        </Tabs>
      </LayoutRight>
    )
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

  onChangeTab = (key) => {
    if (key === GET_USER_LIST) {
      this.props.history.push({ pathname: '/leakage/system/user' })
    } else {
      this.props.history.push({ pathname: '/leakage/system/role' })
    }
  }
  onSelectChange = (selectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys)
    this.setState({ selectedRowKeys })
  }
  onMultiDel = () => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      notification.warn({ message: '请至少勾选一个用户' })
      return
    }
    confirm({
      title: '确认删除用户?',
      content: `${selectedRowKeys.length}个用户将被删除`,
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        const { promise } = await this.props.deleteUser({ roleId: '', tab: 0, userId: selectedRowKeys.join() })
        promise.then((data) => {
          if (data.actionStatus === SUCCESS) {
            notification.success({ message: '删除成功' })
            this.getData()
          }
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      }
    })
  }
  /**
   * 操作模态框
   * @param show
   * @param type
   */
  onOperateEditModal = (show, type, opt) => {
    this.setState({
      editModalShow: show
    })
    if (!show) {
      this.props.form.resetFields()
    } else {
      this.setState({
        editType: type
      })
      if (type === 'add') {
        this.setState({
          userId: '',
          loginName: '',
          realName: '',
          loginPassword: '',
          userCode: '',
          departmentId: '',
          email: '',
          roleIds: []
        })
      } else {
        this.setState({
          userId: opt.record.userId,
          loginName: opt.record.loginName,
          realName: opt.record.realName,
          userCode: opt.record.userCode,
          departmentId: opt.record.departmentId,
          email: opt.record.email,
          roleIds: opt.record.roleIds || []
        })
        this.getRoles(opt.record.userId)
      }
    }
  }
  onEditIconClick = (record) => {
    this.onOperateEditModal(true, 'edit', { record })
  }
  getRoles = async (userId) => {
    const { promise } = await this.props.getRolesByUserId({ userId })
    promise.then((data) => {
      if (data.actionStatus === SUCCESS) {
        data.content.forEach((item, index, arr) => {
          arr[index] = parseInt(item)
        })
        this.setState({
          roleIds: data.content
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  onDeleteIconClick = (record) => {
    confirm({
      title: '是否确认删除?',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        const { promise } = await this.props.deleteUser({ roleId: '', tab: 0, userId: record.userId })
        promise.then((data) => {
          if (data.actionStatus === SUCCESS) {
            notification.success({ message: '删除成功' })
            this.getData()
          }
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      }
    })
  }
  onResetPsdIconClick = async (record) => {
    const { promise } = await this.props.resetPassword({ userId: record.userId, loginName: record.loginName })
    promise.then((data) => {
      if (data.actionStatus === SUCCESS) {
        Modal.success({
          title: '密码重置成功',
          content: '初始密码为：dxai123456'
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  onChange = (pagination) => {
    this.setState({
      pagination
    })
  }
  onChangeStatus = async (checked, record) => {
    await this.setState({ SwitchLoadingId: record.userId })
    let saveFun = this.props.updateStatus({
      id: record.userId,
      activeStatus: checked ? ACTIVED : UN_ACTIVED
    })
    const { promise } = await saveFun
    promise.then((data) => {
      if (data.actionStatus === SUCCESS) {
        this.getData()
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    }).finally(() => {
      this.setState({ SwitchLoadingId: '' })
    })
  }
  onSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      const {
        loginName,
        realName,
        userCode,
        departmentId,
        email,
        roleIds,
        loginPassword,
        loginPasswordCheck
      } = values
      if (errors) {
        console.log('Errors in form!!!')
        return
      }
      let saveFun
      if (this.state.editType === 'add') {
        if (loginPasswordCheck !== loginPassword) {
          notification.warning({ message: '请确认密码' })
          return
        } else {
          saveFun = this.props.addUser({
            loginName,
            realName,
            userCode,
            departmentId,
            email,
            loginPassword,
            roleIds
          })
        }
      } else {
        saveFun = this.props.updateUser({
          userId: this.state.userId,
          userCode,
          departmentId,
          email,
          roleIds
        })
      }
      await this.setState({ loading: true })
      const { promise } = await saveFun
      this.setState({ loading: false })
      promise.then((data) => {
        if (data.actionStatus === SUCCESS) {
          this.onOperateEditModal(false)
          this.getData()
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    })
  }

  getData = () => {
    const {
      loginNameSearch: name = '',
      departmentIdSearch: departmentId = '',
      userCodeSearch: userCode = ''
    } = this.state
    this.props.getUserList({ name, departmentId, userCode })
  }

  onClearClick = () => {
    this.setState({
      loginNameSearch: '',
      userCodeSearch: '',
      departmentIdSearch: ''
    })
  }

  readOnlyChange = (e, readOnlyField, readOnly) => {
    const value = e.target.value || ''
    this.setState({
      [readOnlyField]: readOnly
    }, () => {
      if (readOnlyField === 'passReadOnly' && value === '') { // 聚焦type设置为'text'，防止历史记录提示
        this.passInput.input.type = 'text'
      }
    })
  }

  onPassChange = (e) => {
    const value = e.target.value || ''
    this.passInput.input.type = value.length > 0 ? 'password' : 'text'
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Form.create()(ScoreIndex))

// module.exports = ScoreIndex
