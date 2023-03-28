import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import classnames from 'classnames'
import { Row, Col, Input, Select, Radio, notification, Modal, InputNumber, Button, Table } from 'antd'
import { FLOW_TYPES, DECISION_OPERATOR } from '../../../common/decision_constant'
import { updateResourceNode } from '../../../action/system'
import './index.less'
import { getStreamNodeInfo } from '../../../action/decision'
import { getEaStrategies } from '../../../action/external_access'
import { buildUrlParamNew, noop } from '../../../util'

const { Option } = Select
const { Group: RadioGroup } = Radio
const { RESOURCE, RULE_SET, D_TREE, SCORE_CARD } = FLOW_TYPES

const operatorOptions = Object.keys(DECISION_OPERATOR).map(operator => {
  return <Option key={operator} value={operator}>{DECISION_OPERATOR[operator]}</Option>
})

function mapStateToProps(state) {
  const { decision = Map({}) } = state
  const { riskPolicyList = [], riskPolicyMap = {} } = decision.toJS()
  return { riskPolicyList, riskPolicyMap }
}

function mapDispatchToProps(dispatch) {
  return {}
}

class ResourceNodeInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: props.id,
      data: props.data
    }
  }

  static propTypes = {
    id: PropTypes.number.isRequired,
    businessLineId: PropTypes.number.isRequired,
    data: PropTypes.object.isRequired,
    refreshNodes: PropTypes.func.isRequired,
    riskPolicyList: PropTypes.array.isRequired,
    riskPolicyMap: PropTypes.object.isRequired,
    isView: PropTypes.any
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { data = {} } = nextProps
    if (data !== this.props.data) {
      this.setState({
        data
      }, () => {
        // 获取默认资源列表
        const { nodeType = '' } = data
        if (nodeType !== RESOURCE) {
          getEaStrategies(buildUrlParamNew({
            strategyType: nodeType,
            businessLineId: this.props.businessLineId
          })).then((data) => {
            this.setState({
              resourceList: data.content || []
            })
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        }
      })
    }
  }

  render() {
    const {
      data: {
        nodeName = '',
        nodeType = '',
        ruleSetIdList = [],
        decisionTreeIdList = [],
        scoreCardId = '',
        decisionResultType = '',
        decisionConfigDtoList = []
      } = {},
      resourceList = [], decisionVisible = false, record = {}, isEdit = false
    } = this.state
    const { riskPolicyList = [], riskPolicyMap = {}, isView } = this.props
    const { condition = [], gate = 'EMPTY', decision = '' } = record
    const { operator, value } = condition[0] || {}
    const { operator: operatorOther, value: valueOther } = condition[1] || {}
    const resourceOptions = resourceList.map(resource => {
      const { strategyId = '', strategyName = '' } = resource
      return <Option key={strategyId} value={strategyId}>{strategyName}</Option>
    })
    const columns = [
      {
        title: '条件',
        dataIndex: 'condition',
        key: 'condition',
        render: text => {
          return <span className="text-overflow" title={text}
                       style={{ display: 'inline-block', width: 140 }}>{text}</span>
        }
      },
      {
        title: '风险决策',
        dataIndex: 'decision',
        key: 'decision',
        render: text => {
          const { decisionName = '' } = riskPolicyMap[text] || {}
          return <span style={{ display: 'inline-block', width: 50 }}>{decisionName}</span>
        }
      }
    ]
    if (!isView) {
      columns.push({
        title: '',
        dataIndex: 'operator',
        key: 'operator',
        width: 30,
        render: (title, record, index) => {
          return <i className="anticon anticon-delete" onClick={e => this.deleteDto(e, index)} />
        }
      })
    }

    const decisionConfigs = decisionConfigDtoList === null ? [] : decisionConfigDtoList
    const dataSource = decisionConfigs.map((d, index) => {
      const { gate, decision, condition } = d
      return { key: index, condition: this.getConditionDesc(condition, gate), decision }
    })

    return (
      <Fragment>
        <Row className="resource-config">
          <Row className="title">资源节点配置</Row>
          <Row className="item">
            <Col span={8}>节点名称:</Col>
            <Col span={16}>
              <Input placeholder="不超过20个字符" maxLength={20} value={nodeName} onChange={this.nodeNameChange}
                     disabled={isView} />
            </Col>
          </Row>
          <Row className="item">
            <Col span={8}>资源类型:</Col>
            <Col span={16}>
              <Select value={nodeType === RESOURCE ? undefined : nodeType} placeholder="请选择资源类型"
                      onChange={this.resourceTypeChange} style={{ width: '100%' }} disabled={isView}>
                <Option value={RULE_SET}>规则集</Option>
                <Option value={D_TREE}>决策树</Option>
                <Option value={SCORE_CARD}>评分卡</Option>
              </Select>
            </Col>
          </Row>
          <Row className="item">
            <Col span={8}>资源列表:</Col>
            <Col span={16}>
              {
                nodeType === 'SCORE_CARD' ? <Select showSearch
                                                    optionFilterProp="children"
                                                    style={{ width: '100%' }}
                                                    placeholder="请选择资源列表"
                                                    value={scoreCardId !== null ? scoreCardId : ''}
                                                    onChange={this.resourceListChange} disabled={isView}>
                  {resourceOptions}
                </Select> : <Select mode="multiple"
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    placeholder="请选择资源列表"
                                    value={nodeType === RULE_SET ? (ruleSetIdList !== null ? ruleSetIdList : []) : nodeType === D_TREE
                                      ? (decisionTreeIdList !== null ? decisionTreeIdList : []) : []}
                                    onChange={this.resourceListChange} disabled={isView}>
                  {resourceOptions}
                </Select>
              }
            </Col>
          </Row>
          <Row className="item">
            <Col span={8}>决策方式:</Col>
            <Col span={16}>
              <RadioGroup disabled value={decisionResultType}>
                <Radio value="BAD">最坏匹配</Radio>
                <Radio value="CUSTOM">自定义</Radio>
              </RadioGroup>
            </Col>
          </Row>
          {
            nodeType === SCORE_CARD ? <Fragment>
              <Row className="item">
                <Col span={8}>决策配置:</Col>
                <Col span={16}>
                  <div className={classnames('plus', { 'ant-input-disabled': isView })}
                       onClick={isView ? noop : this.addRiskDecision}>
                    <i className="anticon anticon-plus" />添加风险决策
                  </div>
                </Col>
              </Row>
              {
                dataSource.length ? <Row style={{ maxHeight: 370, overflowY: 'auto', overflowX: 'hidden' }}>
                  <Table columns={columns}
                         dataSource={dataSource}
                         onRow={(record, index) => {
                           return {
                             onClick: () => {
                               if (!isView) {
                                 this.setState({
                                   isEdit: true,
                                   editIndex: index,
                                   record: decisionConfigDtoList[index],
                                   decisionVisible: true
                                 })
                               }
                             }
                           }
                         }}
                         pagination={false} />
                </Row> : null
              }
            </Fragment> : null
          }
          {
            isView ? null : <Button type="primary" style={{ marginLeft: 100, marginTop: 20 }}
                                    onClick={this.onDecisionSave}>保存</Button>
          }
        </Row>
        <Modal
          title={`${isEdit ? '编辑' : '新建'}风险决策`}
          wrapClassName="edit-confirm-modal"
          visible={decisionVisible}
          okText="确认"
          cancelText="取消"
          onCancel={this.onDecisionCancel}
          onOk={this.onDecisionOk}
        >
          <Row>
            <Row gutter={10} style={{ paddingBottom: 10 }}>
              <Col span={4}>
                条件:
              </Col>
              <Col span={4}>
                <Select style={{ width: '100%' }}
                        placeholder="请选择资源列表"
                        value={gate}
                        onChange={this.onGateChange}>
                  <Option value="AND">且</Option>
                  <Option value="OR">或</Option>
                  <Option value="EMPTY">无</Option>
                </Select>
              </Col>
              <Col span={16}>
                <Row gutter={10}>
                  <Col span={12}>
                    <Select style={{ width: '100%' }}
                            placeholder="请选择操作类型"
                            value={operator}
                            onChange={e => this.onConditionOperatorChange(e, 0)}>
                      {operatorOptions}
                    </Select>
                  </Col>
                  <Col span={12}>
                    <InputNumber value={value} style={{ width: '100%' }}
                                 onChange={e => this.onConditionValueChange(e, 0)} />
                  </Col>
                </Row>
                {
                  ['AND', 'OR'].indexOf(gate) !== -1 ? <Row gutter={10} style={{ paddingTop: 10 }}>
                    <Col span={12}>
                      <Select style={{ width: '100%' }}
                              placeholder="请选择操作类型"
                              value={operatorOther}
                              onChange={e => this.onConditionOperatorChange(e, 1)}>
                        {operatorOptions}
                      </Select>
                    </Col>
                    <Col span={12}>
                      <InputNumber value={valueOther} style={{ width: '100%' }}
                                   onChange={e => this.onConditionValueChange(e, 1)} />
                    </Col>
                  </Row> : null
                }
              </Col>
            </Row>
            <Row gutter={10}>
              <Col span={4}>
                风险决策:
              </Col>
              <Col span={12}>
                <Select style={{ width: '100%' }}
                        placeholder="请选择风险决策"
                        value={decision}
                        onChange={this.onDecisionChange}>
                  {
                    riskPolicyList.map(riskPolicy => {
                      const { decisionName, decisionCode } = riskPolicy
                      return (
                        <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>
                      )
                    })
                  }
                </Select>
              </Col>
            </Row>
          </Row>
        </Modal>
      </Fragment>
    )
  }

  nodeNameChange = e => {
    const value = e.target.value
    const { data = {} } = this.state
    this.setState({
      data: { ...data, nodeName: value }
    })
  }

  // 联动获取资源列表
  resourceTypeChange = value => {
    const { data = {} } = this.state
    this.setState({
      data: { ...data, nodeType: value, decisionResultType: value === SCORE_CARD ? 'CUSTOM' : 'BAD' }
    }, () => {
      getEaStrategies(buildUrlParamNew({
        strategyType: value,
        businessLineId: this.props.businessLineId
      })).then((data) => {
        this.setState({
          resourceList: data.content || []
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    })
  }

  resourceListChange = value => {
    const { data = {} } = this.state
    const { nodeType } = data
    const resourceListField = nodeType === RULE_SET ? 'ruleSetIdList' : nodeType === D_TREE ? 'decisionTreeIdList' : 'scoreCardId'
    this.setState({
      data: { ...data, [resourceListField]: value }
    })
  }

  addRiskDecision = () => {
    this.setState({
      isEdit: false,
      decisionVisible: true,
      record: { condition: [{}, {}], decision: '', gate: 'EMPTY' }
    })
  }

  onDecisionCancel = () => {
    this.setState({
      decisionVisible: false
    })
  }

  onDecisionOk = () => {
    let { record = {}, data = {}, isEdit = false, editIndex = 0 } = this.state
    const { condition = [{}, {}], decision = '', gate = 'EMPTY' } = record
    const { operator, value } = condition[0] || {}
    const { operator: operatorOther, value: valueOther } = condition[1] || {}
    if (!gate || !decision || (gate === 'EMPTY' && (!operator || value === undefined)) ||
      (['AND', 'OR'].indexOf(gate) !== -1 && (!operatorOther || !valueOther))) {
      notification.warning({ message: '请将决策配置信息填写完整' })
    } else {
      if (data.decisionConfigDtoList === null) {
        data = { ...data, decisionConfigDtoList: [] }
      }
      const { decisionConfigDtoList = [] } = data
      if (!isEdit) {
        decisionConfigDtoList.push(record)
      } else {
        decisionConfigDtoList[editIndex] = record
      }
      this.setState({
        data: { ...data, decisionConfigDtoList }
      }, () => {
        this.onDecisionCancel()
      })
    }
  }

  onGateChange = value => {
    const { record = {} } = this.state
    const { condition = [] } = record
    if (['AND', 'OR'].indexOf(value) !== -1 && condition.length === 1) {
      condition.push({})
    }
    this.setState({
      record: { ...record, gate: value }
    })
  }

  onConditionOperatorChange = (value, index) => {
    const { record = {} } = this.state
    const { condition = [] } = record
    condition[index].operator = value
    this.setState({ record })
  }

  onConditionValueChange = (value, index) => {
    const { record = {} } = this.state
    const { condition = [] } = record
    condition[index].value = value
    this.setState({ record })
  }

  onDecisionChange = value => {
    const { record = {} } = this.state
    this.setState({
      record: { ...record, decision: value }
    })
  }

  onDecisionSave = () => {
    const { data = {} } = this.state
    if (this.checkBeforeUpdate(data)) {
      updateResourceNode(data).then(() => {
        getStreamNodeInfo(data.id).then(res => {
          this.props.refreshNodes()
          notification.success({ message: '资源节点配置成功' })
          const { content = {} } = res
          this.setState({ data: content })
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    }
  }

  checkBeforeUpdate = data => {
    const { nodeName, nodeType, ruleSetIdList = [], decisionTreeIdList = [], scoreCardId, decisionConfigDtoList = [] } = data
    if (!nodeName) {
      notification.warning({ message: '请输入节点名称' })
      return false
    } else if (nodeType === RESOURCE) {
      notification.warning({ message: '请选择资源类型' })
      return false
    } else {
      switch (nodeType) {
        case RULE_SET:
          if (ruleSetIdList === null || ruleSetIdList.length === 0) {
            notification.warning({ message: '请选择资源列表' })
            return false
          }
          return true
        case D_TREE:
          if (decisionTreeIdList === null || decisionTreeIdList.length === 0) {
            notification.warning({ message: '请选择资源列表' })
            return false
          }
          return true
        case SCORE_CARD:
          if (scoreCardId === null) {
            notification.warning({ message: '请选择资源列表' })
            return false
          } else if (decisionConfigDtoList === null) {
            notification.warning({ message: '请选择决策配置' })
            return false
          }
          decisionConfigDtoList.forEach(decisionConfigDto => {
            const { gate, condition } = decisionConfigDto
            if (gate === 'EMPTY') {
              condition.splice(1, 1)
            }
          })
          return true
      }
    }
  }

  getConditionDesc = (condition, gate) => {
    let gateDesc = ''
    let { operator, value } = condition[0] || {}
    let { operator: operatorOther, value: valueOther } = condition[1] || {}
    switch (gate) {
      case 'AND':
        gateDesc = '且'
        break
      case 'OR':
        gateDesc = '或'
        break
    }
    return gate !== 'EMPTY' ? DECISION_OPERATOR[operator].concat(value, gateDesc, DECISION_OPERATOR[operatorOther], valueOther)
      : DECISION_OPERATOR[operator].concat(value)
  }

  deleteDto = (e, index) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const { data = {} } = this.state
    const { decisionConfigDtoList = [] } = data
    decisionConfigDtoList.splice(index, 1)
    this.setState({
      data: { ...data, decisionConfigDtoList }
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceNodeInfo)
