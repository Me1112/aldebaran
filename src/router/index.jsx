import React from "react";
import { Route } from "react-router-dom";
import Loadable from "react-loadable";
import { LazyLoading, getUserMenu } from "../util/index";

const asyncRuleCollection = Loadable({
  loader: () =>
    import(
      "../view/rules/collection" /* webpackChunkName: 'rule-collection' */
    ),
  loading: LazyLoading
});

const asyncNewRuleCollection = Loadable({
  loader: () =>
    import(
      "../view/rules/collection/new" /* webpackChunkName: 'new-rule-collection' */
    ),
  loading: LazyLoading
});

const asyncRuleCondition = Loadable({
  loader: () =>
    import(
      "../view/policy/rules/condition" /* webpackChunkName: 'rule-condition' */
    ),
  // loader: () => import('../view/rules/condition'/* webpackChunkName: 'rule-condition' */),
  loading: LazyLoading
});

const asyncRuleCollectionVersion = Loadable({
  loader: () =>
    import(
      "../view/rules/collection/version" /* webpackChunkName: 'rule-collection-version' */
    ),
  loading: LazyLoading
});

const asyncRuleField = Loadable({
  loader: () =>
    import("../view/rules/field" /* webpackChunkName: 'rule-field' */),
  loading: LazyLoading
});

const asyncRuleList = Loadable({
  loader: () =>
    import("../view/rules/list" /* webpackChunkName: 'rule-list' */),
  loading: LazyLoading
});

const asyncRuleScene = Loadable({
  loader: () =>
    import("../view/rules/scene" /* webpackChunkName: 'rule-scene' */),
  loading: LazyLoading
});

const asyncRuleVerification = Loadable({
  loader: () =>
    import(
      "../view/rules/verification" /* webpackChunkName: 'rule-verification' */
    ),
  loading: LazyLoading
});

const asyncWarning = Loadable({
  loader: () =>
    import("../view/case/warning" /* webpackChunkName: 'task-warning' */),
  loading: LazyLoading
});

const asyncBlackList = Loadable({
  loader: () =>
    import("../view/black/list" /* webpackChunkName: 'black-list' */),
  loading: LazyLoading
});

const asyncEventList = Loadable({
  loader: () =>
    import("../view/event/list" /* webpackChunkName: 'event-list' */),
  loading: LazyLoading
});

const asyncEventPersonalList = Loadable({
  loader: () =>
    import("../view/event/personal" /* webpackChunkName: 'event-personal' */),
  loading: LazyLoading
});

const asyncEventOfflineList = Loadable({
  loader: () =>
    import("../view/event/offline" /* webpackChunkName: 'event-offline' */),
  loading: LazyLoading
});

const asyncSystemDepartmentList = Loadable({
  loader: () =>
    import(
      "../view/system/department" /* webpackChunkName: 'system-department' */
    ),
  loading: LazyLoading
});

const asyncSystemAccessList = Loadable({
  loader: () =>
    import("../view/system/access" /* webpackChunkName: 'system-access' */),
  loading: LazyLoading
});

const asyncSystemOperationList = Loadable({
  loader: () =>
    import(
      "../view/system/operation" /* webpackChunkName: 'system-operation' */
    ),
  loading: LazyLoading
});

const asyncSystemIncomingList = Loadable({
  loader: () =>
    import("../view/system/incoming" /* webpackChunkName: 'system-incoming' */),
  loading: LazyLoading
});

const asyncSystemModuleList = Loadable({
  loader: () =>
    import("../view/system/module" /* webpackChunkName: 'system-module' */),
  loading: LazyLoading
});

const asyncSystemUserList = Loadable({
  loader: () =>
    import("../view/system/user" /* webpackChunkName: 'system-user' */),
  loading: LazyLoading
});

const asyncSystemRoleList = Loadable({
  loader: () =>
    import("../view/system/role" /* webpackChunkName: 'system-role' */),
  loading: LazyLoading
});

const asyncSystemJob = Loadable({
  loader: () =>
    import("../view/system/job" /* webpackChunkName: 'system-job' */),
  loading: LazyLoading
});

const asyncEventMarket = Loadable({
  loader: () =>
    import("../view/event/market" /* webpackChunkName: 'event-market' */),
  loading: LazyLoading
});

