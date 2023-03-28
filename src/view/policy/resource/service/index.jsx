import React, { Fragment } from 'react'
import LayoutRight from '../../../../component/layout_right'
import {
  Button,
  Input,
  notification,
  Table,
  Modal,
  Form,
  Select,
  Switch,
  Col,
  Row,
  Icon,
  InputNumber
} from 'antd'
import {
  buildUrlParamNew,
  formatDate
} from '../../../../util'
import {
  getServiceTypeSelect,
  getResourceServiceList,
  deleteResourceService,
  activeResourceService,
  testResourceService,
  getResourceServiceDependencies,
  getServiceResDataTypeSelect,
  updateServiceParam,
  createServiceParam
} from '../../../../action/policy'
import {
  getDataTypeList
} from '../../../../action/decision'
import PropTypes from 'prop-types'
import './index.less'
import connect from 'react-redux/es/connect/connect'
import ServiceTest from '../../../../component/service_test'

const confirm = Modal.confirm
const { Option } = Select
const lineLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
}

const defaultReqParam = {
  dataType: undefined,
  paramCode: undefined,
  paramName: undefined,
  paramType: 'REQUEST',
  require: 'TRUE'
}
const defaultResParam = {
  dataType: undefined,
  paramCode: undefined,
  paramName: undefined,
  paramType: 'RESPONSE',
  require: 'TRUE'
}

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

