import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { notification, Select, Icon } from 'antd'
import { getCaseRisk, getCaseSubject } from '../../../action/case'
import { buildUrlParamNew, initFieldListData } from '../../../util'
import { getListRightData } from '../../../action/rule'
import { getEffectiveTermList } from '../../../action/common'
import { getFieldList } from '../../../action'
import { CASE_RISK, CASE_SUBJECT } from '../../../common/case'
import './index.less'

const { Option, OptGroup } = Select

export default class TriggerAction extends Component {
  constructor(props) {
    super(props)

    const { value: { autoActionType, blackField, blackTypeId, caseSubject, effectiveTerm, mainField, riskTypes } = {} } = props
    this.state = {
      autoActionType,
      blackField,
      blackTypeId,
      caseSubject,
      effectiveTerm,
      mainField,
      riskTypes,
      value: { autoActionType, blackField, blackTypeId, caseSubject, effectiveTerm, mainField, riskTypes }
    }
  }

  static defaultProps = {
    disabled: false
  }

  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool.isRequired,
    businessLineId: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
    onChange: PropTypes.func
  }

  componentDidMount() {
    this.getCaseRisk()
    this.getCaseSubject()
    this.getFieldList()
    this.getEffectiveTermList()
  }

  render() {
    const { disabled, onRemove } = this.props
    const {
      autoActionType, fieldList = [], blackListTypeList = [], effectiveTermList = [], caseSubjects = [],
      caseRisks = [], blackField, blackTypeId, effectiveTerm, mainField, riskTypes
    } = this.state
    return <Fragment>
      <div>
        <Select placeholder="请选择触发动作" style={{ width: 200 }} value={autoActionType} onChange={this.changeActionType}
                disabled={disabled}>
          <Option value="ADD_BLACK">自动加入名单</Option>
          <Option value="ADD_RISK_CASE">自动生成案件</Option>
        </Select>
        {
          !disabled ? <Icon type="delete" className="cursor-pointer" style={{ marginLeft: 10 }}
                            onClick={(i) => onRemove(i)} /> : null
        }
      </div>
      {
        autoActionType === 'ADD_BLACK'
          ? <Fragment>
            <span className="inline-form-item">将事件中的</span>
            <Select placeholder="请选择字段" className="inline-form-item" style={{ width: '140px' }} disabled={disabled}
                    value={fieldList.length > 0 ? blackField : undefined} onChange={this.changeListField}>
              {
                fieldList.map(item => {
                  return this.fieldOpt(item)
                })
              }
            </Select>
            <span className="inline-form-item">加入</span>
            <Select placeholder="请选择名单" className="inline-form-item" style={{ width: '140px' }}
                    value={blackListTypeList.length > 0 ? blackTypeId : undefined} disabled={disabled}
                    onChange={(e) => this.onChange(e, 'blackTypeId')}>
              {
                blackListTypeList.map((item, index) => {
                  return <Option key={item.id || index} value={item.id}>{item.listName}</Option>
                })
              }
            </Select>
            <span className="inline-form-item">有效期</span>
            <Select placeholder="请选择" style={{ width: '100px' }}
                    value={effectiveTermList.length > 0 ? effectiveTerm : undefined} disabled={disabled}
                    onChange={(e) => this.onChange(e, 'effectiveTerm')}>
              {
                effectiveTermList.map(effectiveTerm => {
                  const { name = '', desc = '' } = effectiveTerm
                  return <Option key={name} value={name}>{desc}</Option>
                })
              }
            </Select>
          </Fragment> : null
      }
      {
        autoActionType === 'ADD_RISK_CASE'
          ? <Fragment>
            <span className="inline-form-item">将事件中的</span>
            <Select placeholder="请选择字段" className="inline-form-item" style={{ width: '140px' }}
                    value={caseSubjects.length > 0 ? mainField : undefined} disabled={disabled}
                    onChange={(e) => this.onChange(e, 'mainField')}>
              {
                caseSubjects.map((subject) => {
                  const { mainField, subjectName } = subject
                  return (
                    <Option key={subjectName} value={mainField}
                            sc={mainField}>{CASE_SUBJECT[subjectName]}</Option>
                  )
                })
              }
            </Select>
            <span className="inline-form-item">自动生成风险类型为</span>
            <Select mode="multiple" className="inline-form-item" placeholder="选择风险类型" style={{ width: '150px' }}
                    value={caseRisks.length > 0 && riskTypes ? riskTypes.split(',') : []} disabled={disabled}
                    onChange={(e = []) => this.onChange(e.join(',') || undefined, 'riskTypes')}>
              {
                caseRisks.map(risk => {
                  return (
                    <Option key={risk} value={risk}>{CASE_RISK[risk]}</Option>
                  )
                })
              }
            </Select>
            <span className="inline-form-item">的案件。</span>
          </Fragment> : null
      }
    </Fragment>
  }

  onChange = (v, field) => {
    console.log('onChange', field, v)
    let { value, caseSubjects } = this.state
    if (field === 'mainField') {
      const { subjectName: caseSubject } = caseSubjects.find(item => item.mainField === v)
      value = { ...value, caseSubject }
    }
    value = { ...value, [field]: v }
    this.setState({
      value,
      [field]: v
    }, () => {
      this.triggerChange({ [field]: v })
    })
  }

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { value = {} } = this.state
    console.log('onChange123', value, Object.assign({}, value, changedValue))
    const { onChange } = this.props
    if (onChange) {
      onChange(Object.assign({}, value, changedValue))
    }
  }

  fieldOpt = item => {
    const { name, list = [] } = item
    return <OptGroup key={name} value={name}>
      {
        list.map(l => {
          const { fieldName, fieldDisplayName } = l
          return <Option key={fieldName} dataobj={l} value={fieldName}
                         title={fieldDisplayName}>{fieldDisplayName}</Option>
        })
      }</OptGroup>
  }

  changeActionType = (autoActionType) => {
    const value = { autoActionType }
    this.setState({
      value,
      blackField: undefined,
      blackTypeId: undefined,
      caseSubject: undefined,
      effectiveTerm: undefined,
      mainField: undefined,
      riskTypes: undefined,
      autoActionType
    }, () => {
      this.triggerChange({ autoActionType })
    })
  }

  getCaseSubject = () => {
    const { businessLineId } = this.props
    getCaseSubject({ businessLineId }).then(data => {
      const { content: caseSubjects = [] } = data
      this.setState({ caseSubjects })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getCaseRisk = () => {
    getCaseRisk().then(data => {
      const { content: caseRisks = [] } = data
      this.setState({ caseRisks })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getFieldList = () => {
    const { businessLineId } = this.props
    // 获取参数名
    getFieldList({ businessLineId, hasDimensionality: true, fieldCategory: 'FIELD' }).then(res => {
      const { content } = res
      const { tree, list } = initFieldListData(content)
      this.setState({
        fieldList: tree,
        fieldListSrc: list
      }, () => {
        const { autoActionType, blackField } = this.state
        if (autoActionType === 'ADD_BLACK' && blackField) {
          this.changeListField(blackField, true)
        }
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getEffectiveTermList = () => {
    getEffectiveTermList().then(data => {
      const { content: effectiveTermList = [] } = data
      this.setState({
        effectiveTermList
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  changeListField = (e, setting = false) => {
    // 名单命中leftData 修改
    let id = ''
    const { fieldListSrc = [] } = this.state
    fieldListSrc.forEach(item => {
      if (item.fieldName === e) {
        id = item.dimensionalityId
      }
    })
    if (setting !== true) {
      let { value } = this.state
      value = { ...value, blackField: e, blackTypeId: undefined }
      this.setState({ value, blackField: e, blackTypeId: undefined }, () => {
        this.triggerChange({ blackField: e })
      })
    }
    console.log('changeListField', setting, e, id, buildUrlParamNew({ id, type: 'CUSTOM' }))
    getListRightData(buildUrlParamNew({ id, type: 'CUSTOM' })).then(res => {
      const { content = [] } = res
      this.setState({ blackListTypeList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}
