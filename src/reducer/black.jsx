import { Map } from 'immutable'
import {
  GET_BLACK_LIST_SUCCESS,
  GET_BLACK_LIST_TYPE_LIST_SUCCESS,
  GET_BLACK_LIST_ERROR,
  GET_BLACK_LIST_TYPE_LIST_ERROR
} from '../common/black_constant'
import { SUCCESS } from '../common/constant'

export default function black(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case GET_BLACK_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('blackContent', payload.content)
        state = state.set('totalCount', payload.content.totalCount)
      }
      return state
    case GET_BLACK_LIST_TYPE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('blackTypeContent', payload.content)
      }
      return state
    case GET_BLACK_LIST_ERROR:
    case GET_BLACK_LIST_TYPE_LIST_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    default:
      return state
  }
}
