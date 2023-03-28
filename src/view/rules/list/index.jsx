import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Button, Input, Table, Select, Switch, Modal, Form, notification, Row, Tabs } from 'antd'
import {
  SUCCESS,
  RULE_SET_MATCH_MODE_WORST,
  RULE_SET_MATCH_MODE_RANK
} from '../../../common/constant'
import {
  getRuleList, getRuleSet4RuleCopyList, deleteRule, saveRule, updateRule, copyRule, activeRule
} from '../../../action'
import { fromJS, is, Map } from 'immutable'
import LayoutRight from '../../../component/layout_right'
import './index.less'
import TriggerAction from './trigger_action'

const { Option, OptGroup } = Select
const { TextArea } = Input
const { Item: FormItem } = Form
const confirm = Modal.confirm
const { TabPane } = Tabs

function mapStateToProps(state) {
  const { rule = Map({}), decision = Map({}) } = state
  const { ruleContent = {}, ruleSet4RuleCopyContent = [] } = rule.toJS()
  const { riskPolicyList = [], riskPolicyMap = {} } = decision.toJS()
  return { ruleContent, ruleSet4RuleCopyContent, riskPolicyList, riskPolicyMap }
}

function mapDispatchToProps(dispatch) {
  return {
    getRuleList: bindActionCreators(getRuleList, dispatch),
    getRuleSet4RuleCopyList: bindActionCreators(getRuleSet4RuleCopyList, dispatch),
    deleteRule: bindActionCreators(deleteRule, dispatch),
    saveRule: bindActionCreators(saveRule, dispatch),
    updateRule: bindActionCreators(updateRule, dispatch),
    copyRule: bindActionCreators(copyRule, dispatch),
    activeRule: bindActionCreators(activeRule, dispatch)
  }
}

class RuleList extends Component {
  state = {
    rulesetIdVal: undefined,
    matchModeVal: '',

    beginCreateTimeVal: '',
    endCreateTimeVal: '',
    ruleIdVal: '',

    record: {},
    ruleInfo: {},
    deleteBanShow: false,
    alertVisible: false,
    deleteConfirmShow: false,
    editConfirmShow: false,
    ruleIds: [],
    copyBanShow: false,
    detailVisible: false,
    ruleSaveError: ''
  }

  static propTypes = {
    form: PropTypes.any,
    getRuleSet4RuleCopyList: PropTypes.func.isRequired,
    getRuleList: PropTypes.func.isRequired,
    deleteRule: PropTypes.func.isRequired,
    saveRule: PropTypes.func.isRequired,
    updateRule: PropTypes.func.isRequired,
    copyRule: PropTypes.func.isRequired,
    activeRule: PropTypes.func.isRequired,
    history: PropTypes.any,
    ruleSet4RuleCopyContent: PropTypes.any.isRequired,
    ruleContent: PropTypes.object.isRequired,
    riskPolicyList: PropTypes.array.isRequired,
    riskPolicyMap: PropTypes.object.isRequired,

    location: PropTypes.object.isRequired
  }

  componentDidMount() {
    // getRuleList
    this.props.getRuleSet4RuleCopyList()

    const { state = {} } = this.props.location
    if (state) {
      const { ruleSetId = undefined, matchMode = '', ruleId = undefined, modifiable = 1, strategyCode, businessLineId } = state
      this.setState({
        modifiable,
        rulesetIdVal: ruleSetId === undefined ? ruleSetId : ruleSetId.toString(),
        matchModeVal: matchMode,
        ruleIdVal: ruleId,
        ruleCode: strategyCode,
        businessLineId,
        pathState: state
      }, () => {
        this.onRulesQuery()
      })
    } else {
      this.onRulesQuery()
    }
    // this.getCaseRisk()
    // this.getCaseSubject()
    // this.getFieldList()
    // this.getEffectiveTermList()
    console.log('componentDidMount', state)
  }