const asyncEventInspect = Loadable({
  loader: () =>
    import("../view/event/inspect" /* webpackChunkName: 'event-inspect' */),
  loading: LazyLoading
});

const asyncReportEventTrend = Loadable({
  loader: () =>
    import(
      "../view/report/event_trend" /* webpackChunkName: 'report-event-trend' */
    ),
  loading: LazyLoading
});
const asyncReportAppDistribution = Loadable({
  loader: () =>
    import(
      "../view/report/app_distribution" /* webpackChunkName: 'report-app-distribution' */
    ),
  loading: LazyLoading
});
const asyncRiskPeriod = Loadable({
  loader: () =>
    import(
      "../view/report/risk_period" /* webpackChunkName: 'report-risk-period' */
    ),
  loading: LazyLoading
});
const asyncReportArea = Loadable({
  loader: () =>
    import("../view/report/area" /* webpackChunkName: 'report-area' */),
  loading: LazyLoading
});
const asyncReportAudit = Loadable({
  loader: () =>
    import("../view/report/audit" /* webpackChunkName: 'report-audit' */),
  loading: LazyLoading
});
const asyncStrategyEffect = Loadable({
  loader: () =>
    import(
      "../view/report/strategy_effect" /* webpackChunkName: 'report-strategy-effect' */
    ),
  loading: LazyLoading
});
const asyncDecisionIndicators = Loadable({
  // loader: () => import('../view/decision/indicators'/* webpackChunkName: 'decision-indicators' */),
  loader: () =>
    import(
      "../view/policy/indicators" /* webpackChunkName: 'decision-indicators' */
    ),
  loading: LazyLoading
});
const asyncDecisionStrategy = Loadable({
  loader: () =>
    import(
      "../view/decision/strategy" /* webpackChunkName: 'decision-strategy' */
    ),
  loading: LazyLoading
});
const asyncDecisionNewStrategy = Loadable({
  loader: () =>
    import(
      "../view/decision/strategy/new" /* webpackChunkName: 'decision-strategy-new' */
    ),
  loading: LazyLoading
});
const asyncRulesDiffs = Loadable({
  loader: () =>
    import(
      "../view/rules/collection/diff" /* webpackChunkName: 'rules-diff' */
    ),
  loading: LazyLoading
});
const asyncScorecardList = Loadable({
  loader: () => import("../view/scorecard" /* webpackChunkName: 'scorecard' */),
  loading: LazyLoading
});
const asyncScorecardNew = Loadable({
  loader: () =>
    import("../view/scorecard/new" /* webpackChunkName: 'scorecard-new' */),
  loading: LazyLoading
});
const asyncInspectAudit = Loadable({
  loader: () =>
    import(
      "../view/event/inspect/audit" /* webpackChunkName: 'inspect-audit' */
    ),
  loading: LazyLoading
});
const asyncExternalAccess = Loadable({
  loader: () =>
    import(
      "../view/policy/external_access" /* webpackChunkName: 'external-access' */
    ),
  loading: LazyLoading
});
const asyncNewExternalAccess = Loadable({
  loader: () =>
    import(
      "../view/policy/external_access/new" /* webpackChunkName: 'new-external-access' */
    ),
  loading: LazyLoading
});
const asyncTestingData = Loadable({
  loader: () =>
    import(
      "../view/policy/external_access/testing" /* webpackChunkName: 'testing-data' */
    ),
  loading: LazyLoading
});

