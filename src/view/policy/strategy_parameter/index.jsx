import React, { Fragment } from 'react'
import { Table, Tabs, Popover, Select, Button, notification } from 'antd'
import LayoutRight from '../../../component/layout_right'
import PropTypes from 'prop-types'
import connect from 'react-redux/es/connect/connect'
import { bindActionCreators } from 'redux'
import { getStrategyParameterList, getRiskGradeList, updateStrategyParameter } from '../../../action/policy'
import { getDecisionList } from '../../../action/decision'
import { RISK_GRADE } from '../../../common/constant'
import { CCIFormItem } from '../../../component/form'

const { TabPane } = Tabs

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    getDecisionList: bindActionCreators(getDecisionList, dispatch)
  }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class StrategyParameter extends React.Component {
  state = {}
  changeSelectMap = {}
  static propTypes = {
    history: PropTypes.object.isRequired,
    getDecisionList: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.getStrategyParameterList()
    this.getRiskGradeList()
  }

  render() {
    const { dataSrc = [], riskGrade = [], popoverVisible = {}, changeSelectMap = {} } = this.state
    const columns = [
      {
        title: '决策编码',
        key: 'decisionCode',
        dataIndex: 'decisionCode'
      },
      {
        title: '决策结果',
        key: 'decisionName',
        dataIndex: 'decisionName'
      }, {
        title: '风险级别',
        key: 'riskGrade',
        dataIndex: 'riskGrade',
        render: (text) => {
          const { css, name } = RISK_GRADE[text]
          return <span className={css}>{name}</span>
        }
      }, {
        title: '优先级',
        key: 'weight',
        dataIndex: 'weight'
      }, {
        title: '更新人',
        key: 'updateUser',
        dataIndex: 'updateUser'
      }, {
        title: '更新时间',
        key: 'updateTime',
        dataIndex: 'updateTime'
      }, {
        title: '操作',
        key: 'id',
        dataIndex: 'id',
        render: (text, data) => {
          const content = <Fragment>
            <CCIFormItem label={'风险等级'} colon>
              <Select defaultValue={data.riskGrade} value={changeSelectMap[text]}
                      onChange={(e) => this.changeSelect(e, text)}>
                {
                  riskGrade.map(item => {
                    const key = item.riskGrade
                    const { name } = RISK_GRADE[key]
                    return <Select.Option key={key} value={key}>
                      {name}
                    </Select.Option>
                  })
                }

              </Select>
            </CCIFormItem>
            <div style={{ textAlign: 'right' }}>
              <Button type="primary"
                      size={'small'}
                      onClick={() => this.updateStrategyParameter(text)}>保存</Button>
              <Button style={{ marginLeft: 10 }}
                      size={'small'}
                      onClick={() => {
                        this.changePopoverVisible(text, false)
                        this.changeSelect(data.riskGrade, text)
                      }}>取消</Button>
            </div>
          </Fragment>
          return <Popover placement="bottomRight" visible={popoverVisible[text]} content={content} trigger="click">
            <span className="operation-span" onClick={() => this.changePopoverVisible(text)}>
            编辑
          </span>
          </Popover>
        }
      }
    ]
    return <LayoutRight className="no-bread-crumb" type={'tabs'}>
      <Tabs type="card" defaultActiveKey={'2'} className={'tabs-no-border scorecard-new'}
            activeKey={'2'}
            onChange={this.onFieldTypeChange}>
        <TabPane tab="主体维度" key={'1'} forceRender />
        <TabPane tab="决策结果" key={'2'} forceRender>
          <Table locale={{ emptyText: '暂无数据' }} dataSource={dataSrc} columns={columns} pagination={false} />
        </TabPane>
        <TabPane tab="预警通知" key={'3'} forceRender />
      </Tabs>
    </LayoutRight>
  }

  changeSelect = (value, id) => {
    const { changeSelectMap = {} } = this.state
    changeSelectMap[id] = value
    this.setState({ changeSelectMap })
  }
  changePopoverVisible = (id, bol = true) => {
    const { popoverVisible = {} } = this.state
    popoverVisible[id] = bol
    this.setState({ popoverVisible })
  }
  getStrategyParameterList = () => {
    getStrategyParameterList().then(res => {
      const { content = [] } = res
      content.forEach(item => {
        item.key = item.id
        this.changeSelect(item.riskGrade, item.id)
      })
      console.log('getStrategyParameterList')
      this.setState({ dataSrc: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }
  getRiskGradeList = () => {
    getRiskGradeList().then(res => {
      const { content = [] } = res
      this.setState({ riskGrade: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }
  updateStrategyParameter = (id) => {
    const data = {
      id,
      riskGrade: this.state.changeSelectMap[id]
    }
    updateStrategyParameter(data).then(res => {
      this.changePopoverVisible(id, false)
      this.getStrategyParameterList()
      this.props.getDecisionList()
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }
  onFieldTypeChange = e => {
    if (e === '1') {
      this.props.history.push({ pathname: '/policy/params' })
    }
    if (e === '3') {
      this.props.history.push({ pathname: '/policy/params/warning' })
    }
  }
}