  componentWillReceiveProps(nextProps) {
    if (!is(fromJS(nextProps.location), fromJS(this.props.location))) {
      const { state = {} } = nextProps.location
      const { ruleSetId = undefined, matchMode = '', ruleId = undefined, modifiable = 1 } = state
      this.setState({
        modifiable,
        rulesetIdVal: ruleSetId === undefined ? ruleSetId : ruleSetId.toString(),
        matchModeVal: matchMode,
        ruleIdVal: ruleId
      }, () => {
        this.onRulesQuery()
      })
    }
  }

  render() {
    const { loading = false, matchModeVal, record, ruleInfo, ruleSaveError, ruleIds, alertVisible, ruleIdVal } = this.state
    const { ruleContent, ruleSet4RuleCopyContent = [], riskPolicyList } = this.props
    const { state: { isView = false, businessLineId, ruleSetId = '', name } = {} } = this.props.location
    const { ruleName = '', ruleCode = '', riskRank = '', description = '', riskPolicy = undefined, actionConfigDtoList = [] } = ruleInfo
    const { keys = actionConfigDtoList.map((actionConfigDto, index) => index) } = this.state
    const { getFieldProps, getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 }
    }
    let ruleSetList = ruleSet4RuleCopyContent
    const { name: currentRuleSetName = '' } = ruleSetList.find(ruleSet => ruleSet.rulesetId === ruleSetId) || {}

    const dataSource = ruleContent.result || []
    dataSource.forEach((s, index) => {
      const { ruleId } = s
      s.key = ruleId
      dataSource[index] = s
    })
    const riskColumn = this.getRiskColumn(matchModeVal)
    const columns = [
      {
        title: '规则编码',
        dataIndex: 'ruleCode',
        key: 'ruleCode',
        width: 150,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 134 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '规则名称',
        dataIndex: 'ruleName',
        key: 'ruleName',
        width: 150,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 134 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '条件数',
        dataIndex: 'num',
        key: 'num',
        render: (text, record) => {
          const { ruleId, rulesetId, modifiable, expression, ruleName } = record
          const state = { ruleId, rulesetId, modifiable, expression, ruleName }
          const { state: ruleData = {} } = this.props.location
          return <Link
            to={{ pathname: `/policy/bazaar/collection/condition`, state: { ...state, ruleData } }}>{text}</Link>
        }
      },
      riskColumn,
      {
        title: '状态',
        dataIndex: 'isActived',
        key: 'isActived',
        render: (text, record) => {
          const { SwitchLoadingId } = this.state
          return <Switch style={{ width: 55 }} loading={SwitchLoadingId === record.ruleId} checkedChildren="ON"
                         unCheckedChildren="OFF"
                         checked={record.ruleInfoStatus !== 'EDITING'}
                         onChange={(checked) => {
                           this.onRuleActive(checked, record)
                         }} disabled={isView} />
        }
      }, {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        render: (text) => {
          return new Date(text).format('yyyy-MM-dd HH:mm:ss')
        },
        width: 150
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 150,
        render: (text, record) => {
          return isView ? <Fragment>
            <span className="operation-span" onClick={() => {
              this.view(record)
            }}>查看</span>
            <span className="operation-span" onClick={() => {
              this.onConditionClick(record)
            }}>条件信息</span>
          </Fragment> : <Fragment>
            <span className="operation-span" onClick={() => {
              this.onEditIconClick(record)
            }}>编辑</span>
            <span className="operation-span" onClick={() => {
              this.onConditionClick(record)
            }}>条件配置</span>
            <span className="operation-span" onClick={() => {
              this.onDeleteIconClick(record)
            }}>删除</span>
          </Fragment>
        }
      }]

    const rowSelection = {
      selectedRowKeys: ruleIds,
      onChange: this.onRowSelect
    }

