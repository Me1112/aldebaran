import React, { Fragment } from 'react'
import LayoutRight from '../../../component/layout_right'
import {
  Button,
  Input,
  notification,
  Table,
  Modal,
  Form,
  Select,
  Icon,
  Radio,
  DatePicker,
  Switch,
  Tooltip,
  Checkbox,
  AutoComplete, InputNumber
} from 'antd'
import { buildUrlParamNew, decisionModalError, FieldDataTypeMapNAE, formatDate, initFieldListData } from '../../../util'
import {
  getTemplateList,
  valueExtractTypeList,
  statisticTypeList,
  unitList,
  operCharacterList,
  getIndicatorsList,
  saveIndicatorsEditOrAdd,
  saveIndicatorsUpdate,
  getListObj,
  getListTypeList,
  getSumFields,
  updateValidation,
  factorUpdateStatus,
  dependenciesFactor,
  deleteIndicators,
  getMaxTermTips,
  getServiceCategoryList
} from '../../../action/policy'
import {
  getBusinessList,
  getEnumList,
  getSceneList
} from '../../../action/rule'
import {
  getFieldList,
  getDataTypeList
} from '../../../action'
import {
  getAllOperators
} from '../../../action/common'
import PropTypes from 'prop-types'
import './index.less'
import { Map } from 'immutable'
import { bindActionCreators } from 'redux'
import connect from 'react-redux/es/connect/connect'
import IndicatorsTest from './test'
import moment from 'moment'

const UN_ACTIVED = 'UN_ACTIVED'
const ACTIVED = 'ACTIVED'
const confirm = Modal.confirm
const { Option, OptGroup } = Select
let id = 0
let continuousID = 0
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
const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 20, offset: 4 }
  }
}
const lineLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}
const formFiltsLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}
const INCLUDEMultiSelect = ['BELONG', 'NOT_BELONG']

const THE_SAMPLE = {
  // 统计类-字段值统计
  'STATISTICAL_NUMBER': '同一帐号、商户号近24小时累计交易金额',
  // 值提取
  'VALUE_EXTRACT': '同一账户最近一次登陆时间',
  // 统计类-字段值连续次数
  'CONTINUOUS_FREQUENCY': '同一账号在半个小时内连续进行小于500元的交易次数。',
  // 统计类-字段值连续时间精度
  'CONTINUOUS_TIME': '同一账号在同一商户交易的连续天数。',
  // 统计类-字段值历史列表
  'HISTORY_LIST': '近3个月同一账户常用设备。',
  // 数据服务调用
  'DATA_SERVICE': '申请手机号的在网状态',
  // 统计类-字段值统计(身份变换)
  'IDENTITY_TRANSFER': '转出账户1日内作为转入账户关联的转出账户个数',
  // 统计类-字段值变化趋势
  'CHANGE_TRENDS': '同一账户5次内交易金额递减'
}
// 字段哪些类型下需要显示的
const FORM_ITEM_IS_SHOW = {
  // 统计时间
  'time': ['STATISTICAL_NUMBER', 'CONTINUOUS_FREQUENCY', 'HISTORY_LIST', 'IDENTITY_TRANSFER', 'CHANGE_TRENDS'],
  // 统计方式
  'functionType': ['STATISTICAL_NUMBER', 'IDENTITY_TRANSFER', 'CHANGE_TRENDS'],
  // 字段
  'computerField': ['STATISTICAL_NUMBER', 'VALUE_EXTRACT', 'IDENTITY_TRANSFER'],
  // 提取方式
  'valueExtractType': ['VALUE_EXTRACT'],
  // 列表对象
  'listObject': ['HISTORY_LIST'],
  // 列表方式
  'list_functionType': ['HISTORY_LIST'],
  // 是否包含本次
  'containsLatest': ['STATISTICAL_NUMBER', 'HISTORY_LIST', 'VALUE_EXTRACT']
}

const DECIMAL = 'DECIMAL'
const LIST = 'LIST'
const ENUM = 'ENUM'
const BOOLEAN = 'BOOLEAN'
const DATETIME = 'DATETIME'

const CUSTOM_TIME = 'CUSTOM_TIME'

function mapStateToProps(state) {
  const { rule = Map({}) } = state
  const { sceneList = [], appSelect = [], businessLine = [], dataTypeList = [] } = rule.toJS()
  return {
    sceneList,
    businessLine,
    appSelect,
    dataTypeList
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    getBusinessList: bindActionCreators(getBusinessList, dispatch),
    getDataTypeList: bindActionCreators(getDataTypeList, dispatch)
  }
}

class Indicators extends React.Component {
  constructor(prop) {
    super(prop)
    this.state = {
      pagination: {
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      }
    }
    this.datePickerTime = {}
  }

  static propTypes = {
    form: PropTypes.any,
    dataTypeList: PropTypes.array,
    sceneList: PropTypes.array,
    getSceneList: PropTypes.func,
    businessLine: PropTypes.any,
    getBusinessList: PropTypes.func.isRequired,
    getFieldList: PropTypes.func,
    getDataTypeList: PropTypes.func
  }

  componentDidMount() {
    this.realParam = { ...this.state }
    this.getTemplateList()
    this.valueExtractTypeList()
    this.statisticTypeList()
    this.getFieldList()
    this.unitList()
    this.operCharacterList()
    this.props.getSceneList()
    this.getDataList(1)
    this.getAllOperators()
    this.getListObj()
    this.getListTypeList()
    this.getSumFields()
    this.props.getBusinessList()
    // this.props.getFieldList()
    // this.setState({ fieldList: this.props.fieldList })
    this.getServiceCategoryList()
    this.props.getDataTypeList()
  }

