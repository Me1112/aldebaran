import React, { Fragment } from 'react'
import LayoutRight from '../../../../component/layout_right'
import PropTypes from 'prop-types'
import { Button, Input, notification, Modal, Form, Select, AutoComplete, Table, Tooltip, DatePicker } from 'antd'
import moment from 'moment'
import classnames from 'classnames'
import {
  getRuleCondition,
  getRuleConditionTypeList,
  getFieldsOperators,
  getArithmeticStrList,
  getNumberOperatorTypeList,
  delCondition,
  updateRuleCondition,
  updateExpressionCondition,
  getHistoryFactorList,
  getEnumList,
  getListRightData,
  getExpression,
  addRuleCondition
} from '../../../../action/rule'
import { buildUrlParamNew, initFieldListData } from '../../../../util'
import './index.less'
import { unitList } from '../../../../action/policy'
import { getAllOperators } from '../../../../action/common'
import { getFieldList } from '../../../../action'

const confirm = Modal.confirm

const { Option, OptGroup } = Select
const formFiltsLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 }
  }
}

const { NORMAL, ARITHMETIC, MULTI_VALUE, TIME_PERIOD, LIST, INCLUDE } = {
  NORMAL: 'NORMAL',
  ARITHMETIC: 'ARITHMETIC',
  MULTI_VALUE: 'MULTI_VALUE',
  TIME_PERIOD: 'TIME_PERIOD',
  LIST: 'LIST',
  INCLUDE: 'INCLUDE'
}
const INCLUDEMultiSelect = ['BELONG', 'NOT_BELONG']

const CUSTOM_TIME = 'CUSTOM_TIME'

class RulesCondition extends React.Component {
  constructor(prop) {
    super(prop)
    this.eidtType = 'add'
    this.coditionTypeMap = {}
    this.state = {
      expressionEdit: false
    }
  }

  static propTypes = {
    form: PropTypes.any,
    ruleList: PropTypes.array,
    location: PropTypes.object,
    history: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { state = {} } = this.props.location
    let { ruleId = '', rulesetId = '', modifiable = 1, ruleData: { businessLineId } = {} } = state
    if (!ruleId) {
      ruleId = ''
    }
    this.getRuleConditionFields(businessLineId)
    this.getRuleConditionTypeList()
    this.getAllOperators()
    this.getArithmeticStrList()
    this.unitList()
    this.getHistoryFactorList(businessLineId)
    // this.getFieldDimensionality()
    this.setState({
      ruleId: `${ruleId}`, rulesetId: `${rulesetId}`, modifiable
    }, () => {
      this.getRuleCondition()
      this.getExpression(ruleId)
    })
  }

