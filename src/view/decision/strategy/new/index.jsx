import React from 'react'
import PropTypes from 'prop-types'
import { Button, Tabs } from 'antd'
import {
  DECISION_STRATEGY_NEW_BASICINFO,
  DECISION_STRATEGY_NEW_NODEINFO,
  DECISION_STRATEGY_NEW_CONFIG
} from '../../../../common/decision_constant'
import BasicInfo from './basic_info'
import NodeInfo from './node_info'
import StrategyEditor from './strategy'
import './index.less'
import LayoutRight from '../../../../component/layout_right'

const { TabPane } = Tabs

export default class DecisionStrategy extends React.Component {
  constructor(props) {
    super(props)
    const { id = 0, location = {} } = props
    const { state = {} } = location
    this.state = {
      id, ...state
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
    const { state = {} } = this.props.location
    const { id, tabKey = DECISION_STRATEGY_NEW_BASICINFO, isView } = this.state
    let breadCrumb = ['策略配置', '策略集市', '新建决策树']
    if (id) {
      breadCrumb[2] = '编辑决策树'
    }
    console.log(tabKey)
    return <LayoutRight breadCrumb={breadCrumb} type={'tabs'}>
      <Tabs type="card" className="tabs-no-border" activeKey={tabKey} onChange={this.tabChange}
            style={{ paddingBottom: isView ? 52 : 0 }}>
        <TabPane tab="基本信息" key={DECISION_STRATEGY_NEW_BASICINFO}>
          <BasicInfo {...state} newId={id} setTreeId={this.setId} returnList={this.returnList} />
        </TabPane>
        <TabPane tab="策略配置" disabled={isDisabled} key={DECISION_STRATEGY_NEW_CONFIG}>
          {
            tabKey === DECISION_STRATEGY_NEW_CONFIG
              ? <StrategyEditor clean={tabKey !== DECISION_STRATEGY_NEW_CONFIG} {...state} id={id} /> : null
          }
        </TabPane>
        <TabPane tab="节点信息" disabled={isDisabled} key={DECISION_STRATEGY_NEW_NODEINFO}>
          <NodeInfo {...state} id={id} visible={tabKey === DECISION_STRATEGY_NEW_NODEINFO} />
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
    this.props.history.push({ pathname: '/policy/bazaar/strategy' })
  }

  isDisabled = () => {
    const { id } = this.state
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
          pathname: '/policy/bazaar/strategy/new',
          state: { ...data, tabKey: DECISION_STRATEGY_NEW_CONFIG }
        })
      }
    })
  }
}
