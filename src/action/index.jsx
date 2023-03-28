import { cFetch, jFetch } from '../common'
import {
  CHANGE_NOTIFY_INFO,
  CHANGE_NOTIFY_FREQUENCY,
  LOGIN,
  DMS_PREFIX,
  UAA_PREFIX,
  SYS_FIELD_LIST,
  CUSTOM_FIELD_LIST,
  GET_DATA_TYPE_LIST,
  GET_FIELD_TYPE_LIST,
  SYS_FIELD_DELETE,
  SYS_FIELD_SAVE,
  SYS_FIELD_UPDATE,
  CUSTOM_FIELD_DELETE,
  CUSTOM_FIELD_SAVE,
  CUSTOM_FIELD_UPDATE,
  GET_RULE_SET_LIST,
  GET_RULE_SET_4_RULE_COPY_LIST,
  GET_RULE_LIST,
  RULE_DELETE,
  RULE_SAVE,
  RULE_UPDATE,
  RULE_COPY,
  SET_USER_PERMISSION,
  RULE_ACTIVE
} from '../common/constant'
import { buildUrlParamNew } from '../util'

// 修改通知信息
export function changeNotifyInfo(data) {
  return {
    type: CHANGE_NOTIFY_INFO,
    data
  }
}

// 修改通知频率
export function changeNotifyFrequency(data) {
  return {
    type: CHANGE_NOTIFY_FREQUENCY,
    data
  }
}

export function login(loginName, loginPassword) {
  return async () => {
    return {
      type: LOGIN,
      promise: jFetch.post(`/${UAA_PREFIX}/load.do`, {
        data: { loginName, loginPassword }
      })
    }
  }
}

export function setUserPermissions(data) {
  return {
    type: SET_USER_PERMISSION,
    data
  }
}

export function getSysFieldList(fieldType = '', dataType = '', fieldName = '') {
  return {
    type: SYS_FIELD_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/sysDefaultField/filedAll.do`, {
        data: { fieldType, dataType, fieldName }
      })
    }
  }
}

export function getCustomFieldList(fieldType = '', dataType = '', fieldName = '') {
  return {
    type: CUSTOM_FIELD_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/userDefineField/selectByConditions.do`, {
        data: { fieldType, dataType, fieldName }
      })
    }
  }
}

export function getDataTypeList() {
  return {
    type: GET_DATA_TYPE_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/common/dataTypeList.do`)
    }
  }
}

export function getFieldTypeList() {
  return {
    type: GET_FIELD_TYPE_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/common/fieldTypeList.do`)
    }
  }
}

export function deleteSysField(fieldId = '', fieldName = '') {
  return async () => {
    return {
      type: SYS_FIELD_DELETE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/sysDefaultField/delSys.do`, {
        data: { fieldId, fieldName }
      })
    }
  }
}

export function saveSysField(data) {
  return async () => {
    return {
      type: SYS_FIELD_SAVE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/sysDefaultField/insertSys.do`, {
        data
      })
    }
  }
}

export function updateSysField(data) {
  return async () => {
    return {
      type: SYS_FIELD_UPDATE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/sysDefaultField/updateSys.do`, {
        data
      })
    }
  }
}

export function deleteCustomField(definedFieldId = '', fieldName = '') {
  return async () => {
    return {
      type: CUSTOM_FIELD_DELETE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/userDefineField/delete.do`, {
        data: { definedFieldId, fieldName }
      })
    }
  }
}

export function saveCustomField(data) {
  return async () => {
    return {
      type: CUSTOM_FIELD_SAVE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/userDefineField/insert.do`, {
        data
      })
    }
  }
}

export function updateCustomField(data) {
  return async () => {
    return {
      type: CUSTOM_FIELD_UPDATE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/userDefineField/update.do`, {
        data
      })
    }
  }
}

export function getRuleSetList(data) {
  return {
    type: GET_RULE_SET_LIST,
    payload: {
      promise: jFetch.get(`/${DMS_PREFIX}/rule/ruleSet/selectByConditions.do?${data}`)
    }
  }
}

export function getRuleSet4RuleCopyList() {
  return {
    type: GET_RULE_SET_4_RULE_COPY_LIST,
    payload: {
      promise: jFetch.get(`/${DMS_PREFIX}/rule/ruleSet/list/editing`)
    }
  }
}

export function getRuleList(data) {
  return {
    type: GET_RULE_LIST,
    payload: {
      promise: jFetch.get(`/${DMS_PREFIX}/rule/ruleInfo/selectByConditions.do?${buildUrlParamNew(data)}`)
    }
  }
}

export function deleteRule(data) {
  return async () => {
    return {
      type: RULE_DELETE,
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleInfo/delete.do`, {
        data
      })
    }
  }
}

export function saveRule(data) {
  return async () => {
    return {
      type: RULE_SAVE,
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleInfo/insert.do`, {
        data
      })
    }
  }
}

export function updateRule(data) {
  return async () => {
    return {
      type: RULE_UPDATE,
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleInfo/update.do`, {
        data
      })
    }
  }
}

export function copyRule(data) {
  return async () => {
    return {
      type: RULE_COPY,
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleInfo/copypaste.do`, {
        data
      })
    }
  }
}

export function activeRule(data) {
  return async () => {
    return {
      type: RULE_ACTIVE,
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleInfo/active.do`, {
        data
      })
    }
  }
}

export function getDataServices() {
  return {
    promise: Promise.all([getDataTypeList().payload.promise, jFetch.get(`/${DMS_PREFIX}/ds/services`)])
  }
}

export function getDataServicesList(id) {
  return {
    promise: jFetch.get(`/${DMS_PREFIX}/ds/list?serviceId=${id}`)
  }
}

export function getFieldListPaginated(data) {
  return cFetch.get(`/${DMS_PREFIX}/field/list/paginated?${data}`)
}

export function addField(data) {
  return {
    promise: cFetch.post(`/${DMS_PREFIX}/field/create`, { data })
  }
}

export function updateField(data) {
  return {
    promise: cFetch.post(`/${DMS_PREFIX}/field/update`, { data })
  }
}

export function updateFieldActive(data) {
  return cFetch.post(`/${DMS_PREFIX}/field/active`, { data })
}

export function fieldDependencies(data) {
  return cFetch.get(`/${DMS_PREFIX}/field/dependencies?${data}`)
}

export function delField(data) {
  return cFetch.post(`/${DMS_PREFIX}/field/delete`, { data })
}

export function getGenerated(query) {
  return cFetch.get(`/${DMS_PREFIX}/field/list/generated?${query}`)
}

export function getFieldList(data) {
  return cFetch.get(`/${DMS_PREFIX}/field/list?${buildUrlParamNew(data)}`)
}

export function getNewRuleList(ruleId) {
  return {
    type: GET_RULE_LIST,
    payload: {
      promise: jFetch.get(`/${DMS_PREFIX}/rule/ruleInfo/summary?ruleId=${ruleId}`)
    }
  }
}

export function addFieldEnum(data) {
  return cFetch.post(`/${DMS_PREFIX}/field/add-enum`, { data })
}

export function getNotifyInfo() {
  return cFetch.get(`/${DMS_PREFIX}/warning/notify/info`)
}

export function markNotifyInfo() {
  return cFetch.get(`/${DMS_PREFIX}/warning/notify/mark-read`)
}
