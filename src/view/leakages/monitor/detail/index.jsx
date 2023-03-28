import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  Button,
  notification,
  Table
} from 'antd'
import LayoutRight from '@component/layout_right'

import {
  fetchExecuteMonitorDetail
} from '@action/leakage'
import { TRIGGER_TYPE_MAP } from '@common/constant'
import * as Utils from '../../util'
import { calTextWith } from '@util'
import './index.less'

export default class MonitorDetail extends Component {
  state = {
    domainType: 'ANTI_LEAKAGE'
  }

  static propTypes = {
    history: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { match: { params: { id: ruleId } = {} } = {} } = this.props
    const { location: { state: { conditions = {} } = {} } = {} } = this.props
    fetchExecuteMonitorDetail({ ruleId, ...conditions }).then(data => {
      const { content = {} } = data
      const { inputParamData = {} } = content
      const inputParameters = inputParamData['tx_paramater'] || {}
      let inputParameters2String = {}
      let basicColumn = []
      let listColumn = []
      let dataSource = []
      Object.keys(inputParameters).forEach((param) => {
        const value = inputParameters[param]
        if (typeof value === 'object') {
          value.forEach((row) => {
            Object.keys(row).forEach((column) => {
              if (!listColumn.includes(column)) {
                listColumn.push(column)
              }
            })
          })
          dataSource = value.map((row) => {
            let data = {}
            listColumn.forEach((key) => {
              data = { ...data, [`LIST_${key}`]: `${row[key]}` }
            })
            return data
          })
        } else {
          basicColumn.push(param)
          inputParameters2String = { ...inputParameters2String, [param]: `${value}` }
        }
      })
      const inputColumns = [...basicColumn.map((column) => {
        const width = calTextWith(column, { fontWeight: 500, fontSize: 14 }) + 32
        return {
          title: column,
          dataIndex: column,
          key: column,
          width: width < 180 ? 180 : width,
          onCell: (record) => {
            return { title: `${record[column]}` }
          },
          render: (text, record) => {
            const { rowSpan } = record
            return {
              children: text,
              props: {
                rowSpan
              }
            }
          }
        }
      }), ...listColumn.map((column) => {
        const dataIndex = `LIST_${column}`
        const width = calTextWith(column, { fontWeight: 500, fontSize: 14 }) + 32
        return {
          title: column,
          dataIndex,
          key: dataIndex,
          width: width < 180 ? 180 : width,
          onCell: (record) => {
            return { title: record[dataIndex] }
          }
        }
      })]
      let inputDataSource = [{ key: -1, ...inputParameters2String }]
      if (dataSource.length) {
        inputDataSource = dataSource.map((row, index) => {
          let data = {}
          basicColumn.forEach((column) => {
            data = { ...data, [column]: inputParameters2String[column] }
          })
          return { key: index, ...row, ...data, rowSpan: index === 0 ? dataSource.length : 0 }
        })
      }
      this.setState({ ...content, inputColumns, inputDataSource })
    }).catch((data) => {
      notification.warning(data.content)
    })
  }

  render() {
    const {
      logicExpression,
      effectOfTime,
      executionTime,
      triggerResult,
      hitTemplateList = [],
      inputColumns = [],
      inputDataSource = []
    } = this.state

    const columns = [
      {
        title: '因子模板名称',
        dataIndex: 'templateName',
        key: 'templateName',
        onCell: (record) => {
          const { templateName } = record
          return { title: templateName }
        }
      }, {
        title: '因子模板编码',
        dataIndex: 'templateCode',
        key: 'templateCode',
        width: 160,
        onCell: (record) => {
          const { templateCode } = record
          return { title: templateCode }
        }
      }, {
        title: '因子模板逻辑',
        dataIndex: 'expressionDescription',
        key: 'expressionDescription',
        render: (text) => {
          let record = {}
          try {
            record = JSON.parse(text)
          } catch (e) {
            console.log(e)
          }
          return Utils._renderExpression(record, { className: 'shown-all', mode: 'VIEW' })
        }
      }, {
        title: '状态',
        dataIndex: 'triggerResult',
        key: 'triggerResult',
        width: 90,
        render: (text) => {
          return TRIGGER_TYPE_MAP[text]
        }
      }, {
        title: '执行值',
        dataIndex: 'executeValue',
        key: 'executeValue'
      }]

    return (
      <Fragment>
        <LayoutRight className="leakage-monitor-layout no-bread-crumb">
          <div className="basic-info">
            <div>
              <div className="label">执行时间</div>
              {executionTime}
            </div>
            <div>
              <div className="label">执行结果</div>
              {TRIGGER_TYPE_MAP[triggerResult]}
            </div>
            <div>
              <div className="label">生效时间</div>
              {effectOfTime}
            </div>
            <div>
              <div className="label">运算逻辑</div>
              <div>{logicExpression}</div>
            </div>
          </div>
          <Table rowKey={'templateCode'} className="template-list ellipsis" columns={columns}
                 dataSource={hitTemplateList} pagination={false} bordered />
          <div style={{ overflow: 'auto' }}>
            <Table className="ellipsis" columns={inputColumns}
                   dataSource={inputDataSource} pagination={false} bordered />
          </div>
        </LayoutRight>
        <div className="view-back">
          <Button onClick={this.onCancel}>返回</Button>
        </div>
      </Fragment>
    )
  }

  onCancel = () => {
    const { location: { state: { pathname, ...state } = {} } = {} } = this.props
    this.props.history.push({ pathname, state })
  }
}
