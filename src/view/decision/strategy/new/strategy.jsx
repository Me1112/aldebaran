import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { jsPlumb } from 'jsplumb'
import { Row, Col, Cascader, Select, Modal, Form, Input, notification, Popconfirm } from 'antd'
import { Map } from 'immutable'
import classnames from 'classnames'
import {
  getDecisionTreeNodes,
  updateNodeInfo,
  deleteTreeNode,
  addCondition,
  getIndicatorSelect,
  getTreeNode,
  getEdgeInfo,
  getEdgeSelect,
  addConditionList
} from '../../../../action/decision'
import './index.less'
import { bindActionCreators } from 'redux'
import { getOperators } from '../../../../action/common'

function noop() {
}

const { Option } = Select
const { Item: FormItem } = Form

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 }
}

const conditionFormItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
}

const JSPLUMB_CONFIG = {
  endpoint: ['Blank', {
    radius: 4,
    fill: 'pink'
  }],
  paintStyle: {
    fill: '#dddddd',
    radius: 4,
    lineWidth: 2
  },
  connectorStyle: { strokeWidth: 1, stroke: '#dddddd' },
  isSource: true,
  connector: 'Flowchart',
  isTarget: true,
  maxConnections: -1
}

const TreeNode = (options = {}) => {
  let {
    id, name, field, root = false, isLeaf, result, x: left, y: top, isView,
    onNameClick = noop, onIconClick = noop, preventEvent = noop, decisionName
  } = options
  if (!name) {
    name = ''
  }
  const data = { id, root, left, top, name, isLeaf, field }
  let text = name || '空节点'
  const title = text
  const decision = !root && isLeaf && result
  if (decision) {
    text = decisionName
  }
  return <div key={id} id={id} style={{ left, top }} onClick={preventEvent}
              className={classnames('tree-node', { 'decision': decision })}>
    <span className={classnames('text-overflow', { 'view': isView })} title={title}
          onClick={(e) => onNameClick(e, data)}>{text}</span>
    {
      isView ? null
        : <i className="anticon anticon-plus-circle-o" onClick={(e) => onIconClick(e, data)} />
    }
  </div>
}
const { PROPERTY, STRATEGY, ADD, DELETE } = { PROPERTY: 'PROPERTY', STRATEGY: 'STRATEGY', ADD: 'ADD', DELETE: 'DELETE' }
const MenuNames = { [PROPERTY]: '属性节点', [STRATEGY]: '决策节点' }

function mapStateToProps(state) {
  const { develop = Map({}), rule = Map({}), decision = Map({}) } = state
  const { cron = {} } = develop.toJS()
  const { allOperators = {} } = rule.toJS()
  const { riskPolicyList = [], riskPolicyMap = {} } = decision.toJS()
  return { cron, allOperators, riskPolicyList, riskPolicyMap }
}

function mapDispatchToProps(dispatch) {
  return {
    getOperators: bindActionCreators(getOperators, dispatch)
  }
}

class StrategyEditor extends Component {
  constructor(props) {
    super(props)
    this.delConfirm = false
    this.state = {
      domList: [],
      nodeList: [],
      fieldTypeList: [],
      indicatorList: [],
      reasonList: [],
      operatorList: [],
      conditionTypes: [],
      conditionList: [],
      menuVisible: false,
      selectVisible: false,
      decisionVisible: false,
      conditionVisible: false,
      common: {
        isSource: true,
        isTarget: true,
        connector: ['Straight']
      }
    }
  }

  static defaultProps = {
    clean: false
  }

  static propTypes = {
    form: PropTypes.any,
    businessLineId: PropTypes.any,
    id: PropTypes.number.isRequired,
    getOperators: PropTypes.func.isRequired,
    allOperators: PropTypes.object.isRequired,
    riskPolicyList: PropTypes.array.isRequired,
    riskPolicyMap: PropTypes.object.isRequired,
    clean: PropTypes.bool,
    isView: PropTypes.any
  }

  componentWillReceiveProps(nextProps) {
    const { clean } = nextProps
    if (clean) {
      this.setState({ menuVisible: false, selectVisible: false })
    }
  }

  componentDidMount() {
    this.getTreeNodes()
    this.props.getOperators()
  }

