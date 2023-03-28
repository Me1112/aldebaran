// 指标测试测试
import React, { Fragment } from 'react'
import { notification, Form, InputNumber, Button, Input, DatePicker, Select, Modal, Table } from 'antd'
import PropTypes from 'prop-types'
import './index.less'
import FormItem from 'antd/es/form/FormItem'
import { getUsedFields, saveFactorValidation } from '../../../action/policy'
import { buildUrlParamNew, formatDate } from '../../../util'

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 }
}
const { Option } = Select
const { DECIMAL, STRING, BOOLEAN, DATETIME, ENUM } = {
  DECIMAL: 'DECIMAL',
  STRING: 'STRING',
  BOOLEAN: 'BOOLEAN',
  DATETIME: 'DATETIME',
  ENUM: 'ENUM'
}

class IndicatorsTest extends React.Component {
  state = {}
  subjectsField = {}
  enumOrBoolName = {}
  static propTypes = {
    form: PropTypes.any,
    sceneList: PropTypes.any,
    onCancel: PropTypes.func,
    visible: PropTypes.any,
    dataSrc: PropTypes.any
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const { visible, dataSrc } = nextProps
    if (visible !== this.props.visible) {
      this.props.form.resetFields()
      let fieldDtosList = []
      let dataSource = []
      this.setState({ dataSrc, visible, dataSource, fieldDtosList, factorData: '' }, () => {
        this.getValidationScenarioFields()
      })
    }
  }

  componentDidMount() {
  }

