import { cFetch } from '../common'
import {
  DMS_PREFIX
} from '../common/constant'

export function getEaList(data) {
  return cFetch.get(`${DMS_PREFIX}/ea/list?${data}`)
}

export function getEaStrategies(data) {
  return cFetch.get(`${DMS_PREFIX}/ea/strategies?${data}`)
}

export function addEa(data) {
  return cFetch.post(`${DMS_PREFIX}/ea/add`, { data })
}

export function delEa(data) {
  return cFetch.post(`${DMS_PREFIX}/ea/delete`, { data })
}

export function updateEa(data) {
  return cFetch.post(`${DMS_PREFIX}/ea/update`, { data })
}

export function getValidationScenarioFields(data) {
  return cFetch.get(`${DMS_PREFIX}/validation/scenario-fields?${data}`)
}

export function getValidationExternalAccess(data) {
  return cFetch.post(`${DMS_PREFIX}/validation/external-access`, { data })
}
