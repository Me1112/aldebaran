import { cFetch, jFetch } from '../common'
import {
  DMS_PREFIX,
  GET_MATCH_MODEL_SELECT,
  GET_SCENE_SELECT,
  GET_CONDITION_TYPE_SELECT,
  GET_CONDITION_ALL_SELECT,
  GET_VERIFICATION_ALL_SELECT,
  CLEAR_ERROR_MESSAGE_SUCCESS,
  GET_ALL_OPERATORS,
  DictConfig
} from '../common/constant'

export function getMatchModeSelect() {
  return {
    type: GET_MATCH_MODEL_SELECT,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/common/matchModeList.do`)
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

export function getConditionTypeList() {
  return {
    type: GET_CONDITION_TYPE_SELECT,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/common/conditionTypeList.do`)
    }
  }
}

export function getConditionAllList() {
  let promises = []
  for (let k in DictConfig) {
    const { url = '', dataType = '', dictType = '' } = DictConfig[k]
    promises.push(jFetch.post(url, { data: { dataType, dictType } }))
  }
  return {
    type: GET_CONDITION_ALL_SELECT,
    payload: {
      promise: Promise.all(promises)
    }
  }
}

export function getVerificationAllList() {
  let promises = [jFetch.post(`/${DMS_PREFIX}/common/verifyObjectTypeList.do`),
    jFetch.post(`/${DMS_PREFIX}/common/operationTypeList.do`), jFetch.post(`/${DMS_PREFIX}/common/verifyObjectStatusList.do`)]
  return {
    type: GET_VERIFICATION_ALL_SELECT,
    payload: {
      promise: Promise.all(promises)
    }
  }
}

export function clearErrorMessage() {
  return {
    type: CLEAR_ERROR_MESSAGE_SUCCESS
  }
}

export function getAllOperators() {
  return cFetch.get(`/${DMS_PREFIX}/common/all-operators`)
}

export function getOperators() {
  return {
    type: GET_ALL_OPERATORS,
    payload: {
      promise: cFetch.get(`/${DMS_PREFIX}/common/all-operators`)
    }
  }
}

export function getBusinessLines() {
  return cFetch.get(`/${DMS_PREFIX}/business-line/list`)
}

export function getBusinessLinesNoNormal() {
  return cFetch.get(`/${DMS_PREFIX}/business-line/list/sub`)
}

export function getBlackListTypeList() {
  return cFetch.get(`/${DMS_PREFIX}/common/blacklistType.do`)
}

export function getBlackListSourceList() {
  return cFetch.get(`/${DMS_PREFIX}/common/blacklistSource.do`)
}

export function getEffectiveTermList() {
  return cFetch.get(`/${DMS_PREFIX}/common/effectiveTerm.do`)
}

export function getMaxDateInterval() {
  return cFetch.get(`/${DMS_PREFIX}/common/max/date/interval`)
}
