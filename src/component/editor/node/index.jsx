import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Icon, Popconfirm } from 'antd'

function noop() {
}

export default class EditorNode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...props
    }
  }

  static defaultProps = {
    icon: '',
    name: '',
    style: {},
    closable: true
  }
  static propTypes = {
    id: PropTypes.string,
    nodeID: PropTypes.number,
    name: PropTypes.string,
    type: PropTypes.string,
    onRemoveNode: PropTypes.func
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps })
  }

  render() {
    const { id } = this.props
    const { type, nodeID, name: nodeName, closable, draggable, style, onNodeClick } = this.state
    let { icon } = this.state
    const border = draggable ? '' : `border-${type}`
    if (icon === '') {
      icon = `node-${type}`
    }
    console.log('nodeID', nodeID)
    return (
      <Fragment>
        <div onClick={() => draggable ? noop() : onNodeClick(nodeID)} style={style}
             className={classnames('unit-button', 'flow-node', border)}
             draggable={draggable} id={id} onDragStart={this.drag}
        ><i className={icon} />
          <span title={nodeName}>{nodeName}</span>
          {
            closable
              ? <Popconfirm placement="rightBottom"
                            title={'确定要删除当前节点？'}
                            onCancel={this.preventEvent}
                            onConfirm={this.removeNode}
                            okText="确定"
                            cancelText="取消">
                <Icon type="close" className="close-node" onClick={this.preventEvent} />
              </Popconfirm>
              : null
          }
        </div>
      </Fragment>
    )
  }

  drag = e => {
    e.dataTransfer.effectAllowed = 'move'
    const { type, name } = this.props
    const { offsetWidth: width = 0, offsetHeight: height = 0 } = this.unit || {}
    e.dataTransfer.setData('Text', JSON.stringify({ type, name, width, height }))
  }

  preventEvent = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  removeNode = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    const { nodeID, type } = this.props
    this.props.onRemoveNode && this.props.onRemoveNode({ nodeID, type })
  }
}
