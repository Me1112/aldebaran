import { cFetch } from '../common'
import { DMS_PREFIX } from '../common/constant'
import { buildUrlParamNew, buildUrlParamOnlyCheckNullOrUnder } from '../util'
import { GET_APP_SELECT, GET_SCENE_SELECT, GET_OFFLINE_SCENE_SELECT } from '../common/verification_constant'

export function getOfflineDataList(data) {
  return cFetch.get(`/${DMS_PREFIX}/offline/data/list?${buildUrlParamNew(data)}`)
}

export function createOfflineDataStep1(data) {
  return cFetch.post(`/${DMS_PREFIX}/offline/data/check`, {
    data
  })
}

export function createOfflineDataStep2(data) {
  return cFetch.post(`/${DMS_PREFIX}/offline/data/import`, {
    data
  })
}

export function getOfflineDataDetail(data) {
  return cFetch.get(`/${DMS_PREFIX}/offline/data/info?${buildUrlParamNew(data)}`)
}

export function offlineDataDependencies(data) {
  return cFetch.get(`/${DMS_PREFIX}/offline/data/delete/dependence?${buildUrlParamNew(data)}`)
}

export function deleteOfflineData(data) {
  return cFetch.post(`/${DMS_PREFIX}/offline/data/delete`, {
    data
  })
}

export function getBusinessFields(data) {
  return cFetch.get(`${DMS_PREFIX}/field/list?${buildUrlParamNew(data)}&fieldCategory=FIELD`)
}

export function getValidationTaskList(data) {
  return cFetch.get(`/${DMS_PREFIX}/validation-task/list?${buildUrlParamNew(data)}`)
}

export function getAppSelect() {
  return {
    type: GET_APP_SELECT,
    payload: {
      promise: cFetch.get(`/${DMS_PREFIX}/validation-task/apps`)
    }
  }
}

export function getSceneSelect(data) {
  return {
    type: GET_SCENE_SELECT,
    payload: {
      promise: cFetch.get(`/${DMS_PREFIX}/validation-task/scenarios?${buildUrlParamNew(data)}`)
    }
  }
}

export function getOfflineDataSelect() {
  return cFetch.get(`/${DMS_PREFIX}/offline/data/all`)
}

export function getOfflineSceneSelect(data) {
  return {
    type: GET_OFFLINE_SCENE_SELECT,
    payload: {
      promise: cFetch.get(`/${DMS_PREFIX}/offline/data/scenarios?${buildUrlParamNew(data)}`)
    }
  }
}

export function getStrategySelect(data) {
  return cFetch.get(`/${DMS_PREFIX}/validation-task/strategies?${buildUrlParamNew(data)}`)
}

export function getCaseSelect(data) {
  return cFetch.get(`/${DMS_PREFIX}/validation-task/cases?${buildUrlParamNew(data)}`)
}

export function createTask(data) {
  return cFetch.post(`/${DMS_PREFIX}/validation-task/add`, {
    data
  })
}

export function updateTask(data) {
  return cFetch.post(`/${DMS_PREFIX}/validation-task/update`, {
    data
  })
}

export function deleteTask(data) {
  return cFetch.post(`/${DMS_PREFIX}/validation-task/delete`, {
    data
  })
}

export function getTaskResultList(data) {
  return cFetch.post(`/${DMS_PREFIX}/verify-result/list`, {
    data
  })
}

export function getVerifyResultDate(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/get-date?${buildUrlParamNew(data)}`)
}

export function getRestoreDataList4VerifyTask(data) {
  return cFetch.get(`${DMS_PREFIX}/verify-result/event/details?${buildUrlParamNew(data)}`)
}

export function getRuleSetInfo4VerifyTask(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/rule-set/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getScoreCardInfo4VerifyTask(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/score-card/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getDecisionTreeInfo4VerifyTask(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/decision-tree/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getDecisionStreamInfo4VerifyTask(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/decision-stream/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

// 验证任务-报表
export function getOnlineRatios(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/online-report/effect/comparison?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getOnlineDecisionResult(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/online-report/decision/result?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getOnlineDecisionResultDaily(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/online-report/decision/result/daily?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getOnlineScoreCardResult(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/online-report/score-card?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getOfflineScoreCardResult(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/offline-report/score-card?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getOfflineEventRisk(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/offline/daily/event-risk?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getOfflineEffectResult(data) {
  return cFetch.get(`/${DMS_PREFIX}/verify-result/offline/strategy?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getUsedScenarios(data) {
  return cFetch.get(`/${DMS_PREFIX}/validation-task/used-scenarios?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}
