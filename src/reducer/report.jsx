import { Map } from 'immutable'
import {
  GET_TODAY_DATA_SUCCESS,
  GET_TODAY_DATA_ERROR
} from '../common/report_constant'

export default function report(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case GET_TODAY_DATA_SUCCESS:
      return state.set('payload', payload.content)
    case GET_TODAY_DATA_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    default:
      return state
  }
}
