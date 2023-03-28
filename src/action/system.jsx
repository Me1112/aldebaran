import { jFetch, cFetch } from '../common'
import { DMS_PREFIX, UAA_PREFIX } from '../common/constant'
import {
  GET_SYSTEM_SERVICE_LIST,
  GET_API_TYPE_SELECT,
  GET_APP_LIST,
  GET_COMPANY_LIST,
  GET_OPERATION_LIST,
  GET_MODULE_LIST,
  GET_ROLE_LIST,
  GET_USER_LIST,
  CAN_ROLE_LIST
} from '../common/system_constant'
import { buildUrlParamNew, buildUrlParamOnlyCheckNullOrUnder } from '../util'

export function getSystemServiceList(data) {
  return {
    type: GET_SYSTEM_SERVICE_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/thirdApi/getFullThirdApis.do`, {
        data
      })
    }
  }
}

export function getApiTypeSelect() {
  return {
    type: GET_API_TYPE_SELECT,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/thirdApi/getFullThirdApiTypes.do`)
    }
  }
}

export function saveApi(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/thirdApi/insertThirdApi.do`, { data })
    }
  }
}

export function updateApi(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/thirdApi/updateFullThirdApi.do`, { data })
    }
  }
}

export function getAppList(data) {
  return {
    type: GET_APP_LIST,
    payload: {
      promise: cFetch.get(`/${DMS_PREFIX}/sys/app/getList.do?${buildUrlParamNew(data)}`)
    }
  }
}

export function deleteApp(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/sys/app/delete.do`, { data })
    }
  }
}

export function updateApp(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/sys/app/update.do`, { data })
    }
  }
}

export function saveApp(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/sys/app/insert.do`, { data })
    }
  }
}

export function getSecretKey(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/sys/app/getSecretKey.do`, { data })
    }
  }
}

export function getCompanyList(data) {
  return {
    type: GET_COMPANY_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/sys/company/getList.do`, { data })
    }
  }
}

export function deleteCompany(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/sys/company/delete.do`, { data })
    }
  }
}

export function updateCompany(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/sys/company/update.do`, { data })
    }
  }
}

export function saveCompany(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/sys/company/insert.do`, { data })
    }
  }
}

export function getOperationList(data) {
  return {
    type: GET_OPERATION_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/sys/operationHistory/getList.do`, { data })
    }
  }
}

export function getModuleList(data) {
  return {
    type: GET_MODULE_LIST,
    payload: {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/module/getList.do`, { data })
    }
  }
}

export function deleteModule(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/module/delete.do`, { data })
    }
  }
}

export function getRoleList() {
  return {
    type: GET_ROLE_LIST,
    payload: {
      promise: jFetch.get(`/${UAA_PREFIX}/sys/role/getList.do`)
    }
  }
}

export function getUserList(data) {
  return {
    type: GET_USER_LIST,
    payload: {
      promise: cFetch.get(`/${UAA_PREFIX}/sys/userInfo/getList.do?${buildUrlParamNew(data)}`)
    }
  }
}

export function addUser(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${UAA_PREFIX}/sys/userInfo/insert.do`, { data })
    }
  }
}

export function updateUser(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${UAA_PREFIX}/sys/userInfo/update.do`, { data })
    }
  }
}

export function updateStatus(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/sys/userInfo/update-status`, { data })
    }
  }
}

export function deleteUser(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/userInfo/delete.do`, { data })
    }
  }
}

export function getRolesByUserId(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/userInfo/selectRolesByUserId.do`, { data })
    }
  }
}

export function getCanCreateRoles(data) {
  return {
    type: CAN_ROLE_LIST,
    payload: {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/userInfo/canCreateRolesByUserId.do`, { data })
    }
  }
}

export function resetPassword(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/userInfo/resetPassword.do`, { data })
    }
  }
}

export function updatePassword(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/userInfo/updatePassword.do`, { data })
    }
  }
}

export function addRole(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${UAA_PREFIX}/sys/role/insert.do`, { data })
    }
  }
}

export function updateRole(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${UAA_PREFIX}/sys/role/update.do`, { data })
    }
  }
}

export function deleteRole(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${UAA_PREFIX}/sys/role/delete.do`, { data })
    }
  }
}

export function selectAllActionByRole(roleId = '') {
  return cFetch.get(`/${UAA_PREFIX}/sys/role/selectAllActionByRole.do?roleId=${roleId}`)
}

export function userLogout(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${UAA_PREFIX}/inactive-token.do`, { data })
    }
  }
}

export function insertModule(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/module/insert.do`, { data })
    }
  }
}

export function updateModule(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${UAA_PREFIX}/sys/module/update.do`, { data })
    }
  }
}

export function getOperationTypeList() {
  return jFetch.get(`/${DMS_PREFIX}/common/operateList.do`)
}

export function getAuditTypeList() {
  return jFetch.get(`/${DMS_PREFIX}/common/auditTypeList.do`)
}

export function getAuditList(data) {
  return jFetch.get(`/${DMS_PREFIX}/audit/list?${data}`)
}

export function getResourceList(resourceType) {
  return jFetch.get(`/${DMS_PREFIX}/ea/strategies?strategyType=${resourceType}`)
}

export function updateResourceNode(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream-node/update`, { data })
}

export function getDepartmentSelect(name) {
  return jFetch.get(`/${DMS_PREFIX}/department/list?name=${name}`)
}

export function getDepartmentSelectFilter(id) {
  return jFetch.get(`/${DMS_PREFIX}/department/list/filter?id=${id}`)
}

export function saveDepartment(data) {
  return cFetch.post(`/${DMS_PREFIX}/department/add`, { data })
}

export function updateDepartment(data) {
  return cFetch.post(`/${DMS_PREFIX}/department/update`, { data })
}

export function deleteDepartment(data) {
  return cFetch.post(`/${DMS_PREFIX}/department/delete`, { data })
}

export function updateUserRoleInfo(data) {
  return cFetch.post(`/${DMS_PREFIX}/sys/role/updateUserRoleInfo`, { data })
}

export function getSettingUserList(roleId) {
  return jFetch.get(`/${DMS_PREFIX}/sys/userInfo/list/role?roleId=${roleId}`)
}

export function getJobList() {
  return jFetch.get(`/${DMS_PREFIX}/analyse-job/list`)
}

export function getJobFailDetail(data) {
  return jFetch.get(`/${DMS_PREFIX}/job-execute-details/list?${buildUrlParamNew(data)}`)
}

export function updateJobFrequency(data) {
  return cFetch.post(`/${DMS_PREFIX}/analyse-job/update-frequency`, {
    data
  })
}

export function manualExecute(data) {
  return cFetch.post(`/${DMS_PREFIX}/analyse-job/manual-execute`, {
    data
  })
}

export function getIncomingList(data) {
  return jFetch.get(`/${DMS_PREFIX}/event/log/list?${buildUrlParamNew(data)}`)
}

export function getCallbackInfo(data) {
  return jFetch.get(`/${DMS_PREFIX}/callback/log/detail?${buildUrlParamNew(data)}`)
}

export function getCallbackLogList(data) {
  return jFetch.get(`/${DMS_PREFIX}/callback/log/list?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}
