import React from 'react'
import PropTypes from 'prop-types'
import { Button, Tabs } from 'antd'
import BasicInfo from './basic_info'
import Config from './config'
import './index.less'
import LayoutRight from '../../../component/layout_right'

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
    this.setState({ ...state })
  }

  render() {
    const isDisabled = this.isDisabled()
    const { state } = this.props.location
    const { isView = false } = state
    const { id, tabKey = 'basicInfo' } = this.state
    return <LayoutRight breadCrumb={['策略配置', '策略集市', '评分卡', '新建评分卡']} type={'tabs'}>
      <Tabs type="card" className="tabs-no-border scorecard-new" activeKey={tabKey}
            onChange={this.tabChange} style={{ paddingBottom: isView ? 52 : 0 }}>
        <TabPane tab="基本信息" key={'basicInfo'}>
          <BasicInfo {...state} newId={id} setTreeId={this.setId} />
        </TabPane>
        <TabPane tab="评分卡配置" disabled={isDisabled} key={'config'}>
          <Config {...state} id={id} />
        </TabPane>
      </Tabs>
      {
        isView ? <div className="view-back">
          <Button type="primary" onClick={this.viewBack} style={{ float: 'right' }}>退出</Button>
        </div> : null
      }
    </LayoutRight>
  }

  viewBack = () => {
    this.props.history.push({ pathname: '/policy/bazaar/list' })
  }

  tabChange = (activeKey) => {
    this.setState({ tabKey: activeKey })
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
          pathname: '/policy/bazaar/list/new',
          state: { ...data, tabKey: 'config' }
        })
      }
    })
  }
}
