import { cFetch } from '../common'
import {
  DMS_PREFIX
} from '../common/constant'
import { buildUrlParamNew } from '../util'

export function getScorecardList(query) {
  return cFetch.get(`/${DMS_PREFIX}/scorecard/list?${query}`)
}

export function addScorecardInfo(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/add`, { data })
}

export function delScorecard(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/delete`, { data })
}

export function copyScorecard(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/copy`, { data })
}

export function activeScorecard(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/active`, { data })
}

export function updateScorecardBasic(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/update`, { data })
}

export function getFieldList() {
  return cFetch.post(`/${DMS_PREFIX}/rule/field/getFieldList.do`)
}

export function onOffLine(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/onOffLine`, { data })
}

export function getCharacterList(str) {
  return cFetch.get(`/${DMS_PREFIX}/common/getOperatorComparison.do?dataType=${str}`)
}

export function getCalculationTypeList() {
  return cFetch.get(`/${DMS_PREFIX}/common/calculationTypeList.do`)
}

export function fieldCheck(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/field/check`, {data})
}

export function updateScorecardCharacter(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/character/update`, { data })
}

export function addScorecardCharacter(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/character/add`, { data })
}

export function getCharactersList(scoreCardId) {
  return cFetch.get(`/${DMS_PREFIX}/scorecard/characters?scoreCardId=${scoreCardId}`)
}

export function updateRangeScore(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/range/score`, { data })
}

export function delCharacter(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/character/delete`, { data })
}

export function validationFormula(data) {
  return cFetch.post(`/${DMS_PREFIX}/scorecard/formula/validation`, { data })
}

export function getFieldsAndFactors(data) {
  return cFetch.get(`/${DMS_PREFIX}/scorecard/fields?${buildUrlParamNew(data)}`)
}
