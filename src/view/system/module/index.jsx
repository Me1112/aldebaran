import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Input, Table, Form, Modal, notification, Button, Select, Row, Icon } from 'antd'
import classnames from 'classnames'
import {
  getModuleList,
  deleteModule,
  updateModule,
  insertModule
} from '../../../action/system'
import { Map } from 'immutable'
import { SUCCESS } from '../../../common/constant'
import './index.less'
import LayoutRight from '../../../component/layout_right'

const { Option } = Select
const { Item: FormItem } = Form
const confirm = Modal.confirm

function mapStateToProps(state) {
  const { system = Map({}) } = state
  const { moduleContent = {} } = system.toJS()
  return { moduleContent }
}

function mapDispatchToProps(dispatch) {
  return {
    getModuleList: bindActionCreators(getModuleList, dispatch),
    updateModule: bindActionCreators(updateModule, dispatch),
    insertModule: bindActionCreators(insertModule, dispatch),
    deleteModule: bindActionCreators(deleteModule, dispatch)
  }
}

class ModuleList extends Component {
  state = {
    id: -1,
    moduleNameVal: '',
    record: {},
    editConfirmShow: false,
    loading: false,
    moduleInfo: {},
    moduleSaveError: '',
    interfaceList: [],
    emptyKeys: []
  }

  static propTypes = {
    form: PropTypes.any,
    getModuleList: PropTypes.func.isRequired,
    deleteModule: PropTypes.func.isRequired,
    insertModule: PropTypes.func.isRequired,
    updateModule: PropTypes.func.isRequired,
    moduleContent: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.onModuleQuery()
  }

