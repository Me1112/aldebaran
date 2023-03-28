import { cFetch } from "@common";
import { DMS_PREFIX } from "@common/constant";
import { buildUrlParamOnlyCheckNullOrUnder } from "@util";

export function fetchBasicFieldList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/field/list/paginated?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addField(data) {
  uploadProjectName();
  return {
    promise: cFetch.post(`${DMS_PREFIX}/leakage/basic/field/create`, { data })
  };
}

export function updateField(data) {
  return {
    promise: cFetch.post(`/${DMS_PREFIX}/leakage/basic/field/update`, { data })
  };
}

export function updateFieldActive(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/basic/field/active`, { data });
}

export function fieldDependencies(data) {
  return cFetch.get(`/${DMS_PREFIX}/leakage/basic/field/dependencies?${data}`);
}

export function fetchFields4List() {
  return cFetch.get(`/${DMS_PREFIX}/leakage/basic/field/findActiveField`);
}

export function fetchFactorTemplateList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/field/tmp/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchActiveFieldNotTypeField(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/field/activeFieldNotTypeField?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchActiveFieldListByIdAndType(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/field/findFieldListByIdAndType?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function delField(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/field/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addFieldEnum(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/basic/field/add-enum`, { data });
}

export function addFieldList(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/basic/field/add-list`, { data });
}

export function addTemplate(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/field/tmp/add`, { data });
}

export function updateTemplate(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/field/tmp/update`, { data });
}

export function updateTemplateName(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/field/tmp/edit-name`, { data });
}

export function updateTemplateActive(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/field/tmp/active`, { data });
}

export function templateDependencies(data) {
  return cFetch.get(`/${DMS_PREFIX}/leakage/field/tmp/dependencies?${data}`);
}

export function delTemplate(data) {
  return cFetch.get(
    `/${DMS_PREFIX}/leakage/field/tmp/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchLogicExpression(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/field/tmp/logic-expression`, {
    data
  });
}

export function fetchTemplateInfo(id) {
  return cFetch.get(`/${DMS_PREFIX}/leakage/field/tmp/${id}`);
}

export function fetchListFieldAndStatisticalField(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/field/findListFieldAndStatisticalField?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchBasicInfoList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/information/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchActiveFieldByType(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/field/findActiveFieldByType?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addBasicInfo(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/basic/information/add`, { data });
}

export function delBasicInfo(data) {
  return cFetch.get(
    `/${DMS_PREFIX}/leakage/basic/information/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function updateBasicInfo(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/basic/information/update`, {
    data
  });
}

export function fetchAllEnumInfo() {
  return cFetch.get(`${DMS_PREFIX}/leakage/field/tmp/get-all-enum-chinese`);
}

export function fetchRiskKindList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/risktype/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchRiskMainCategoryList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/risktype/findRiskMainCategory?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addRiskKind(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/basic/risktype/add`, { data });
}

export function updateRiskKind(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/basic/risktype/update`, { data });
}

export function delRiskKind(data) {
  return cFetch.get(
    `/${DMS_PREFIX}/leakage/basic/risktype/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function riskKindDependencies(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/basic/risktype/dependence`, {
    data
  });
}

export function updateRiskKindActive(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/basic/risktype/active`, { data });
}

export function fetchCompanyList() {
  return cFetch.get(`${DMS_PREFIX}/leakage/rule/findAllCompany`);
}

export function fetchActiveRiskTypes(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/basic/risktype/findActiveRiskType?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchRuleList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/rule/list?${buildUrlParamOnlyCheckNullOrUnder(data)}`
  );
}

export function addRule(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/rule/add`, { data });
}

export function copyRule(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/rule/copy`, { data });
}

export function logCopyRule(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/rule/copy/log`, { data });
}

export function updateRule(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/rule/update`, { data });
}

