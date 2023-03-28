import React from 'react'
import moment from 'moment'
import { InputNumber, Button, Modal, Input, DatePicker, Select, notification, Table } from 'antd'
import { CCIFormItem, validateFields } from '../../../component/form'
import {
  // getFieldList,
  getCalculationTypeList,
  fieldCheck,
  // getCharacterList,
  updateScorecardCharacter,
  addScorecardCharacter,
  getCharactersList,
  updateScorecardBasic,
  updateRangeScore,
  delCharacter,
  validationFormula,
  getFieldsAndFactors
} from '../../../action/scorecard'
// import { getFieldList } from '../../../action'
import { getOperators } from '../../../action/common'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { Map } from 'immutable/dist/immutable'
import connect from 'react-redux/es/connect/connect'
import { getCursorPosition, initFieldListData } from '../../../util'

const { Option, OptGroup } = Select
const { TextArea } = Input
const confirm = Modal.confirm

function mapStateToProps(state) {
  const { rule = Map({}) } = state
  const { fieldTypeList = [], allOperators = {} } = rule.toJS()
  return { fieldTypeList, allOperators }
}

function mapDispatchToProps(dispatch) {
  return {
    getOperators: bindActionCreators(getOperators, dispatch)
  }
}

const DATETIME = 'DATETIME'
const BOOLEAN = 'BOOLEAN'
const DECIMAL = 'DECIMAL'
// const STRING = 'STRING'
const ENUM = 'ENUM'
@connect(mapStateToProps, mapDispatchToProps)
export default class Config extends React.Component {
  state = {
    visible: false,
    scoringItems: [],
    calculationType: 'section',
    fieldList: []
  }

  static propTypes = {
    getOperators: PropTypes.func.isRequired,
    allOperators: PropTypes.object.isRequired,
    // fieldTypeList: PropTypes.array.isRequired,
    id: PropTypes.any,
    businessLineId: PropTypes.number,
    isView: PropTypes.any
    // baseScore: PropTypes.any
  }

  componentDidMount() {
    this.getFieldListFun()
    this.props.getOperators()
    this.getCalculationTypeList()
    this.getCharactersList()
    const { id: scoreCardId = '' } = this.props
    this.setState({
      scoreCardId
    })
  }

  componentWillReceiveProps(nextProps) {
    const { id } = nextProps
    console.log('nextProps', nextProps)
    const { scoreCardId } = this.state
    if (scoreCardId !== id) {
      this.setState({
        scoreCardId: id
      })
    }
  }

