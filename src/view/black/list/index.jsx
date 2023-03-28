import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Input, Table, Select, Modal, Form, notification, Popconfirm } from 'antd'
import {
  TYPE_NAME_LIST,
  TYPE_NAME_VALUE
} from '../../../common/constant'
import {
  getNameList,
  getNameSelect,
  deleteName,
  saveName,
  updateName,
  getNameDependencies,
  getNameDataList,
  saveDataName,
  deleteDataName,
  updateDataStatus,
  uploadDataName
} from '../../../action/black'
import {
  getBlackListTypeList,
  getBlackListSourceList,
  getEffectiveTermList
} from '../../../action/common'
import { getDimensionList } from '../../../action/policy'
import { buildUrlParamNew, formatDate } from '../../../util/index'
import LayoutRight from '../../../component/layout_right'
import classnames from 'classnames'
import './index.less'

const { Option } = Select
const { Item: FormItem } = Form
const confirm = Modal.confirm

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

class BlackList extends Component {
  state = {
    record: {},
    deleteConfirmShow: false,
    editConfirmShow: false,
    importConfirmShow: false,
    file: {},
    filePath: '',
    uploadDisabled: true,
    page: 1,
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    },
    paginationData: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }

  static propTypes = {
    form: PropTypes.any,
    history: PropTypes.object.isRequired
  }

  componentDidMount() {
    this.getDimensionTypeList()
    this.getBlackListTypeList()
    this.getBlackListSourceList()
    this.getEffectiveTermList()
    this.realParam = { ...this.state }
    this.getNameList()
  }

  render() {
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }

    const {
      dimensionTypeList = [],
      blackListTypeList = [],
      blackListSourceList = [],
      effectiveTermList = [],
      loading = false,
      record = {},
      filePath,
      uploadDisabled,
      nameTypeTab = TYPE_NAME_LIST,
      name = '',
      nameSelect = [],
      nameSelect4New = [],
      nameList = [],
      nameListIdState = '',
      dataValue = '',
      dataStatus = '',
      nameDataList = [],
      effectiveTerm = 'HALF_HOUR',
      dependency = false,
      nameDependencies = [],
      uploadLoading = false
    } = this.state

    const {
      id: nameListId = '',
      listName = '',
      listType = '',
      dimensionalityId = '',
      blacklistSource = ''
    } = record

    const columns = [
      {
        title: '',
        dataIndex: 'blacklistSource',
        key: 'blacklistSource',
        width: 50,
        render: text => {
          switch (text) {
            case 'CUSTOM':
              text = '自定义'
              break
            case 'SYSTEM':
              text = '系统'
              break
          }
          return text
        }
      }, {
        title: '名单名称',
        dataIndex: 'listName',
        key: 'listName',
        width: '25%',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '名单类型',
        dataIndex: 'listType',
        key: 'listType',
        width: '15%',
        render: text => {
          const nameType = blackListTypeList.find(nameType => nameType.name === text) || {}
          const { value = '' } = nameType
          return value
        }
      }, {
        title: '名单维度',
        dataIndex: 'dimensionalityName',
        key: 'dimensionalityName',
        width: '15%',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '更新人',
        dataIndex: 'updateUserName',
        key: 'updateUserName',
        width: '10%',
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 180,
        render: (text, record) => {
          return formatDate(record.updateTime)
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 130,
        render: (text, record) => {
          const { blacklistSource } = record
          return blacklistSource === 'SYSTEM'
            ? <span className="operation-span" onClick={() => this.toNameData(record)}>名单值</span>
            : <Fragment>
              <span className="operation-span" onClick={() => this.newOrEditName(record)}>编辑</span>
              <span className="operation-span" onClick={() => this.del(record)}>删除</span>
              <span className="operation-span" onClick={() => this.toNameData(record)}>名单值</span>
            </Fragment>
        }
      } ]

    const columnsData = [
      {
        title: '名单名称',
        dataIndex: 'blacklistName',
        key: 'blacklistName'
      }, {
        title: '名单值',
        dataIndex: 'listData',
        key: 'listData'
      }, {
        title: '来源',
        dataIndex: 'blacklistDataSource',
        key: 'blacklistDataSource',
        render: text => {
          const source = blackListSourceList.find(source => source.name === text) || {}
          const { value = '' } = source
          return value
        }
      }, {
        title: '更新人',
        dataIndex: 'updateUserName',
        key: 'updateUserName'
      }, {
        title: '生效时间',
        dataIndex: 'effectTime',
        key: 'effectTime',
        render: (text, record) => {
          return formatDate(record.effectTime)
        }
      }, {
        title: '失效时间',
        dataIndex: 'expiredTime',
        key: 'expiredTime',
        render: (text, record) => {
          return formatDate(record.expiredTime)
        }
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 100,
        render: (text, record) => {
          const { status = '', blacklistDataSource } = record
          const effected = status === 'effective'
          return <div style={{ float: 'right' }}>
            {
              blacklistDataSource === 'KNOWLEDGE' ? null
                : !effected ? <Popconfirm overlayClassName="effect-pop" placement="bottom" icon={null} title={
                    <Fragment>
                      有效期
                      <Select value={effectiveTerm} placeholder="请选择有效期" style={{ width: 100, marginLeft: 10 }}
                              onChange={this.onEffectiveTermChange}>
                        {
                          effectiveTermList.map(effectiveTerm => {
                            const { name = '', desc = '' } = effectiveTerm
                            return <Option key={name} value={name}>{desc}</Option>
                          })
                        }
                      </Select>
                    </Fragment>
                  } onConfirm={() => this.effectOrEmpire(record, true, effectiveTerm)} okText="确定" cancelText="取消">
                  <span onClick={() => this.setState({ effectiveTerm: 'HALF_HOUR' })}
                        className="wa-primary-color" style={{ cursor: 'pointer' }}>生效</span>
                  </Popconfirm>
                  : <span onClick={() => this.effectOrEmpire(record, false)}
                          style={{ color: '#ff2426', cursor: 'pointer' }}>失效</span>
            }
            <span style={{ marginLeft: 10, cursor: 'pointer' }} className="wa-primary-color"
                  onClick={() => this.delData(record)}>删除</span>
          </div>
        }
      } ]

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-tab">
          <Button className={classnames({ 'ant-btn-primary': nameTypeTab === TYPE_NAME_LIST })}
                  onClick={() => this.onNameTypeChange(TYPE_NAME_LIST)}>名单列表</Button>
          <Button className={classnames({ 'ant-btn-primary': nameTypeTab === TYPE_NAME_VALUE })}
                  onClick={() => this.onNameTypeChange(TYPE_NAME_VALUE)}>名单值</Button>
        </div>
        {
          nameTypeTab === TYPE_NAME_LIST ? <Fragment>
            <div className="region-zd">
              <Input value={name} placeholder="名单名称" style={{ width: 200 }}
                     onChange={this.onNameChange} />
              <Button type="primary" onClick={() => {
                this.realParam = { ...this.state }
                this.getNameList(1)
              }} style={{ marginRight: '10px' }}>查询</Button>
              <Button type="default" onClick={this.onClearClick}>重置</Button>
              <div style={{ float: 'right' }}>
                <Button type="primary" onClick={() => this.newOrEditName()}>新建</Button>
              </div>
            </div>
            <div style={{ height: 'calc(100% - 94px)', overflowY: 'scroll' }}>
              <Table rowKey="id" columns={columns} dataSource={nameList}
                     pagination={this.state.pagination} onChange={this.handleChange} />
            </div>
          </Fragment> : nameTypeTab === TYPE_NAME_VALUE ? <Fragment>
            <div className="region-zd">
              <Select defaultValue={nameListId} value={nameListIdState || nameListId || undefined} placeholder="名单名称"
                      style={{ width: 200 }}
                      onChange={this.onNameListIdChange} disabled={!!nameListId} allowClear>
                {
                  nameSelect.map(name => {
                    const { id: nameListId = '', listName = '' } = name
                    return <Option key={nameListId} value={nameListId}>{listName}</Option>
                  })
                }
              </Select>
              <Input value={dataValue} placeholder="名单值" style={{ width: 200 }}
                     onChange={this.onDataValueChange} />
              <Select value={dataStatus || undefined} placeholder="名单状态" style={{ width: 200 }}
                      onChange={this.onDataStatusChange} allowClear>
                <Option value="effective">生效</Option>
                <Option value="expired">失效</Option>
              </Select>
              <Button type="primary" onClick={() => {
                this.realParam = { ...this.state }
                this.getNameDataList(1)
              }} style={{ marginRight: '10px' }}>查询</Button>
              <Button type="default" onClick={this.onDataClearClick}>重置</Button>
              {
                blacklistSource === 'SYSTEM' ? null : <div style={{ float: 'right' }}>
                  <Button type="primary" onClick={() => this.newNameData()}>新建</Button>
                  <Button onClick={this.importNameData}>导入名单值</Button>
                </div>
              }
            </div>
            <div style={{ height: 'calc(100% - 94px)', overflowY: 'scroll' }}>
              <Table rowKey="id" columns={columnsData} dataSource={nameDataList}
                     pagination={this.state.paginationData}
                     onChange={this.handleChange} />
            </div>
          </Fragment> : null
        }
        <Modal
          title={`${nameTypeTab === TYPE_NAME_LIST ? listName ? '编辑名单' : '新建名单' : '新建名单值'}`}
          wrapClassName="edit-confirm-modal"
          visible={this.state.editConfirmShow}
          maskClosable={false}
          centered
          okText="确认"
          cancelText="取消"
          onCancel={this.onEditCancel}
          onOk={this.onNameSave}
          confirmLoading={loading}
        >
          {
            nameTypeTab === TYPE_NAME_LIST ? <Form>
              <FormItem {...formItemLayout} label="名单名称">
                <Input {...getFieldProps('listName', {
                  initialValue: listName,
                  validate: [ {
                    rules: [
                      { required: true, whitespace: true, message: '最多50个字符' }
                    ]
                  } ]
                })} placeholder="最多50个字符" maxLength="50" />
              </FormItem>
              <FormItem {...formItemLayout} label="名单类型">
                <Select {...getFieldProps('listType', {
                  initialValue: listType || 'BLACKLIST'
                })} placeholder="请选择名单类型" disabled={!!listName}>
                  {
                    blackListTypeList.map(nameType => {
                      const { value: typeName = '', name: typeValue = '' } = nameType
                      return <Option key={typeValue} value={typeValue}>{typeName}</Option>
                    })
                  }
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} label="名单维度">
                <Select {...getFieldProps('dimensionalityId', {
                  initialValue: dimensionalityId,
                  validate: [ {
                    rules: [
                      { required: true, message: '请选择名单维度' }
                    ]
                  } ]
                })} placeholder="请选择名单维度" disabled={!!listName}>
                  {
                    dimensionTypeList.map(blackType => {
                      const { name: typeName = '', id: typeValue = '' } = blackType
                      return <Option key={typeValue} value={typeValue}>{typeName}</Option>
                    })
                  }
                </Select>
              </FormItem>
            </Form> : <Form>
              <FormItem {...formItemLayout} label="所属名单">
                <Select {...getFieldProps('nameListId', {
                  initialValue: nameListId,
                  validate: [ {
                    rules: [
                      { required: true, message: '请选择所属名单' }
                    ]
                  } ]
                })} placeholder="请选择名单" disabled={!!nameListId}>
                  {
                    nameSelect4New.map(name => {
                      const { id: nameListId = '', listName = '' } = name
                      return <Option key={nameListId} value={nameListId}>{listName}</Option>
                    })
                  }
                </Select>
              </FormItem>
              <FormItem {...formItemLayout} label="名单值">
                <Input {...getFieldProps('listData', {
                  initialValue: '',
                  validate: [ {
                    rules: [
                      { required: true, whitespace: true, message: '最多50个字符' }
                    ]
                  } ]
                })} placeholder="最多50个字符" maxLength="50" />
              </FormItem>
              <FormItem {...formItemLayout} label="有效期">
                <Select {...getFieldProps('effectiveTerm', {
                  initialValue: '',
                  validate: [ {
                    rules: [
                      { required: true, message: '请选择有效期' }
                    ]
                  } ]
                })} placeholder="请选择有效期">
                  {
                    effectiveTermList.map(effectiveTerm => {
                      const { name = '', desc = '' } = effectiveTerm
                      return <Option key={name} value={name}>{desc}</Option>
                    })
                  }
                </Select>
              </FormItem>
            </Form>
          }
        </Modal>
        <Modal
          title="导入名单值"
          wrapClassName="edit-confirm-modal"
          visible={this.state.importConfirmShow}
          maskClosable={false}
          centered
          okText="确认"
          cancelText="取消"
          style={{ textAlign: 'center' }}
          onCancel={this.uploadCancel}
          onOk={this.uploadDataName}
          confirmLoading={uploadLoading}
          okButtonProps={{ disabled: uploadDisabled }}
        >
          <span>文件:</span>
          <Input defaultValue={filePath} readOnly style={{ width: 200, margin: 10 }} onClick={this.onFileSelect}
                 placeholder="请选择导入文件" />
          <Button type="primary" onClick={this.onFileSelect}>选择文件</Button>
          <form ref="file-up-form" style={{ display: 'none' }}
                encType="multipart/form-data">
            <input id="file" name="file" ref="upload-input" type="file"
                   onChange={this.uploadChange} />
          </form>
          <p>提示：请按照模板格式填写信息。
            <a href="/dms/blacklist/data/download"
               style={{ color: '#FF6C00' }}>下载模版</a>
          </p>
        </Modal>

        <Modal
          title=""
          wrapClassName="edit-confirm-modal"
          visible={dependency}
          maskClosable={false}
          centered
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
          }}>该名单正在被以下规则使用，无法删除/编辑，请取消使用后重试。</span>
          {
            nameDependencies.map((dimensionDependency, i) => {
              const { dependencePath = '' } = dimensionDependency
              return <div>{i + 1}、{dependencePath}</div>
            })
          }
        </Modal>
      </LayoutRight>
    )
  }

  handleChange = (pagination) => {
    const { nameTypeTab = TYPE_NAME_LIST } = this.state
    const paginationField = nameTypeTab === TYPE_NAME_LIST ? 'pagination' : 'paginationData'
    this.setState({ [paginationField]: pagination }, () => {
      if (nameTypeTab === TYPE_NAME_LIST) {
        this.getNameList(pagination.current)
      } else {
        this.getNameDataList(pagination.current)
      }
    })
  }
  getDimensionTypeList = () => {
    getDimensionList().then(data => {
      const { content: dimensionTypeList = [] } = data
      this.setState({
        dimensionTypeList
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  getBlackListTypeList = () => {
    getBlackListTypeList().then(data => {
      const { content: blackListTypeList = [] } = data
      this.setState({
        blackListTypeList
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  getBlackListSourceList = () => {
    getBlackListSourceList().then(data => {
      const { content: blackListSourceList = [] } = data
      this.setState({
        blackListSourceList
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  getEffectiveTermList = () => {
    getEffectiveTermList().then(data => {
      const { content: effectiveTermList = [] } = data
      this.setState({
        effectiveTermList
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onNameTypeChange = nameTypeTab => {
    this.setState({
      nameTypeTab,
      record: {}
    }, () => {
      this.realParam = { ...this.state }
      if (nameTypeTab === TYPE_NAME_LIST) {
        this.getNameList()
      } else {
        this.getNameSelect()
        this.getNameDataList()
      }
    })
  }

  onNameChange = (e) => {
    this.setState({
      name: e.target.value
    })
  }

  getNameList = (pageNum = 1) => {
    const { pagination = {}, name } = this.realParam
    const { pageSize } = pagination

    getNameList(buildUrlParamNew({ blacklistName: name, pageNum, pageSize })).then(data => {
      const { content = {} } = data
      const { data: nameList = [], page, total } = content
      pagination.total = total
      pagination.current = page
      this.setState({
        nameList,
        pagination
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  getNameSelect = () => {
    getNameSelect().then(data => {
      const { content: nameSelect = [] } = data
      this.setState({
        nameSelect
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
    getNameSelect('type=CUSTOM').then(data => {
      const { content: nameSelect4New = [] } = data
      this.setState({
        nameSelect4New
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onClearClick = () => {
    this.setState({
      name: ''
    })
  }

  onDependencyCancel = () => {
    this.setState({
      dependency: false
    })
  }

  del = record => {
    const { id = '' } = record
    getNameDependencies(id).then(data => {
      const { content: nameDependencies = [] } = data
      if (nameDependencies.length > 0) {
        this.setState({
          dependency: true,
          nameDependencies
        })
      } else {
        this.setState({
          record
        }, () => {
          confirm({
            title: '是否确认删除?',
            content: '',
            okText: '确定',
            okType: 'primary',
            cancelText: '取消',
            onOk: async () => {
              this.onNameDelete()
            }
          })
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  toNameData = record => {
    this.setState({
      record,
      nameTypeTab: TYPE_NAME_VALUE
    }, () => {
      this.realParam = { ...this.state }
      this.getNameSelect()
      this.getNameDataList()
    })
  }

  onNameDelete = () => {
    const { record: { id = '' } = {} } = this.state
    deleteName({ id }).then(() => {
      this.getNameList()
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  newOrEditName = (record = {}) => {
    if (Object.keys(record).length > 0) {
      const { id = '' } = record
      getNameDependencies(id).then(data => {
        const { content: nameDependencies = [] } = data
        if (nameDependencies.length > 0) {
          this.setState({
            dependency: true,
            nameDependencies
          })
        } else {
          this.setState({
            editConfirmShow: true,
            record
          }, () => {
            this.props.form.resetFields()
          })
        }
      }).catch((data) => {
        const { content = {} } = data
        notification.warning(content)
      })
    } else {
      this.setState({
        editConfirmShow: true,
        record
      }, () => {
        this.props.form.resetFields()
      })
    }
  }

  uploadCancel = () => {
    this.setState({
      importConfirmShow: false,
      uploadDisabled: true,
      file: {},
      filePath: ''
    }, () => {
      this.refs['upload-input'].value = null
    })
  }

  uploadDataName = () => {
    this.setState({ uploadLoading: true }, () => {
      try {
        const { file } = this.state
        const { name = '' } = file
        const formData = new window.FormData()
        formData.append('file', file, name)
        uploadDataName(formData).then((data) => {
          const { content: { successCount = 0 } = {} } = data
          notification.success({ message: `成功导入${successCount}条数据` })
          this.uploadCancel()
          this.getNameDataList()
          this.setState({
            uploadLoading: false
          })
        }).catch((data) => {
          const { content = {} } = data
          notification.warning({ duration: 2.5, ...content })
          this.setState({
            uploadLoading: false
          })
        })
      } catch (err) {
        this.setState({
          uploadLoading: false
        })
        notification.warning(err)
      } finally {
        this.refs['upload-input'].value = null
      }
    })
  }

  onFileSelect = () => {
    this.refs['upload-input'].click()
  }

  uploadChange = (e) => {
    const regex = /(.csv)$/
    if (!regex.test(e.target.value)) {
      notification.warn({ message: '请选择csv文件' })
    } else {
      const file = e.target.files[0]
      const filePath = e.target.value
      this.setState({ uploadDisabled: false, file, filePath })
    }
  }

  onEditCancel = () => {
    const { nameTypeTab = TYPE_NAME_LIST } = this.state
    let data = { editConfirmShow: false }
    if (nameTypeTab === TYPE_NAME_LIST) {
      data = { ...data, record: {} }
    }
    this.setState({
      ...data
    }, () => {
      this.props.form.resetFields()
    })
  }

  onNameSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      try {
        const { nameTypeTab = TYPE_NAME_LIST, record = {} } = this.state
        const { listName: recordListName = '' } = record
        const {
          listName,
          listType,
          dimensionalityId,
          nameListId,
          listData,
          effectiveTerm
        } = this.props.form.getFieldsValue()
        await this.setState({ loading: true })
        const promise = nameTypeTab === TYPE_NAME_LIST ? recordListName ? updateName({
          ...record,
          listName,
          listType,
          dimensionalityId
        }) : saveName({
          listName,
          listType,
          dimensionalityId
        }) : saveDataName({
          blackListId: nameListId,
          listData,
          effectiveTerm,
          blacklistDataSource: 'MANUAL' // 后端接口多余参数，之后要除去
        })
        promise.then(() => {
          let data = { editConfirmShow: false, loading: false }
          if (nameTypeTab === TYPE_NAME_LIST) {
            this.setState({ ...data, record: {} }, () => {
              this.props.form.resetFields()
              this.getNameList()
            })
          } else {
            this.setState({ ...data }, () => {
              this.props.form.resetFields()
              this.getNameDataList()
            })
          }
        }).catch((data) => {
          const { content = {} } = data
          this.setState({ loading: false }, () => {
            notification.warning(content)
          })
        })
      } catch (err) {
        this.setState({ loading: false })
      }
    })
  }

  onNameListIdChange = nameListIdState => {
    this.setState({
      nameListIdState
    })
  }

  onDataValueChange = e => {
    this.setState({
      dataValue: e.target.value
    })
  }

  onDataStatusChange = dataStatus => {
    this.setState({
      dataStatus
    })
  }

  getNameDataList = (pageNum = 1) => {
    const { record = {}, nameListIdState = '', dataValue = '', dataStatus = '', paginationData = {} } = this.realParam
    const { pageSize } = paginationData
    const { id: nameListId = '' } = record
    const blacklistId = nameListIdState || nameListId
    getNameDataList({
      blacklistId,
      listData: dataValue,
      state: dataStatus,
      pageNum,
      pageSize
    }).then(data => {
      const { content: { data: nameDataList = [], total, page } = {} } = data
      paginationData.total = total
      paginationData.current = page
      this.setState({
        nameDataList,
        paginationData
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onDataClearClick = () => {
    this.setState({
      nameListIdState: '',
      dataValue: '',
      dataStatus: ''
    })
  }

  newNameData = () => {
    this.setState({
      editConfirmShow: true
    }, () => {
      this.props.form.resetFields()
    })
  }

  importNameData = () => {
    this.setState({
      importConfirmShow: true
    })
  }

  effectOrEmpire = (record, effected, effectiveTerm) => {
    const { id = '' } = record
    let data = { id, status: effected ? 'effective' : 'expired' }
    if (effected) {
      data = { ...data, effectiveTerm }
    }
    updateDataStatus({ ...data }).then(() => {
      this.getNameDataList()
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onEffectiveTermChange = effectiveTerm => {
    this.setState({
      effectiveTerm
    })
  }

  delData = record => {
    confirm({
      title: '是否确认删除?',
      content: '',
      okText: '确定',
      okType: 'primary',
      cancelText: '取消',
      onOk: async () => {
        const { id = '' } = record
        deleteDataName({ id }).then(() => {
          this.getNameDataList()
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
      }
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(BlackList))