    let modeText = ''
    switch (matchModeVal) {
      case RULE_SET_MATCH_MODE_RANK:
        modeText = <FormItem {...formItemLayout} label="权重值">
          <Input {...getFieldProps('riskRank', {
            initialValue: riskRank,
            validate: [{
              rules: [
                {
                  required: true,
                  pattern: /^(0|[1-9][0-9]?|100)$/,
                  message: '请输入0-100之间的整数'
                }
              ]
            }]
          })} placeholder="0-100之间的整数" disabled={isView} />
        </FormItem>
        break
      case RULE_SET_MATCH_MODE_WORST:
        modeText = <FormItem {...formItemLayout} label="风险决策">
          <Select {...getFieldProps('riskPolicy', {
            initialValue: riskPolicy,
            validate: [{
              rules: [
                { required: true, message: '请选择风险决策' }
              ]
            }]
          })} placeholder="请选择风险决策" disabled={isView}>
            {
              riskPolicyList.map(riskPolicy => {
                const { decisionName, decisionCode } = riskPolicy
                return (
                  <Option key={decisionCode} value={decisionCode}>{decisionName}</Option>
                )
              })
            }
          </Select>
        </FormItem>
        break
      default:
        break
    }
    return (
      <LayoutRight
        breadCrumb={['策略配置', '策略集市', {
          title: '规则集',
          url: '/policy/bazaar/collection'
        }, !isView ? '编辑规则集' : `查看(规则集${name})`]}
        type={'tabs'}>
        <Tabs type="card" defaultActiveKey={'INFO'} className={'tabs-no-border scorecard-new'}
              activeKey={'CONFIG'}
              onChange={this.onChangeTab} style={{ paddingBottom: isView ? 52 : 0 }}>
          <TabPane tab="基本信息" key={'INFO'} forceRender />
          <TabPane tab="规则配置" key={'CONFIG'} forceRender>
            {
              !isView ? <div className="region-zd">
                <Input placeholder="规则名称" style={{ width: 200 }}
                       onChange={this.ruleIdChange} value={ruleIdVal} />
                <Button type="primary" onClick={this.onRulesQuery} style={{ marginRight: '10px' }}>查询</Button>
                <div style={{ float: 'right' }}>
                  <Button type="primary" onClick={this.onCreateBtnClick}>新建</Button>
                  <Button type="default" onClick={this.onCopyBtnClick}>复制</Button>
                </div>
              </div> : null
            }
            <div style={{ height: !isView ? 'calc(100% - 52px)' : '100%', overflowY: 'scroll' }}>
              <Table rowkey="ruleId" columns={columns} dataSource={dataSource}
                     rowSelection={!isView ? rowSelection : null}
                     locale={{ emptyText: '暂无数据' }}
                     pagination={{
                       showTotal: (total) => {
                         return `共 ${total} 条`
                       },
                       showSizeChanger: true
                     }} />
            </div>
            <Modal
              title="提示"
              wrapClassName="edit-confirm-modal"
              visible={this.state.deleteBanShow}
              maskClosable={false}
              okText="确认"
              cancelText="取消"
              onCancel={() => this.setState({ deleteBanShow: false })}
              onOk={() => this.setState({ deleteBanShow: false })}
            >
              暂时无法操作。<br />
              只有当所属规则集为未激活并且审批完成状态，才可操作。
            </Modal>
            <Modal
              title="删除规则列表"
              wrapClassName="edit-confirm-modal"
              visible={this.state.deleteConfirmShow}
              maskClosable={false}
              okText="确认"
              cancelText="取消"
              onCancel={() => this.setState({ deleteConfirmShow: false })}
              onOk={this.onRuleDelete}
            >
              该规则关联的{record.num}个条件将被一并删除，是否确认删除？
            </Modal>
            <Modal
              title={`${ruleName.length > 0 ? isView ? '查看' : '编辑' : '新建'}规则列表`}
              wrapClassName="edit-confirm-modal"
              visible={this.state.editConfirmShow}
              bodyStyle={{ maxHeight: window.innerHeight * 4 / 5, overflow: 'auto' }}
              confirmLoading={loading}
              maskClosable={false}
              okText="确认"
              cancelText="取消"
              width={800}
              onCancel={this.onEditCancel}
              onOk={this.onRuleSave}
              destroyOnClose
            >
              <Form>
                <FormItem {...formItemLayout} label="规则编码">
                  <Input {...getFieldProps('ruleCode', {
                    initialValue: ruleCode,
                    validate: [{
                      rules: [
                        { required: true, whitespace: true, message: '最多20个字符' }
                      ]
                    }]
                  })} placeholder="最多20个字符" maxLength="20" disabled={isView} />
                </FormItem>
                <FormItem {...formItemLayout} label="规则名称">
                  <Input {...getFieldProps('ruleName', {
                    initialValue: ruleName,
                    validate: [{
                      rules: [
                        { required: true, whitespace: true, message: '最多50个字符' }
                      ]
                    }]
                  })} placeholder="最多50个字符" maxLength="50" disabled={isView} />
                </FormItem>
                {modeText}
                <FormItem {...formItemLayout} label="描述">
                  <TextArea {...getFieldProps('description', {
                    initialValue: description
                  })} rows={4} placeholder="最多200个字符" maxLength="200" disabled={isView} />
                </FormItem>
                {
                  actionConfigDtoList.map((config, index) => {
                    return <FormItem {...formItemLayout} label={index === 0 ? '触发动作' : ' '} colon={false}
                                     key={keys[index]}>
                      {getFieldDecorator(`actionType_${index}`, {
                        initialValue: config,
                        rules: [{ validator: this.checkTriggerAction }],
                        onChange: (e) => this.changeTriggerAction(e, index)
                      })(<TriggerAction businessLineId={businessLineId} disabled={isView}
                                        onRemove={() => this.removeAction(index)} />)}
                    </FormItem>
                  })
                }
                <FormItem {...formItemLayout} label={!isView && actionConfigDtoList.length === 0 ? '触发动作' : ' '}
                          colon={false}>
                  {
                    !isView ? <div className="layout-create" onClick={() => this.addAction()}>添加触发动作</div> : null
                  }
                </FormItem>
                <Row className="save-error">{ruleSaveError}</Row>
              </Form>
            </Modal>
            <Modal
              title="提示"
              wrapClassName="edit-confirm-modal"
              visible={this.state.copyBanShow}
              maskClosable={false}
              okText="确认"
              cancelText="取消"
              onCancel={() => this.setState({ copyBanShow: false })}
              onOk={() => this.setState({ copyBanShow: false })}
            >
              请勾选复制的规则
            </Modal>
            <Modal
              title={`规则复制`}
              wrapClassName="edit-confirm-modal"
              visible={this.state.copyConfirmShow}
              maskClosable={false}
              okText="确认"
              cancelText="取消"
              onCancel={this.onCopyCancel}
              onOk={this.onRuleCopy}
              confirmLoading={loading}
            >
              <Form>
                <FormItem {...formItemLayout} label="复制到">
                  <Select {...getFieldProps('ruleSetId', {
                    // initialValue: rulesetId,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择规则集' }
                      ]
                    }]
                  })} placeholder="请选择规则集" disabled={ruleName.length > 0}>
                    {
                      currentRuleSetName ? <OptGroup label="当前规则集">
                        <Option key={ruleSetId} value={ruleSetId}>{currentRuleSetName}</Option>
                      </OptGroup> : null
                    }
                    <OptGroup label="规则集">
                      {
                        ruleSetList.filter(ruleSet => ruleSet.rulesetId !== ruleSetId).map(ruleSet => {
                          const { name, rulesetId: setId } = ruleSet
                          return (
                            <Option key={setId} value={setId}>{name}</Option>
                          )
                        })
                      }
                    </OptGroup>
                  </Select>
                </FormItem>
              </Form>
            </Modal>
            <Modal
              visible={alertVisible}
              maskClosable={false}
              okText="确认"
              cancelText="取消"
              onCancel={() => this.setState({ alertVisible: false })}
              onOk={() => this.setState({ alertVisible: false })}
            >
              <span>暂时无法操作。只有当所属规则集为未激活并且审批完成状态，才可操作。</span>
            </Modal>
          </TabPane>
          <TabPane tab="关联版本" key={'VERSION'} forceRender />
        </Tabs>
        {
          isView ? <div className="view-back">
            <Button type="primary" onClick={this.viewBack}>退出</Button>
          </div> : null
        }
      </LayoutRight>
    )
  }

  removeAction = (index) => {
    console.log('removeAction', index)
    const { ruleInfo = {} } = this.state
    const { actionConfigDtoList = [] } = ruleInfo
    const { keys = actionConfigDtoList.map((actionConfigDto, index) => index) } = this.state
    actionConfigDtoList.splice(index, 1)
    keys.splice(index, 1)
    this.setState({ ruleInfo: JSON.parse(JSON.stringify(ruleInfo)), keys })
  }

  changeTriggerAction = (e, index) => {
    const { ruleInfo = {} } = this.state
    const { actionConfigDtoList = [] } = ruleInfo
    actionConfigDtoList[index] = { ...actionConfigDtoList[index], ...e }
    console.log('changeTriggerAction', e, index)
    this.setState({ ruleInfo })
  }

  checkTriggerAction = (rule, value, callback) => {
    console.log('checkTriggerAction', rule, value)
    const { autoActionType, blackField, blackTypeId, caseSubject, effectiveTerm, mainField, riskTypes } = value || {}
    switch (autoActionType) {
      case 'ADD_BLACK':
        if (blackField !== undefined && blackTypeId !== undefined && effectiveTerm !== undefined) {
          callback()
          return
        }
        break
      case 'ADD_RISK_CASE':
        if (mainField !== undefined && riskTypes !== undefined && caseSubject !== undefined) {
          callback()
          return
        }
        break
    }
    callback('请填写完相关触发动作的信息')
  }

  addAction = () => {
    let { ruleInfo = {} } = this.state
    const { actionConfigDtoList = [] } = ruleInfo
    const { keys = actionConfigDtoList.map((actionConfigDto, index) => index) } = this.state
    actionConfigDtoList.push({})
    const lastKey = keys.length > 0 ? keys[keys.length - 1] : -1
    keys.push(lastKey + 1)
    ruleInfo = { ...ruleInfo, actionConfigDtoList }
    this.setState({ ruleInfo: JSON.parse(JSON.stringify(ruleInfo)), keys })
  }

  viewBack = () => {
    this.props.history.push({ pathname: '/policy/bazaar/collection' })
  }

  getRiskColumn = matchMode => {
    const { riskPolicyMap = {} } = this.props
    let riskColumn = {}
    switch (matchMode) {
      case RULE_SET_MATCH_MODE_RANK:
        riskColumn = {
          title: '风险权重',
          dataIndex: 'riskRank',
          key: 'riskRank',
          render: (text) => {
            return <span>{!text && text !== 0 ? '-' : text}</span>
          }
        }
        break
      case RULE_SET_MATCH_MODE_WORST:
        riskColumn = {
          title: '风险决策',
          dataIndex: 'riskPolicy',
          key: 'riskPolicy',
          width: 100,
          render: (text, record) => {
            const { riskPolicy } = record
            const decision = riskPolicyMap[riskPolicy] || {}
            const { decisionName = '', riskGrade = '' } = decision || {}
            return <span className={`risk-grade risk-grade-${riskGrade.toLocaleLowerCase()} text-overflow`}>
              {decisionName}
            </span>
          }
        }
        break
    }
    return riskColumn
  }

  onChangeTab = (key) => {
    if (key === 'INFO') {
      this.toRuleList()
    }
    if (key === 'VERSION') {
      this.toRelativeVersion()
    }
  }
  toRuleList = () => {
    this.props.history.push({ pathname: '/policy/bazaar/collection/new', state: this.state.pathState })
  }
  toRelativeVersion = () => {
    this.props.history.push({ pathname: '/policy/bazaar/collection/version', state: this.state.pathState })
  }
  onRulesQuery = () => {
    const { rulesetIdVal, ruleIdVal } = this.state
    this.detailClose()
    this.props.getRuleList({
      ruleSetId: rulesetIdVal,
      ruleName: ruleIdVal
    })
  }

  ruleIdChange = (e) => {
    this.setState({
      ruleIdVal: e.target.value
    })
  }

  onRuleActive = async (checked, record) => {
    if (record.modifiable === 0) {
      this.setState({
        deleteBanShow: true
      })
    } else {
      let { ruleId: id } = record
      await this.setState({ SwitchLoadingId: id })
      const { promise } = await this.props.activeRule({ id })
      promise.then(() => {
        this.onRulesQuery()
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      }).finally(() => {
        this.setState({ SwitchLoadingId: '' })
      })
    }
  }

  detailClose = () => {
    this.setState({ detailVisible: false })
  }

  onEditIconClick = (ruleInfo) => {
    const { state: { isView = false } = {} } = this.props.location
    const { matchMode: matchModeVal = '', actionConfigDtoList = [] } = ruleInfo
    this.setState({
      keys: actionConfigDtoList.map((actionConfigDto, index) => index)
    })
    if (!isView && ruleInfo.modifiable === 0) {
      this.setState({
        deleteBanShow: true
      })
    } else {
      this.setState({
        editConfirmShow: true,
        ruleInfo: JSON.parse(JSON.stringify(ruleInfo)),
        matchModeVal
      }, () => {
        this.props.form.resetFields()
        this.props.form.validateFields()
      })
    }
  }

  view = record => {
    this.onEditIconClick(record)
  }

  onConditionClick = (record) => {
    const { ruleId, rulesetId, modifiable, expression, ruleName } = record
    const state = { ruleId, rulesetId, modifiable, expression, ruleName }
    const { state: ruleData = {} } = this.props.location
    this.props.history.push({ pathname: '/policy/bazaar/collection/condition', state: { ...state, ruleData } })
  }

  onDeleteIconClick = (record) => {
    if (record.modifiable === 0) {
      this.setState({
        deleteBanShow: true
      })
    } else {
      confirm({
        title: `该规则关联的${record.num}个条件将被一并删除，是否确认删除？`,
        content: '',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk: async () => {
          this.onRuleDelete()
        }
      })
      this.setState({
        // deleteConfirmShow: true,
        record
      })
    }
  }

  onRuleDelete = async () => {
    const { ruleId: id = '' } = this.state.record
    const { promise } = await this.props.deleteRule({ id })
    promise.then((data) => {
      const { actionStatus = '' } = data
      if (actionStatus === SUCCESS) {
        this.setState({
          deleteConfirmShow: false
        }, () => {
          this.onRulesQuery()
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onCreateBtnClick = () => {
    // const { modifiable = 0 } = this.state
    // if (modifiable === 0) {
    //   this.setState({ alertVisible: true })
    // } else {
    this.setState({
      editConfirmShow: true,
      ruleInfo: {},
      ruleSaveError: '',
      keys: []
    }, () => {
      this.props.form.resetFields()
    })
    // }
  }

  onRowSelect = (selectedRowKeys) => {
    this.setState({ ruleIds: selectedRowKeys })
  }

  onCopyBtnClick = () => {
    const { ruleIds } = this.state
    if (ruleIds.length === 0) {
      this.setState({
        copyBanShow: true
      })
    } else {
      this.setState({
        copyConfirmShow: true,
        ruleInfo: {}
      })
    }
  }

  onCopyCancel = () => {
    this.setState({ copyConfirmShow: false, ruleInfo: {} }, () => {
      this.props.form.resetFields()
    })
  }

  onRuleCopy = () => {
    this.props.form.validateFields(['ruleSetId'], async (errors, values) => {
      if (errors) {
        return
      }
      try {
        const { ruleIds = [] } = this.state
        const { ruleSetId = '' } = this.props.form.getFieldsValue()
        await this.setState({ loading: true })
        const { promise } = await this.props.copyRule({
          ruleSetId,
          ruleInfoIds: ruleIds.toString()
        })

        promise.then((data) => {
          const { actionStatus = '' } = data
          if (actionStatus === SUCCESS) {
            this.setState({ copyConfirmShow: false, loading: false, ruleIds: [] }, () => {
              this.props.form.resetFields()
              this.onRulesQuery()
            })
          }
        }).catch((data) => {
          const { content = {} } = data
          const { message = '' } = content
          this.setState({ loading: false })
          this.props.form.setFields({
            ruleSetId: {
              errors: [{
                message
              }]
            }
          })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }

  onEditCancel = () => {
    this.setState({ editConfirmShow: false, ruleInfo: {}, ruleSaveError: '' }, () => {
      this.props.form.resetFields()
    })
  }

  onRuleSave = () => {
    const { matchModeVal, ruleInfo = {} } = this.state
    const validateFields = matchModeVal === RULE_SET_MATCH_MODE_RANK
      ? ['rulesetId', 'ruleName', 'ruleCode', 'riskPolicy', 'riskRank']
      : ['rulesetId', 'ruleName', 'ruleCode', 'riskPolicy']
    let validate = [...validateFields]

    const { actionConfigDtoList = [] } = ruleInfo
    if (actionConfigDtoList.length > 0) {
      const actionTypeFields = actionConfigDtoList.map((config, index) => {
        return `actionType_${index}`
      })
      validate = [...validate, ...actionTypeFields]
    }
    console.log('actionTypeFields', this.state, ruleInfo)
    this.props.form.validateFieldsAndScroll(validate, async (errors, values) => {
      if (errors) {
        console.log('onRuleSave', errors, values, validate)
        return
      }
      try {
        const { ruleId = '' } = ruleInfo
        const {
          ruleName = '', ruleCode = '', description = '', riskRank = undefined, riskPolicy = undefined
        } = this.props.form.getFieldsValue()
        const { rulesetIdVal: ruleSetId = '', businessLineId } = this.state
        const triggerActions = actionConfigDtoList.map(config => {
          const { autoActionType, blackField, blackTypeId, caseSubject, effectiveTerm, mainField, riskTypes } = config || {}
          switch (autoActionType) {
            case 'ADD_BLACK':
              return { autoActionType, blackField, blackTypeId, effectiveTerm }
            case 'ADD_RISK_CASE':
              return { autoActionType, mainField, riskTypes, caseSubject }
          }
        })
        console.log('post actionConfigDtoList', triggerActions)
        await this.setState({ loading: true })
        const { promise } = await (ruleId > 0 ? this.props.updateRule({
          businessLineId,
          ruleSetId,
          ruleInfoId: ruleId,
          ruleName,
          ruleCode,
          description,
          riskRank,
          actionConfigDtoList: triggerActions,
          riskPolicy
        }) : this.props.saveRule({
          businessLineId,
          ruleSetId,
          ruleName,
          ruleCode,
          description,
          actionConfigDtoList: triggerActions,
          riskRank,
          riskPolicy
        }))

        promise.then((data) => {
          const { actionStatus = '' } = data
          if (actionStatus === SUCCESS) {
            this.setState({ editConfirmShow: false, loading: false }, () => {
              this.onRulesQuery()
            })
          }
        }).catch((data) => {
          const { content = {} } = data
          const { message = '' } = content
          this.setState({ loading: false, ruleSaveError: message })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(RuleList))