  render() {
    const { state = {} } = this.props.location
    const { ruleName, ruleData = {} } = state
    const { isView = false } = ruleData
    const { getFieldProps } = this.props.form
    const { rulesetId = '', addLoading = false, expressionEdit, expression, showModel = false, conditionInfo = {}, conditionTypeList = [], dataSource = [], ruleId } = this.state
    let conditionType = this.props.form.getFieldValue('conditionType')
    if (this.eidtType !== 'add') {
      const { conditionType: oldConditionType = 'LIST' } = conditionInfo
      conditionType = oldConditionType
    }
    const columns = [
      {
        title: '序号',
        key: 'index',
        dataIndex: 'index',
        width: 50
      },
      {
        title: '详情',
        key: 'conditionKey',
        dataIndex: 'conditionKey',
        render: (text, data) => {
          return this.renderTableList(data)
        }
      }]
    if (!isView) {
      columns.push({
        title: '操作',
        dataIndex: 'conditionId',
        key: 'conditionId',
        width: 100,
        render: (text, data) => {
          return <Fragment>
            <span className="operation-span" onClick={() => this.edit(data)}>编辑</span>
            <span className="operation-span" onClick={() => this.del(text)}>删除</span>
          </Fragment>
        }
      })
    }
    let tips = ''
    switch (conditionType) {
      case NORMAL:
        tips = '示例：取现地址与登陆地址不匹配'
        break
      case ARITHMETIC:
        tips = '当月日平均交易金额乘2小于等于日累计交易金额'
        break
      case MULTI_VALUE:
        tips = '示例：失信被执行人次数、被执行人次数、裁判文书次数的和大于5'
        break
      case TIME_PERIOD:
        tips = '示例：当前时间距离上次登陆时间的时间差小于10分钟'
        break
      case LIST:
        tips = '示例：手机号任意命中注册手机号黑名单、绑定手机号黑名单'
        break
      case INCLUDE:
        tips = '示例：设备   包含于  近3个月常用设备列表'
        break
    }
    const conditionFieldDOM = this.conditionFieldDOMRender()

    return <Fragment>
      <LayoutRight className={classnames('policy-condition', { 'view': isView })}
                   breadCrumb={['策略配置', '策略集市', { title: '规则集', url: '/policy/bazaar/collection' },
                     {
                       title: '规则',
                       url: '/policy/bazaar/collection/config',
                       state: { ruleSetId: rulesetId, ...ruleData }
                     }, `条件配置(${ruleName})`]}>
        <div className="region-zd">
          {
            isView ? <div style={{ display: 'inline-block' }}>
                <span>关系表达式:</span>
                <span style={{ margin: '0 10px', color: '#971DA3' }}>{expression}</span></div>
              : <Fragment>
                <div style={{ display: 'inline-block' }}>
                  <span>关系表达式:</span>
                  {expressionEdit ? <div style={{ display: 'inline-block' }}>
                    <Input style={{ width: 500, margin: '0 10px' }} maxLength="50"
                           defaultValue={expression} ref="expression-input" />
                    <Button type="primary" onClick={this.expressionSave}>确定</Button>
                    <Button onClick={this.editTrigger}>取消</Button>
                  </div> : <div style={{ display: 'inline-block' }}>
                    <span style={{ margin: '0 10px', color: '#971DA3' }}>{expression}</span>
                    <i className="anticon anticon-edit"
                       style={{ cursor: 'pointer' }}
                       onClick={this.editTrigger} />
                  </div>
                  }
                  {
                    ruleId !== '' && expressionEdit
                      ? <p style={{ marginLeft: 82 }}>"&&"表示AND,"||"表示OR，条件编号之间用"&&"和"||"进行连接，用括号"()"来定义条件优先级，
                        "()"最多只能用一层。请勿使用"&&"，"||"，"()"和空格之外的其它字符或全角字符。示例 ( OB00001 && OB00002 ) && ( OB00003 || OB00004
                        )</p> : null
                  }
                </div>
                <div style={{ height: 32 }}>
                  <Button type="primary" style={{ float: 'right' }} onClick={this.newIndicators}>新建</Button>
                </div>
              </Fragment>
          }
        </div>
        <div style={{ height: expressionEdit ? 'calc(100% - 148px)' : 'calc(100% - 44px)', overflowY: 'scroll' }}>
          <Table rowKey="conditionId" locale={{ emptyText: '暂无数据' }} showHeader={false}
                 columns={columns}
                 pagination={false}
                 dataSource={dataSource} />
        </div>
        <Modal className={'policy-condition-modal'} width={800} title={`${this.eidtType === 'edit' ? '编辑' : '新建'}条件`}
               visible={showModel} confirmLoading={addLoading}
               onCancel={this.onCancel} onOk={this.onOk}>
          <Form style={{ paddingRight: '50px' }}>
            <Form.Item {...formItemLayout} label={'条件类型'}>
              <Fragment>
                <Select disabled={this.eidtType === 'edit'} {...getFieldProps(`conditionType`, {
                  initialValue: conditionType,
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请选择条件类型'
                  }],
                  onChange: this.conditionTypeChange
                })} style={{ width: '30%', marginRight: '4%' }} placeholder="请选择条件类型" dropdownMatchSelectWidth={false}>
                  {
                    conditionTypeList.map(item => {
                      return <Option key={item.value} value={item.value}>{item.name}</Option>
                    })
                  }
                </Select>
                <span className={'tips-span'}>
                {tips}
                </span>
              </Fragment>
            </Form.Item>
            {conditionFieldDOM}
          </Form>
        </Modal>
      </LayoutRight>
      {
        isView ? <div className="view-back" style={{ width: 'calc(100% - 200px)', minWidth: 1000 }}>
          <Button type="primary" onClick={this.viewBack}>退出</Button>
          <Button onClick={this.viewPrev}>返回</Button>
        </div> : null
      }
    </Fragment>
  }

  viewPrev = () => {
    const { state = {} } = this.props.location
    const { ruleData = {} } = state
    const { rulesetId = '' } = this.state
    this.props.history.push({
      pathname: '/policy/bazaar/collection/config',
      state: { ruleSetId: rulesetId, ...ruleData }
    })
  }

  viewBack = () => {
    this.props.history.push({ pathname: '/policy/bazaar/collection' })
  }

  conditionTypeChange = (value, bol, conditionConfig = {}, onlyField = false) => {
    // const { conditionType: value, conditionConfig = {} } = data
    if (!onlyField && bol) {
      this.props.form.resetFields()
      this.props.form.setFieldsValue({ conditionType: value })
    }
    const { conditionFieldsList = [] } = this.state
    // let filterFields = []
    let list = []
    switch (value) {
      case NORMAL: {
        // 一般
        list = conditionFieldsList
        break
      }
      case ARITHMETIC:
      case MULTI_VALUE: {
        // 四则比较、多数值和比较
        // decimal
        list = conditionFieldsList.filter(i => i.dataType === 'DECIMAL')
        break
      }
      case TIME_PERIOD: {
        // 时间差比较
        // date
        list = conditionFieldsList.filter(i => i.dataType === 'DATETIME')
        break
      }
      case LIST: {
        // 名单命中
        // decimal
        list = conditionFieldsList.filter(i => i.fieldDataCategory !== 'FACTOR')
        if (conditionConfig.leftData) {
          this.changeListField(conditionConfig.leftData)
        }
        break
      }
      case INCLUDE: {
        // 列表包含
        // decimal
        list = conditionFieldsList.filter(i => i.fieldDataCategory !== 'FACTOR' && i.dataType === 'STRING')
        break
      }
    }
    const { tree } = initFieldListData(list, { onlyClassification: true })
    console.log('list', list)
    this.setState({ conditionFields: tree })
    return tree
  }
  conditionFieldDOMRender = () => {
    const { getFieldDecorator } = this.props.form

    const {
      enumList = [], conditionInfo = {}, FieldsOperators = [], conditionFields = [], blackListTypeList = [],
      arithmeticStrList = [], unitList = [], historyFactorList = [], allOperators = {}, conditionFieldsNotDims = [],
      customTimeSelected, dataType
    } = this.state
    let conditionType = this.props.form.getFieldValue('conditionType')
    if (this.eidtType !== 'add') {
      conditionType = conditionInfo.conditionType
    }
    const { conditionConfig = {} } = conditionInfo
    const { leftDataList = [], leftData, leftDataType, hitStatus, rightDataList = [], rightData, operator, computeData, arithmetic, time, timeUnit } = conditionConfig
    let RightItem = ''
    if (enumList) {
      let operator = this.props.form.getFieldValue('operator')

      RightItem = <Select mode={INCLUDEMultiSelect.includes(operator) ? 'multiple' : ''} placeholder="请选择"
                          dropdownMatchSelectWidth={false}>
        {
          enumList.map(item => {
            return <Option key={item.key} value={item.key}>{item.value}</Option>
          })
        }
      </Select>
    }
    console.log('rightData', rightData)
    switch (conditionType) {
      case NORMAL:
        // 一般
        return <div className="form-item-Inline">
          <Form.Item {...formFiltsLayout} style={{ marginRight: '20px' }} label={' '} required={false} colon={false}>
            {
              getFieldDecorator(`leftData`, {
                initialValue: leftData,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请选择'
                }],
                onChange: this.changeField
              })(
                <Select placeholder="请选择" dropdownMatchSelectWidth={false}>
                  {
                    conditionFields.map(item => {
                      return this.fieldOpt(item)
                    })
                  }
                </Select>
              )}
          </Form.Item>
          <Form.Item style={{ width: '100px', marginRight: '-5px' }}>{getFieldDecorator(`operator`, {
            initialValue: operator,
            rules: [{
              required: true,
              whitespace: true,
              message: '操作符'
            }],
            onChange: this.normalOperatorChange
          })(
            <Select style={{ width: '100px' }} placeholder="操作符" dropdownMatchSelectWidth={false}>
              {
                FieldsOperators.map(item => {
                  return <Option key={item.operator}
                                 value={item.operator}>{item.description}</Option>
                })
              }
            </Select>
          )}</Form.Item>
          {
            customTimeSelected ? null
              : <Form.Item style={{ width: 'calc(50% - 120px)' }} wrapperCol={{ span: 24 }} label={''}>
                {
                  getFieldDecorator(`rightData`, {
                    initialValue: leftDataType !== dataType && dataType === 'DATETIME' ? '' : rightData && typeof rightData === 'object' ? rightData.split(',') : rightData,
                    rules: [{
                      validator: (rules, value, callback) => {
                        if (!value) {
                          callback('请选择')
                        }
                        console.log('validator', value)
                        callback()
                      }
                    }],
                    onChange: this.selectCustomTime
                  })(
                    !RightItem ? <AutoComplete placeholder="请输入/选择" style={{ width: '100%' }}>
                      {dataType === 'DATETIME'
                        ? <Option key={CUSTOM_TIME} value={CUSTOM_TIME}>自定义时间</Option> : null}
                      {
                        conditionFields.map(item => {
                          return this.fieldOpt(item)
                        })
                      }
                    </AutoComplete> : RightItem
                  )}
              </Form.Item>
          }
          {
            customTimeSelected ? <Form.Item style={{ width: 'calc(50% - 120px)' }} wrapperCol={{ span: 24 }} label={''}>
              {
                getFieldDecorator(`rightDataCustomTime`, {
                  initialValue: rightData ? moment(rightData) : null,
                  rules: [{
                    validator: (rules, value, callback) => {
                      if (!value) {
                        callback('请选择')
                      }
                      console.log('validator', value)
                      callback()
                    }
                  }]
                })(
                  <DatePicker dropdownClassName="custom-time" placeholder="请选择" format="YYYY-MM-DD HH:mm:ss"
                              showTime={{ format: 'HH:mm:ss' }} style={{ width: '100%' }} allowClear={false}
                              showToday={false}
                              renderExtraFooter={() => <Button size="small"
                                                               onClick={this.goBackSelect}>返回字段列表</Button>} />
                )}
            </Form.Item> : null
          }
        </div>
      case ARITHMETIC:
        // 四则比较
        return <Fragment>
          <div className="form-item-Inline">
            <Form.Item {...formFiltsLayout} style={{ marginRight: '10px' }} label={' '} required={false}
                       colon={false}>
              {
                getFieldDecorator(`leftData`, {
                  initialValue: leftData,
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入/选择'
                  }]
                })(
                  <AutoComplete placeholder="请输入/选择">
                    {
                      conditionFields.map(item => {
                        return this.fieldOpt(item)
                      })
                    }
                  </AutoComplete>
                )}
            </Form.Item>
            <Form.Item style={{ width: '90px', marginRight: '10px' }}
                       wrapperCol={{ span: 24 }}>{getFieldDecorator(`arithmetic`, {
              initialValue: arithmetic,
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择运算符'
              }]
            })(
              <Select style={{ width: '90px' }} placeholder="运算符" dropdownMatchSelectWidth={false}>
                {
                  arithmeticStrList.map(item => {
                    return <Option key={item.index} value={item.index}>{item.name}</Option>
                  })
                }
              </Select>
            )}</Form.Item>
            <Form.Item style={{ width: 'calc(50% - 125px)', marginRight: '0px' }}
                       wrapperCol={{ span: 24 }}>
              {
                getFieldDecorator(`rightData`, {
                  initialValue: rightData,
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入/选择'
                  }, {
                    validator: (rules, value, callback) => {
                      if (value === 0 || value === '0') {
                        callback('值不能为0')
                      }
                      callback()
                    }
                  }]
                })(
                  <AutoComplete placeholder="请输入/选择">
                    {
                      conditionFields.map(item => {
                        return this.fieldOpt(item)
                      })
                    }
                  </AutoComplete>
                )}
            </Form.Item>
          </div>
          <div className="form-item-Inline" style={{ paddingLeft: '16.666%', justifyContent: 'end' }}>
            <Form.Item style={{ width: '100px', marginRight: '-5px' }}>{getFieldDecorator(`operator`, {
              initialValue: operator,
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择操作符'
              }]
            })(
              <Select style={{ width: '100px' }} placeholder="操作符" dropdownMatchSelectWidth={false}>
                {
                  (allOperators['decimal'] || []).map(item => {
                    return <Option key={item.operator}
                                   value={item.operator}>{item.description}</Option>
                  })
                }
              </Select>
            )}</Form.Item>
            <Form.Item style={{ width: 'calc(50% - 120px)' }} wrapperCol={{ span: 24 }} label={''}>
              {
                getFieldDecorator(`computeData`, {
                  initialValue: computeData,
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入/选择'
                  }]
                })(
                  <AutoComplete placeholder="请输入/选择">
                    {
                      conditionFields.map(item => {
                        return this.fieldOpt(item)
                      })
                    }
                  </AutoComplete>
                )}
            </Form.Item>
          </div>
        </Fragment>
      case MULTI_VALUE:
        // 多数值和比较
        return <Fragment>
          <div className="form-item-Inline">
            <Form.Item {...formFiltsLayout} label=" " required={false} colon={false}>
              {
                getFieldDecorator(`leftDataIdList`, {
                  initialValue: leftDataList.map(d => d.leftData),
                  rules: [{
                    required: true,
                    message: '请选择'
                  }]
                })(
                  <Select style={{ width: 230 }} placeholder="请选择" dropdownMatchSelectWidth={false} mode="multiple">
                    {
                      conditionFields.map(item => {
                        return this.fieldOpt(item)
                      })
                    }
                  </Select>
                )}
            </Form.Item>
            <span style={{ position: 'relative', top: 8 }}>的和</span>
            <Form.Item style={{ width: 90 }}
                       wrapperCol={{ span: 24 }}>{getFieldDecorator(`operator`, {
              initialValue: operator,
              rules: [{
                required: true,
                message: '请选择操作符'
              }]
            })(
              <Select style={{ width: 100 }} placeholder="操作符" dropdownMatchSelectWidth={false}>
                {
                  (allOperators['decimal'] || []).map(item => {
                    return <Option key={item.operator}
                                   value={item.operator}>{item.description}</Option>
                  })
                }
              </Select>
            )}</Form.Item>
            <Form.Item style={{ width: 200, marginLeft: -2 }} wrapperCol={{ span: 24 }} label="">
              {
                getFieldDecorator(`rightData`, {
                  initialValue: rightData,
                  rules: [{
                    required: true,
                    message: '请输入/选择'
                  }]
                })(
                  <AutoComplete placeholder="请输入/选择">
                    {
                      conditionFields.map(item => {
                        return this.fieldOpt(item)
                      })
                    }
                  </AutoComplete>
                )}
            </Form.Item>
          </div>
        </Fragment>
      case TIME_PERIOD:
        // 时间差
        return <Fragment>
          <div className="form-item-Inline"
               style={{ paddingLeft: '16.666%', justifyContent: 'end', lineHeight: '39.9999px' }}>
            <Form.Item style={{ width: '240px', marginRight: '10px' }}>
              {
                getFieldDecorator(`leftData`, {
                  initialValue: leftData,
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请选择'
                  }]
                })(
                  <Select placeholder="请选择" dropdownMatchSelectWidth={false}>
                    {
                      conditionFields.map(item => {
                        return this.fieldOpt(item)
                      })
                    }
                  </Select>
                )}
            </Form.Item>
            至
            <Form.Item style={{ width: '220px', marginRight: '10px', marginLeft: '10px' }}>
              {
                getFieldDecorator(`rightData`, {
                  initialValue: rightData,
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请选择'
                  }]
                })(
                  <Select placeholder="请选择" dropdownMatchSelectWidth={false}>
                    {
                      conditionFields.map(item => {
                        return this.fieldOpt(item)
                      })
                    }
                  </Select>
                )}
            </Form.Item>
            的时间差 <Tooltip placement="top" title={'时间差=时间1-时间2'}>
            <i className="anticon anticon-question-circle" style={{
              display: 'inline-block',
              marginTop: '12px',
              paddingLeft: '5px'
            }} /></Tooltip>
          </div>
          <div className="form-item-Inline"
               style={{ paddingLeft: '16.666%', justifyContent: 'end', lineHeight: '39.9999px' }}>
            <Form.Item style={{ width: '100px', marginRight: '-5px' }}>{getFieldDecorator(`operator`, {
              initialValue: operator,
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择'
              }]
            })(
              <Select style={{ width: '100px' }} placeholder="操作符" dropdownMatchSelectWidth={false}>
                {
                  (allOperators['DECIMAL'] || []).map(item => {
                    return <Option key={item.operator}
                                   value={item.operator}>{item.description}</Option>
                  })
                }
              </Select>
            )}</Form.Item>
            <Form.Item style={{ width: '145px', marginRight: '10px' }} wrapperCol={{ span: 24 }} label={''}>
              {
                getFieldDecorator(`time`, {
                  initialValue: time,
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入数值'
                  }]
                })(
                  <Input placeholder={'数值'} maxLength={50} />
                )}
            </Form.Item>
            （时间精度：
            <Form.Item style={{ width: '80px', margin: '0 5px' }}>{getFieldDecorator(`timeUnit`, {
              initialValue: timeUnit,
              rules: [{
                required: true,
                whitespace: true,
                message: '请选择'
              }]
            })(
              <Select style={{ width: '80px' }} placeholder="单位" dropdownMatchSelectWidth={false}>
                {
                  unitList.map(item => {
                    return <Option key={item.index}
                                   value={item.index}>{item.name}</Option>
                  })
                }
              </Select>
            )}</Form.Item>)
          </div>
        </Fragment>
      case LIST:
        // 名单
        return <div className="form-item-Inline">
          <Form.Item {...formFiltsLayout} style={{ marginRight: '20px' }} label={' '} required={false} colon={false}>
            {
              getFieldDecorator(`leftData`, {
                initialValue: leftData,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请选择'
                }],
                onChange: this.changeListField
              })(
                <Select placeholder="请选择" dropdownMatchSelectWidth={false}>
                  {
                    conditionFieldsNotDims.map(item => {
                      return this.fieldOpt(item)
                    })
                  }
                </Select>
              )}
          </Form.Item>
          <Form.Item style={{ width: '120px', marginRight: '-5px' }}>{getFieldDecorator(`hitStatus`, {
            initialValue: hitStatus,
            rules: [{
              required: true,
              whitespace: true,
              message: '操作符'
            }]
          })(
            <Select style={{ width: '120px' }} placeholder="操作符" dropdownMatchSelectWidth={false}>
              <Option value={'HIT'}>任意命中</Option>
              <Option value={'NOT_HIT'}>全部不命中</Option>
            </Select>
          )}</Form.Item>
          <Form.Item style={{ width: 'calc(50% - 140px)' }} wrapperCol={{ span: 24 }} label={''}>
            {
              getFieldDecorator(`blacklistIdList`, {
                initialValue: rightDataList.map(rightData => rightData.blacklistId),
                rules: [{
                  required: true,
                  message: '请选择'
                }]
              })(
                <Select placeholder="请选择" dropdownMatchSelectWidth={false} mode="multiple">
                  {
                    blackListTypeList.map(item => {
                      return <Option key={item.id}
                                     value={item.id}>{item.listName}</Option>
                    })
                  }
                </Select>
              )}
          </Form.Item>
        </div>
      case INCLUDE:
        // 包含
        return <div className="form-item-Inline">
          <Form.Item {...formFiltsLayout} style={{ marginRight: '20px' }} label={' '} required={false} colon={false}>
            {
              getFieldDecorator(`leftData`, {
                initialValue: leftData,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请选择'
                }],
                onChange: (e) => this.changeField(e, true)
              })(
                <Select placeholder="请选择" dropdownMatchSelectWidth={false}>
                  {
                    conditionFields.map(item => {
                      return this.fieldOpt(item)
                    })
                  }
                </Select>
              )}
          </Form.Item>
          <Form.Item style={{ width: '100px', marginRight: '-5px' }}>{getFieldDecorator(`operator`, {
            initialValue: operator,
            rules: [{
              required: true,
              whitespace: true,
              message: '操作符'
            }]
          })(
            <Select style={{ width: '100px' }} placeholder="操作符" dropdownMatchSelectWidth={false}>
              <Option value={'BELONG'}>属于</Option>
              <Option value={'NOT_BELONG'}>不属于</Option>
            </Select>
          )}</Form.Item>
          <Form.Item style={{ width: 'calc(50% - 120px)' }} wrapperCol={{ span: 24 }} label={''}>
            {
              getFieldDecorator(`rightData`, {
                initialValue: rightData,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请选择'
                }]
              })(
                <Select placeholder="请选择" dropdownMatchSelectWidth={false}>
                  {
                    historyFactorList.map(item => {
                      return <Option key={item.factorKey}
                                     value={item.factorKey}>{item.factorName}</Option>
                    })
                  }
                </Select>
              )}
          </Form.Item>
        </div>
      default:
        return null
    }
  }

  selectCustomTime = (value) => {
    const customTimeSelected = value === CUSTOM_TIME
    const { conditionInfo = {} } = this.state
    const { conditionConfig = {} } = conditionInfo
    if (customTimeSelected) {
      conditionConfig.rightData = null
      conditionInfo.conditionConfig = conditionConfig
    }
    this.setState({ conditionInfo, customTimeSelected })
  }

  goBackSelect = (value) => {
    const { conditionInfo = {} } = this.state
    const { conditionConfig = {} } = conditionInfo
    conditionConfig.rightData = null
    conditionInfo.conditionConfig = conditionConfig
    this.setState({ customTimeSelected: false })
  }

  renderTableList = (data = {}) => {
    const { conditionType, conditionId, conditionConfig = {} } = data
    const { leftDataList, leftDataName, rightDataName, operatorName, computeDataName, arithmeticName, hitStatusName, rightDataList = [], time, timeUnitName } = conditionConfig
    let tips = null
    switch (conditionType) {
      case NORMAL:
        // 一般
        tips = <span>{leftDataName} <span>{operatorName}</span> {rightDataName}</span>
        break
      case ARITHMETIC:
        // 四则比较
        tips = <span>{leftDataName} <span>{arithmeticName}</span> {rightDataName}
          <span>{operatorName}</span> {computeDataName}</span>
        break
      case MULTI_VALUE:
        // 多数值和比较
        tips = <span>{leftDataList.map(leftData => leftData.leftDataName).join('、')} <span>的和 </span>
          <span>{operatorName}</span> {rightDataName}</span>
        break
      case TIME_PERIOD:
        // 时间差
        tips = <span>{leftDataName} 至 {rightDataName} 的时间差 <span>{operatorName}</span> {time}{timeUnitName}</span>
        break
      case LIST:
        // 名单
        tips = <span>{leftDataName}
          <span>{hitStatusName}</span> {rightDataList.map(rightData => rightData.blacklistName).join('、')}</span>
        break
      case INCLUDE:
        // 包含
        tips = <span>{leftDataName} <span>{operatorName}</span> {rightDataName}</span>
        break
    }
    return <Fragment>
      <div className={'table-title'}>{this.coditionTypeMap[conditionType]} ({conditionId})</div>
      <div className={'table-tips'}>{tips}</div>
    </Fragment>
  }

  normalOperatorChange = e => {
    // 一般条件 操作符 选择包含，包含于的时候 rightdata 多选
    this.props.form.setFieldsValue({ rightData: undefined })
  }

  fieldOpt = item => {
    return <OptGroup key={item.name} value={item.name}>
      {
        item.list.map(list => {
          return <Option key={list.fieldName} value={list.fieldName}>{list.fieldDisplayName}</Option>
        })
      }</OptGroup>
  }

  changeListField = e => {
    // 名单命中leftData 修改
    let id = ''
    const { conditionFieldsNotDimsList = [] } = this.state
    conditionFieldsNotDimsList.forEach(item => {
      if (item.fieldName === e) {
        id = item.dimensionalityId
      }
    })
    this.props.form.setFieldsValue({ blacklistIdList: [] })
    getListRightData(buildUrlParamNew({ id })).then(res => {
      const { content = [] } = res
      this.setState({ blackListTypeList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onCancel = () => {
    this.props.form.resetFields()
    // this.props.form.setFieldsValue({ conditionType: undefined })
    this.setState({ showModel: false, conditionInfo: {} })
  }
  onOk = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values)
      const {
        conditionFieldsList = [], blackListTypeList = [], unitList = [], FieldsOperators = [],
        arithmeticStrList = [], historyFactorList = [], conditionInfo = {}, allOperators = {}, enumList = [],
        conditionFieldsNotDimsList = [], customTimeSelected
      } = this.state
      const { conditionType, leftDataIdList, leftData, rightData, rightDataCustomTime, operator, hitStatus, blacklistIdList, arithmetic, computeData, time, timeUnit } = values
      if (!err) {
        let conditionConfig = {}
        switch (conditionType) {
          case NORMAL: {
            // 一般条件
            conditionConfig = {
              leftData,
              rightData: customTimeSelected ? rightDataCustomTime.valueOf() : rightData,
              operator
            }
            let isNotSelect = true
            conditionFieldsList.forEach(item => {
              const { fieldDataCategory, dataType, fieldDisplayName, fieldName } = item
              if (fieldName === leftData) {
                conditionConfig.leftDataCategory = fieldDataCategory
                conditionConfig.leftDataName = fieldDisplayName
                conditionConfig.leftDataType = dataType
              }
              if (fieldName === rightData) {
                isNotSelect = false
                conditionConfig.rightDataCategory = fieldDataCategory
                conditionConfig.rightDataName = fieldDisplayName
                conditionConfig.rightDataType = dataType
              }
            })
            if (isNotSelect) {
              conditionConfig.rightDataCategory = 'CONSTANT'
              conditionConfig.rightDataName = rightData
              conditionConfig.rightDataType = conditionConfig.leftDataType
            }
            if (customTimeSelected) {
              conditionConfig.rightDataCategory = 'CONSTANT'
              conditionConfig.rightDataName = rightDataCustomTime.format('YYYY-MM-DD HH:mm:ss')
              conditionConfig.rightDataType = 'DATETIME'
            } else {
              if (conditionConfig.leftDataType === 'ENUM' || conditionConfig.leftDataType === 'BOOLEAN') {
                let rightNameArr = []
                enumList.forEach(item => {
                  if (typeof rightData === 'object') {
                    rightData.forEach(r => {
                      if (r === item.key) {
                        rightNameArr.push(item.value)
                      }
                    })
                  } else if (item.key === rightData) {
                    conditionConfig.rightDataCategory = item.fieldDataCategory || 'CONSTANT'
                    conditionConfig.rightDataName = item.value
                    conditionConfig.rightDataType = item.dataType || 'STRING'
                  }
                })
                if (rightNameArr.length > 0) {
                  conditionConfig.rightDataCategory = 'CONSTANT'
                  conditionConfig.rightDataName = rightNameArr.join(',')
                  conditionConfig.rightData = rightData.join(',')
                  conditionConfig.rightDataType = 'STRING'
                }
              }
              // else if (conditionConfig.leftDataType === 'BOOLEAN') {
              //   conditionConfig.rightDataCategory = 'CONSTANT'
              //   conditionConfig.rightDataName = rightData === 'true' ? '是' : '否'
              //   conditionConfig.rightDataType = 'STRING'
              // }
            }

            FieldsOperators.forEach(item => {
              if (operator === item.operator) {
                conditionConfig.operatorName = item.description
              }
            })
            break
          }
          case ARITHMETIC: {
            // 四则比较
            conditionConfig = {
              leftData,
              rightData,
              arithmetic,
              computeData,
              operator
            }
            const { decimal = [] } = allOperators

            let isNotSelect = true
            let isNotSelectLeft = true
            let isNotSelectRight = true
            conditionFieldsList.forEach(item => {
              // decimal
              const { fieldDataCategory, dataType, fieldDisplayName, fieldName } = item
              if (fieldName === leftData) {
                isNotSelectLeft = false
                conditionConfig.leftDataCategory = fieldDataCategory
                conditionConfig.leftDataName = fieldDisplayName
                conditionConfig.leftDataType = dataType
              }
              if (fieldName === rightData) {
                isNotSelectRight = false
                conditionConfig.rightDataCategory = fieldDataCategory
                conditionConfig.rightDataName = fieldDisplayName
                conditionConfig.rightDataType = dataType
              }
              if (fieldName === computeData) {
                isNotSelect = false
                conditionConfig.computeDataCategory = fieldDataCategory
                conditionConfig.computeDataName = fieldDisplayName
                conditionConfig.computeDataType = dataType
              }
            })
            if (isNotSelectLeft) {
              conditionConfig.leftDataCategory = 'CONSTANT'
              conditionConfig.leftDataName = leftData
              conditionConfig.leftDataType = 'DECIMAL'
            }
            if (isNotSelectRight) {
              conditionConfig.rightDataCategory = 'CONSTANT'
              conditionConfig.rightDataName = rightData
              conditionConfig.rightDataType = 'DECIMAL'
            }
            if (isNotSelect) {
              conditionConfig.computeDataCategory = 'CONSTANT'
              conditionConfig.computeDataName = computeData
              conditionConfig.computeDataType = 'DECIMAL'
            }
            arithmeticStrList.forEach(item => {
              if (arithmetic === item.index) {
                conditionConfig.arithmeticName = item.name
              }
            })
            decimal.forEach(item => {
              if (operator === item.operator) {
                conditionConfig.operatorName = item.description
              }
            })
            break
          }
          case MULTI_VALUE: {
            // 多数值和比较
            conditionConfig = {
              rightData,
              operator
            }
            const leftDataList = []
            const { decimal = [] } = allOperators

            let isNotSelectRight = true
            conditionFieldsList.forEach(item => {
              // decimal
              const { fieldDataCategory, dataType, fieldDisplayName, fieldName } = item
              if (leftDataIdList.indexOf(fieldName) !== -1) {
                leftDataList.push({
                  leftData: fieldName,
                  leftDataCategory: fieldDataCategory,
                  leftDataName: fieldDisplayName,
                  leftDataType: dataType
                })
              }
              if (fieldName === rightData) {
                isNotSelectRight = false
                conditionConfig.rightDataCategory = fieldDataCategory
                conditionConfig.rightDataName = fieldDisplayName
                conditionConfig.rightDataType = dataType
              }
            })
            conditionConfig = {
              ...conditionConfig,
              leftDataList
            }
            if (isNotSelectRight) {
              if (isNaN(rightData)) {
                this.props.form.setFields({
                  rightData: {
                    value: rightData,
                    errors: [new Error('请输入数值类常量')]
                  }
                })
                return
              }
              conditionConfig.rightDataCategory = 'CONSTANT'
              conditionConfig.rightDataName = rightData
              conditionConfig.rightDataType = 'DECIMAL'
            }
            decimal.forEach(item => {
              if (operator === item.operator) {
                conditionConfig.operatorName = item.description
              }
            })
            break
          }
          case TIME_PERIOD: {
            // 时间差
            conditionConfig = {
              leftData,
              rightData,
              operator,
              timeUnit,
              time
            }
            const { decimal = [] } = allOperators
            conditionFieldsList.forEach(item => {
              const { fieldDataCategory, dataType, fieldDisplayName, fieldName } = item
              if (fieldName === leftData) {
                conditionConfig.leftDataCategory = fieldDataCategory
                conditionConfig.leftDataName = fieldDisplayName
                conditionConfig.leftDataType = dataType
              }
              if (fieldName === rightData) {
                conditionConfig.rightDataCategory = fieldDataCategory
                conditionConfig.rightDataName = fieldDisplayName
                conditionConfig.rightDataType = dataType
              }
            })
            unitList.forEach(item => {
              if (timeUnit === item.index) {
                conditionConfig.timeUnitName = item.name
              }
            })
            decimal.forEach(item => {
              if (operator === item.operator) {
                conditionConfig.operatorName = item.description
              }
            })
            break
          }
          case LIST: {
            // 名单命中
            const rightDataList = blacklistIdList.map(blacklistId => {
              const { listName: blacklistName = '' } = blackListTypeList.find(b => b.id === blacklistId)
              return {
                blacklistId,
                blacklistName
              }
            })
            conditionConfig = {
              leftData,
              hitStatus,
              hitStatusName: hitStatus === 'HIT' ? '任意命中' : '全部不命中',
              rightDataList
            }
            conditionFieldsNotDimsList.forEach(item => {
              const { fieldDataCategory, dataType, fieldDisplayName, fieldName } = item
              if (fieldName === leftData) {
                conditionConfig.leftDataCategory = fieldDataCategory
                conditionConfig.leftDataName = fieldDisplayName
                conditionConfig.leftDataType = dataType
              }
            })
            break
          }
          case INCLUDE: {
            conditionConfig = {
              leftData,
              rightData,
              operator,
              operatorName: operator === 'BELONG' ? '属于' : '不属于'
            }
            conditionFieldsList.forEach(item => {
              const { fieldDataCategory, dataType, fieldDisplayName, fieldName } = item
              if (fieldName === leftData) {
                conditionConfig.leftDataCategory = fieldDataCategory
                conditionConfig.leftDataName = fieldDisplayName
                conditionConfig.leftDataType = dataType
              }
            })
            historyFactorList.forEach(item => {
              const { factorKey, returnType, factorName } = item
              if (factorKey === rightData) {
                conditionConfig.rightDataCategory = 'FACTOR'
                conditionConfig.rightDataName = factorName
                conditionConfig.rightDataType = returnType.toUpperCase()
              }
            })
            break
          }
        }
        let data = {
          conditionType,
          ruleId: this.state.ruleId,
          conditionConfig: conditionConfig
        }
        this.setState({ addLoading: true })
        if (conditionInfo.conditionId) {
          updateRuleCondition({
            ...conditionInfo,
            ...data
          }).then(res => {
            this.getRuleCondition()
            this.onCancel()
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          }).finally(e => {
            this.setState({ addLoading: false })
          })
        } else {
          addRuleCondition(data).then(res => {
            this.getRuleCondition()
            this.onCancel()
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          }).finally(e => {
            this.setState({ addLoading: false })
          })
        }
      }
    })
  }
  newIndicators = () => {
    this.eidtType = 'add'
    this.props.form.resetFields()
    this.props.form.setFieldsValue({ conditionType: undefined })
    this.setState({ showModel: true, conditionInfo: {} })
  }
  edit = async data => {
    this.eidtType = 'edit'
    // const dataType = data.conditionConfig.leftDataType
    // const leftDataName = data.conditionConfig.leftDataName
    // if (dataType === 'ENUM') {
    //   this.getEnumList(leftDataName)
    // } else if (dataType === 'BOOLEAN') {
    //   const data = [{ key: 'true', value: '是' }, { key: 'false', value: '否' }]
    //   this.setState({ enumList: data })
    // } else {
    //   this.setState({ enumList: false })
    // }
    this.changeField(data.conditionConfig.leftData, false, data)
    const conditionFields = this.conditionTypeChange(data.conditionType, true, data.conditionConfig)
    this.setState({ conditionInfo: data, showModel: true, conditionFields })
  }
  del = e => {
    confirm({
      title: '是否确认删除?',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        delCondition({ conditionId: e }).then(res => {
          this.getRuleCondition()
        }).catch((data) => {
          const { content = {} } = data
          notification.warn(content)
        })
      }
    })
  }
  editTrigger = () => {
    const { expressionEdit } = this.state
    this.setState({
      expressionEdit: !expressionEdit
    })
  }
  changeField = (e, clean = false, conditionInfo = {}) => {
    let customTimeHasSelected = false
    if (this.eidtType === 'edit') {
      const { conditionType, conditionConfig: { leftDataType, rightDataCategory } = {} } = conditionInfo
      customTimeHasSelected = conditionType === NORMAL && leftDataType === 'DATETIME'
      if (rightDataCategory !== 'CONSTANT') {
        customTimeHasSelected = false
      }
    }
    const { conditionFieldsList = [], allOperators = {}, customTimeSelected = customTimeHasSelected } = this.state
    let dataType = ''
    conditionFieldsList.forEach(item => {
      if (item.fieldName === e) {
        dataType = item.dataType
      }
    })

    let FieldsOperators = allOperators[dataType] || []
    if (dataType === 'ENUM') {
      this.getEnumList(e)
    } else if (dataType === 'BOOLEAN') {
      let data = [{ key: 'true', value: '是' }, { key: 'false', value: '否' }]
      conditionFieldsList.forEach(item => {
        if (item.dataType === 'BOOLEAN') {
          data.push({
            ...item,
            value: item.fieldDisplayName,
            key: item.fieldName
          })
        }
      })
      this.setState({ enumList: data })
    } else {
      this.setState({ enumList: false })
    }
    this.props.form.setFieldsValue({ operator: undefined, rightData: undefined, rightDataCustomTime: null })
    this.setState({
      FieldsOperators,
      dataType,
      customTimeSelected: dataType === 'DATETIME' ? customTimeSelected : false
    }, () => {
      if (clean) {
        this.props.form.setFieldsValue({ rightData: undefined })
      }
    })
  }
  getRuleCondition = () => {
    // 获取列表数据
    const { ruleId } = this.state
    getRuleCondition(buildUrlParamNew({ ruleId })).then(res => {
      const { content = [] } = res
      content.forEach((item, index) => {
        item.key = item.conditionId
        item.index = index + 1
      })
      this.setState({ dataSource: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getExpression = (ruleInfoId) => {
    getExpression(buildUrlParamNew({ ruleInfoId })).then(res => {
      let { content = {} } = res
      const { expression } = content
      this.setState({ expression, expressionEdit: !expression })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getFieldsOperators = (dataType) => {
    getFieldsOperators(buildUrlParamNew({ dataType })).then(res => {
      let { content = [] } = res
      this.setState({ FieldsOperators: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getRuleConditionTypeList = () => {
    getRuleConditionTypeList().then(res => {
      const { content = [] } = res
      this.coditionTypeMap = {}
      content.forEach(item => {
        this.coditionTypeMap[item.value] = item.name
      })
      this.setState({ conditionTypeList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  // getFieldDimensionality = () => {
  //   getFieldDimensionality().then(res => {
  //     const { content = [] } = res
  //     this.setState({ fieldDimensionality: content })
  //   }).catch((data) => {
  //     const { content = {} } = data
  //     notification.warn(content)
  //   })
  // }
  getArithmeticStrList = () => {
    getArithmeticStrList().then(res => {
      const { content = [] } = res
      this.setState({ arithmeticStrList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getRuleConditionFields = (businessLineId = '') => {
    getFieldList({ businessLineId }).then(res => {
      const { content } = res
      const { tree, list } = initFieldListData(content)
      let conditionFieldsNotDimsSrc = []
      content.forEach(item => {
        if (item.dimensionalityId !== undefined) {
          conditionFieldsNotDimsSrc.push(item)
        }
      })
      const { tree: conditionFieldsNotDims, list: conditionFieldsNotDimsList } = initFieldListData(conditionFieldsNotDimsSrc, { notNeedField: tree })
      this.setState({
        conditionFields: tree,
        conditionFieldsList: list,
        conditionFieldsNotDimsList,
        conditionFieldsNotDims
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  unitList = () => {
    unitList().then(res => {
      let { content = [] } = res
      this.setState({ unitList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getAllOperators = () => {
    getAllOperators().then(res => {
      const { content = {} } = res
      let newContent = { ...content }
      Object.keys(content).forEach(item => {
        newContent[item.toUpperCase()] = content[item]
        newContent[item.toLowerCase()] = content[item]
        if (item === 'date' || item === 'DATETIME') {
          newContent['DATE'] = content[item]
          newContent['DATETIME'] = content[item]
          newContent['datetime'] = content[item]
          newContent['date'] = content[item]
        }
      })
      console.log('newContent', newContent)
      this.setState({ allOperators: newContent })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getHistoryFactorList = (businessLineId) => {
    getHistoryFactorList(buildUrlParamNew({ businessLineId })).then(res => {
      const { content = {} } = res
      this.setState({ historyFactorList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getEnumList = (name) => {
    const { conditionFieldsList } = this.state
    let fieldDataCategory = ''
    let fieldName = name
    conditionFieldsList.forEach(item => {
      if (item.fieldName === name) {
        fieldDataCategory = item.fieldDataCategory
      }
    })
    getEnumList(buildUrlParamNew({ fieldDataCategory, fieldName })).then(res => {
      const { content = [] } = res
      let { data } = JSON.parse(content.enumOption || '')
      conditionFieldsList.forEach(item => {
        if (item.dataType === 'ENUM') {
          data.push({
            ...item,
            value: item.fieldDisplayName,
            key: item.fieldName
          })
        }
      })
      this.setState({ enumList: data })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getNumberOperatorTypeList = () => {
    getNumberOperatorTypeList().then(res => {
      let { content = [] } = res
      this.setState({ numberOperatorTypeList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  expressionSave = async () => {
    const { ruleId } = this.state
    const expression = this.refs['expression-input'].input.value
    // // 只有｜而不是||
    // if (/\|!\||\|$/g.test(expression)) {
    //   notification.warn({ message: 'AND请用"||",而非"|"' })
    //   // notification.warn({ message: 'AND请用"||",而非"|"' })
    //   return false
    // }
    // ()数量一致
    if (expression.match(/\(/g) !== null && expression.match(/\)/g) !== null && expression.match(/\(/g).length !== expression.match(/\)/g).length) {
      notification.warn({ message: '"("和")"必须匹配' })
      return false
    }
    // &、||不能是公式的第一个或者最后一个字符
    if (/^&|^\||&$|\|$/g.test(expression)) {
      notification.warn({ message: '"&&"、"||"不能是公式的第一个或者最后一个字符' })
      return false
    }
    // &、||不能相邻
    if (/&\||\|&/g.test(expression)) {
      notification.warn({ message: '"&&"、"||"不能相邻' })
      return false
    }
    // 存在3个以上连续的｜
    if (/\|{3,}/.test(expression)) {
      notification.warn({ message: '存在3个以上连续的｜' })
      return false
    }
    // 存在3个以上连续的&
    if (/&{3,}/.test(expression)) {
      notification.warn({ message: '存在3个以上连续的&' })
      return false
    }
    try {
      updateExpressionCondition({ ruleId, expression }).then((data) => {
        notification.success({ message: '保存成功' })
        this.setState({ expressionEdit: expression.length === 0, expression }, () => {
          this.getRuleCondition()
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    } catch (err) {
    }
    console.log('expression', expression)
  }
}

export default Form.create()(RulesCondition)