export function delRule(data) {
  return cFetch.get(
    `/${DMS_PREFIX}/leakage/rule/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function confirmRule(data) {
  return cFetch.get(
    `/${DMS_PREFIX}/leakage/rule/confirm?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchRuleInfo(id) {
  return cFetch.get(`/${DMS_PREFIX}/leakage/rule/${id}`);
}

export function fetchRuleHistory(data = {}) {
  return cFetch.get(
    `/${DMS_PREFIX}/leakage/rule/getRuleHistory?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function updateRuleActive(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/rule/active`, { data });
}

export function fetchCompanies(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/company/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addCompany(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/company/add`, { data });
}

export function updateCompany(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/company/update`, { data });
}

export function delCompany(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/company/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchMonitorList(data = {}) {
  return cFetch.post(`${DMS_PREFIX}/leakage/executeMonitor/list`, { data });
}

export function fetchLicensePlateByCompanyCodeAndCaseNo(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/executeMonitor/getLicensePlateByCompanyCodeAndCaseNo?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchExecTimeByDomainTypeAndCompanyCodeAndCaseNoAndLicensePlate(
  data = {}
) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/executeMonitor/getExecTimeByDomainTypeAndCompanyCodeAndCaseNoAndLicensePlate?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchExecuteMonitorDetail(data = {}) {
  return cFetch.post(`${DMS_PREFIX}/leakage/executeMonitor/getDetail`, {
    data
  });
}

export function fetchProjectNames(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/projectName/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addProjectName(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/projectName/add`, { data });
}

export function delProjectName(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/projectName/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function uploadProjectName(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/projectName/upload`, {
    data
  });
}

export function fetchProjectNameMappings(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/projectNameMapping/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addProjectNameMapping(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/projectNameMapping/add`, { data });
}

export function updateProjectNameMapping(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/projectNameMapping/update`, {
    data
  });
}

export function delProjectNameMapping(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/projectNameMapping/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function uploadProjectNameMapping(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/projectNameMapping/upload`, {
    data
  });
}

export function fetchProjectNameList() {
  return cFetch.get(`${DMS_PREFIX}/leakage/projectName/findAll`);
}

export function fetchFieldMappings(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/fieldMapping/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addFieldMapping(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/fieldMapping/add`, { data });
}

export function updateFieldMapping(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/fieldMapping/update`, { data });
}

export function delFieldMapping(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/fieldMapping/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function uploadFieldMapping(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/fieldMapping/upload`, {
    data
  });
}

export function fetchAllActiveFields() {
  return cFetch.get(`${DMS_PREFIX}/leakage/basic/field/findAllActiveField`);
}

export function checkProjectNames(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/rule/checkProjectName?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchEnumMappings(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/enumMapping/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addEnumMapping(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/enumMapping/add`, { data });
}

export function updateEnumMapping(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/enumMapping/update`, { data });
}

export function delEnumMapping(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/enumMapping/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchNoMappingEnumFields(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/enumMapping/findNoMappingEnumField?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchDeterminationStatistics(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/determination/statistics?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchIndicatorMonitorStatistics(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/statisticsTotal?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchIndicatorMonitorRuleIndicatorList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/ruleIndicatorList?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchIndicatorMonitorRuleDerogationTotal() {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/ruleDerogationTotal`
  );
}

export function fetchIndicatorMonitorNumberDetectionTotal() {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/numberDetectionTotal`
  );
}

export function fetchIndicatorMonitorNumberOfTriggerTotal() {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/numberOfTriggerTotal`
  );
}

export function fetchIndicatorMonitorAmountOfDetectionTotal() {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/amountOfDetectionTotal`
  );
}

export function fetchIndicatorMonitorAmountOfTriggerTotal() {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/amountOfTriggerTotal`
  );
}

export function fetchIndicatorMonitorCompanyOverview(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/getCompanyOverview?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchIndicatorMonitorIndicatorOverview(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/getIndicatorOverview?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchIndicatorMonitorYearsFromSql(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/getYearsFromSql?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchIndicatorMonitorRuleDerogationTotal4Company() {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/ruleDerogationByCompany`
  );
}

export function fetchIndicatorMonitorIndicatorOverview4Company(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/indicatorMonitor/getCompanyIndicatorOverview?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function runOnlineTesting(data = {}) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/online/analysis/run`, {
    data
  });
}

export function stopOnlineTesting(data = {}) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/online/analysis/stop`, {
    data
  });
}

export function fetchOnlineTestings(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/online/analysis/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchRulesByKeyword(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/rule/getLatelyRuleByKeyword?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchTemplateDependencies(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/field/tmp/multi-dependencies`, {
    data
  });
}

export function batchActiveTemplates(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/field/tmp/batch-active`, { data });
}

export function batchInactiveTemplates(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/field/tmp/batch-inactive`, {
    data
  });
}

export function fetchCarModels(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/carLibrary/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function uploadCarModels(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/carLibrary/upload`, {
    data
  });
}

export function fetchManufacturers(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/carLibrary/getManufacturer?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchCarSeries(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/carLibrary/getCarSeries?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function addCarModel(data) {
  return cFetch.post(`${DMS_PREFIX}/leakage/carLibrary/add`, { data });
}

export function delCarModel(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/carLibrary/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchPartsList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/partsLibrary/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchFirstTypeList() {
  return cFetch.get(`${DMS_PREFIX}/leakage/partsLibrary/firstTypeList`);
}

export function fetchSecondTypeList() {
  return cFetch.get(`${DMS_PREFIX}/leakage/partsLibrary/secondTypeList`);
}

export function addParts(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/partsLibrary/add`, { data });
}

export function delParts(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/partsLibrary/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function uploadParts(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/partsLibrary/upload`, {
    data
  });
}

export function fetchRuleLog(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/rule/online/log?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function reduceRule(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/rule/reductionRule?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function fetchAllRules(data) {
  return cFetch.post(`/${DMS_PREFIX}/leakage/rule/batchConfigurationList`, {
    data
  });
}

export function fetchRules4Company(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/rule/targetCompanyRule?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}

export function batchOnlineToCompany(data = {}) {
  return cFetch.post(`${DMS_PREFIX}/leakage/rule/batchOnlineToCompany`, {
    timeout: 1800000,
    data
  });
}
export function downloadFiledFile(data = {}) {
  return window.location.replace(
    `${DMS_PREFIX}/leakage/file/download?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}
export function exportFiledFile(data = {}) {
  return window.location.replace(
    `${DMS_PREFIX}/leakage/basic/field/export?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}
export function importFiledFile(data = {}) {
  return cFetch.post(`${DMS_PREFIX}/leakage/basic/field/import`, {
    data
  });
}
export function onDownLoadTemplate() {
  return window.location.replace(
    `${DMS_PREFIX}/leakage/basic/field/downloadTemplate`
  );
}
// 专属规则配置列表---获取
export function fetchCompanyRuleList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/customRule/list?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}
// 专属规则配置列表---删除
export function delCompanyRuleList(data = {}) {
  return cFetch.get(
    `${DMS_PREFIX}/leakage/customRule/delete?${buildUrlParamOnlyCheckNullOrUnder(
      data
    )}`
  );
}
// 专属规则配置列表---新增
export function saveOrUpdateCompanyRule(data = {}) {
  return cFetch.post(`${DMS_PREFIX}/leakage/customRule/saveOrUpdate`, {
    data
  });
}
// 专属规则配置列表---编辑
export function editCompanyRule(data = {}) {
  return cFetch.post(`${DMS_PREFIX}/leakage/customRule/update`, {
    data
  });
}
// 专属规则配置列表---上、下线
export function onLineCompanyRule(data = {}) {
  return cFetch.post(`${DMS_PREFIX}/leakage/customRule/updateActiveStatus`, {
    data
  });
}
// 专属规则配置列表---查询详情
export function fetchCompanyRuleDetail(data) {
  return cFetch.get(`${DMS_PREFIX}/leakage/customRule/${data}`);
}
export function templateRuleDependencies(data) {
  return cFetch.get(`/${DMS_PREFIX}/leakage/rule/dependencies?${data}`);
}
