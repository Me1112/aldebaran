import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { Table, Button } from 'antd'
import {
  getRuleSetInfo,
  getScoreCardInfo,
  getDecisionTreeInfo,
  getDecisionStreamInfo
} from '../../../../action/event'
import {
  getRuleSetInfo4VerifyTask,
  getScoreCardInfo4VerifyTask,
  getDecisionTreeInfo4VerifyTask,
  getDecisionStreamInfo4VerifyTask
} from '../../../../action/data'
import DecisionTree from './decision_tree'
import DecisionFlow from './decision_flow'

const OPERATORS = {
  '&&': 'AND',
  '||': 'OR'
}
const RULE_SET = 'RULE_SET'
const SCORE_CARD = 'SCORE_CARD'
const DECISION_TREE = 'DECISION_TREE'
const DECISION_STREAM = 'DECISION_STREAM'

const RESOURCE_TYPES = {
  RULE_SET: '规则集',
  SCORE_CARD: '评分卡',
  DECISION_TREE: '决策树',
  DECISION_STREAM: '决策流'
}

const worst = 'worst'
const rank = 'rank'

const DECISION_TYPES = {
  worst: '最坏匹配',
  rank: '权重匹配'
}

export default class DecisionInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      forwardInfo: {
        forwardStrategyType: '',
        forwardName: ''
      }
    }
  }

  static defaultProps = {
    isTesting: false
  }

  static propTypes = {
    appId: PropTypes.number.isRequired,
    eventId: PropTypes.string.isRequired,
    scenarioValue: PropTypes.string.isRequired,
    strategyId: PropTypes.number.isRequired,
    strategyType: PropTypes.string.isRequired,
    isTesting: PropTypes.bool.isRequired,
    isVerifyTask: PropTypes.bool.isRequired,
    contants: PropTypes.object.isRequired,
    taskId: PropTypes.number
  }

  componentDidMount() {
    console.log('componentDidMount')
    this.getDecisionInfo()
  }

  render() {
    const { strategyType, contants } = this.props
    let {
      forwardInfo: {
        forwardStrategyType, forwardName, eventRuleInfos: eri, decisionType: dt, decisionResult: dr, finalScore: td,
        result: r, initScore: is, sectionScore: ss, linearityScore: ls, sectionScoreList: ssl, linearityScoreList: lsl, tree: t, flow: f
      }, eventRuleInfos = [], decisionType, decisionResult, finalScore,
      result, initScore, sectionScore, linearityScore, sectionScoreList, linearityScoreList, tree, flow
    } = this.state
    const { riskPolicyMap = {}, riskGradesList = [] } = contants
    forwardStrategyType = forwardStrategyType || strategyType
    if (eri) {
      eventRuleInfos = eri
    }
    if (dt) {
      decisionType = dt
    }
    if (dr) {
      decisionResult = dr
    }
    if (td) {
      finalScore = td
    }
    if (r) {
      result = r
    }
    if (is) {
      initScore = is
    }
    if (ss) {
      sectionScore = ss
    }
    if (ls) {
      linearityScore = ls
    }
    if (ssl) {
      sectionScoreList = ssl
    }
    if (lsl) {
      linearityScoreList = lsl
    }
    if (t) {
      tree = t
    }
    if (f) {
      flow = f
    }

    let content = null
    switch (forwardStrategyType) {
      case RULE_SET:
        content = <ul className="timeline">
          {
            eventRuleInfos.map((event, k) => {
              let { id, ruleName, expression, conditions = [], decisionResult, hit: ruleHit, score } = event
              let { decisionName: resultLabel = '', riskGrade = '' } = riskPolicyMap[decisionResult] || {}
              riskGrade = riskGrade.toLocaleLowerCase()
              if (decisionType === rank) {
                resultLabel = ruleHit ? score : 0
              }
              if (decisionResult === undefined && score !== undefined) {
                decisionResult = 'hit'
                riskGrade = 'hit'
              }
              const conditionObjs = {}
              conditions.forEach(c => {
                conditionObjs[c.id] = c
              })
              // expression = '(555&&556&&558&&559)||560'
              // expression = '(1||2||3||3) && (3||1||2)'
              // expression = '(1||2||3) && (3||1||2)'
              // expression = '(1||2) && (3||1||2)'
              // expression = '(1||2) && (3||1)'
              // expression = '(1||2) && (3||1) && (3||1)'
              // expression = '(555||556) && (558||555) && (558||555) && (558||555) && (558||555)'
              // expression = '555&&556&&558'
              // expression = '555||556||558'
              // expression = '555&&(556||558)'
              const matches = expression.replace(/ /g, '').match(/\(|\)|&&|\|\||[^()&&||]+/ig)
              const elements = []
              let blocks = []
              let temps = []
              let start = 0
              matches.forEach(m => {
                if (m === '(') {
                  start++
                } else if (m === ')') {
                  start--
                  if (start === 0 && temps.length > 0) {
                    elements.push(temps.join(''))
                    temps = []
                  }
                } else {
                  if (start > 0) {
                    temps.push(m)
                  } else {
                    if (temps.length > 0) {
                      elements.push(temps.join(''))
                      temps = []
                    }
                    elements.push(m)
                  }
                }
              })
              let oper = '&&'
              let simple = false
              if (expression.includes('||') && !expression.includes('&&')) {
                oper = '||'
                simple = true
              } else if (expression.includes('&&') && !expression.includes('||')) {
                simple = true
              }
              elements.forEach(e => {
                blocks.push(e.match(/\(|\)|&&|\|\||[^()&&||]+/ig))
              })
              const conditionList = []
              blocks.forEach((b = [], index) => {
                if (b.length === 1) {
                  if (['&&', '||'].includes(b[0])) {
                    conditionList.push({ list: [], operator: b[0] })
                  } else {
                    conditionList.push({ list: [b[0]], operator: '' })
                  }
                } else {
                  const block = { list: [], operator: '' }
                  b.forEach(n => {
                    if (['&&', '||'].includes(n)) {
                      block.operator = n
                    } else {
                      block.list.push(n)
                    }
                  })
                  conditionList.push(block)
                }
              })
              const hitResults = []
              const domList = []
              let blockCount = 0
              const conditionListCount = conditionList.length
              const conditionBlocks = conditionList.filter(c => c.list.length > 0)
              const blocksCount = conditionBlocks.map(c => c.list.length)
              let blocksTotalCount = 0
              let resultHeight = 0
              let blocksCountLength = blocksCount.length
              if (blocksCountLength > 0) {
                blocksCount.forEach((size, index) => {
                  if (index === 0 || index === blocksCountLength - 1) {
                    resultHeight = resultHeight + size / 2
                  } else {
                    resultHeight = resultHeight + size
                  }
                })
                blocksTotalCount = blocksCount.reduce((a, b) => a + b)
              }
              let zIndex = 999
              let order = 0
              let preOperator = ''
              const operatorTops = []
              conditionList.forEach(condition => {
                const { list = [], operator = '' } = condition
                const listCount = list.length
                if (listCount === 0) {
                  oper = operator
                  return
                }
                let hitResult = null
                if (!simple) {
                  zIndex--
                }
                if (listCount > 0) {
                  let currentHitResult = null
                  list.forEach((id, index) => {
                    const { hit, conditionName } = conditionObjs[id] || {}
                    if (hitResult === null) {
                      hitResult = hit
                    }
                    if (currentHitResult === null) {
                      currentHitResult = hit
                    }
                    let line = null
                    switch (operator) {
                      case '&&':
                        hitResult = hitResult && hit
                        currentHitResult = currentHitResult && hit
                        break
                      case '||':
                        hitResult = hitResult || hit
                        currentHitResult = currentHitResult || hit
                        break
                    }
                    let height = (listCount - 1) * 50 / 2
                    let firstTop = index > 0 ? (blockCount + index - 1) * 50 : (blockCount + index) * 50 + 35
                    let lastTop = blockCount * 50 + (listCount - 1) * 50 / 2 + 34
                    if (!operator) {
                      height = (blocksTotalCount - 1) * 50 / 2
                      lastTop = (blocksTotalCount - 1) * 50 / 2 + 34
                    }
                    if ((index === 0 && operator) || (order === 0 && !operator)) {
                      const nextBlock = conditionBlocks[order + 1] || {}
                      if (listCount === 1) {
                        operatorTops.push(firstTop)
                      }
                      if (conditionListCount !== 1) {
                        line = <div key={`line-${order}_${id}_${index}`}
                                    className={`condition-line first ${hit ? riskGrade : ''}`}
                                    style={{
                                      top: firstTop,
                                      width: listCount === 1 && nextBlock.operator !== operator ? 128 : 56,
                                      height,
                                      left: 258,
                                      zIndex
                                    }} />
                      }
                    } else if ((index > 0 && operator) || (order > 0 && !operator)) {
                      if ((index < listCount - 1 && operator) || (order < blocksCountLength - 1 && !operator)) {
                        line = <div key={`line-${order}_${id}_${index}`}
                                    className={`condition-line middle-part ${hit ? riskGrade : ''}`}
                                    style={{
                                      top: (blockCount + index + 1) * 50 - 16,
                                      width: 55,
                                      height: 0,
                                      left: 258,
                                      zIndex
                                    }} />
                      } else {
                        zIndex--
                        let width = 56
                        if (listCount === 1 && order === blocksCountLength - 1 && preOperator !== operator) {
                          width = width + 56 + 16
                        }
                        line = <div key={`line-${order}_${id}_${index}`}
                                    className={`condition-line last ${hit ? riskGrade : ''}`}
                                    style={{
                                      top: lastTop,
                                      width,
                                      height,
                                      left: 258,
                                      zIndex
                                    }} />
                      }
                    }
                    const piece = <Fragment key={`piece-${order}_${id}_${index}`}>
                      <div className={`piece ${hit ? riskGrade : ''}`} title={conditionName}>{conditionName}</div>
                      {line}
                    </Fragment>
                    domList.push(piece)
                  })
                  if (operator) {
                    preOperator = operator
                    const circleTop = (blockCount + listCount) * 50 - (listCount * 50 / 2) + 9
                    operatorTops.push(circleTop)
                    const circle = <div key={`circle-${order}`}
                                        className={`circle ${currentHitResult ? riskGrade : ''}`}
                                        style={{
                                          top: circleTop,
                                          left: 314,
                                          zIndex: zIndex + 1
                                        }}>{OPERATORS[operator]}</div>
                    domList.push(circle)
                    const top = (blockCount + blocksCount[order] - 1) * 50 + 9
                    let line = null
                    hitResults.push(hitResult)
                    if (order === 0) {
                      line = <div key={`line-${order}_${id}`}
                                  className={`condition-line first ${hitResult ? riskGrade : ''}`}
                                  style={{
                                    top: blocksCount[order] / 2 * 50 + 9,
                                    width: 56,
                                    height: resultHeight * 50 / 2,
                                    left: 258 + 56 + 16,
                                    zIndex
                                  }} />
                    } else if (order > 0) {
                      if (order < blocksCount.length - 1) {
                        line = <div key={`line-${order}_${id}`}
                                    className={`condition-line middle-part ${hitResult ? riskGrade : ''}`}
                                    style={{
                                      top: top,
                                      width: 56,
                                      height: 0,
                                      left: 258 + 56 + 16,
                                      zIndex: zIndex + blocksCountLength
                                    }} />
                      } else {
                        line = <div key={`line-${order}_${id}`}
                                    className={`condition-line last ${hitResult ? riskGrade : ''}`}
                                    style={{
                                      top: resultHeight * 50 / 2 + 9 + blocksCount[0] / 2 * 50,
                                      width: 56,
                                      height: resultHeight * 50 / 2,
                                      left: 258 + 56 + 16,
                                      zIndex
                                    }} />
                      }
                    }
                    domList.push(line)
                  }
                  blockCount = blockCount + listCount
                }
                order++
              })
              let hitTotalResult = false
              let offset = 56 + 16
              if (hitResults.length === 0) {
                hitResults.push(ruleHit)
                offset = 0
              }
              if (conditionListCount === 1) {
                offset = -40
              }
              switch (oper) {
                case '&&':
                  hitTotalResult = hitResults.reduce((a, b) => a && b)
                  break
                case '||':
                  hitTotalResult = hitResults.reduce((a, b) => a || b)
                  break
              }
              let top = '50%'
              if (conditionBlocks.length > 1) {
                if (operatorTops.length === 1) {
                  const ft = operatorTops.pop()
                  top = ft + (blocksTotalCount * 50 - ft) / 2 - 8
                } else {
                  const ft = Math.min(...operatorTops)
                  top = ft + (Math.max(...operatorTops) - ft) / 2
                }
                const circle = <div key={`circle-${id}`} className={`circle ${hitTotalResult ? riskGrade : ''}`}
                                    style={{
                                      top,
                                      left: 258 + offset + 56,
                                      zIndex: zIndex + blocksCountLength * 2
                                    }}>{OPERATORS[oper]}</div>
                domList.push(circle)
              }
              if (!ruleHit) {
                riskGrade = 'miss'
                const { decisionName } = riskPolicyMap['miss'] || {}
                resultLabel = decisionName
              }
              domList.push(<div key={`result-${id}`} className={`result-line ${ruleHit ? riskGrade : ''}`} style={{
                top,
                left: 258 + offset + 56 - 16,
                width: `calc(100% - ${258 + offset + 56 - 16}px)`
              }}>
                <div className={`result ${riskGrade}`}>{resultLabel}</div>
              </div>)
              return <li className="timeline-item" key={`condition-${id}`}>
                <div className="timeline-tail" />
                <div className="timeline-head" />
                <div className="timeline-left">{ruleName}</div>
                <div className="timeline-right">
                  {domList}
                  <div className="timeline-item-bottom" />
                </div>
              </li>
            })
          }
        </ul>
        break
      case SCORE_CARD:
        const sectionColumns = [
          { title: '评分项', width: 150, dataIndex: 'name', key: 'name' },
          {
            title: '字段值',
            width: 150,
            dataIndex: 'value',
            key: 'value'
          },
          {
            title: '命中条件',
            dataIndex: 'condition',
            key: 'condition',
            width: '30%',
            render: (text, record) => {
              return (<div title={text} className="text-overflow">{text}</div>)
            }
          },
          {
            title: '得分',
            dataIndex: 'score',
            width: 100,
            key: 'score'
          },
          {
            title: '系数',
            dataIndex: 'coefficient',
            width: 100,
            key: 'coefficient'
          },
          {
            title: '最终得分',
            dataIndex: 'finalScore',
            key: 'finalScore',
            width: 100
          }
        ]
        const linearityColumns = [
          { title: '评分项', width: 150, dataIndex: 'name', key: 'name' },
          {
            title: '字段值',
            width: 150,
            dataIndex: 'value',
            key: 'value'
          },
          {
            title: '公式',
            dataIndex: 'formula',
            key: 'formula',
            width: '50%',
            render: (text, record) => {
              return (<div title={text} className="text-overflow">{text}</div>)
            }
          },
          {
            title: '最终得分',
            dataIndex: 'finalScore',
            key: 'finalScore',
            width: 100
          }
        ]
        content = <Fragment>
          <div className="section"><span className="content">初始分数：</span><span className="content">{initScore}</span>
          </div>
          <div className="section-title"><span className="content">分段分数</span></div>
          <Table rowkey="name" className="table-layout-fixed decision-card" dataSource={sectionScoreList}
                 columns={sectionColumns}
                 pagination={false}
                 footer={() => <Fragment><span style={{ fontWeight: 500 }}>合计：</span>{sectionScore}</Fragment>} />
          <div className="section-title"><span className="content">线性分数</span></div>
          <Table rowkey="name" className="table-layout-fixed decision-card" dataSource={linearityScoreList}
                 columns={linearityColumns}
                 pagination={false}
                 footer={() => <Fragment><span style={{ fontWeight: 500 }}>合计：</span>{linearityScore}</Fragment>} />
        </Fragment>
        break
      case DECISION_TREE:
        if (tree && decisionResult) {
          content = <DecisionTree treeData={tree} result={decisionResult} riskPolicyMap={riskPolicyMap} />
        }
        break
      case DECISION_STREAM:
        if (flow && decisionResult) {
          content = <DecisionFlow flowData={flow} result={decisionResult} riskPolicyMap={riskPolicyMap}
                                  forwardDetail={this.forwardDetail} />
        }
        break
    }
    const { decisionName = '', riskGrade = '' } = riskPolicyMap[decisionResult] || {}
    return <div className="decision-info">
      {
        this.state.forwardInfo.forwardStrategyType
          ? <div className="legend"><span className="decision-name">{forwardName}</span>
            <Button className="fr" onClick={this.goBack}>返回</Button>
          </div> : null
      }
      <div className="legend">
        <span className="label">资源类型：</span><span className="content">{RESOURCE_TYPES[forwardStrategyType]}</span>
        {
          forwardStrategyType === RULE_SET
            ? <Fragment><span className="label">决策模式：</span><span
              className="content">{DECISION_TYPES[decisionType]}</span>
              {decisionType === rank
                ? <Fragment><span className="label">风险结果：</span><span className="content">{finalScore}</span></Fragment>
                : null}
              <span className="label">决策结果：</span><span
                className={`content ${riskGrade}`}>{decisionName}</span>
              <span style={{ float: 'right' }}>
                {decisionType === worst
                  ? <Fragment>
                    {
                      riskGradesList.map(grade => {
                        let { riskGrade, riskPolicyList = [] } = grade
                        riskGrade = riskGrade.toLocaleLowerCase()
                        const legendLabels = riskPolicyList.map(riskPolicy => {
                          const { decisionName = '' } = riskPolicy
                          return decisionName
                        }).filter(riskPolicy => riskPolicy).join('、')
                        return <Fragment key={riskGrade}>
                          <i className={riskGrade} /><span className="pass">{legendLabels}</span>
                        </Fragment>
                      })
                    }
                    <i className="miss" /><span className="miss">未命中</span>
                  </Fragment> : null
                }
                {decisionType === rank
                  ? <Fragment>
                    <i className="hit" /><span className="hit">命中</span>
                    <i className="miss" /><span className="miss">未命中</span>
                  </Fragment> : null
                }
              </span>
            </Fragment> : null
        }
        {
          forwardStrategyType === SCORE_CARD
            ? <Fragment>
              <span className="label">评分卡结果：</span><span className="content">{result}</span>
            </Fragment> : null
        }
        {
          forwardStrategyType === DECISION_TREE || forwardStrategyType === DECISION_STREAM
            ? <Fragment>
              <span className="label">决策结果：</span><span
              className={`content ${riskGrade}`}>{decisionName}</span>
            </Fragment> : null
        }
      </div>
      <div>
        {content}
      </div>
    </div>
  }

  getDecisionInfo = (forwardStrategyId = '', forwardStrategyType = '', forwardName = '') => {
    const { isVerifyTask, appId, eventId, scenarioValue, strategyId, strategyType, isTesting, taskId } = this.props
    const id = forwardStrategyId || strategyId
    const type = forwardStrategyType || strategyType
    const params = { appId, eventId, scenarioValue, strategyId: id, strategyType: type, isTesting, taskId }
    let promise = null
    switch (type) {
      case RULE_SET:
        if (isVerifyTask) {
          promise = getRuleSetInfo4VerifyTask(params)
        } else {
          promise = getRuleSetInfo(params)
        }
        promise.then(data => {
          const { content = {} } = data
          const { decisionType, decisionResult, finalScore, eventRuleInfos = [] } = content
          if (forwardStrategyType) {
            this.setState({
              forwardInfo: {
                forwardStrategyType,
                forwardName,
                decisionType,
                decisionResult,
                finalScore,
                eventRuleInfos
              }
            })
          } else {
            this.setState({ decisionType, decisionResult, finalScore, eventRuleInfos })
          }
        })
        break
      case SCORE_CARD:
        if (isVerifyTask) {
          promise = getScoreCardInfo4VerifyTask(params)
        } else {
          promise = getScoreCardInfo(params)
        }
        promise.then(data => {
          const { content = {} } = data
          const { initScore, result, sectionScore, linearityScore, sectionScoreList = [], linearityScoreList = [] } = content
          if (forwardStrategyType) {
            this.setState({
              forwardInfo: {
                forwardStrategyType,
                forwardName,
                initScore,
                result,
                sectionScore,
                linearityScore,
                sectionScoreList,
                linearityScoreList
              }
            })
          } else {
            this.setState({ initScore, result, sectionScore, linearityScore, sectionScoreList, linearityScoreList })
          }
        })
        break
      case DECISION_TREE:
        if (isVerifyTask) {
          promise = getDecisionTreeInfo4VerifyTask(params)
        } else {
          promise = getDecisionTreeInfo(params)
        }
        promise.then(data => {
          const { content = {} } = data
          const { root: tree = {}, decisionResult } = content
          if (forwardStrategyType) {
            this.setState({
              forwardInfo: {
                forwardStrategyType,
                forwardName,
                tree,
                decisionResult
              }
            })
          } else {
            this.setState({ tree, decisionResult })
          }
        })
        break
      case DECISION_STREAM:
        if (isVerifyTask) {
          promise = getDecisionStreamInfo4VerifyTask(params)
        } else {
          promise = getDecisionStreamInfo(params)
        }
        promise.then(data => {
          const { content = {} } = data
          const { nodes: flow = {}, decisionResult } = content
          if (forwardStrategyType) {
            this.setState({
              forwardInfo: {
                forwardStrategyType,
                forwardName,
                flow,
                decisionResult
              }
            })
          } else {
            this.setState({ flow, decisionResult })
          }
        })
        break
    }
  }

  goBack = () => {
    this.setState({ forwardInfo: { forwardStrategyType: '', forwardName: '' } })
  }

  forwardDetail = (data) => {
    const { id, type, name } = data
    this.getDecisionInfo(id, type, name)
  }
}