  render() {
    const { form, dataSrc = {} } = this.props
    // const { state = {} } = this.props.history.location
    const { factorName } = dataSrc
    const { getFieldProps } = form
    const { scenarioList = [] } = this.state
    const fieldFormItem = this.renderFieldFormItem()
    const renderFieldAccess = this.renderFieldAccess()
    const header = <div>{factorName}</div>
    return <Modal wrapClassName={'vertical-end-modal'} visible={this.props.visible} footer={null}
                  title={header}
                  onCancel={this.onCancel}
                  style={{ width: '100%', bottom: '0' }}>
      <div className={'policy-indicators-test-content'}>
        <div className={'module-content left-form'}>
          <h4>测试条件</h4>
          <Form>
            <FormItem {...formItemLayout} label="场景">
              <Select placeholder="场景" allowClear {...getFieldProps('scenario_value', {
                // initialValue: scenarioId,
                validate: [{
                  rules: [
                    { required: true, message: '请选择场景' }
                  ]
                }],
                onChange: this.changeAppId
              })}>
                {
                  scenarioList.map(app => {
                    const { scenarioValue, scenarioName } = app
                    return (
                      <Option key={scenarioValue} value={scenarioValue}>{scenarioName}</Option>
                    )
                  })
                }
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="进件时间">
              <DatePicker placeholder="进件时间" showTime={{ format: 'HH:mm:ss' }}
                          format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }}
                          allowClear {...getFieldProps('occur_time', {
                // initialValue: scenarioId,
                validate: [{
                  rules: [
                    { required: true, message: '请选择时间' }
                  ]
                }],
                onChange: (date, time) => this.formatTime(time, 'occur_time')
              })} />
            </FormItem>
            {
              fieldFormItem
            }
            <FormItem {...formItemLayout} label={' '} colon={false}>
              <Button type="primary" onClick={this.save}>保存</Button>
            </FormItem>
          </Form>
        </div>
        <div className={'module-content right-form'}>
          <h4>测试结果: <span>{factorName}：</span> <span
            className={'factor-data'}>{!this.state.factorData ? '-' : this.state.factorData}</span></h4>
          <div className={'table-content'}>
            {
              renderFieldAccess
            }
          </div>
        </div>
      </div>
    </Modal>
  }

  onCancel = () => {
    this.props.onCancel()
    this.props.form.resetFields()
    this.setState({ dataSource: [], fieldDtosList: [], factorData: '' })
  }

  renderFieldAccess = () => {
    const { fieldDtosList = [], dataSource = [] } = this.state
    let col = [{
      title: '场景',
      dataIndex: 'scenario_value',
      key: 'scenario_value',
      render: (text) => {
        const { sceneList = [] } = this.props
        const { scenarioName } = sceneList.find(item => item.scenarioValue === text)
        return <span>{scenarioName}</span>
      }
    }, {
      title: '进件时间',
      dataIndex: 'occur_time',
      key: 'occur_time',
      // defaultSortOrder: 'descend',
      render: (text) => {
        return <span>{formatDate(text)}</span>
      }
    }
    ]
    fieldDtosList.forEach(item => {
      const { name: fieldName, code: fieldCode, fieldType } = item
      col.push({
        title: fieldName,
        dataIndex: fieldCode,
        key: fieldCode,
        render: (text, data) => {
          return <Fragment>
            {
              fieldType === DATETIME ? <span>{formatDate(text)}</span> : [BOOLEAN, ENUM].includes(fieldType) ? <span>
                {data[`${fieldCode}_name`]}
              </span> : <span>{text}</span>
            }
          </Fragment>
        }
      })
    })
    return <Table columns={col} dataSource={dataSource} pagination={false} />
  }

  renderFieldFormItem = () => {
    const { fieldDtosList = [] } = this.state
    const { form } = this.props
    const { getFieldProps, getFieldDecorator } = form
    return fieldDtosList.map(item => {
      const { fieldType, name: fieldName, required, code: fieldCode, id, enumOption = '' } = item
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
              }],
              onChange: (e) => this.changeEnumOrBool(e, fieldCode, list)
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
            <DatePicker placeholder={fieldName} showTime={{ format: 'HH:mm:ss' }}
                        format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} allowClear {...getFieldProps(fieldCode, {
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

  changeEnumOrBool = (value, key, enumList = []) => {
    enumList.forEach(item => {
      if (value === item['key']) {
        this.enumOrBoolName[`${key}_name`] = item.value
      }
    })
  }

  formatTime = (date, key) => {
    let { formatTime = {} } = this.state
    formatTime[key] = new Date(date).getTime()
    this.setState({ formatTime })
    console.log('formatTime', formatTime)
  }
  save = e => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { formatTime = {}, dataSource = [], dataSrc } = this.state
        // const { templateConfig = {} } = dataSrc
        // const { subjects = [] } = templateConfig
        // subjects.forEach(item => {
        //   this.subjectsField[item] = values[item]
        // })
        dataSource.unshift({ ...values, ...this.enumOrBoolName, ...formatTime })
        // let data = []
        // // 依据主体进行筛选
        // dataSource.forEach(item => {
        //   let bol = true
        //   subjects.forEach(s => {
        //     if (this.subjectsField[s] !== item[s]) {
        //       bol = false
        //     }
        //   })
        //   if (bol) {
        //     data.push(item)
        //   }
        // })
        let query = {
          factor: { ...dataSrc },
          data: dataSource
        }
        this.setState({ dataSource })
        console.log('save', dataSource)
        saveFactorValidation(query).then(res => {
          let { content = '' } = res
          if (typeof content === 'object') {
            content = content.join(',')
          }
          this.setState({ factorData: content })
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      }
    })
  }
  getValidationScenarioFields = e => {
    const { dataSrc = {}, sceneList = [] } = this.props
    const { id, templateConfig = {} } = dataSrc
    const { scenarios = [] } = templateConfig
    getUsedFields(buildUrlParamNew({ factorId: id })).then(res => {
      const { content = [] } = res
      let scenarioList = []
      sceneList.forEach(item => {
        if (scenarios.includes(item.scenarioValue)) {
          scenarioList.push(item)
        }
      })
      if (scenarioList[0]) {
        const { scenarioValue } = scenarioList[0] || {}
        this.props.form.setFieldsValue({ scenario_value: scenarioValue })
      }
      this.setState({ scenarioList, fieldDtosList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}

export default Form.create()(IndicatorsTest)