const asyncOnlineTest = Loadable({
  loader: () =>
    import(
      "../view/policy/external_access/online_test" /* webpackChunkName: 'testing-data' */
    ),
  loading: LazyLoading
});
const asyncDecisionStrategyFlow = Loadable({
  loader: () =>
    import(
      "../view/decision/strategy_flow" /* webpackChunkName: 'decision-strategy-flow' */
    ),
  loading: LazyLoading
});
const asyncNewDecisionStrategyFlow = Loadable({
  loader: () =>
    import(
      "../view/decision/strategy_flow/new" /* webpackChunkName: 'decision-strategy-flow-new' */
    ),
  loading: LazyLoading
});
const asyncParamsDimension = Loadable({
  loader: () =>
    import(
      "../view/policy/dimension" /* webpackChunkName: 'policy-dimension' */
    ),
  loading: LazyLoading
});
const asyncCaseRequest = Loadable({
  loader: () =>
    import("../view/case/request" /* webpackChunkName: 'case-request' */),
  loading: LazyLoading
});
const asyncCaseDetail = Loadable({
  loader: () =>
    import("../view/case/detail" /* webpackChunkName: 'case-detail' */),
  loading: LazyLoading
});
const asyncCaseProgress = Loadable({
  loader: () =>
    import("../view/case/progress" /* webpackChunkName: 'case-progress' */),
  loading: LazyLoading
});
const asyncCaseArchive = Loadable({
  loader: () =>
    import("../view/case/archive" /* webpackChunkName: 'case-archive' */),
  loading: LazyLoading
});
const asyncTaskAudit = Loadable({
  loader: () =>
    import("../view/case/audit" /* webpackChunkName: 'task-audit' */),
  loading: LazyLoading
});
const asyncStrategyParameter = Loadable({
  loader: () =>
    import(
      "../view/policy/strategy_parameter" /* webpackChunkName: 'strategy_parameter' */
    ),
  loading: LazyLoading
});
const asyncParamsWarning = Loadable({
  loader: () =>
    import("../view/policy/warning" /* webpackChunkName: 'params_warning' */),
  loading: LazyLoading
});
const asyncResourceService = Loadable({
  loader: () =>
    import(
      "../view/policy/resource/service" /* webpackChunkName: 'resource-service' */
    ),
  loading: LazyLoading
});

const asyncDataCallback = Loadable({
  loader: () =>
    import("../view/data/list" /* webpackChunkName: 'data-callback' */),
  loading: LazyLoading
});

const asyncVerificationTask = Loadable({
  loader: () =>
    import(
      "../view/policy/verification/task" /* webpackChunkName: 'verification-task' */
    ),
  loading: LazyLoading
});

const asyncVerificationTaskResult = Loadable({
  loader: () =>
    import(
      "../view/policy/verification/task/result" /* webpackChunkName: 'verification-task-result' */
    ),
  loading: LazyLoading
});

const asyncVerificationOffline = Loadable({
  loader: () =>
    import(
      "../view/policy/verification/offline" /* webpackChunkName: 'verification-offline' */
    ),
  loading: LazyLoading
});

const asyncVerificationOfflineNew = Loadable({
  loader: () =>
    import(
      "../view/policy/verification/offline/new" /* webpackChunkName: 'verification-offline-new' */
    ),
  loading: LazyLoading
});

const asyncDataReport = Loadable({
  loader: () =>
    import("../view/data/report" /* webpackChunkName: 'data-report' */),
  loading: LazyLoading
});

const asyncBasicField = Loadable({
  loader: () =>
    import("../view/leakages/field" /* webpackChunkName: 'leakage-field' */),
  loading: LazyLoading
});

const asyncFactorTemplate = Loadable({
  loader: () =>
    import(
      "../view/leakages/factor-template" /* webpackChunkName: 'leakage-factor-template' */
    ),
  loading: LazyLoading
});

const asyncBasicInfo = Loadable({
  loader: () =>
    import(
      "../view/leakages/basic-info" /* webpackChunkName: 'leakage-basic-info' */
    ),
  loading: LazyLoading
});

const asyncRiskKind = Loadable({
  loader: () =>
    import(
      "../view/leakages/risk-kind" /* webpackChunkName: 'leakage-risk-kind' */
    ),
  loading: LazyLoading
});

const asyncRule = Loadable({
  loader: () =>
    import("../view/leakages/rule" /* webpackChunkName: 'leakage-rule' */),
  loading: LazyLoading
});

const asyncRuleAdd = Loadable({
  loader: () =>
    import(
      "../view/leakages/rule/new" /* webpackChunkName: 'leakage-rule-add' */
    ),
  loading: LazyLoading
});

const asyncCompany = Loadable({
  loader: () =>
    import(
      "../view/leakages/company" /* webpackChunkName: 'leakage-company' */
    ),
  loading: LazyLoading
});
const asyncCompanyRules = Loadable({
  loader: () =>
    import(
      "../view/leakages/customer-rule" /* webpackChunkName: 'leakage-company' */
    ),
  loading: LazyLoading
});
const asyncNewCustomerRules = Loadable({
  loader: () =>
    import(
      "../view/leakages/customer-rule/new-customer-rule" /* webpackChunkName: 'leakage-company' */
    ),
  loading: LazyLoading
});
const asyncMonitor = Loadable({
  loader: () =>
    import(
      "../view/leakages/monitor" /* webpackChunkName: 'leakage-monitor' */
    ),
  loading: LazyLoading
});

