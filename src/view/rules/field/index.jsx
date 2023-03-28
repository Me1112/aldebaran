import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Select, Input, Table, Switch, Modal, Form, Row, notification, Tabs, Icon } from 'antd'
import classnames from 'classnames'
import LayoutRight from '../../../component/layout_right'
import {
  TYPE_SYSTEM,
  TYPE_CUSTOM,
  SUCCESS
} from '../../../common/constant'

import {
  getSysFieldList,
  getCustomFieldList,
  getDataTypeList,
  getFieldTypeList,
  deleteSysField,
  saveSysField,
  updateSysField,
  deleteCustomField,
  saveCustomField,
  updateCustomField,
  getFieldListPaginated,
  addField,
  updateField,
  updateFieldActive,
  delField,
  addFieldEnum,
  getGenerated,
  fieldDependencies,
  getDataServicesList
} from '../../../action'
import { Map } from 'immutable'
import Enum from './enum'
import { getUserInfo, buildUrlParamNew, decisionModalError } from '../../../util'
import './index.less'
import { getBusinessList } from '../../../action/rule'
import { getDimensionList } from '../../../action/policy'

const { Option } = Select
const { TabPane } = Tabs
const { Item: FormItem } = Form
const TYPE_DATA_SERVICE = 'DATA_SERVICE'
const confirm = Modal.confirm
const UN_ACTIVED = 'UN_ACTIVED'
const ACTIVED = 'ACTIVED'

function mapStateToProps(state) {
  const { rule = Map({}) } = state
  const {
    sysFieldContent = {},
    customFieldContent = {},
    dataTypeList = [],
    fieldTypeList = [],
    businessLine = []
  } = rule.toJS()
  return { sysFieldContent, customFieldContent, dataTypeList, fieldTypeList, businessLine }
}

function mapDispatchToProps(dispatch) {
  return {
    getSysFieldList: bindActionCreators(getSysFieldList, dispatch),
    getCustomFieldList: bindActionCreators(getCustomFieldList, dispatch),
    getDataTypeList: bindActionCreators(getDataTypeList, dispatch),
    getFieldTypeList: bindActionCreators(getFieldTypeList, dispatch),
    deleteSysField: bindActionCreators(deleteSysField, dispatch),
    saveSysField: bindActionCreators(saveSysField, dispatch),
    updateSysField: bindActionCreators(updateSysField, dispatch),
    deleteCustomField: bindActionCreators(deleteCustomField, dispatch),
    saveCustomField: bindActionCreators(saveCustomField, dispatch),
    getBusinessList: bindActionCreators(getBusinessList, dispatch),
    updateCustomField: bindActionCreators(updateCustomField, dispatch)
  }
}

class RuleField extends Component {
  static propTypes = {
    form: PropTypes.any,
    getSysFieldList: PropTypes.func.isRequired,
    getCustomFieldList: PropTypes.func.isRequired,
    getDataTypeList: PropTypes.func.isRequired,
    getFieldTypeList: PropTypes.func.isRequired,
    deleteSysField: PropTypes.func.isRequired,
    saveSysField: PropTypes.func.isRequired,
    updateSysField: PropTypes.func.isRequired,
    deleteCustomField: PropTypes.func.isRequired,
    saveCustomField: PropTypes.func.isRequired,
    updateCustomField: PropTypes.func.isRequired,
    getBusinessList: PropTypes.func.isRequired,
    businessLine: PropTypes.any,

    sysFieldContent: PropTypes.object.isRequired,
    customFieldContent: PropTypes.object.isRequired,
    dataTypeList: PropTypes.array.isRequired,
    fieldTypeList: PropTypes.array.isRequired
  }

