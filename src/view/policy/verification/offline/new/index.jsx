import React, { Fragment } from 'react'
import LayoutRight from '../../../../../component/layout_right'
import PropTypes from 'prop-types'
import connect from 'react-redux/es/connect/connect'
import {
  Button,
  Form,
  Select,
  Steps,
  Input,
  Upload,
  Checkbox,
  notification,
  Radio
} from 'antd'
import { bindActionCreators } from 'redux'
import { getSceneList, getAppSelect } from '../../../../../action/rule'
import { createOfflineDataStep1, createOfflineDataStep2, getBusinessFields } from '../../../../../action/data'
import './index.less'

const { Option } = Select
const { Item: FormItem } = Form
const { Step } = Steps
const { Group: RadioGroup } = Radio

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
}

function mapStateToProps(state) {
  const { rule = Map() } = state
  const { appSelect = [], sceneList = [] } = rule.toJS()
  return {
    appSelect,
    sceneList
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    getAppSelect: bindActionCreators(getAppSelect, dispatch)
  }
}

class VerificationOfflineNew extends React.Component {
  state = {}
  static propTypes = {
    form: PropTypes.any,
    location: PropTypes.any,
    appSelect: PropTypes.array.isRequired,
    getAppSelect: PropTypes.func.isRequired,
    history: PropTypes.any.isRequired,
    sceneList: PropTypes.array.isRequired
  }

  componentDidMount() {
    this.props.getAppSelect()
  }

  render() {
    const { stepsCurrent = 0, nextLoading = false, completeLoading = false } = this.state
    return <Fragment>
      <LayoutRight className="offline-new-layout" breadCrumb={['离线数据', '新建']}>
        <Steps className="offline-new" current={stepsCurrent}>
          <Step title="数据选择" />
          <Step title="字段映射" />
        </Steps>
        {this.renderUploadBox()}
      </LayoutRight>
      <div className="view-back" style={{ width: 'calc(100% - 200px)', minWidth: 1000 }}>
        {
          stepsCurrent === 1 ? <Button type="default" onClick={this.onPrev}>上一步</Button> : null
        }
        <Button type="default" onClick={this.onCancel}>取消</Button>
        {
          stepsCurrent === 0 ? <Button type="primary" loading={nextLoading} onClick={this.onNext}>下一步</Button> : null
        }
        {
          stepsCurrent === 1
            ? <Button type="primary" loading={completeLoading} onClick={this.onComplete}>完成</Button> : null
        }
      </div>
    </Fragment>
  }

