import { jFetch, cFetch } from '../common'
import { buildUrlParamNew, buildUrlParamOnlyCheckNullOrUnder } from '../util'
import {
  DMS_PREFIX
} from '../common/constant'
import {
  GET_TODAY_DATA
} from '../common/report_constant'

// 全部统计数据
export function getTotalData(data) {
  // return {
  //   type: GET_TODAY_DATA,
  //   payload: {
  //     promise: cFetch.post(`/${DMS_PREFIX}/risk/eventRec/getTotalData.do`, {
  //       data
  //     })
  //   }
  // }
  return async () => {
    return {
      type: GET_TODAY_DATA,
      promise: jFetch.post(`/${DMS_PREFIX}/risk/eventRec/getTotalData.do`, {
        data
      })
    }
  }
}

// 今日数据和折线图数据
export function getRiskStat(data) {
  return async () => {
    return {
      type: GET_TODAY_DATA,
      promise: jFetch.post(`/${DMS_PREFIX}/risk/eventRec/getRiskStat.do`, {
        data
      })
    }
  }
}

// 事件场景分布
export function getScenarioPercent(data) {
  return async () => {
    return {
      type: GET_TODAY_DATA,
      promise: jFetch.post(`/${DMS_PREFIX}/risk/eventRec/getScenarioPercent.do`, {
        data
      })
    }
  }
}

export function getTopSix(data) {
  return async () => {
    return {
      type: GET_TODAY_DATA,
      promise: jFetch.post(`/${DMS_PREFIX}/risk/eventRec/getTopSix.do`, {
        data
      })
    }
  }
}

export function getAllRule(data) {
  return async () => {
    return {
      type: GET_TODAY_DATA,
      promise: jFetch.post(`/${DMS_PREFIX}/risk/eventRec/getAllRule.do`, {
        data
      })
    }
  }
}

export function getIpProvince(data) {
  return async () => {
    return {
      type: GET_TODAY_DATA,
      promise: jFetch.post(`/${DMS_PREFIX}/risk/eventRec/getIpProvince.do`, {
        data
      })
    }
  }
}

export function getIpCity(data) {
  return async () => {
    return {
      type: GET_TODAY_DATA,
      promise: jFetch.post(`/${DMS_PREFIX}/risk/eventRec/getIpCity.do`, {
        data
      })
    }
  }
}

export function getProvinceReports(params) {
  return cFetch.get(`/${DMS_PREFIX}/province-reports?${params}`)
}

export function getCityReports(params) {
  return cFetch.get(`/${DMS_PREFIX}/city-reports?${params}`)
}

export function getAppEvents(params = {}) {
  return cFetch.get(`/${DMS_PREFIX}/app-event?${buildUrlParamOnlyCheckNullOrUnder(params)}`)
}

export function getScenarioEvents(params = {}) {
  return cFetch.get(`/${DMS_PREFIX}/scenario-event?${buildUrlParamOnlyCheckNullOrUnder(params)}`)
}

export function getTodayEvent() {
  return cFetch.get(`/${DMS_PREFIX}/today-event`)
}

export function getTotalEvent(data) {
  return cFetch.get(`/${DMS_PREFIX}/total-event?${buildUrlParamNew(data)}`)
}

export function getRiskPeriod(data) {
  return cFetch.get(`/${DMS_PREFIX}/risk-period?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getStrategyState() {
  return cFetch.get(`/${DMS_PREFIX}/report/strategy/state`)
}

export function getStrategyUsed() {
  return cFetch.get(`/${DMS_PREFIX}/report/strategy/used`)
}

export function getStrategyList(strategyType) {
  return cFetch.get(`/${DMS_PREFIX}/strategy-list?strtegyType=${strategyType}`)
}

export function getStrategyHitRules(params = {}) {
  return cFetch.get(`/${DMS_PREFIX}/report/strategy/hit/rule?${buildUrlParamOnlyCheckNullOrUnder(params)}`)
}

export function getStrategyScoreCard(params = {}) {
  return cFetch.get(`/${DMS_PREFIX}/report/strategy/score/card?${buildUrlParamOnlyCheckNullOrUnder(params)}`)
}

export function getHitDecisionTree(params = {}) {
  return cFetch.get(`/${DMS_PREFIX}/hit-decision-tree?${buildUrlParamOnlyCheckNullOrUnder(params)}`)
}

export function getHitDecisionStream(params = {}) {
  return cFetch.get(`/${DMS_PREFIX}/hit-decision-stream?${buildUrlParamOnlyCheckNullOrUnder(params)}`)
}

export function getReportTendency(data) {
  return cFetch.get(`/${DMS_PREFIX}/data-service/call/tendency?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getReportCount(data) {
  return cFetch.get(`/${DMS_PREFIX}/data-service/call/count?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}

export function getReportDuration(data) {
  return cFetch.get(`/${DMS_PREFIX}/data-service/call/duration?${buildUrlParamOnlyCheckNullOrUnder(data)}`)
}
