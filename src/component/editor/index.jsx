import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import { jsPlumb } from 'jsplumb'
import { Row, Col, notification, Popconfirm, Button } from 'antd'
import debounce from 'lodash/debounce'
import classnames from 'classnames'
import EditorNode from './node/index'
import { FLOW_TYPES } from '../../common/decision_constant'
import {
  addFlowNode,
  deleteFlowNode,
  checkDecisionFlow,
  addFlowNodeLine,
  getStreamNodeInfo,
  updateFlowNodePosition,
  deleteFlowNodeLine
} from '../../action/decision'
import DecisionMakingNodeInfo from './decision_making_info'
import ResourceNodeInfo from './resource_info'
import './index.less'

const {
  BEGIN, END, DECISION_NODE, RESOURCE, RULE_SET,
  D_TREE, SCORE_CARD
} = FLOW_TYPES
const RESOURCE_TYPES = [RESOURCE, RULE_SET, D_TREE, SCORE_CARD]
const JSPLUMB_CONFIG = {
  endpoint: ['Dot', {
    radius: 4,
    fill: 'pink',
    cssClass: '',
    hoverClass: ''
  }],
  endpointStyle: { fill: 'transparent' },
  endpointHoverStyle: { fill: '#979797' },
  paintStyle: {
    fill: '#979797',
    radius: 4,
    lineWidth: 20
  },
  connectorStyle: { strokeWidth: 1, stroke: '#979797' },
  // connectorHoverStyle: { strokeWidth: 4, stroke: '#167bac' },
  isSource: true,
  connector: 'Flowchart',
  isTarget: true,
  maxConnections: 1
}

function noop() {
}

export default class DataEditor extends Component {
  constructor(props) {
    super(props)
    this.scrollEditorAreaWidth = debounce(this.scrollEditorAreaWidth, 300)
    this.scrollEditorAreaHeight = debounce(this.scrollEditorAreaHeight, 300)
    this.state = {
      nodeList: {}
    }
  }

  static defaultProps = {
    nodeList: {}
  }