  render() {
    const { isView = false } = this.props
    const { fieldList = [], calculationTypeList = [], field, calculationType, weight, validate = {}, charactersDataSource = [], baseScore, baseScoreValidata = {} } = this.state
    const { field: validateField = {}, calculationType: validateCalculationType = {}, weight: validateWeight = {} } = validate
    const columns = [
      {
        title: '评分项/评分字段',
        dataIndex: 'field',
        key: 'field',
        width: '40%',
        render: (text, data) => {
          const { field, fieldName, fieldCategory } = data
          const fieldDisplay = fieldCategory === 'FACTOR' ? field.substring(7) : field // 指标去除field前缀'factor_'
          return <div>{`${fieldDisplay}-${fieldName}`}</div>
        }
      },
      {
        title: '评分分数',
        dataIndex: 'key',
        key: 'key',
        width: '30%',
        render: (text, data) => {
          return <div>-</div>
        }
      },
      {
        title: '系数/公式',
        dataIndex: 'weight',
        key: 'weight',
        width: '20%',
        render: (text, data) => {
          const { weight, formula } = data
          const formulaText = formula || weight
          return <div className={'text-overflow'} title={formulaText}
                      style={{ color: weight ? '#1d94a1' : '' }}>{formulaText}</div>
        }
      }
    ]
    if (!isView) {
      columns.push({
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        width: '10%',
        render: (text, record) => {
          const { id } = record
          return <span>
              <i className="anticon anticon-edit"
                 title="编辑"
                 onClick={() => {
                   this.editScoreItem(record)
                 }} />
            <i className="anticon anticon-delete"
               title="删除" onClick={() => {
              confirm({
                title: '是否确认删除?',
                content: '',
                okText: '确定',
                okType: 'primary',
                cancelText: '取消',
                onOk: async () => {
                  this.delCharacter(id)
                }
              })
            }} />
          </span>
        }
      })
    }
    const disabled = !this.dataTypeDisable()
    return (
      <div className={'config'}>
        <div className={'header'}>
          <CCIFormItem label={'初始评分'} validate={baseScoreValidata} width={400} colon required>
            <InputNumber style={{ width: '100%' }} maxLength={50} onBlur={this.updateScorecardBasic}
                         onChange={this.changeBaseScore}
                         value={baseScore}
                         placeholder={'数值'} disabled={isView} />
          </CCIFormItem>
          {
            !isView ? <div style={{ width: '200px', textAlign: 'right' }}>
              <Button type={'primary'} onClick={this.addScorecItem}>添加评分项</Button>
            </div> : null
          }
        </div>
        <Table className={'table-td-no-auto'}
               style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}
               dataSource={charactersDataSource}
               pagination={false}
               footer={this.tableFooter}
               rowClassName={this.rowClassName}
               expandedRowRender={this.expandedRowRender} columns={columns} />
        <Modal title="添加评分项"
               width={900}
               className={'config-field-modal'}
               visible={this.state.visible}
               onOk={this.saveAddScore}
               okText={'保存'}
               onCancel={() => {
                 this.setState({ visible: false })
               }}>
          <div>
            <div className={'display-flex'}>
              <CCIFormItem label={'参数名'} type={'line'} validate={validateField} width={300} colon required>
                <Select placeholder={'选择参数名'} value={field} onChange={this.changeField} style={{ width: '100%' }}>
                  {
                    fieldList.map(item => {
                      return this.fieldOpt(item)
                    })
                  }
                </Select>
              </CCIFormItem>
              <CCIFormItem label={'计算类型'} width={300} validate={validateCalculationType} colon required>
                <Select placeholder={'选择参数名'} disabled={disabled}
                        value={calculationType}
                        onChange={this.changeCalculationType}
                        style={{ width: '100%' }}>
                  {
                    calculationTypeList.map(item => {
                      const { name, index } = item
                      return <Option key={index} value={index}>{name}</Option>
                    })
                  }
                </Select>
              </CCIFormItem>
            </div>
            {
              calculationType !== 'linearity'
                ? <div className={'display-flex'}>
                  <CCIFormItem label={'系数'} width={300} validate={validateWeight} colon required>
                    <InputNumber style={{ width: '100%' }} maxLength={50} value={weight} onChange={this.changeWeight}
                                 placeholder={'数值'} />
                  </CCIFormItem>
                </div> : null
            }
            <div className="field-table">
              {this.getElementTable()}
            </div>
          </div>
        </Modal>
      </div>
    )
  }

  fieldOpt = item => {
    const { name, list = [] } = item
    return <OptGroup key={name} value={name}>
      {
        list.map(l => {
          const { fieldName, fieldDisplayName } = l
          return <Option key={fieldName} dataobj={l} value={fieldName}
                         title={fieldDisplayName}>{fieldDisplayName}</Option>
        })
      }</OptGroup>
  }
  dataTypeDisable = () => {
    const { dataType } = this.state
    if (dataType === DECIMAL) {
      return true
    }
    return false
  }
  rowClassName = (data) => {
    const { formula } = data
    let className = ''
    if (formula) {
      className = 'no-formula'
    }
    return className
  }
  tableFooter = () => {
    const { finalExpression = '' } = this.state
    return <span>评分卡结果：{finalExpression}</span>
  }
  getFieldListFun = async () => {
    this.getFieldsAndFactors()
  }

  editScoreItem = data => {
    console.log('editScoreItem', data)
    const { id, formula, field, calculationType, weight, ranges, fieldName } = data
    const { fieldList } = this.state
    let dataType

    Object.values(fieldList).forEach(item => {
      const { list = [] } = item
      list.forEach(obj => {
        if (obj.fieldName === field) {
          dataType = obj.dataType
        }
      })
    })
    this.setState({
      visible: true,
      characterId: id,
      scoringItems: ranges,
      formula,
      field,
      fieldName: `${fieldName}`,
      calculationType,
      weight,
      dataType
    }, () => {
      const fieldListFlat = fieldList.map(f => f.list).flat()
      const { fieldDataCategory: fieldCategory = 'FIELD' } = fieldListFlat.find(f => f.fieldName === field) || {}
      this.fieldCheck({
        field,
        scoreCardId: this.state.scoreCardId,
        id,
        fieldCategory
      })
    })
    this.getCharacterList(dataType)
  }

  changeBaseScore = e => {
    this.setState({
      baseScore: e
    })
  }

  expandedRowRender = (record, index, data) => {
    console.log('expandedRowRender', record, index, data)
    const { ranges, formula } = record
    if (formula) {
      return null
    }
    const columns = [{
      title: '',
      dataIndex: 'conditions',
      key: 'conditions',
      width: '40%',
      render: (text, data) => {
        const dom = text.map((item, index) => {
          const { operatorName, value, dateValue } = item
          const fh = index === 1 ? ' && ' : ''
          return `${fh}${operatorName}${dateValue || value}`
        })
        return <div className={'text-overflow'} title={dom}>
          {
            dom
          }
        </div>
      }
    }, {
      title: '',
      dataIndex: 'score',
      key: 'score',
      width: '30%',
      render: (text, data) => {
        const { isView = false } = this.props
        return <InputNumber maxLength={50} minLenght={1} onBlur={(value) => {
          this.updateRangeScore(data)
        }} onChange={(value) => {
          this.onChangeRangesScore(value, data, index)
        }} value={text} disabled={isView} />
      }
    }, {
      title: '',
      dataIndex: 'id',
      key: 'id',
      width: '20%',
      render: (text, data) => {
        return <span>-</span>
      }
    }, {
      title: '',
      dataIndex: 'characterId',
      key: 'characterId',
      width: '10%',
      render: (text, data) => {
        return <span>-</span>
      }
    }]
    return (
      <Table
        columns={columns}
        dataSource={ranges}
        pagination={false}
      />
    )
  }
  onChangeRangesScore = (value, { id }, index) => {
    const { charactersDataSource = [] } = this.state
    let row = charactersDataSource[index]
    row.ranges.forEach(item => {
      if (item.id === id) {
        item.score = value
      }
    })
    this.setState({ charactersDataSource })
  }
  addScoringItems = (isInit = false) => {
    const { scoringItems = [] } = this.state
    const newScoringItems = JSON.parse(JSON.stringify(scoringItems))
    let conditions = [
      { operator: undefined, value: undefined }
    ]
    newScoringItems.push({
      conditions,
      'score': undefined
    })
    this.setState({ scoringItems: newScoringItems })
  }
  getElementPiecewise = () => {
    // 返回分段类型的dom节点
    const { dataType = '', scoringItems = [] } = this.state
    let th = []
    if (dataType === DATETIME || dataType === 'long' || dataType === DECIMAL) {
      const type = dataType === DATETIME ? 'date' : 'inputNumber'
      th = [{ title: '操作符', type: 'selectOperation' }, { title: '区间下限', type: type }, {
        title: '操作符',
        type: 'selectOperation'
      }, { title: '区间上限', type: type }, {
        title: '分值',
        type: 'score'
      }, { title: '操作', type: 'del' }]
    } else {
      const type = dataType === ENUM ? 'enum' : dataType === BOOLEAN ? 'boolean' : 'input'
      th = [{ title: '操作符', type: 'selectOperation' }, { title: '参数值', type }, {
        title: '分值',
        type: 'score'
      }, { title: '操作', type: 'del' }]
    }
    return <div>
      <div className="field-table-tr display-flex">
        {
          th.map((item, index) => {
            const { title, type = '' } = item
            const width = title !== '操作' ? type === 'date' ? '2' : '1' : ''
            return <div key={index} style={{ flex: width }}
                        className={`field-table-th ${title === '操作' ? 'table-active' : 'flex-one'}`}>
              {title}
            </div>
          })
        }
      </div>
      {
        scoringItems.map((item, index) => {
          console.log('item', item)
          return (<div key={index} className="field-table-tr display-flex">
            {
              th.map((obj, colIndex) => {
                const { title, type = '' } = obj
                const width = title !== '操作' ? type === 'date' ? '2' : '1' : ''
                return (
                  <div key={colIndex} style={{ flex: width }}
                       className={`field-table-td ${title === '操作' ? 'table-active' : 'flex-one'}`}>
                    {
                      this.getElementTd(type, item, colIndex, index)
                    }
                  </div>)
              })
            }
          </div>)
        })
      }
      {
        dataType
          ? <Button type={'dashed'} onClick={this.addScoringItems}
                    style={{ width: '100%', marginTop: '10px' }}>添加评分项</Button> : null
      }
    </div>
  }
  getElementLinearity = () => {
    const { formula, validate = {} } = this.state
    const { formula: validateFormula = {} } = validate
    const btns = [[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '.'], ['(', ')', '+', '-', '*', '/'],
      [{
        label: '插入变量',
        key: 'variable'
      }, {
        label: <i className={'anticon anticon-unfold'} />,
        key: 'right'
      }, {
        label: <i className={'anticon anticon-fold'} />,
        key: 'left'
      }, {
        label: <i className={'anticon anticon-delete'} />,
        key: 'del'
      }, {
        label: '清空',
        key: 'empty'
      }]
    ]
    // 返回线性类型的dom节点
    return <div className="table-linearity">
      <CCIFormItem label={'公式'} width={'100%'} validate={validateFormula} colon required>
        <TextArea placeholder={'计算公式定义'} id={'formula'} ref={'formula'} value={formula}
                  autosize={{ maxRows: 5, minRows: 5 }} />
      </CCIFormItem>
      <div className={'linearity-btns'}>
        {
          btns.map((row, index) => {
            return <div key={index}>{
              row.map(item => {
                let { label = item, key = item } = item
                return <Button key={key} onClick={() => {
                  this.clickFormulaSymbol(item)
                }}>{label}</Button>
              })
            }</div>
          })
        }
      </div>
    </div>
  }
  clickFormulaSymbol = (symbol) => {
    // 单击公式运算符号的函数
    let { formula = '' } = this.state
    if (formula === null) {
      formula = ''
    }
    console.log('refs', this.refs.formula)
    let textAreaElement = document.getElementById('formula')
    const { selectionStart, selectionEnd } = getCursorPosition(textAreaElement)
    let indexSelectionStart = selectionStart
    // let indexSelectionEnd = selectionEnd
    const { key } = symbol
    // 如果有key说明是最后一行的操作 么有说明是运算符号
    if (key) {
      textAreaElement.focus()
      switch (key) {
        case 'del':
          formula = formula.split('')
          indexSelectionStart = selectionStart - 1
          formula.splice(indexSelectionStart, 1)
          formula = formula.join('')
          break
        case 'empty':
          formula = ''
          break
        case 'variable':
          const { fieldName = '' } = this.state
          formula = formula.split('')
          formula.splice(indexSelectionStart, 0, fieldName)
          formula = formula.join('')
          indexSelectionStart = selectionStart + fieldName.length
          break
        default:
          if (key === 'right' || key === 'left') {
            const number = key === 'right' ? 1 : -1
            indexSelectionStart = selectionStart + number
            // indexSelectionEnd = selectionEnd + number
          }
      }
    } else {
      formula = formula.split('')
      formula.splice(indexSelectionStart, 0, symbol)
      formula = formula.join('')
      indexSelectionStart = selectionStart + `${symbol}`.length
    }
    console.log('selectionStart', selectionStart, selectionEnd)
    this.setState({ formula }, () => {
      textAreaElement.focus()
      textAreaElement.selectionStart = indexSelectionStart
      textAreaElement.selectionEnd = indexSelectionStart
    })
  }
  getElementTable = () => {
    const { dataType = '', calculationType = '' } = this.state
    console.log('dataType', dataType)
    if (calculationType === 'section' && dataType) {
      return this.getElementPiecewise()
    } else if (calculationType === 'linearity' && dataType) {
      return this.getElementLinearity()
    }
  }
  getElementTd = (type, data, colIndex, rowIndex) => {
    console.log('type', type)
    const { characterList = [] } = this.state
    const { score, conditions } = data
    const index = colIndex >= 2 ? 1 : 0
    let { value, operator } = conditions[index] || {}
    switch (type) {
      case 'selectOperation':
        return <Select placeholder={'选择操作符'}
                       value={operator}
                       onChange={(e) => {
                         this.changeString(e, { data, colIndex, rowIndex, key: 'operator' })
                       }}
                       style={{ width: '100%' }}>
          {
            characterList.map(item => {
              const { description, operator } = item
              return <Option key={operator} value={operator}>{description}</Option>
            })
          }
        </Select>
      case 'date':
        let dateValue = value ? Number.parseInt(value) : undefined
        return <DatePicker format="YYYY-MM-DD HH:mm:ss"
                           value={value ? moment(dateValue) : undefined} showTime
                           onChange={(e, str) => {
                             // const time = index === 0 ? '00:00:00' : '23:59:59'
                             let value = new Date(e).getTime().toString()
                             value = value.substring(0, value.length - 3)
                             value = `${value}000`
                             this.changeString(value, { data, colIndex, rowIndex, key: 'value' })
                           }} />
      case 'inputNumber':
        return <InputNumber style={{ width: '100%' }} maxLength={50} value={value} placeholder={'请输入值'}
                            onChange={(e) => {
                              this.changeString(e, { data, colIndex, rowIndex, key: 'value' })
                            }} />
      case 'input':
        return <Input placeholder={'请输入值'} value={value} onChange={(e) => {
          this.changeString(e.target.value, { data, colIndex, rowIndex, key: 'value' })
        }} />
      case 'enum':
      case 'boolean':
        let { scoreItemSelectList = [] } = this.state
        let select = false
        if (type === 'boolean') {
          scoreItemSelectList = [{ optionKey: 'true', optionValue: '是' }, { optionKey: 'false', optionValue: '否' }]
        } else if (operator === 'INCLUDE' || operator === 'NOT_INCLUDE') {
          select = true
          if (value) {
            value = value.split(',')
          }
        }
        return <Select placeholder={'请选择'}
                       mode={select ? 'multiple' : ''}
                       value={value}
                       onChange={(e) => {
                         this.changeString(e, { data, colIndex, rowIndex, key: 'value' })
                       }}
                       style={{ width: '100%' }}>
          {
            scoreItemSelectList.map(item => {
              const { optionKey, optionValue } = item
              return <Option key={optionKey} value={optionKey}>{optionValue}</Option>
            })
          }
        </Select>
      case 'score':
        return <InputNumber placeholder={'请输入分值'} value={score} maxLength={50} style={{ width: '100%' }}
                            onChange={(e) => {
                              this.changeScore(e, { rowIndex })
                            }} />
      case 'del':
        return <i title="删除" className="anticon anticon-delete" onClick={() => {
          this.delScoreItem(rowIndex)
        }} />
      default:
        return null
    }
  }
  delScoreItem = (index) => {
    // 删除评分项
    let { scoringItems = [] } = this.state
    scoringItems.splice(index, 1)
    this.setState({ scoringItems })
  }
  changeString = (value, { data, colIndex, rowIndex, key }) => {
    // 修改范围数据
    let { scoringItems = [] } = this.state
    let item = scoringItems[rowIndex]
    const index = colIndex >= 2 ? 1 : 0
    let condItem = item.conditions[index] || { operator: undefined, value: undefined }
    condItem[key] = value
    item.conditions[index] = condItem
    console.log('scoringItems change', scoringItems)
    this.setState({ scoringItems })
  }
  changeScore = (value, { rowIndex }) => {
    // 修改分值
    let { scoringItems = [] } = this.state
    scoringItems[rowIndex].score = value
    this.setState({ scoringItems })
  }

  changeWeight = (weight) => {
    this.setState({ weight })
  }
  changeCalculationType = (value) => {
    this.setState({
      calculationType: value
    })
  }
  changeField = (value, { props }) => {
    // 选择参数名之后的验证
    const { dataobj } = props
    let { scoreCardId, calculationType, characterId: id = null, fieldList = [] } = this.state
    const { fieldDisplayName, dataType } = dataobj
    if (dataType !== DECIMAL) {
      calculationType = 'section'
    }
    this.setState({
      field: value,
      fieldName: fieldDisplayName,
      dataType,
      calculationType,
      scoringItems: [{ conditions: [{ operator: undefined, value: undefined }], score: undefined }]
    })
    const fieldListFlat = fieldList.map(f => f.list).flat()
    const { fieldDataCategory: fieldCategory = 'FIELD' } = fieldListFlat.find(f => f.fieldName === value) || {}
    this.fieldCheck({
      field: value,
      scoreCardId,
      id,
      fieldCategory
    })
    this.getCharacterList(dataType)
  }

  fieldCheck = data => {
    fieldCheck(data).then(res => {
      console.log('fieldCheck', res)
      const { content = [] } = res
      this.setState({ scoreItemSelectList: content, disabledSave: false })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
      this.setState({ disabledSave: true, field: undefined })
    })
  }

  validationFormula = (data, callback) => {
    validationFormula(data).then(res => {
      callback()
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  saveAddScore = async () => {
    // 保存变量
    const { fieldsAndFactors = [], calculationType, field, weight, scoringItems: oldScoringItems, fieldName, formula, scoreCardId, characterId } = this.state
    // if (disabledSave) {
    //   const content = { message: '参数名已存在，请重新选择' }
    //   notification.warn(content)
    //   return
    // }
    oldScoringItems.forEach(item => {
      item.conditions.forEach(i => {
        if (typeof i.value === 'object') {
          i.value = i.value.join(',')
        }
      })
    })
    const scoringItems = JSON.parse(JSON.stringify(oldScoringItems))
    const { fieldDataCategory: fieldCategory, dataType: fieldDataType } = fieldsAndFactors.find(f => f.fieldName === field) || {}
    let data = {
      calculationType,
      field,
      fieldName,
      fieldCategory,
      fieldDataType,
      scoreCardId
    }
    let rules = [
      {
        id: 'calculationType',
        value: calculationType,
        rules: [{ required: true, whitespace: true, message: '参数类型不能为空' }]
      },
      {
        id: 'field',
        value: field,
        rules: [{ required: true, whitespace: true, message: '参数名不能为空' }]
      }
    ]
    if (calculationType === 'linearity') {
      data['formula'] = formula
      console.log('save formula', formula)
      rules.push({
        id: 'formula',
        value: formula,
        rules: [{ required: true, whitespace: true, message: '公式不能为空' }]
      })
    } else {
      data['ranges'] = scoringItems
      data['weight'] = weight
      rules.push({
        id: 'weight',
        value: weight,
        rules: [{ required: true, whitespace: true, message: '系数不能为空' }]
      })
      let isScore = false
      // scoringItems.forEach((item, index) => {
      for (let i = scoringItems.length; i > 0; i--) {
        const index = i - 1
        const item = scoringItems[index]
        const { conditions } = item

        if (conditions) {
          let isValidate = true
          conditions.forEach(codItem => {
            const { operator, value } = codItem
            if (!operator || value === undefined) {
              isValidate = false
            }
          })
          if (!isValidate) {
            scoringItems.splice(index, 1)
          } else {
            if (item.score === '' || item.score === undefined || item.score === null) {
              isScore = true
            }
          }
        }
      }
      if (isScore) {
        const content = { message: '分值不能为空' }
        notification.warn(content)
        return
      }
    }
    const { code, data: validate } = validateFields(rules)
    console.log('validate', validate)
    this.setState({ validate })
    if (!code) {
      if (calculationType === 'linearity') {
        this.validationFormula({ formula, fieldName }, () => {
          if (characterId) {
            data.id = characterId
            this.updateScorecardCharacter(data)
          } else {
            this.addScorecardCharacter(data)
          }
        })
      } else {
        if (characterId) {
          data.id = characterId
          this.updateScorecardCharacter(data)
        } else {
          this.addScorecardCharacter(data)
        }
      }
    }
  }
  addScorecItem = () => {
    this.setState({
      visible: true,
      characterId: '',
      scoringItems: [],
      formula: '',
      field: undefined,
      fieldName: undefined,
      calculationType: 'section',
      weight: undefined,
      dataType: undefined
    })
  }
  getCalculationTypeList = async () => {
    // 获取计算类型
    getCalculationTypeList().then(res => {
      const { content = [] } = res
      this.setState({
        calculationTypeList: content
      })
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  getCharacterList = (data) => {
    // 获取操作符
    let characterList = this.props.allOperators[data] || []
    this.setState({
      characterList
    })
  }
  getFieldsAndFactors = () => {
    const { businessLineId } = this.props
    // 获取参数名
    getFieldsAndFactors({ businessLineId }).then(res => {
      const { content: fieldsAndFactors = [] } = res
      const { tree, list } = initFieldListData(fieldsAndFactors)
      this.setState({
        fieldsAndFactors,
        fieldList: tree,
        fieldListSrc: list
      })
    }).catch((data) => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  updateScorecardCharacter = (data) => {
    updateScorecardCharacter(data).then(res => {
      this.setState({ characterId: '', visible: false })
      this.getCharactersList()
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }

  // 获取变量列表
  getCharactersList = () => {
    let queryId
    const { scoreCardId } = this.state
    queryId = scoreCardId
    if (!scoreCardId) {
      const { id } = this.props
      queryId = id
    }
    getCharactersList(queryId).then(res => {
      const { content = {} } = res
      let { characters = [], finalExpression, baseScore } = content
      characters.forEach(item => {
        item.key = item.id
        item.ranges.forEach(range => {
          range.key = range.id
        })
      })
      console.log('getCharactersList', characters)
      this.setState({
        baseScore,
        finalExpression,
        charactersDataSource: characters
      })
    })
  }

  addScorecardCharacter = (data) => {
    addScorecardCharacter(data).then(res => {
      this.setState({ characterId: '', visible: false })
      this.getCharactersList()
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  updateRangeScore = ({ id, score }) => {
    if (score === '' || score === null) {
      return
    }
    const data = {
      id,
      score
    }
    updateRangeScore(data).then(res => {
      this.getCharactersList()
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  delCharacter = (id) => {
    delCharacter({ id }).then(res => {
      this.getCharactersList()
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
  updateScorecardBasic = (e) => {
    const { baseScore } = this.state
    const { id } = this.props
    if (baseScore === undefined || baseScore === '') {
      this.setState(
        {
          baseScoreValidata: { err: true, msg: '请添写初始评分' }
        }
      )
      return
    }
    this.setState(
      {
        baseScoreValidata: { err: false, msg: '请添写初始评分' }
      }
    )
    const data = {
      id,
      baseScore
    }
    updateScorecardBasic(data).then(res => {
      console.log(res)
    }).catch(data => {
      const { content = {} } = data
      notification.warn(content)
    })
  }
}
