import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'antd'
import './index.less'
import CodeViewer from '../viewer'

export default class ViewerModal extends Component {
  constructor(props) {
    super(props)
    const { title, visible, data } = props
    this.state = { title, visible, data }
  }

  static defaultProps = {
    title: '调用信息',
    visible: false
  }

  static propTypes = {
    title: PropTypes.any.isRequired,
    visible: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const { title, visible, data } = nextProps
    this.setState({ title, visible, data })
  }

  render() {
    const { title, visible, data } = this.state
    const { requestParams = {}, responseParams = {} } = data

    return <Modal title={title} width="800px"
                  visible={visible} onCancel={this.props.onCancel}
                  footer={<Button type="default" onClick={this.props.onCancel}>关闭窗口</Button>}>
      <div>
        <div className="test-half">
          <div className="title">
            请求参数
          </div>
          <div className="code-container">
            <CodeViewer code={requestParams} />
          </div>
        </div>
        <div className="test-half">
          <div className="title">
            响应参数
          </div>
          <div className="code-container">
            <CodeViewer code={responseParams} />
          </div>
        </div>
      </div>
    </Modal>
  }
}
