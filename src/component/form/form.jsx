import React from 'react'
import PropTypes from 'prop-types'
import { validateFields } from './util'

export default class CCIForm extends React.Component {
  constructor(props) {
    super(props)
    const { dataSource = {} } = this.props
    this.state = {
      dataSource
    }
    // this.oldData = dataSource
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource = {} } = nextProps
    // if (JSON.stringify(this.oldData) !== JSON.stringify(dataSource)) {
    this.setState({
      dataSource
    })
    // this.oldData = dataSource
    // }
  }

  // dataSource     表单数据对象
  // onSubmit       表单提交回调
  // rules          表单规则校验
  // className          表单规则校验
  static propTypes = {
    dataSource: PropTypes.any.isRequired,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.any.isRequired,
    rules: PropTypes.array.isRequired,
    className: PropTypes.any,
    style: PropTypes.any
  }

  render() {
    const { className = '', style = {} } = this.props
    const { dataSource } = this.state
    const node = this.getCloneElement()
    console.log('validate', this.state.validate, dataSource)
    return (<form style={style} className={className} onSubmit={this.onSubmit}>{node.length === 0 ? null : node}</form>)
  }

  validateFields = (ids, callback) => {
    const { rules = [] } = this.props
    const { validate, dataSource } = this.state
    const obj = validateFields(this.rulesAddValue(rules, ids))
    console.log('obj', obj)
    console.log('validate', validate)
    this.setState({
      validate: { ...validate, ...obj }
    })
    if (typeof callback === 'function') {
      callback(!obj, dataSource)
    } else if (typeof ids === 'function') {
      ids(!obj, dataSource)
    }
  }
  rulesAddValue = (rules, ids) => {
    const { dataSource } = this.state
    let theCheck = []
    rules.forEach(item => {
      if (!!ids && typeof ids === 'object') {
        if (ids.indexOf(item.id) > -1) {
          console.log(ids)
          let newItem = { ...item }
          newItem.value = dataSource[item.id]
          theCheck.push(newItem)
        }
      } else {
        let newItem = { ...item }
        newItem.value = dataSource[item.id]
        theCheck.push(newItem)
      }
    })
    console.log('rulesAddValue', theCheck)
    return theCheck
  }
  onSubmit = (e) => {
    console.log('form submint')
    const { dataSource } = this.state
    const data = {
      dataSource,
      validateFields: this.validateFields
    }
    this.props.onSubmit(data, e)
  }
  getCloneElement = () => {
    const { dataSource, validate = {} } = this.state
    return React.Children.map(this.props.children, children => {
      if (children.props.cci) {
        const { id } = children.props
        const addProps = {
          setDataSource: this.setDataSource,
          dataSource: dataSource,
          validate: validate[id]
        }
        return React.cloneElement(children, addProps)
      }
      return children
    })
  }
  setDataSource = (key, value, callback) => {
    console.log('setDataSource', key, value)
    const { dataSource } = this.state
    const newData = { ...dataSource, [key]: value }
    this.setState({
      dataSource: newData
    }, () => {
      this.validateFields([key])
      if (typeof callback === 'function') {
        callback()
      }
    })
  }
}
