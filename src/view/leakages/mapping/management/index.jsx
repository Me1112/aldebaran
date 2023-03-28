import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Button, Input, Table, Modal, Form, notification } from 'antd'
import LayoutRight from '@component/layout_right'

import {
  fetchProjectNames,
  addProjectName,
  delProjectName,
  uploadProjectName
} from '@action/leakage'
import './index.less'

const { Item: FormItem } = Form
const { confirm } = Modal

class ProjectManagementList extends Component {
  state = {
    editConfirmShow: false,
    deleteConfirmShow: false,
    record: {},
    projectInfo: {},
    pagination: {
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`
    }
  }

  static propTypes = {
    form: PropTypes.any
  }

  componentDidMount() {
    this.loadProjects()
  }

  render() {
    const {
      projectInfo,
      isView = false,
      loading = false,
      projectName,
      dataSource = [],
      pagination
    } = this.state

    const columns = [
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        onCell: (record) => {
          const { projectName } = record
          return { title: projectName }
        }
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 180
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 120,
        render: (text, record) => {
          return <Fragment>
            {
              <span className="operation-span" onClick={() => {
                this.onDeleteIconClick(record)
              }}>删除</span>
            }
          </Fragment>
        }
      }]

    const {
      id,
      projectName: cProjectName = ''
    } = projectInfo
    const isEdit = id > 0
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 18 }
    }

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Input value={projectName} placeholder="项目名称" style={{ width: 200 }} onChange={this.changeKeyword} />
          <Button type="primary" onClick={this.onQuery}>查询</Button>
          <Button onClick={this.onReset}>重置</Button>
          <Button className="fr download-ant-btn" onClick={this.onDownloadClick}>下载模板</Button>
          <Button type="primary" className="fr" onClick={this.onFileSelect}>导入</Button>
          <form ref="file-up-form" style={{ display: 'none' }}
                encType="multipart/form-data">
            <input id="file" name="file" ref="upload-input" type="file"
                   onChange={this.uploadChange} />
          </form>
          <Button type="primary" className="fr" onClick={this.onCreateBtnClick}>新建</Button>
        </div>
        <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
          <Table className="ellipsis" rowKey="id" columns={columns} dataSource={dataSource} onChange={this.handleChange}
                 pagination={pagination} loading={loading} />
        </div>
        <Modal
          title={`${isEdit ? isView ? '查看' : '编辑' : '新建'}项目`}
          centered
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onProjectNameSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="项目名称">
              <Input {...getFieldProps('projectName', {
                initialValue: cProjectName,
                validate: [{
                  rules: [
                    { required: true, whitespace: true, message: '最多255个字符' }
                  ]
                }]
              })} placeholder="最多255个字符" onKeyUp={this.replaceEnglishChars} maxLength="255" disabled={isView} />
            </FormItem>
          </Form>
        </Modal>
      </LayoutRight>
    )
  }

  replaceEnglishChars = (e) => {
    const { projectInfo = {} } = this.state
    let projectName = e.target.value.replace(/\(/ig, '（').replace(/\)/ig, '）')
    this.setState({
      projectInfo: {
        ...projectInfo,
        projectName
      }
    }, () => {
      this.props.form.setFields({
        projectName: {
          value: projectName
        }
      })
    })
  }

  onDownloadClick = () => {
    window.location.href = `/dms/leakage/projectName/download`
  }

  onQuery = () => {
    this.loadProjects()
  }

  onReset = () => {
    this.setState({
      projectName: undefined
    }, () => {
      this.onQuery()
    })
  }

  loadProjects = (page = 1) => {
    const { pagination, projectName } = this.state
    const { pageSize: size } = pagination
    const data = {
      projectName,
      page,
      size
    }
    this.setState({
      loading: true
    })
    fetchProjectNames(data).then(res => {
      const { content = {} } = res
      const { data = [], page = 1, total = 0 } = content
      if (data.length === 0 && page > 1) {
        // 用户非法操作 前端兼容处理
        this.loadProjects()
        return
      }
      pagination.total = total
      pagination.current = page
      this.setState({ dataSource: data, loading: false, pagination })
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.loadProjects(pagination.current)
    })
  }

  changeKeyword = (e) => {
    this.setState({ projectName: e.target.value })
  }

  onCreateBtnClick = () => {
    this.setState({
      editConfirmShow: true,
      projectInfo: {}
    }, () => {
      this.props.form.resetFields()
    })
  }

  onEditIconClick = (projectInfo, editType = 'edit') => {
    // const { fieldType, enumOption, containFieldList = [] } = projectInfo
    this.setState({
      isView: editType === 'view',
      editConfirmShow: true,
      projectInfo
    }, () => {
      this.props.form.resetFields()
      this.props.form.validateFields()
    })
  }

  onEditCancel = () => {
    this.setState({
      isView: false,
      editConfirmShow: false,
      projectInfo: {}
    }, () => {
      this.props.form.resetFields()
    })
  }

  onProjectNameSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      await this.setState({ loading: true })
      try {
        await addProjectName({
          ...values
        })
        this.setState({ editConfirmShow: false, loading: false }, () => {
          this.loadProjects(1)
        })
      } catch (data) {
        notification.warning(data.content)
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
      deleteConfirmShow: false
    })
  }

  onFieldDelete = async () => {
    const { record: { id } = {}, pagination } = this.state
    delProjectName({ id }).then(() => {
      this.setState({
        deleteConfirmShow: false
      }, () => {
        this.loadProjects(pagination.current)
      })
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        deleteConfirmShow: false
      })
    })
  }

  onFileSelect = () => {
    this.refs['upload-input'].click()
  }

  uploadChange = (e) => {
    const file = e.target.files[0]
    const { name = '' } = file || {}
    const regex = /.csv$/
    if (!regex.test(e.target.value)) {
      notification.warn({ message: '请选择CSV文件' })
    } else {
      this.setState({ uploadLoading: true }, () => {
        try {
          const formData = new window.FormData()
          formData.append('file', file, name)
          uploadProjectName(formData).then((data) => {
            const { content: { successCount = 0 } = {} } = data
            notification.success({ message: `成功导入${successCount}条数据` })
            this.loadProjects()
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
  }
}

export default Form.create()(ProjectManagementList)
