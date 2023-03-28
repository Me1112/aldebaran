import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { getIncomeFields, postDiffTest } from '../../../../action/rule'
import { Tabs, Icon, Input, InputNumber, DatePicker, Select, notification } from 'antd'
import { rulesNameMap as rulesDiffNameMap } from '../../../../common/key_to_chinese'
import './index.less'
import LayoutRight from '../../../../component/layout_right'

const { TabPane } = Tabs
const Option = Select.Option

function tableValueInit(data) {
  if (data === null) {
    return '--'
  }
  if (typeof data === 'object') {
    console.log('err', data)
    return {
      length: data.length,
      value: data
    }
  }
  return data
}

class DiffFirstLayer extends React.PureComponent {
  static propTypes = {
    data: PropTypes.object,
    className: PropTypes.any,
    type: PropTypes.any
  }

  render() {
    const { data, className = '', type } = this.props
    const columns = Object.keys(data)
    const row = Object.values(data)
    console.log(data)
    return (
      <table className={`rule-diff-table ${className}`}>
        <tbody>
        {
          columns.map((col, colIndex) => {
            const value = tableValueInit(row[colIndex])
            const { value: vList } = value
            return (<tr key={colIndex}>
              <td className="cell">{rulesDiffNameMap[col] || col}</td>
              {typeof value === 'object' ? (<td>
                {
                  vList.length === 0 ? null : vList.map((list, liIndex) => {
                    return <RulesDiffShow key={liIndex} label={type === 'res' ? '命中规则' : '规则'} index={liIndex}>
                      <DiffSecondFloor key={liIndex} index={liIndex} data={list} />
                    </RulesDiffShow>
                  })
                }
              </td>) : (<td className="cell">{this.matchValue(`${value}`)}</td>)}
            </tr>)
          })
        }
        </tbody>
      </table>
    )
  }

  matchValue = (value) => {
    if (value === 'true') {
      return '成功'
    }
    if (value === 'false') {
      return '失败'
    }
    return value
  }
}

class DiffSecondFloor extends React.PureComponent {
  static propTypes = {
    data: PropTypes.object
  }

  render() {
    const { data } = this.props
    const columns = Object.keys(data)
    const row = Object.values(data)
    console.log('DiffSecondFloor', data)
    return (
      <table className="rule-diff-table">
        <tbody>
        {
          columns.map((col, colIndex) => {
            const value = tableValueInit(row[colIndex])
            const { value: vList } = value
            return (<tr key={colIndex}>
              <td className="cell">{rulesDiffNameMap[col] || col}</td>
              {typeof vList === 'object' ? (<td>
                <DiffThirdLayer data={data} />
              </td>) : (<td className="cell">{value}</td>)}
            </tr>)
          })
        }
        </tbody>
      </table>
    )
  }
}

class DiffThirdLayer extends React.PureComponent {
  static propTypes = {
    data: PropTypes.object
  }

  render() {
    const { data } = this.props
    const { conditionTypeDtoList = [] } = data
    console.log('data', data)
    console.log('conditionTypeDtoList', conditionTypeDtoList)
    return (<Fragment>
        {
          conditionTypeDtoList.map((list, lIndex) => {
            const { conditionTypeName, conditionDtoList = [] } = list
            return <div className="condition-list" key={lIndex}>
              <div className="condition-list-name">
                {conditionTypeName}
              </div>
              <div className="condition-list-right">
                {
                  conditionDtoList.length > 0 ? conditionDtoList.map((cList, cIndex) => {
                    return <RulesDiffShow key={cIndex} label={conditionTypeName} index={cIndex}>
                      <DiffFirstLayer data={cList} />
                    </RulesDiffShow>
                  }) : null
                }
              </div>
            </div>
          })
        }</Fragment>
    )
  }
}

class RulesDiffShow extends React.PureComponent {
  state = {
    isShow: true
  }
  static propTypes = {
    children: PropTypes.any,
    label: PropTypes.any,
    index: PropTypes.any
  }

  render() {
    const { children, label, index } = this.props
    console.log('label', label)
    const { isShow } = this.state
    return (<div className="cell-list">
      <div style={{ marginBottom: '10px' }}>
        <span className="rule-diff-show-btn">
        <Icon type={isShow ? 'line' : 'plus'} onClick={() => {
          this.setState({
            isShow: !isShow
          })
        }} /></span>
        {label}{index + 1}
      </div>
      <div style={{ display: isShow ? 'block' : 'none' }}>
        {children}
      </div>
    </div>)
  }
}

