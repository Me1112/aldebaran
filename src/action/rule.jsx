import { jFetch, cFetch } from '../common'
import { buildUrlParam, buildUrlParamNew } from '../util'
import {
  DMS_PREFIX,
  GET_SCENE_LIST,
  SAVE_SCENE,
  UPDATE_SCENE,
  DELETE_SCENE,
  GET_RULE_SET_LIST,
  GET_MATCH_MODEL_SELECT,
  GET_APP_SELECT,
  GET_SCENE_SELECT,
  GET_VERIFY_OBJECT_TYPE_LIST,
  GET_OPERATION_TYPE_LIST,
  GET_BUSINESS_LINE,
  GET_VERIFY_STATUS_LIST
} from '../common/constant'

export function getDiffInfo(data) {
  return jFetch.get(`/${DMS_PREFIX}/rs/ruleSetInfo?${buildUrlParam(data)}`)
}

export function getIncomeFields(data) {
  return jFetch.get(`/${DMS_PREFIX}/rs/incomeFields?${buildUrlParam(data)}`)
}

export function postDiffTest(data) {
  return cFetch.post(`/${DMS_PREFIX}/rs/incomeResTest`, { data })
}

export function getSceneList(data) {
  return {
    type: GET_SCENE_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/scenarioDic/querys.do`, {
        data
      })
    }
  }
}

export function getScenarioDependencies(id) {
  return cFetch.get(`${DMS_PREFIX}/scenario/dependencies?id=${id}`)
}

export function saveScene(data) {
  return async () => {
    return {
      type: SAVE_SCENE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/scenarioDic/save.do`, {
        data
      })
    }
  }
}

export function updateScene(data) {
  return async () => {
    return {
      type: UPDATE_SCENE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/scenarioDic/update.do`, {
        data
      })
    }
  }
}

export function deleteScene(data) {
  return async () => {
    return {
      type: DELETE_SCENE,
      promise: jFetch.post(`/${DMS_PREFIX}/rule/scenarioDic/delete.do`, {
        data
      })
    }
  }
}

export function getRuleSetList(data) {
  return async () => {
    return {
      type: GET_RULE_SET_LIST,
      promise: jFetch.get(`/${DMS_PREFIX}/rule/ruleSet/selectByConditions.do?${data}`)
    }
  }
}

export function activeRuleSet(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleSet/active.do`, {
        data
      })
    }
  }
}

export function deleteRuleSet(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleSet/delete.do`, {
        data
      })
    }
  }
}

export function onOfflineRuleSet(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleSet/onOffLine.do`, {
        data
      })
    }
  }
}

export function copyRuleSet(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleSet/copypaste.do`, {
        data
      })
    }
  }
}

export function getMatchModeSelect() {
  return {
    type: GET_MATCH_MODEL_SELECT,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/common/matchModeList.do`)
    }
  }
}

export function getAppSelect() {
  return {
    type: GET_APP_SELECT,
    payload: {
      promise: cFetch.get(`/${DMS_PREFIX}/sys/app/getList.do`)
    }
  }
}

export function getSceneSelect() {
  return {
    type: GET_SCENE_SELECT,
    payload: {
      promise: cFetch.get(`/${DMS_PREFIX}/sys/scenarioDic/getList.do`)
    }
  }
}

export function insertRuleSet(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleSet/insert.do`, {
        data
      })
    }
  }
}

export function updateRuleSet(data) {
  return async () => {
    return {
      promise: cFetch.post(`/${DMS_PREFIX}/rule/ruleSet/update.do`, {
        data
      })
    }
  }
}

export function getConditionList(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/condition/selectByConditions.do`, {
        data
      })
    }
  }
}

export function copyCondition(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/condition/copypaste.do`, {
        data
      })
    }
  }
}

export function deleteCondition(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/condition/delete.do`, {
        data
      })
    }
  }
}

export function updateExpression(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/condition/updateExpression.do`, {
        data
      })
    }
  }
}

export function getVerificationList(data) {
  return jFetch.post(`/${DMS_PREFIX}/rule/verification/selectByConditions.do`, {
    data
  })
}

export function getVerifyObjectTypeList() {
  return {
    type: GET_VERIFY_OBJECT_TYPE_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/common/verifyObjectTypeList.do`)
    }
  }
}

export function getOperationTypeList() {
  return {
    type: GET_OPERATION_TYPE_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/common/operationTypeList.do`)
    }
  }
}

export function getVerifyObjectStatusList() {
  return {
    type: GET_VERIFY_STATUS_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/common/verifyObjectStatusList.do`)
    }
  }
}

export function getOperList(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/sysDefaultField/getOperList.do`, {
        data
      })
    }
  }
}

export function getEnumDetail(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/sysDefaultField/getEnumDetail.do`, {
        data
      })
    }
  }
}

