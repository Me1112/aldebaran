import React, { Fragment } from 'react'
import { Button, notification, Table, Input, Modal, Form, Tabs } from 'antd'
import connect from 'react-redux/es/connect/connect'
import LayoutRight from '../../../component/layout_right'
import {
  getDimensionList,
  createDimension,
  getDimensionFieldList,
  getDimensionDependencies,
  updateDimension,
  deleteDimension
} from '../../../action/policy'
import { TYPE_SYSTEM, TYPE_CUSTOM } from '../../../common/constant'
import { formatDate, FieldDataTypeMapNAE } from '../../../util'
import PropTypes from 'prop-types'
import './index.less'

const { Item: FormItem } = Form
const { confirm } = Modal
const { TabPane } = Tabs

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {}
}

class Dimension extends React.Component {
  state = {}

  static propTypes = {
    history: PropTypes.object.isRequired,
    form: PropTypes.any
  }

  componentDidMount() {
    this.getDataList()
  }

  render() {
    const { getFieldProps } = this.props.form
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }
    const {
      name = '',
      create = false,
      edit = false,
      detail = false,
      record: {
        name: recordName = ''
      } = {},
      dataSource = [],
      fieldDataSource = [],
      dependency = false,
      dimensionDependencies = []
    } = this.state

    const dependenceFields = dimensionDependencies.filter(d => d.dependenceType === 'BasicField')
    const dependenceBlacks = dimensionDependencies.filter(d => d.dependenceType === 'Blacklist')

