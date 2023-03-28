import React from 'react'
import PropTypes from 'prop-types'

const CCIFormItem = (props) => {
  // api
  // cci                重要，当item组件当作一个独立当渲染组件时 不填，此时 将不被克隆以及不克隆子组件
  // label              标题
  // width              整个组件的宽度
  // align              label部分对齐方式
  // labelStyle         label 部分样式
  // labelCallName      label部分class
  // required           是否必填
  // itemClassName      整个组件的class
  // validate           组件验证状态 validate.err 是否通过验证，validate.msg 验证提示
  // colon              是否有冒号
  // type               布局类型 line 一行布局 column 一列布局
  //
  // setdatasource      当作为CCIForm子组件时 由父组件添加，负责修改form内管理的数据
  // datasource         当作为CCIForm子组件时 由父组件添加，包含了全部的form管理的数据
  // let children = props.children
  const {
    label, width = '100%', align = 'right', labelStyle = {}, required = false, colon = false, type = 'line',
    itemClassName = '',
    labelClassName = '',
    validate = {}
  } = props
  // children.props['type'] = 'password'
  const { err: ruleError = false, msg: ruleMessage = '' } = validate
  let childrenWidth = '100%'
  if (type === 'line') {
    childrenWidth = `calc(${typeof width === 'number' ? `${width}px` : width} - ${labelStyle.width || '100px'})`
  }
  return (
    <div className={`cci-form-item ${itemClassName} cci-${type}-layout ${ruleError ? 'cci-form-item-with-help' : ''}`}
         style={{ width }}>
      {
        label ? (<div style={{ textAlign: align, ...labelStyle }}
                      className={`cci-form-item-label ${labelClassName}`}>{isRequired(required)}{label}{colon ? '：' : null}</div>) : null
      }
      <div style={{ width: childrenWidth }}
           className={`cci-form-item-children ${ruleError ? 'cci-form-item-error' : ''}`}>
        {getCloneElement()}
        {getError()}
      </div>

    </div>
  )

  // 克隆组件 添加props
  function getCloneElement() {
    // 如果 没有cci属性 就不克隆
    if (!props.cci) return props.children
    return React.Children.map(props.children, children => {
      // const { value } = children.props
      const { id, dataSource = {} } = props
      // if (value && value.length > 0 && (datasource[id] !== value)) {
      //   props.setDataSource(id, value)
      // }
      return React.cloneElement(children, {
        value: dataSource[id] ? dataSource[id] : '',
        onChange: (e) => {
          let value = e
          if (e.target) {
            value = e.target.value
          }
          props.setDataSource(id, value, children.props.onChange)
        }
      })
    })
  }

  function getError() {
    return ruleError ? <span
      className={`cci-form-item-error-message ${ruleError ? 'show-help-enter show-help-enter-active' : ''}`}>{ruleMessage}</span> : null
  }

  function isRequired(required) {
    return required ? (
      <span style={{ color: 'red' }}>*</span>) : null
  }
}
CCIFormItem.propTypes = {
  id: PropTypes.any,
  dataSource: PropTypes.any,
  setDataSource: PropTypes.any,
  cci: PropTypes.bool,
  required: PropTypes.bool,
  colon: PropTypes.bool,
  children: PropTypes.any,
  label: PropTypes.any,
  width: PropTypes.any,
  align: PropTypes.string,
  labelStyle: PropTypes.object,
  itemClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  type: PropTypes.string,
  validate: PropTypes.object
}
export default CCIFormItem
