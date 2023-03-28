import React from 'react'
import PropTypes from 'prop-types'
import { Form, Row, Col, Input, Button, notification, Popconfirm, Select } from 'antd'
import { addDecisionBasicInfo, updateDecisionBasicInfo } from '../../../../action/decision'
import { getBusinessLines } from '../../../../action/common'

const { Item: FormItem } = Form
const { TextArea } = Input
const { Option } = Select

class BasicInfo extends React.Component {
  constructor(props) {
    let { id, description, name, strategyCode, scenarioId, appId, businessLineId, isView } = props
    super(props)
    if (typeof appId === 'number') {
      appId = appId.toString()
    }
    if (typeof scenarioId === 'number') {
      scenarioId = scenarioId.toString()
    }
    this.state = {
      id,
      description,
      name,
      strategyCode,
      appId,
      scenarioId,
      businessLineId,
      isView,
      loading: false
    }
  }

  static propTypes = {
    form: PropTypes.any,
    setTreeId: PropTypes.func.isRequired,
    returnList: PropTypes.func.isRequired,
    id: PropTypes.any,
    newId: PropTypes.any,
    description: PropTypes.any,
    name: PropTypes.any,
    strategyCode: PropTypes.any,
    scenarioId: PropTypes.any,
    appId: PropTypes.any,
    isView: PropTypes.any,
    businessLineId: PropTypes.any,
    businessLineName: PropTypes.any
  }

  componentWillReceiveProps(nextProps) {
    const { id, description, name, strategyCode, isView } = nextProps
    if (id) {
      this.getBusinessLines()
      this.setState({
        id,
        description,
        name,
        strategyCode,
        isView
      })
    }
  }

  componentDidMount() {
    const { id, businessLineId: lineId, businessLineName: lineName } = this.props
    if (id) {
      this.setState({
        id,
        businessLines: [{ lineId, lineName }]
      })
    } else {
      this.getBusinessLines()
    }
  }

  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    const { form } = this.props
    const { strategyCode = '', name = '', description = '', businessLineId, businessLines = [], isView } = this.state
    const { getFieldProps } = form

    return (
      <Form>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="决策树编码"
            ><Input {...getFieldProps('strategyCode', {
              initialValue: strategyCode,
              validate: [{
                rules: [
                  { required: true, whitespace: true, message: '请填写编码' },
                  { pattern: /^[0-9a-zA-Z_]{1,50}$/, message: '请输入英文、数字和下划线' }
                ]
              }]
            })} placeholder="策略编码最多50个字符" maxLength="50" style={{ width: 300 }} disabled={isView} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="决策树名称"
            ><Input {...getFieldProps('name', {
              initialValue: name,
              validate: [{
                rules: [
                  { required: true, whitespace: true, message: '请填写名称' }
                ]
              }]
            })} placeholder="策略名称最多50个字符" maxLength="50" style={{ width: 300 }} disabled={isView} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="业务条线"
            ><Select {...getFieldProps('businessLineId', {
              initialValue: businessLines.length > 0 ? businessLineId : undefined,
              validate: [{
                rules: [
                  { required: true, message: '请选择业务条线' }
                ]
              }]
            })} placeholder="请选择" style={{ width: 300 }} disabled={this.props.id > 0 || isView}>
              {
                businessLines.map(r => {
                  const { lineId, lineName } = r
                  return (
                    <Option key={lineId} value={lineId}>{lineName}</Option>)
                })
              }
            </Select>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="描述"
            >
              <TextArea {...getFieldProps('description', {
                initialValue: description
              })} placeholder="最多200个字符" maxLength="200"
                        style={{ width: 300, height: isView ? 130 : 100, resize: 'none' }}
                        disabled={isView} />
            </FormItem>
          </Col>
        </Row>
        {
          isView ? null
            : <Row>
              <Col span={24}>
                <div className="ant-col-xs-24 ant-col-sm-8" />
                <Button type="primary" onClick={this.decSetSubmit} style={{ marginRight: 10 }}>保存</Button>
                <Popconfirm
                  placement="rightBottom"
                  title={'请先确认已保存修改再退出,确定退出吗？'}
                  onCancel={this.preventEvent}
                  onConfirm={this.returnSubmit} okText="确定"
                  cancelText="取消"><Button type="default">退出</Button></Popconfirm>
              </Col>
            </Row>
        }
      </Form>
    )
  }

  preventEvent = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  getBusinessLines = () => {
    getBusinessLines().then(data => {
      const { content: businessLines = [] } = data
      this.setState({ businessLines })
    })
  }

  returnSubmit = (e) => {
    e.preventDefault()
    this.props.form.resetFields()
    this.props.returnList()
  }
  decSetSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      try {
        const { strategyCode, name, description, businessLineId } = values
        const data = {
          strategyCode,
          description,
          name,
          businessLineId
        }
        if (this.props.newId) {
          this.updateBesicInfo(data)
        } else {
          this.addBasicInfo(data)
        }
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }
  addBasicInfo = async (data) => {
    await addDecisionBasicInfo(data).then(res => {
      const { content = {} } = res
      this.props.setTreeId({ ...content, redirect: true })
      notification.success({ message: '新建成功' })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  updateBesicInfo = async (data) => {
    // data.id = this.state.id
    // if (this.props.newId) {
    data.id = this.props.newId
    // }
    await updateDecisionBasicInfo(data).then(res => {
      const { content = {} } = res
      this.props.setTreeId(content)
      notification.success({ message: '更新成功' })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}

export default Form.create()(BasicInfo)

// export default connect(mapStateToProps, mapDispatchToProps)(BasicInfo)