  state = {
    tabChanged: true,
    tabFieldType: TYPE_SYSTEM,
    editConfirmShow: false,
    deleteConfirmShow: false,
    promptShow: false,
    promptMsg: '',
    record: {},
    dataTypesObj: {},

    fieldTypeVal: undefined,
    dataTypeVal: undefined,
    dataServiceSelected: undefined,
    fieldNameVal: '',

    fieldInfo: {},
    fieldSaveError: '',
    enumShow: false,
    enumList: [ { key: '', value: '' } ],
    dataServices: [],
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    },
    dataServicesList: []
  }

  componentDidMount() {
    this.realParam = { ...this.state }
    this.props.getDataTypeList()
    this.props.getFieldTypeList()
    this.props.getBusinessList()
    this.getDimensionList()
    this.onFieldsQuery()
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ tabChanged: false })
  }

  render() {
    const {
      tabFieldType,
      fieldInfo,
      fieldSaveError,
      isView = false,
      promptShow,
      promptMsg,
      enumShow,
      enumList,
      loading = false,
      dimensionList = [],
      parsingShow = false,
      parsingDataSource = []
    } = this.state
    let { dataTypeList, businessLine = [] } = this.props
    const {
      id,
      code: fieldCode = '',
      name: fieldName = '',
      fieldType: dataType = undefined,
      maxLength = '',
      description = '',
      dimensionalityId,
      businessLineId
    } = fieldInfo
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }

    const renderDom = this.renderPane()

    const parsingColumns = [
      {
        title: '字段名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => {
          return (<div title={text} className="text-overflow">{text}</div>)
        }
      }, {
        title: '字段编码',
        dataIndex: 'code',
        key: 'code',
        render: (text, record) => {
          return (<div title={text} className="text-overflow">{text}</div>)
        }
      }, {
        title: '字段类型',
        dataIndex: 'fieldType',
        key: 'fieldType',
        width: 90,
        render: (text, record) => {
          let dataTypeName = ''
          dataTypeList.forEach((dataType) => {
            if (dataType.index.toUpperCase() === record.fieldType) {
              dataTypeName = dataType.name
            }
          })
          return dataTypeName
        }
      }
    ]

    return (
      <LayoutRight className="no-bread-crumb" type={'tabs'}>
        <Tabs type="card" defaultActiveKey={TYPE_SYSTEM} className={'tabs-no-border scorecard-new'}
              activeKey={tabFieldType}
              onChange={this.onFieldTypeChange}>
          <TabPane tab="系统默认" key={TYPE_SYSTEM} forceRender>
            {
              renderDom
            }
          </TabPane>
          <TabPane tab="自定义" key={TYPE_CUSTOM} forceRender>
            {
              renderDom
            }
          </TabPane>
        </Tabs>

        <Modal
          title="提示"
          wrapClassName="edit-confirm-modal"
          visible={promptShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={() => this.setState({ promptShow: false })}
          onOk={() => this.setState({ promptShow: false })}
        >
          {promptMsg}
        </Modal>

        <Modal
          title="解析信息"
          width={700}
          visible={parsingShow}
          footer={null}
          onCancel={() => this.setState({ parsingShow: false })}
        >
          <Table rowKey="id" className="table-layout-fixed" columns={parsingColumns} dataSource={parsingDataSource} />
        </Modal>

        <Modal
          title={`${id > 0 ? isView ? '查看' : '编辑' : '新建'}${tabFieldType === TYPE_CUSTOM ? '自定义' : '系统'}字段`}
          centered
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onFieldSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="字段名称">
              <Input {...getFieldProps('fieldName', {
                initialValue: fieldName,
                validate: [ {
                  rules: [
                    { required: true, message: '最多50个字符' }
                  ]
                } ]
              })} placeholder="最多50个字符" maxLength="50" disabled={isView} />
            </FormItem>
            <FormItem {...formItemLayout} label="字段编码">
              <Input {...getFieldProps('fieldCode', {
                initialValue: fieldCode,
                validate: [ {
                  rules: [
                    { required: true, pattern: /^\w+$/, message: '字母数字下划线,最多50个字符' }
                  ]
                } ]
              })} placeholder="字母数字下划线,最多50个字符" maxLength="50" disabled={isView} />
            </FormItem>
            <FormItem {...formItemLayout} label="字段类型">
              <Select {...getFieldProps('dataType', {
                initialValue: dataType,
                validate: [ {
                  rules: [
                    { required: true, message: '请选择字段类型' }
                  ]
                } ]
              })} placeholder="请选择字段类型" onSelect={this.dataTypeSelect} disabled={isView}>
                {
                  dataTypeList.map(dataType => {
                    const { name, index } = dataType
                    return (
                      <Option key={index} value={index.toUpperCase()}>{name}</Option>
                    )
                  })
                }
              </Select>
            </FormItem>
            <Enum visible={enumShow} disabled={isView} enumList={enumList} onEnumAdd={this.onEnumAdd}
                  onEnumDelete={this.onEnumDelete} onEnumChange={this.onEnumChange} />
            <FormItem {...formItemLayout} label="最大长度">
              <Input {...getFieldProps('maxLength', {
                initialValue: maxLength,
                validate: [ {
                  rules: [
                    { required: true, pattern: /^([1-9][0-9]{0,1}|100)$/, message: '1-100的整数' }
                  ]
                } ]
              })} placeholder="1-100的整数" maxLength="50" disabled={isView} />
            </FormItem>
            <FormItem {...formItemLayout} label="业务条线">
              <Select disabled={id > 0 || isView} {...getFieldProps('businessLineId', {
                initialValue: businessLineId,
                validate: [ {
                  rules: [
                    { required: true, message: '请选择业务条线' }
                  ]
                } ]
              })} placeholder="请选择">
                {
                  businessLine.map(item => {
                    return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
                  })
                }
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="主体维度">
              <Select allowClear {...getFieldProps('dimensionalityId', {
                initialValue: dimensionalityId
              })} placeholder="请选择" disabled={isView}>
                {
                  dimensionList.map(item => {
                    return <Option key={item.id} value={item.id}>{item.name}</Option>
                  })
                }
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="描述">
              <Input.TextArea {...getFieldProps('description', {
                initialValue: description
              })} rows={4} placeholder="最多200个字符" maxLength="200" disabled={isView} />
            </FormItem>
            <Row className="save-error">{fieldSaveError}</Row>
          </Form>
        </Modal>
      </LayoutRight>
    )
  }

  renderPane = () => {
    const {
      tabFieldType,
      dataTypeVal,
      fieldNameVal,
      selectBusinessId,
      sysFieldContent = {},
      customFieldContent = {},
      enumAddVisible = false,
      enumOptionData = [],
      enumAddData = []
    } = this.state
    const { dataTypeList, businessLine = [] } = this.props

    const sysFieldColumns = [
      {
        title: '字段编码',
        dataIndex: 'code',
        key: 'code',
        width: 150,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 134 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '字段名称',
        dataIndex: 'name',
        key: 'name',
        width: 120,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 104 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '业务条线',
        dataIndex: 'businessLineName',
        key: 'businessLineName',
        width: 120,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 104 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '字段类型',
        dataIndex: 'fieldType',
        key: 'fieldType',
        width: 120,
        render: (text, record) => {
          let dataTypeName = ''
          dataTypeList.forEach((dataType) => {
            if (dataType.index.toUpperCase() === record.fieldType) {
              dataTypeName = dataType.name
            }
          })
          return dataTypeName
        }
      }, {
        title: '主体维度',
        dataIndex: 'dimensionalityName',
        key: 'dimensionalityName',
        width: 120,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 104 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 104 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 100,
        render: (text, record) => {
          return <Fragment>
            <span className="operation-span" onClick={() => {
              this.onEditIconClick(record, 'view')
            }}>查看</span>
            {
              record.dimensionalityName ? <span className="operation-span"
                                                onClick={() => this.parsing(record)}>解析信息</span> : null
            }
          </Fragment>
        }
      } ]
    const sysFieldList = sysFieldContent.data || []

    const customFieldColumns = [
      {
        title: '字段编码',
        dataIndex: 'code',
        key: 'code',
        width: 150,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 134 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '字段名称',
        dataIndex: 'name',
        key: 'name',
        width: 120,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 104 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '业务条线',
        dataIndex: 'businessLineName',
        key: 'businessLineName',
        width: 120,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 104 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '字段类型',
        dataIndex: 'fieldType',
        key: 'fieldType',
        render: (text, record) => {
          let dataTypeName = ''
          dataTypeList.forEach((dataType) => {
            if (dataType.index.toUpperCase() === record.fieldType) {
              dataTypeName = dataType.name
            }
          })
          return record.fieldType === 'ENUM' && record.activeStatus === ACTIVED
            ? <span className="wa-primary-color" style={{ cursor: 'pointer' }}
                    onClick={() => this.onCustomEnumCreate(record)}>
              {dataTypeName}
              <Icon type="plus-circle-o" className="wa-primary-color" style={{ position: 'relative', top: 1 }} />
          </span> : dataTypeName
        }
      }, {
        title: '主体维度',
        dataIndex: 'dimensionalityName',
        key: 'dimensionalityName',
        width: 120,
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 104 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '激活',
        dataIndex: 'activeStatus',
        key: 'activeStatus',
        render: (text, record) => {
          return <Switch style={{ width: 55 }} checkedChildren="ON" unCheckedChildren="OFF"
                         checked={record.activeStatus === ACTIVED}
                         onChange={(checked) => this.changeActived(checked, record)} />
        }
      }, {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        render: (text) => {
          return (<div className="text-overflow" style={{ width: 150 }}
                       title={text}>{text}</div>)
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        render: (text, record) => {
          const isActive = record.activeStatus === ACTIVED
          return <Fragment>
            {
              isActive ? <span className="operation-span" onClick={() => {
                this.onEditIconClick(record, 'view')
              }}>查看</span> : <span className="operation-span" onClick={() => {
                this.onEditIconClick(record)
              }}>编辑</span>
            }
            {
              record.dimensionalityName ? <span className="operation-span"
                                                onClick={() => this.parsing(record)}>解析信息</span> : null
            }
            {
              !isActive ? <span className="operation-span" onClick={() => {
                this.onDeleteIconClick(record)
              }}>删除</span> : null
            }
          </Fragment>
        }
      } ]
    const customFieldList = customFieldContent.data || []
    let columns = sysFieldColumns
    let dataSource = sysFieldList

    switch (tabFieldType) {
      case TYPE_SYSTEM:
        columns = sysFieldColumns
        dataSource = sysFieldList
        break
      case TYPE_CUSTOM:
        columns = customFieldColumns
        dataSource = customFieldList
        break
    }
    const { companyId = '' } = getUserInfo()
    return <Fragment>
      <div className="region-zd">
        <Input value={fieldNameVal} placeholder="字段编码/名称" style={{ width: 200 }}
               onChange={this.fieldNameChange} />
        <Select placeholder="业务条线" allowClear style={{ width: 200 }} value={selectBusinessId}
                onChange={this.selectBusiness}>
          {
            businessLine.map(item => {
              return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
            })
          }
        </Select>
        <Select value={dataTypeVal} placeholder="字段类型" style={{ width: 200 }}
                onChange={this.dataTypeChange} allowClear>
          {
            dataTypeList.map(dataType => {
              const { name, index } = dataType
              return (
                <Option key={index} value={index}>{name}</Option>
              )
            })
          }
        </Select>
        <Button type="primary" onClick={() => {
          this.realParam = { ...this.state }
          this.onFieldsQuery()
        }}>查询</Button>
        <Button onClick={() => {
          this.setState({
            selectBusinessId: undefined,
            fieldNameVal: '',
            dataTypeVal: undefined
          })
        }}>重置</Button>
        {
          (tabFieldType === TYPE_SYSTEM && companyId && companyId !== '') || (tabFieldType === TYPE_DATA_SERVICE)
            ? ''
            : <Button type="primary" style={{ float: 'right' }} onClick={this.onCreateBtnClick}>新建</Button>
        }
      </div>
      <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
        <Table className={classnames({ 'data-service': tabFieldType === TYPE_DATA_SERVICE })}
               bordered={tabFieldType === TYPE_DATA_SERVICE}
               rowKey="id"
               columns={columns} dataSource={dataSource}
               onChange={this.handleChange}
               pagination={this.state.pagination} />
      </div>
      <Modal width={600}
             title="添加枚举值"
             className="enum-modal"
             visible={enumAddVisible}
             onCancel={this.onCancel}
             onOk={this.onOk}>
        <div className="header">
          {
            enumOptionData.map(enumOption => {
              const { key = '', value = '' } = enumOption
              return `${key}-${value}`
            }).join('; ')
          }
        </div>
        {
          enumAddData.map((enumAdd, index) => {
            const { key = '', value = '' } = enumAdd
            return <div key={index} className="enum-add">
              <div className="item">
                <span>key:</span>
                <Input value={key} onChange={e => this.changeEnum(e, 'key', index)} placeholder="请输入" />
              </div>
              <div className="item">
                <span>value:</span>
                <Input value={value} onChange={e => this.changeEnum(e, 'value', index)} placeholder="请输入" />
              </div>
              <Icon type="delete" onClick={() => {
                this.removeEnum(index)
              }} />
            </div>
          })
        }
        <div className="layout-create" onClick={this.createEnum}>添加项</div>
      </Modal>
    </Fragment>
  }

  changeEnum = (e, field, index) => {
    const { enumAddData = [] } = this.state
    enumAddData[index] = { ...enumAddData[index], [field]: e.target.value }
    this.setState({
      enumAddData
    })
  }

  createEnum = () => {
    const { enumAddData = [] } = this.state
    enumAddData.push({ key: undefined, value: undefined })
    this.setState({
      enumAddData
    })
  }

  removeEnum = index => {
    const { enumAddData = [] } = this.state
    enumAddData.splice(index, 1)
    this.setState({
      enumAddData
    })
  }

  onOk = () => {
    const { enumAddData = [], record: { id = '' } = {} } = this.state
    const hasEmpty = enumAddData.findIndex(enumAdd => {
      const { key = '', value = '' } = enumAdd
      return key.length === 0 || value.length === 0
    }) !== -1
    const hasDuplicatedKey = this.hasDuplicatedKey(enumAddData)
    if (hasEmpty) {
      notification.warning({
        message: '请将枚举值信息填写完整'
      })
      return
    }
    if (hasDuplicatedKey) {
      notification.warning({
        message: '枚举值key重复'
      })
      return
    }
    const enumOptionList = enumAddData.map(enumAdd => {
      const { key, value } = enumAdd
      return { optionKey: key, optionValue: value }
    })
    addFieldEnum({ id, enumOptionList }).then(() => {
      this.setState({
        record: {},
        enumAddVisible: false,
        enumAddData: []
      }, () => {
        const { pagination: { current = 1 } = {} } = this.realParam
        this.onFieldsQuery(current)
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onCancel = () => {
    this.setState({
      enumAddVisible: false
    })
  }

  onCustomEnumCreate = record => {
    const { enumOption = '{}' } = record
    const { data: enumOptionData = [] } = JSON.parse(enumOption)
    console.log(enumOptionData)
    this.setState({
      record,
      enumAddVisible: true,
      enumOptionData
    })
  }

  parsing = data => {
    const { id } = data
    getGenerated(buildUrlParamNew({ id })).then(res => {
      const { content = [] } = res
      this.setState({ parsingDataSource: content, parsingShow: true })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.onFieldsQuery(pagination.current)
    })
  }
  selectBusiness = e => {
    this.setState({ selectBusinessId: e })
  }

  changeActived = async (checked, record) => {
    const { pagination: { current = 1 } = {} } = this.realParam
    record.activeStatus = checked ? ACTIVED : UN_ACTIVED
    if (!checked) {
      fieldDependencies(buildUrlParamNew({ id: record.id })).then(res => {
        const { content = [] } = res
        if (content.length === 0) {
          updateFieldActive(record).then(res => {
            this.setState({ editConfirmShow: false, loading: false }, () => {
              this.onFieldsQuery(current)
            })
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        } else {
          const nameMapError = {
            RuleSet: '规则集:',
            ScoreCard: '评分卡:',
            Factor: '指标:',
            DecisionTree: '决策树:'
          }
          decisionModalError(content, nameMapError)
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    }
    if (checked) {
      updateFieldActive(record).then(res => {
        this.setState({ editConfirmShow: false, loading: false }, () => {
          this.onFieldsQuery(current)
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    }
  }

  onFieldsQuery = async (page = 1) => {
    const { tabFieldType, dataTypeVal = '', fieldNameVal, selectBusinessId, pagination } = this.realParam
    const { pageSize } = pagination
    const data = {
      businessLineId: selectBusinessId,
      fieldSource: tabFieldType,
      fieldType: dataTypeVal.toUpperCase(),
      keyword: fieldNameVal,
      page,
      size: pageSize
    }
    getFieldListPaginated(buildUrlParamNew(data)).then(res => {
      let key = 'customFieldContent'
      if (tabFieldType === TYPE_SYSTEM) {
        key = 'sysFieldContent'
      }
      const { content } = res
      pagination.total = content.total
      pagination.current = content.page
      this.setState({ [key]: content, pagination })
    }).catch((data) => {
      const { content = {} } = data
      this.setState({ tabChanged: false }, () => {
        notification.warn(content)
      })
    })
  }

  getDataServicesList = async (id = '') => {
    try {
      const { promise } = await getDataServicesList(id)
      promise.then((data) => {
        const { content = [] } = data
        const { dataSource: dataServicesList, rowSpans } = this._convertDataServicesList(content)
        console.log('dataServicesList', dataServicesList)
        this.setState({ dataServicesList, rowSpans, tabChanged: false })
      }).catch((data) => {
        const { content = {} } = data
        this.setState({ tabChanged: false }, () => {
          notification.warn(content)
        })
      })
    } catch (err) {
      this.setState({ tabChanged: false })
    }
  }

  _convertDataServicesList = (dataServicesList) => {
    let dataSource = []
    let rowSpans = {}
    let rowIndex = 0
    dataServicesList.forEach((ds, index) => {
      const { serviceName, serviceDescription, inputParams = [], outputParams = [] } = ds
      const inputParamsCount = inputParams.length
      const outputParamsCount = outputParams.length
      const isInput = inputParamsCount >= outputParamsCount
      const larges = isInput ? inputParams : outputParams
      const smalls = !isInput ? inputParams : outputParams
      const rows = this._buildDataServicesListRowData(index, serviceName, serviceDescription, larges, smalls, isInput)
      dataSource = dataSource.concat(rows)
      const dataSourceCount = rows.length
      rowSpans[serviceName] = { rowSpan: dataSourceCount, index: rowIndex }
      rowIndex += dataSourceCount
    })
    return { dataSource, rowSpans }
  }

  _buildDataServicesListRowData = (key, serviceName, serviceDescription, larges = [], smalls = [], input = true) => {
    const rows = larges.map((l, index) => {
      const keys = Object.keys(l)
      const largeSuffix = input ? 'Input' : 'Output'
      const smallSuffix = !input ? 'Input' : 'Output'
      const other = smalls[index] || {}
      let row = {}
      keys.forEach(k => {
        row[`${k}${largeSuffix}`] = l[k]
        row[`${k}${smallSuffix}`] = other[k] || ''
      })
      return {
        definedFieldId: `${key}_${index}`, serviceName, serviceDescription, ...row
      }
    })
    return rows
  }

  dataServicesChange = (value) => {
    this.setState({ dataServiceSelected: value }, () => {
      this.getDataServicesList(value)
    })
  }

  fieldTypeChange = (value) => {
    this.setState({ fieldTypeVal: value })
  }

  dataTypeChange = (value) => {
    this.setState({ dataTypeVal: value })
  }

  dataTypeSelect = (value = '') => {
    this.setState({ enumShow: value === 'ENUM' })
  }

  fieldNameChange = (e) => {
    this.setState({ fieldNameVal: e.target.value })
  }

  onFieldTypeChange = (fieldType) => {
    const { tabFieldType } = this.state
    if (fieldType !== tabFieldType) {
      this.setState({
        tabChanged: true,
        tabFieldType: fieldType,
        fieldTypeVal: undefined,
        dataTypeVal: undefined,
        businessLineId: undefined,
        fieldNameVal: ''
      }, () => {
        this.realParam = { ...this.state }
        this.onFieldsQuery(1)
      })
    }
  }

  getDimensionList = () => {
    getDimensionList().then(data => {
      const { content: dataSource = [] } = data
      this.setState({
        dimensionList: dataSource
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onIsActivedChange = (checked) => {
    let fieldInfo = this.state.fieldInfo
    fieldInfo.isActived = checked ? 1 : 0
    this.setState(fieldInfo)
  }

  onCreateBtnClick = () => {
    this.setState({
      editConfirmShow: true,
      fieldInfo: {},
      fieldSaveError: '',
      enumShow: false,
      enumList: [ { key: '', value: '' } ]
    }, () => {
      this.props.form.resetFields()
    })
  }

  onEditIconClick = (fieldInfo, editType = 'edit') => {
    this.editType = editType
    if (fieldInfo.fieldType === 'ENUM') {
      this.setState({
        enumList: JSON.parse(fieldInfo.enumOption).data,
        enumShow: true
      })
    }
    this.setState({
      isView: editType === 'view',
      editConfirmShow: true,
      fieldInfo
    }, () => {
      this.props.form.resetFields()
      this.props.form.validateFields()
    })
  }

  onEditCancel = () => {
    this.setState({
      isView: false,
      editConfirmShow: false,
      fieldInfo: {},
      enumShow: false,
      enumList: [ { key: '', value: '' } ],
      fieldSaveError: ''
    }, () => {
      this.props.form.resetFields()
    })
  }

  onFieldSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      let { enumList = [] } = this.state
      let hasEnumError = false
      console.log('values:', values)
      if (values.dataType === 'ENUM') {
        const hasDuplicatedKey = this.hasDuplicatedKey(enumList)
        if (hasDuplicatedKey) {
          notification.warning({
            message: '枚举值key重复'
          })
          return
        }
        const enumListLen = enumList.length
        for (let i = 0; i < enumListLen; i++) {
          const item = enumList[i]
          const { key = '', value = '' } = item
          enumList[i]['keyError'] = false
          enumList[i]['valueError'] = false
          if (key.trim() === '') {
            enumList[i]['keyError'] = true
            hasEnumError = true
          }
          if (value.trim().length === 0) {
            enumList[i]['valueError'] = true
            hasEnumError = true
          }
        }
      }
      if (errors || hasEnumError) {
        if (hasEnumError) {
          this.setState({ enumList })
        }
        return
      }
      await this.setState({ loading: true })
      try {
        let editFieldResponse = {}
        const { id = '' } = this.state.fieldInfo
        const {
          fieldCode = '',
          fieldName = '',
          dataType = '',
          maxLength = '',
          description = '',
          dimensionalityId,
          businessLineId
        } = this.props.form.getFieldsValue()
        const enumOption = dataType === 'ENUM' ? JSON.stringify({ 'data': enumList }) : ''
        const queryData = {
          name: fieldName,
          code: fieldCode,
          fieldType: dataType.toUpperCase(),
          maxLength,
          dimensionalityId,
          businessLineId,
          description,
          enumOption
          // activeStatus: isActived ? ACTIVED : UN_ACTIVED
        }
        editFieldResponse = await (id > 0 ? updateField({
          id,
          ...queryData
        }) : addField({
          ...queryData
          // fieldDisplayName,
          // fieldName,
          // dataType,
          // enumOption,
          // fieldType,
          // maxLength,
          // description,
          // isActived: isActived ? 1 : 0
        }))
        const { promise } = editFieldResponse
        promise.then((data) => {
          const { actionStatus = '' } = data
          if (actionStatus === SUCCESS) {
            this.setState({ editConfirmShow: false, loading: false }, () => {
              this.onFieldsQuery()
            })
          }
        }).catch((data) => {
          const { content = {} } = data
          const { message = '' } = content
          this.setState({ loading: false })
          // this.props.form.setFields({
          //   fieldDisplayName: {
          //     errors: [{
          //       message
          //     }]
          //   }
          // })
          this.setState({ fieldSaveError: message })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }

  onDeleteIconClick = (record) => {
    confirm({
      title: '是否确认删除?',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        this.onFieldDelete()
      },
      onCancel: () => {
        this.onFieldCancel()
      }
    })
    this.setState({
      // deleteConfirmShow: true,
      record
    })
  }

  onFieldCancel = () => {
    this.setState({
      deleteConfirmShow: false,
      fieldSaveError: ''
    })
  }

  onFieldDelete = async () => {
    const { id } = this.state.record
    delField({ id }).then(res => {
      const { actionStatus = '' } = res
      if (actionStatus === SUCCESS) {
        this.setState({
          deleteConfirmShow: false
        }, () => {
          this.onFieldsQuery()
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      const { message = '' } = content
      this.setState({
        deleteConfirmShow: false,
        promptShow: true,
        promptMsg: message
      })
    })
  }

  onEnumAdd = () => {
    const { enumList } = this.state
    enumList.push({ key: '', value: '' })
    this.setState({ enumList })
  }

  onEnumDelete = (index) => {
    const { enumList } = this.state
    enumList.splice(index, 1)
    this.setState({ enumList })
  }

  onEnumChange = (e, index, prop) => {
    const { enumList } = this.state
    enumList[index][prop] = e.target.value
  }

  hasDuplicatedKey = enumList => {
    const keys = enumList.map(e => e.key)
    return keys.length > [ ...new Set(keys) ].length
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(RuleField))