export default class RulesDiffs extends React.Component {
  state = {
    rulesInfo: []
  }
  static propTypes = {
    location: PropTypes.object,
    history: PropTypes.any
  }

  componentDidMount() {
    const { data } = this.props.location
    if (!data) {
      this.props.history.push({ pathname: '/policy/bazaar/collection' })
    }
    this.setState({
      ...data
    })
    this.getIncomeFields()
  }

  render() {
    const { rulesInfo = [] } = this.state
    return (
      <LayoutRight breadCrumb={['策略配置', '策略集市', '规则集', '规则集对比']} type={'tabs'}>
        <Tabs type="card" className={'tabs-no-border'}>
          <TabPane tab="规则集对比" key={'RULES_DIFF'}>
            <div className="rule-diff-layout">
              {rulesInfo.map((rules, index) => {
                return (<div key={index} className="rules-diff-box table-td-no-auto"><DiffFirstLayer
                  className={'rule-diff-table-first'} data={rules} />
                </div>)
              })}
            </div>
          </TabPane>
        </Tabs>
      </LayoutRight>
    )
  }

  startTest = () => {
    const { testDiff = {} } = this.state
    const { data: state = {} } = this.props.location
    const { diffId } = state
    console.log('testDiff', testDiff, Object.values(testDiff), Object.values(testDiff).indexOf(undefined))
    if (Object.values(testDiff).indexOf(undefined) > -1 || Object.values(testDiff).indexOf('') > -1) {
      return
    }
    const data = {
      incomeParams: JSON.stringify(testDiff),
      ruleSetIds: diffId
    }
    postDiffTest(data).then(res => {
      console.log(res)
      const { content = [] } = res
      this.setState({
        diffTestRes: content
      })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getFormItem = (key, record) => {
    const { enumOptionDtoList = [], filed } = record
    switch (key) {
      case 'long':
        return (<div>
          <InputNumber maxLength="50" style={{ width: '150px' }} placeholder="请输入数字" onChange={(e) => {
            this.FormItemChange(e, filed)
          }} />
        </div>)
      case 'decimal':
        return (<div>
          <InputNumber maxLength="50" style={{ width: '150px' }} placeholder="请输入数字" onChange={(e) => {
            this.FormItemChange(e, filed)
          }} />
        </div>)
      case 'string':
        return (<div>
          <Input maxLength="50" style={{ width: '150px' }} placeholder="请输入字符" onChange={(e) => {
            console.log('string', e)

            this.FormItemChange(e.target.value, filed)
          }} />
        </div>)
      case 'date':
        return (<div>
          <DatePicker style={{ width: '150px' }} onChange={(e) => {
            console.log('date', e)

            this.FormItemChange(e, filed)
          }} />
        </div>)
      case 'boolean':
        return (<div>
          <Select style={{ width: '150px' }} placeholder="请选择" onChange={(e) => {
            this.FormItemChange(e, filed)
          }}>
            <Option value={1}>是</Option>
            <Option value={0}>否</Option>
          </Select>
        </div>)
      case 'enum':
        return (<div>
          <Select style={{ width: '150px' }} placeholder="请选择" onChange={(e) => {
            this.FormItemChange(e, filed)
          }}>
            {
              enumOptionDtoList.map(item => {
                const { optionValue, optionKey } = item
                return <Option key={optionKey} value={optionKey}>{optionValue}</Option>
              })
            }
          </Select>
        </div>)
    }
  }
  FormItemChange = (value, key) => {
    const { testDiff = {} } = this.state
    testDiff[key] = value
    this.setState({ testDiff })
  }
  getIncomeFields = () => {
    const { data = {} } = this.props.location
    const { diffId } = data
    getIncomeFields({ ruleSetIds: diffId }).then(res => {
      console.log('getIncomeFields', res)
      const { content = [] } = res
      let testDiff = {}
      const incomeFieldsData = content.map((item, index) => {
        const { filed } = item
        if (filed) {
          testDiff[filed] = undefined
        }
        item.key = index
        return item
      })
      this.setState({
        incomeFieldsData,
        testDiff
      })
    }).catch(data => {
      const { content = {} } = data
      if (!content.message) {
        content.message = '请选择规则集'
      }
      notification.warn(content)
    })
  }
}
