import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Input, Icon, Row } from 'antd'
import classnames from 'classnames'
import './index.less'

export default class Enum extends Component {
  static defaultProps = {
    visible: false,
    disabled: false,
    enumList: []
  }

  static propTypes = {
    visible: PropTypes.bool,
    disabled: PropTypes.bool,
    enumList: PropTypes.array,
    onEnumAdd: PropTypes.func,
    onEnumDelete: PropTypes.func,
    onEnumChange: PropTypes.func
  }

  render() {
    const { visible, disabled, enumList } = this.props

    return <div className="field-enums"
                style={{ display: (visible ? '' : 'none') }}>
      <div className="enum-title">
        <span>key</span>
        <span>value</span>
      </div>
      <div className={'enum-container'}>
        {
          enumList.map((enumItem, index) => {
            const { key, value, keyError = false, valueError = false } = enumItem
            return (
              <Row className="enum-row" key={`${key}-${Math.random()}`}>
                <Input className={classnames({ 'has-error': keyError })} defaultValue={key} onChange={(e) => {
                  this.onEnumChange(e, index, 'key')
                }} placeholder="字符串" disabled={disabled} /> -
                <Input className={classnames({ 'has-error': valueError })} defaultValue={value} onChange={(e) => {
                  this.onEnumChange(e, index, 'value')
                }} disabled={disabled} />
                {
                  disabled ? null : <Icon type={index === 0 ? 'plus-circle' : 'minus-circle'}
                                          onClick={() => this.onIconClick(index)} />
                }
              </Row>
            )
          })
        }
      </div>
    </div>
  }

  onIconClick = (index) => {
    if (index === 0) {
      this.props.onEnumAdd()
    } else {
      this.props.onEnumDelete(index)
    }
  }

  onEnumChange = (e, index, prop) => {
    this.props.onEnumChange(e, index, prop)
  }
}