  render() {
    const {
      id, editConfirmShow, loading, moduleInfo,
      moduleSaveError, interfaceList, emptyKeys
    } = this.state
    let {
      level = undefined,
      moduleName = '',
      parentModuleId = undefined,
      moduleValue
    } = moduleInfo
    if (level === undefined) {
      level = !parentModuleId ? id === -1 ? '1' : '0' : '1'
    }
    const { moduleContent } = this.props
    const dataSource = moduleContent.result || []
    dataSource.forEach((s, index) => {
      const { module_id: moduleId } = s
      s.key = moduleId
      dataSource[index] = s
    })
    const pModuleSelect = dataSource.filter(module => {
      return module.level === 0
    })
    let { module_id: defaultModuleId = undefined } = pModuleSelect[0] || {}
    if (defaultModuleId !== undefined) {
      defaultModuleId = defaultModuleId.toString()
    }
    const columns = [
      {
        title: '菜单ID',
        dataIndex: 'module_id',
        key: 'module_id'
      }, {
        title: '菜单名',
        dataIndex: 'module_name',
        key: 'module_name'
      }, {
        title: '父级菜单名',
        dataIndex: 'parent_module_name',
        key: 'parent_module_name'
      }, {
        title: '父级菜单ID',
        dataIndex: 'parent_module_id',
        key: 'parent_module_id'
      }, {
        title: '菜单层级',
        dataIndex: 'level',
        key: 'level'
      }, {
        title: '菜单地址',
        dataIndex: 'module_value',
        key: 'module_value'
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 100,
        render: (text, record) => {
          return <Fragment>
            <span className="operation-span" onClick={() => {
              this.onEditIconClick(record)
            }}>编辑</span>
            <span className="operation-span" onClick={() => {
              this.onDeleteIconClick(record)
            }}>删除</span>
          </Fragment>
        }
      }]

    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 }
    }

    return (
      <LayoutRight breadCrumb={['系统管理', '菜单管理']}>
        <div className="region-zd">
          <Input placeholder="菜单名" style={{ width: 200 }}
                 onChange={this.moduleNameChange} />
          <Button type="primary" onClick={() => {
            this.onModuleQuery()
          }}>查询</Button>
          <Button type="primary" style={{ float: 'right' }}
                  onClick={this.onCreateBtnClick}>新建</Button>
        </div>
        <div style={{ height: 'calc(100% - 120px)', overflowY: 'scroll' }}>
          <Table rowkey="ruleId" columns={columns} dataSource={dataSource}
                 locale={{ emptyText: '暂无数据' }}
                 pagination={{
                   showTotal: (total) => {
                     return `共 ${total} 条`
                   },
                   showSizeChanger: true
                 }} />
        </div>
        <Modal
          title={moduleName.length > 0 ? '编辑菜单' : '新建菜单'}
          wrapClassName="edit-confirm-modal"
          width={700}
          visible={editConfirmShow}
          confirmLoading={loading}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.onEditCancel}
          onOk={this.onModuleSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="菜单名称">
              <Input {...getFieldProps('moduleName', {
                initialValue: moduleName,
                validate: [{
                  rules: [
                    { required: true, whitespace: true, message: '请填写菜单名称' }
                  ]
                }]
              })} placeholder="请填写菜单名称" maxLength="50" />
            </FormItem>
            <FormItem {...formItemLayout} label="菜单层级">
              <Select {...getFieldProps('level', {
                initialValue: level === undefined ? '1' : level,
                validate: [{
                  rules: [
                    { required: true, message: '请选择菜单层级' }
                  ]
                }],
                onChange: this.levelChange
              })} placeholder="请选择菜单层级">
                <Option key="1" value="1">二级菜单</Option>
                <Option key="0" value="0">一级菜单</Option>
              </Select>
            </FormItem>
            {
              level === '1'
                ? <FormItem {...formItemLayout} label="父级菜单">
                  <Select {...getFieldProps('parentModuleId', {
                    initialValue: parentModuleId === undefined ? defaultModuleId : parentModuleId,
                    validate: [{
                      rules: [
                        { required: true, message: '请选择父级菜单' }
                      ]
                    }]
                  })} placeholder="请选择父级菜单">
                    {
                      pModuleSelect.map(module => {
                        const { module_name: moduleName, module_id: moduleId } = module
                        return (
                          <Option key={moduleId} value={moduleId.toString()}>{moduleName}</Option>
                        )
                      })
                    }
                  </Select>
                </FormItem>
                : null
            }
            <FormItem {...formItemLayout} label="菜单地址">
              <Input.TextArea {...getFieldProps('moduleValue', {
                initialValue: moduleValue,
                validate: [{
                  rules: [
                    { required: true, message: '请填写服务地址,最多500字符' }
                  ]
                }]
              })} rows={4} placeholder="请填写服务地址,最多500字符" maxLength="500" />
            </FormItem>
            {
              level === '1'
                ? <Fragment>
                  <FormItem {...formItemLayout} label="功能列表">
                    <div className="module-content-container">
                      <table className="table table-bordered service-pz">
                        <thead>
                        <tr>
                          <th>功能类型</th>
                          <th>功能编号</th>
                          <th>功能名</th>
                          <th>功能URL</th>
                          <th className="ico-wrap" width="20px">
                            <Icon type="plus-circle" className="ml10" onClick={this.addInterface} />
                          </th>
                        </tr>
                        </thead>
                        <tbody className="params-in">
                        {
                          interfaceList.map((list, index) => {
                            const { key, actionId = '', actionType = '', actionCode = '', actionName = '', actionValue = '' } = list
                            return <tr className="item" key={key || actionId}>
                              <td>
                                <Select {...getFieldProps(`interfaceList[${key}][actionType]`, {
                                  initialValue: actionType,
                                  onChange: (value) => this.changeInterfaceListRecord(value, 'actionType', index)
                                })} placeholder="请选择数据类型">
                                  <Option key="insert" value="insert">新建</Option>
                                  <Option key="delete" value="delete">删除</Option>
                                  <Option key="update" value="update">编辑</Option>
                                  <Option key="select" value="select">查询</Option>
                                  <Option key="other" value="other">其他</Option>
                                </Select>
                              </td>
                              <td>
                                <Input maxLength="50"
                                       className={classnames({ 'has-error': emptyKeys.indexOf(`interfaceList[${key}][actionCode]`) !== -1 })} {...getFieldProps(`interfaceList[${key}][actionCode]`, {
                                  initialValue: actionCode,
                                  onChange: (e) => this.changeInterfaceListRecord(e.target.value, 'actionCode', index)
                                })} placeholder="" />
                              </td>
                              <td>
                                <Input maxLength="50"
                                       className={classnames({ 'has-error': emptyKeys.indexOf(`interfaceList[${key}][actionCode]`) !== -1 })} {...getFieldProps(`interfaceList[${key}][actionName]`, {
                                  initialValue: actionName,
                                  onChange: (e) => this.changeInterfaceListRecord(e.target.value, 'actionName', index)
                                })} placeholder="" />
                              </td>
                              <td>
                                <Input maxLength="200"
                                       className={classnames({ 'has-error': emptyKeys.indexOf(`interfaceList[${key}][actionCode]`) !== -1 })} {...getFieldProps(`interfaceList[${key}][actionValue]`, {
                                  initialValue: actionValue,
                                  onChange: (e) => this.changeInterfaceListRecord(e.target.value, 'actionValue', index)
                                })} placeholder="" />
                              </td>
                              <td className="ico-wrap" width="20px">
                                <Icon type="minus-circle" className="ml10"
                                      onClick={() => this.removeInterface(index)} />
                              </td>
                            </tr>
                          })
                        }
                        </tbody>
                      </table>
                    </div>
                  </FormItem>
                  <Row className="save-error">{moduleSaveError}</Row>
                </Fragment>
                : null
            }
          </Form>
        </Modal>
      </LayoutRight>
    )
  }

  levelChange = (v) => {
    const { moduleInfo = {} } = this.state
    moduleInfo['level'] = v
    this.setState({ moduleInfo })
  }

  buildInterfaceList(data = {}) {
    let interfaceObj = {
      'key': `${Math.random()}`.replace('0.', ''),
      'actionType': 'insert',
      'actionCode': '',
      'actionName': '',
      'actionValue': '',
      'actionId': ''
    }
    interfaceObj = { ...interfaceObj, ...data }
    return interfaceObj
  }

  changeInterfaceListRecord = (value, fieldname, index) => {
    let { interfaceList = [] } = this.state
    let interfaceObj = interfaceList[index]
    interfaceObj[fieldname] = value
    interfaceList[index] = interfaceObj
    this.setState({ interfaceList })
  }

  addInterface = () => {
    let { interfaceList = [] } = this.state
    interfaceList.push(this.buildInterfaceList())
    this.setState({ interfaceList })
  }

  removeInterface = (index) => {
    let { interfaceList = [] } = this.state
    interfaceList.splice(index, 1)
    this.setState({ interfaceList })
  }

  onModuleQuery = () => {
    const { moduleName } = this.state
    this.props.getModuleList({
      moduleName
    })
  }

  moduleNameChange = (e) => {
    this.setState({
      moduleName: e.target.value
    })
  }

  onEditIconClick = (record) => {
    let {
      module_id: moduleId, module_name: moduleName, module_value: moduleValue,
      parent_module_id: parentModuleId = undefined, interfaceList = []
    } = record
    if (parentModuleId) {
      parentModuleId = parentModuleId.toString()
    }
    const interfaceLists = interfaceList.map(list => {
      return this.buildInterfaceList(list)
    })
    this.setState({
      editConfirmShow: true,
      id: moduleId,
      interfaceList: interfaceLists,
      moduleInfo: {
        moduleId, moduleName, moduleValue, parentModuleId
      },
      moduleSaveError: ''
    }, () => {
      this.props.form.resetFields()
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
        this.onModuleDelete()
      }
    })
    this.setState({
      // deleteConfirmShow: true,
      record
    })
  }

  onModuleDelete = async () => {
    const { module_id: moduleId } = this.state.record
    const { promise } = await this.props.deleteModule({ moduleId })
    promise.then((data) => {
      const { actionStatus = '' } = data
      if (actionStatus === SUCCESS) {
        this.setState({
          deleteConfirmShow: false
        }, () => {
          this.onModuleQuery()
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onCreateBtnClick = () => {
    this.setState({
      id: -1,
      editConfirmShow: true,
      interfaceList: [],
      moduleInfo: {},
      moduleSaveError: ''
    }, () => {
      this.props.form.resetFields()
    })
  }

  onEditCancel = () => {
    this.setState({
      editConfirmShow: false,
      moduleInfo: {},
      enumShow: false,
      enumList: [{ key: '', value: '' }]
    }, () => {
      this.props.form.resetFields()
    })
  }

  onModuleSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      console.log('onModuleSave======>', this.state.interfaceList, values, errors)
      const { id, interfaceList } = this.state
      const { level } = values
      let emptyKeys = []
      console.log(id, interfaceList)
      const interfaceLen = interfaceList.length
      let recordAll = true
      let interfaceListArray = []
      if (level === '1') {
        for (let i = 0; i < interfaceLen; i++) {
          const interfaceObj = interfaceList[i] || {}
          const { actionId, key, moduleValue, ...other } = interfaceObj
          for (let k in other) {
            if (other[k].toString().trim().length === 0) {
              emptyKeys.push(`interfaceList[${key}][${k}]`)
              recordAll = false
            }
          }
          interfaceListArray.push({ actionId, ...other })
        }
      }
      console.log('interfaceListArray', interfaceListArray)
      if (!recordAll) {
        this.setState({ emptyKeys, moduleSaveError: '请完善所有功能列表内容' })
      }
      if (errors || !recordAll) {
        return
      }
      try {
        this.setState({ emptyKeys: [], moduleSaveError: '', loading: true }, async () => {
          const { interfaceList: il, level, ...other } = values
          let data = { moduleId: id, ...other, interfaceList: JSON.stringify(interfaceListArray) }
          if (level === '0') {
            data['parentModuleId'] = null
          }
          const { promise } = await (id !== -1 ? this.props.updateModule(data) : this.props.insertModule(data))
          promise.then((data) => {
            this.setState({ editConfirmShow: false, loading: false, conditionInfo: {} }, () => {
              this.props.form.resetFields()
              this.onModuleQuery()
            })
          }).catch((data) => {
            const { content = {} } = data
            this.setState({ loading: false }, () => {
              notification.warn(content)
            })
          })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(ModuleList))
