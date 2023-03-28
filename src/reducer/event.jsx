import { Map } from 'immutable'
import {
  GET_PROVINCE_LIST_SUCCESS,
  GET_CITY_LIST_SUCCESS,

  GET_PROVINCE_LIST_ERROR,
  GET_CITY_LIST_ERROR,
  EXPORT_START_ERROR,
  EXPORT_STATUS_ERROR
} from '../common/event_constant'
import { SUCCESS } from '../common/constant'

export default function event(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case GET_PROVINCE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('provinceList', payload.content)
      }
      return state
    case GET_CITY_LIST_SUCCESS:
      // if (payload.actionStatus === SUCCESS) {
      //   state = state.set('cityList', payload.content)
      // }
      return state

    case GET_PROVINCE_LIST_ERROR:
    case GET_CITY_LIST_ERROR:
    case EXPORT_START_ERROR:
    case EXPORT_STATUS_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    default:
      return state
  }
}
