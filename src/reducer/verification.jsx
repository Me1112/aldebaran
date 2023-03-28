import { Map } from 'immutable'
import {
  GET_APP_SELECT_SUCCESS,
  GET_SCENE_SELECT_SUCCESS,
  GET_OFFLINE_SCENE_SELECT_SUCCESS,
  GET_APP_SELECT_ERROR,
  GET_SCENE_SELECT_ERROR,
  GET_OFFLINE_SCENE_SELECT_ERROR
} from '../common/verification_constant'

export default function verification(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case GET_APP_SELECT_SUCCESS:
      return state.set('appSelect', payload.content)
    case GET_SCENE_SELECT_SUCCESS:
    case GET_OFFLINE_SCENE_SELECT_SUCCESS:
      return state.set('sceneSelect', payload.content)

    case GET_APP_SELECT_ERROR:
    case GET_SCENE_SELECT_ERROR:
    case GET_OFFLINE_SCENE_SELECT_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    default:
      return state
  }
}
