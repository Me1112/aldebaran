import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import './index.less'
import { Input, InputNumber, Modal, notification, Select, Checkbox, DatePicker } from 'antd'
import { getBusinessFields, getHitRules } from '../../action/event'
import { getAllOperators } from '../../action/common'
import { getEnumList } from '../../action/rule'
import { buildUrlParamNew } from '../../util'

const { Option } = Select

const BOOLEAN = 'BOOLEAN'
const DATETIME = 'DATETIME'
const DECIMAL = 'DECIMAL'
const ENUM = 'ENUM'

export default class AdvanceQuery extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...props
    }
  }

  static defaultProps = {}

  static propTypes = {
    beginDate: PropTypes.string,
    endDate: PropTypes.string,
    businessLineId: PropTypes.string,
    appId: PropTypes.string,
    scenarioValue: PropTypes.string,
    callback: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    onQuery: PropTypes.func
  }

  componentWillReceiveProps(nextProps) {
    const { beginDate, endDate, businessLineId, appId, scenarioValue } = this.props
    this.setState({ ...nextProps }, () => {
      if (nextProps.businessLineId !== businessLineId) {
        this.getBusinessFields()
      }
      if (nextProps.appId !== appId || nextProps.scenarioValue !== scenarioValue ||
        nextProps.beginDate !== beginDate || nextProps.endDate !== endDate) {
        this.getHitRules()
      }
    })
  }

  componentDidMount() {
    this.getBusinessFields()
    this.getAllOperators()
    this.getHitRules()
  }

  render() {
    const {
      visible = false,
      businessFields = [],
      appId = '',
      scenarioValue = '',
      hitRuleIds = [],
      businessFieldSelect = [],
      allOperators = {},
      hitRuleSelect = [],
      enumSelect = []
    } = this.state
    // 过滤查询区已有查询字段
    const fieldSelect = businessFieldSelect.filter(f => [
      'occur_time',
      'strategy_type',
      'app_id',
      'final_score',
      'decision_result',
      'scenario_value',
      'business_line_id'].indexOf(f.fieldName) === -1)
    return <Modal title="高级查询" width="800px"
                  wrapClassName="edit-confirm-modal"
                  visible={visible}
                  maskClosable={false}
                  okText="查询"
                  cancelText="取消"
                  onCancel={() => {
                    this.onCancel()
                  }}
                  onOk={() => {
                    this.onOk()
                  }}
    >
      <span className="advance-left">业务字段:</span>
      <div className="advance-right">
        {
          businessFields.map((businessField, i) => {
            const { field = '', operator = '', value = '' } = businessField
            const f = fieldSelect.find(b => b.fieldName === field) || {}
            const operatorSelect = allOperators[f.dataType] || []

            return <div key={i} className="business-field">
              <Select value={field} placeholder="请选择业务字段" style={{ width: 200, marginRight: 10 }}
                      onChange={(e) => this.onSelectChange(e, 'field', i, f.dataType)} allowClear>
                {
                  fieldSelect.map(field => {
                    const { fieldName = '', fieldDisplayName = '' } = field
                    return <Option key={fieldName} value={fieldName}>{fieldDisplayName}</Option>
                  })
                }
              </Select>
              <Select value={operator} placeholder="请选择操作" style={{ width: 200, marginRight: 10 }}
                      onChange={(e) => this.onSelectChange(e, 'operator', i, f.dataType)} allowClear>
                {
                  operatorSelect.map(o => {
                    const { operator = '', description = '' } = o
                    return <Option key={operator} value={operator}>{description}</Option>
                  })
                }
              </Select>
              {
                f.dataType === BOOLEAN
                  ? <Select value={value} placeholder="请选择字段值" style={{ width: 200, marginRight: 5 }}
                            onChange={(e) => this.onSelectChange(e, 'value', i, f.dataType)} allowClear>
                    <Option value="true">是</Option>
                    <Option value="false">否</Option>
                  </Select>
                  : f.dataType === ENUM
                  ? <Select mode="multiple" value={value || []} placeholder="请选择字段值"
                            style={{ width: 200, marginRight: 5 }} optionFilterProp="children"
                            onChange={(e) => this.onSelectChange(e, 'value', i, f.dataType)} allowClear>
                    {
                      enumSelect.map(o => {
                        const { key = '', value = '' } = o
                        return <Option key={key} value={key}>{value}</Option>
                      })
                    }
                  </Select>
                  : f.dataType === DECIMAL
                    ? <InputNumber value={value} min={0}
                                   onChange={e => this.onSelectChange(e, 'value', i, f.dataType)}
                                   style={{ width: 200, marginRight: 5 }} maxLength={50} placeholder="请输入字段值" />
                    : f.dataType === DATETIME
                      ? <DatePicker value={value ? moment(value) : undefined} showTime
                                    format="YYYY-MM-DD HH:mm:ss" placeholder="请选择时间"
                                    style={{ width: 200, marginRight: 5 }}
                                    onChange={(date, dateStr) => {
                                      this.onSelectChange(dateStr, 'value', i, f.dataType)
                                    }}
                                    allowClear />
                      : <Input value={value} style={{ width: 200, marginRight: 5 }}
                               onChange={(e) => this.onInputChange(e, 'value', i, f.dataType)} placeholder="请输入字段值" />
              }
              <i className="anticon anticon-delete cursor-pointer" onClick={() => this.onFieldDelete(i)} />
            </div>
          })
        }
        <div className="create-field" onClick={this.createField}>
          + 添加查询字段
        </div>
      </div>
      {
        appId && scenarioValue ? <Fragment>
          <br />
          <span className="advance-left">命中规则:</span>
          <div className="advance-right hit-rule">
            {
              hitRuleSelect.map((hitRule, index) => {
                const { ruleId: id = '', ruleName = '' } = hitRule
                const checked = hitRuleIds.indexOf(id) !== -1
                return <div key={index}>
                  <Checkbox checked={checked} style={{}}
                            onChange={() => this.onHitRuleCheckedChange(id)}>
                    {ruleName}
                  </Checkbox>
                </div>
              })
            }
          </div>
        </Fragment> : null
      }
    </Modal>
  }

  preventEvent = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  getBusinessFields = () => {
    const { businessLineId = '' } = this.state
    getBusinessFields({
      businessLineId
    }).then(data => {
      const { content: businessFieldSelect = [] } = data
      this.setState({
        businessFieldSelect
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getAllOperators = () => {
    getAllOperators().then(data => {
      const { content: allOperators = [] } = data
      this.setState({
        allOperators
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getHitRules = () => {
    const { isTesting = false, appId = '', scenarioValue = '', beginDate = '', endDate = '' } = this.state
    if (appId && scenarioValue) {
      getHitRules({
        isTesting,
        appId,
        scenarioValue,
        beginDate,
        endDate
      }).then(data => {
        const { content: hitRuleSelect = [] } = data
        this.setState({
          hitRuleSelect
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    }
  }

  getEnumList = (name) => {
    getEnumList(name).then(res => {
      const { content = {} } = res
      let { data: enumSelect = [] } = JSON.parse(content.enumOption || '')
      this.setState({ enumSelect })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onHitRuleCheckedChange = id => {
    const { hitRuleIds = [] } = this.state
    const index = hitRuleIds.indexOf(id)
    if (index === -1) {
      hitRuleIds.push(id)
    } else {
      hitRuleIds.splice(index, 1)
    }
    this.setState({
      hitRuleIds
    })
  }

  onCancel = () => {
    this.props.onClose && this.props.onClose()
  }

  onOk = () => {
    const { businessFields = [], hitRuleIds = [] } = this.state
    const incompleteIndex = businessFields.findIndex(businessField => {
      const {
        field = '',
        operator = '',
        value = ''
      } = businessField
      return !(field.length * operator.length * value.toString().length)
    })
    if (incompleteIndex === -1) {
      this.props.onQuery && this.props.onQuery(businessFields, hitRuleIds)
    } else {
      notification.warning({ message: '请将业务字段信息填写完整' })
    }
  }

  onSelectChange = (value, field, index, fieldType) => {
    const { businessFieldSelect = [], businessFields = [] } = this.state
    businessFields[index] = { ...businessFields[index], [field]: value, fieldType }
    if (field === 'field') {
      // 业务字段更改，重置操作符和字段值
      businessFields[index] = { ...businessFields[index], operator: '', value: '' }
      // 枚举字段则获取对应枚举值列表
      const f = businessFieldSelect.find(b => b.fieldName === value) || {}
      const { dataType, fieldDataCategory } = f
      if (dataType === ENUM) {
        this.getEnumList(buildUrlParamNew({ fieldName: value, fieldDataCategory }))
      }
    }
    this.props.callback({
      businessFields
    })
  }

  onInputChange = (e, field, index, fieldType) => {
    this.onSelectChange(e.target.value, field, index, fieldType)
  }

  onFieldDelete = i => {
    const { businessFields = [] } = this.state
    businessFields.splice(i, 1)
    this.props.callback({
      businessFields
    })
  }

  createField = () => {
    const { businessFields = [] } = this.state
    this.props.callback({
      businessFields: [...businessFields, {}]
    })
  }
}