  componentDidUpdate() {
    jsPlumb.reset()
    jsPlumb.getInstance()
    jsPlumb.setContainer('decision-tree')
    jsPlumb.importDefaults({
      ConnectionsDetachable: true,
      MaxConnections: -1
    })
    const cp = this
    let { nodeList = [] } = cp.state
    let { view, readOnly, isView } = cp.props
    this.nodeList = {}

    let connections = []
    nodeList.forEach(node => {
      const { id } = node
      this.nodeList[id] = node
      this.addEndpoint(node, !view && !readOnly, connections)
    })

    connections.forEach(c => {
      const { uuids, node } = c
      const { pid, edgeId = 0, conditionName, conditionExpr } = node
      let label = ''
      if (conditionName && conditionExpr) {
        label = `<span class="node-condition name" title="${conditionName}">${conditionName}</span><span class="node-condition expr" title="${conditionExpr}">${conditionExpr}</span>`
      } else {
        let { level = 1 } = this.nodeList[pid] || {}
        label = `<span class="node-condition set name${level > 1 ? '' : ' mr-100'}">设置条件</span>`
      }

      const events = isView ? null
        : {
          click: async (labelOverlay, originalEvent) => {
            const { x: left, y: top } = originalEvent
            try {
              this.props.form.resetFields()
              await getEdgeInfo(edgeId).then(async (data) => {
                const { content = {} } = data
                const {
                  dataType,
                  name,
                  decisionTreeConditionGate: conditionType,
                  decisionTreeConditionDtoList = []
                } = content
                console.log('edge', node, left, top, data)
                await getEdgeSelect({ dataType }).then(data => {
                  // const { content = [] } = data[0]
                  // const { option: operatorList = [] } = content[0]
                  let operatorList = this.props.allOperators[dataType] || []
                  const { content: conditionTypes = [] } = data[0]
                  console.log('edge info', data, operatorList, conditionTypes)
                  const conditionCount = decisionTreeConditionDtoList.length
                  let id1 = ''
                  let operator1
                  let value1 = ''
                  let id2 = ''
                  let operator2
                  let value2 = ''
                  if (conditionCount === 1) {
                    id1 = decisionTreeConditionDtoList[0].id
                    operator1 = decisionTreeConditionDtoList[0].operator
                    value1 = decisionTreeConditionDtoList[0].value
                  } else if (conditionCount === 2) {
                    id1 = decisionTreeConditionDtoList[0].id
                    operator1 = decisionTreeConditionDtoList[0].operator
                    value1 = decisionTreeConditionDtoList[0].value
                    id2 = decisionTreeConditionDtoList[1].id
                    operator2 = decisionTreeConditionDtoList[1].operator
                    value2 = decisionTreeConditionDtoList[1].value
                  }
                  this.setState({
                    edgeId,
                    dataType,
                    name: (name === null ? '' : name),
                    conditionType: (conditionType === null ? undefined : conditionType),
                    id1,
                    operator1,
                    value1,
                    id2,
                    operator2,
                    value2,
                    operatorList: operatorList,
                    conditionTypes,
                    conditionVisible: true,
                    menuVisible: false,
                    selectVisible: false,
                    decisionVisible: false,
                    left: left - 30,
                    top: top + 15
                  })
                }).catch((data) => {
                  console.log('data1', data)
                  const { content = {} } = data
                  notification.warn(content)
                })
              }).catch((data) => {
                console.log('data2', data)
                const { content = {} } = data
                notification.warn(content)
              })
            } catch (err) {
              console.log(err)
            }
          }
        }
      jsPlumb.connect({
        uuids,
        overlays: [
          ['Label', {
            label,
            location: 1,
            cssClass: 'condition-label',
            events
          }]
        ]
      })
    })
  }

