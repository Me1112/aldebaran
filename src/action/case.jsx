import { cFetch } from '../common'
import { DMS_PREFIX } from '../common/constant'
import { buildUrlParamOnlyCheckNullOrUnder } from '../util'

export function getCaseConclusion() {
  return cFetch.get(`/${DMS_PREFIX}/case/case-conclusion`)
}

export function getCaseSubject(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/case-subject?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getCaseRisk() {
  return cFetch.get(`/${DMS_PREFIX}/case/case-risk`)
}

export function getCaseSource() {
  return cFetch.get(`/${DMS_PREFIX}/case/case-source`)
}

export function getCaseEvents(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/events?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function createCase(data) {
  return cFetch.post(`/${DMS_PREFIX}/case/create`, {
    data
  })
}

export function firstAudit(data) {
  return cFetch.post(`/${DMS_PREFIX}/case/audit-first`, {
    data
  })
}

export function lastAudit(data) {
  return cFetch.post(`/${DMS_PREFIX}/case/audit-last`, {
    data
  })
}

export function getCaseAssigner(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/assignee?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getCreatedList(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/created-list?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getCaseDetails(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/details?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function assignCases(data) {
  return cFetch.post(`/${DMS_PREFIX}/case/assign`, {
    data
  })
}

export function updateCase(data) {
  return cFetch.post(`/${DMS_PREFIX}/case/update`, {
    data
  })
}

export function getAuditList(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/audit-list?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getCaseList(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/list?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getCaseStatuses() {
  return cFetch.get(`/${DMS_PREFIX}/case/case-status`)
}

export function archiveCase(data) {
  return cFetch.post(`/${DMS_PREFIX}/case/classify`, { data })
}

export function getArchivedCaseList(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/classified-list?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function eventValidation(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/event-validation?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getCaseStatus() {
  return cFetch.get(`/${DMS_PREFIX}/case/chart/status-static`)
}

export function getCaseType() {
  return cFetch.get(`/${DMS_PREFIX}/case/chart/type-static`)
}

export function getCaseCount() {
  return cFetch.get(`/${DMS_PREFIX}/case/chart/count-static`)
}

export function getWarningList(data) {
  return cFetch.get(`/${DMS_PREFIX}/warning-signal/list?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getFinishedList(data) {
  return cFetch.get(`/${DMS_PREFIX}/warning-signal/finished-list?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getAuditUserList() {
  return cFetch.get(`/${DMS_PREFIX}/warning-signal/get-user-list`)
}

export function getInvalidScopeList() {
  return cFetch.get(`/${DMS_PREFIX}/warning-signal/get-ineffective-scope`)
}

export function invalidWarning(data) {
  return cFetch.post(`/${DMS_PREFIX}/warning-signal/ineffective`, {
    data
  })
}

export function getAuditedCaseList(data) {
  return cFetch.get(`/${DMS_PREFIX}/case/processed?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}
