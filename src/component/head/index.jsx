import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Map } from 'immutable'
import { Modal, Form, Input, notification, Popover, List, Icon } from 'antd'
import { updatePassword, userLogout } from '../../action/system'
import { getUserName, logout, isLeakageReportUser } from '../../util'
import './index.less'
import Notify from './notify'
import Download from './download'

const { Item: FormItem } = Form
// const Breadcrumbs = {
//   '/credit': '信审管理',
//   '/limit': '额度管理',
//   '/rule/collection': '规则管理>规则集管理',
//   '/rule/list': '规则管理>规则管理',
//   '/rule/condition': '规则管理>条件管理',
//   '/rule/field': '规则管理>字段管理',
//   '/rule/scene': '规则管理>场景管理',
//   '/rule/verification': '规则管理>操作管理',
//   '/score/list': '评分模型>模型管理',
//   '/event/list': '事件中心>事件查询',
//   '/event/personal': '事件中心>个人统计',
//   '/event/offline': '事件中心>线下事件',
//   '/black/list': '风险名单库>名单库管理',
//   '/report/today': '统计报表>今日数据',
//   '/report/risk': '统计报表>风险趋势',
//   '/report/rule': '统计报表>规则分析',
//   '/report/area': '统计报表>区域分析',
//   '/system/user': '系统管理>用户管理',
//   '/system/role': '系统管理>用户管理',
//   '/system/access': '系统管理>接入管理',
//   '/system/operation': '系统管理>操作记录',
//   '/system/module': '系统管理>菜单管理',
//   '/system/service': '系统管理>服务管理'
// }

function mapStateToProps(state) {
  const { common = Map({}) } = state
  const { notifyInfo = {} } = common.toJS()
  return {
    notifyInfo
  }
}

function mapDispatchToProps(dispatch) {
  return {
    userLogout: bindActionCreators(userLogout, dispatch),
    updatePassword: bindActionCreators(updatePassword, dispatch)
  }
}

class HeadDropdown extends Component {
  state = {
    changePasswordShow: false,
    visible: false
  }

  static propTypes = {
    form: PropTypes.any,
    location: PropTypes.object,
    updatePassword: PropTypes.func.isRequired,
    userLogout: PropTypes.func.isRequired,
    notifyInfo: PropTypes.object
  }

  render() {
    const { form } = this.props
    const { getFieldProps } = form
    const { visible } = this.state
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 }
    }
    return (
      <div className="header-right">
        <div className="right-info">
          {
            !isLeakageReportUser() && <Fragment>
              <Download />
              <Notify />
            </Fragment>
          }
          <Popover placement="bottomRight" visible={visible} onVisibleChange={(visible) => {
            this.setState({ visible })
          }} overlayClassName="user-popover" content={
            <List
              size="small"
              bordered
              dataSource={['修改密码', '退出登录']}
              renderItem={item => {
                switch (item) {
                  case '修改密码':
                    return <List.Item onClick={() => {
                      this.setState({ changePasswordShow: true, visible: false })
                    }}>{item}</List.Item>
                  default:
                    return <List.Item onClick={this.logout}>{item}</List.Item>
                }
              }
              }
            />
          } trigger="click">
            <div className="user-info">
              <Icon className="info-head" type="user" />
              <span>{getUserName()}</span>
            </div>
          </Popover>
          <Modal
            title={`修改密码`} width="600px"
            wrapClassName="edit-confirm-modal"
            visible={this.state.changePasswordShow}
            maskClosable={false}
            okText="确认"
            cancelText="取消"
            onCancel={() => {
              this.setState({
                changePasswordShow: false
              })
              this.props.form.resetFields()
            }}
            onOk={() => {
              this.changePassword()
            }}
          >
            <Form>
              <FormItem {...formItemLayout} label="旧密码：">
                <Input {...getFieldProps('oldPassword', {
                  initialValue: '',
                  validate: [{
                    rules: [
                      { required: true, whitespace: true, message: '请输入8到30位数字字母组合' }
                    ]
                  }]
                })} placeholder="请输入8到30位数字字母组合" maxLength="30" type="password" />
              </FormItem>
              <FormItem {...formItemLayout} label="新密码：">
                <Input {...getFieldProps('newPassword', {
                  initialValue: '',
                  validate: [{
                    rules: [
                      { required: true, whitespace: true, message: '新密码不能为空' },
                      { pattern: /^(?!^\d+$)(?!^[a-zA-Z_]+$)[a-zA-Z_\d]{8,30}$/, message: '请输入8到30位数字字母组合' }
                    ]
                  }]
                })} placeholder="请输入8到30位数字字母组合" maxLength="30" type="password" />
              </FormItem>
              <FormItem {...formItemLayout} label="确认密码：">
                <Input {...getFieldProps('confirmPassword', {
                  initialValue: '',
                  validate: [{
                    rules: [
                      { required: true, whitespace: true, message: '确认密码不能为空' },
                      { pattern: /^(?!^\d+$)(?!^[a-zA-Z_]+$)[a-zA-Z_\d]{8,30}$/, message: '请输入8到30位数字字母组合' }
                    ]
                  }]
                })} placeholder="请输入8到30位数字字母组合" maxLength="30" type="password" />
              </FormItem>
            </Form>
          </Modal>
        </div>
      </div>
    )
  }

  logout = async () => {
    try {
      const { promise } = await this.props.userLogout()
      promise.then((data) => {
        logout()
      }).catch((data) => {
        const { content = {} } = data
        notification.warning(content)
      })
    } catch (err) {
      notification.warning(err)
    }
    return false
  }

  changePassword = async () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        console.log('Errors in form!!!')
        return
      }
      if (values.newPassword !== values.confirmPassword) {
        notification.error({ message: '新密码不一致' })
        return
      }
      const { promise } = await this.props.updatePassword(values)
      promise.then((data) => {
        notification.success({ message: '密码修改成功' })
        setTimeout(() => {
          this.logout()
        }, 400)
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(withRouter(HeadDropdown)))
