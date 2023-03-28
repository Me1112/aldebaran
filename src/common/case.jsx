export const CASE_SUBJECT = {
  ACCOUNT: '账户',
  MERCHANT: '商户',
  BANK_CARD: '银行卡'
}

export const ACTION_ADD = 'ADD'
export const ACTION_VIEW = 'VIEW'
export const ACTION_EDIT = 'EDIT'
export const ACTION_FIRST_AUDIT = 'FIRST_AUDIT'
export const ACTION_LAST_AUDIT = 'LAST_AUDIT'

export const CASE_RISK = {
  CASH_OUT: '套现',
  FRAUD_USE: '盗刷',
  MASS_REGISTRATION: '批量注册',
  MONEY_LAUNDERING: '洗钱'
}

export const CASE_SOURCE = {
  AUTO_TRIGGER: '自动生成',
  USER_CREATE: '单笔录入',
  EVENT_TRANSFER: '事件转化'
}

export const CASE_CONCLUSION = {
  CONFIRMED_CASE: '确定案件',
  CONFIRMED_NOT_CASE: '非案件'
}

export const CASE_STATUS = {
  CREATED: '待分配',
  FIRST_AUDIT: '初审中',
  LAST_AUDIT: '复审中',
  CLOSED: '已结案',
  CLASSIFIED: '已归档'
}

// export const STRATEGY_STATUS = {
//   UN_ACTIVE: '非激活',
//   DELETING: '删除中',
//   USED: '应用中',
//   ONLINE: '上线中',
//   ACTIVE_OFFLINE: '激活未上线'
// }

export const STRATEGY_STATUS = {
  EDITING: '编辑中',
  ACTIVE: '已激活',
  ONLINE_ING: '上线中',
  ONLINE: '已上线',
  OFFLINE_ING: '下线中',
  OFFLINE: '已下线',
  USED: '已应用',
  DELETED: '已删除'
}
