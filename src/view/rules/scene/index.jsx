import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Input, Table, Modal, Form, Row, notification, Select, Tabs } from 'antd'
import { fromJS, is, Map } from 'immutable'
import {
  getSceneList,
  saveScene,
  updateScene,
  deleteScene,
  getBusinessListNoNormal,
  getScenarioDependencies
} from '../../../action/rule'
import { getUserInfo } from '../../../util'
import {
  TYPE_SYSTEM,
  TYPE_CUSTOM,
  TYPE_SYSTEM_VALUE,
  TYPE_CUSTOM_VALUE
} from '../../../common/constant'
import LayoutRight from '../../../component/layout_right'

const { TabPane } = Tabs
const { Item: FormItem } = Form
const confirm = Modal.confirm
const Option = Select.Option

class RuleScene extends Component {
  state = {
    sceneType: TYPE_SYSTEM,
    sceneList: [],
    id: '',
    searchName: '',
    sceneInfo: {},
    tabChanged: true,
    loading: false,
    delConfirm: false,
    windowVisible: false,
    delNoticeVisible: false,
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    },
    sceneSaveError: ''
  }

  static propTypes = {
    form: PropTypes.any,
    sceneList: PropTypes.array,
    getSceneList: PropTypes.func.isRequired,
    getBusinessListNoNormal: PropTypes.func.isRequired,
    businessLine: PropTypes.any.isRequired,
    saveScene: PropTypes.func.isRequired,
    deleteScene: PropTypes.func.isRequired,
    updateScene: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.object
  }

  componentDidMount() {
    this.doSearch()
    this.props.getBusinessListNoNormal()
  }

  componentWillReceiveProps(nextProps) {
    const { sceneList = [] } = this.props
    const same = is(fromJS(nextProps.sceneList), fromJS(this.props.sceneList))
    if (!same || (same && sceneList.length > 0)) {
      const { sceneList = [] } = nextProps
      this.setState({ sceneList, tabChanged: false })
    }
  }

  render() {
    const { getFieldProps } = this.props.form
    const { companyId = '' } = getUserInfo()
    const {
      sceneType, pagination, loading, windowVisible, delNoticeVisible,
      sceneList, sceneInfo, ruleSetData = [], decisionTreeData = [], sceneSaveError, searchName = '', selectBusinessId,
      dependency = false, dimensionDependencies = []
    } = this.state
    const dependenceFactors = dimensionDependencies.filter(d => d.dependenceType === 'Factor')
    const dependenceExternalAccesses = dimensionDependencies.filter(d => d.dependenceType === 'ExternalAccess')

    const { id = -1, scenarioName = '', scenarioValue = '', description = '', cantChangeValue = false, businessLineId } = sceneInfo

    const columns = [{
      title: '编号',
      dataIndex: 'scenarioDicId',
      key: 'scenarioDicId',
      width: 50
    }, {
      title: '业务条线',
      dataIndex: 'businessLineName',
      key: 'businessLineName',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '场景名称',
      dataIndex: 'scenarioName',
      key: 'scenarioName',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '场景值',
      dataIndex: 'scenarioValue',
      key: 'scenarioValue',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '详细描述',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => {
        return (<div className="text-overflow" title={text}>{text}</div>)
      }
    }, {
      title: '操作',
      key: 'operation',
      width: 100,
      render: (text, record) => {
        return <Fragment>
            <span className="operation-span" onClick={() => {
              this.onSceneEdit(record)
            }}>编辑</span>
          <span className="operation-span" onClick={() => {
            this.showDelNotice(record)
          }}>删除</span>
        </Fragment>
      }
    }]
    if (sceneType === TYPE_SYSTEM) {
      columns.pop()
    }

    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 }
    }

    const ruleSetColumns = [
      {
        title: '规则集编号',
        dataIndex: 'ruleSetID',
        key: 'ruleSetID'
      }, {
        title: '规则集名称',
        dataIndex: 'ruleSetName',
        key: 'ruleSetName',
        render: (text) => {
          return <div className="text-wrap">{text}</div>
        }
      }
    ]
    const decisionTreeColumns = [
      {
        title: '策略编号',
        dataIndex: 'decisionID',
        key: 'decisionID'
      }, {
        title: '策略名称',
        dataIndex: 'decisionName',
        key: 'decisionName',
        render: (text) => {
          return <div className="text-wrap">{text}</div>
        }
      }
    ]

    return (
      <LayoutRight className="no-bread-crumb" type={'tabs'}>
        <Tabs type="card" defaultActiveKey={TYPE_SYSTEM} className={'tabs-no-border scorecard-new'}
              onChange={this.onSwitchType}>
          <TabPane tab="系统默认" key={TYPE_SYSTEM}>
            <div className="region-zd">
              <Input placeholder="场景名称" value={searchName} style={{ width: 200 }} onChange={this.onInputFilter} />
              <Select placeholder="业务条线" style={{ width: 200 }} value={selectBusinessId} onChange={this.selectBusiness}>
                {
                  this.props.businessLine.map(item => {
                    return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
                  })
                }
              </Select>
              <Button type="primary" onClick={this.filterData}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
            </div>
            {
              sceneType === TYPE_SYSTEM && companyId && companyId !== ''
                ? null : <div style={{ float: 'right' }}>
                  <Button type="primary" onClick={this.showWindow}>新建</Button>
                </div>
            }
            <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
              <Table className="table-layout-fixed" columns={columns} locale={{ emptyText: '暂无数据' }}
                     pagination={pagination} dataSource={sceneList}
                     onChange={this.handleChange} />
            </div>
          </TabPane>
          <TabPane tab="自定义" key={TYPE_CUSTOM}>
            <div className="region-zd">
              <Input placeholder="场景名称" value={searchName} style={{ width: 200 }} onChange={this.onInputFilter} />
              <Select placeholder="业务条线" style={{ width: 200 }} value={selectBusinessId} onChange={this.selectBusiness}>
                {
                  this.props.businessLine.map(item => {
                    return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
                  })
                }
              </Select>
              <Button type="primary" onClick={this.filterData}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
              {
                sceneType === TYPE_SYSTEM && companyId && companyId !== ''
                  ? null : <div style={{ float: 'right' }}>
                    <Button type="primary" onClick={this.showWindow}>新建</Button>
                  </div>
              }
            </div>
            <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
              <Table className="table-layout-fixed" columns={columns} locale={{ emptyText: '暂无数据' }}
                     pagination={pagination} dataSource={sceneList}
                     onChange={this.handleChange} />
            </div>
          </TabPane>
        </Tabs>
        <Modal
          title={`${id === -1 ? '新建' : '编辑'}${sceneType === TYPE_SYSTEM ? '系统默认' : '自定义'}场景`}
          wrapClassName="edit-confirm-modal"
          visible={windowVisible}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.closeWindow}
          onOk={this.onSceneSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="场景名称">
              <Input {...getFieldProps('scenarioName', {
                initialValue: scenarioName,
                validate: [{
                  rules: [
                    { required: true, whitespace: true, message: '最多50个字符' }
                  ]
                }]
              })} placeholder="最多50个字符" maxLength="50" />
            </FormItem>
            <FormItem {...formItemLayout} label="场景值">
              <Input disabled={cantChangeValue} {...getFieldProps('scenarioValue', {
                initialValue: scenarioValue,
                validate: [{
                  rules: [
                    { required: true, pattern: /^[0-9a-zA-Z_]+$/, message: '字母数字下划线, 最多50个字符' }
                  ]
                }]
              })} placeholder="字母数字下划线, 最多50个字符" maxLength="50" />
            </FormItem>
            <FormItem {...formItemLayout} label="业务条线">
              <Select disabled={cantChangeValue || id !== -1} {...getFieldProps('businessLineId', {
                initialValue: businessLineId,
                validate: [{
                  rules: [
                    { required: true, message: '请选择业务条线' }
                  ]
                }]
              })} placeholder="请选择">
                {
                  this.props.businessLine.map(item => {
                    return <Option key={item.lineId} value={item.lineId}>{item.lineName}</Option>
                  })
                }
              </Select>
            </FormItem>
            <Row className="save-error text-overflow" title={sceneSaveError}>{sceneSaveError}</Row>
            <FormItem {...formItemLayout} label="描述">
              <Input.TextArea {...getFieldProps('description', {
                initialValue: description
              })} rows={4} placeholder="最多200个字符"
                              maxLength="200" />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title="请修改以下规则集后再删除场景"
          wrapClassName="edit-confirm-modal"
          visible={delNoticeVisible}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.closeDelNoticeWindow}
          onOk={this.closeDelNoticeWindow}
        >
          {ruleSetData.length > 0
            ? <Table className="table-layout-fixed" bordered
                     dataSource={ruleSetData} columns={ruleSetColumns} pagination={false} />
            : null}
          {
            decisionTreeData.length > 0
              ? <Table style={{ marginTop: 20 }} className="table-layout-fixed" bordered
                       dataSource={decisionTreeData} columns={decisionTreeColumns} pagination={false} />
              : null
          }
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
          }}>该场景正在被以下对象使用，无法删除/编辑，请取消使用后重试。</span>
          {
            dependenceFactors.length > 0 ? <Fragment>
              <div>指标:</div>
              <div style={{ paddingLeft: 30 }}>
                {
                  dependenceFactors.map((d, i) => {
                    const { dependencePath = '' } = d
                    return <div>{i + 1}、{dependencePath}</div>
                  })
                }
              </div>
            </Fragment> : null
          }
          {
            dependenceExternalAccesses.length > 0 ? <Fragment>
              <div>外部接入:</div>
              <div style={{ paddingLeft: 30 }}>
                {
                  dependenceExternalAccesses.map((d, i) => {
                    const { dependencePath = '' } = d
                    return <div>{i + 1}、{dependencePath}</div>
                  })
                }
              </div>
            </Fragment> : null
          }
        </Modal>
      </LayoutRight>
    )
  }

  selectBusiness = e => {
    this.setState({ selectBusinessId: e })
  }

  showDelNotice = (sceneInfo) => {
    const { scenarioDicId: id } = sceneInfo
    getScenarioDependencies(id).then(data => {
      const { content: dimensionDependencies = [] } = data
      if (dimensionDependencies.length > 0) {
        this.setState({
          dependency: true,
          dimensionDependencies
        })
      } else {
        confirm({
          title: '是否确认删除?',
          content: '',
          okText: '确定',
          okType: 'primary',
          cancelText: '取消',
          onOk: async () => {
            this.onSceneDelete()
          }
        })
        this.setState({ sceneInfo: { id } })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  showWindow = () => {
    this.setState({ windowVisible: true, sceneInfo: {} }, () => {
      this.props.form.setFields({
        scenarioName: {}
      })
    })
  }

  closeDelNoticeWindow = () => {
    this.setState({ delNoticeVisible: false, sceneInfo: {} })
  }

  closeWindow = () => {
    this.setState({ windowVisible: false, sceneInfo: {}, sceneSaveError: '' }, () => {
      this.props.form.resetFields()
    })
  }

  onDependencyCancel = () => {
    this.setState({
      dependency: false
    })
  }

  onSceneEdit = sceneInfo => {
    try {
      const { scenarioDicId: id, scenarioName, scenarioValue, description, businessLineId } = sceneInfo
      getScenarioDependencies(id).then(data => {
        const { content: dimensionDependencies = [] } = data
        if (dimensionDependencies.length > 0) {
          this.setState({
            dependency: true,
            dimensionDependencies
          })
        } else {
          this.setState({
            windowVisible: true,
            sceneInfo: { id, scenarioName, scenarioValue, description, businessLineId }
          }, () => {
            this.props.form.resetFields()
            this.props.form.validateFields()
          })
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warning(content)
      })
    } catch (err) {
    }
  }

  onSceneDelete = () => {
    const { id = 0 } = this.state.sceneInfo
    if (id > 0) {
      try {
        this.setState({ delConfirm: false, sceneInfo: {} }, async () => {
          const { promise } = await this.props.deleteScene({ id })
          promise.then((data) => {
            this.doSearch()
          }).catch((data) => {
            const { content = {} } = data
            notification.warn(content)
          })
        })
      } catch (err) {
        this.setState({ delConfirm: false, sceneInfo: {} })
      }
    }
  }

  onSceneSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      try {
        this.setState({ loading: true })
        const { id = '' } = this.state.sceneInfo
        const { scenarioName = '', scenarioValue = '', description = '', businessLineId = '' } = this.props.form.getFieldsValue()
        const { promise } = await (id > 0 ? this.props.updateScene({
          id,
          scenarioName,
          scenarioValue,
          businessLineId,
          desc: description
        }) : this.props.saveScene({ scenarioName, scenarioValue, description, businessLineId }))
        promise.then((data) => {
          this.setState({ windowVisible: false, loading: false, sceneSaveError: '' }, () => {
            this.props.form.resetFields()
            this.doSearch()
          })
        }).catch((data) => {
          const { content = {} } = data
          const { message = '' } = content
          this.setState({ loading: false, sceneSaveError: message })
          // this.props.form.setFields({
          //   scenarioValue: {
          //     errors: [{
          //       message
          //     }]
          //   }
          // })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.doSearch(pagination.current)
    })
  }

  doSearch(offset = 0) {
    const { sceneType, searchName: name, selectBusinessId } = this.state
    let queryType = TYPE_SYSTEM_VALUE
    if (sceneType === TYPE_CUSTOM) {
      queryType = TYPE_CUSTOM_VALUE
    }
    if (offset === 0) {
      this.props.getSceneList({ queryType, name, businessLineId: selectBusinessId })
    }
  }

  onInputFilter = (e) => {
    this.setState({ searchName: e.target.value })
  }

  filterData = () => {
    this.doSearch()
  }

  onClearClick = () => {
    this.setState({
      searchName: '',
      selectBusinessId: undefined
    })
  }

  onSwitchType = (type) => {
    const { sceneType, pagination } = this.state
    // && !tabChanged
    if (type !== sceneType) {
      pagination.current = 0
      this.setState({
        tabChanged: true,
        sceneType: type,
        pagination,
        searchName: '',
        selectBusinessId: undefined
      }, () => {
        this.doSearch()
      })
    }
  }
}

function mapStateToProps(state) {
  const { rule = Map({}) } = state
  const { sceneList = [], businessLine = [] } = rule.toJS()
  return { sceneList, businessLine }
}

function mapDispatchToProps(dispatch) {
  return {
    getSceneList: bindActionCreators(getSceneList, dispatch),
    saveScene: bindActionCreators(saveScene, dispatch),
    deleteScene: bindActionCreators(deleteScene, dispatch),
    getBusinessListNoNormal: bindActionCreators(getBusinessListNoNormal, dispatch),
    updateScene: bindActionCreators(updateScene, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(RuleScene))
