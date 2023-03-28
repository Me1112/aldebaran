import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table, notification, Tabs, Button, Modal } from 'antd'
import {
  getRelativeVersionList,
  relativeVersionRevert,
  versionCompare
} from '../../../../action/rule'
import { formatDate } from '../../../../util/index'
import LayoutRight from '../../../../component/layout_right'
import VersionCompare from '../../../../component/version_compare'
import './index.less'
import { STRATEGY_STATUS } from '../../../../common/case'

const { TabPane } = Tabs
const confirm = Modal.confirm

export default class Job extends Component {
  state = {}

  static propTypes = {
    history: PropTypes.any.isRequired,
    location: PropTypes.any.isRequired
  }

  componentDidMount() {
    const { state = {} } = this.props.location
    this.setState({
      ...state
    }, () => {
      this.getRelativeVersionList()
    })
  }

  render() {
    const {
      dataSource = [],
      ruleSetId = '',
      name = '',
      strategyStatus: rulesetStrategyStatus = '',
      isView = false,
      versionCompareVisible = false,
      comparisonResult
    } = this.state
    const columns = [
      {
        title: '',
        dataIndex: 'isOnlineOrUsed',
        key: 'isOnlineOrUsed',
        width: 30,
        render: (text, record) => {
          const { strategyStatus } = record
          return ['ONLINE', 'USED', 'OFFLINE_ING'].indexOf(strategyStatus) !== -1 ? <div className={'running-status'}>线</div> : null
        }
      }, {
        title: '规则集名称',
        dataIndex: 'name',
        key: 'name',
        width: '25%',
        render: text => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '版本号',
        dataIndex: 'version',
        key: 'version',
        width: '20%'
      }, {
        title: '当前状态',
        dataIndex: 'strategyStatus',
        key: 'strategyStatus',
        width: '20%',
        render: text => {
          return STRATEGY_STATUS[text]
        }
      }, {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: '20%',
        render: text => {
          return formatDate(text)
        }
      }]
    if (['ONLINE', 'USED'].indexOf(rulesetStrategyStatus) !== -1) {
      columns.push({
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 70,
        render: (text, record) => {
          const { strategyStatus } = record
          return strategyStatus === 'OFFLINE'
            ? <span className="operation-span" onClick={() => this.onVersionRevertClick(record)}>回退</span> : null
        }
      })
    }

    let breadCrumb = ['策略配置', '策略集市', '规则集', !isView ? '编辑规则集' : `查看(规则集${name})`]

    return (
      <LayoutRight breadCrumb={breadCrumb} type={'tabs'}>
        <Tabs type="card" defaultActiveKey={'VERSION'} className={'tabs-no-border scorecard-new'}
              activeKey={'VERSION'}
              onChange={this.onChangeTab} style={{ paddingBottom: isView ? 52 : 0 }}>
          <TabPane tab="基本信息" key={'INFO'} forceRender />
          <TabPane tab="规则配置" key={'CONFIG'} forceRender />
          <TabPane tab="关联版本" key={'VERSION'} forceRender>
            {
              dataSource.length > 0 ? <div className="region-zd">
                <Button type="primary" onClick={this.onVersionCompareClick}>版本对比</Button>
              </div> : null
            }
            <div style={{ height: dataSource.length > 0 ? 'calc(100% - 52px)' : '100%', overflowY: 'scroll' }}>
              <Table rowKey="rulesetId" className="table-td-no-auto" columns={columns} dataSource={dataSource}
                     locale={{ emptyText: '暂无数据' }} pagination={false} />
            </div>
          </TabPane>
        </Tabs>
        {
          isView ? <div className="view-back">
            <Button type="primary" onClick={this.viewBack}>退出</Button>
          </div> : null
        }
        <VersionCompare visible={versionCompareVisible} versions={dataSource}
                        currentRuleSet={{ ruleSetId, name }} comparisonResult={comparisonResult}
                        versionCompare={this.versionCompare} onCancel={this.onVersionCompareCancel} />
      </LayoutRight>
    )
  }

  onVersionCompareCancel = () => {
    this.setState({
      versionCompareVisible: false,
      comparisonResult: undefined
    })
  }

  onVersionCompareClick = () => {
    this.setState({
      versionCompareVisible: true
    })
  }

  versionCompare = data => {
    versionCompare(data).then(res => {
      const { content: comparisonResult = {} } = res
      this.setState({
        comparisonResult
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onVersionRevertClick = record => {
    const { rulesetId: id = '', version = '' } = record
    confirm({
      title: `是否确认将线上版本回退至${version}版本?`,
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        relativeVersionRevert({ id }).then(() => {
          this.getRelativeVersionList()
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
      }
    })
  }

  onChangeTab = (key) => {
    if (key === 'INFO') {
      this.toRuleList()
    }
    if (key === 'CONFIG') {
      this.toRuleConfig()
    }
  }

  toRuleList = () => {
    this.props.history.push({ pathname: '/policy/bazaar/collection/new', state: { ...this.state } })
  }

  toRuleConfig = () => {
    this.props.history.push({ pathname: '/policy/bazaar/collection/config', state: { ...this.state } })
  }

  getRelativeVersionList = () => {
    const { ruleSetId = '' } = this.state
    getRelativeVersionList(ruleSetId).then(res => {
      const { content: dataSource = [] } = res
      this.setState({ dataSource })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  viewBack = () => {
    this.props.history.push({ pathname: '/policy/bazaar/collection' })
  }
}
