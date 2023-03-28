import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Input, Icon, Row, Select } from 'antd'
import classnames from 'classnames'
import './index.less'
import { fetchFields4List } from '@action/leakage'

const { Option } = Select

export default class Enum extends Component {
  state = {}
  static defaultProps = {
    visible: false,
    disabled: false,
    list: [],
    type: 'ENUM'
  }

  static propTypes = {
    visible: PropTypes.bool,
    disabled: PropTypes.bool,
    type: PropTypes.string.isRequired,
    list: PropTypes.array,
    onEnumAdd: PropTypes.func,
    onEnumDelete: PropTypes.func,
    onEnumChange: PropTypes.func
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { visible } = nextProps
    if (visible && visible !== this.state.visible) {
      fetchFields4List().then(data => {
        const { content: listList = [] } = data
        this.setState({
          visible,
          listList
        })
      })
    } else {
      this.setState({ visible })
    }
  }

  componentDidMount() {
    const { type } = this.props
    if (type === 'LIST') {
      fetchFields4List().then(data => {
        const { content: listList = [] } = data
        this.setState({ listList })
      })
    }
  }

  render() {
    const { type, visible, disabled, list } = this.props
    const listCount = list.length
    const listValues = list.map(item => item.value)
    const { listList = [] } = this.state
    const isEnum = type === 'ENUM'
    const isList = type === 'LIST'
    return <div className="basic-field-enums"
                style={{ display: (visible ? '' : 'none') }}>
      {
        isEnum && <div className="enum-title">
          <span>key</span>
          <span>value</span>
        </div>
      }
      <div className={'enum-container'}>
        {
          list.map((enumItem, index) => {
            const { key, value, keyError = false, valueError = false } = enumItem
            return (
              <Row className="enum-row" key={`${key}-${Math.random()}`}>
                {
                  isEnum && <Fragment>
                    <Input className={classnames({ 'has-error': keyError })} defaultValue={key} onChange={(e) => {
                      this.onEnumChange(e, index, 'key')
                    }} placeholder="字符串" disabled={disabled} /> -
                    <Input className={classnames({ 'has-error': valueError })} defaultValue={value} onChange={(e) => {
                      this.onEnumChange(e, index, 'value')
                    }} disabled={disabled} />
                  </Fragment>
                }
                {
                  isList && <Select className={classnames({ 'has-error': valueError })} placeholder="" value={value}
                                    showSearch optionFilterProp="children"
                                    onChange={(e) => {
                                      this.onListChange(e, index, 'value')
                                    }}>
                    {
                      listList.filter(item => {
                        const { id } = item
                        return !listValues.includes(id) || (value === id)
                      }).map(item => {
                        const { id, fieldName } = item
                        return <Option key={id} value={id} title={fieldName}>{fieldName}</Option>
                      })
                    }
                  </Select>
                }
                {
                  disabled ? null : <Icon type={index === 0 ? 'plus-circle' : 'minus-circle'}
                                          onClick={() => this.onIconClick(index)} />
                }
                {
                  disabled ? null : index === 0 && listCount > 1 &&
                    <Icon type="minus-circle" onClick={() => this.props.onEnumDelete(index)} />
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
    this.props.onEnumChange(e.target.value, index, prop)
  }

  onListChange = (e, index, prop) => {
    this.props.onEnumChange(e, index, prop, true)
  }
}
