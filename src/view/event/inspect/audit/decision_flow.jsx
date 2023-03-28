import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Popover } from 'antd'
import { jsPlumb } from 'jsplumb'
import { FLOW_TYPES, DECISION_RESULT_COLORS } from '../../../../common/decision_constant'
import './index.less'
import classnames from 'classnames'

const {
  BEGIN, END, DECISION_NODE, RESOURCE, RULE_SET,
  D_TREE, SCORE_CARD
} = FLOW_TYPES
const RESOURCE_TYPES = [RESOURCE, RULE_SET, D_TREE, SCORE_CARD]
const JSPLUMB_CONFIG = {
  endpoint: ['Blank', {
    radius: 4,
    fill: 'pink'
  }],
  paintStyle: {
    fill: '#bdbdbd',
    radius: 4,
    lineWidth: 20
  },
  isSource: true,
  connector: 'Flowchart',
  isTarget: true,
  maxConnections: 1
}

function noop() {
}

const FlowNode = (options = {}) => {
  let {
    id, name, x: left, y: top, type, hit, decisionResult, list = [], forwardDetail, riskPolicyMap
  } = options
  let icon = `node-${type}-gray`
  if (hit) {
    icon = `node-${type}`
  }
  const menus = list.map(l => {
    const { id, name } = l
    return <div key={`item-${id}`} style={{ cursor: 'pointer' }}
                onClick={() => hit ? forwardDetail(l) : noop()}>{name}</div>
  })
  let { riskGrade = '' } = riskPolicyMap[decisionResult] || {}
  riskGrade = riskGrade.toLocaleLowerCase()
  if (list.length > 0) {
    return <Popover key={id} content={menus} trigger="hover" placement="rightTop">
      <div id={id} style={{ left, top }}
           className={classnames('unit-button', 'flow-node', { [riskGrade]: hit })}>
        <i className={icon} /><span title={name}>{name}</span>
      </div>
    </Popover>
  }
  return <div key={id} id={id} style={{ left, top }}
              className={classnames('unit-button', 'flow-node', { [riskGrade]: hit })}>
    <i className={icon} /><span>{name}</span>
  </div>
}

export default class DecisionFlow extends Component {
  constructor(props) {
    super(props)
    const { flowData = [], result: decisionResult, forwardDetail, riskPolicyMap } = props
    let nodeList = {}
    const domList = flowData.map(n => {
      const { nodeId, name, nodeType, x = 0, y = 0, ruleSets, scoreCard, trees, hit } = n
      nodeList[nodeId] = n
      const props = {
        id: `flow_${nodeId}`,
        name,
        hit,
        type: nodeType.toLowerCase(),
        x: Number(x),
        y: Number(y),
        decisionResult,
        list: ruleSets || scoreCard || trees,
        forwardDetail,
        riskPolicyMap
      }
      return FlowNode(props)
    })
    this.state = {
      nodeList,
      domList
    }
  }

  static propTypes = {
    flowData: PropTypes.array.isRequired,
    result: PropTypes.string.isRequired,
    forwardDetail: PropTypes.func.isRequired,
    riskPolicyMap: PropTypes.object.isRequired
  }

  componentDidMount() {
    jsPlumb.reset()
    jsPlumb.getInstance()
    jsPlumb.setContainer('editor-area')
    jsPlumb.importDefaults({
      ConnectionsDetachable: true,
      MaxConnections: 1
    })
    let { nodeList = {} } = this.state
    const { result, riskPolicyMap } = this.props

    let connections = []
    Object.values(nodeList).forEach(node => {
      this.addEndpoint(node, true, connections)
    })
    connections.forEach(c => {
      const { uuids, edgeName, hit } = c
      let color = '#bdbdbd'
      let cssClass = ''
      if (hit) {
        let { riskGrade = '' } = riskPolicyMap[result] || {}
        riskGrade = riskGrade.toLocaleLowerCase()
        color = DECISION_RESULT_COLORS[riskGrade]
        cssClass = 'top-index'
      }
      jsPlumb.connect({
        uuids,
        cssClass,
        paintStyle: {
          stroke: color,
          strokeWidth: 1
        },
        overlays: [
          ['PlainArrow', { width: 10, length: 10, location: 1 }],
          ['Label', {
            label: edgeName,
            location: 0.5,
            cssClass: 'edge-label'
          }]
        ]
      })
    })
  }

  render() {
    return (
      <div className={'audit-flow-editor-panel'}>
        <div id={'editor-area'} className="editor-area">
          {
            this.state.domList
          }
        </div>
      </div>
    )
  }

  addEndpoint = (node, draggable = true, connections = []) => {
    const { nodeId, x = 0, y = 0, nodeType, edgeList = [] } = node
    console.log('node', node)
    const jsplumbConfig = { ...JSPLUMB_CONFIG }
    const uuid = `flow_${nodeId}`

    if (nodeType !== BEGIN) {
      jsPlumb.addEndpoint(uuid, {
        connectionsDetachable: false,
        maxConnections: RESOURCE_TYPES.indexOf(nodeType) !== -1 || nodeType === END ? -1 : 1,
        anchors: 'TopCenter',
        uuid: `top-${uuid}`,
        left: Number(x),
        top: Number(y),
        isSource: false,
        isTarget: draggable
      }, jsplumbConfig)
    }
    if (nodeType !== END) {
      jsPlumb.addEndpoint(uuid, {
        connectionsDetachable: false,
        maxConnections: nodeType === DECISION_NODE ? -1 : 1,
        anchors: 'BottomCenter',
        uuid: `bottom-${uuid}`,
        left: Number(x),
        top: Number(y),
        isSource: draggable,
        isTarget: false,
        connector: ['Flowchart', { cornerRadius: 5 }]
      }, jsplumbConfig)
    }

    (edgeList || []).forEach(line => {
      const { fromNodeId, toNodeId, name: edgeName, hit } = line
      connections.push({ uuids: [`bottom-flow_${fromNodeId}`, `top-flow_${toNodeId}`], hit, edgeName })
    })
  }
}
