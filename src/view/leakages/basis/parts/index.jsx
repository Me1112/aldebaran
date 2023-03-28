import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Button, Input, Table, Modal, Form, notification, Select } from 'antd'
import LayoutRight from '@component/layout_right'

import {
  fetchPartsList,
  addParts,
  delParts,
  uploadParts,
  fetchFirstTypeList,
  fetchSecondTypeList
} from '@action/leakage'
import './index.less'

const { Item: FormItem } = Form
const { confirm } = Modal
const { Option } = Select

class BasicParts extends Component {
  state = {
    editConfirmShow: false,
    deleteConfirmShow: false,
    record: {},
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
    this.loadBasicParts()
    this.loadFirstTypeList()
    this.loadSecondTypeList()
  }

  render() {
    const {
      isView = false,
      loading = false,
      selectedFirstType,
      selectedSecondType,
      keyword,
      dataSource = [],
      firstTypeList = [],
      secondTypeList = [],
      pagination
    } = this.state

    const columns = [
      {
        title: '一级分类',
        dataIndex: 'firstType',
        key: 'firstType',
        width: '20%',
        onCell: (record) => {
          const { firstType } = record
          return { title: firstType }
        }
      },
      {
        title: '二级分类',
        dataIndex: 'secondType',
        key: 'secondType',
        width: '20%',
        onCell: (record) => {
          const { secondType } = record
          return { title: secondType }
        }
      },
      {
        title: '项目名称(标准)',
        dataIndex: 'name',
        key: 'name',
        width: '25%',
        onCell: (record) => {
          const { name } = record
          return { title: name }
        }
      },
      {
        title: '映射项目名称(保司)',
        dataIndex: 'mappingName',
        key: 'mappingName',
        width: '25%',
        onCell: (record) => {
          const { mappingName } = record
          return { title: mappingName }
        }
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 190
      }, {
        title: '操作',
        dataIndex: 'operations',
        key: 'operations',
        width: 80,
        render: (text, record) => {
          return <Fragment>
            <span className="operation-span" onClick={() => {
              this.onDeleteIconClick(record)
            }}>删除</span>
          </Fragment>
        }
      }]

    const { getFieldProps, getFieldValue } = this.props.form
    const isHour = getFieldValue('firstType') === 'hour'
    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 17 }
    }

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Select placeholder="一级分类" allowClear style={{ width: 200 }} value={selectedFirstType}
                  onChange={this.changeFirstType}>
            {
              firstTypeList.map(item => {
                const { optionKey, optionValue } = item
                return <Option key={optionKey} value={optionKey} title={optionValue}>{optionValue}</Option>
              })
            }
          </Select>
          <Select placeholder="二级分类" allowClear style={{ width: 200 }} value={selectedSecondType} showSearch
                  onChange={this.changeSecondType} disabled={selectedFirstType !== 'hour'} optionFilterProp="children">
            {
              secondTypeList.map(item => {
                const { optionKey, optionValue } = item
                return <Option key={optionKey} value={optionKey} title={optionValue}>{optionValue}</Option>
              })
            }
          </Select>
          <Input value={keyword} placeholder="项目名称(标准)" style={{ width: 200 }} onChange={this.changeKeyword} />
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
          title={`${isView ? '编辑' : '新建'}项目`}
          centered
          visible={this.state.editConfirmShow}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          confirmLoading={loading}
          onCancel={this.onEditCancel}
          onOk={isView ? this.onEditCancel : this.onPartsSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="一级分类">
              <Select defaultActiveFirstOption={false} filterOption={false}
                      disabled={isView} {...getFieldProps('firstType', {
                validate: [{
                  rules: [
                    { required: true, message: '请选择一级分类' }
                  ]
                }],
                onChange: this.handleSelectChange
              })} placeholder="请选择">
                {
                  firstTypeList.map(item => {
                    const { optionKey, optionValue } = item
                    return <Option key={optionKey} value={optionKey} title={optionValue}>{optionValue}</Option>
                  })
                }
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="二级分类">
              <Select defaultActiveFirstOption={false} showSearch allowClear optionFilterProp="children"
                      disabled={isView || !isHour} {...getFieldProps('secondType', {})} placeholder="请选择">
                {
                  secondTypeList.map(item => {
                    const { optionKey, optionValue } = item
                    return <Option key={optionKey} value={optionKey} title={optionValue}>{optionValue}</Option>
                  })
                }
              </Select>
            </FormItem>
            <FormItem {...formItemLayout} label="项目名称(标准)">
              <Input {...getFieldProps('name', {
                validate: [{
                  rules: [
                    { required: true, whitespace: true, message: '最多255个字符' }
                  ]
                }]
              })} placeholder="最多255个字符" maxLength="255" disabled={isView} />
            </FormItem>
            <FormItem {...formItemLayout} label="映射项目名称(保司)">
              <Input {...getFieldProps('mappingName', {})} placeholder="最多255个字符" maxLength="255" disabled={isView} />
            </FormItem>
          </Form>
        </Modal>
      </LayoutRight>
    )
  }

  handleSelectChange = (firstType) => {
    if (firstType !== 'hour') {
      this.props.form.setFieldsValue({
        secondType: undefined
      })
    }
  }

  changeFirstType = e => {
    let { selectedSecondType } = this.state
    this.setState({ selectedFirstType: e, selectedSecondType: e !== 'hour' ? undefined : selectedSecondType })
  }

  changeSecondType = e => {
    this.setState({ selectedSecondType: e })
  }

  onDownloadClick = () => {
    window.location.href = `/dms/leakage/partsLibrary/download`
  }

  onQuery = () => {
    this.loadBasicParts()
  }

  onReset = () => {
    this.setState({
      selectedFirstType: undefined,
      selectedSecondType: undefined,
      keyword: undefined
    }, this.onQuery)
  }

  loadFirstTypeList = () => {
    fetchFirstTypeList()
      .then((data) => {
        const { content: firstTypeList = [] } = data
        this.setState({ firstTypeList })
      })
      .catch((data) => {
        notification.warning(data.content)
      })
  }

  loadSecondTypeList = () => {
    fetchSecondTypeList()
      .then((data) => {
        const { content: secondTypeList = [] } = data
        this.setState({ secondTypeList })
      })
      .catch((data) => {
        notification.warning(data.content)
      })
  }

  loadBasicParts = (page = 1) => {
    const { pagination, selectedFirstType: firstType, selectedSecondType: secondType, keyword: name } = this.state
    const { pageSize: size } = pagination
    const data = {
      firstType,
      secondType,
      name,
      page,
      size
    }
    this.setState({
      loading: true
    })
    fetchPartsList(data).then(res => {
      const { content = {} } = res
      const { data = [], page = 1, total = 0 } = content
      if (data.length === 0 && page > 1) {
        // 用户非法操作 前端兼容处理
        this.loadBasicParts()
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
      this.loadBasicParts(pagination.current)
    })
  }

  changeKeyword = (e) => {
    this.setState({ keyword: e.target.value })
  }

  onCreateBtnClick = () => {
    this.setState({
      editConfirmShow: true
    }, () => {
      this.props.form.resetFields()
    })
  }

  onEditCancel = () => {
    this.setState({
      isView: false,
      editConfirmShow: false
    }, () => {
      this.props.form.resetFields()
    })
  }

  onPartsSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      await this.setState({ loading: true })
      try {
        await addParts(values)
        this.setState({ editConfirmShow: false, loading: false }, () => {
          this.loadBasicParts()
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
        this.onPartsDelete()
      },
      onCancel: () => {
        this.onPartsCancel()
      }
    })
    this.setState({
      // deleteConfirmShow: true,
      record
    })
  }

  onPartsCancel = () => {
    this.setState({
      deleteConfirmShow: false
    })
  }

  onPartsDelete = async () => {
    const { record: { id } = {}, pagination } = this.state
    delParts({ id }).then(() => {
      this.setState({
        deleteConfirmShow: false
      }, () => {
        this.loadBasicParts(pagination.current)
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
    const { companyId } = this.state
    const file = e.target.files[0]
    const { name = '' } = file || {}
    const regex = /.csv$/
    if (!regex.test(e.target.value)) {
      notification.warn({ message: '请选择CSV文件' })
    } else {
      this.setState({ uploadLoading: true }, () => {
        try {
          const formData = new window.FormData()
          formData.append('companyId', companyId)
          formData.append('file', file, name)
          uploadParts(formData).then((data) => {
            const { content: { successCount = 0, repeatCount = 0 } = {} } = data
            notification.success({ message: `成功导入${successCount}条数据，重复${repeatCount}条` })
            this.loadBasicParts()
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

export default Form.create()(BasicParts)
