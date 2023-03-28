import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { Form, Row, Col, Input, Button, notification, Popconfirm, Select } from 'antd'
import { addScorecardInfo, updateScorecardBasic } from '../../../action/scorecard'
import { bindActionCreators } from 'redux'
import { getBusinessList } from '../../../action/rule'
import { Map } from 'immutable'
import connect from 'react-redux/es/connect/connect'

const { Item: FormItem } = Form
const { TextArea } = Input
const Option = Select.Option

function mapDispatchToProps(dispatch) {
  return {
    getBusinessList: bindActionCreators(getBusinessList, dispatch)
  }
}

function mapStateToProps(state) {
  const { rule = Map({}) } = state
  const { businessLine = [] } = rule.toJS()
  return { businessLine }
}

@connect(mapStateToProps, mapDispatchToProps)
class BasicInfo extends React.Component {
  constructor(props) {
    let { id, description, name, modelCode, isView } = props
    super(props)
    this.state = {
      id,
      description,
      name,
      modelCode,
      loading: false,
      isView
    }
  }

  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.any,
    businessLine: PropTypes.any,
    businessLineId: PropTypes.any,
    getBusinessList: PropTypes.func.isRequired,
    setTreeId: PropTypes.func.isRequired,
    id: PropTypes.any,
    newId: PropTypes.any,
    description: PropTypes.any,
    name: PropTypes.any,
    modelCode: PropTypes.any,
    isView: PropTypes.any
  }

  componentWillReceiveProps(nextProps) {
    const { id, description, name, modelCode, isView, businessLineId } = nextProps
    if (id) {
      this.setState({
        id,
        description,
        businessLineId,
        name,
        modelCode,
        isView
      })
    }
  }

  componentDidMount() {
    const { id, description, name, modelCode, isView, businessLineId } = this.props
    if (id) {
      this.setState({
        id,
        description,
        businessLineId,
        name,
        modelCode,
        isView
      })
    }
    this.props.getBusinessList()
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
    const { form, businessLine } = this.props
    const { isView = false, name = '', description = '', modelCode = '', businessLineId, id } = this.state
    const { getFieldProps } = form

    return (
      <Form>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="评分卡编码"
            ><Input {...getFieldProps('modelCode', {
              initialValue: modelCode,
              validate: [{
                rules: [
                  { required: true, whitespace: true, message: '请填写标识' }
                ]
              }]
            })} placeholder="评分卡编码最多50个字符" maxLength="50" style={{ width: 300 }} disabled={isView} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              {...formItemLayout}
              label="评分卡名称"
            ><Input {...getFieldProps('name', {
              initialValue: name,
              validate: [{
                rules: [
                  { required: true, whitespace: true, message: '请填写名称' }
                ]
              }]
            })} placeholder="评分卡名称最多50个字符" maxLength="50" style={{ width: 300 }} disabled={isView} />
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem {...formItemLayout} label="业务条线">
              <Select disabled={id > 0 || isView} {...getFieldProps('businessLineId', {
                initialValue: businessLineId,
                validate: [{
                  rules: [
                    { required: true, message: '请选择业务条线' }
                  ]
                }]
              })} placeholder="请选择" style={{ width: 300 }}>
                {
                  businessLine.map(item => {
                    return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
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
              })} placeholder="最多250个字符" maxLength="250" style={{ width: 300, height: 160, resize: 'none' }}
                        disabled={isView} />
            </FormItem>
          </Col>
        </Row>
        {
          !isView ? <Row>
            <Col span={24}>
              <div className="ant-col-xs-24 ant-col-sm-8" />
              <Button type="primary" onClick={this.decSetSubmit} style={{ marginRight: '10px' }}>保存</Button>
              <Popconfirm
                placement="rightBottom"
                title={'请先确认已保存修改再退出,确定退出吗？'}
                onCancel={this.preventEvent}
                onConfirm={this.returnList} okText="确定"
                cancelText="取消">
                <Button>退出</Button>
              </Popconfirm>
            </Col>
          </Row> : null
        }
      </Form>
    )
  }

  preventEvent = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }
  returnList = () => {
    this.props.history.push('/policy/bazaar/list')
  }

  decSetSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      try {
        const { name, description, modelCode, businessLineId } = values
        const data = {
          description,
          businessLineId,
          modelCode,
          name
        }
        if (this.props.newId) {
          this.updateBasicInfo(data)
        } else {
          this.addScorecardInfo(data)
        }
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }
  addScorecardInfo = (data) => {
    addScorecardInfo(data).then(res => {
      const { content = {} } = res
      data.id = content
      this.props.setTreeId({ ...data, redirect: true })
      notification.success({ message: '新建成功' })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  updateBasicInfo = async (data) => {
    // data.id = this.state.id
    // if (this.props.newId) {
    data.id = this.props.newId
    // }
    await updateScorecardBasic(data).then(res => {
      const { content = {} } = res
      this.props.setTreeId(content)
      notification.success({ message: '更新成功' })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}

export default withRouter(Form.create()(BasicInfo))