  render() {
    const { getFieldDecorator, getFieldValue, getFieldProps } = this.props.form
    const { businessLine = [], sceneList = [] } = this.props
    const {
      codeOrName, loading, dataSource = [], pagination, showModel = false, templateTypeList = [],
      indicatorsInfo = {}, fieldList = [], allOperators = {}, filtrateDataType = {}, enumList = {}, selectBusinessId
    } = this.state
    const { keys = [], factorTemplate = 'STATISTICAL_NUMBER', conjunction = 'AND', factorCode, factorName, businessLineId } = indicatorsInfo
    const columns = [
      {
        title: '指标编码',
        dataIndex: 'factorCode',
        key: 'factorCode',
        width: 150,
        render: (text) => {
          return <div className="text-overflow" title={text}>{text}</div>
        }
      }, {
        title: '指标名称',
        dataIndex: 'factorName',
        key: 'factorName',
        width: 150,
        render: (text) => {
          return <div className="text-overflow" title={text}>{text}</div>
        }
      }, {
        title: '业务条线',
        dataIndex: 'businessLineName',
        key: 'businessLineName',
        width: 120,
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '返回类型',
        dataIndex: 'returnType',
        key: 'returnType',
        width: 100,
        render: (text) => {
          return !FieldDataTypeMapNAE[text] ? (text || '--') : FieldDataTypeMapNAE[text]
        }
      },
      {
        title: '激活',
        dataIndex: 'activeStatus',
        key: 'activeStatus',
        width: 100,
        render: (text, record) => {
          return <Switch style={{ width: 55 }} checkedChildren="ON" unCheckedChildren="OFF"
                         checked={text === ACTIVED}
                         onChange={(checked) => this.changeActived(checked, record)} />
        }
      }, {
        title: '更新人',
        dataIndex: 'updatedBy',
        key: 'updatedBy',
        width: 130,
        render: (text, record) => {
          return (<div className="text-overflow" style={{ width: 114 }} title={text}>{text}</div>)
        }
      }, {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 180,
        render: (text) => {
          return <span>{formatDate(text)}</span>
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 170,
        render: (text, data) => {
          const { activeStatus, factorTemplate } = data
          const isActive = activeStatus === ACTIVED
          const isDataService = factorTemplate === 'DATA_SERVICE'
          return <Fragment>
            {
              !isActive ? <span className="operation-span" onClick={() => {
                  this.updateValidation(data.id, () => {
                    this.edit(data, 'edit')
                  })
                }}>编辑</span>
                : <span className="operation-span" onClick={() => {
                  this.view(data)
                }}>查看</span>
            }
            {
              !isDataService ? <span className="operation-span" onClick={() => this.showTest(data)}>测试</span> : null
            }
            {
              isActive ? <span className="operation-span" onClick={() => this.edit(data, 'copy')}>复制</span> : null
            }
            {
              !isActive ? <span className="operation-span" onClick={() => {
                this.updateValidation(data.id, () => this.del(data.id))
              }}>删除</span> : null
            }
          </Fragment>
        }
      }
    ]
    const isView = this.editType === 'view'
    const indicatorsTemplate = this.renderIndicatorsTemplate()
    const continuousTemplate = this.renderContinuousTemplate()
    getFieldDecorator('keys', { initialValue: keys })
    const keysF = getFieldValue('keys')
    const subjectsF = getFieldValue('subjects') // 统计主体字段值
    const formFilts = keysF.map((k, index) => {
      const field = this.props.form.getFieldValue(`field_${k}`) || indicatorsInfo[`field_${k}`]
      const operator = this.props.form.getFieldValue(`operator_${k}`) || indicatorsInfo[`operator_${k}`]
      let constantSelectDom = ''
      let constant = (indicatorsInfo[`constant_${k}`] || '').split(',')
      const { dataType: firstDataType } = fieldList.map(field => field.list).flat()
        .find(f => f.fieldName === field) || {} // 第一个控件字段值类型
      if (enumList[field]) {
        if (enumList[field] === DATETIME) {
          constant = moment(indicatorsInfo[`continuous_constant_${k}`])
          constantSelectDom = <DatePicker showTime={{ format: 'HH:mm:ss' }}
                                          format="YYYY-MM-DD HH:mm:ss" placeholder="时间"
                                          style={{ width: 'calc(100% - 30px)', marginRight: '10px' }}
                                          onChange={(e, data) => {
                                            this.DatePickerChange(data, `constant_${k}`)
                                          }}
                                          allowClear disabled={isView} />
        } else {
          constantSelectDom = <Select mode={INCLUDEMultiSelect.includes(operator) ? 'multiple' : ''}
                                      style={{ width: 'calc(100% - 30px)', marginRight: '10px' }} placeholder="请选择字段"
                                      dropdownMatchSelectWidth={false} disabled={isView}>
            {
              enumList[field].map(item => {
                return <Option key={item.key} value={item.key}>{item.value}</Option>
              })
            }
            {
              fieldList.map((item, index) => {
                const { name = '', list = [] } = item
                return <OptGroup key={name} value={name}>
                  {
                    list.filter(listItem => { // 过滤出与第一控件值同类型的其他字段
                      const { dataType, fieldName } = listItem
                      return fieldName !== field && dataType === firstDataType
                    }).map(listItem => {
                      return <Option key={listItem.fieldName}
                                     value={listItem.fieldName}>{listItem.fieldDisplayName}</Option>
                    })
                  }
                </OptGroup>
              })
            }
          </Select>
        }
      }
      return (
        <div className="form-item-Inline" key={k}>
          <Form.Item {...formFiltsLayout} style={{ marginRight: '40px' }} label={' '} required={false} colon={false}>
            {
              getFieldDecorator(`field_${k}`, {
                initialValue: indicatorsInfo[`field_${k}`],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请选择字段'
                }],
                onChange: (e) => this.changeField(e, '', k)
              })(
                <Select placeholder="请选择字段" disabled={isView}>
                  {
                    fieldList.map(item => {
                      const { name = '', list = [] } = item
                      return <OptGroup key={name} value={name}>
                        { // subjects字段在身份变换时是单选(String),其他情况下是多选(Array)
                          list.filter(listItem => [subjectsF].flat().indexOf(listItem.fieldName) === -1).map(listItem => {
                            return <Option key={listItem.fieldName}
                                           value={listItem.fieldName}>{listItem.fieldDisplayName}</Option>
                          })
                        }
                      </OptGroup>
                    })
                  }
                </Select>
              )}
          </Form.Item>
          <Form.Item style={{ width: '100px', marginRight: '-5px' }}>{getFieldDecorator(`operator_${k}`, {
            initialValue: indicatorsInfo[`operator_${k}`],
            rules: [{
              required: true,
              whitespace: true,
              message: '操作符'
            }],
            onChange: () => this.normalOperatorChange(`constant_${k}`)
          })(
            <Select style={{ width: '100px' }} placeholder="操作符" disabled={isView}>
              {
                (allOperators[(filtrateDataType[`field_${k}`] || '')] || []).map(item => {
                  return <Option key={item.operator} value={item.operator}>{item.description}</Option>
                })
              }
            </Select>
          )}</Form.Item>
          <Form.Item style={{ width: 'calc(50% - 140px)' }} wrapperCol={{ span: 24 }} label={''}>
            {
              getFieldDecorator(`constant_${k}`, {
                initialValue: constant,
                rules: [{
                  validator: (rules, value, callback) => {
                    if (!value || value[0] === '') {
                      callback('请选择/输入')
                    }
                    console.log('validator', value)
                    callback()
                  }
                }]
              })(
                // !constantSelectDom ? <Input placeholder="数值" style={{ width: 'calc(100% - 30px)', marginRight: '10px' }}
                //                             maxLength={50} disabled={isView} /> : constantSelectDom
                !constantSelectDom ? <AutoComplete placeholder="请输入/选择" disabled={isView}
                                                   style={{ width: 'calc(100% - 30px)', marginRight: '10px' }}>
                  {
                    fieldList.map((item, index) => {
                      const { name = '', list = [] } = item
                      return <OptGroup key={name} value={name}>
                        {
                          list.filter(listItem => { // 过滤出与第一控件值同类型的其他字段
                            const { dataType, fieldName } = listItem
                            return fieldName !== field && dataType === firstDataType
                          }).map(listItem => {
                            return <Option key={listItem.fieldName}
                                           value={listItem.fieldName}>{listItem.fieldDisplayName}</Option>
                          })
                        }
                      </OptGroup>
                    })
                  }
                </AutoComplete> : constantSelectDom
              )}
            {
              isView ? null : <Icon className={'cursor-pointer'} type={'delete'} onClick={() => {
                this.removeFiltrate(k)
              }} />
            }
          </Form.Item>
        </div>
      )
    })
    return <LayoutRight className="policy-indicators no-bread-crumb">
      <div className="region-zd">
        <Input placeholder="指标编码/名称" value={codeOrName} maxLength={'50'} onChange={this.nameChange}
               style={{ width: 200 }} />
        <Select placeholder="业务条线" style={{ width: 200 }} value={selectBusinessId} onChange={this.selectBusiness}>
          {
            businessLine.map(item => {
              return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
            })
          }
        </Select>
        <Button type="primary" onClick={() => {
          this.realParam = { ...this.state }
          this.getDataList(1)
        }} style={{ marginRight: '10px' }}>查询</Button>
        <Button type="default" onClick={this.onClearClick}>重置</Button>
        <div style={{ float: 'right' }}>
          <Button type="primary" onClick={this.newIndicators}>新建</Button>
        </div>
      </div>
      <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
        <Table rowkey="ruleId" className="table-td-no-auto" columns={columns} dataSource={dataSource}
               locale={{ emptyText: '暂无数据' }} loading={loading}
               onChange={this.handleChange}
               pagination={pagination} />
      </div>
      <Modal className={'policy-indicators-modal'} width={800} centered
             title={`${this.editType === 'edit' ? '编辑' : this.editType === 'copy' ? '复制' : isView ? '查看' : '新建'}指标`}
             visible={showModel}
             onCancel={this.onCancel}
             onOk={isView ? this.onCancel : this.onOk}
             maskClosable={false}>
        <Form style={{
          maxHeight: '500px',
          overflow: 'auto',
          paddingRight: '30px'
        }}>
          <div className="form-item-Inline">
            <Form.Item {...lineLayout} label={'指标编码'}>
              {
                getFieldDecorator('factorCode', {
                  initialValue: factorCode,
                  rules: [{
                    required: true,
                    whitespace: true,
                    message: '请输入指标编码'
                  }]
                })(
                  <Input placeholder="不超过50个字符" maxLength={50} disabled={isView} />
                )}
            </Form.Item>
            <Form.Item {...lineLayout} label={'业务条线'}>
              <Select placeholder="请选择业务条线" disabled={this.editType !== 'add'} {...getFieldProps('businessLineId', {
                initialValue: businessLineId,
                validate: [{
                  rules: [
                    { required: true, message: '请选择业务条线' }
                  ]
                }],
                onChange: (e) => this.changeBusinessLineId(e)
              })}>
                {
                  businessLine.map(item => {
                    return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
                  })
                }
              </Select>
            </Form.Item>
          </div>
          <Form.Item {...formItemLayout} label={'指标名称'}>
            {
              getFieldDecorator('factorName', {
                initialValue: factorName,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请输入指标名称'
                }]
              })(
                <Input placeholder="不超过50个字符" maxLength={50} disabled={isView} />
              )}
          </Form.Item>
          <Form.Item {...formItemLayout} label={'指标模版'}>
            <Select disabled={this.editType !== 'add'} {...getFieldProps('factorTemplate', {
              initialValue: factorTemplate,
              validate: [{
                rules: [
                  { required: true, message: '请选择指标模版' }
                ]
              }],
              onChange: this.changeFactorTemplate
            })}>
              {
                templateTypeList.map(item => {
                  return <Option key={item.value} value={item.value}>{item.name}</Option>
                })
              }
            </Select>
          </Form.Item>
          {indicatorsTemplate}
          {continuousTemplate}
          {
            factorTemplate === 'DATA_SERVICE' ? null
              : <Fragment>
                <Form.Item {...formItemLayout} label={'筛选条件'}>
                  {
                    getFieldDecorator('conjunction', {
                      initialValue: conjunction
                    })(
                      <Radio.Group disabled={isView}>
                        <Radio value="AND">全部满足</Radio>
                        <Radio value="OR">满足任意</Radio>
                      </Radio.Group>
                    )}
                </Form.Item>
                {formFilts}
                {
                  isView ? null : <Form.Item {...formItemLayoutWithOutLabel} label={''}>
                    <Button className="add-form-btn" onClick={this.addFiltrate}>
                      添加筛选条件
                    </Button>
                  </Form.Item>
                }
              </Fragment>
          }
        </Form>
      </Modal>
      <IndicatorsTest dataSrc={this.state.testData}
                      visible={this.state.visible}
                      onCancel={this.onTestCancel}
                      sceneList={sceneList} />
    </LayoutRight>
  }

  getServiceCategoryList = () => {
    getServiceCategoryList().then(res => {
      const { content: serviceCategoryList = [] } = res
      this.setState({
        serviceCategoryList
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  showTest = data => {
    this.setState({ testData: data, visible: true })
  }

  onTestCancel = () => {
    this.setState({ visible: false })
  }

  selectBusiness = e => {
    this.setState({ selectBusinessId: e })
  }
  renderContinuousTemplate = () => {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { indicatorsInfo = {}, allOperators = {}, filtrateDataType = {}, fieldList = [], enumList = {} } = this.state
    const { continuousConjunction = 'AND', continuousKeys = [] } = indicatorsInfo
    let factorTemplate = this.props.form.getFieldValue('factorTemplate')
    const isView = this.editType === 'view'
    if (this.editType !== 'add') {
      factorTemplate = indicatorsInfo.factorTemplate
    }
    getFieldDecorator('continuousKeys', { initialValue: continuousKeys })
    const keysF = getFieldValue('continuousKeys')
    console.log('1=1', filtrateDataType)
    const ListDom = keysF.map((k, index) => {
      const field = this.props.form.getFieldValue(`continuous_field_${k}`) || indicatorsInfo[`continuous_field_${k}`]
      const operator = this.props.form.getFieldValue(`continuous_operator_${k}`) || indicatorsInfo[`continuous_operator_${k}`]
      let constant = (indicatorsInfo[`continuous_constant_${k}`] || '').split(',')
      let constantSelectDom = ''
      if (enumList[field]) {
        if (enumList[field] === DATETIME) {
          constant = moment(indicatorsInfo[`continuous_constant_${k}`])
          constantSelectDom = <DatePicker showTime={{ format: 'HH:mm:ss' }}
                                          format="YYYY-MM-DD HH:mm:ss" placeholder="时间"
                                          style={{ width: 'calc(100% - 30px)', marginRight: '10px' }}
                                          onChange={(e, data) => {
                                            this.DatePickerChange(data, `continuous_constant_${k}`)
                                          }}
                                          allowClear disabled={isView} />
        } else {
          constantSelectDom = <Select mode={INCLUDEMultiSelect.includes(operator) ? 'multiple' : ''}
                                      style={{ width: 'calc(100% - 30px)', marginRight: '10px' }} placeholder="请选择字段"
                                      disabled={isView}>
            {
              enumList[field].map(item => {
                return <Option key={item.key} value={item.key}>{item.value}</Option>
              })
            }
          </Select>
        }
      }
      return (
        <div className="form-item-Inline" key={k}>
          <Form.Item {...formFiltsLayout} style={{ marginRight: '40px' }} label={' '} required={false} colon={false}>
            {
              getFieldDecorator(`continuous_field_${k}`, {
                initialValue: indicatorsInfo[`continuous_field_${k}`],
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请选择字段'
                }],
                onChange: (e) => this.changeField(e, 'continuous_', k)
              })(
                <Select placeholder="请选择字段" disabled={isView}>
                  {
                    fieldList.map(item => {
                      return <OptGroup key={item.name} value={item.name}>
                        {
                          item.list.map(list => {
                            return <Option key={list.fieldName} value={list.fieldName}>{list.fieldDisplayName}</Option>
                          })
                        }</OptGroup>
                    })
                  }
                </Select>
              )}
          </Form.Item>
          <Form.Item style={{ width: '100px', marginRight: '-5px' }}>{getFieldDecorator(`continuous_operator_${k}`, {
            initialValue: indicatorsInfo[`continuous_operator_${k}`],
            rules: [{
              required: true,
              whitespace: true,
              message: '操作符'
            }],
            onChange: () => this.normalOperatorChange(`continuous_constant_${k}`)
          })(
            <Select style={{ width: '100px' }} placeholder="操作符" disabled={isView}>
              {
                (allOperators[filtrateDataType[`continuous_field_${k}`]] || []).map(item => {
                  return <Option key={item.operator} value={item.operator}>{item.description}</Option>
                })
              }
            </Select>
          )}</Form.Item>
          <Form.Item style={{ width: 'calc(50% - 140px)' }} wrapperCol={{ span: 24 }} label={''}>
            {
              getFieldDecorator(`continuous_constant_${k}`, {
                initialValue: constant,
                rules: [{
                  validator: (rules, value, callback) => {
                    if (!value || value[0] === '') {
                      callback('请选择/输入')
                    }
                    console.log('validator', value)
                    callback()
                  }
                }]
              })(
                !constantSelectDom ? <Input placeholder="数值" style={{ width: 'calc(100% - 30px)', marginRight: '10px' }}
                                            maxLength={50} disabled={isView} /> : constantSelectDom
              )}
            {
              isView ? null : <Icon className={'cursor-pointer'} type={'delete'} onClick={() => {
                this.removeContinuous(k)
              }} />
            }
          </Form.Item>
        </div>
      )
    })
    const dom = <Fragment>
      <Form.Item {...formItemLayout} label={'连续条件'}>
        {
          getFieldDecorator('continuousConjunction', {
            initialValue: continuousConjunction
          })(
            <Radio.Group disabled={isView}>
              <Radio value="AND">全部满足</Radio>
              <Radio value="OR">满足任意</Radio>
            </Radio.Group>
          )}
      </Form.Item>
      {ListDom}
      {
        isView ? null : <Form.Item {...formItemLayoutWithOutLabel} label={''}>
          <Button className="add-form-btn" onClick={this.addContinuous}>
            添加连续条件
          </Button>
        </Form.Item>
      }
    </Fragment>
    return factorTemplate === 'CONTINUOUS_FREQUENCY' ? dom : null
  }
  renderIndicatorsTemplate = () => {
    let { customTimeSelectedObj = {}, serviceParams = [], serviceCategoryList = [], statisticTypeList = [], indicatorsInfo = {}, fieldList = [], valueExtractTypeList = [], unitList = [], listObj = [], listTypeList = [], sumFields = [], allOperators = {}, fieldListFilterSrc = [], fieldListFilterSrcList = [], fieldListFilter = [], maxTermTips = '' } = this.state
    const { dataTypeList = [] } = this.props
    const formBusinessLineId = this.props.form.getFieldValue('businessLineId')
    const reqServiceParams = serviceParams.filter(s => s.paramType === 'REQUEST') || []
    const resServiceParams = serviceParams.filter(s => s.paramType === 'RESPONSE') || []
    const resColumns = [
      {
        title: '参数名称',
        dataIndex: 'paramName'
      }, {
        title: '参数类型',
        dataIndex: 'dataType',
        render: text => {
          const { name = '' } = dataTypeList.find(dataType => dataType.index === text) || {}
          return name
        }
      }
    ]
    const isView = this.editType === 'view'
    const { templateConfig = {}, returnType = DECIMAL } = indicatorsInfo
    let {
      functionType,
      computerField = undefined,
      scenarios = undefined,
      currentSubject,
      subjects = [],
      time = undefined,
      timeUnit,
      containsLatest = true,
      listObject,
      count,
      changeField,
      basicPoint,
      changeRange,
      computerSumField,
      compareCharacter = 'GREATER',
      constantNumber,
      serviceId: serviceId4TemplateConfig,
      reqParams = [],
      respParams = []
    } = templateConfig

    const {
      serviceId = serviceId4TemplateConfig,
      resSelectedRowKeys = respParams.map(param => param.paramCode)
    } = this.state

    const resData = resServiceParams.map(resServiceParam => {
      const { paramCode = '', paramName = '', dataType = '' } = resServiceParam
      return {
        key: paramCode,
        paramName,
        dataType
      }
    })
    let resRowSelection = {
      selectedRowKeys: resSelectedRowKeys,
      onChange: this.onResSelectChange,
      getCheckboxProps: () => ({
        disabled: isView
      })
    }
    if (isView) { // antDesign-Table-resRowSelection-getCheckboxProps禁用对列头checkbox无效
      const checked = resSelectedRowKeys.length === resData.length
      const indeterminate = resSelectedRowKeys.length && resSelectedRowKeys.length < resData.length
      resRowSelection = {
        ...resRowSelection,
        columnTitle: <Checkbox disabled checked={checked} indeterminate={indeterminate} />
      }
    }

    const { getFieldProps, getFieldDecorator } = this.props.form
    const { sceneList = [] } = this.props
    if (fieldListFilter.length === 0) {
      fieldListFilter = fieldListFilterSrc
    }
    let factorTemplate = this.props.form.getFieldValue('factorTemplate')
    if (this.editType !== 'add') {
      factorTemplate = indicatorsInfo.factorTemplate
    }
    const label = ['VALUE_EXTRACT', 'DATA_SERVICE'].includes(factorTemplate) ? '指标' : '统计'
    if (timeUnit === undefined) {
      if (factorTemplate === 'CONTINUOUS_TIME') {
        timeUnit = 'DAY'
      } else {
        timeUnit = 'MIN'
      }
    }
    if (functionType === undefined && ['STATISTICAL_NUMBER', 'IDENTITY_TRANSFER'].indexOf(factorTemplate) !== -1) {
      functionType = 'STATISTICS_SUM'
    }
    if (functionType === undefined && factorTemplate === 'VALUE_EXTRACT') {
      functionType = 'CURRENT'
    }
    if (factorTemplate !== 'STATISTICAL_NUMBER') {
      fieldListFilter = fieldListFilterSrc
    }
    const isAccounted = (this.props.form.getFieldValue('functionType') || functionType) === 'COUNT_RADIO_SATISFY_CONDITION'
    const timeUnitSelector = getFieldDecorator('timeUnit', {
      initialValue: timeUnit
    })(
      <Select style={{ width: factorTemplate === 'CONTINUOUS_TIME' ? '100%' : '70px' }}
              disabled={isView}>
        {
          unitList.map(item => {
            return <Option key={item.index} value={item.index}>{item.name}</Option>
          })
        }
      </Select>
    )
    const compareCharacterSelector = getFieldDecorator('compareCharacter', {
      initialValue: compareCharacter
    })(
      <Select style={{ width: '90px' }} disabled={isView}>
        {
          (allOperators['decimal'] || []).map(item => {
            return <Option key={item.operator} value={item.operator}>{item.description}</Option>
          })
        }
      </Select>
    )

    const subjectsValue = this.props.form.getFieldValue('subjects')
    const currentSubjectValue = this.props.form.getFieldValue('currentSubject')
    const functionTypeValue = this.props.form.getFieldValue('functionType')
    const statistical = <Fragment>
      <Form.Item {...formItemLayout} label={`${label}示例`}>
        {THE_SAMPLE[factorTemplate]}
      </Form.Item>
      {
        factorTemplate === 'DATA_SERVICE' ? <Fragment>
            <div className="form-item-Inline">
              <Form.Item {...lineLayout} label="数据服务">
                <Select placeholder={'请选择'} {...getFieldProps('serviceId', {
                  initialValue: serviceId4TemplateConfig,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择' }
                    ]
                  }],
                  onChange: this.changeServiceId
                })} disabled={isView}>
                  {
                    serviceCategoryList.map(serviceCategory => {
                      const { serviceType = '', serviceTypeName = '', dataService = [] } = serviceCategory
                      return <OptGroup key={serviceTypeName} value={serviceType}>
                        {
                          dataService.map(d => {
                            const { id = '', serviceName = '' } = d
                            return <Option key={id} value={id}>{serviceName}</Option>
                          })
                        }</OptGroup>
                    })
                  }
                </Select>
              </Form.Item>
            </div>
            {
              formBusinessLineId && serviceId ? <Fragment>
                <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label={<Fragment>
                  <span style={{ color: '#f5222d', fontFamily: 'SimSun', marginRight: 4 }}>*</span>
                  请求参数
                </Fragment>}>
                  <div style={{ border: '1px dashed #f1f1f1', padding: '20px 20px 0 20px' }}>
                    {
                      reqServiceParams.map((reqServiceParam, i) => {
                        const { dataType = '', paramName = '', paramCode = '', require = 'TRUE' } = reqServiceParam
                        const { bindField = '' } = reqParams.find(param => param.paramCode === paramCode) || {}
                        return <Form.Item key={i} labelCol={{ span: 6 }} wrapperCol={{ span: 9 }} label={paramName}>
                          {
                            dataType === DATETIME && customTimeSelectedObj[paramCode]
                              ? <DatePicker dropdownClassName="custom-time" placeholder="请选择"
                                            format="YYYY-MM-DD HH:mm:ss"
                                            {...getFieldProps(`${paramCode}_CONSTANT`, {
                                              initialValue: bindField ? moment(bindField) : null,
                                              validate: [{
                                                rules: [
                                                  { required: require === 'TRUE', message: '请输入/选择' }
                                                ]
                                              }]
                                            })}
                                            showTime={{ format: 'HH:mm:ss' }} style={{ width: '100%' }}
                                            allowClear={false} showToday={false} disabled={isView}
                                            renderExtraFooter={() => <Button size="small"
                                                                             onClick={e => this.goBackSelect(e, paramCode)}>返回字段列表</Button>} />
                              : <Select showSearch
                                        onSearch={e =>
                                          this.onSearch(e, paramCode)
                                        } placeholder={'请输入/选择'} {...getFieldProps(paramCode, {
                                initialValue: bindField,
                                validate: [{
                                  rules: [
                                    { required: require === 'TRUE', message: '请输入/选择' }
                                  ]
                                }],
                                onChange: e => this.selectCustomTime(e, paramCode)
                              })} disabled={isView} allowClear>
                                {
                                  dataType === DATETIME
                                    ? <Option key={CUSTOM_TIME} value={CUSTOM_TIME}>自定义时间</Option> : null
                                }
                                <OptGroup key="字段类型">
                                  {
                                    fieldListFilterSrcList.filter(f => f.dataType === dataType).map(f => {
                                      const { fieldName = '', fieldDisplayName = '' } = f
                                      return <Option key={fieldName} value={fieldName}>{fieldDisplayName}</Option>
                                    })
                                  }
                                </OptGroup>
                              </Select>
                          }
                        </Form.Item>
                      })
                    }
                  </div>
                </Form.Item>
                <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label={<Fragment>
                  <span style={{ color: '#f5222d', fontFamily: 'SimSun', marginRight: 4 }}>*</span>
                  响应参数
                </Fragment>}>
                  <Table rowSelection={resRowSelection} columns={resColumns} dataSource={resData}
                         pagination={false} />
                </Form.Item>
              </Fragment> : null
            }
          </Fragment>
          : <div className="form-item-Inline">
            <Form.Item {...lineLayout} label={`${label}场景`}>
              <Select placeholder={'请选择'} mode="multiple" {...getFieldProps('scenarios', {
                initialValue: scenarios,
                validate: [{
                  rules: [
                    { required: true, message: '请选择' }
                  ]
                }]
              })} disabled={isView}>
                {
                  sceneList.map(item => {
                    return <Option key={item.scenarioValue} value={item.scenarioValue}>{item.scenarioName}</Option>
                  })
                }
              </Select>
            </Form.Item>
            {
              factorTemplate === 'IDENTITY_TRANSFER' ? <Fragment>
                <Form.Item {...lineLayout} label="统计身份">
                  <Select placeholder={'请选择'} {...getFieldProps('subjects', {
                    initialValue: subjects[0],
                    validate: [{
                      rules: [
                        { required: true, message: '请选择' }
                      ]
                    }]
                  })} disabled={isView}>
                    {
                      fieldList.map(item => {
                        return <OptGroup key={item.name} value={item.name}>
                          {
                            item.list.map(list => {
                              return list.fieldName !== currentSubjectValue
                                ? <Option key={list.fieldName}
                                          value={list.fieldName}>{list.fieldDisplayName}</Option> : null
                            })
                          }</OptGroup>
                      })
                    }
                  </Select>
                </Form.Item>
                <Form.Item {...lineLayout} label="当前身份">
                  <Select placeholder={'请选择'} {...getFieldProps('currentSubject', {
                    initialValue: currentSubject,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择' }
                      ]
                    }]
                  })} disabled={isView}>
                    {
                      fieldList.map(item => {
                        return <OptGroup key={item.name} value={item.name}>
                          {
                            item.list.map(list => {
                              return list.fieldName !== subjectsValue
                                ? <Option key={list.fieldName}
                                          value={list.fieldName}>{list.fieldDisplayName}</Option> : null
                            })
                          }</OptGroup>
                      })
                    }
                  </Select>
                </Form.Item>
              </Fragment> : <Form.Item {...lineLayout} label={`${label}主体`}>
                <Select placeholder={'请选择'} mode="multiple" {...getFieldProps('subjects', {
                  initialValue: subjects,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择' }
                    ]
                  }]
                })} disabled={isView}>
                  {
                    fieldList.map(item => {
                      return <OptGroup key={item.name} value={item.name}>
                        {
                          item.list.map(list => {
                            return <Option key={list.fieldName} value={list.fieldName}>{list.fieldDisplayName}</Option>
                          })
                        }</OptGroup>
                    })
                  }
                </Select>
              </Form.Item>
            }
            {FORM_ITEM_IS_SHOW['time'].includes(factorTemplate)
              ? <Form.Item {...lineLayout} label={'统计时间'}>
                {
                  getFieldDecorator('time', {
                    initialValue: time,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择输入' },
                        {
                          validator: (rules, value, callback) => {
                            if (!(/(^[1-9]\d*$)/.test(value))) {
                              callback('请输入正整数')
                            } else if (value > 360) {
                              callback('最大支持输入360')
                            }
                            callback()
                          }
                        }
                      ]
                    }]
                  })(
                    <Input placeholder={'数值'} addonAfter={timeUnitSelector} maxLength={3}
                           className="time-input" suffix={
                      <Tooltip placement="bottomLeft" arrowPointAtCenter title={maxTermTips}>
                        <Icon type="question-circle" style={{ color: 'rgba(0,0,0,.45)' }} />
                      </Tooltip>
                    } disabled={isView} />
                  )
                }
              </Form.Item> : ''}
            {
              factorTemplate === 'CHANGE_TRENDS' ? <Form.Item {...lineLayout} label="变化字段">
                <Select placeholder={'请选择'} {...getFieldProps('changeField', {
                  initialValue: changeField,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择字段' }
                    ]
                  }]
                })} disabled={isView}>
                  {
                    (fieldListFilter || []).map(item => {
                      return <OptGroup key={item.name} value={item.name}>
                        {
                          item.list.filter(listItem => listItem.dataType === DECIMAL).map(list => {
                            return <Option key={list.fieldName} value={list.fieldName}>{list.fieldDisplayName}</Option>
                          })
                        }</OptGroup>
                    })
                  }
                </Select>
              </Form.Item> : null
            }
            {FORM_ITEM_IS_SHOW['functionType'].includes(factorTemplate)
              ? <Form.Item {...lineLayout} label={factorTemplate === 'CHANGE_TRENDS' ? '变化趋势' : '统计方式'}>
                <Select placeholder={'请选择'} {...getFieldProps('functionType', {
                  initialValue: functionType,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择字段' }
                    ]
                  }],
                  onChange: (e) => this.changeWayFunctionType(e, true)
                })} disabled={isView}>
                  {
                    statisticTypeList.map(item => {
                      return <Option key={item.value} value={item.value}>{item.name}</Option>
                    })
                  }
                </Select>
              </Form.Item> : ''}
            {
              factorTemplate === 'CHANGE_TRENDS' && functionTypeValue === 'WAVE' ? <Fragment>
                <Form.Item {...lineLayout} label="波动基准">
                  <InputNumber {...getFieldProps('basicPoint', {
                    initialValue: basicPoint,
                    validate: [{
                      rules: [
                        { required: true, message: '请输入波动基准' }
                      ]
                    }]
                  })} placeholder="请输入" min={0} maxLength={10} disabled={isView}
                               style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item {...lineLayout} label="波动范围">
                  <InputNumber {...getFieldProps('changeRange', {
                    initialValue: changeRange,
                    validate: [{
                      rules: [
                        { required: true, message: '请输入波动范围' }
                      ]
                    }]
                  })} placeholder="请输入" min={0} maxLength={10} disabled={isView}
                               style={{ width: '100%' }} />
                </Form.Item>
              </Fragment> : null
            }
            {FORM_ITEM_IS_SHOW['computerField'].includes(factorTemplate) && this.showComputeField()
              ? <Form.Item {...lineLayout} label={`${label}字段`}>
                <Select placeholder={'请选择'} {...getFieldProps('computerField', {
                  initialValue: computerField,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择字段' }
                    ]
                  }],
                  onChange: this.changeComputerField
                })} disabled={isView}>
                  {
                    (fieldListFilter || []).map(item => {
                      return <OptGroup key={item.name} value={item.name}>
                        {
                          item.list.filter(list => {
                            return functionTypeValue === 'STATISTICS_SUM' ? list.dataType === DECIMAL : true
                          }).map(list => {
                            return <Option key={list.fieldName} value={list.fieldName}>{list.fieldDisplayName}</Option>
                          })
                        }</OptGroup>
                    })
                  }
                </Select>
              </Form.Item> : ''}
            {FORM_ITEM_IS_SHOW['valueExtractType'].includes(factorTemplate)
              ? <Form.Item {...lineLayout} label={'提取方式'}>
                <Select placeholder={'请选择'} {...getFieldProps('functionType', {
                  initialValue: functionType
                })} disabled={isView}>
                  {
                    valueExtractTypeList.map(item => {
                      return <Option key={item.value} value={item.value}>{item.name}</Option>
                    })
                  }
                </Select>
              </Form.Item> : ''}
            {factorTemplate === 'CONTINUOUS_TIME'
              ? <Form.Item {...lineLayout} label={'时间精度'}>
                {timeUnitSelector}
              </Form.Item> : ''}
            {FORM_ITEM_IS_SHOW['listObject'].includes(factorTemplate)
              ? <Form.Item {...lineLayout} label={'列表对象'}>
                <Select placeholder={'请选择'} {...getFieldProps('listObject', {
                  initialValue: listObject,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择' }
                    ]
                  }]
                })} disabled={isView}>
                  {
                    listObj.map(item => {
                      return <Option key={item.fieldName} value={item.fieldName}>{item.fieldDisplayName}</Option>
                    })
                  }
                </Select>
              </Form.Item> : ''}
            {FORM_ITEM_IS_SHOW['list_functionType'].includes(factorTemplate)
              ? <Form.Item {...lineLayout} label={'列表方式'}>
                <Select placeholder={'请选择'} {...getFieldProps('functionType', {
                  initialValue: functionType,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择' }
                    ]
                  }],
                  onChange: this.functionTypeChange
                })} disabled={isView}>
                  {
                    listTypeList.map(item => {
                      return <Option key={item.value} value={item.value}>{item.name}</Option>
                    })
                  }
                </Select>
              </Form.Item> : ''}
            {this.showListFieldItem('count')
              ? <Form.Item labelCol={{ span: 2 }} label={' '} colon={false} required={false} wrapperCol={{ span: 20 }}>
                (前{
                getFieldDecorator('count', {
                  initialValue: count,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择输入' }
                    ]
                  }]
                })(
                  <Input placeholder={'数值'} style={{ width: 70 }} maxLength={50} disabled={isView} />
                )
              }个)
              </Form.Item> : ''}
            {this.showListFieldItem('sumFields')
              ? <Form.Item {...lineLayout} label={'求和字段'}>
                <Select placeholder={'请选择'} {...getFieldProps('computerSumField', {
                  initialValue: computerSumField,
                  validate: [{
                    rules: [
                      { required: true, message: '请选择' }
                    ]
                  }]
                })} disabled={isView}>
                  {
                    sumFields.map(item => {
                      return <Option key={item.fieldName} value={item.fieldName}>{item.fieldDisplayName}</Option>
                    })
                  }
                </Select>
              </Form.Item> : ''}
            {this.showListFieldItem('meet')
              ? <Form.Item labelCol={{ span: 1 }} label={' '} colon={false} required={false} wrapperCol={{ span: 23 }}>
                {
                  getFieldDecorator('constantNumber', {
                    initialValue: constantNumber,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择输入' },
                        {
                          validator: (rules, value, callback) => {
                            if (isAccounted && !/(^(([1-9]\d?)|100)$)/.test(value)) {
                              callback('范围 1～100的整数')
                            }
                            callback()
                          }
                        }
                      ]
                    }]
                  })(
                    <Input addonBefore={compareCharacterSelector}
                           suffix={isAccounted ? '%' : ''}
                           style={isAccounted ? { ...{ width: 'calc(100% - 20px)', marginRight: '8px' } } : {}}
                           placeholder={'数值'} maxLength={50} disabled={isView} />
                  )
                }
              </Form.Item> : ''}
            {
              FORM_ITEM_IS_SHOW['containsLatest'].includes(factorTemplate)
                ? <Form.Item {...lineLayout} label={'是否包含本次'}>
                  {
                    getFieldDecorator('containsLatest', {
                      initialValue: containsLatest
                    })(
                      <Radio.Group disabled={isView}>
                        <Radio value>包含</Radio>
                        <Radio value={false}>不包含</Radio>
                      </Radio.Group>
                    )}
                </Form.Item> : null
            }
            <Form.Item {...lineLayout} label={'返回类型'}>
              {!returnType ? '-' : FieldDataTypeMapNAE[returnType]}
            </Form.Item>
          </div>
      }
    </Fragment>
    return <div className="indicators-template">{statistical}</div>
  }

  selectCustomTime = (value, paramCodeField) => {
    const customTimeSelected = value === CUSTOM_TIME
    let { customTimeSelectedObj = {}, indicatorsInfo = {} } = this.state
    const { templateConfig: { reqParams = [] } = {} } = indicatorsInfo
    const reqParam = reqParams.find(s => s.paramCode === paramCodeField) || {}
    reqParam.bindField = ''
    customTimeSelectedObj = { ...customTimeSelectedObj, [paramCodeField]: customTimeSelected }
    this.setState({ customTimeSelectedObj, indicatorsInfo })
  }

  goBackSelect = (value, paramCodeField) => {
    let { customTimeSelectedObj = {}, indicatorsInfo = {} } = this.state
    const { templateConfig: { reqParams = [] } = {} } = indicatorsInfo
    const reqParam = reqParams.find(s => s.paramCode === paramCodeField) || {}
    reqParam.bindField = ''
    customTimeSelectedObj = { ...customTimeSelectedObj, [paramCodeField]: false }
    this.setState({ customTimeSelectedObj })
  }

  onSearch = (e, paramCodeField) => {
    let { customTimeSelectedObj = {} } = this.state
    customTimeSelectedObj = { ...customTimeSelectedObj, [paramCodeField]: true }
    this.setState({ customTimeSelectedObj }, () => {
      this.props.form.setFieldsValue({ [paramCodeField]: e })
    })
  }

  onResSelectChange = resSelectedRowKeys => {
    this.setState({
      resSelectedRowKeys
    })
  }

  changeServiceId = serviceId => {
    const { serviceCategoryList = [] } = this.state
    const serviceCategory = serviceCategoryList.map(s => s.dataService)
      .find(dataService => dataService.findIndex(d => {
        const hitService = d.id === serviceId
        if (hitService) {
          const { serviceParams = [], serviceUrl = '', reqMethod = 'GET', waitingTime } = d
          this.setState({
            serviceParams,
            serviceUrl,
            waitingTime,
            reqMethod
          })
        }
        return hitService
      }) !== -1) || {}
    console.log(serviceCategory)
    this.setState({
      serviceId
    })
  }

  DatePickerChange = (data, key) => {
    this.datePickerTime[key] = new Date(data).getTime()
  }
  changeBusinessLineId = (e, isEdit = false, functionType) => {
    let factorTemplate = this.props.form.getFieldValue('factorTemplate')
    this.businessLineId = e
    this.props.getSceneList({ businessLineId: e })
    this.getSumFields()
    this.getListObj()
    getFieldList({ businessLineId: e, fieldCategory: 'FIELD' }).then(res => {
      let { content = [] } = res
      const { tree: fieldListFilterSrc, list } = initFieldListData(content)
      this.setState({ fieldListFilterSrc, fieldList: fieldListFilterSrc, fieldListFilterSrcList: list }, () => {
        this.changeFactorTemplate(factorTemplate, false, isEdit, functionType)
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  changeActived = async (checked, record) => {
    const { pagination: { current = 1 } = {} } = this.realParam
    const activeStatus = checked ? ACTIVED : UN_ACTIVED
    const data = {
      id: record.id,
      activeStatus: activeStatus
    }
    if (!checked) {
      dependenciesFactor(buildUrlParamNew({ id: record.id })).then(res => {
        const { content = [] } = res
        if (content.length === 0) {
          factorUpdateStatus(data).then(() => {
            this.getDataList(current)
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } else {
          // const nameMapError = {
          //   RuleSet: '规则集:',
          //   ScoreCard: '评分卡:',
          //   Factor: '指标:',
          //   DecisionTree: '决策树:'
          // }
          decisionModalError(content)
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    }
    if (checked) {
      factorUpdateStatus(data).then(() => {
        this.getDataList(current)
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    }
  }

  normalOperatorChange = (e) => {
    // 枚举 操作符 选择包含，包含于的时候  多选
    this.props.form.setFieldsValue({ [e]: undefined })
  }
  changeWayFunctionType = (e, clean = false) => {
    // 统计方式改变
    const { fieldListFilterSrcList = [] } = this.state
    let fieldListFilter = fieldListFilterSrcList
    if (e === 'STATISTICS_COUNT') {
      fieldListFilter = fieldListFilterSrcList.filter(i => i.fieldDataCategory === 'FIELD')
    } else {
      fieldListFilter = fieldListFilterSrcList.filter(i => i.fieldDataCategory === 'FIELD' && i.dataType === 'DECIMAL')
    }
    const { tree } = initFieldListData(fieldListFilter, { onlyClassification: true })
    this.setState({ fieldListFilter: tree }, () => {
      if (clean) {
        this.props.form.setFieldsValue({ 'computerField': undefined })
      }
    })
  }
  showComputeField = () => {
    let functionType = this.props.form.getFieldValue('functionType')
    if (functionType === 'STATISTICS_FREQUENCY') {
      return false
    }
    return true
  }
  showListFieldItem = (type) => {
    const { indicatorsInfo = {} } = this.state
    const { templateConfig = {} } = indicatorsInfo
    let functionType = this.props.form.getFieldValue('functionType')
    let factorTemplate = this.props.form.getFieldValue('factorTemplate')
    if (this.editType !== 'add') {
      factorTemplate = indicatorsInfo.factorTemplate
      functionType = templateConfig['functionType']
    }
    let TYPE = ['TIME_DESC', 'TIME_ASC', 'COUNT_DESC', 'COUNT_ASC', 'SUM_DESC', 'SUM_ASC']
    if (type === 'sumFields') {
      TYPE = ['SUM_DESC', 'SUM_ASC']
    } else if (type === 'meet') {
      TYPE = ['COUNT_SATISFY_CONDITION', 'COUNT_RADIO_SATISFY_CONDITION']
    }
    if (factorTemplate === 'HISTORY_LIST' && TYPE.includes(functionType)) {
      return true
    }
    return false
  }

  changeField = (e, key, k) => {
    let { fieldList = [], filtrateDataType = {}, enumList = {} } = this.state
    fieldList.forEach(item => {
      item.list.forEach(i => {
        if (i.fieldName === e) {
          filtrateDataType[`${key}field_${k}`] = i.dataType
        }
      })
    })
    if (filtrateDataType[`${key}field_${k}`] === ENUM && !enumList[e]) {
      this.getEnumList(e)
    } else if (filtrateDataType[`${key}field_${k}`] === BOOLEAN && !enumList[e]) {
      enumList[e] = [{
        key: 'true',
        value: '是'
      }, {
        key: 'false',
        value: '否'
      }]
      this.setState({ enumList })
    } else if (filtrateDataType[`${key}field_${k}`] === DATETIME && !enumList[e]) {
      enumList[e] = DATETIME
      this.setState({ enumList })
    }
    this.props.form.setFieldsValue({ [`${key}operator_${k}`]: undefined, [`${key}constant_${k}`]: undefined })
    this.setState({ filtrateDataType }, () => {
      this.props.form.getFieldValue(`${key}operator_${k}`)
    })
  }

  functionTypeChange = e => {
    let { indicatorsInfo = {} } = this.state
    const { templateConfig = {} } = indicatorsInfo
    templateConfig.functionType = e
    this.setState({ indicatorsInfo })
  }
  changeFactorTemplate = (e, bol = false, isEdit = false, functionType) => {
    const { serviceParams = [], customTimeSelectedObj = {} } = this.state
    const reqParamKeys = (serviceParams.filter(s => s.paramType === 'REQUEST') || []).map(param => {
      const { paramCode = '' } = param
      return customTimeSelectedObj[paramCode] ? `${paramCode}_CONSTANT` : paramCode
    })
    const returnTypeList = ['STATISTICAL_NUMBER', 'CONTINUOUS_FREQUENCY', 'CONTINUOUS_TIME']
    const objKeys = Object.keys(this.props.form.getFieldsValue())
    let needResetFields = []
    objKeys.forEach(i => {
      let arr = i.split('_')
      const filts = ['field', 'operator', 'constant']
      const not = ['factorCode', 'factorName', 'keys', 'businessLineId', 'serviceId', ...reqParamKeys]
      if (!(not.includes(i) || ((arr.length > 1 && filts.includes(arr[0]) && bol)))) {
        needResetFields.push(i)
      }
    })
    this.props.form.resetFields(needResetFields)
    let { indicatorsInfo = {} } = this.state
    if (!isEdit) {
      indicatorsInfo.returnType = undefined
      if (returnTypeList.includes(e)) {
        indicatorsInfo.returnType = DECIMAL
      } else if (e === 'HISTORY_LIST') {
        indicatorsInfo.returnType = LIST
      } else if (e === 'CHANGE_TRENDS') {
        indicatorsInfo.returnType = BOOLEAN
      }
    }
    if (functionType) {
      this.changeWayFunctionType(functionType)
    } else if (['STATISTICAL_NUMBER', 'IDENTITY_TRANSFER'].indexOf(e) !== -1) {
      this.changeWayFunctionType('STATISTICS_SUM')
    }
    // if (e === 'IDENTITY_TRANSFER') {
    this.statisticTypeList(e)
    // } else {
    //   this.statisticTypeList()
    // }
    indicatorsInfo.factorTemplate = e
    this.setState({ indicatorsInfo })
  }

  changeComputerField = (e) => {
    console.log('changeComputerField', e)
    let factorTemplate = this.props.form.getFieldValue('factorTemplate')
    if (factorTemplate === 'VALUE_EXTRACT') {
      const { fieldList = [], indicatorsInfo = {} } = this.state
      let type = ''
      fieldList.forEach(list => {
        const { list: arr = [] } = list
        arr.forEach(item => {
          if (item.fieldName === e) {
            type = item.dataType
          }
        })
      })
      indicatorsInfo.returnType = type
      this.setState({ indicatorsInfo })
    }
  }
  addContinuous = () => {
    const { form } = this.props
    const keys = form.getFieldValue('continuousKeys')
    const nextKeys = keys.concat(continuousID++)
    form.setFieldsValue({
      continuousKeys: nextKeys
    })
  }
  removeContinuous = (k) => {
    const { form } = this.props
    const keys = form.getFieldValue('continuousKeys')
    form.setFieldsValue({
      continuousKeys: keys.filter(key => key !== k)
    })
  }
  addFiltrate = () => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    const nextKeys = keys.concat(id++)
    form.setFieldsValue({
      keys: nextKeys
    })
  }
  removeFiltrate = (k) => {
    const { form } = this.props
    const keys = form.getFieldValue('keys')
    form.setFieldsValue({
      keys: keys.filter(key => key !== k)
    })
  }

  del = id => {
    confirm({
      title: '是否确认删除?',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        deleteIndicators({ id }).then(res => {
          this.getDataList(1)
        }).catch((data) => {
          notification.warn(data.content)
        })
      }
    })
  }

  onOk = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      console.log('onSubmit', values)
      if (!err) {
        values.keys.forEach(item => {
          const constant = values[`constant_${item}`]
          if (constant.valueOf()) {
            this.datePickerTime[`constant_${item}`] = constant.valueOf()
          }
        })
        values = { ...values, ...this.datePickerTime }
        console.log('Received values of form: ', values)
        const {
          fieldList = [],
          indicatorsInfo = {},
          serviceUrl = '',
          waitingTime,
          reqMethod = 'GET',
          serviceParams = [],
          resSelectedRowKeys = [],
          serviceId,
          customTimeSelectedObj = {}
        } = this.state
        const {
          conjunction,
          factorCode,
          factorName,
          factorTemplate,
          updateTime,
          updatedBy,
          keys,
          continuousKeys,
          scenarios,
          subjects,
          currentSubject,
          computerField,
          timeUnit,
          containsLatest,
          time,
          functionType,
          changeField,
          basicPoint,
          changeRange,
          continuousConjunction,
          compareCharacter,
          count,
          computerSumField,
          listObject,
          constantNumber,
          businessLineId
        } = values
        const { returnType = DECIMAL, id } = indicatorsInfo
        let factorFilters = []
        let factorContinuousFilters = []
        let fieldListArr = []
        fieldList.forEach(item => {
          item.list.forEach(list => {
            fieldListArr.push(list)
          })
        })
        keys.forEach(item => {
          const dataType = fieldListArr.filter(i => i.fieldName === values[`field_${item}`])
          const { dataType: fieldDataType } = dataType[0]
          let constant = values[`constant_${item}`]
          constant = typeof constant === 'object' ? constant.join(',') : constant
          const isConst = fieldList.map(field => field.list).flat()
            .findIndex(f => f.fieldName === constant) === -1
          factorFilters.push({
            constantCategory: isConst ? 'CONSTANT' : 'FIELD',
            constant,
            fieldDataType,
            field: values[`field_${item}`],
            operator: values[`operator_${item}`]
          })
        })
        let templateConfig = {
          scenarios, subjects
        }
        switch (factorTemplate) {
          case 'STATISTICAL_NUMBER': {
            // 统计类-字段值统计
            templateConfig = { ...templateConfig, time, timeUnit, containsLatest, functionType, computerField }
            break
          }
          case 'VALUE_EXTRACT': {
            // 值提取
            templateConfig = {
              ...templateConfig, scenarios, subjects, computerField, functionType, containsLatest
            }
            break
          }
          case 'CONTINUOUS_FREQUENCY': {
            // 统计类-字段值连续次数
            templateConfig = { ...templateConfig, time, timeUnit, functionType: 'CONTINUOUS_FREQUENCY' }
            continuousKeys.forEach(item => {
              const dataType = fieldListArr.filter(i => i.fieldName === values[`continuous_field_${item}`])
              const { dataType: fieldDataType } = dataType[0]
              const constant = values[`continuous_constant_${item}`]
              factorContinuousFilters.push({
                constant: typeof constant === 'object' ? constant.join(',') : constant,
                fieldDataType,
                field: values[`continuous_field_${item}`],
                operator: values[`continuous_operator_${item}`]
              })
            })
            break
          }
          case 'CONTINUOUS_TIME': {
            // 统计类-字段值连续时间精度
            templateConfig = { ...templateConfig, timeUnit, functionType: 'CONTINUOUS_TIME' }
            break
          }
          case 'HISTORY_LIST': {
            // 统计类-字段值历史列表
            templateConfig = {
              ...templateConfig,
              time,
              timeUnit,
              containsLatest,
              functionType,
              compareCharacter,
              count,
              constantNumber,
              computerSumField,
              listObject
            }
            break
          }
          case 'DATA_SERVICE': {
            // 数据服务调用
            const reqServiceParams = serviceParams.filter(s => s.paramType === 'REQUEST') || []
            const resServiceParams = serviceParams.filter(s => s.paramType === 'RESPONSE') || []
            const reqParams = reqServiceParams.map(reqServiceParam => {
              const { paramName = '', paramCode = '', require = 'TRUE', dataType: bindType = '' } = reqServiceParam
              const { [paramCode]: bindField = '', [`${paramCode}_CONSTANT`]: bindFieldConstant = '' } = values
              const isConstantField = customTimeSelectedObj[paramCode]
              const bindCategory = isConstantField ? 'CONSTANT' : 'FIELD'
              return {
                bindCategory,
                require,
                paramName,
                paramCode,
                bindField: bindType === DATETIME && isConstantField && bindFieldConstant ? bindFieldConstant.valueOf() : bindField,
                bindType
              }
            })
            const respParams = resServiceParams.filter(resServiceParam => {
              const { paramCode = '' } = resServiceParam
              return resSelectedRowKeys.indexOf(paramCode) !== -1
            }).map(param => {
              const { paramName = '', paramCode = '', dataType: bindType = '' } = param
              return {
                paramName,
                paramCode,
                bindType
              }
            })
            templateConfig = {
              serviceId,
              serviceUrl,
              waitingTime,
              reqMethod,
              reqParams,
              respParams
            }
            break
          }
          case 'IDENTITY_TRANSFER': {
            templateConfig = {
              ...templateConfig,
              time,
              timeUnit,
              subjects: [subjects],
              currentSubject,
              functionType,
              computerField
            }
            break
          }
          case 'CHANGE_TRENDS': {
            templateConfig = {
              ...templateConfig,
              time,
              timeUnit,
              changeField,
              functionType
            }
            if (functionType === 'WAVE') {
              templateConfig = {
                ...templateConfig,
                basicPoint,
                changeRange
              }
            }
            break
          }
        }
        let data = {
          id,
          conjunction,
          factorCode,
          factorName,
          factorTemplate,
          updateTime,
          updatedBy,
          businessLineId,
          templateConfig,
          continuousConjunction
        }
        if (factorTemplate !== 'DATA_SERVICE') {
          data = {
            ...data,
            returnType,
            factorFilters,
            factorContinuousFilters
          }
        }
        if (this.editType === 'edit') {
          saveIndicatorsUpdate(data).then(res => {
            console.log('res', res)
            this.getDataList(1)
            this.onCancel()
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } else {
          saveIndicatorsEditOrAdd(data).then(res => {
            console.log('res', res)
            this.getDataList(1)
            this.onCancel()
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        }
        console.log('data', data)
      }
    })
  }

  onCancel = () => {
    id = 0
    this.props.form.resetFields()
    this.setState({
      showModel: false,
      indicatorsInfo: undefined,
      serviceParams: undefined,
      serviceId: undefined,
      resSelectedRowKeys: [],
      customTimeSelectedObj: {}
    })
  }

  newIndicators = () => {
    this.editType = 'add'
    this.changeWayFunctionType('STATISTICS_SUM')
    this.getMaxTermTips()
    this.setState({ showModel: true })
  }

  getMaxTermTips = () => {
    getMaxTermTips().then(data => {
      const { content: maxTermTips = '' } = data
      this.setState({
        maxTermTips
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  view = data => {
    this.edit(data, 'view')
  }

  edit = (data, type) => {
    let { enumList = {} } = this.state
    this.editType = type
    let indicatorsInfo = JSON.parse(JSON.stringify(data))
    let filtrateDataType = []
    let { factorFilters = [], factorContinuousFilters = [], businessLineId, factorTemplate = 'STATISTICAL_NUMBER', templateConfig } = indicatorsInfo
    const { functionType, serviceId, reqParams = [], respParams = [] } = templateConfig
    this.businessLineId = businessLineId
    if (serviceId) {
      this.changeServiceId(serviceId)
    }
    if (factorFilters === null) {
      factorFilters = []
    }
    this.props.form.setFieldsValue({ factorTemplate })
    factorFilters.forEach((item, index) => {
      if (!indicatorsInfo.keys) {
        indicatorsInfo.keys = []
      }
      indicatorsInfo.keys.push(index)
      indicatorsInfo[`field_${index}`] = item.field
      indicatorsInfo[`operator_${index}`] = item.operator
      indicatorsInfo[`constant_${index}`] = item.constant
      filtrateDataType[`field_${index}`] = item.fieldDataType
      if (item.fieldDataType === ENUM && !enumList[item.field]) {
        this.getEnumList(item.field)
      } else if (item.fieldDataType === BOOLEAN && !enumList[item.field]) {
        enumList[item.field] = [{
          key: 'true',
          value: '是'
        }, {
          key: 'false',
          value: '否'
        }]
        // this.setState({ enumList })
      } else if (item.fieldDataType === DATETIME && !enumList[item.field]) {
        enumList[item.field] = DATETIME
      }
    })
    factorContinuousFilters.forEach((item, index) => {
      if (!indicatorsInfo.continuousKeys) {
        indicatorsInfo.continuousKeys = []
      }
      indicatorsInfo.continuousKeys.push(index)
      indicatorsInfo[`continuous_field_${index}`] = item.field
      indicatorsInfo[`continuous_operator_${index}`] = item.operator
      indicatorsInfo[`continuous_constant_${index}`] = item.constant
      filtrateDataType[`continuous_field_${index}`] = item.fieldDataType
      if (item.fieldDataType === ENUM && !enumList[item.field]) {
        this.getEnumList(item.field)
      } else if (item.fieldDataType === BOOLEAN && !enumList[item.field]) {
        enumList[item.field] = [{
          key: 'true',
          value: '是'
        }, {
          key: 'false',
          value: '否'
        }]
        // this.setState({ enumList })
      } else if (item.fieldDataType === DATETIME && !enumList[item.field]) {
        enumList[item.field] = DATETIME
      }
    })
    if (type === 'copy') {
      delete indicatorsInfo.id
      indicatorsInfo.factorCode = `COPY_${indicatorsInfo.factorCode}`
      indicatorsInfo.factorName = `COPY_${indicatorsInfo.factorName}`
    }
    this.changeBusinessLineId(businessLineId, true, functionType)
    this.getFieldList(businessLineId)
    id = factorFilters.length
    this.getSumFields()
    this.getListObj()
    let customTimeSelectedObj = {}
    reqParams.filter(reqParam => reqParam.bindCategory === 'CONSTANT').forEach(reqParam => {
      customTimeSelectedObj = { ...customTimeSelectedObj, [reqParam.paramCode]: true }
    })
    const resSelectedRowKeys = respParams.map(respParam => respParam.paramCode)
    this.setState({
      showModel: true,
      indicatorsInfo,
      filtrateDataType,
      enumList,
      resSelectedRowKeys,
      customTimeSelectedObj
    }, () => {
      this.props.form.setFieldsValue({ factorTemplate })
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.getDataList(pagination.current)
    })
  }
  nameChange = e => {
    this.setState({ codeOrName: e.target.value })
  }

  getDataList = async (pageNum = 1) => {
    const { codeOrName, pagination, selectBusinessId } = this.realParam
    const { pageSize } = pagination
    const data = {
      codeOrName,
      businessLineId: selectBusinessId,
      pageNum,
      pageSize
    }
    this.setState({
      loading: true
    })
    await getIndicatorsList(buildUrlParamNew(data)).then(res => {
      if (res.actionStatus === 'SUCCESS') {
        const { content = {} } = res
        const { data = [], page, total } = content
        if (data.length === 0 && page > 1) {
          // 用户非法操作 前端兼容处理
          this.getDataList(1)
          return
        }
        data.forEach((item, index) => {
          item.key = `${page}_${index}`
        })
        pagination.total = total
        pagination.current = page
        this.setState({ dataSource: data, loading: false, pagination })
      } else {
        notification.warning(res.content)
        this.setState({
          loading: false
        })
      }
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  onClearClick = () => {
    this.setState({
      codeOrName: '',
      selectBusinessId: undefined
    })
  }

  getTemplateList = () => {
    getTemplateList().then(res => {
      const { content = [] } = res
      this.setState({ templateTypeList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  valueExtractTypeList = () => {
    valueExtractTypeList().then(res => {
      const { content = [] } = res
      this.setState({ valueExtractTypeList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  statisticTypeList = (factorTemplate = 'STATISTICAL_NUMBER') => {
    statisticTypeList(factorTemplate).then(res => {
      const { content = [] } = res
      this.setState({ statisticTypeList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getFieldList = (businessLineId) => {
    getFieldList({ fieldCategory: 'FIELD', businessLineId }).then(res => {
      const { content = [] } = res
      const { tree: fieldList } = initFieldListData(content)
      this.setState({ fieldList })
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
  operCharacterList = () => {
    operCharacterList().then(res => {
      let { content = [] } = res
      this.setState({ operCharacterList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getListObj = () => {
    getListObj(buildUrlParamNew({ businessLineId: this.businessLineId })).then(res => {
      let { content = [] } = res
      this.setState({ listObj: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getListTypeList = () => {
    getListTypeList().then(res => {
      let { content = [] } = res
      this.setState({ listTypeList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getSumFields = () => {
    getSumFields(buildUrlParamNew({ businessLineId: this.businessLineId })).then(res => {
      let { content = [] } = res
      const { list } = initFieldListData(content)
      this.setState({ sumFields: list })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  unitList = () => {
    unitList().then(res => {
      let { content = [] } = res
      // content.forEach(item => {
      //   item.index = item.index.toUpperCase()
      // })
      this.setState({ unitList: content })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  updateValidation = (id, callback) => {
    updateValidation(id).then(res => {
      let { content = [] } = res
      if (content.length === 0) {
        callback()
      } else {
        decisionModalError(content)
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  getEnumList = (fieldName, fieldDataCategory = 'FIELD') => {
    getEnumList(buildUrlParamNew({ fieldName, fieldDataCategory })).then(res => {
      const { content = {} } = res
      const { enumList = {} } = this.state
      let { data } = JSON.parse(content.enumOption || '')
      enumList[fieldName] = data
      this.setState({ enumList })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Indicators))
