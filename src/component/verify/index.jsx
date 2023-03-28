import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Radio } from 'antd'
import { fromJS, is } from 'immutable'

const COMPARISON_RESULT = {
  newCreated: '新增规则',
  deleted: '删除规则',
  enableOrDisabled: '开启/关闭规则',
  modified: '编辑规则'
}

const DEPENDENCE_TYPE = {
  ExternalAccess: '外部接入',
  DecisionStream: '决策流'
}

export default class Verify extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...props
    }
  }

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    record: PropTypes.object.isRequired,
    info: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    updateVerification: PropTypes.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const { visible, record, info } = nextProps
    if (visible !== this.state.visible) {
      this.setState({
        visible,
        versionType: 'ALPHA'
      })
    }
    if (!is(fromJS(record), fromJS(this.state.record))) {
      this.setState({
        record
      })
    }
    if (!is(fromJS(info), fromJS(this.state.info))) {
      this.setState({
        info
      })
    }
  }

  componentDidMount() {
  }

  render() {
    const {
      visible = false,
      record: {
        operation
      } = {},
      info: {
        currentVersion,
        comparisonVersion,
        comparisonResult = {},
        dependenceResps = []
      } = {},
      versionType = 'ALPHA'
    } = this.state
    const {
      newCreated = [],
      deleted = [],
      enableOrDisabled = [],
      modified = []
    } = comparisonResult
    return <Modal title="策略审批" width="800px"
                  visible={visible}
                  onCancel={this.onCancel}
                  footer={<Fragment>
                    {
                      operation !== 'REVERT_ONLINE' ? <div style={{ float: 'left' }}>
                        版本类型：
                        <Radio.Group onChange={this.versionChange} value={versionType}>
                          <Radio value="BETA">大版本</Radio>
                          <Radio value="ALPHA">小版本</Radio>
                        </Radio.Group>
                      </div> : null
                    }
                    <Button type="default" onClick={this.onCancel}>取消</Button>
                    <Button type="default" onClick={this.reject}>驳回</Button>
                    <Button type="primary" onClick={this.pass}>批准</Button>
                  </Fragment>}
    >
      <div>
        <div className="verify-half">
          <div className="title">
            {
              operation === 'OPTIMIZATION_ONLINE' ? `无线上版本，存在历史版本。` : ''
            }
            当前版本{currentVersion}与版本{comparisonVersion}差异如下：
          </div>
          {
            [...newCreated, ...deleted, ...enableOrDisabled, ...modified].length > 0
              ? Object.keys(COMPARISON_RESULT).map(comparisonField => {
                const { [comparisonField]: resultList = [] } = comparisonResult
                return resultList.length > 0 ? <div className="comparison-detail" key={comparisonField}>
                  <div>{COMPARISON_RESULT[comparisonField]}:</div>
                  {
                    resultList.map((result, index) => {
                      return <div className="item text-overflow" key={index} title={result}>{index + 1}.{result}</div>
                    })
                  }
                </div> : null
              }) : `无规则差异`
          }
        </div>
        {
          dependenceResps.length > 0 ? <div className="verify-half">
            <div className="title">线上版本{comparisonVersion}被以下组件使用，审批影响范围如下：</div>
            {
              Object.keys(DEPENDENCE_TYPE).map(type => {
                const dependenceList = dependenceResps.filter(d => d.dependenceType === type)
                return dependenceList.length > 0 ? <div className="comparison-detail" key={type}>
                  <div>{DEPENDENCE_TYPE[type]}：</div>
                  {
                    dependenceList.map((dependence, index) => {
                      const { dependencePath = '' } = dependence
                      return <div className="item text-overflow" key={index}
                                  title={dependencePath}>{index + 1}.{dependencePath}</div>
                    })
                  }
                </div> : null
              })
            }
          </div> : null
        }
      </div>
    </Modal>
  }

  versionChange = e => {
    this.setState({
      versionType: e.target.value
    })
  }

  onCancel = () => {
    this.props.onCancel()
  }

  reject = () => {
    const {
      record: {
        operation,
        verificationId = ''
      } = {},
      versionType = 'ALPHA'
    } = this.state
    this.props.updateVerification({
      status: 'reject',
      verificationIds: verificationId,
      versionType: operation === 'REVERT_ONLINE' ? undefined : versionType
    })
  }

  pass = () => {
    const {
      record: {
        operation,
        verificationId = ''
      } = {},
      versionType = 'ALPHA'
    } = this.state
    this.props.updateVerification({
      status: 'pass',
      verificationIds: verificationId,
      versionType: operation === 'REVERT_ONLINE' ? undefined : versionType
    })
  }
}
