import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { notification } from 'antd'
import DataEditor from '../../../../component/editor'
import {
  getDecisionFlowNodes
} from '../../../../action/decision'
import './index.less'

export default class StrategyEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      nodeList: {}
    }
  }

  static propTypes = {
    id: PropTypes.number.isRequired,
    businessLineId: PropTypes.number.isRequired,
    isView: PropTypes.any
  }

  componentDidMount() {
    this.getFlowNodes()
  }

  render() {
    const { nodeList = {} } = this.state
    const { id, businessLineId, isView } = this.props
    return (
      <div className="flow-config">
        <DataEditor id={id} businessLineId={businessLineId} nodeList={nodeList}
                    refreshNodes={this.getFlowNodes} isView={isView} />
      </div>
    )
  }

  getFlowNodes = async () => {
    try {
      await getDecisionFlowNodes(this.props.id).then((data) => {
        const { content = [] } = data
        let nodeList = {}
        content.forEach(n => {
          nodeList[n.nodeId] = n
        })
        this.setState({ nodeList })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    } catch (err) {
    }
  }
}
