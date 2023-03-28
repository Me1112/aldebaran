import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Map } from 'immutable'
import { Button, notification, Select, Table, Modal, Input } from 'antd'
import LayoutRight from '../../../../component/layout_right'
import { formatDate } from '../../../../util'
import { getAppSelect } from '../../../../action/rule'
import {
  getOfflineDataList,
  getOfflineDataDetail,
  offlineDataDependencies,
  deleteOfflineData
} from '../../../../action/data'
import './index.less'

const confirm = Modal.confirm
const { Option } = Select

function mapStateToProps(state) {
  const { rule = Map() } = state
  const { appSelect = [] } = rule.toJS()
  return {
    appSelect
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getAppSelect: bindActionCreators(getAppSelect, dispatch)
  }
}

class VerificationOffline extends Component {
  constructor(prop) {
    super(prop)
    const { conditions = {} } = prop.location.state
    this.realParam = {}
    this.state = {
      ...conditions,
      pagination: {
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`
      }
    }
  }

  static propTypes = {
    history: PropTypes.any,
    appSelect: PropTypes.array.isRequired,
    getAppSelect: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.props.getAppSelect()
    this.realParam = { ...this.state }
    this.getDataList()
  }

  render() {
    const {
      dataName, appId, loading, pagination, dataSource = [], viewVisible = false, record: {
        dataName: recordDataName,
        appName: recordAppName,
        status: recordStatus,
        totalCount: recordTotalCount = 0
      } = {}, fileName = '', errMsg = '', viewColumns = [], viewDataSource = [], dependency = false
    } = this.state
    const { appSelect } = this.props
    const columns = [
      {
        title: '数据名称',
        dataIndex: 'dataName',
        key: 'dataName',
        width: '15%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      },
      {
        title: '应用',
        dataIndex: 'appName',
        key: 'appName',
        width: '15%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      },
      {
        title: '记录数',
        dataIndex: 'totalCount',
        key: 'totalCount',
        width: '15%',
        render: text => {
          return <div title={text} className="text-overflow">{text}</div>
        }
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: text => {
          let css = ''
          switch (text) {
            case 'SUCCESS':
              css = 'offline-success'
              text = '成功'
              break
            case 'FAILED':
              css = 'offline-failed'
              text = '失败'
              break
            case 'PROCESSING':
              css = 'offline-processing'
              text = '处理中'
              break
          }
          return <span className={`risk-grade ${css}`}>{text}</span>
        }
      }, {
        title: '创建人',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: 200,
        render: (text, record) => {
          return (<div className="text-overflow" title={text}>{text}</div>)
        }
      }, {
        title: '创建时间',
        dataIndex: 'createTime',
        width: 180,
        key: 'createTime',
        render: text => {
          return formatDate(text)
        }
      }, {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        render: (text, record) => {
          const { id, status } = record
          return <Fragment>
            <span className="operation-span" onClick={() => {
              this.onView(record)
            }}>查看</span>
            {
              status === 'PROCESSING' ? null
                : <span className="operation-span" onClick={() => {
                  this.delData(id)
                }}>删除</span>
            }
          </Fragment>
        }
      }
    ]
    return (
      <Fragment>
        <LayoutRight className="no-bread-crumb">
          <div className="region-zd">
            <Input value={dataName} placeholder="数据名称" style={{ width: 200 }}
                   onChange={(e) => this.onInputChange(e, 'dataName')} />
            <Select value={appId} onChange={(e) => this.onSelectChange(e, 'appId')} placeholder="应用" allowClear
                    style={{ width: 180 }}>
              {
                appSelect.map(app => {
                  const { appId, appName } = app
                  return (
                    <Option key={appId} value={appId.toString()}>{appName}</Option>
                  )
                })
              }
            </Select>
            <Button type="primary" onClick={() => {
              this.realParam = { ...this.state }
              this.getDataList(1)
            }} style={{ marginRight: '10px' }}>查询</Button>
            <Button type="default" onClick={this.onClearClick}>重置</Button>
            <div style={{ float: 'right' }}>
              <Button type="primary" onClick={this.newData}>新建</Button>
            </div>
          </div>
          <div style={{ height: 'calc(100% - 52px)', overflowY: 'scroll' }}>
            <Table rowkey="ruleId" className="table-td-no-auto table-layout-fixed" columns={columns}
                   dataSource={dataSource}
                   locale={{ emptyText: '暂无数据' }} loading={loading}
                   onChange={this.handleChange}
                   pagination={pagination} />
          </div>
        </LayoutRight>
        <Modal
          title=""
          visible={dependency}
          maskClosable={false}
          onCancel={this.onDependencyCancel}
          footer={<Button type="primary" onClick={this.onDependencyCancel}>确定</Button>}
        >
          <i className="anticon anticon-close-circle-fill" style={{
            fontSize: 20,
            color: '#ff2426',
            position: 'absolute',
            left: 18,
            top: 48
          }} />
          <span style={{
            fontSize: 16,
            marginTop: 22,
            display: 'inline-block',
            whiteSpace: 'pre-line',
            fontWeight: 'bold',
            marginLeft: 20
          }}>该离线数据存在关联的离线验证任务，无法删除！</span>
        </Modal>
        <Modal title="查看"
               width={800}
               visible={viewVisible}
               onCancel={this.onCancel}
               footer={<Button type="default" onClick={this.onCancel}>关闭窗口</Button>}>
          <div className="data-item">
            <div className="key">数据名称：</div>
            <div className="value text-overflow" title={recordDataName}>{recordDataName}</div>
          </div>
          <div className="data-item">
            <div className="key">应用：</div>
            <div className="value text-overflow" title={recordAppName}>{recordAppName}</div>
          </div>
          <div className="data-item" style={{ borderBottom: '1px dashed #f1f1f1' }}>
            <div className="key">导入文件：</div>
            <div className="value text-overflow" title={fileName}>{fileName}</div>
          </div>
          {
            recordStatus === 'PROCESSING' ? null
              : <span style={{ display: 'inline-block', height: 40, lineHeight: '40px' }}>
             {
               recordStatus === 'SUCCESS' ? `共${recordTotalCount}条记录：`
                 : recordStatus === 'FAILED' ? '数据解析失败，失败原因如下：' : ''
             }
          </span>
          }
          <div style={{ maxHeight: 400, overflow: 'auto' }}>
            {
              recordStatus === 'SUCCESS'
                ? <Table rowKey="KEY" columns={viewColumns} dataSource={viewDataSource} pagination={false} />
                : recordStatus === 'FAILED' ? errMsg
                : recordStatus === 'PROCESSING' ? <div className="offline-processing-container">文件数据正在处理中，请稍候...</div> : null
            }
          </div>
        </Modal>
      </Fragment>
    )
  }

  onInputChange = (e, field) => {
    this.setState({
      [field]: e.target.value
    })
  }

  handleChange = (pagination) => {
    this.setState({ pagination }, () => {
      this.realParam = { ...this.realParam, pagination }
      this.getDataList(pagination.current)
    })
  }

  newData = () => {
    const { dataName, appId } = this.state
    this.props.history.push({
      pathname: '/policy/verification/offline/new',
      state: {
        conditions: { dataName, appId },
        backUrl: '/policy/verification/offline'
      }
    })
  }

  onClearClick = () => {
    this.setState({
      dataName: '', appId: undefined
    }, () => {
      this.realParam = { ...this.state }
    })
  }

  onSelectChange = (value = undefined, field) => {
    this.setState({ [field]: value })
  }

  getDataList = async (pageNum = 1) => {
    const { dataName, appId, pagination } = this.realParam
    const { pageSize } = pagination
    const data = {
      dataName,
      appId,
      pageNum,
      pageSize
    }
    this.setState({
      loading: true
    })
    await getOfflineDataList(data).then(res => {
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
    }).catch((data) => {
      notification.warning(data.content)
      this.setState({
        loading: false
      })
    })
  }

  onView = record => {
    const { id } = record
    getOfflineDataDetail({ id }).then(res => {
      const { content: { fileName = '', heads = [], data = [], errMsg = '' } = {} } = res
      const viewColumns = heads.map(h => {
        const { name, code, type } = h
        return {
          title: name,
          dataIndex: code,
          key: code,
          width: 100,
          render: text => {
            const textDisplay = type === 'DATETIME' ? formatDate(text)
              : type === 'BOOLEAN' ? text === 'true' ? '是' : '否'
                : text
            return <div title={textDisplay} className="text-overflow">{textDisplay}</div>
          }
        }
      })
      data.forEach((d, index) => {
        d.KEY = index
      })

      this.setState({
        viewVisible: true,
        record,
        fileName,
        errMsg,
        viewColumns,
        viewDataSource: data
      })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  onCancel = () => {
    this.setState({
      viewVisible: false,
      record: {}
    })
  }

  onDependencyCancel = () => {
    this.setState({
      dependency: false
    })
  }

  delData = (id) => {
    offlineDataDependencies({ id }).then(data => {
      const { content: offlineDataDependencies = [] } = data
      if (offlineDataDependencies.length > 0) {
        this.setState({
          dependency: true,
          offlineDataDependencies
        })
      } else {
        confirm({
          title: '是否确认删除?',
          content: '',
          okText: '确定',
          okType: 'primary',
          cancelText: '取消',
          onOk: async () => {
            deleteOfflineData({ id }).then(() => {
              const { pagination: { current = 1 } = {} } = this.realParam
              this.getDataList(current)
            }).catch((data) => {
              notification.warning(data.content)
            })
          }
        })
      }
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VerificationOffline)
