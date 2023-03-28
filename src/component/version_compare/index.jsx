import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Select } from 'antd'
import { fromJS, is } from 'immutable'

const { Option } = Select

const COMPARISON_RESULT = {
  newCreated: '新增规则',
  deleted: '删除规则',
  enableOrDisabled: '开启/关闭规则',
  modified: '编辑规则'
}

export default class VersionCompare extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...props
    }
  }

  static propTypes = {
    visible: PropTypes.bool.isRequired,
    versions: PropTypes.array.isRequired,
    currentRuleSet: PropTypes.object.isRequired,
    comparisonResult: PropTypes.any,
    onCancel: PropTypes.func.isRequired,
    versionCompare: PropTypes.func.isRequired
  }

  componentWillReceiveProps(nextProps) {
    const { visible, currentRuleSet, comparisonResult, versions } = nextProps
    if (visible !== this.state.visible) {
      this.setState({
        visible,
        comparisonRuleSetId: undefined
      })
    }
    if (!is(fromJS(currentRuleSet), fromJS(this.state.currentRuleSet))) {
      this.setState({
        currentRuleSet
      })
    }
    if (!is(fromJS(comparisonResult), fromJS(this.state.comparisonResult))) {
      this.setState({
        comparisonResult
      })
    }
    if (!is(fromJS(versions), fromJS(this.state.versions))) {
      this.setState({
        versions
      })
    }
  }

  componentDidMount() {
  }

  render() {
    const {
      visible = false,
      versions = [],
      currentRuleSet: { name = '' } = {},
      comparisonRuleSetId,
      comparisonResult = {}
    } = this.state
    const {
      newCreated = [],
      deleted = [],
      enableOrDisabled = [],
      modified = []
    } = comparisonResult
    return <Modal title="版本对比" width="800px"
                  visible={visible}
                  onCancel={this.onCancel}
                  footer={<Button type="default" onClick={this.onCancel}>关闭窗口</Button>}
    >
      <div>
        <div className="verify-half">
          <div>当前版本：{name}</div>
          <div>对比版本：<Select value={comparisonRuleSetId} onChange={this.onChange}
                            placeholder="请选择" allowClear
                            style={{ width: 'calc(100% - 72px)', marginTop: 10 }}>
            {
              versions.map(version => {
                const { strategyStatus, name, rulesetId } = version
                return (
                  <Option value={rulesetId} key={rulesetId}>
                    {
                      ['ONLINE', 'USED', 'OFFLINE_ING'].indexOf(strategyStatus) !== -1
                        ? <div className={'running-status'} style={{ marginRight: 10 }}>线</div> : null
                    }
                    {name}
                  </Option>
                )
              })
            }
          </Select></div>
          <Button type="primary" onClick={this.onVersionCompare} disabled={!comparisonRuleSetId}
                  style={{ marginLeft: 70, marginTop: 10 }}>对比</Button>
        </div>
        <div className="verify-half">
          <div className="title">
            对比结果
          </div>
          {
            this.state.comparisonResult ? [...newCreated, ...deleted, ...enableOrDisabled, ...modified].length > 0
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
              }) : `无规则差异` : null
          }
        </div>
      </div>
    </Modal>
  }

  onChange = comparisonRuleSetId => {
    this.setState({
      comparisonRuleSetId
    })
  }

  onCancel = () => {
    this.props.onCancel()
  }

  onVersionCompare = () => {
    const {
      currentRuleSet: {
        ruleSetId: currentRuleSetId = ''
      } = {},
      comparisonRuleSetId = ''
    } = this.state
    this.props.versionCompare({ currentRuleSetId, comparisonRuleSetId })
  }
}