  renderUploadBox = () => {
    const { form, appSelect = [] } = this.props
    const { getFieldProps } = form
    const {
      isView = false,
      stepsCurrent = 0,
      heads = [],
      totalCount = 0,
      record: { autoCreateOccurTime = 'true' } = {},
      businessFields = []
    } = this.state
    const props = {
      accept: '.csv',
      beforeUpload: (file) => {
        this.setState({
          file
        }, () => {
          this.props.form.setFieldsValue({ fileName: file.name })
        })
        return false
      },
      fileList: []
    }
    const {
      scenarioValue: scenarioValueVal = '',
      occur_time: occurTimeVal = '',
      autoCreateOccurTime: autoCreateOccurTimeVal = 'true'
    } = this.props.form.getFieldsValue()
    const businessMappingFields = heads.filter(h => [scenarioValueVal, occurTimeVal].indexOf(h) === -1)
    const businessMappingFieldsVals = businessMappingFields.map(field => {
      const { [field]: v } = this.props.form.getFieldsValue()
      return v
    })
    const businessFieldsSelect = businessFields.filter(field => {
      const { fieldName } = field
      return businessMappingFieldsVals.indexOf(fieldName) === -1
    })
    const businessFieldsValues = this.props.form.getFieldsValue(businessMappingFields)
    const businessFieldsHasValue = Object.keys(businessFieldsValues).filter(k => businessFieldsValues[k] !== undefined)

    return <div className="offline-new" style={{ height: 'calc(100% - 32px)', overflow: 'auto', paddingTop: 30 }}>
      {
        stepsCurrent === 0 ? <Form>
          <FormItem {...formItemLayout} label="数据名称">
            <Input {...getFieldProps('dataName', {
              validate: [{
                rules: [
                  { required: true, whitespace: true, pattern: /^.{1,50}$/, message: '1-50个字符' }
                ]
              }]
            })} placeholder="不超过50个字符" maxLength="50" />
          </FormItem>
          <FormItem {...formItemLayout} label="应用">
            <Select {...getFieldProps('appId', {
              validate: [{
                rules: [
                  { required: true, message: '请选择' }
                ]
              }]
            })} allowClear dropdownMatchSelectWidth={false} placeholder="请选择">
              {
                appSelect.map(app => {
                  const { appId, appName } = app
                  return (
                    <Option key={appId} value={appId}>{appName}</Option>
                  )
                })
              }
            </Select>
          </FormItem>
          <FormItem {...formItemLayout} label="导入文件">
            <Input disabled {...getFieldProps('fileName', {
              validate: [{
                rules: [
                  { required: true, whitespace: true, message: '请选择csv文件' }
                ]
              }]
            })} style={{ width: 'calc(100% - 100px)', marginRight: 10 }} />
            <Upload {...props}><Button type="primary">选择文件</Button></Upload>
          </FormItem>
          <FormItem {...formItemLayout} label=" " colon={false}>
            <Checkbox {...getFieldProps('containHead', {
              valuePropName: 'checked'
            })}>
              是否有表头
            </Checkbox>
          </FormItem>
        </Form> : <Form>
          <FormItem {...formItemLayout} label="总记录数">
            {totalCount}
          </FormItem>
          <FormItem {...formItemLayout} label="场景字段">
            <Select {...getFieldProps('scenarioValue', {
              validate: [{
                rules: [
                  { required: true, message: '请选择' }
                ]
              }],
              onChange: this.onScenarioValueChange
            })} allowClear dropdownMatchSelectWidth={false} placeholder="请选择">
              {
                heads.filter(h => h !== occurTimeVal && businessFieldsHasValue.indexOf(h) === -1).map((head, index) => {
                  return (
                    <Option key={index} value={head}>{head}</Option>
                  )
                })
              }
            </Select>
          </FormItem>
          <FormItem {...formItemLayout} label="进件时间">
            <RadioGroup disabled={isView} {...getFieldProps('autoCreateOccurTime', {
              initialValue: autoCreateOccurTime,
              onChange: this.onAutoCreateOccurTimeChange
            })} >
              <Radio value="true">执行任务时生成实时时间</Radio>
              <br />
              <Radio value="false">字段映射</Radio>
            </RadioGroup>
          </FormItem>
          {
            autoCreateOccurTimeVal === 'false' ? <FormItem {...formItemLayout} label="" colon={false}
                                                           style={{
                                                             width: 250,
                                                             top: -63,
                                                             left: 'calc(25% + 100px)'
                                                           }}>
              <Select {...getFieldProps('occur_time', {
                validate: [{
                  rules: [
                    { required: true, message: '请选择' }
                  ]
                }]
              })} allowClear dropdownMatchSelectWidth={false} placeholder="请选择">
                {
                  heads.filter(h => h !== scenarioValueVal && businessFieldsHasValue.indexOf(h) === -1).map((head, index) => {
                    return (
                      <Option key={index} value={head}>{head}</Option>
                    )
                  })
                }
              </Select>
            </FormItem> : null
          }
          {
            scenarioValueVal ? <FormItem {...formItemLayout} label="业务字段映射" style={{
              top: autoCreateOccurTimeVal === 'false' ? -63 : 0
            }}>
              {
                businessMappingFields.map(h => {
                  const { [h]: v } = this.props.form.getFieldsValue()
                  const currentSelectField = businessFields.find(field => field.fieldName === v)
                  const businessFieldsFiltered = currentSelectField ? [currentSelectField, ...businessFieldsSelect] : businessFieldsSelect
                  return <div key={h}>
                    <Input disabled value={h} style={{ width: 'calc(50% - 10px)' }} />
                    <span> - </span>
                    <Select {...getFieldProps(h, {
                      validate: [{
                        rules: [
                          { required: false, message: '请选择' }
                        ]
                      }]
                    })} allowClear dropdownMatchSelectWidth={false}
                            style={{ width: 'calc(50% - 5px)' }} placeholder="请选择">
                      {
                        businessFieldsFiltered.filter(field => ['occur_time'].indexOf(field.fieldName) === -1)
                          .map(field => {
                            const { fieldName, fieldDisplayName } = field
                            return (
                              <Option key={fieldName} value={fieldName}>{fieldDisplayName}</Option>
                            )
                          })
                      }
                    </Select>
                  </div>
                })
              }
            </FormItem> : null
          }
        </Form>
      }
    </div>
  }