const asyncMonitorDetail = Loadable({
  loader: () =>
    import(
      "../view/leakages/monitor/detail" /* webpackChunkName: 'leakage-monitor-detail' */
    ),
  loading: LazyLoading
});

const asyncField = Loadable({
  loader: () =>
    import(
      "../view/leakages/mapping/field" /* webpackChunkName: 'leakage-mapping-field' */
    ),
  loading: LazyLoading
});

const asyncProject = Loadable({
  loader: () =>
    import(
      "../view/leakages/mapping/project" /* webpackChunkName: 'leakage-mapping-project' */
    ),
  loading: LazyLoading
});

const asyncManagement = Loadable({
  loader: () =>
    import(
      "../view/leakages/mapping/management" /* webpackChunkName: 'leakage-mapping-management' */
    ),
  loading: LazyLoading
});

const asyncEnumeration = Loadable({
  loader: () =>
    import(
      "../view/leakages/mapping/enumeration" /* webpackChunkName: 'leakage-mapping-enumeration' */
    ),
  loading: LazyLoading
});

const asyncLossAssessment = Loadable({
  loader: () =>
    import(
      "../view/leakages/case/loss-assessment" /* webpackChunkName: 'leakage-case-loss-assessment' */
    ),
  loading: LazyLoading
});

const asyncIndicatorOverview = Loadable({
  loader: () =>
    import(
      "../view/leakages/indicator/overview" /* webpackChunkName: 'leakage-indicator-overview' */
    ),
  loading: LazyLoading
});

const asyncIndicatorRule = Loadable({
  loader: () =>
    import(
      "../view/leakages/indicator/rule" /* webpackChunkName: 'leakage-indicator-rule' */
    ),
  loading: LazyLoading
});

const asyncIndicatorCompany = Loadable({
  loader: () =>
    import(
      "../view/leakages/indicator/company" /* webpackChunkName: 'leakage-indicator-company' */
    ),
  loading: LazyLoading
});

const asyncTesting = Loadable({
  loader: () =>
    import(
      "../view/leakages/testing" /* webpackChunkName: 'leakage-testing' */
    ),
  loading: LazyLoading
});
const asyncLog = Loadable({
  loader: () =>
    import(
      "../view/sync-log/index" /* webpackChunkName: 'leakage-testing' */
    ),
  loading: LazyLoading
});
const asyncCarModelLibrary = Loadable({
  loader: () =>
    import(
      "../view/leakages/car" /* webpackChunkName: 'leakage-car-model-library' */
    ),
  loading: LazyLoading
});

const asyncPartsLibrary = Loadable({
  loader: () =>
    import(
      "../view/leakages/basis/parts" /* webpackChunkName: 'leakage-parts-library' */
    ),
  loading: LazyLoading
});

const asyncAntiFraudOverview = Loadable({
  loader: () =>
    import(
      "../view/leakages/indicator/anti-fraud/overview" /* webpackChunkName: 'leakage-indicator-anti-fraud-overview' */
    ),
  loading: LazyLoading
});

const asyncAntiFraudCaseDetail = Loadable({
  loader: () =>
    import(
      "../view/leakages/indicator/anti-fraud/case" /* webpackChunkName: 'leakage-indicator-anti-fraud-case' */
    ),
  loading: LazyLoading
});

