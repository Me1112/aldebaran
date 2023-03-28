import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import './index.less'

export default class CodeViewer extends PureComponent {
  static defaultProps = {
    space: 2
  }

  static propTypes = {
    code: PropTypes.any.isRequired,
    space: PropTypes.number.isRequired
  }

  render() {
    const { code, space } = this.props
    const value = typeof code === 'string' ? code : JSON.stringify(code, null, space)
    return <CodeMirror key={Math.random()} className="code-viewer" value={value} options={{
      readOnly: true,
      mode: 'javascript',
      tabSize: '2'
    }} />
  }
}
