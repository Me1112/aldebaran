/* eslint-disable spaced-comment */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Row, Col, Input, Form, Radio, Button, Popconfirm, notification, Tabs, Select } from 'antd'
import { Range } from 'rc-slider'
import 'rc-slider/assets/index.css'
import './index.less'
import { Map } from 'immutable'
import { insertRuleSet, updateRuleSet, getMatchModeSelect, getBusinessList } from '../../../../action/rule'
import { RULE_SET_MATCH_MODE_WORST, RULE_SET_MATCH_MODE_RANK } from '../../../../common/constant'
import LayoutRight from '../../../../component/layout_right'

const { TabPane } = Tabs
const Option = Select.Option
const { Item: FormItem } = Form
const { TextArea } = Input
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 }
}
const { Group: RadioGroup } = Radio
const marks = {
  0: '0', 25: '25', 50: '50', 75: '75', 100: '100'
}

function initPolicyThresholds(count) {
  let arr = []
  let average = 100 / (count - 1)
  if (isNaN(average) || average === 0) {
    average = 100
  }
  for (var i = 0; i < count; i++) {
    arr.push(parseInt(i * average))
  }
  return arr
}

class NewRuleCollection extends Component {
  state = {
    ruleSetId: 0
  }

  static propTypes = {
    form: PropTypes.any,
    businessLine: PropTypes.any,
    history: PropTypes.object.isRequired,
    appSelect: PropTypes.array,
    sceneSelect: PropTypes.array,
    matchModelSelect: PropTypes.array,
    riskPolicyList: PropTypes.array,
    getMatchModeSelect: PropTypes.func.isRequired,
    insertRuleSet: PropTypes.func.isRequired,
    getBusinessList: PropTypes.func.isRequired,
    updateRuleSet: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.props.getMatchModeSelect()
    this.props.getBusinessList()
    const { state = {} } = this.props.location
    let { policyThresholds } = state
    if (typeof policyThresholds === 'string') {
      policyThresholds = policyThresholds.split(',').map(threshold => Number(threshold))
    }
    this.setState({ ...state, policyThresholds, count: this.props.riskPolicyList.length - 1 })
  }

  componentWillReceiveProps(nextProps, nextContext) {
    console.log('nextProps.riskPolicyList', nextProps.riskPolicyList)
    this.setState({ count: nextProps.riskPolicyList.length - 1 })
  }