  onScenarioValueChange = e => {
    if (!e) {
      const { heads = [] } = this.state
      const {
        scenarioValue: scenarioValueVal = '',
        occur_time: occurTimeVal = ''
      } = this.props.form.getFieldsValue()
      const businessMappingFields = heads.filter(h => [scenarioValueVal, occurTimeVal].indexOf(h) === -1)
      this.props.form.resetFields(businessMappingFields)
    }
  }

  onAutoCreateOccurTimeChange = e => {
    if (e.target.value === 'true') {
      this.props.form.setFieldsValue({ occur_time: undefined })
    }
  }

  onCancel = () => {
    const { conditions = {} } = this.props.location.state
    this.props.history.push({
      pathname: '/policy/verification/offline',
      state: {
        conditions
      }
    })
  }

  onPrev = () => {
    const {
      dataName,
      appId,
      fileName,
      containHead = false
    } = this.state
    this.setState({
      stepsCurrent: 0
    }, () => {
      this.props.form.setFieldsValue({
        dataName,
        appId,
        fileName,
        containHead
      })
    })
  }

  onNext = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      const { file } = this.state
      const {
        dataName,
        appId,
        containHead = false
      } = values
      const formData = new window.FormData()
      formData.append('file', file)
      formData.append('dataName', dataName)
      formData.append('appId', appId)
      formData.append('containHead', containHead)
      this.setState({
        nextLoading: true
      }, () => {
        createOfflineDataStep1(formData).then(data => {
          const { content: { heads = [], totalCount = 0 } = {} } = data
          this.setState({
            nextLoading: false,
            totalCount,
            heads,
            stepsCurrent: 1,
            ...values
          }, () => {
            const { appSelect = [] } = this.props
            const { businessLineId } = appSelect.find(app => app.appId === appId) || {}
            this.getBusinessFields(businessLineId)
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
          this.setState({
            nextLoading: false
          })
        })
      })
    })
  }

  onComplete = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      const {
        dataName,
        appId,
        containHead = false
      } = this.state
      const {
        scenarioValue: scenarioValueVal,
        occur_time: occurTimeVal,
        autoCreateOccurTime = 'true'
      } = values
      const mappingInfo = JSON.parse(JSON.stringify(values))
      mappingInfo[scenarioValueVal] = 'scenarioValue'
      if (occurTimeVal) {
        mappingInfo[occurTimeVal] = 'occur_time'
      }
      delete mappingInfo.scenarioValue
      delete mappingInfo.occur_time
      delete mappingInfo.autoCreateOccurTime
      const mappingInfoStr = JSON.stringify(mappingInfo)
      const data = {
        dataName,
        appId,
        containHead: containHead ? 'true' : 'false',
        autoCreateOccurTime,
        mappingInfo: mappingInfoStr.substring(1, mappingInfoStr.length - 1).replace(/"/g, '')
      }
      this.setState({
        completeLoading: true
      }, () => {
        createOfflineDataStep2(data).then(() => {
          this.onCancel()
          this.setState({
            completeLoading: false
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
          this.setState({
            completeLoading: false
          })
        })
      })
    })
  }

  getBusinessFields = (businessLineId = '') => {
    getBusinessFields({ businessLineId, hasParent: 'false' }).then(data => {
      const { content: businessFields = [] } = data
      this.setState({
        businessFields
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(VerificationOfflineNew))
