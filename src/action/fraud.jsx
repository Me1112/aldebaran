import { cFetch } from '@common'
import { DMS_PREFIX } from '@common/constant'
import { buildUrlParamOnlyCheckNullOrUnder } from '@util'

export function fetchCaseDetail(data = {}) {
  return cFetch.post(`${DMS_PREFIX}/fraud/overview/list`, { data })
}

export function fetchLastWeekOverview() {
  return cFetch.get(`${DMS_PREFIX}/fraud/overview/lastWeekOverview`)
}

export function fetchSystemTypeTable(data = {}) {
  return cFetch.get(`${DMS_PREFIX}/fraud/overview/fraudSystemTypeTable?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function fetchStatisticByType(data = {}) {
  return cFetch.get(`${DMS_PREFIX}/fraud/overview/fraudStatisticByType?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}
