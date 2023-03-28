import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Button, Table, notification, Modal } from 'antd'
import { getTreeNodes, verifyTree } from '../../../../action/decision'

export default class NodeInfo extends React.Component {
  state = {
    nodeList: [],
    pathList: [],
    pathVisible: false
  }

  static propTypes = {
    id: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    isView: PropTypes.any
  }

  componentDidMount() {
    const { id } = this.props
    this.getNodeList(id)
  }

  componentWillReceiveProps(nextProps) {
    const { id = '', visible = false } = nextProps
    if (visible) {
      this.getNodeList(id)
    }
  }

  render() {
    const { nodeList: dataSource, pathVisible, pathList } = this.state
    const { isView } = this.props
    const columns = [
      {
        title: '节点类型',
        dataIndex: 'nodeType',
        key: 'nodeType',
        render: (text, record) => {
          const { root = false, isLeaf = false } = record
          return root ? <span style={{ color: '#1d94a1' }}>根节点</span>
            : isLeaf ? <span style={{ color: '#ff2426' }}>决策节点</span>
              : <span style={{ color: '#fdac23' }}>属性节点</span>
        }
      }, {
        title: '指标中文名',
        dataIndex: 'name',
        key: 'name'
      }, {
        title: '指标参数名',
        dataIndex: 'field',
        key: 'field'
      }, {
        title: '节点路径',
        dataIndex: 'nodePath',
        key: 'nodePath'
      }, {
        title: '路径表达式',
        dataIndex: 'nodePathExpr',
        key: 'nodePathExpr'
      }, {
        title: '决策结果',
        dataIndex: 'result',
        key: 'result',
        render: (text, record) => {
          const { riskGrade = '', decisionName } = record
          if (!decisionName) {
            return ''
          }
          return <span className={`risk-grade risk-grade-${riskGrade.toLocaleLowerCase()}`}>{decisionName}</span>
        }
      }
    ]

    const pathColumns = [{
      title: '节点路径',
      dataIndex: 'path',
      key: 'path',
      width: 300,
      render: text => {
        return text.join('--')
      }
    }, {
      title: '路径表达式',
      dataIndex: 'pathExpr',
      key: 'pathExpr',
      width: 300,
      render: text => {
        return text.join('&&')
      }
    }]

    return (
      <Fragment>
        {
          isView ? null
            : <div className="region-zd">
              <Button type="primary" onClick={this.verifyTree}>验证决策树</Button>
            </div>
        }
        <div style={{ height: isView ? '100%' : 'calc(100% - 40px)', overflowY: 'scroll' }}>
          <Table rowkey="indicatorsID" dataSource={dataSource}
                 columns={columns}
                 pagination={{
                   pageSize: 10,
                   showSizeChanger: true,
                   showTotal: (total) => `共 ${total} 条`
                 }} />
        </div>
        <Modal
          title="验证决策树" width={680}
          wrapClassName="edit-confirm-modal preview-modal"
          visible={pathVisible}
          maskClosable={false}
          okText="关闭"
          onCancel={this.verifyCancel}
          onOk={this.verifyCancel}
        >
          <Table columns={pathColumns} dataSource={pathList}
                 pagination={false} />
        </Modal>
      </Fragment>
    )
  }

  getNodeList = async (treeId) => {
    const { promise } = await getTreeNodes({ treeId })
    promise.then(data => {
      const { content: nodeList = [] } = data
      nodeList.forEach((n, i) => {
        n.key = i
        nodeList[i] = n
      })
      this.setState({
        nodeList
      })
    }).catch(data => {
      notification.warn(data.content)
    })
  }

  verifyTree = async () => {
    const { id: treeId } = this.props
    const { promise } = await verifyTree({ treeId })
    promise.then(data => {
      const { content: pathList = [] } = data
      pathList.forEach((p, i) => {
        p.key = i
        pathList[i] = p
      })
      this.setState({
        pathList,
        pathVisible: true
      })
    }).catch(data => {
      notification.warn(data.content)
    })
  }

  verifyCancel = () => {
    this.setState({
      pathVisible: false
    })
  }
}