export function saveCondition(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/condition/insert.do`, {
        data
      })
    }
  }
}

export function updateCondition(data) {
  return async () => {
    return {
      promise: jFetch.post(`/${DMS_PREFIX}/rule/condition/update.do`, {
        data
      })
    }
  }
}

export function getConditionField(param) {
  return async () => {
    return {
      promise: jFetch.get(`/${DMS_PREFIX}/rule/condition/selectFieldList.do?${buildUrlParam(param)}`)
    }
  }
}

export function updateVerification(data) {
  return jFetch.post(`/${DMS_PREFIX}/rule/verification/bulkUpdate.do`, {
    data
  })
}

export function getRuleCondition(data) {
  return jFetch.get(`/${DMS_PREFIX}/rule-condition/lists?${data}`)
}

export function getArithmeticStrList() {
  return jFetch.post(`/${DMS_PREFIX}/common/arithmeticStrList.do`)
}

export function getBlackListTypeList(data) {
  return jFetch.post(`/${DMS_PREFIX}/blacklist/blacklistType/getBlackListTypeList.do`)
}

export function delCondition(data) {
  return cFetch.post(`/${DMS_PREFIX}/rule-condition/delete`, { data })
}

export function addRuleCondition(data) {
  return cFetch.post(`/${DMS_PREFIX}/rule-condition/add`, { data })
}

export function updateRuleCondition(data) {
  return cFetch.post(`/${DMS_PREFIX}/rule-condition/update`, { data })
}

export function updateExpressionCondition(data) {
  return cFetch.post(`/${DMS_PREFIX}/rule-condition/updateExpression`, { data })
}

export function getRuleConditionTypeList() {
  return jFetch.get(`/${DMS_PREFIX}/common/ruleConditionTypeList.do`)
}

export function getNumberOperatorTypeList() {
  return jFetch.get(`/${DMS_PREFIX}/common/numberOperatorTypeList.do`)
}

export function getFieldsOperators(data) {
  return jFetch.get(`/${DMS_PREFIX}/common/operators?${data}`)
}

export function getRuleConditionFields() {
  const promises = [jFetch.get(`/${DMS_PREFIX}/field/list`)]
  return Promise.all(promises)
}

export function getFieldDimensionality() {
  return cFetch.get(`/${DMS_PREFIX}/field/dimensionality`)
}

// 包含 rightData
export function getHistoryFactorList(data) {
  return cFetch.get(`${DMS_PREFIX}/factor/historyFactorList?${data}`)
}

// 名单命中 rightData
export function getListRightData(data) {
  return cFetch.get(`${DMS_PREFIX}/blacklist/getBlacklistByDimensionality?${data}`)
}

// 获取枚举值
export function getEnumList(data) {
  return jFetch.get(`${DMS_PREFIX}/field/enum-detail?${data}`)
}

export function getBusinessList() {
  return {
    type: GET_BUSINESS_LINE,
    payload: {
      promise: cFetch.get(`${DMS_PREFIX}/business-line/list`)
    }
  }
}

export function getBusinessListNoNormal() {
  return {
    type: GET_BUSINESS_LINE,
    payload: {
      promise: cFetch.get(`${DMS_PREFIX}/business-line/list/sub`)
    }
  }
}

export function dependenciesRule(id) {
  return cFetch.get(`${DMS_PREFIX}/ruleSet/dependencies?${id}`)
}

export function dependenciesScorecard(id) {
  return cFetch.get(`${DMS_PREFIX}/scorecard/dependencies?${id}`)
}

export function strategyInput(data) {
  return cFetch.post(`${DMS_PREFIX}/rule-set/import`, { data })
}

export function strategyInputCheck(data) {
  return cFetch.post(`${DMS_PREFIX}/rule-set/import/pre-check`, { data })
}

export function strategyInputCheckName(strategyName) {
  return cFetch.get(`${DMS_PREFIX}/strategy/check/strategyName?strategyName=${strategyName}`)
}

export function strategyCheck(data) {
  return cFetch.post(`${DMS_PREFIX}/strategy/check`, { data })
}

export function getExpression(id) {
  return cFetch.get(`${DMS_PREFIX}/rule-condition/get-expression?${id}`)
}

export function dependenciesApp(id) {
  return cFetch.get(`${DMS_PREFIX}/app/dependencies?${id}`)
}

export function getVerificationTypes() {
  return cFetch.get(`${DMS_PREFIX}/rule/verification/types`)
}

export function getVerificationInfo(verificationId) {
  return cFetch.get(`${DMS_PREFIX}/rule/verification/comparison?verificationId=${verificationId}`)
}

export function getRelativeVersionList(ruleSetId) {
  return cFetch.get(`${DMS_PREFIX}/rule/ruleSet/relations?ruleSetId=${ruleSetId}`)
}

export function relativeVersionRevert(data) {
  return cFetch.post(`${DMS_PREFIX}/rule/ruleSet/revert`, {
    data
  })
}

export function versionCompare(data) {
  return cFetch.get(`${DMS_PREFIX}/rule/ruleSet/comparison?${buildUrlParamNew(data)}`)
}
