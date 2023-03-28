import React, { Fragment } from 'react'
import { addEa, getEaStrategies, updateEa } from '../../../../action/external_access'
import LayoutRight from '../../../../component/layout_right'
import PropTypes from 'prop-types'
import connect from 'react-redux/es/connect/connect'
import { Button, Col, Form, notification, Popconfirm, Radio, Row, Select, Checkbox } from 'antd'
import { buildUrlParamNew } from '../../../../util'
import { bindActionCreators } from 'redux'
import { getSceneList, getAppSelect } from '../../../../action/rule'
import './index.less'

const { Option } = Select
const { Item: FormItem } = Form
const { Group: RadioGroup } = Radio

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 }
}

const rates = Array.apply(null, { length: 11 }).map(function (v, d) {
  return d * 10
})

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

class NewExternalAccess extends React.Component {
  state = {}
  static propTypes = {
    appSelect: PropTypes.array.isRequired,
    getAppSelect: PropTypes.func.isRequired,
    getSceneList: PropTypes.func.isRequired,
    form: PropTypes.any,
    history: PropTypes.any.isRequired,
    sceneList: PropTypes.array.isRequired
  }

  componentDidMount() {
    this.props.getAppSelect()
    const { state = {} } = this.props.history.location
    const { id } = state
    if (id) {
      this.businessLineId = state.businessLineId
      this.changeStrategyType(state.strategyType)
      const {
        strategyCode,
        strategyId,
        strategyName,
        strategyType
      } = state
      const selectStrategies = {
        strategyCode,
        strategyId,
        strategyName,
        strategyType
      }
      this.setState({ ...state, selectStrategies })
    }
  }

  // componentWillReceiveProps(nextProps, nextContext) {
  //   const { state } = nextProps.history.location
  //   if (state) {
  //     this.changeStrategyType(state.strategyType)
  //     const {
  //       strategyCode,
  //       strategyId,
  //       strategyName,
  //       strategyType
  //     } = state
  //     const selectStrategies = {
  //       strategyCode,
  //       strategyId,
  //       strategyName,
  //       strategyType
  //     }
  //     this.setState({ ...state, selectStrategies })
  //   }
  // }