  render() {
    const {
      indicatorList, menuVisible, selectVisible, decisionVisible,
      left = 0, top = 0, result = undefined, description = '',
      name = '', conditionVisible, operatorList, conditionTypes, conditionType = undefined,
      operator1 = undefined, value1, operator2 = undefined, value2,
      root = false, isLeaf = false, field, dataType, id, selectedField = undefined
    } = this.state
    const { riskPolicyList = [], isView } = this.props
    const { getFieldProps } = this.props.form
    const nodeMenus = this._render({ root, name, isLeaf, field })
    console.log('selectedField', selectedField)

    return (
      <div className={classnames('editor-panel', { 'view': isView })}>
        <div id="decision-tree" className="decision-tree" onClick={this.showDecisionTree}>
          {this.state.domList}
        </div>
        <Cascader popupClassName="strategy-cascader" popupVisible={menuVisible}
                  getPopupContainer={() => document.getElementById('decision-tree')}
                  style={{ visibility: 'hidden', left, top }} expandTrigger="hover"
                  options={nodeMenus} onChange={this.onChange} />
        <Select dropdownClassName="indicator" getPopupContainer={() => document.getElementById('decision-tree')}
                style={{ position: 'absolute', visibility: 'hidden', width: 250, left, top }}
                open={selectVisible} onChange={this.selectNodeType} value={selectedField}>
          {
            indicatorList.map(item => {
              const { fieldDisplayName, fieldName } = item
              return (
                <Option key={fieldName} value={fieldName}
                        title={fieldDisplayName}>{fieldName}-{fieldDisplayName}</Option>
              )
            })
          }
        </Select>
        <Modal title="设置决策节点"
               width={260}
               visible={decisionVisible}
               mask={false}
               closable={false}
               style={{ position: 'absolute', top, left }}
               wrapClassName="strategy-node-modal"
               onOk={this.saveDecision}
               okButtonProps={{ disabled: !result }}
               onCancel={() => this.setState({ decisionVisible: false })}>
          <Form key={`node_${id}`}>
            <FormItem {...formItemLayout} label="处理结果">
              <Select {...getFieldProps('result', {
                initialValue: result,
                onChange: (value) => this.changeRecord(value, 'result')
              })} placeholder="请选择处理结果">
                {
                  riskPolicyList.map(riskPolicy => {
                    const { decisionName, decisionCode } = riskPolicy
                    return (
                      <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>)
                  })
                }
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="描述">
              <Input.TextArea {...getFieldProps('description', {
                initialValue: description,
                onChange: (e) => this.changeRecord(e.target.value, 'description')
              })} rows={4} placeholder="最多200个字符"
                              maxLength="200" />
            </FormItem>
          </Form>
        </Modal>
        <Modal title="设置条件"
               width={320}
               visible={conditionVisible}
               mask={false}
               closable={false}
               style={{ position: 'absolute', top, left }}
               wrapClassName="strategy-node-modal"
               onOk={this.saveCondition}
               okButtonProps={{ disabled: this.conditionDisabled() }}
               onCancel={() => this.setState({ conditionVisible: false })}>
          <Form key={`condition_${id}`}>
            <FormItem {...conditionFormItemLayout} label="名称">
              <Input {...getFieldProps('name', {
                initialValue: name,
                onChange: (e) => this.changeRecord(e.target.value, 'name')
              })} placeholder="请输入名称" maxLength="50" />
            </FormItem>
            <Row style={{ marginBottom: 10 }}>
              <Col span={4} style={{ textAlign: 'right', right: 8 }}>
                值:
              </Col>
              <Col span={8}>
                <Select className="no-overflow" showSearch {...getFieldProps('operator1', {
                  initialValue: operator1,
                  onChange: (value) => this.changeRecord(value, 'operator1')
                })} placeholder="无" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 90 }}
                        style={{ paddingRight: 5 }}>
                  {
                    operatorList.map(o => {
                      const { operator, description } = o
                      return <Option key={operator} value={operator} title={description}>{description}</Option>
                    })
                  }
                </Select>
              </Col>
              <Col span={7}>
                {
                  dataType === 'BOOLEAN'
                    ? <Select {...getFieldProps('value1', {
                      initialValue: value1,
                      onChange: (value) => this.changeRecord(value, 'value1')
                    })} placeholder="无" style={{ paddingLeft: 5 }}>
                      <Option value="true" title="是">是</Option>
                      <Option value="false" title="否">否</Option>
                    </Select>
                    : <Input {...getFieldProps('value1', {
                      initialValue: value1,
                      onChange: (e) => this.changeRecord(e.target.value, 'value1')
                    })} placeholder="值" maxLength="50" style={{ paddingRight: 5 }} />
                }
              </Col>
              <Col span={5}>
                <Select className="no-overflow" showSearch {...getFieldProps('conditionType', {
                  initialValue: conditionType,
                  onChange: (value) => this.changeRecord(value, 'conditionType')
                })} placeholder="无" style={{ paddingLeft: 5 }} allowClear>
                  {
                    conditionTypes.map(o => {
                      const { conditionType, name } = o
                      return <Option key={conditionType} value={conditionType} title={name}>{name}</Option>
                    })
                  }
                </Select>
              </Col>
            </Row>
            <Row>
              <Col span={4} style={{ textAlign: 'right', right: 8 }} />
              <Col span={8}>
                <Select className="no-overflow" disabled={!conditionType}
                        showSearch {...getFieldProps('operator2', {
                  initialValue: operator2,
                  onChange: (value) => this.changeRecord(value, 'operator2')
                })} placeholder="无" dropdownMatchSelectWidth={false} dropdownStyle={{ width: 90 }}
                        style={{ paddingRight: 5 }}>
                  {
                    operatorList.map(o => {
                      const { operator, description } = o
                      return <Option key={operator} value={operator}>{description}</Option>
                    })
                  }
                </Select>
              </Col>
              <Col span={7}>
                {
                  dataType === 'BOOLEAN'
                    ? <Select className="no-overflow" {...getFieldProps('value2', {
                      initialValue: value2,
                      onChange: (value) => this.changeRecord(value, 'value2')
                    })} placeholder="无" style={{ paddingLeft: 5 }}>
                      <Option value="true" title="是">是</Option>
                      <Option value="false" title="否">否</Option>
                    </Select>
                    : <Input {...getFieldProps('value2', {
                      initialValue: value2,
                      onChange: (e) => this.changeRecord(e.target.value, 'value2')
                    })} placeholder="值" maxLength="50" style={{ paddingRight: 5 }} />
                }
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }

  showDecisionTree = () => {
    const { isView } = this.props
    if (!isView) {
      this.setState({
        conditionVisible: false,
        menuVisible: false,
        selectVisible: false,
        decisionVisible: false
      })
    }
  }

  _render = (node) => {
    const { root, isLeaf, field, name } = node
    const disabled = !field
    const noName = !name
    const deleteOption = <Popconfirm placement="rightBottom"
                                     title={'确定要删除当前节点？'}
                                     onCancel={this.preventEvent}
                                     onConfirm={() => {
                                       this.delConfirm = true
                                     }}
                                     okText="确定"
                                     cancelText="取消">
      <div onClick={this.preventPopEvent}>删除节点</div>
    </Popconfirm>
    const propertyOption = noName ? '属性节点' : <Popconfirm placement="rightBottom"
                                                         title={'将清空该节点和子节点的信息，是否继续？'}
                                                         onCancel={this.preventEvent}
                                                         onConfirm={() => {
                                                           this.delConfirm = true
                                                         }}
                                                         okText="确定"
                                                         cancelText="取消">
      <div onClick={this.preventPopEvent}>属性节点</div>
    </Popconfirm>
    const strategyOption = noName ? '决策节点' : <Popconfirm placement="rightBottom"
                                                         title={'将清空该节点和子节点的信息，是否继续？'}
                                                         onCancel={this.preventEvent}
                                                         onConfirm={() => {
                                                           this.delConfirm = true
                                                         }}
                                                         okText="确定"
                                                         cancelText="取消">
      <div onClick={this.preventPopEvent}>决策节点</div>
    </Popconfirm>
    if (root) {
      return [{
        disabled: !noName,
        value: 'TYPE',
        label: '节点类型',
        children: [{ disabled: !noName, value: PROPERTY, label: '属性节点' },
          { disabled: true, value: STRATEGY, label: '决策节点' }]
      }, { disabled: disabled, value: ADD, label: '添加条件' }, {
        disabled: !disabled,
        value: DELETE,
        label: deleteOption
      }]
    } else {
      if (isLeaf) {
        return [{
          value: 'TYPE',
          label: '节点类型',
          children: [{ value: PROPERTY, label: propertyOption }, {
            disabled: name || false,
            value: STRATEGY,
            label: strategyOption
          }]
        }, { disabled: true, value: ADD, label: '添加条件' }, { value: DELETE, label: deleteOption }]
      } else {
        return [{
          value: 'TYPE',
          label: '节点类型',
          children: [{ disabled: name || false, value: PROPERTY, label: propertyOption }, {
            value: STRATEGY,
            label: strategyOption
          }]
        }, { disabled: disabled, value: ADD, label: '添加条件' }, { value: DELETE, label: deleteOption }]
      }
    }
  }

  _calculateLevel = (node) => {
    let { children } = node
    if (!children) {
      children = []
    }
    const childCount = children.length
    if (childCount > 0) {
      return childCount - 1 + children.map(c => {
        return this._calculateLevel(c)
      }).reduce((pre, cur) => pre + cur)
    } else {
      return childCount
    }
  }

  _convertTreeNodes = (node, nodes) => {
    let { id, x = 0, y = 0 } = node
    let { children, ...other } = node
    if (!children) {
      children = []
    }
    const level = children.length
    nodes.push({ ...other, x, y, level })
    children.map((node, index) => {
      if (index > 0) {
        let preNode = children[index - 1]
        let level = this._calculateLevel(preNode)
        console.log('_calculateLevel', level)
        y = y + (level + 1) * 70
      }
      return this._convertTreeNodes({ ...node, x: x + 300, y, pid: id }, nodes)
    })
  }

  addEndpoint = (node, draggable = true, connections = []) => {
    const { id: uuid, pid = '', x = 0, y = 0 } = node
    const NODE_CLONED_PREFIX = ''
    const id = `${NODE_CLONED_PREFIX}${uuid}`
    const jsplumbConfig = { ...JSPLUMB_CONFIG }

    jsPlumb.addEndpoint(id, {
      anchors: 'Right',
      uuid: `right-${uuid}`,
      left: Number(x),
      top: Number(y),
      isSource: false,
      isTarget: draggable
    }, jsplumbConfig)

    jsPlumb.addEndpoint(id, {
      anchors: 'Left',
      uuid: `left-${uuid}`,
      left: Number(x),
      top: Number(y),
      isSource: draggable,
      isTarget: false
    }, jsplumbConfig)

    if (pid) {
      connections.push({ uuids: [`right-${pid}`, `left-${uuid}`], node })
    }
  }

  onClickPlus = (e, data) => {
    const { left, top, root, isLeaf } = data
    const nodeLeft = isLeaf && !root ? 70 : 112
    const { scrollLeft, scrollTop, clientWidth } = document.getElementById('decision-tree')
    console.log('onClickPlus', left, top, clientWidth, scrollLeft)
    this.setState({
      conditionVisible: false,
      menuVisible: false,
      selectVisible: false,
      decisionVisible: false
    }, () => {
      let realLeft = left + nodeLeft - scrollLeft
      if (scrollLeft + left > clientWidth) {
        realLeft = left - nodeLeft - scrollLeft
      }
      this.setState({ ...data, menuVisible: true, left: realLeft, top: top - 35 - scrollTop })
    })
  }

  onNameClick = async (e, data) => {
    const { id, left, top, isLeaf, field } = data
    const { scrollTop } = document.getElementById('decision-tree')
    console.log('onNameClick', field || undefined)
    try {
      if (isLeaf) {
        this.props.form.resetFields()
        // const rect = e.target.getBoundingClientRect()
        await getTreeNode(id).then(async (data) => {
          const { content = {} } = data
          let { reason = undefined, result = undefined, description = '' } = content
          if (!reason) {
            reason = undefined
          }
          if (!result) {
            result = undefined
          }
          this.setState({
            selectedField: field || undefined,
            reason,
            result,
            description,
            selectVisible: false,
            menuVisible: false,
            id,
            decisionVisible: true,
            left,
            top: top - scrollTop
          })
        })
      } else {
        await getIndicatorSelect({ businessLineId: this.props.businessLineId }).then((data) => {
          const { content: indicatorList = [] } = data
          this.setState({
            selectedField: field || undefined,
            decisionVisible: false,
            selectVisible: false,
            menuVisible: false
          }, () => {
            this.setState({ id, indicatorList, selectVisible: true, left, top: top - scrollTop })
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      }
    } catch (err) {
    }
  }

  onChange = async (value = []) => {
    const type = value.pop()
    let { id } = this.state
    console.log('preventEventonChange', id)
    console.log('preventEvent', type)
    switch (type) {
      case PROPERTY:
      case STRATEGY:
        try {
          await updateNodeInfo({ id, name: MenuNames[type], isLeaf: type === STRATEGY }).then((data) => {
            this.getTreeNodes()
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } catch (err) {
        }
        break
      case ADD:
        try {
          await addCondition({ treeId: this.props.id, parentNodeId: id }).then((data) => {
            this.getTreeNodes()
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } catch (err) {
        }
        break
      case DELETE:
        if (this.delConfirm) {
          try {
            await deleteTreeNode(id).then((data) => {
              this.getTreeNodes()
            }).catch((data) => {
              this.delConfirm = false
              const { content = {} } = data
              notification.warn(content)
            })
          } catch (err) {
          }
        }
        break
    }
    this.setState({
      conditionVisible: false,
      menuVisible: false,
      selectVisible: false,
      decisionVisible: false,
      value
    })
  }

  getTreeNodes = async () => {
    try {
      await getDecisionTreeNodes(this.props.id).then((data) => {
        const { content = {} } = data
        let nodes = []
        this._convertTreeNodes(content, nodes)
        console.log('nodes', nodes)
        const { riskPolicyMap, isView } = this.props
        this.setState({
          nodeList: nodes,
          domList: nodes.map(n => {
            const { name, result } = n
            const { decisionName = '' } = riskPolicyMap[result] || {}
            let onNameClick = this.onNameClick
            if (!name || isView) {
              onNameClick = noop
            }
            return TreeNode({
              ...n,
              isView,
              decisionName,
              onNameClick,
              onIconClick: this.onClickPlus,
              preventEvent: this.preventEvent
            })
          })
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    } catch (err) {
    }
  }

  selectNodeType = async (v, option) => {
    const { title } = option.props
    const { id } = this.state
    console.log(this.state, v, title)
    try {
      await updateNodeInfo({ id, name: title, field: v }).then((data) => {
        this.setState({
          conditionVisible: false,
          menuVisible: false,
          selectVisible: false,
          decisionVisible: false
        }, () => {
          this.getTreeNodes()
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    } catch (err) {
    }
  }

  saveDecision = async () => {
    const { id, result, reason, description } = this.state
    try {
      await updateNodeInfo({ id, result, reason, description }).then((data) => {
        this.setState({
          conditionVisible: false,
          menuVisible: false,
          selectVisible: false,
          decisionVisible: false
        }, () => {
          this.getTreeNodes()
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    } catch (err) {
    }
  }

  saveCondition = async () => {
    const { edgeId, name, id1, operator1, value1, conditionType, id2, operator2, value2 } = this.state
    let conditionList = []
    if (operator1 && value1) {
      conditionList.push({ id: id1, operator: operator1, value: value1 })
    }
    if (conditionType && operator2 && value2) {
      conditionList.push({ id: id2, operator: operator2, value: value2 })
    }
    try {
      await addConditionList({ id: edgeId, name, conditionType, conditionList }).then((data) => {
        this.setState({
          conditionVisible: false,
          menuVisible: false,
          selectVisible: false,
          decisionVisible: false
        }, () => {
          this.getTreeNodes()
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    } catch (err) {
    }
  }

  changeRecord = (value, fieldname) => {
    const state = { [fieldname]: value }
    if (fieldname === 'conditionType' && !value) {
      state['operator2'] = undefined
      state['value2'] = ''
    }
    this.setState({ ...state })
  }

  conditionDisabled = () => {
    const { name, operator1, value1, conditionType, operator2, value2 } = this.state
    return !name || !(operator1 && value1) || (conditionType && !(operator2 && value2))
  }

  preventEvent = (e) => {
    console.log('preventEvent', e.target)
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  preventPopEvent = (e) => {
    console.log('preventEvent pop', e.target)
    this.setState({ menuVisible: false })
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(StrategyEditor))
