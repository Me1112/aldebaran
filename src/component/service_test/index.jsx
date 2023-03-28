import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Form, Input, InputNumber, notification, DatePicker, Select } from 'antd'
import { fromJS, is } from 'immutable'
import moment from 'moment'
import CodeViewer from '../../component/viewer'
import { formatDate } from '../../util'
import './index.less'

const { Option } = Select

const DATETIME = 'DATETIME'
const BOOLEAN = 'BOOLEAN'
const DECIMAL = 'DECIMAL'
// const STRING = 'STRING'
// const ENUM = 'ENUM'

@Form.create()
export default class ServiceTest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...props
    }
  }

  static propTypes = {
    form: PropTypes.any,
    visible: PropTypes.bool.isRequired,
    record: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onServiceTest: PropTypes.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const { visible, record } = nextProps
    if (visible !== this.state.visible) {
      this.setState({
        visible,
        versionType: 'ALPHA'
      })
    }
    if (!is(fromJS(record), fromJS(this.state.record))) {
      this.setState({
        record
      })
    }
  }

  componentDidMount() {
  }

  render() {
    const {
      visible = false,
      record: {
        serviceName,
        serviceParams = []
      } = {},
      testResult: {
        data = {},
        callStatus
      } = {},
      loading = false
    } = this.state
    const { getFieldDecorator } = this.props.form
    const reqParams = serviceParams.filter(serviceParam => serviceParam.paramType === 'REQUEST')
    const resParams = serviceParams.filter(serviceParam => serviceParam.paramType === 'RESPONSE')

    return <Modal title={serviceName} width="800px"
                  visible={visible} onCancel={this.onCancel}
                  footer={<Button type="default" onClick={this.onCancel}>关闭窗口</Button>}
    >
      <div>
        <div className="test-half">
          <div className="title">
            请求参数
          </div>
          <Form className="service-test-form">
            {
              reqParams.map((reqParam, index) => {
                const { paramCode, paramName, require = 'TRUE' } = reqParam
                return <Form.Item key={index} labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} label={paramName}>
                  {
                    getFieldDecorator(paramCode, {
                      rules: [{
                        required: require === 'TRUE',
                        message: `请输入${paramName}`
                      }]
                    })(
                      this.buildReqParamComponent(reqParam)
                    )}
                </Form.Item>
              })
            }
          </Form>
          <Button type="primary" loading={loading} onClick={this.onTest} style={{ left: '33.3%' }}>提交</Button>
        </div>
        <div className="test-half">
          <div className="title">
            响应参数
          </div>
          {
            callStatus ? callStatus === 'SUCCESS' ? resParams.map((resParam, index) => {
              const { dataType, paramCode, paramName } = resParam
              let value = data[paramCode] === undefined ? '' : data[paramCode]
              if (value && dataType === DATETIME) {
                value = formatDate(value)
              }
              return <div className="item text-overflow" key={index} title={value.toString()}>
                {paramName}: <span className="value">{value.toString()}</span>
              </div>
            }) : this.state.testResult.data ? <div className="code-container">
              <CodeViewer code={data} />
            </div> : '数据服务无响应' : null
          }
        </div>
      </div>
    </Modal>
  }

  buildReqParamComponent = reqParam => {
    const { paramName, dataType } = reqParam
    let component = <Input placeholder={`请输入${paramName}`} />
    switch (dataType) {
      case DATETIME:
        component = <DatePicker showTime={{ format: 'HH:mm:ss' }}
                                format="YYYY-MM-DD HH:mm:ss" placeholder={`请选择${paramName}`}
                                style={{ width: '100%' }} allowClear />
        break
      case BOOLEAN:
        component = <Select placeholder={`请选择${paramName}`} style={{ width: '100%' }}>
          <Option value="true">是</Option>
          <Option value="false">否</Option>
        </Select>
        break
      case DECIMAL:
        component = <InputNumber placeholder={`请输入${paramName}`} style={{ width: '100%' }} />
        break
    }
    return component
  }

  onCancel = () => {
    this.props.onCancel()
    this.setState({
      testResult: {}
    }, () => {
      this.props.form.resetFields()
    })
  }

  onTest = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      await this.setState({ loading: true })
      try {
        const {
          record: {
            id: serviceId = '',
            serviceParams = []
          } = {}
        } = this.state

        const dateReqParams = serviceParams.filter(serviceParam => serviceParam.paramType === 'REQUEST' && serviceParam.dataType === DATETIME) || []
        const dateReqParamCodes = dateReqParams.map(serviceParam => serviceParam.paramCode)
        let data = JSON.parse(JSON.stringify(values))
        Object.keys(data).forEach(field => {
          const value = data[field]
          if (dateReqParamCodes.indexOf(field) !== -1 && value) {
            data = { ...data, [field]: moment(value).valueOf() }
          }
        })
        this.props.onServiceTest({
          serviceId,
          data
        }).then(res => {
          const {
            content: testResult = {}
          } = res
          this.setState({
            testResult,
            loading: false
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
          this.setState({ loading: false })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }
}