  render() {
    const { businessLine = [] } = this.props
    let {
      ruleSetId = 0, name = '', matchMode = RULE_SET_MATCH_MODE_WORST,
      ruleNum, conditionNum, policyThresholds = [],
      activeStatus = 0, description = '', strategyCode = '', businessLineId,
      count = 0, isView = false
    } = this.state
    if (!activeStatus) {
      activeStatus = false
    } else {
      activeStatus = true
    }
    let breadCrumb = ['策略配置', '策略集市', '规则集', !isView ? '编辑规则集' : `查看(规则集${name})`]
    if (ruleSetId === 0) {
      activeStatus = false
      breadCrumb[3] = '新建规则集'
    } else if (ruleNum === 0 || conditionNum === 0) {
      activeStatus = false
    }
    if (policyThresholds.length === 0) {
      policyThresholds = initPolicyThresholds(count)
    }
    console.log('policyThresholds', policyThresholds)
    console.log(activeStatus)
    const { form, matchModelSelect } = this.props
    const { getFieldProps } = form
    return (
      <LayoutRight breadCrumb={breadCrumb} type={'tabs'}>
        <Tabs type="card" defaultActiveKey={'INFO'} className={'tabs-no-border scorecard-new'}
              activeKey={'INFO'}
              onChange={this.onChangeTab} style={{ paddingBottom: isView ? 52 : 0 }}>
          <TabPane tab="基本信息" key={'INFO'} forceRender>
            <Form>
              <Row className="form-row-item">
                <Col span={24} className="form-item-container">
                  <FormItem {...formItemLayout} label="规则集编码">
                    <Input {...getFieldProps('strategyCode', {
                      initialValue: strategyCode,
                      validate: [{
                        rules: [
                          { required: true, whitespace: true, message: '最多50个字符' }
                        ]
                      }]
                    })} placeholder="最多50个字符" maxLength="50" disabled={isView} />
                  </FormItem>
                  <FormItem {...formItemLayout} label="规则集名称">
                    <Input {...getFieldProps('name', {
                      initialValue: name,
                      validate: [{
                        rules: [
                          { required: true, whitespace: true, message: '最多50个字符' }
                        ]
                      }]
                    })} placeholder="最多50个字符" maxLength="50" disabled={isView} />
                  </FormItem>
                </Col>

                <Col span={24} className="form-item-container">
                  <FormItem {...formItemLayout} label="业务条线">
                    <Select disabled={ruleSetId !== 0 || isView} {...getFieldProps('businessLineId', {
                      initialValue: businessLineId,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择业务条线' }
                        ]
                      }]
                    })} placeholder="请选择">
                      {
                        businessLine.map(item => {
                          return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
                        })
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col span={24} className="form-item-container">
                  <FormItem {...formItemLayout} label="匹配模式">
                    <RadioGroup disabled={ruleSetId > 0 || isView} {...getFieldProps('matchMode', {
                      initialValue: matchMode,
                      validate: [{
                        rules: [
                          { required: true, message: '请选择匹配模式' }
                        ]
                      }],
                      onChange: this.matchModeChange
                    })} >
                      {
                        matchModelSelect.map(match => {
                          const { name, index } = match
                          return (
                            <Radio key={index} value={index}>{name}</Radio>
                          )
                        })
                      }
                    </RadioGroup>
                  </FormItem>
                  {matchMode === RULE_SET_MATCH_MODE_WORST
                    ? ''
                    : <FormItem {...formItemLayout} label="决策阈值">
                      <Range className="rc-range" value={policyThresholds} onChange={this.policyThresholdsChange}
                             included pushable={1} tipFormatter={value => `${value}%`}
                             marks={marks} count={count} disabled={isView} />
                    </FormItem>
                  }
                </Col>
                <Col span={24} className="form-item-container">
                  <FormItem {...formItemLayout} label="描述">
                    <TextArea {...getFieldProps('description', {
                      initialValue: description
                    })} placeholder="最多200个字符" maxLength="200" style={{ height: 160, resize: 'none' }}
                              disabled={isView} />
                  </FormItem>
                </Col>
                {
                  !isView ? <Col span={24} className="form-item-container">
                    <Col span={8} />
                    <Col span={8}>
                      <Button type="primary" style={{ marginRight: '10px' }} onClick={this.ruleSetSubmit}>保存</Button>
                      <Popconfirm
                        placement="rightBottom"
                        title={'当前编辑内容未保存,确定退出吗？'}
                        onCancel={this.preventEvent}
                        onConfirm={this.gotoRuleSet} okText="确定"
                        cancelText="取消">
                        <Button type="default">取消</Button></Popconfirm>
                    </Col>
                  </Col> : null
                }
              </Row>
              {/*<Row className="form-row-item">*/}
              {/*<Row>*/}
              {/*<Col span={6} className="form-item-container">*/}
              {/*<FormItem {...formItemLayout} label="可选服务">*/}
              {/*<Button type="primary">添加</Button>*/}
              {/*</FormItem>*/}
              {/*</Col>*/}
              {/*</Row>*/}
              {/*<Row className="service-container">*/}
              {/*<span>点击添加或删除按钮，添加或者删除可选服务</span>*/}
              {/*</Row>*/}
              {/*</Row>*/}
            </Form>
          </TabPane>
          <TabPane tab="规则配置" disabled={!ruleSetId} key={'CONFIG'} forceRender />
          <TabPane tab="关联版本" disabled={!ruleSetId} key={'VERSION'} forceRender />
        </Tabs>
        {
          isView ? <div className="view-back">
            <Button type="primary" onClick={this.viewBack}>退出</Button>
          </div> : null
        }
      </LayoutRight>
    )
  }

  viewBack = () => {
    this.props.history.push({ pathname: '/policy/bazaar/collection' })
  }

  policyThresholdsChange = e => {
    console.log('policyThresholdsChange', e)
    this.setState({ policyThresholds: e })
  }
  onChangeTab = (key) => {
    if (key === 'CONFIG') {
      this.toRuleList()
    }
    if (key === 'VERSION') {
      this.toRelativeVersion()
    }
  }
  toRuleList = () => {
    const { ruleSetId } = this.state
    if (ruleSetId) {
      this.props.history.push({ pathname: '/policy/bazaar/collection/config', state: { ...this.state } })
    }
  }
  toRelativeVersion = () => {
    const { ruleSetId } = this.state
    if (ruleSetId) {
      this.props.history.push({ pathname: '/policy/bazaar/collection/version', state: { ...this.state } })
    }
  }
  preventEvent = (e) => {
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
  }

  matchModeChange = (e) => {
    this.setState({ matchMode: e.target.value })
  }

  gotoRuleSet = () => {
    const { state = {} } = this.props.location
    this.props.history.push({ pathname: '/policy/bazaar/collection', state })
  }

  ruleSetSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields(async (errors, values) => {
      console.log(errors, values)
      if (errors) {
        return
      }
      try {
        let { name = '', appId, description = '', matchMode, scenarioValue, strategyCode = '', activeStatus, businessLineId } = values
        activeStatus = activeStatus ? 1 : 0
        let scenarioDicId = ''
        const { ruleSetId: rulesetId = 0, count = 0, policyThresholds = initPolicyThresholds(count) } = this.state
        this.props.sceneSelect.forEach(scene => {
          const { scenarioDicId: id, scenarioValue: v } = scene
          if (scenarioValue === v) {
            scenarioDicId = id
          }
        })
        let data = {
          rulesetId,
          name: name.trim(),
          appId,
          description: description.trim(),
          matchMode,
          // scenarioDicId,
          // scenarioValue,
          strategyCode: strategyCode.trim(),
          businessLineId
          // activeStatus
        }
        if (matchMode === RULE_SET_MATCH_MODE_RANK) {
          data['policyThresholds'] = policyThresholds.join(',')
        }
        console.log('data', data)
        const { promise } = await (rulesetId > 0 ? this.props.updateRuleSet(data) : this.props.insertRuleSet(data))
        promise.then((data) => {
          if (rulesetId > 0) {
            notification.success({ message: '更新成功' })
            this.gotoRuleSet()
          } else {
            const { content = {} } = data
            const { rulesetId: ruleSetId, rulesetName } = content
            let state = {
              ruleSetId,
              name: rulesetName,
              description,
              matchMode,
              scenarioDicId,
              scenarioValue,
              businessLineId,
              strategyCode,
              activeStatus
            }
            if (matchMode === RULE_SET_MATCH_MODE_RANK) {
              state['policyThresholds'] = policyThresholds
            }
            this.setState({
              ...state
            }, () => {
              notification.success({ message: '新建成功' })
              this.toRuleList()
            })
          }
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }
}

function mapStateToProps(state) {
  const { rule = Map({}), decision = Map({}) } = state
  const { appSelect = [], sceneSelect = [], matchModelSelect = [], businessLine = [] } = rule.toJS()
  const { riskPolicyList = [] } = decision.toJS()
  return { appSelect, sceneSelect, matchModelSelect, businessLine, riskPolicyList }
}

function mapDispatchToProps(dispatch) {
  return {
    insertRuleSet: bindActionCreators(insertRuleSet, dispatch),
    getMatchModeSelect: bindActionCreators(getMatchModeSelect, dispatch),
    getBusinessList: bindActionCreators(getBusinessList, dispatch),
    updateRuleSet: bindActionCreators(updateRuleSet, dispatch)
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Form.create()(NewRuleCollection))