  render() {
    let {
      id = 0, appId, scenarioId, status = 'RUNNING', strategyType, strategies = [],
      strategyInfo: [
        { strategyId, rate = 0 } = {},
        { strategyId: strategyId2, rate: rate2 = 0 } = {}
      ] = [], warningRule, firstAccessTime, updateTime
    } = this.state
    const { appSelect, sceneList, form } = this.props
    const { getFieldDecorator } = form
    const {
      strategyType: strategyTypeInForm, status: statusInForm,
      strategyId: strategyIdVal = strategyId, strategyId2: strategyId2Val = strategyId2,
      rate: rateVal = rate, rate2: rate2Val = rate2
    } = this.props.form.getFieldsValue() || status
    return <Fragment>
      <LayoutRight breadCrumb={['策略配置', '外部接入', '接入配置', id > 0 ? '编辑' : '新建']}>
        <Form style={{ height: '100%', overflow: 'auto' }}>
          <Row>
            <Col span={24}>
              <FormItem {...formItemLayout} label="应用">
                {
                  getFieldDecorator('appId', {
                    initialValue: appId,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择应用' }
                      ]
                    }],
                    onChange: this.changeAppId
                  })(
                    <Select disabled={id > 0} placeholder="应用">
                      {
                        appSelect.map(app => {
                          const { appId, appName } = app
                          return (
                            <Option key={appId} value={appId}>{appName}</Option>
                          )
                        })
                      }
                    </Select>
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem {...formItemLayout} label="场景">
                {
                  getFieldDecorator('scenarioId', {
                    initialValue: scenarioId,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择场景' }
                      ]
                    }]
                  })(
                    <Select disabled={id > 0} placeholder="场景" allowClear>
                      {
                        sceneList.map((scene) => {
                          const { scenarioDicId, scenarioName } = scene
                          return (
                            <Option key={scenarioDicId} value={scenarioDicId}>{scenarioName}</Option>
                          )
                        })
                      }
                    </Select>
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem {...formItemLayout} label="状态">
                {
                  getFieldDecorator('status', {
                    initialValue: status,
                    onChange: this.onStatusChange
                  })(
                    <RadioGroup>
                      <Radio value={'RUNNING'}>正式运行</Radio>
                      <Radio value={'TESTING'}>试运行</Radio>
                      <Radio value={'AB_TEST'}>A/B测试运行</Radio>
                    </RadioGroup>
                  )
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <FormItem {...formItemLayout} label="策略类型">
                {getFieldDecorator('strategyType', {
                  initialValue: strategyType,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择策略类型' }
                    ]
                  }],
                  onChange: this.changeStrategyType
                })(
                  <Select disabled={id > 0} placeholder={'策略类型'} allowClear>
                    <Option key={'RULE_SET'} value={'RULE_SET'}>规则集</Option>
                    <Option key={'SCORE_CARD'} value={'SCORE_CARD'}>评分卡</Option>
                    <Option key={'DECISION_TREE'} value={'DECISION_TREE'}>决策树</Option>
                    <Option key={'DECISION_STREAM'} value={'DECISION_STREAM'}>决策流</Option>
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          {
            statusInForm === 'AB_TEST' ? <Fragment>
                <Row>
                  <Col span={12}>
                    <FormItem labelCol={{ span: 16 }} wrapperCol={{ span: 8 }} label="策略">
                      {getFieldDecorator('strategyId', {
                        initialValue: strategyId,
                        validate: [{
                          rules: [
                            { required: false, message: '请选择策略' }
                          ]
                        }],
                        onChange: this.changeStrategyId
                      })(
                        <Select placeholder={'策略'} dropdownMatchSelectWidth={false} allowClear>
                          {
                            strategies.filter(s => s.strategyId !== strategyId2Val).map((item, index) => {
                              const { strategyCode, strategyId: id, strategyName } = item
                              return <Option key={id} value={id}
                                             title={`${strategyCode} / ${strategyName}`}>{strategyCode} / {strategyName}</Option>
                            })
                          }
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 22 }} label=" " colon={false}
                              className="no-required-flag">
                      {getFieldDecorator('rate', {
                        initialValue: rate,
                        validate: [{
                          rules: [
                            { required: true, message: '请选择' }
                          ]
                        }]
                      })(
                        <Select placeholder={'请选择'}>
                          {
                            rates.filter(rate => rate + rate2Val <= 100).map(rate => {
                              return <Option key={rate} value={rate}>{rate}%</Option>
                            })
                          }
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem labelCol={{ span: 16 }} wrapperCol={{ span: 8 }} label=" " colon={false}
                              className="no-required-flag">
                      {getFieldDecorator('strategyId2', {
                        initialValue: strategyId2,
                        validate: [{
                          rules: [
                            { required: false, message: '请选择策略' }
                          ]
                        }],
                        onChange: this.changeStrategyId
                      })(
                        <Select placeholder={'策略'} dropdownMatchSelectWidth={false} allowClear>
                          {
                            strategies.filter(s => s.strategyId !== strategyIdVal).map((item, index) => {
                              const { strategyCode, strategyId: id, strategyName } = item
                              return <Option key={id} value={id}
                                             title={`${strategyCode} / ${strategyName}`}>{strategyCode} / {strategyName}</Option>
                            })
                          }
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={4}>
                    <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 22 }} label=" " colon={false}
                              className="no-required-flag">
                      {getFieldDecorator('rate2', {
                        initialValue: rate2,
                        validate: [{
                          rules: [
                            { required: true, message: '请选择' }
                          ]
                        }]
                      })(
                        <Select placeholder={'请选择'}>
                          {
                            rates.filter(rate => rate + rateVal <= 100).map(rate => {
                              return <Option key={rate} value={rate}>{rate}%</Option>
                            })
                          }
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Fragment>
              : <Row>
                <Col span={24}>
                  <FormItem {...formItemLayout} label="策略">
                    {getFieldDecorator('strategyId', {
                      initialValue: strategyId,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择策略' }
                        ]
                      }],
                      onChange: this.changeStrategyId
                    })(
                      <Select placeholder={'策略'} dropdownMatchSelectWidth={false} allowClear>
                        {
                          strategies.map((item, index) => {
                            const { strategyCode, strategyId: id, strategyName } = item
                            return <Option key={id} value={id}
                                           title={`${strategyCode} / ${strategyName}`}>{strategyCode} / {strategyName}</Option>
                          })
                        }
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
          }
          {
            strategyTypeInForm ? <Row>
              <Col span={24}>
                <FormItem {...formItemLayout} label="预警规则">
                  {
                    getFieldDecorator('warningRule', {
                      initialValue: warningRule ? warningRule.split(',') : []
                    })(
                      <Checkbox.Group>
                        <Checkbox value="HIGH" disabled={strategyTypeInForm === 'SCORE_CARD'}>
                          高风险
                        </Checkbox>
                        <Checkbox value="MIDDLE" disabled={strategyTypeInForm === 'SCORE_CARD'}>
                          中风险
                        </Checkbox>
                        <Checkbox value="LOW">
                          低风险
                        </Checkbox>
                      </Checkbox.Group>
                    )
                  }
                </FormItem>
              </Col>
            </Row> : null
          }
          {
            id ? <Fragment>
              <Row>
                <Col span={24}>
                  <FormItem {...formItemLayout} label="首次成功接入时间">
                    {!firstAccessTime ? '-' : firstAccessTime}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <FormItem {...formItemLayout} label="上次更新时间">
                    {!updateTime ? '-' : updateTime}
                  </FormItem>
                </Col>
              </Row>
            </Fragment> : null
          }
          <Row>
            <Col span={24}>
              <Col span={8} />
              <Col span={8}>
                <Button type="primary" style={{ marginRight: '10px' }} onClick={this.ruleSetSubmit}>保存</Button>
                <Popconfirm
                  placement="rightBottom"
                  title={'当前内容未保存,确定退出吗？'}
                  onCancel={this.preventEvent}
                  onConfirm={this.gotoList} okText="确定"
                  cancelText="取消">
                  <Button type="default">取消</Button></Popconfirm>
              </Col>
            </Col>
          </Row>
        </Form>
      </LayoutRight>
    </Fragment>
  }

  onStatusChange = () => {
    this.props.form.resetFields(['strategyType', 'strategyId', 'rate', 'strategyId2', 'rate2'])
  }

  changeAppId = e => {
    if (e === '') {
      return
    }
    this.businessLineId = ''
    this.props.appSelect.forEach(item => {
      if (item.appId === e) {
        this.businessLineId = item.businessLineId
      }
    })
    this.props.form.resetFields(['scenarioId', 'strategyType', 'strategyId'])
    this.setState({ scenarioId: undefined, strategyType: undefined, strategyId: undefined, strategies: [] }, () => {
      this.props.getSceneList({ businessLineId: this.businessLineId })
    })
  }

  changeStrategyId = (e) => {
    const { strategies = [] } = this.state
    let name = ''
    let code = ''
    let selectStrategies
    strategies.forEach(item => {
      if (item.strategyId === e) {
        name = item.strategyName
        selectStrategies = item
      }
    })
    this.setState({ strategyName: name, strategyCode: code, selectStrategies })
  }
  changeStrategyType = (e) => {
    const { warningRule = [], status } = this.props.form.getFieldsValue()
    if (e === 'SCORE_CARD' && warningRule.length > 0) {
      const filterWarningRule = warningRule.filter(check => check === 'LOW')
      this.props.form.setFieldsValue({ warningRule: filterWarningRule })
    }
    getEaStrategies(buildUrlParamNew({ strategyType: e, businessLineId: this.businessLineId })).then(res => {
      const { content = [] } = res
      this.setState({
        strategies: content
      })
    })
    if (this.oldStrategyType && this.oldStrategyType !== e) {
      this.setState({ strategyName: '', selectStrategies: {}, strategyId: undefined })
      this.props.form.setFieldsValue({ strategyId: undefined })
      if (status === 'AB_TEST') {
        this.props.form.resetFields(['strategyId2', 'rate', 'rate2'])
      }
    }
    this.oldStrategyType = e
  }

  ruleSetSubmit = async (e) => {
    e.preventDefault()
    this.props.form.validateFields(async (errors, values) => {
      console.log(errors, values)
      if (errors) {
        return
      }
      const { id, strategies = [] } = this.state
      const { appId, scenarioId, status, grayValue, warningRule, strategyType, strategyId, strategyId2, rate, rate2 } = values
      const { appSelect, sceneList } = this.props
      const { strategyCode, strategyName } = strategies.find(strategy => strategy.strategyId === strategyId) || {}
      let strategyInfo = [{ strategyId, rate, strategyCode, strategyName }]
      if (status === 'AB_TEST') {
        if (!strategyId && !strategyId2) {
          this.setFormError({ formItemField: 'strategyId', value: strategyId })
          this.setFormError({ formItemField: 'strategyId2', value: strategyId2, errorMsg: '至少选择一个策略' })
          return
        }
        if (rate + rate2 === 0) {
          this.setFormError({ formItemField: 'rate', value: rate })
          this.setFormError({ formItemField: 'rate2', value: rate2, errorMsg: '运行比例之和需大于0' })
          return
        } else {
          if (rate && !strategyId) {
            this.setFormError({ formItemField: 'strategyId', value: strategyId, errorMsg: '请选择策略' })
            return
          }
          if (rate2 && !strategyId2) {
            this.setFormError({ formItemField: 'strategyId2', value: strategyId2, errorMsg: '请选择策略' })
            return
          }
        }
        const { strategyCode: strategyCode2, strategyName: strategyName2 } = strategies.find(strategy => strategy.strategyId === strategyId2) || {}
        strategyInfo.push({
          strategyId: strategyId2, rate: rate2, strategyCode: strategyCode2, strategyName: strategyName2
        })
      }
      let data = {
        appId,
        scenarioId,
        status,
        grayValue,
        warningRule: warningRule.join(','),
        strategyType,
        strategyInfo
      }
      appSelect.forEach(item => {
        if (item.appId === appId) {
          data['appName'] = item.appName
        }
      })
      sceneList.forEach(item => {
        if (item.scenarioDicId === scenarioId) {
          data['scenarioName'] = item.scenarioName
        }
      })
      console.log(data)
      if (id) {
        data['id'] = id
        await updateEa(data).then(res => {
          this.gotoList()
        }).catch((data) => {
          notification.warning(data.content)
        })
      } else {
        await addEa(data).then(res => {
          this.gotoList(1)
        }).catch((data) => {
          notification.warning(data.content)
        })
      }
    })
  }

  setFormError = ({ formItemField, value, errorMsg = '' }) => {
    this.props.form.setFields({
      [formItemField]: {
        value,
        errors: [new Error(errorMsg)]
      }
    })
  }

  gotoList = (current = -1) => {
    const { state } = this.props.history.location
    let { query } = state
    if (current > -1) {
      query.current = current
    }
    this.props.history.push({ pathname: '/policy/joinup/config', state: query })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(NewExternalAccess))
