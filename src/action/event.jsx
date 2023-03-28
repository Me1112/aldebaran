import { cFetch, jFetch } from '../common'
import { DMS_PREFIX } from '../common/constant'
import { buildUrlParamOnlyCheckNullOrUnder } from '../util'
import {
  GET_PROVINCE_LIST,
  OFFLINE_UPLOAD,
  OFFLINE_UPLOAD_STATUS,
  OFFLINE_DOWNLOAD
} from '../common/event_constant'

export function getEventQueryList(data) {
  return {
    promise: cFetch.post(`/${DMS_PREFIX}/event/event/getPage.do`, {
      data
    })
  }
}

export function getProvinceList(data) {
  return {
    type: GET_PROVINCE_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/event/event/getProvince.do`, {
        data
      })
    }
  }
}

export function getCityList(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/event/event/getCity.do`, {
        data
      })
    }
  }
}

export function exportStart(data) {
  return {
    promise: jFetch.post(`/${DMS_PREFIX}/event/event/exportStart.do`, {
      data
    })
  }
}

export function exportStatus(data) {
  return {
    promise: jFetch.post(`/${DMS_PREFIX}/event/event/exportStatus.do`, {
      data
    })
  }
}

export function getPersonalList(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/personalStats/getEventRecByAccountId.do`, {
        data
      })
    }
  }
}

export function uploadOffline(data) {
  return async () => {
    return {
      type: OFFLINE_UPLOAD,
      promise: cFetch.post(`/${DMS_PREFIX}/event/event/uploadAndDecision.do`, {
        data
      })
    }
  }
}

export function uploadOfflineStatus(data) {
  return async () => {
    return {
      type: OFFLINE_UPLOAD_STATUS,
      promise: cFetch.post(`/${DMS_PREFIX}/event/event/uploadAndDecisionStatus.do`, {
        data
      })
    }
  }
}

export function downloadCheck(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/event/event/downEventTemplateStart.do`, {
        data
      })
    }
  }
}

export function download(data) {
  return async () => {
    return {
      type: OFFLINE_DOWNLOAD,
      promise: cFetch.post(`/${DMS_PREFIX}/event/event/downEventTemplate.do`, {
        data
      })
    }
  }
}

export function verifyUpdate(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/event/event/update.do`, {
        data
      })
    }
  }
}

export function getDataServiceInfo(id) {
  return cFetch.get(`/${DMS_PREFIX}/event/dataServiceInfo?eventId=${id}`)
}

export function getDimensions(data) {
  return jFetch.get(`/${DMS_PREFIX}/event/history/dimensions?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getHistoryList(data) {
  return jFetch.get(`/${DMS_PREFIX}/event/history?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getHitRulePage(data) {
  return jFetch.get(`/${DMS_PREFIX}/event/getHitRulePage?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getRuleSetInfo(data) {
  return jFetch.get(`/${DMS_PREFIX}/event/rule-set/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getScoreCardInfo(data) {
  return jFetch.get(`/${DMS_PREFIX}/event/score-card/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getDecisionTreeInfo(data) {
  return jFetch.get(`/${DMS_PREFIX}/event/decision-tree/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getDecisionStreamInfo(data) {
  return jFetch.get(`/${DMS_PREFIX}/event/decision-stream/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getRestoreDataList(data) {
  const { eventId = '', isTesting = true } = data
  return cFetch.get(`${DMS_PREFIX}/event/details?eventId=${eventId}&isTesting=${isTesting}`)
}

// 高级查询字段列表
export function getBusinessFields(data) {
  const { businessLineId = '' } = data
  return cFetch.get(`${DMS_PREFIX}/field/list?businessLineId=${businessLineId}&fieldSource=SYSTEM&fieldCategory=FIELD`)
}

// 根据应用名称和场景查询命中规则
export function getHitRules(data) {
  return cFetch.get(`${DMS_PREFIX}/event/getHitRules?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function markEvent(data) {
  return cFetch.post(`${DMS_PREFIX}/event/mark/result`, {
    data
  })
}

export function getPolicyList(data) {
  return cFetch.get(`${DMS_PREFIX}/warning-signal/policy-list?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function handleStatus(data) {
  return cFetch.post(`${DMS_PREFIX}/warning-signal/update-handle-status`, {
    data
  })
}

export function getTopOne() {
  return cFetch.get(`${DMS_PREFIX}/warning-signal/get-top-one`)
}

export function checkBeforeDownload(taskId) {
  return cFetch.get(`${DMS_PREFIX}/verify-result/size/check?taskId=${taskId}`)
}
