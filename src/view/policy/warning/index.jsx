import React from 'react'
import { Radio, Checkbox, Switch, Tabs, notification } from 'antd'
import LayoutRight from '../../../component/layout_right'
import PropTypes from 'prop-types'
import connect from 'react-redux/es/connect/connect'
import { bindActionCreators } from 'redux'
import { changeNotifyFrequency } from '../../../action'
import { getParamsWarningUsers, getParamsWarningConfig, updateParamsWarningConfig } from '../../../action/policy'
import './index.less'

const { TabPane } = Tabs
const { Group: RadioGroup } = Radio
const { Group: CheckboxGroup } = Checkbox

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    changeNotifyFrequency: bindActionCreators(changeNotifyFrequency, dispatch)
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class ParamsWarning extends React.Component {
  state = {}
  static propTypes = {
    history: PropTypes.object.isRequired,
    changeNotifyFrequency: PropTypes.func
  }

  componentDidMount() {
    this.getParamsWarningUsers()
    this.getParamsWarningConfig()
  }
  render() {
    let {
      users = [],
      notifyConfigList = []
    } = this.state
    const platNotification = notifyConfigList.find(n => n.notifyType === 'PLATFORM') || {}
    const emailNotification = notifyConfigList.find(n => n.notifyType === 'EMAIL') || {}
    let {
      notifyStatus = 'INACTIVE',
      notifyFrequency,
      notifyUsers = ''
    } = platNotification
    let {
      notifyStatus: emailNotifyStatus = 'INACTIVE',
      notifyFrequency: emailNotifyFrequency,
      notifyUsers: emailNotifyUsers = ''
    } = emailNotification
    // 通知对象是逗号隔开的字符串？！！
    notifyUsers = notifyUsers ? notifyUsers.split(',') : []
    emailNotifyUsers = emailNotifyUsers ? emailNotifyUsers.split(',') : []
    const indeterminate = notifyUsers.length > 0 && notifyUsers.length < users.length
    const checkAll = users.length !== 0 && notifyUsers.length === users.length
    const emailIndeterminate = emailNotifyUsers.length > 0 && emailNotifyUsers.length < users.length
    const emailCheckAll = users.length !== 0 && emailNotifyUsers.length === users.length
    const userOptions = users.map(user => {
      const { userId, loginName } = user
      return { value: userId.toString(), label: <span title={loginName}>{loginName}</span> }
    })
    return <LayoutRight className="no-bread-crumb" type={'tabs'}>
      <Tabs type="card" defaultActiveKey={'3'} className={'tabs-no-border scorecard-new'}
            activeKey={'3'}
            onChange={this.onFieldTypeChange}>
        <TabPane tab="主体维度" key={'1'} forceRender />
        <TabPane tab="决策结果" key={'2'} forceRender />
        <TabPane tab="预警通知" key={'3'} forceRender>
          <div className="notification">
            <div className="plat">
              <div className="header">
                <span>平台通知</span>
                <Switch checked={notifyStatus === 'ACTIVE'} size="small" style={{ width: 30 }}
                        onChange={this.activeChange} />
              </div>
              {
                notifyStatus === 'ACTIVE' ? <div className="content">
                  <div style={{ paddingBottom: 10 }}>
                    通知频率：
                    <RadioGroup value={notifyFrequency} onChange={this.notifyFrequencyChange}>
                      <Radio value="EVERY_TEN_MIN">10分钟</Radio>
                      <Radio value="O_CLOCK">整点</Radio>
                    </RadioGroup>
                  </div>
                  <div style={{ paddingBottom: 10 }}>
                    通知对象：
                    <Checkbox
                      indeterminate={indeterminate}
                      onChange={this.onCheckAllChange}
                      checked={checkAll}
                    >
                      全部
                    </Checkbox>
                    <br />
                    <CheckboxGroup
                      options={userOptions}
                      value={notifyUsers}
                      onChange={this.onCheckChange}
                    />
                  </div>
                </div> : null
              }
            </div>
            <div className="email">
              <div className="header">
                <span>邮件通知</span>
                <Switch checked={emailNotifyStatus === 'ACTIVE'} size="small" style={{ width: 30 }}
                        onChange={this.emailActiveChange} />
              </div>
              {
                emailNotifyStatus === 'ACTIVE' ? <div className="content">
                  <div style={{ paddingBottom: 10 }}>
                    通知频率：
                    <RadioGroup value={emailNotifyFrequency} onChange={this.emailNotifyFrequencyChange}>
                      <Radio value="O_CLOCK">整点</Radio>
                      <Radio value="MON_TO_FIR">8:30AM(周一~周五)</Radio>
                    </RadioGroup>
                  </div>
                  <div>
                    通知对象：
                    <Checkbox
                      indeterminate={emailIndeterminate}
                      onChange={this.onEmailCheckAllChange}
                      checked={emailCheckAll}
                    >
                      全部
                    </Checkbox>
                    <br />
                    <CheckboxGroup
                      options={userOptions}
                      value={emailNotifyUsers}
                      onChange={this.onEmailCheckChange}
                    />
                  </div>
                </div> : null
              }
            </div>
          </div>
        </TabPane>
      </Tabs>
    </LayoutRight>
  }

  activeChange = checked => {
    const { notifyConfigList = [] } = this.state
    notifyConfigList.forEach(n => {
      if (n.notifyType === 'PLATFORM') {
        n.notifyStatus = checked ? 'ACTIVE' : 'INACTIVE'
      }
    })
    this.setState({
      notifyConfigList
    }, () => {
      this.onSubmit()
    })
  }

  emailActiveChange = checked => {
    const { notifyConfigList = [] } = this.state
    notifyConfigList.forEach(n => {
      if (n.notifyType === 'EMAIL') {
        n.notifyStatus = checked ? 'ACTIVE' : 'INACTIVE'
      }
    })
    this.setState({
      notifyConfigList
    }, () => {
      this.onSubmit('EMAIL')
    })
  }

  notifyFrequencyChange = e => {
    const { notifyConfigList = [] } = this.state
    notifyConfigList.forEach(n => {
      if (n.notifyType === 'PLATFORM') {
        const notifyFrequency = e.target.value
        n.notifyFrequency = notifyFrequency
        this.props.changeNotifyFrequency({
          notifyFrequency
        })
      }
    })
    this.setState({
      notifyConfigList
    }, () => {
      this.onSubmit()
    })
  }

  emailNotifyFrequencyChange = e => {
    const { notifyConfigList = [] } = this.state
    notifyConfigList.forEach(n => {
      if (n.notifyType === 'EMAIL') {
        n.notifyFrequency = e.target.value
      }
    })
    this.setState({
      notifyConfigList
    }, () => {
      this.onSubmit('EMAIL')
    })
  }

  getParamsWarningUsers = () => {
    getParamsWarningUsers().then(res => {
      const { content: users = [] } = res
      this.setState({ users })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  getParamsWarningConfig = () => {
    getParamsWarningConfig().then(res => {
      const { content: notifyConfigList = [] } = res
      this.setState({ notifyConfigList })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onCheckAllChange = e => {
    const { notifyConfigList = [], users = [] } = this.state
    const checkAll = e.target.checked
    notifyConfigList.forEach(n => {
      if (n.notifyType === 'PLATFORM') {
        n.notifyUsers = checkAll ? users.map(user => user.userId).join(',') : ''
      }
    })
    this.setState({
      notifyConfigList
    }, () => {
      this.onSubmit()
    })
  }

  onCheckChange = checkedList => {
    const { notifyConfigList = [] } = this.state
    notifyConfigList.forEach(n => {
      if (n.notifyType === 'PLATFORM') {
        n.notifyUsers = checkedList.join(',')
      }
    })
    this.setState({
      notifyConfigList
    }, () => {
      this.onSubmit()
    })
  }

  onEmailCheckAllChange = e => {
    const { notifyConfigList = [], users = [] } = this.state
    const emailCheckAll = e.target.checked
    notifyConfigList.forEach(n => {
      if (n.notifyType === 'EMAIL') {
        n.notifyUsers = emailCheckAll ? users.map(user => user.userId).join(',') : ''
      }
    })
    this.setState({
      notifyConfigList
    }, () => {
      this.onSubmit('EMAIL')
    })
  }

  onEmailCheckChange = checkedList => {
    const { notifyConfigList = [] } = this.state
    notifyConfigList.forEach(n => {
      if (n.notifyType === 'EMAIL') {
        n.notifyUsers = checkedList.join(',')
      }
    })
    this.setState({
      notifyConfigList
    }, () => {
      this.onSubmit('EMAIL')
    })
  }

  onSubmit = (type = 'PLATFORM') => {
    const { notifyConfigList = [] } = this.state
    const platNotification = notifyConfigList.find(n => n.notifyType === 'PLATFORM') || {}
    const emailNotification = notifyConfigList.find(n => n.notifyType === 'EMAIL') || {}
    const data = type === 'PLATFORM' ? platNotification : emailNotification
    updateParamsWarningConfig(data).then(res => {
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onFieldTypeChange = e => {
    if (e === '1') {
      this.props.history.push({ pathname: '/policy/params' })
    }
    if (e === '2') {
      this.props.history.push({ pathname: '/policy/params/strategy-parameter' })
    }
  }
}
