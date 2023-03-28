import React, { Component } from 'react'
import { Popover, Icon, Table, notification } from 'antd'
import { getDownloadRecords } from '../../action/download'
import './index.less'
import { DMS_PREFIX } from '../../common/constant'

export default class Download extends Component {
  state = {
    visible: false,
    dataSource: []
  }

  static propTypes = {}

  render() {
    const {
      visible,
      dataSource = []
    } = this.state

    const columns = [{
      title: '文件名',
      dataIndex: 'sourceName',
      key: 'sourceName',
      width: 400,
      render: text => {
        return <div title={text} className="text-overflow">{text}</div>
      }
    }, {
      title: '操作',
      dataIndex: 'operations',
      key: 'operations',
      width: 50,
      render: (text, record) => {
        return <span className="operation-span" onClick={() => this.downloadFile(record)}>下载</span>
      }
    }]

    return (
      <div className="download-info">
        <Popover placement="bottomRight" arrowPointAtCenter
                 visible={visible}
                 onVisibleChange={this.onVisibleChange}
                 overlayClassName="download-popover"
                 content={
                   <div className="detail">
                     <div className="title">
                       下载中心
                     </div>
                     <div className="content">
                       <Table rowKey="id" size="small" locale={{ emptyText: '暂无数据' }}
                              className="table-layout-fixed" columns={columns} dataSource={dataSource}
                              pagination={false} />
                     </div>
                   </div>
                 } trigger="click">
          <div className="alarm-info">
            <Icon type="download" />
          </div>
        </Popover>
      </div>
    )
  }

  onVisibleChange = visible => {
    this.setState({
      visible
    }, () => {
      if (visible) {
        this.getDownloadFiles()
      }
    })
  }

  getDownloadFiles = () => {
    getDownloadRecords().then(data => {
      const { content: dataSource = [] } = data
      this.setState({
        dataSource
      })
    }).catch((data) => {
      notification.warn(data.content)
    })
  }

  downloadFile = record => {
    window.open(`/${DMS_PREFIX}/download/file?id=${record.id}`)
  }
}
