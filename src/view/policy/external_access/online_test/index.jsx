// 在线测试
import React, { Fragment } from 'react'
import LayoutRight from '../../../../component/layout_right'
import { getValidationScenarioFields, getValidationExternalAccess } from '../../../../action/external_access'
import { buildUrlParamNew } from '../../../../util'
import { notification, Form, InputNumber, Button, Input, DatePicker, Select } from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import './index.less'
import FormItem from 'antd/es/form/FormItem'
import { Map } from 'immutable'
import connect from 'react-redux/es/connect/connect'

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 10 }
}
const { Option } = Select
const { DECIMAL, STRING, BOOLEAN, DATETIME, ENUM } = {
  DECIMAL: 'DECIMAL',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  DATETIME: 'DATETIME',
  ENUM: 'ENUM'
}

function mapStateToProps(state) {
  const { decision = Map({}) } = state
  const { riskPolicyMap = {} } = decision.toJS()
  return { riskPolicyMap }
}

function mapDispatchToProps(dispatch) {
  return {}
}

class OnlineTest extends React.Component {
  state = {}
  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.any.isRequired,
    riskPolicyMap: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.getValidationScenarioFields()
  }

  render() {
    const { form } = this.props
    const { state = {} } = this.props.history.location
    const { appName, scenarioName, status, strategyInfo: [{ strategyId, strategyName } = {}, { strategyId: strategyId2, strategyName: strategyName2 } = {}] = [], scenarioId } = state
    const { getFieldProps } = form
    const { scenarioList = [], clearAccess = false } = this.state
    const fieldFormItem = this.renderFieldFormItem()
    const renderFieldAccess = this.renderFieldAccess()
    return <LayoutRight className={'policy-joinup-onLineTest'}
                        breadCrumb={['策略配置', '外部接入', '在线测试']} type="tabs">
      <header>
        <span>接入应用：</span><span>{appName}</span>
        <span>接入场景：</span><span>{scenarioName}</span>
        <span>策略：</span>
        {
          status === 'AB_TEST' ? <Select defaultValue={strategyId} style={{ width: 200 }}
                                         dropdownMatchSelectWidth={false} onChange={this.onTestStrategyIdChange}>
              <Option value={strategyId}>{strategyName}</Option>
              <Option value={strategyId2}>{strategyName2}</Option>
            </Select>
            : <span>{strategyName}</span>
        }
      </header>
      <div className={'policy-joinup-onLineTest-content'}>
        <div className={'module-content left-form'} id="leftForm">
          <h4>在线测试</h4>
          <div className="form-container">
            <Form>
              <FormItem {...formItemLayout} label="场景" key="scenarioId">
                <Select placeholder="场景" {...getFieldProps('scenarioId', {
                  initialValue: scenarioId,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择场景' }
                    ]
                  }]
                })}>
                  {
                    scenarioList.map(app => {
                      const { scenarioDicId, scenarioName } = app
                      return (
                        <Option key={scenarioDicId} value={scenarioDicId}>{scenarioName}</Option>
                      )
                    })
                  }
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} label="时间" key="occurTime">
                <DatePicker showTime={{ format: 'HH:mm:ss' }}
                            getCalendarContainer={() => document.getElementById('leftForm')}
                            format="YYYY-MM-DD HH:mm:ss" placeholder="时间" style={{ width: '100%' }}
                            allowClear {...getFieldProps('occurTime', {
                  validate: [{
                    rules: [
                      { required: true, message: '请选择时间' }
                    ]
                  }],
                  onChange: (date, time) => this.formatTime(time, 'occurTime')
                })} />
              </FormItem>
              {
                fieldFormItem
              }
              <FormItem {...formItemLayout} label={' '} colon={false}>
                <Button type="primary" onClick={this.save}>提交</Button>
                <Button style={{ marginLeft: 20 }} onClick={this.resetAllFields}>重置</Button>
              </FormItem>
            </Form>
          </div>
        </div>
        <div className={'module-content right-form'}>
          <h4>测试结果</h4>
          {
            clearAccess ? null : renderFieldAccess
          }
        </div>
      </div>
    </LayoutRight>
  }

  onTestStrategyIdChange = e => {
    this.setState({ strategyIdSelected: e, clearAccess: true }, () => {
      this.props.form.resetFields()
      this.getValidationScenarioFields()
    })
  }

  resetAllFields = () => {
    const scenarioId = this.props.form.getFieldValue('scenarioId')
    const { fieldDtosMap = {} } = this.state
    const fields = fieldDtosMap[scenarioId] || []
    const data = fields.map(f => f.fieldCode)
    console.log('resetAllFields', data, fields, fieldDtosMap)
    this.props.form.resetFields(['occurTime', ...data])
  }

  renderFieldAccess = () => {
    const { testAccess = {}, scenarioList = [] } = this.state
    const { riskPolicyMap = {} } = this.props
    const { factorsResult = [], decisionResult, strategyType, characters = [], path = '', streamPath = [], hitRules = [], eventId } = testAccess
    const { decisionName = decisionResult } = riskPolicyMap[decisionResult] || {}
    return <Fragment>
      {
        decisionResult ? <div className="access-content">
          <h4>决策信息</h4>
          <div><span>决策结果：</span><span>{decisionName}</span>
          </div>
          {strategyType === 'RULE_SET' ? <div>
            <span>触发规则：</span>
            <div className="right-list">
              {
                hitRules.map((item, index) => {
                  return <div key={`${strategyType}_${index}`}>
                    {index + 1}、{item}
                  </div>
                })
              }
            </div>
          </div> : null}
          {strategyType === 'SCORE_CARD' ? <div>
            <span>因子明细：</span>
            <div className="right-list">
              {
                characters.map((item, index) => {
                  return <div key={`${strategyType}_${index}`}>
                    {item}
                  </div>
                })
              }
            </div>
          </div> : null}
          {strategyType === 'DECISION_TREE' ? <div>
            <span>决策路径：</span>{path}</div> : null}
          {strategyType === 'DECISION_STREAM' ? <div>
            <span>决策路径：</span>
            <div className="right-list">
              {
                streamPath.map((item, index) => {
                  return <div key={`${strategyType}_${index}`}>
                    {item} {index === streamPath.length - 1 ? '' : '=>'}
                  </div>
                })
              }
            </div>
          </div> : null}
        </div> : null
      }
      {
        factorsResult.length > 0 ? <div className={'access-content'}>
          <h4>指标信息</h4>
          {
            factorsResult.map((item, index) => {
              const { name, value } = item
              return <div key={`access_${strategyType}_${index}`}>
                {index + 1}、{name}: {value}
              </div>
            })
          }
        </div> : null
      }
      {eventId ? <Button type="primary" onClick={() => {
        const { state = {} } = this.props.history.location
        const { appId, strategyInfo: [{ strategyId }] = [] } = state
        const { strategyIdSelected = strategyId } = this.state
        let scenarioValue = ''
        const scenarioId = this.props.form.getFieldValue('scenarioId')
        scenarioList.forEach(item => {
          if (item.scenarioDicId === scenarioId) {
            scenarioValue = item.scenarioValue
          }
        })
        const data = {
          appId,
          eventId,
          scenarioValue,
          strategyId: strategyIdSelected,
          strategyType,
          conditions: { ...state, saveData: this.saveData },
          isTesting: true
        }
        console.log('detail', data)
        this.props.history.push({
          pathname: '/policy/joinup/config/test/detail',
          state: {
            operation: false,
            backUrl: '/policy/joinup/config/online-test',
            ...data,
            breadCrumb: ['策略配置', '外部接入', '在线测试', '详情']
          }
        })
      }}>数据详情</Button> : null}
    </Fragment>
  }

  renderFieldFormItem = () => {
    const { fieldDtosMap = {} } = this.state
    const { form } = this.props
    const { getFieldProps, getFieldDecorator } = form
    const scenarioId = this.props.form.getFieldValue('scenarioId')
    const fieldDtos = fieldDtosMap[scenarioId] || []
    return fieldDtos.map(item => {
      const { fieldType, fieldName, required, fieldCode, fieldId: id, enumOption = '' } = item
      let dom = null
      switch (fieldType) {
        case DECIMAL: {
          dom = <FormItem {...formItemLayout} label={fieldName} key={id}>
            {
              getFieldDecorator(fieldCode, {
                rules: [{
                  required: required,
                  message: '字段必填'
                }]
              })(
                <InputNumber maxLength={10} style={{ width: '100%' }} placeholder={fieldName} />
              )
            }
          </FormItem>
          break
        }
        case STRING: {
          dom = <FormItem {...formItemLayout} label={fieldName} key={id}>
            {
              getFieldDecorator(fieldCode, {
                rules: [{
                  required: required,
                  message: '字段必填'
                }]
              })(
                <Input style={{ width: '100%' }} placeholder={fieldName} />
              )
            }
          </FormItem>
          break
        }
        case BOOLEAN:
        case ENUM:
          let list = []
          if (fieldType === BOOLEAN) {
            list = [{ key: 'true', value: '是' }, { key: 'false', value: '否' }]
          } else {
            const { data: enumList } = JSON.parse(enumOption)
            list = enumList
          }
          dom = <FormItem {...formItemLayout} label={fieldName} key={id}>
            <Select placeholder={fieldName} style={{ width: '100%' }} allowClear {...getFieldProps(fieldCode, {
              validate: [{
                rules: [
                  { required: required, message: '字段必选' }
                ]
              }]
            })}>
              {
                list.map(app => {
                  const { key, value } = app
                  return (
                    <Option key={key} value={key}>{value}</Option>
                  )
                })
              }
            </Select>
          </FormItem>
          break
        case DATETIME: {
          dom = <FormItem {...formItemLayout} label={fieldName} key={id}>
            <DatePicker showTime={{ format: 'HH:mm:ss' }}
                        getCalendarContainer={() => document.getElementById('leftForm')}
                        format="YYYY-MM-DD HH:mm:ss" placeholder={fieldName} style={{ width: '100%' }}
                        allowClear {...getFieldProps(fieldCode, {
              validate: [{
                rules: [
                  { required: required, message: '请选择时间' }
                ]
              }],
              onChange: (date, time) => this.formatTime(time, fieldCode)
            })} />
          </FormItem>
          break
        }
      }
      return dom
    })
  }

  formatTime = (date, key) => {
    let { formatTime = {} } = this.state
    formatTime[key] = date ? new Date(date).getTime() : null
    this.setState({ formatTime })
    console.log('formatTime', formatTime)
  }
  save = e => {
    if (e) {
      e.preventDefault()
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { state = {} } = this.props.history.location
        const { id, strategyInfo: [{ strategyId } = {}] = [] } = state
        let { formatTime = {}, strategyIdSelected = strategyId } = this.state
        let data = { strategyId: strategyIdSelected, externalAccessId: id }
        let incomeParams = {}
        Object.keys(values).forEach(key => {
          if (key !== 'scenarioId' && key !== 'occurTime') {
            incomeParams[key] = values[key]
          } else {
            if (key === 'occurTime') {
              data[key] = values[key].valueOf()
            } else {
              data[key] = values[key]
            }
          }
        })
        let incomeParamsObj = { ...incomeParams, ...formatTime }
        incomeParams = JSON.stringify(incomeParamsObj)
        const { occurTime } = this.props.form.getFieldsValue()
        let dataObj = { ...data, incomeParams, occurTime: occurTime.valueOf() }
        getValidationExternalAccess(dataObj).then(res => {
          const { content = {} } = res
          this.saveData = { ...incomeParamsObj, ...data }
          this.saveData['occurTime'] = occurTime.valueOf()
          this.setState({ clearAccess: false, testAccess: content })
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      }
    })
  }
  getValidationScenarioFields = e => {
    const { state = {} } = this.props.history.location
    const { id, saveData, strategyInfo: [{ strategyId } = {}] = [] } = state
    const { strategyIdSelected = strategyId } = this.state
    getValidationScenarioFields(buildUrlParamNew({
      externalAccessId: id,
      strategyId: strategyIdSelected
    })).then(res => {
      const { content = [] } = res
      let scenarioList = []
      let fieldDtosMap = {}
      let allFielISDateKey = ['occurTime']
      content.forEach(item => {
        const { scenarioDto, fieldDtos = [] } = item
        scenarioList.push(scenarioDto)
        fieldDtosMap[scenarioDto.scenarioDicId] = fieldDtos
        // 取出所有时间类型key
        fieldDtos.forEach(field => {
          const { fieldCode, fieldType } = field
          if (fieldType === DATETIME) {
            allFielISDateKey.push(fieldCode)
          }
        })
      })
      this.setState({ scenarioList, fieldDtosMap }, () => {
        let { formatTime = {} } = this.state
        if (saveData) {
          allFielISDateKey.forEach(key => {
            const value = saveData[key]
            if (value) {
              formatTime[key] = value
              saveData[key] = moment(value)
            }
          })
          delete saveData['externalAccessId']
          this.props.form.setFieldsValue({ ...saveData })
          this.setState({ formatTime }, () => {
            // this.save()
          })
        }
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(OnlineTest))
