import { Map } from 'immutable'
import {
  GET_APP_LIST_SUCCESS, GET_APP_LIST_ERROR, GET_FIELDS_LIST_SUCCESS, GET_FIELDS_LIST_ERROR
} from '../common/scoreConstant'
import { SUCCESS } from '../common/constant'

export default function score(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case GET_APP_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('appList', payload.content)
      }
      return state
    case GET_FIELDS_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('fieldsList', payload.content)
      }
      return state
    case GET_APP_LIST_ERROR:
    case GET_FIELDS_LIST_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    default:
      return state
  }
}