class ResourceService extends React.Component {
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
  }

  static propTypes = {
    form: PropTypes.any
  }

  componentDidMount() {
    this.realParam = { ...this.state }
    this.getServiceTypeSelect()
    this.getDataList(1)
    this.getDataTypeList()
    this.getServiceResDataTypeSelect()
  }

  render() {
    const { getFieldDecorator, getFieldProps } = this.props.form
    const {
      serviceTypeSelect = [],
      serviceName,
      serviceType,
      record = {},
      loading,
      dataSource = [],
      pagination,
      showModel = false,
      reqDataTypeSelect = [],
      resDataTypeSelect = [],
      isView = false,
      dependency = false,
      resourceServiceDependencies = [],
      testVisible = false,
      serviceRecord = {}
    } = this.state
    const {
      id,
      serviceName: serviceName4Add,
      serviceType: serviceType4Add,
      reqMethod = 'GET',
      serviceUrl,
      waitingTime,
      serviceParams = [defaultReqParam, defaultResParam]
    } = record
    const reqParams = serviceParams.filter(serviceParam => serviceParam.paramType === 'REQUEST')
    const resParams = serviceParams.filter(serviceParam => serviceParam.paramType === 'RESPONSE')
    const columns = [
      {
        title: '服务名称',
        dataIndex: 'serviceName',
        key: 'serviceName',
        width: '20%',
        render: (text) => {
          return <div className="text-overflow" title={text}>{text}</div>
        }
      }, {
        title: '数据分类',
        dataIndex: 'serviceType',
        key: 'serviceType',
        width: '20%',
        render: (text) => {
          const { desc = '' } = serviceTypeSelect.find(serviceType => serviceType.index === text) || {}
          return <div className="text-overflow" title={desc}>{desc}</div>
        }
      }, {
        title: 'URL地址',
        dataIndex: 'serviceUrl',
        key: 'serviceUrl',
        width: '20%',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '激活',
        dataIndex: 'activeStatus',
        key: 'activeStatus',
        width: 130,
        render: (text, record) => {
          return <Switch style={{ width: 55 }} checkedChildren="ON" unCheckedChildren="OFF"
                         checked={record.dataServiceStatus !== 'EDITING'}
                         onChange={() => this.changeActiveStatus(record)} />
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
        width: 130,
        render: (text, record) => {
          const { dataServiceStatus: status } = record
          const isEditing = status === 'EDITING'
          return isEditing ? <Fragment>
            <span className="operation-span" onClick={() => this.edit(record)}>编辑</span>
            <span className="operation-span" onClick={() => this.test(record)}>测试</span>
            <span className="operation-span" onClick={() => this.del(record)}>删除</span>
          </Fragment> : <Fragment>
            <span className="operation-span" onClick={() => this.view(record)}>查看</span>
            <span className="operation-span" onClick={() => this.test(record)}>测试</span>
          </Fragment>
        }
      }
    ]
    const dependenceIndicators = resourceServiceDependencies.filter(d => d.dependenceType === 'Factor')
    return <LayoutRight className="policy-indicators no-bread-crumb">
      <div className="region-zd">
        <Input placeholder="服务名称" value={serviceName} maxLength={'50'} onChange={this.onServiceNameChange}
               style={{ width: 200 }} />
        <Select placeholder="数据分类" style={{ width: 200 }} value={serviceType} onChange={this.onServiceTypeChange}>
          {
            serviceTypeSelect.map(serviceType => {
              const { index = '', desc = '' } = serviceType
              return <Option key={index} value={index}>{desc}</Option>
            })
          }
        </Select>
        <Button type="primary" onClick={() => {
          this.realParam = { ...this.state }
          this.getDataList(1)
        }} style={{ marginRight: '10px' }}>查询</Button>
        <Button type="default" onClick={this.onClearClick}>重置</Button>
        <div style={{ float: 'right' }}>
          <Button type="primary" onClick={this.onCreateClick}>新建</Button>
        </div>
      </div>
      <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
        <Table rowkey="ruleId" className="table-td-no-auto" columns={columns} dataSource={dataSource}
               locale={{ emptyText: '暂无数据' }} loading={loading}
               onChange={this.handleChange}
               pagination={pagination} />
      </div>
      <Modal className={'resource-service-modal'} width={1000} centered
             title={`${id ? isView ? '查看' : '编辑' : '新建'}数据服务`}
             visible={showModel}
             onCancel={this.onCancel}
             onOk={isView ? this.onCancel : this.onOk}
             maskClosable={false}>
        <Form style={{
          maxHeight: '500px',
          overflow: 'auto',
          paddingRight: '30px'
        }}>
          <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="服务名称">
            {
              getFieldDecorator('serviceName', {
                initialValue: serviceName4Add,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请输入服务名称'
                }]
              })(
                <Input placeholder="不超过50个字符" maxLength={50} disabled={isView} />
              )}
          </Form.Item>
          <div className="form-item-inline">
            <Form.Item {...lineLayout} label="数据分类">
              <Select {...getFieldProps('serviceType', {
                initialValue: serviceType4Add,
                validate: [{
                  rules: [
                    { required: true, message: '请选择数据分类' }
                  ]
                }]
              })} placeholder="数据分类" disabled={isView}>
                {
                  serviceTypeSelect.map(serviceType => {
                    const { index = '', desc = '' } = serviceType
                    return <Option key={index} value={index}>{desc}</Option>
                  })
                }
              </Select>
            </Form.Item>
            <Form.Item {...lineLayout} label="请求方式">
              <Select {...getFieldProps('reqMethod', {
                initialValue: reqMethod,
                validate: [{
                  rules: [
                    { required: true, message: '请选择请求方式' }
                  ]
                }]
              })} placeholder="请求方式" disabled={isView}>
                <Option key="GET" value="GET">GET</Option>
                <Option key="POST" value="POST">POST</Option>
              </Select>
            </Form.Item>
          </div>
          <Form.Item labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} label="URL地址">
            {
              getFieldDecorator('serviceUrl', {
                initialValue: serviceUrl,
                rules: [{
                  required: true,
                  whitespace: true,
                  message: '请输入正确的URL地址'
                }, {
                  pattern: /^http[s]?:\/\/\w+/,
                  message: '请输入正确的URL地址'
                }]
              })(
                <Input placeholder="URL地址" maxLength={255} disabled={isView} />
              )}
          </Form.Item>
          <div>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 10 }}>
              <span style={{ color: '#f5222d', fontFamily: 'SimSun', marginRight: 4 }}>*</span>
              请求参数:
            </Col>
            <Col span={20} style={{ bottom: 3, marginBottom: 15 }}>
              {
                reqParams.map((reqParam, index) => {
                  const { paramCode, paramName, dataType, require = 'TRUE' } = reqParam
                  return <Row key={index} gutter={10} style={{ marginBottom: 10 }}>
                    <Col span={8}>
                      <Input value={paramName} placeholder="参数名称" maxLength={50}
                             onChange={e => this.onParamChange({
                               type: 'REQUEST',
                               index,
                               field: 'paramName',
                               value: e.target.value
                             })} disabled={isView} />
                    </Col>
                    <Col span={8}>
                      <Input value={paramCode} placeholder="参数编码" maxLength={50}
                             onChange={e => this.onParamChange({
                               type: 'REQUEST',
                               index,
                               field: 'paramCode',
                               value: e.target.value
                             })} disabled={isView} />
                    </Col>
                    <Col span={5}>
                      <Select value={dataType} placeholder="类型"
                              onChange={e => this.onParamChange({
                                type: 'REQUEST',
                                index,
                                field: 'dataType',
                                value: e
                              })} disabled={isView}>
                        {
                          reqDataTypeSelect.map(type => {
                            const { name, index } = type
                            return (
                              <Option value={index} key={index}>{name}</Option>
                            )
                          })
                        }
                      </Select>
                    </Col>
                    <Col span={3}>
                      <Select value={require}
                              onChange={e => this.onParamChange({
                                type: 'REQUEST',
                                index,
                                field: 'require',
                                value: e
                              })} disabled={isView}>
                        <Option value="TRUE">必填</Option>
                        <Option value="FALSE">选填</Option>
                      </Select>
                    </Col>
                    {
                      !isView ? <Icon type="delete"
                                      style={{
                                        float: 'right',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        bottom: 24,
                                        right: -20
                                      }}
                                      onClick={() => {
                                        this.removeParam({ index })
                                      }} /> : null
                    }
                  </Row>
                })
              }
              {
                !isView ? <div className="layout-create" onClick={() => this.createParam()}>添加请求参数</div> : null
              }
            </Col>
          </div>
          <div>
            <Col span={4} style={{ textAlign: 'right', paddingRight: 10 }}>
              <span style={{ color: '#f5222d', fontFamily: 'SimSun', marginRight: 4 }}>*</span>
              响应参数:
            </Col>
            <Col span={20} style={{ bottom: 3 }}>
              {
                resParams.map((resParam, index) => {
                  const { paramCode, paramName, dataType } = resParam
                  return <Row key={index} gutter={10} style={{ marginBottom: 10 }}>
                    <Col span={8}>
                      <Input value={paramName} placeholder="参数名称" maxLength={50}
                             onChange={e => this.onParamChange({
                               type: 'RESPONSE',
                               index,
                               field: 'paramName',
                               value: e.target.value
                             })} disabled={isView} />
                    </Col>
                    <Col span={8}>
                      <Input value={paramCode} placeholder="参数编码" maxLength={50}
                             onChange={e => this.onParamChange({
                               type: 'RESPONSE',
                               index,
                               field: 'paramCode',
                               value: e.target.value
                             })} disabled={isView} />
                    </Col>
                    <Col span={8}>
                      <Select value={dataType} placeholder="类型"
                              onChange={e => this.onParamChange({
                                type: 'RESPONSE',
                                index,
                                field: 'dataType',
                                value: e
                              })} disabled={isView}>
                        {
                          resDataTypeSelect.map(type => {
                            const { name, index } = type
                            return (
                              <Option value={index} key={index}>{name}</Option>
                            )
                          })
                        }
                      </Select>
                    </Col>
                    {
                      !isView ? <Icon type="delete"
                                      style={{
                                        float: 'right',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        bottom: 24,
                                        right: -20
                                      }}
                                      onClick={() => {
                                        this.removeParam({ type: 'RESPONSE', index })
                                      }} /> : null
                    }
                  </Row>
                })
              }
              {
                !isView
                  ? <div className="layout-create" onClick={() => this.createParam('RESPONSE')}>添加响应参数</div> : null
              }
            </Col>
          </div>
          <div className="form-item-left">
            <Form.Item labelCol={{ span: 8 }} wrapperCol={{ span: 13 }} label="等待时长">
              {
                getFieldDecorator('waitingTime', {
                  initialValue: waitingTime,
                  rules: [{
                    required: true,
                    message: '请输入等待时长'
                  }, {
                    validator: (rules, value = '', callback) => {
                      if (value !== '' && (!(/(^[1-9]\d*$)/.test(value)) || value < 1 || value > 10000)) {
                        callback('请输入1-10000的正整数')
                      }
                      callback()
                    }
                  }]
                })(
                  <InputNumber placeholder="等待时长" maxLength={5} disabled={isView} />
                )}
            </Form.Item>
            <span className="waiting-time-suffix">ms</span>
          </div>
        </Form>
      </Modal>
      <Modal
        title=""
        wrapClassName="edit-confirm-modal"
        visible={dependency}
        maskClosable={false}
        okText="确认"
        cancelText="取消"
        onCancel={this.onDependencyCancel}
        onOk={this.onDependencyCancel}
      >
        <i className="anticon anticon-close-circle-fill" style={{
          fontSize: 20,
          color: '#ff2426',
          position: 'absolute',
          left: 18,
          top: 48
        }} />
        <span style={{
          marginTop: 20,
          display: 'inline-block',
          whiteSpace: 'pre-line',
          fontWeight: 'bold'
        }}>该数据服务正在被以下组件使用，无法进行此操作，请取消后重试。</span>
        {
          dependenceIndicators.length > 0 ? <Fragment>
            <div>指标:</div>
            <div style={{ paddingLeft: 30 }}>
              {
                dependenceIndicators.map((dependency, i) => {
                  const { dependencePath = '' } = dependency
                  return <div key={i + 1}>{i + 1}、{dependencePath}</div>
                })
              }
            </div>
          </Fragment> : null
        }
      </Modal>
      <ServiceTest visible={testVisible} record={serviceRecord}
                   onCancel={this.onTestCancel} onServiceTest={testResourceService} />
    </LayoutRight>
  }

  onDependencyCancel = () => {
    this.setState({
      dependency: false
    })
  }

  onParamChange = (options = {}) => {
    const { record = {} } = this.state
    const { serviceParams = [defaultReqParam, defaultResParam] } = record
    const {
      type,
      index,
      field,
      value
    } = options
    const params = serviceParams.filter(serviceParam => serviceParam.paramType === type)
    params[index] = { ...JSON.parse(JSON.stringify(params[index])), [field]: value }
    const typeOther = type === 'REQUEST' ? 'RESPONSE' : 'REQUEST'
    const paramsOther = serviceParams.filter(serviceParam => serviceParam.paramType === typeOther)
    // params[index][field] = value
    this.setState({
      record: { ...record, serviceParams: [...params, ...paramsOther] }
    })
  }

  createParam = (paramType = 'REQUEST') => {
    const { record = {} } = this.state
    const { serviceParams = [defaultReqParam, defaultResParam] } = record
    let data = {
      paramType,
      paramCode: undefined,
      paramName: undefined,
      dataType: undefined,
      require: 'TRUE'
    }
    this.setState({
      record: { ...record, serviceParams: [...serviceParams, data] }
    })
  }

  removeParam = (options = {}) => {
    const { record = {} } = this.state
    const { type = 'REQUEST', index } = options
    const typeOther = type === 'REQUEST' ? 'RESPONSE' : 'REQUEST'
    const { serviceParams = [defaultReqParam, defaultResParam] } = record
    const params = serviceParams.filter(serviceParam => serviceParam.paramType === type)
    const paramsOther = serviceParams.filter(serviceParam => serviceParam.paramType === typeOther)
    params.splice(index, 1)
    this.setState({
      record: { ...record, serviceParams: [...params, ...paramsOther] }
    })
  }

  getDataTypeList = async () => {
    const { promise } = await getDataTypeList()
    promise.then(res => {
      const { content = [] } = res
      this.setState({
        reqDataTypeSelect: content
      })
    }).catch(req => {
    })
  }

  getServiceResDataTypeSelect = () => {
    getServiceResDataTypeSelect().then(res => {
      const { content = [] } = res
      this.setState({
        resDataTypeSelect: content
      })
    }).catch(req => {
    })
  }

  getServiceTypeSelect = () => {
    getServiceTypeSelect().then(data => {
      const { content: serviceTypeSelect = [] } = data
      this.setState({
        serviceTypeSelect
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  onServiceNameChange = e => {
    this.setState({ serviceName: e.target.value })
  }

  onServiceTypeChange = e => {
    this.setState({ serviceType: e })
  }

  getDataList = async (pageNum = 1) => {
    const { serviceName, serviceType, pagination } = this.realParam
    const { pageSize } = pagination
    const data = {
      serviceName,
      serviceType,
      pageNum,
      pageSize
    }
    this.setState({
      loading: true
    })
    await getResourceServiceList(buildUrlParamNew(data)).then(res => {
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
      this.setState({
        // dataSource: [{
        //   id: '0',
        //   serviceName: '1',
        //   serviceType: '2',
        //   serviceUrl: '3',
        //   dataServiceStatus: 'EDITING',
        //   updatedBy: '4',
        //   updateTime: 1560995992686
        // }],
        dataSource: data,
        loading: false,
        pagination
      })
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  onClearClick = () => {
    this.setState({
      serviceName: undefined,
      serviceType: undefined
    })
  }

  onCreateClick = () => {
    this.setState({
      record: {},
      showModel: true,
      isView: false
    }, () => {
      this.props.form.resetFields()
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.getDataList(pagination.current)
    })
  }

  del = record => {
    const { id = '' } = record
    confirm({
      title: '是否确认删除?',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        deleteResourceService({ id }).then(() => {
          const { pagination: { current } = {} } = this.realParam
          this.getDataList(current)
        }).catch((data) => {
          notification.warn(data.content)
        })
      }
    })
  }

  changeActiveStatus = record => {
    const { id = '', dataServiceStatus } = record
    if (dataServiceStatus !== 'EDITING') { // 取消激活依赖校验
      getResourceServiceDependencies(id).then(data => {
        const { content: resourceServiceDependencies = [] } = data
        if (resourceServiceDependencies.length > 0) {
          this.setState({
            dependency: true,
            resourceServiceDependencies
          })
        } else {
          this.activeResourceService(id)
        }
      }).catch((data) => {
        notification.warn(data.content)
      })
    } else {
      this.activeResourceService(id)
    }
  }

  activeResourceService = id => {
    activeResourceService({ id }).then(() => {
      const { pagination: { current } = {} } = this.realParam
      this.getDataList(current)
    }).catch((data) => {
      notification.warn(data.content)
    })
  }

  onOk = () => {
    this.props.form.validateFields(async (errors, values) => {
      const {
        serviceName,
        serviceType,
        reqMethod,
        serviceUrl,
        waitingTime
      } = values
      const { record: { id = '', serviceParams = [defaultReqParam, defaultResParam] } = {} } = this.state
      const reqParams = serviceParams.filter(serviceParam => serviceParam.paramType === 'REQUEST')
      const resParams = serviceParams.filter(serviceParam => serviceParam.paramType === 'RESPONSE')
      const reqParamsEmpty = reqParams.length === 0 || reqParams.findIndex(param => {
        const { paramCode, paramName, dataType } = param
        return !(paramCode && paramName && dataType)
      }) !== -1
      const resParamsEmpty = resParams.length === 0 || resParams.findIndex(param => {
        const { paramCode, paramName, dataType } = param
        return !(paramCode && paramName && dataType)
      }) !== -1
      if (errors) {
        return
      }
      if (reqParamsEmpty || resParamsEmpty) {
        notification.warning({ message: '请将请求参数和响应参数填写完整' })
        return
      }
      let saveFun = createServiceParam
      let data = {
        serviceName,
        serviceType,
        reqMethod,
        serviceUrl,
        serviceParams,
        waitingTime
      }
      if (id) {
        saveFun = updateServiceParam
        data = {
          ...data,
          id
        }
      }
      saveFun(data).then(() => {
        this.onCancel()
        this.getDataList()
      }).catch((data) => {
        const { content = {} } = data
        notification.warn(content)
      })
    })
  }

  onCancel = () => {
    this.setState({
      showModel: false,
      indicatorsInfo: undefined
    }, () => {
      this.props.form.resetFields()
    })
  }

  view = data => {
    this.edit(data, true)
  }

  edit = (data, isView = false) => {
    this.setState({
      showModel: true,
      record: data,
      isView
    })
  }

  test = data => {
    this.setState({
      testVisible: true,
      serviceRecord: data
    })
  }

  onTestCancel = () => {
    this.setState({
      testVisible: false
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(ResourceService))
