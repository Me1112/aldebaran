import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal, notification, Tabs, Icon } from 'antd'
import DataDetail from './detail'
import DataReport from './report'
import classnames from 'classnames'
import './index.less'
import {
  getRestoreDataList,
  handleStatus,
  getTopOne,
  checkBeforeDownload
} from '../../../../../action/event'
import LayoutRight from '../../../../../component/layout_right'
import { DMS_PREFIX } from '../../../../../common/constant'
import { FLOW_TYPES } from '../../../../../common/decision_constant'

const INSPECT_AUDIT_RESTORE = 'INSPECT_AUDIT_RESTORE'
const { TabPane } = Tabs
const { confirm } = Modal
const { SCORE_CARD } = FLOW_TYPES

export default class TaskResult extends Component {
  constructor(props) {
    super(props)
    const { location = {} } = props
    const { state = {}, pathname } = location
    this.state = {
      pathname,
      ...state
    }
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object
  }

  componentDidMount() {
    // TODO 时间返回接口对接
    console.log(this.props.history)
    // this.getRestoreDataList()
    // const { operation, eventId } = this.state
    // if (operation === 'AUDIT') {
    //   getPolicyList({ eventId }).then(data => {
    //     const { content: policyList = [] } = data
    //     this.setState({ policyList })
    //   })
    // }
  }

  componentWillReceiveProps(nextProps) {
    const { location = {} } = nextProps
    const { state = {} } = location
    this.setState({ ...state })
  }

  render() {
    const {
      tabKey = 'DATA_DETAIL', id, taskId, scenarioValue, strategyId, strategyType, taskDataType, breadCrumb = [],
      conditions = {}, initState = {}, downloadGuideVisible = false, count = 0, fileName = ''
    } = this.state
    const taskInfo = { taskId: id || taskId, scenarioValue, strategyId, strategyType, taskDataType, conditions }
    const tabName = taskDataType === 'OFFLINE_DATA' ? '数据明细' : '差异明细'
    console.log('DATA_DETAIL', this.state)
    return (
      <Fragment>
        <LayoutRight className="task-result" breadCrumb={breadCrumb}>
          <div style={{ height: `calc(100% - 32px)`, overflowY: 'auto' }}>
            <Tabs type="card" activeKey={tabKey} onChange={this.tabChange}
                  className={classnames('tabs-no-border', { 'report-tab-selected': tabKey === 'DATA_REPORT' })}>
              <TabPane tab={tabName} key="DATA_DETAIL">
                <DataDetail taskInfo={taskInfo} breadCrumb={breadCrumb} initState={initState} />
              </TabPane>
              <TabPane tab="分析报表" key="DATA_REPORT">
                <DataReport taskInfo={taskInfo} changeInterval={this.changeInterval} changeTab={this.changeTab} />
              </TabPane>
            </Tabs>
          </div>
          <div className="event-mark">
            <Button type="primary" onClick={this.exportData} style={{ marginRight: 10 }}>导出</Button>
            <Button type="default" onClick={this.returnList}>退出</Button>
          </div>
        </LayoutRight>
        <Modal
          title=""
          width={500}
          wrapClassName="download-modal-wrap"
          visible={downloadGuideVisible}
          onCancel={this.onCancel}
          footer={<Button type="primary" onClick={this.onCancel}>确定</Button>}
        >
          本次共导出{count}条记录，<br />
          文件名为：{fileName}，<br />
          请稍后点击“{<Icon type="download" className="primary-color" />}”在下载中心进行下载
        </Modal>
      </Fragment>
    )
  }

  changeInterval = interval => {
    this.setState({
      interval
    })
  }

  loadNextRow = () => {
    getTopOne().then(data => {
      const { content } = data
      if (!content) {
        confirm({
          title: '预警信号已处理完毕，系统自动退出审核功能。',
          content: '',
          okText: '知道了',
          okType: 'primary',
          className: 'cancel-none',
          onOk: async () => {
            this.returnList()
          }
        })
      } else {
        const { breadCrumb = [], isTesting = false, pathname } = this.state
        const breadCrumbLength = breadCrumb.length
        const { eventId } = content
        if (breadCrumbLength > 0) {
          breadCrumb[breadCrumbLength - 1] = `审核(${eventId})`
        }
        getRestoreDataList({
          eventId,
          isTesting
        }).then(data => {
          const { content: { eventDetailBlocks: restoreData = [] } = {} } = data
          const { state = {} } = this.props.location
          this.setState({
            ...content,
            restoreData,
            loading: false,
            loadingNext: false,
            tabKey: INSPECT_AUDIT_RESTORE
          }, () => {
            this.props.history.push({ pathname, state: { ...state, ...content, breadCrumb } })
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
      }
    })
  }

  handleStatus = (next = false) => {
    const { status = 'CORRECT', id, eventId, policyList = [] } = this.state
    this.setState({ loading: !next, loadingNext: next }, () => {
      handleStatus({ handleStatus: status, id, eventId, riskPolicy: this.changedDecisionResult }).then(data => {
        this.setState({
          status: 'CORRECT',
          changedDecisionResult: policyList[0].value
        }, () => {
          if (next) {
            this.loadNextRow()
          } else {
            this.returnList()
          }
        })
      }).catch(data => {
        const { content = {} } = data
        notification.warning(content)
      })
    })
  }

  returnList = () => {
    const { backUrl = '/risk/task/inspect', conditions = {} } = this.state
    this.props.history.push({ pathname: backUrl, state: { ...conditions } })
  }

  tabChange = (activeKey) => {
    this.setState({ tabKey: activeKey, initState: {} })
  }

  changeTab = (initState = {}) => {
    this.setState({
      tabKey: 'DATA_DETAIL',
      initState
    })
  }

  exportData = () => {
    const { tabKey = 'DATA_DETAIL', id, taskId, taskDataType, strategyId, strategyType, interval = 50 } = this.state
    const realId = id || taskId
    let url = ''
    if (tabKey === 'DATA_DETAIL') {
      checkBeforeDownload(realId).then(data => {
        const { content: { count = 0, fileName = '', downloadNow = false } = {} } = data
        if (downloadNow) {
          if (taskDataType === 'OFFLINE_DATA') {
            if (strategyType === SCORE_CARD) {
              url = `/verify-result/offline/score-card/list/export?taskId=${realId}`
            } else {
              url = `/verify-result/offline/list/export?taskId=${realId}`
            }
          } else {
            if (strategyType === SCORE_CARD) {
              url = `/verify-result/online/score-card/list/export?taskId=${realId}`
            } else {
              url = `/verify-result/online/list/export?taskId=${realId}`
            }
          }
          if (url) {
            window.open(`/${DMS_PREFIX}${url}`)
          }
        } else {
          this.setState({
            count,
            fileName,
            downloadGuideVisible: true
          })
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warning(content)
      })
    } else {
      if (taskDataType === 'OFFLINE_DATA') {
        if (strategyType === SCORE_CARD) {
          url = `/verify-result/offline/score-card/report/export?taskId=${realId}&interval=${interval}`
        } else {
          url = `/verify-result/offline/report/export?taskId=${realId}&strategyId=${strategyId}&strategyType=${strategyType}&count=99999`
        }
      } else {
        if (strategyType === SCORE_CARD) {
          url = `/verify-result/online/score-card/report/export?taskId=${realId}&interval=${interval}`
        } else {
          url = `/verify-result/online/report/export?taskId=${realId}`
        }
      }
      if (url) {
        window.open(`/${DMS_PREFIX}${url}`)
      }
    }
  }

  onCancel = () => {
    this.setState({
      downloadGuideVisible: false
    })
  }
}