    const columns = [
      {
        title: '维度名称',
        dataIndex: 'name',
        key: 'name',
        width: '20%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      },
      {
        title: '维度类型',
        dataIndex: 'dimensionalitySource',
        key: 'dimensionalitySource',
        render: text => {
          let typeName = ''
          switch (text) {
            case TYPE_SYSTEM:
              typeName = '系统'
              break
            case TYPE_CUSTOM:
              typeName = '自定义'
              break
          }
          return typeName
        }
      },
      {
        title: '解析字段个数',
        dataIndex: 'outspreadFieldCount',
        key: 'outspreadFieldCount'
      },
      {
        title: '更新人',
        dataIndex: 'updatedBy',
        key: 'updatedBy'
      }, {
        title: '更新时间',
        dataIndex: 'updateTime',
        width: 200,
        key: 'updateTime',
        render: (text, record) => {
          const { updateTime = '' } = record
          return formatDate(updateTime)
        }
      }, {
        title: '操作',
        dataIndex: 'operation',
        key: 'operation',
        width: 100,
        render: (text, record) => {
          const { dimensionalitySource = '' } = record
          return <Fragment>
            <span className="operation-span" onClick={() => this.detail(record)}>查看</span>
            {
              dimensionalitySource !== TYPE_SYSTEM ? <Fragment>
                <span className="operation-span" onClick={() => this.edit(record)}>编辑</span>
                <span className="operation-span" onClick={() => this.del(record)}>删除</span>
              </Fragment> : null
            }
          </Fragment>
        }
      }
    ]
    const fieldColumns = [
      {
        title: '字段名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '字段编码',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: '字段类型',
        dataIndex: 'fieldType',
        key: 'fieldType',
        render: (text, record) => {
          return <span>{FieldDataTypeMapNAE[text]}</span>
        }

      }
    ]
    return (
      <Fragment>
        <LayoutRight className="join-up no-bread-crumb" type={'tabs'}>
          <Tabs type="card" defaultActiveKey={'1'} className={'tabs-no-border'}
                activeKey={'1'}
                onChange={this.onTabsTypeChange}>
            <TabPane tab="主体维度" key={'1'} forceRender>
              <div className="region-zd">
                <Input placeholder="请输入主体维度名称" value={name} maxLength={'50'} onChange={this.nameChange}
                       style={{ width: 200 }} />
                <Button type="primary" onClick={this.getDataList} style={{ marginRight: '10px' }}>查询</Button>
                <Button type="default" onClick={this.onClearClick}>重置</Button>
                <div style={{ float: 'right' }}>
                  <Button type="primary" onClick={this.newDimension}>新建</Button>
                </div>
              </div>
              <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
                <Table rowKey="id" className="table-layout-fixed table-td-no-auto"
                       columns={columns} dataSource={dataSource}
                       locale={{ emptyText: '暂无数据' }} pagination={false} />
              </div>
            </TabPane>
            <TabPane tab="决策结果" key={'2'} forceRender />
            <TabPane tab="预警通知" key={'3'} forceRender />
          </Tabs>
        </LayoutRight>
        <Modal
          title={`${recordName ? '编辑' : '新建'}维度`}
          wrapClassName="edit-confirm-modal"
          visible={create || edit}
          maskClosable={false}
          okText="确认"
          cancelText="取消"
          onCancel={this.onCancel}
          onOk={this.onSave}
        >
          <Form>
            <FormItem {...formItemLayout} label="维度名称">
              <Input {...getFieldProps('name', {
                initialValue: recordName,
                validate: [{
                  rules: [
                    { required: true, whitespace: true, message: '最多50个字符' }
                  ]
                }]
              })} placeholder="最多50个字符" maxLength="50" />
            </FormItem>
          </Form>
        </Modal>
        <Modal
          title={recordName}
          wrapClassName="dimension-field-modal"
          visible={detail}
          maskClosable={false}
          okText="确认"
          cancelText="关闭窗口"
          onCancel={this.onDetailCancel}
        >
          <div style={{ maxHeight: 500, overflowY: 'scroll' }}>
            <Table rowKey="id" className="table-td-no-auto" columns={fieldColumns} dataSource={fieldDataSource}
                   locale={{ emptyText: '暂无数据' }} size="small" pagination={false} />
          </div>
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
          }}>该主体维度正在被以下对象使用，无法删除/编辑，请取消使用后重试。</span>
          {
            dependenceFields.length > 0 ? <Fragment>
              <div>字段:</div>
              <div style={{ paddingLeft: 30 }}>
                {
                  dependenceFields.map((dimensionDependency, i) => {
                    const { dependencePath = '' } = dimensionDependency
                    return <div>{i + 1}、{dependencePath}</div>
                  })
                }
              </div>
            </Fragment> : null
          }
          {
            dependenceBlacks.length > 0 ? <Fragment>
              <div>名单列表:</div>
              <div style={{ paddingLeft: 30 }}>
                {
                  dependenceBlacks.map((dimensionDependency, i) => {
                    const { dependencePath = '' } = dimensionDependency
                    return <div>{i + 1}、{dependencePath}</div>
                  })
                }
              </div>
            </Fragment> : null
          }
        </Modal>
      </Fragment>
    )
  }

  onTabsTypeChange = e => {
    if (e === '2') {
      this.props.history.push({ pathname: '/policy/params/strategy-parameter' })
    }
    if (e === '3') {
      this.props.history.push({ pathname: '/policy/params/warning' })
    }
  }
  getDataList = () => {
    const { name = '' } = this.state
    getDimensionList(name).then(data => {
      const { content: dataSource = [] } = data
      this.setState({
        dataSource
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  nameChange = e => {
    this.setState({ name: e.target.value })
  }

  onClearClick = () => {
    this.setState({
      name: ''
    })
  }

  newDimension = () => {
    this.setState({
      create: true
    })
  }

  detail = record => {
    this.setState({
      detail: true,
      record
    }, () => {
      const { id = '' } = record
      getDimensionFieldList(id).then(data => {
        const { content: fieldDataSource = [] } = data
        this.setState({
          fieldDataSource
        })
      }).catch((data) => {
        const { content = {} } = data
        notification.warning(content)
      })
    })
  }

  edit = record => {
    const { id = '' } = record
    getDimensionDependencies(id).then(data => {
      const { content: dimensionDependencies = [] } = data
      if (dimensionDependencies.length > 0) {
        this.setState({
          dependency: true,
          dimensionDependencies
        })
      } else {
        this.setState({
          edit: true,
          record
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  del = record => {
    const { id = '' } = record
    getDimensionDependencies(id).then(data => {
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
            const { id = '' } = record
            deleteDimension({ id }).then(() => {
              this.getDataList()
            }).catch((data) => {
              const { content = {} } = data
              notification.warning(content)
            })
          }
        })
      }
    }).catch((data) => {
      const { content = {} } = data
      notification.warning(content)
    })
  }

  onDependencyCancel = () => {
    this.setState({
      dependency: false
    })
  }

  onCancel = () => {
    this.setState({
      create: false,
      edit: false,
      record: {}
    }, () => {
      this.props.form.resetFields()
    })
  }

  onSave = () => {
    this.props.form.validateFields(async (errors, values) => {
      if (errors) {
        return
      }
      try {
        const { create = false, record: { id = '' } = {} } = this.state
        const { name = '' } = this.props.form.getFieldsValue()
        const promise = create ? createDimension({ name }) : updateDimension({ id, name })
        promise.then(() => {
          this.getDataList()
          this.onCancel()
        }).catch((data) => {
          const { content = {} } = data
          notification.warning(content)
        })
      } catch (err) {

      }
    })
  }

  onDetailCancel = () => {
    this.setState({
      detail: false,
      record: {}
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Dimension))
