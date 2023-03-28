import { Map } from 'immutable'
import {
  GET_DECISION_SELECT_SUCCESS,
  GET_DECISION_SELECT_ERROR
} from '../common/decision_constant'

export default function decision(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case GET_DECISION_SELECT_SUCCESS:
      const { content = [] } = payload
      const riskPolicyMap = {}
      const riskGradesMap = {}
      let riskGrades = []
      content.forEach(riskPolicy => {
        const { decisionCode, riskGrade } = riskPolicy
        if (!riskGrades.includes(riskGrade)) {
          riskGrades.push(riskGrade)
        }
        const riskGradeMap = riskGradesMap[riskGrade]
        if (riskGradeMap) {
          riskGradeMap.push(riskPolicy)
        } else {
          riskGradesMap[riskGrade] = [riskPolicy]
        }
        riskPolicyMap[decisionCode] = riskPolicy
      })
      riskGrades = riskGrades.map(riskGrade => {
        return { riskGrade, riskPolicyList: riskGradesMap[riskGrade] }
      })
      state = state.set('riskPolicyList', content)
      state = state.set('riskPolicyMap', riskPolicyMap)
      state = state.set('riskGradesList', riskGrades)
      return state

    case GET_DECISION_SELECT_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    default:
      return state
  }
}