// export const routeList = [
//   <Route path="/policy/joinup/config" key="/policy/joinup/config" exact component={asyncExternalAccess} />,
//   <Route path="/policy/joinup/config/new" key="/policy/joinup/config/new" exact component={asyncNewExternalAccess} />,
//   <Route path="/policy/joinup/testing" key="/policy/joinup/testing" exact component={asyncTestingData} />,
//   <Route path="/policy/joinup/testing/detail" key="/policy/joinup/testing/detail" exact
//          component={asyncInspectAudit} />,
//   <Route path="/policy/joinup/config/online-test" key="/policy/joinup/online-test" exact component={asyncOnlineTest} />,
//
//   <Route path="/policy/bazaar/collection" key="/policy/bazaar/collection" exact component={asyncRuleCollection} />,
//   <Route path="/policy/bazaar/collection/diff" key="/policy/bazaar/collection/diff" exact
//          component={asyncRulesDiffs} />,
//   <Route path="/policy/bazaar/collection/new" key="/policy/bazaar/collection/new" exact
//          component={asyncNewRuleCollection} />,
//   <Route path="/policy/bazaar/collection/condition" key="/policy/bazaar/collection/condition" exact
//          component={asyncRuleCondition} />,
//   <Route path="/policy/bazaar/collection/config" key="/policy/bazaar/collection/config" exact
//          component={asyncRuleList} />,
//   <Route path="/risk/task/verification" key="/risk/task/verification" exact component={asyncRuleVerification} />,
//
//   <Route path="/policy/bazaar/list" key="/policy/bazaar/list" exact component={asyncScorecardList} />,
//   <Route path="/policy/bazaar/list/new" key="/policy/bazaar/list/new" exact component={asyncScorecardNew} />,
//
//   <Route path="/risk/event/black/list" key="/risk/event/black/list" exact component={asyncBlackList} />,
//   <Route path="/risk/event/list" key="/risk/event/list" exact component={asyncEventList} />,
//   <Route path="/risk/market/event-market" key="/risk/market/event-market" exact component={asyncEventMarket} />,
//   <Route path="/risk/task/inspect" key="/risk/task/inspect" exact component={asyncEventInspect} />,
//   <Route path="/event/personal" key="/event/personal" exact component={asyncEventPersonalList} />,
//   <Route path="/event/offline" key="/event/offline" exact component={asyncEventOfflineList} />,
//   <Route path="/system/department" key="/system/department" exact component={asyncSystemDepartmentList} />,
//   <Route path="/system/access" key="/system/access" exact component={asyncSystemAccessList} />,
//   <Route path="/system/operation" key="/system/operation" exact component={asyncSystemOperationList} />,
//   <Route path="/system/module" key="/system/module" exact component={asyncSystemModuleList} />,
//   <Route path="/system/user" key="/system/user" exact component={asyncSystemUserList} />,
//   <Route path="/system/role" key="/system/role" exact component={asyncSystemRoleList} />,
//   <Route path="/system/scene" key="/system/scene" exact component={asyncRuleScene} />,
//   <Route path="/policy/basis/field" key="/policy/basis/field" exact component={asyncRuleField} />,
//
//   <Route path="/risk/market/risk-trend" key="/risk/market/risk-trend" exact component={asyncReportRisk} />,
//   <Route path="/risk/market/rule" key="/risk/market/rule" exact component={asyncReportRule} />,
//   <Route path="/risk/market/area" key="/risk/market/area" exact component={asyncReportArea} />,
//   <Route path="/risk/market/audit" key="/risk/market/audit" exact component={asyncReportAudit} />,
//   <Route path="/risk/market/event-trend" key="/risk/market/event-trend" exact component={asyncReportEventTrend} />,
//   <Route path="/risk/market/app-distribution" key="/risk/market/app-distribution" exact
//          component={asyncReportAppDistribution} />,
//   <Route path="/policy/index/indicators" key="/policy/index/indicators" exact component={asyncDecisionIndicators} />,
//   <Route path="/policy/bazaar/strategy" key="/policy/bazaar/strategy" exact component={asyncDecisionStrategy} />,
//   <Route path="/policy/bazaar/strategy/new" key="/policy/bazaar/strategy/new" exact
//          component={asyncDecisionNewStrategy} />,
//   <Route path="/risk/task/inspect/detail" key="/risk/task/inspect/detail" exact component={asyncInspectAudit} />,
//   <Route path="/risk/event/list/detail" key="/risk/event/list/detail" exact component={asyncInspectAudit} />,
//   <Route path="/policy/joinup/config/test/detail" key="/policy/joinup/config/test/detail" exact
//          component={asyncInspectAudit} />,
//   <Route path="/policy/joinup/testing/detail" key="/policy/joinup/testing/detail" exact
//          component={asyncInspectAudit} />,
//   <Route path="/policy/bazaar/strategy-flow" key="/policy/bazaar/strategy-flow" exact
//          component={asyncDecisionStrategyFlow} />,
//   <Route path="/policy/bazaar/strategy-flow/new" key="/policy/bazaar/strategy-flow/new" exact
//          component={asyncNewDecisionStrategyFlow} />,
//   <Route path="/policy/params" key="/policy/params" exact component={asyncParamsDimension} />,
//   <Route path="/policy/params/strategy-parameter" key="/policy/basis/strategy-parameter" exact
//          component={asyncStrategyParameter} />,
//   <Route path="/risk/case/request" key="/risk/case/request" exact component={asyncCaseRequest} />,
//   <Route path="/risk/case/request/detail" key="/risk/case/request/detail" exact component={asyncCaseDetail} />,
//   <Route path="/risk/case/progress" key="/risk/case/progress" exact component={asyncCaseProgress} />,
//   <Route path="/risk/case/archive" key="/risk/case/archive" exact component={asyncCaseArchive} />,
//   <Route path="/risk/task/audit" key="/risk/task/audit" exact component={asyncTaskAudit} />,
//   <Route path="/risk/task/audit/detail" key="/risk/task/audit/detail" exact component={asyncCaseDetail} />,
//   <Route path="/risk/case/progress/detail" key="/risk/case/progress/detail" exact component={asyncCaseDetail} />,
//   <Route path="/risk/case/archive/detail" key="/risk/case/archive/detail" exact component={asyncCaseDetail} />,
//   <Route path="/risk/market/event-trend" key="/risk/market/event-trend" exact component={asyncReportEventTrend} />
// ]

