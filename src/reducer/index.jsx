import { Map } from 'immutable'
import {
  CHANGE_NOTIFY_INFO,
  CHANGE_NOTIFY_FREQUENCY,
  DEMO_SUCCESS,
  DEMO_ERROR,
  SET_USER_PERMISSION
} from '../common/constant'

export default function common(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case CHANGE_NOTIFY_INFO:
      const { data: { notifyInfo } } = action
      return state.set('notifyInfo', notifyInfo)
    case CHANGE_NOTIFY_FREQUENCY:
      const { data: { notifyFrequency } } = action
      return state.set('notifyFrequency', notifyFrequency)
    case DEMO_SUCCESS:
      return state.set('payload', payload)
    case DEMO_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    case SET_USER_PERMISSION:
      const { data: userPermissions = {} } = action
      return state.set('userPermissions', userPermissions)
    default:
      return state
  }
}