  static propTypes = {
    id: PropTypes.number.isRequired,
    businessLineId: PropTypes.number.isRequired,
    nodeList: PropTypes.object,
    refreshNodes: PropTypes.func,
    isView: PropTypes.any
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.nodeList !== this.props.nodeList) {
      this.setState({ nodeList: nextProps.nodeList })
    }
  }

  componentDidUpdate() {
    jsPlumb.reset()
    jsPlumb.getInstance()
    jsPlumb.setContainer('editor-area')
    jsPlumb.importDefaults({
      ConnectionsDetachable: true,
      MaxConnections: 1
    })
    const cp = this
    let { nodeList = {} } = cp.state
    let { isView } = cp.props

    let connections = []
    Object.values(nodeList).forEach(node => {
      this.addEndpoint(node, !isView, connections)
    })
    console.log('componentDidUpdate')
    jsPlumb.bind('beforeDrag', (params) => {
      let { sourceId = '' } = params
      sourceId = sourceId.replace('flow_', '')
      const { nodeType } = nodeList[sourceId] || {}
      return nodeType !== END
    })
    jsPlumb.bind('connection', async (connInfo, e) => {
      if (e) {
        const { sourceId, targetId, connection } = connInfo
        const fromNodeId = Number(sourceId.replace('flow_', ''))
        const toNodeId = Number(targetId.replace('flow_', ''))
        const sourceNode = nodeList[fromNodeId] || {}
        const targetNode = nodeList[toNodeId] || {}
        console.log(connInfo, connection, sourceNode, targetNode)
        if (sourceId === targetId || sourceNode.nodeType === targetNode.nodeType ||
          (RESOURCE_TYPES.indexOf(sourceNode.nodeType) !== -1 && RESOURCE_TYPES.indexOf(targetNode.nodeType) !== -1)) {
          jsPlumb.deleteConnection(connection)
          return
        }
        const { nodeType, edgeList } = sourceNode
        if (sourceNode.nodeType === DECISION_NODE && RESOURCE_TYPES.indexOf(targetNode.nodeType) !== -1) {
          let same = false
          edgeList.forEach((edge, index) => {
            if (fromNodeId === edge.fromNodeId && toNodeId === edge.toNodeId) {
              same = true
            }
          })
          if (same) {
            jsPlumb.deleteConnection(connection)
            return
          }
        }
        let edgeName = ''
        if (nodeType === DECISION_NODE) {
          edgeName = `分支${edgeList.length + 1}`
        }
        const line = { id: this.props.id, edgeName, fromNodeId, toNodeId }
        addFlowNodeLine(line).then(data => {
          const { content } = data
          line.edgeId = content
          nodeList[fromNodeId].edgeList.push(line)
          this.setState({ nodeList }, () => {
            this.forceUpdate()
          })
        }).catch(data => {
          const { content = {} } = data
          notification.warning(content)
        })
      }
    })
    // }
    //
    connections.forEach(c => {
      const { uuids, edgeId, edgeName } = c
      const events = isView ? null
        : {
          click: async (labelOverlay, originalEvent) => {
            const { x: left, y: top } = originalEvent
            this.setState({ lineInfo: c, lineConfirm: true, left, top: top - 70 })
          }
        }
      jsPlumb.connect({
        uuids,
        overlays: [
          ['Arrow', { width: 10, length: 10, location: 1 }, { fillStyle: '#167bac' }],
          ['Label', {
            label: edgeName || `<i id="${edgeId}" class="anticon anticon-delete" />`,
            location: 0.5,
            cssClass: edgeName || isView ? 'edge-label' : 'del-icon',
            events
          }]
        ]
      })
    })
  }

  render() {
    const { lineConfirm = false, lineInfo, left, top, activeNode = {}, nodeList } = this.state
    const { isView = false } = this.props
    const { nodeId: activeNodeId, nodeType: activeNodeType } = activeNode
    const ConfigArea = this.renderConfigArea(activeNodeId, activeNodeType)
    console.log('render', nodeList)
    return (
      <Fragment>
        <Row className={'flow-editor-panel'}>
          <Col className={'editor-unit-buttons'}>
            <EditorNode draggable={!isView} editable={false} closable={false} id={'db-delivery'}
                        name={'开始'}
                        type={BEGIN}
                        icon={'node-begin'} onNodeClick={noop} />
            <EditorNode draggable={!isView} editable={false} closable={false} id={'sql'} name={'资源节点'}
                        type={RESOURCE}
                        icon={'node-resource'} onNodeClick={noop} />
            <EditorNode draggable={!isView} editable={false} closable={false} id={'sub-flow'}
                        name={'决策节点'}
                        type={DECISION_NODE}
                        icon={'node-decision_node'} onNodeClick={noop} />
            <EditorNode draggable={!isView} editable={false} closable={false} id={'virtual-node'}
                        name={'结束'}
                        type={END}
                        icon={'node-end'} onNodeClick={noop} />
          </Col>
          {
            isView ? null
              : <Col className={'editor-operation-buttons'}>
                <Button onClick={this.checkDecisionFlow}>异常检测</Button>
              </Col>
          }
          <Col ref={ref => {
            this._editorArea = ref
          }} id={'editor-area'} className={classnames('editor-area', { 'view': isView })} onDragOver={this.dragOver}
               onDrop={this.drop}>
            {
              this.reRenderNodeList(nodeList)
            }
          </Col>
          <Col className="config-area">{ConfigArea}</Col>
        </Row>
        {
          lineConfirm
            ? <Popconfirm placement="rightBottom" overlayClassName="popover-left-auto" visible
                          overlayStyle={{ marginLeft: left, marginTop: top }}
                          title={'确定要删除当前连线？'}
                          onCancel={() => this.setState({ lineConfirm: false })}
                          onConfirm={() => this.removeLine(lineInfo)}
                          okText="确定"
                          cancelText="取消" />
            : null
        }
      </Fragment>
    )
  }

  renderConfigArea = (activeNodeId, activeNodeType) => {
    const { refreshNodes, businessLineId, isView } = this.props
    const { streamNodeInfo = {} } = this.state
    switch (activeNodeType) {
      case DECISION_NODE:
        return <DecisionMakingNodeInfo id={activeNodeId} isView={isView} data={streamNodeInfo}
                                       refreshNodes={refreshNodes} />
      case RESOURCE:
      case RULE_SET:
      case D_TREE:
      case SCORE_CARD:
        return <ResourceNodeInfo id={activeNodeId} isView={isView} businessLineId={businessLineId} data={streamNodeInfo}
                                 refreshNodes={refreshNodes} />
      default:
        return null
    }
  }
  reRenderNodeList = (nodeList) => {
    const { isView } = this.props
    return Object.values(nodeList).map(n => {
      const { nodeId, nodeName, nodeType, x = 0, y = 0 } = n
      return <EditorNode
        style={{
          left: Number(x),
          top: Number(y)
        }}
        key={nodeId} type={nodeType.toLowerCase()}
        name={nodeName}
        onRemoveNode={(data) => isView ? noop() : this.removeNode(data)}
        onNodeClick={(id) => this.nodeClick(id, nodeType)}
        cloneable
        closable={!isView}
        draggable={false}
        nodeID={nodeId}
        id={`flow_${nodeId}`} />
    })
  }

  removeLine = (connInfo) => {
    const { uuids = [], edgeId } = connInfo
    let sourceId = uuids[0] || ''
    let targetId = uuids[1] || ''
    sourceId = Number(sourceId.replace('bottom-flow_', ''))
    targetId = Number(targetId.replace('top-flow_', ''))
    let { nodeList } = this.state
    const { edgeList = [] } = nodeList[sourceId]
    nodeList[sourceId].edgeList = edgeList.filter(line => {
      const { fromNodeId, toNodeId } = line
      return fromNodeId === sourceId && toNodeId !== targetId
    })
    deleteFlowNodeLine({ id: edgeId }).then(data => {
      this.setState({ nodeList, lineConfirm: false })
    }).catch(data => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  checkNodeRecycled = (baseId, sourceId, targetId, nodes) => {
    const source = nodes[sourceId] || {}
    const { pid = '' } = source
    let recycled = false
    if (!pid) {
      return recycled
    }
    const pids = pid.split(',').filter(p => p)
    if (pids.indexOf(baseId) !== -1) {
      return true
    }
    const count = pids.length
    for (let i = 0; i < count; i++) {
      const source = nodes[pids[i]] || {}
      const { id = '', pid = '' } = source
      {
        const pids = pid.split(',').filter(p => p)
        const count = pids.length
        for (let i = 0; i < count; i++) {
          recycled = this.checkNodeRecycled(baseId, pids[i], id, nodes)
          console.log('recycled', recycled)
          if (recycled) {
            return recycled
          }
        }
      }
    }
    return recycled
  }

  removeNode = (data) => {
    try {
      const { nodeID: id } = data
      deleteFlowNode({ id }).then(data => {
        let { nodeList } = this.state
        delete (nodeList[id])
        this.setState({ nodeList })
      }).catch(data => {
        notification.warning(data.content)
      })
    } catch (err) {
      console.log(err)
    }
  }

  nodeClick = (nodeId, nodeType) => {
    console.log(this.moving, nodeId, nodeType)
    if (!this.moving) {
      switch (nodeType) {
        case DECISION_NODE:
        case RESOURCE:
        case RULE_SET:
        case D_TREE:
        case SCORE_CARD:
          // this.setState({ streamNodeInfo: {} })
          getStreamNodeInfo(nodeId).then(res => {
            const { content = {} } = res
            this.setState({ streamNodeInfo: content })
          })
          break
      }
      this.setState({ activeNode: { nodeType, nodeId } })
    }
  }

  dragOver = e => {
    e.preventDefault()
  }

  drop = e => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    let { nodeList } = this.state
    let { type: nodeType, name: nodeName, width, height } = JSON.parse(e.dataTransfer.getData('Text'))
    e = e || window.event
    let left = e.pageX + e.target.scrollLeft - 285 - width
    const top = e.pageY + e.target.scrollTop - 235 - height / 2
    if (left < 0) {
      left = 0
    }
    let currentNodeCount = nodeType === RESOURCE ? 1 : 0
    Object.values(nodeList).forEach(node => {
      if (node.nodeType === RESOURCE) {
        currentNodeCount++
      }
    })
    addFlowNode({
      currentNodeCount,
      decisionStreamId: this.props.id,
      nodeName,
      nodeType,
      x: left,
      y: top
    }).then(data => {
      const { content: id } = data
      nodeList[id] = { nodeId: id, nodeType, nodeName, x: left, y: top, edgeList: [] }
      this.setState({ nodeList })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  addEndpoint = (node, draggable = true, connections = []) => {
    const cp = this
    const { isView } = cp.props
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
        enabled: !isView,
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
        enabled: !isView,
        isTarget: false,
        connector: ['Flowchart', { cornerRadius: 5 }]
      }, jsplumbConfig)
    }

    if (draggable) {
      jsPlumb.setDraggable(uuid, true)
      jsPlumb.draggable(uuid, {
        containment: 'parent',
        disabled: true,
        drag: (arg) => {
          cp.moving = true
          if (arg.e.clientX > window.innerWidth - 250) {
            this.scrollEditorAreaWidth()
          } else if (arg.e.clientY > window.innerHeight - 250) {
            this.scrollEditorAreaHeight()
          }
        },
        stop: function (arg) {
          const { finalPos = [] } = arg
          let { nodeList } = cp.state
          let node = nodeList[nodeId]
          node['x'] = finalPos[0]
          node['y'] = finalPos[1]
          const { x, y } = node
          nodeList[nodeId] = node
          window.setTimeout(() => {
            cp.moving = false
            updateFlowNodePosition({ id: nodeId, x, y }).then(data => {
              cp.setState({ nodeList })
            }).catch(data => {
              notification.warning(data.content)
            })
          }, 200)
        }
      })
    } else {
      jsPlumb.setDraggable(uuid, false)
    }

    (edgeList || []).forEach(line => {
      const { fromNodeId, toNodeId, edgeId, edgeName } = line
      connections.push({ uuids: [`bottom-flow_${fromNodeId}`, `top-flow_${toNodeId}`], edgeId, edgeName })
    })
  }

  scrollEditorAreaWidth = () => {
    const editorArea = ReactDOM.findDOMNode(this._editorArea)
    editorArea.style.width = editorArea.offsetWidth + 250 + 'px'
  }

  scrollEditorAreaHeight = () => {
    const editorArea = ReactDOM.findDOMNode(this._editorArea)
    editorArea.style.height = editorArea.offsetHeight + 250 + 'px'
  }

  checkDecisionFlow = () => {
    checkDecisionFlow(this.props.id).then(data => {
      notification.success({ message: '检测通过' })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}
