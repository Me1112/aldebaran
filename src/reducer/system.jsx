import { Map } from 'immutable'
import {
  GET_SYSTEM_SERVICE_LIST_SUCCESS,
  GET_API_TYPE_SELECT_SUCCESS,
  GET_APP_LIST_SUCCESS,
  GET_COMPANY_LIST_SUCCESS,
  GET_OPERATION_LIST_SUCCESS,
  GET_MODULE_LIST_SUCCESS,
  GET_ROLE_LIST_SUCCESS,
  GET_USER_LIST_SUCCESS,
  CAN_ROLE_LIST_SUCCESS,

  GET_SYSTEM_SERVICE_LIST_ERROR,
  GET_API_TYPE_SELECT_ERROR,
  GET_APP_LIST_ERROR,
  GET_COMPANY_LIST_ERROR,
  GET_OPERATION_LIST_ERROR,
  GET_MODULE_LIST_ERROR,
  GET_ROLE_LIST_ERROR,
  GET_USER_LIST_ERROR,
  CAN_ROLE_LIST_ERROR
} from '../common/system_constant'
import { SUCCESS } from '../common/constant'

export default function system(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case GET_SYSTEM_SERVICE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        const { content } = payload
        content.forEach((item, index) => {
          const { id } = item
          item.key = id
          content[index] = item
        })
        state = state.set('systemServiceList', content)
      }
      return state
    case GET_API_TYPE_SELECT_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        const { content } = payload
        content.forEach((item, index) => {
          const { id } = item
          item.key = id
          content[index] = item
        })
        state = state.set('apiTypeSelect', payload.content)
      }
      return state
    case GET_APP_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        const { content: appSelect = [] } = payload
        state = state.set('appContent', { result: appSelect })
        state = state.set('appSelect', appSelect)
      }
      return state
    case GET_COMPANY_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('companyContent', payload.content)
      }
      return state
    case GET_OPERATION_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('operationContent', payload.content)
      }
      return state
    case GET_MODULE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('moduleContent', payload.content)
      }
      return state
    case GET_ROLE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('roleInfo', payload.content)
      }
      return state
    case GET_USER_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('userInfo', payload.content)
      }
      return state
    case CAN_ROLE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('canCreateRoles', payload.content)
      }
      return state
    case GET_SYSTEM_SERVICE_LIST_ERROR:
    case GET_API_TYPE_SELECT_ERROR:
    case GET_APP_LIST_ERROR:
    case GET_COMPANY_LIST_ERROR:
    case GET_OPERATION_LIST_ERROR:
    case GET_MODULE_LIST_ERROR:
    case GET_ROLE_LIST_ERROR:
    case GET_USER_LIST_ERROR:
    case CAN_ROLE_LIST_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    default:
      return state
  }
}