let routeListMap = {
  "/policy/joinup/config": asyncExternalAccess,
  "/policy/joinup/config/new": asyncNewExternalAccess,
  "/policy/joinup/testing": asyncTestingData,
  "/policy/joinup/testing/detail": asyncInspectAudit,
  "/policy/joinup/config/online-test": asyncOnlineTest,
  "/policy/verification/task": asyncVerificationTask,
  "/policy/verification/offline": asyncVerificationOffline,
  "/policy/verification/offline/new": asyncVerificationOfflineNew,

  "/policy/bazaar/collection": asyncRuleCollection,
  "/policy/bazaar/collection/diff": asyncRulesDiffs,
  "/policy/bazaar/collection/new": asyncNewRuleCollection,
  "/policy/bazaar/collection/condition": asyncRuleCondition,
  "/policy/bazaar/collection/version": asyncRuleCollectionVersion,
  "/policy/bazaar/collection/config": asyncRuleList,
  "/risk/task/verification": asyncRuleVerification,
  "/risk/task/warning": asyncWarning,

  "/policy/bazaar/list": asyncScorecardList,
  "/policy/bazaar/list/new": asyncScorecardNew,

  "/risk/event/black/list": asyncBlackList,
  "/risk/event/list": asyncEventList,
  "/risk/market/event-market": asyncEventMarket,
  "/risk/task/inspect": asyncEventInspect,
  "/event/personal": asyncEventPersonalList,
  "/event/offline": asyncEventOfflineList,
  "/leakage/system/department": asyncSystemDepartmentList,
  "/system/access": asyncSystemAccessList,
  "/system/log/operation": asyncSystemOperationList,
  "/system/log/incoming": asyncSystemIncomingList,
  "/system/module": asyncSystemModuleList,
  "/leakage/system/user": asyncSystemUserList,
  "/leakage/system/role": asyncSystemRoleList,
  "/system/job": asyncSystemJob,
  "/system/scene": asyncRuleScene,
  "/policy/basis/field": asyncRuleField,

  "/risk/market/risk-period": asyncRiskPeriod,
  "/risk/market/area": asyncReportArea,
  "/risk/market/audit": asyncReportAudit,
  "/risk/market/strategy-effect": asyncStrategyEffect,
  "/risk/market/app-distribution": asyncReportAppDistribution,
  "/policy/index/indicators": asyncDecisionIndicators,
  "/policy/bazaar/strategy": asyncDecisionStrategy,
  "/policy/bazaar/strategy/new": asyncDecisionNewStrategy,
  "/risk/task/inspect/detail": asyncInspectAudit,
  "/risk/event/list/detail": asyncInspectAudit,
  "/policy/joinup/config/test/detail": asyncInspectAudit,
  "/policy/bazaar/strategy-flow": asyncDecisionStrategyFlow,
  "/policy/bazaar/strategy-flow/new": asyncNewDecisionStrategyFlow,
  "/policy/params": asyncParamsDimension,
  "/policy/params/strategy-parameter": asyncStrategyParameter,
  "/policy/params/warning": asyncParamsWarning,
  "/risk/case/request": asyncCaseRequest,
  "/risk/case/request/detail": asyncCaseDetail,
  "/risk/case/progress": asyncCaseProgress,
  "/risk/case/archive": asyncCaseArchive,
  "/risk/task/audit": asyncTaskAudit,
  "/risk/task/audit/detail": asyncCaseDetail,
  "/risk/case/progress/detail": asyncCaseDetail,
  "/risk/case/archive/detail": asyncCaseDetail,
  "/risk/market/event-trend": asyncReportEventTrend,
  "/policy/resource/service": asyncResourceService,
  "/risk/data/callback": asyncDataCallback,
  "/risk/data/report": asyncDataReport,
  "/leakage/basis/field": asyncBasicField,
  "/leakage/factor/template": asyncFactorTemplate,
  "/leakage/rule/management": asyncRule,
  "/leakage/basis/info": asyncBasicInfo,
  "/leakage/basis/car": asyncCarModelLibrary,
  "/leakage/basis/parts": asyncPartsLibrary,
  "/leakage/risk/kind": asyncRiskKind,
  "/leakage/company/management": asyncCompany,
  "/leakage/company/customrules": asyncCompanyRules,
  "/leakage/execution/monitoring": asyncMonitor,
  "/leakage/mapping/field": asyncField,
  "/leakage/mapping/project": asyncProject,
  "/leakage/mapping/management": asyncManagement,
  "/leakage/mapping/enumeration": asyncEnumeration,
  "/leakage/case/loss-assessment": asyncLossAssessment,
  "/leakage/indicator/overview": asyncIndicatorOverview,
  "/leakage/indicator/rule": asyncIndicatorRule,
  "/leakage/indicator/company": asyncIndicatorCompany,
  "/leakage/testing": asyncTesting,
  "/leakage/synclog": asyncLog,
  "/leakage/indicator/anti-fraud-overview": asyncAntiFraudOverview,
  "/leakage/indicator/anti-fraud-case-detail": asyncAntiFraudCaseDetail
};
let menuTree = [];
try {
  menuTree = getUserMenu() || [];
} catch (e) {
  window.location.href = "/login";
}
let list = [
  <Route
    path="/system/role"
    key="/system/role"
    exact
    component={asyncSystemRoleList}
  />,
  <Route
    path="/policy/joinup/config/new"
    key="/policy/joinup/config/new"
    exact
    component={asyncNewExternalAccess}
  />,
  <Route
    path="/policy/joinup/testing"
    key="/policy/joinup/testing"
    exact
    component={asyncTestingData}
  />,
  <Route
    path="/policy/joinup/testing/detail"
    key="/policy/joinup/testing/detail"
    exact
    component={asyncInspectAudit}
  />,
  <Route
    path="/policy/joinup/config/online-test"
    key="/policy/joinup/online-test"
    exact
    component={asyncOnlineTest}
  />,
  <Route
    path="/policy/joinup/config/test/detail"
    key="/policy/joinup/config/test/detail"
    exact
    component={asyncInspectAudit}
  />,
  <Route
    path="/policy/bazaar/strategy/new"
    key="/policy/bazaar/strategy/new"
    exact
    component={asyncDecisionNewStrategy}
  />,
  <Route
    path="/policy/bazaar/list/new"
    key="/policy/bazaar/list/new"
    exact
    component={asyncScorecardNew}
  />,
  <Route
    path="/policy/bazaar/collection/new"
    key="/policy/bazaar/collection/new"
    exact
    component={asyncNewRuleCollection}
  />,
  <Route
    path="/policy/bazaar/collection/config"
    key="/policy/bazaar/collection/config"
    exact
    component={asyncRuleList}
  />,
  <Route
    path="/policy/bazaar/collection/condition"
    key="/policy/bazaar/collection/condition"
    exact
    component={asyncRuleCondition}
  />,
  <Route
    path="/policy/bazaar/collection/version"
    key="/policy/bazaar/collection/version"
    exact
    component={asyncRuleCollectionVersion}
  />,
  <Route
    path="/policy/bazaar/strategy-flow/new"
    key="/policy/bazaar/strategy-flow/new"
    exact
    component={asyncNewDecisionStrategyFlow}
  />,
  <Route
    path="/policy/params/strategy-parameter"
    key="/policy/basis/strategy-parameter"
    exact
    component={asyncStrategyParameter}
  />,
  <Route
    path="/policy/params/warning"
    key="/policy/params/warning"
    exact
    component={asyncParamsWarning}
  />,
  <Route
    path="/policy/resource/service"
    key="/policy/resource/service"
    exact
    component={asyncResourceService}
  />,
  <Route
    path="/policy/verification/task"
    key="/policy/verification/task"
    exact
    component={asyncVerificationTask}
  />,
  <Route
    path="/policy/verification/task/result"
    key="/policy/verification/task/result"
    exact
    component={asyncVerificationTaskResult}
  />,
  <Route
    path="/policy/verification/task/result/detail"
    key="/policy/verification/task/result/detail"
    exact
    component={asyncInspectAudit}
  />,
  <Route
    path="/policy/verification/offline"
    key="/policy/verification/offline"
    exact
    component={asyncVerificationOffline}
  />,
  <Route
    path="/policy/verification/offline/new"
    key="/policy/verification/offline/new"
    exact
    component={asyncVerificationOfflineNew}
  />,
  <Route
    path="/risk/task/warning"
    key="/risk/task/warning"
    exact
    component={asyncWarning}
  />,
  <Route
    path="/risk/task/warning/detail"
    key="/risk/task/warning/detail"
    exact
    component={asyncInspectAudit}
  />,
  <Route
    path="/risk/task/inspect/detail"
    key="/risk/task/inspect/detail"
    exact
    component={asyncInspectAudit}
  />,
  <Route
    path="/risk/case/request/detail"
    key="/risk/case/request/detail"
    exact
    component={asyncCaseDetail}
  />,
  <Route
    path="/risk/event/list/detail"
    key="/risk/event/list/detail"
    exact
    component={asyncInspectAudit}
  />,
  <Route
    path="/risk/task/audit/detail"
    key="/risk/task/audit/detail"
    exact
    component={asyncCaseDetail}
  />,
  <Route
    path="/risk/case/progress/detail"
    key="/risk/case/progress/detail"
    exact
    component={asyncCaseDetail}
  />,
  <Route
    path="/risk/case/archive/detail"
    key="/risk/case/archive/detail"
    exact
    component={asyncCaseDetail}
  />,
  <Route
    path="/risk/data/report"
    key="/risk/data/report"
    exact
    component={asyncDataReport}
  />,
  <Route
    path="/leakage/system/role"
    key="/leakage/system/role"
    exact
    component={asyncSystemRoleList}
  />,
  <Route
    path="/system/job"
    key="/system/job"
    exact
    component={asyncSystemJob}
  />,
  <Route
    path="/system/log/operation"
    key="/system/log/operation"
    exact
    component={asyncSystemOperationList}
  />,
  <Route
    path="/system/log/incoming"
    key="/system/log/incoming"
    exact
    component={asyncSystemIncomingList}
  />,
  <Route
    path="/leakage/rule/management/:mode/:id"
    key="/leakage/rule/management/:mode/:id"
    exact
    component={asyncRuleAdd}
  />,
  <Route
    path="/leakage/company/customrules/:mode/:id"
    key="/leakage/company/customrules/:mode/:id"
    exact
    component={asyncNewCustomerRules}
  />,
  <Route
    path="/leakage/execution/monitoring/:id"
    key="/leakage/execution/monitoring/:id"
    exact
    component={asyncMonitorDetail}
  />
];
menuTree.forEach(pItem => {
  if (pItem.children && pItem.children.length > 0) {
    pItem.children.forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.forEach(zitem => {
          pushList(zitem);
        });
      } else {
        pushList(item);
      }
    });
  }
});
export const routeList = list;

//
function pushList(item) {
  if (item.url && routeListMap[item.url]) {
    list.push(
      <Route
        path={item.url}
        key={item.url}
        exact
        component={routeListMap[item.url]}
      />
    );
  }
}
