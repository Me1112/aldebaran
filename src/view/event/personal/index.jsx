import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { Tabs, Input, Table, Form, Row, notification } from 'antd'
import { PERSONAL_STATS } from '../../../common/event_constant'
import {
  getPersonalList
} from '../../../action/event'
import { SUCCESS } from '../../../common/constant'
import { connect } from 'react-redux'

const { TabPane } = Tabs

function mapStateToProps(state) {
  return {}
}

function mapDispatchToProps(dispatch) {
  return {
    getPersonalList: bindActionCreators(getPersonalList, dispatch)
  }
}

class RuleList extends Component {
  state = {
    accountIdVal: '',
    personalList: []
  }

  static propTypes = {
    location: PropTypes.object,
    getPersonalList: PropTypes.func.isRequired
  }

  componentDidMount() {
    const { state = {} } = this.props.location
    if (state) {
      const { accountId = '' } = state
      this.setState({
        accountIdVal: accountId
      }, () => {
        this.onPersonalQuery()
      })
    } else {
      this.onPersonalQuery()
    }
  }

  render() {
    const { accountIdVal, personalList } = this.state
    const dataSource = personalList
    const columns = [
      {
        title: '姓名',
        dataIndex: 'accountName2',
        key: 'accountName2',
        render: (text, record) => {
          const { eventRec = {} } = record
          const { accountName2 = '' } = eventRec
          return accountName2 || ''
        }
      }, {
        title: '年龄',
        dataIndex: 'age',
        key: 'age'
      }, {
        title: '性别',
        dataIndex: 'sex',
        key: 'sex'
      }, {
        title: '身份证号',
        dataIndex: 'accountId',
        key: 'accountId',
        render: (text, record) => {
          const { eventRec = {} } = record
          const { accountId = '' } = eventRec
          return accountId
        }
      }, {
        title: '身份证省市',
        dataIndex: 'cardProvince',
        key: 'cardProvince'
      }, {
        title: '手机号',
        dataIndex: 'mobile',
        key: 'mobile',
        render: (text, record) => {
          const { eventRec = {} } = record
          const { mobile = '' } = eventRec
          return mobile
        }
      }, {
        title: '手机号省市',
        dataIndex: 'mobileProvince',
        key: 'mobileProvince',
        render: (text, record) => {
          const { eventRec = {} } = record
          const { mobileProvince = '' } = eventRec
          return mobileProvince
        }
      }, {
        title: '籍贯',
        dataIndex: 'cardCity',
        key: 'cardCity'
      }, {
        title: '出生日期',
        dataIndex: 'birthDay',
        key: 'birthDay'
      }]

    return (
      <Tabs type="card">
        <TabPane tab="个人统计" key={PERSONAL_STATS}>
          <div className="region-zd">
            <Row>
              <Input placeholder="身份证号码" style={{ width: 300 }}
                     value={accountIdVal}
                     onChange={this.onAccountIdChange} />
              <i className="anticon anticon-search" title="搜索" onClick={this.onPersonalQuery} />
            </Row>
          </div>
          <div style={{ height: 'calc(100% - 120px)', overflowY: 'scroll' }}>
            <Table columns={columns} dataSource={dataSource}
                   pagination={false} />
          </div>
        </TabPane>
      </Tabs>
    )
  }

  onPersonalQuery = async () => {
    const { accountIdVal } = this.state
    const { promise } = await this.props.getPersonalList({ accountId: accountIdVal })
    promise.then((data) => {
      let contentList = []
      let { actionStatus = '', content } = data
      if (actionStatus === SUCCESS && content !== null) {
        content.key = 1
        contentList = [content]
      }
      this.setState({
        personalList: contentList
      })
    }).catch((data) => {
      this.setState({
        personalList: []
      })
      const { content = {} } = data
      notification.warn(content)
    })
  }

  onAccountIdChange = (e) => {
    const value = e.target.value
    this.setState({ accountIdVal: value })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(RuleList))
