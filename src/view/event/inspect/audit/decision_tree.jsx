import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { jsPlumb } from 'jsplumb'
import classnames from 'classnames'
import { DECISION_RESULT_COLORS } from '../../../../common/decision_constant'
import './index.less'

const JSPLUMB_CONFIG = {
  endpoint: ['Blank', {
    radius: 4,
    fill: 'pink'
  }],
  paintStyle: {
    fill: '#bdbdbd',
    radius: 4,
    lineWidth: 2
  },
  isSource: true,
  connector: 'Flowchart',
  isTarget: true,
  maxConnections: -1
}

const TreeNode = (options = {}) => {
  let {
    id, nodeName: name, value, result, x: left, y: top, hit, decisionName = '', decisionResult, riskPolicyMap
  } = options
  if (!name) {
    name = ''
  }
  let text = name || '空节点'
  let title = text
  let { riskGrade = '' } = riskPolicyMap[decisionResult] || {}
  if (decisionName) {
    text = decisionName
  }
  if (value !== undefined) {
    title = `${title}：${value}`
  }
  riskGrade = riskGrade.toLocaleLowerCase()
  return <div key={id} id={id} style={{ left, top }}
              className={classnames('tree-node', { 'decision': result, [riskGrade]: hit })}>
    <span className="text-overflow" title={title}>{text}</span>
  </div>
}

export default class DecisionTree extends Component {
  constructor(props) {
    super(props)
    const { treeData = {}, result: decisionResult, riskPolicyMap = {} } = props
    let nodes = []
    this._convertTreeNodes(treeData, nodes)
    this.state = {
      nodeList: nodes,
      domList: nodes.map(n => {
        return TreeNode({ ...n, decisionResult, riskPolicyMap })
      })
    }
  }

  static propTypes = {
    treeData: PropTypes.object.isRequired,
    result: PropTypes.string.isRequired,
    riskPolicyMap: PropTypes.object.isRequired
  }

  componentDidMount() {
    jsPlumb.reset()
    jsPlumb.getInstance()
    jsPlumb.setContainer('decision-tree')
    jsPlumb.importDefaults({
      ConnectionsDetachable: true,
      MaxConnections: -1
    })
    let { nodeList = [] } = this.state
    const { result, riskPolicyMap } = this.props
    this.nodeList = {}

    let connections = []
    nodeList.forEach(node => {
      const { id } = node
      this.nodeList[id] = node
      this.addEndpoint(node, false, connections)
    })

    connections.forEach(c => {
      const { uuids, node, pHit } = c
      const { conditionName, conditionExpr, hit } = node
      let label = ''
      if (conditionName && conditionExpr) {
        label = `<span class="node-condition name" title="${conditionName}">${conditionName}</span><span class="node-condition expr" title="${conditionExpr}">${conditionExpr}</span>`
      }
      let color = '#bdbdbd'
      let cssClass = ''
      if (pHit && hit) {
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
          ['Label', {
            label,
            location: 1,
            cssClass: 'condition-label'
          }]
        ]
      })
    })
  }

  render() {
    return (
      <div className={'audit-editor-panel'}>
        <div id="decision-tree" className="decision-tree">
          {this.state.domList}
        </div>
      </div>
    )
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
    let { id, x = 0, y = 0, hit: pHit } = node
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
      return this._convertTreeNodes({ ...node, x: x + 300, y, pid: id, pHit }, nodes)
    })
  }

  addEndpoint = (node, draggable = true, connections = []) => {
    const { id: uuid, pid = '', pHit, x = 0, y = 0 } = node
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
      connections.push({ uuids: [`right-${pid}`, `left-${uuid}`], node, pHit })
    }
  }
}
