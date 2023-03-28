import React from 'react'
import PropTypes from 'prop-types'
import { Button, Tabs } from 'antd'
import {
  DECISION_STRATEGY_NEW_BASICINFO,
  DECISION_STRATEGY_NEW_CONFIG
} from '../../../../common/decision_constant'
import BasicInfo from './basic_info'
import StrategyEditor from './strategy'
import './index.less'
import LayoutRight from '../../../../component/layout_right'

const { TabPane } = Tabs

export default class DecisionStrategy extends React.Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {} } = location
    const { tabKey, isView } = state
    this.state = {
      tabKey,
      isView,
      conditions: state
    }
  }

  static propTypes = {
    id: PropTypes.number,
    location: PropTypes.object,
    history: PropTypes.object.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const { location = {} } = nextProps
    const { state = {} } = location
    console.log('componentWillReceiveProps', nextProps)
    this.setState({ ...state })
  }

  render() {
    const isDisabled = this.isDisabled()
    const { state } = this.props.location
    const { id = 0, tabKey = DECISION_STRATEGY_NEW_BASICINFO, isView } = this.state
    console.log('tabKey', tabKey, state)
    return <LayoutRight breadCrumb={['策略配置', '策略集市', '决策流', isDisabled ? '新建决策流' : '编辑决策流']} type={'tabs'}>
      <Tabs type="card" className="tabs-no-border strategy-flow"
            activeKey={tabKey} onChange={this.tabChange} style={{ paddingBottom: isView ? 52 : 0 }}>
        <TabPane tab="基本信息" key={DECISION_STRATEGY_NEW_BASICINFO}>
          <BasicInfo {...state} setTreeId={this.setId} returnList={this.returnList} />
        </TabPane>
        <TabPane tab="决策流配置" disabled={isDisabled} key={DECISION_STRATEGY_NEW_CONFIG}>
          <div style={{ height: '100%', paddingTop: 0 }}>
            <StrategyEditor clean={tabKey !== DECISION_STRATEGY_NEW_CONFIG} id={id} {...state} />
          </div>
        </TabPane>
      </Tabs>
      {
        isView ? <div className="view-back">
          <Button type="primary" onClick={this.returnList} style={{ float: 'right' }}>退出</Button>
        </div> : null
      }
    </LayoutRight>
  }

  tabChange = (activeKey) => {
    this.setState({ tabKey: activeKey })
  }

  returnList = () => {
    this.props.history.push({ pathname: '/policy/bazaar/strategy-flow', state: this.state.conditions })
  }

  isDisabled = () => {
    const { state: { id = 0 } } = this.props.location
    return id <= 0
  }

  setId = (data) => {
    console.log('setId', data)
    const { redirect = false } = data
    this.setState({
      ...data
    }, () => {
      if (redirect) {
        this.props.history.push({
          pathname: '/policy/bazaar/strategy-flow/new',
          state: { ...data, tabKey: redirect }
        })
      }
    })
  }
}
