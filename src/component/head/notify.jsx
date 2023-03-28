import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Popover, Icon, notification } from 'antd'
import { RISK_GRADE } from '../../common/constant'
import { markNotifyInfo, changeNotifyInfo } from '../../action'
import './index.less'
import { Map } from 'immutable'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

function mapStateToProps(state) {
  const { common = Map({}) } = state
  const { notifyInfo = {} } = common.toJS()
  return {
    notifyInfo
  }
}

function mapDispatchToProps(dispatch) {
  return {
    changeNotifyInfo: bindActionCreators(changeNotifyInfo, dispatch)
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Notify extends Component {
  state = {}

  static propTypes = {
    notifyInfo: PropTypes.object,
    changeNotifyInfo: PropTypes.func
  }

  render() {
    const {
      notifyInfo: {
        count = 0,
        details = []
      } = {}
    } = this.props
    const {
      visible
    } = this.state
    return (
      <div className="notify-info">
        <Popover placement="bottom"
                 visible={visible}
                 onVisibleChange={this.onVisibleChange}
                 overlayClassName="notify-popover"
                 content={
                   <div className="detail">
                     <div className="title">
                       消息通知
                     </div>
                     {
                       details.length > 0 ? <div className="content">
                         {
                           details.map(detail => {
                             const { id = '', eventId = '', warningNo = '', riskGrade = '' } = detail
                             const { name = '', css = '' } = RISK_GRADE[riskGrade] || {}
                             return <div key={id} className="item">
                               <Icon type="sound" style={{ marginRight: 5 }} />
                               <Link to={{
                                 pathname: `/risk/task/warning/detail`,
                                 state: {
                                   backUrl: '/risk/task/warning',
                                   conditions: {},
                                   ...detail,
                                   isTesting: false,
                                   breadCrumb: ['风险分析', '任务中心', '预警审核', `审核(${eventId})`],
                                   operation: 'AUDIT'
                                 }
                               }} className={'i-cursor'}>{warningNo}</Link>,
                               <span className={`${css} no-before`}
                                     style={{ marginRight: 20 }}>{name}</span>
                             </div>
                           })
                         }
                       </div> : <div className="notify-empty">
                         <div className="image" />
                       </div>
                     }
                   </div>
                 } trigger="click">
          <div className="alarm-info">
            <Icon type="bell" />
            <div className="count">
                <span>
                  {
                    count > 99 ? '99+' : count
                  }
                </span>
            </div>
          </div>
        </Popover>
      </div>
    )
  }

  onVisibleChange = visible => {
    const {
      notifyInfo: {
        count = 0
      }
    } = this.props
    this.setState({
      visible
    }, () => {
      if (!visible && count > 0) {
        markNotifyInfo().then(() => {
          this.props.changeNotifyInfo({
            notifyInfo: {}
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
      }
    })
  }
}
