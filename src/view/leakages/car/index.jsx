import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Button, Select, Input, Table, Modal, Form, Row, notification } from 'antd'
import LayoutRight from '@component/layout_right'

import {
  fetchCarModels,
  addCarModel,
  fetchManufacturers,
  fetchCarSeries,
  uploadCarModels,
  delCarModel
} from '@action/leakage'
import './index.less'

const { Option } = Select
const { Item: FormItem } = Form
const { confirm } = Modal

class CarModelLibrary extends Component {
  state = {
    editConfirmShow: false,
    deleteConfirmShow: false,
    promptShow: false,
    promptMsg: '',
    record: {},
    basicInfo: {},
    fieldSaveError: '',
    enumShow: false,
    enumList: [{}],
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
    this.loadCarModels()
    this.loadManufacturers()
  }

  render() {
    const {
      basicInfo,
      fieldSaveError,
      isView = false,
      promptShow,
      promptMsg,
      loading = false,
      uploadLoading = false,
      manufacturer,
      carSeries,
      carModel,
      dataSource = [],
      manufacturers = [],
      carSeriesList = [],
      pagination
    } = this.state

    const columns = [
      {
        title: '厂商',
        dataIndex: 'manufacturer',
        key: 'manufacturer',
        width: '15%',
        onCell: (record) => {
          const { manufacturer } = record
          return { title: manufacturer }
        }
      }, {
        title: '车系',
        dataIndex: 'carSeries',
        key: 'carSeries',
        width: '20%',
        onCell: (record) => {
          const { carSeries } = record
          return { title: carSeries }
        }
      }, {
        title: '车型',
        dataIndex: 'carModel',
        key: 'carModel',
        onCell: (record) => {
          const { carModel } = record
          return { title: carModel }
        }
      }, {
        title: '创建人',
        dataIndex: 'creator',
        key: 'creator',
        width: 150,
        onCell: (record) => {
          const { creator } = record
          return { title: creator }
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

    const {
      id,
      carModel: tCarModel = '',
      manufacturer: tManufacturer,
      carSeries: tCarSeries
    } = basicInfo

    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 19 }
    }

    return (
      <LayoutRight className="no-bread-crumb">
        <div className="region-zd">
          <Select placeholder="厂商" allowClear style={{ width: 200 }} value={manufacturer}
                  onChange={this.changeManufacture} showSearch>
            {
              manufacturers.map(item => <Option key={item} value={item} title={item}>{item}</Option>)
            }
          </Select>
          <Select placeholder="车系" allowClear style={{ width: 200 }} value={carSeries}
                  onChange={this.changeCarSeries} showSearch>
            {
              carSeriesList.map(item => <Option key={item} value={item} title={item}>{item}</Option>)
            }
          </Select>
          <Input value={carModel} placeholder="车型" style={{ width: 200 }} onChange={this.changeCarModel} />
          <Button type="primary" onClick={this.onQuery}>查询</Button>
          <Button onClick={this.onReset}>重置</Button>
          <Button className="fr download-ant-btn" onClick={this.onDownloadClick}>下载模板</Button>
          <Button type="primary" className="fr" onClick={this.onFileSelect} disabled={uploadLoading}>导入</Button>
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
          title={`${id > 0 ? isView ? '查看' : '编辑' : '新建'}车型`}
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
            <FormItem {...formItemLayout} label="厂商">
              <Input {...getFieldProps('manufacturer', {
                initialValue: tManufacturer,
                validate: [{
                  rules: [
                    { required: true, message: '最多20个字符' }
                  ]
                }]
              })} placeholder="最多20个字符" maxLength="20" disabled={isView} />
            </FormItem>
            <FormItem {...formItemLayout} label="车系">
              <Input {...getFieldProps('carSeries', {
                initialValue: tCarSeries,
                validate: [{
                  rules: [
                    { required: true, message: '最多20个字符' }
                  ]
                }]
              })} placeholder="最多20个字符" maxLength="20" disabled={isView} />
            </FormItem>
            <FormItem {...formItemLayout} label="车型">
              <Input.TextArea {...getFieldProps('carModel', {
                initialValue: tCarModel,
                validate: [{
                  rules: [
                    { required: true, message: '最多255个字符' }
                  ]
                }]
              })} placeholder="最多255个字符" maxLength="255" rows={3} disabled={isView} />
            </FormItem>
            <Row className="save-error">{fieldSaveError}</Row>
          </Form>
        </Modal>
      </LayoutRight>
    )
  }

  onQuery = () => {
    this.loadCarModels()
  }

  onReset = () => {
    this.setState({
      carSeries: undefined,
      carModel: undefined,
      manufacturer: undefined
    }, () => {
      this.onQuery()
    })
  }

  loadManufacturers = () => {
    fetchManufacturers().then(data => {
      const { content: manufacturers = [] } = data
      this.setState({ manufacturers })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  loadCarSeries = () => {
    const { manufacturer = '' } = this.state
    fetchCarSeries({ manufacturer }).then(data => {
      const { content: carSeriesList = [] } = data
      this.setState({ carSeriesList })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  loadCarModels = (page = 1) => {
    const { pagination, manufacturer, carModel, carSeries } = this.state
    const { pageSize: size } = pagination
    const data = {
      manufacturer,
      carModel,
      carSeries,
      page,
      size
    }
    this.setState({
      loading: true
    })
    fetchCarModels(data).then(res => {
      const { content = {} } = res
      const { data = [], page = 1, total = 0 } = content
      if (data.length === 0 && page > 1) {
        // 用户非法操作 前端兼容处理
        this.loadCarModels()
        return
      }
      data.forEach(item => {
        const { id } = item
        item.key = id
      })
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

  onCancel = () => {
    this.setState({
      enumAddVisible: false
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.loadCarModels(pagination.current)
    })
  }

  changeManufacture = e => {
    this.setState({ manufacturer: e, carSeries: [] }, this.loadCarSeries)
  }

  changeCarSeries = e => {
    this.setState({ carSeries: e })
  }

  changeCarModel = (e) => {
    this.setState({ carModel: e.target.value })
  }

  onCreateBtnClick = () => {
    this.setState({
      editConfirmShow: true,
      basicInfo: {},
      fieldSaveError: '',
      enumShow: false,
      enumList: [{}]
    }, () => {
      this.props.form.resetFields()
    })
  }

  onEditIconClick = (basicInfo, editType = 'edit') => {
    this.setState({
      isView: editType === 'view',
      editConfirmShow: true,
      basicInfo
    }, () => {
      this.props.form.resetFields()
      this.props.form.validateFields()
    })
  }

  onEditCancel = () => {
    this.setState({
      isView: false,
      editConfirmShow: false,
      basicInfo: {},
      enumShow: false,
      enumList: [{}],
      fieldSaveError: ''
    }, () => {
      this.props.form.resetFields()
    })
  }

  onFieldSave = () => {
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return
      }
      this.setState({ loading: true })
      try {
        addCarModel(values).then(() => {
          this.setState({ editConfirmShow: false, loading: false }, () => {
            this.loadCarModels()
            this.loadManufacturers()
            const { manufacturer } = this.state
            if (manufacturer) {
              this.loadCarSeries()
            }
          })
        }).catch((data) => {
          notification.warning(data.content)
          this.setState({ loading: false })
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
        this.onCarModelDelete()
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

  onCarModelDelete = async () => {
    const { record: { id } = {}, pagination } = this.state
    delCarModel({ id }).then(() => {
      this.setState({
        deleteConfirmShow: false
      }, () => {
        this.loadCarModels(pagination.current)
        this.loadManufacturers()
        const { manufacturer } = this.state
        if (manufacturer) {
          this.loadCarSeries()
        }
      })
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

  onFileSelect = () => {
    this.refs['upload-input'].click()
  }

  onDownloadClick = () => {
    window.location.href = `/dms/leakage/carLibrary/download`
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
          uploadCarModels(formData).then((data) => {
            const { content: { successCount = 0, repeatCount = 0 } = {} } = data
            notification.success({ message: `成功导入${successCount}条数据，重复${repeatCount}条` })
            this.setState({ editConfirmShow: false, uploadLoading: false }, () => {
              this.loadCarModels()
              this.loadManufacturers()
              const { manufacturer } = this.state
              if (manufacturer) {
                this.loadCarSeries()
              }
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

export default Form.create()(CarModelLibrary)
