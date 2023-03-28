import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import { Button, Input, notification, Select } from 'antd'
import { CCIFormItem } from '../../form'
import './index.less'
import {
  getStreamNodeInfo,
  updateDecisionMakingNode
} from '../../../action/decision'

const Option = Select.Option

function mapStateToProps(state) {
  const { decision = Map({}) } = state
  const { riskPolicyList = [] } = decision.toJS()
  return { riskPolicyList }
}

function mapDispatchToProps(dispatch) {
  return {}
}

class DecisionMakingNodeInfo extends React.Component {
  state = {}

  static propTypes = {
    riskPolicyList: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    refreshNodes: PropTypes.func.isRequired,
    isView: PropTypes.any
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { data } = nextProps
    this.setState({ ...data })
  }

  render() {
    const { riskPolicyList = [], isView } = this.props
    const { nodeName, edgeEditDtoList = [] } = this.state
    return (
      <div className={'decision-mack-info'}>
        <h4>决策节点</h4>
        <CCIFormItem label={'节点名称'} colon labelStyle={{ width: '80px' }}>
          <Input style={{ width: '170px' }} value={nodeName} placeholder="最多20个字符" maxLength="20"
                 onChange={e => this.setState({ nodeName: e.target.value })} disabled={isView} />
        </CCIFormItem>
        {
          (edgeEditDtoList || []).map((item, index) => {
            let { id: key, edgeName, streamCondition = {} } = item
            if (!streamCondition) {
              streamCondition = {}
            }
            const { operator, value } = streamCondition
            return <div key={key}>
              <div className="title">
                分支{index + 1}
              </div>
              <CCIFormItem label={'分支名称'} colon labelStyle={{ width: '80px' }}>
                <Input style={{ width: '170px' }} value={edgeName} onChange={(e) => {
                  this.changeInput(e.target.value, key)
                }} placeholder="最多20个字符" maxLength="20" disabled={isView} />
              </CCIFormItem>
              <CCIFormItem label={'条件配置'} colon labelStyle={{ width: '80px' }}>
                <Select className={'left-select'} value={operator} style={{ width: 170, marginBottom: 10 }}
                        onChange={(e) => this.changeSelect(e, key, 'operator')} disabled={isView}>
                  <Option value="BELONG">属于</Option>
                  <Option value="NOT_BELONG">不属于</Option>
                </Select>
                <Select className={'right-select'} value={value ? value.split(',') : []} style={{ width: 170 }}
                        mode="multiple" onChange={(e) => this.changeSelect(e, key, 'value')} disabled={isView}>
                  {
                    riskPolicyList.map(riskPolicy => {
                      const { decisionName, decisionCode } = riskPolicy
                      return <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>
                    })
                  }
                </Select>
              </CCIFormItem>
            </div>
          })
        }
        {
          isView ? null : <CCIFormItem label={' '}>
            <Button type="primary" onClick={this.save}>保存</Button>
          </CCIFormItem>
        }
      </div>
    )
  }

  save = () => {
    const { nodeName, edgeEditDtoList = [], id } = this.state
    let bol = false
    if (!nodeName) {
      notification.warn({ message: '请输入名称' })
      return
    }
    edgeEditDtoList.forEach(item => {
      const { edgeName, streamCondition } = item
      if (!edgeName || !streamCondition) {
        bol = true
      }
      if (streamCondition) {
        const { value, operator } = streamCondition
        if (!value || !operator) {
          bol = true
        }
      }
    })
    if (bol) {
      notification.warn({ message: '请补充完整分支信息' })
      return
    }
    const data = {
      decisionNodeId: id,
      decisionNodeName: nodeName,
      edgeEditDtoList: edgeEditDtoList
    }
    updateDecisionMakingNode(data).then(res => {
      getStreamNodeInfo(id).then(res => {
        this.props.refreshNodes()
        notification.success({ message: '决策节点配置成功' })
        const { content = {} } = res
        this.setState({ ...content })
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  changeInput = (value, id) => {
    const { edgeEditDtoList = [] } = this.state
    edgeEditDtoList.forEach(item => {
      if (item.id === id) {
        item.edgeName = value
      }
    })
    this.setState({ edgeEditDtoList })
  }

  changeSelect = (value, id, type) => {
    const { edgeEditDtoList = [] } = this.state
    edgeEditDtoList.forEach(item => {
      if (item.id === id) {
        if (!item.streamCondition) {
          item.streamCondition = {}
        }
        item.streamCondition[type] = type === 'value' ? value.join(',') : value
      }
    })
    this.setState({ edgeEditDtoList })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DecisionMakingNodeInfo)
