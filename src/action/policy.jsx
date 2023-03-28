import { cFetch } from "../common";
import { DMS_PREFIX } from "../common/constant";
import { buildUrlParamOnlyCheckNullOrUnder } from "../util";

export function getTemplateList() {
  return cFetch.get(`${DMS_PREFIX}/common/factorTemplateList.do`);
}

export function valueExtractTypeList() {
  return cFetch.get(`${DMS_PREFIX}/common/valueExtractTypeList.do`);
}

export function statisticTypeList(factorTemplate) {
  return cFetch.get(
    `${DMS_PREFIX}/common/factor-function-list?factorTemplate=${factorTemplate}`
  );
}

export function unitList() {
  return cFetch.post(`${DMS_PREFIX}/common/unitList.do`);
}

export function operCharacterList() {
  return cFetch.post(`${DMS_PREFIX}/common/operCharacterList.do`);
}

export function getIndicatorsList(data) {
  return cFetch.get(`${DMS_PREFIX}/factor/list?${data}`);
}

export function saveIndicatorsEditOrAdd(data) {
  return cFetch.post(`${DMS_PREFIX}/factor/add`, { data });
}

export function saveIndicatorsUpdate(data) {
  return cFetch.post(`${DMS_PREFIX}/factor/update`, { data });
}

export function deleteIndicators(data) {
  return cFetch.post(`${DMS_PREFIX}/factor/delete`, { data });
}

export function getMaxTermTips() {
  return cFetch.get(`${DMS_PREFIX}/factor/getMaxTermTips`);
}

// 列表对象
export function getListObj(data) {
  return cFetch.get(
    `${DMS_PREFIX}/field/list?fieldCategory=FIELD&fieldType=STRING&${data}`
  );
}

// 列表方式
export function getListTypeList(data) {
  return cFetch.get(`${DMS_PREFIX}/common/listTypeList.do`);
}

// 求和字段
export function getSumFields(data) {
  return cFetch.get(
    `${DMS_PREFIX}/field/list?fieldCategory=FIELD&fieldType=DECIMAL&${data}`
  );
}

// getFieldList
export function getFieldList(data) {
  return cFetch.get(`${DMS_PREFIX}/field/list?fieldCategory=FIELD`);
}

export function getDimensionList(name = "") {
  return cFetch.get(`${DMS_PREFIX}/dimensionality/list?name=${name}`);
}

export function createDimension(data) {
  return cFetch.post(`${DMS_PREFIX}/dimensionality/create`, {
    data
  });
}

export function getDimensionFieldList(id) {
  return cFetch.get(`${DMS_PREFIX}/dimensionality/field/list?id=${id}`);
}

export function getDimensionDependencies(id) {
  return cFetch.get(`${DMS_PREFIX}/dimensionality/dependencies?id=${id}`);
}

export function updateDimension(data) {
  return cFetch.post(`${DMS_PREFIX}/dimensionality/update`, {
    data
  });
}

export function deleteDimension(data) {
  return cFetch.post(`${DMS_PREFIX}/dimensionality/delete`, {
    data
  });
}

export function getUsedFields(id) {
  return cFetch.get(`${DMS_PREFIX}/factor/getUsedFields?${id}`);
}

export function saveFactorValidation(data) {
  return cFetch.post(`${DMS_PREFIX}/factor/validation`, { data });
}

export function updateValidation(id) {
  return cFetch.get(`${DMS_PREFIX}/factor/dependencies?id=${id}`);
}

// 指标激活
export function factorUpdateStatus(data) {
  return cFetch.post(`${DMS_PREFIX}/factor/update-status`, { data });
}

export function dependenciesFactor(data) {
  return cFetch.get(`${DMS_PREFIX}/factor/dependencies?${data}`);
}

// 决策结果获取列表
export function getStrategyParameterList() {
  return cFetch.get(`${DMS_PREFIX}/decision/list`);
}

// 决策结果获取风险等级列表
export function getRiskGradeList() {
  return cFetch.get(`${DMS_PREFIX}/decision/risk-grade`);
}

// 决策结果获取风险等级列表
export function updateStrategyParameter(data) {
  return cFetch.post(`${DMS_PREFIX}/decision/update`, { data });
}

export function getResourceServiceList(data) {
  return cFetch.get(`${DMS_PREFIX}/data-service/list?${data}`);
}

export function deleteResourceService(data) {
  return cFetch.post(`${DMS_PREFIX}/data-service/delete`, { data });
}

export function activeResourceService(data) {
  return cFetch.post(`${DMS_PREFIX}/data-service/active`, { data });
}

export function testResourceService(data) {
  return cFetch.post(`${DMS_PREFIX}/data-service/test`, { data });
}

export function getResourceServiceDependencies(id) {
  return cFetch.get(`${DMS_PREFIX}/data-service/dependencies?id=${id}`);
}

export function getServiceTypeSelect() {
  return cFetch.get(`${DMS_PREFIX}/common/data-service-type`);
}

export function getServiceResDataTypeSelect() {
  return cFetch.get(`${DMS_PREFIX}/data-service/data-type`);
}

export function createServiceParam(data) {
  return cFetch.post(`${DMS_PREFIX}/data-service/add`, { data });
}

export function updateServiceParam(data) {
  return cFetch.post(`${DMS_PREFIX}/data-service/update`, { data });
}

export function getServiceCategoryList() {
  return cFetch.get(`${DMS_PREFIX}/data-service/category-list`);
}

export function getParamsWarningUsers() {
  return cFetch.get(`${DMS_PREFIX}/warning/notify/get-user-list`);
}

export function getParamsWarningConfig() {
  return cFetch.get(`${DMS_PREFIX}/warning/notify/get-config`);
}

export function updateParamsWarningConfig(data) {
  return cFetch.post(`${DMS_PREFIX}/warning/notify/update-config`, {
    data
  });
}

export function getDataCallbackList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/data-service/record/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}
