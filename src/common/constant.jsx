export const FAIL = "FAIL";
export const SUCCESS = "SUCCESS";
export const RULE_COLLECTION = "RULE_COLLECTION";
export const RULE_LIST = "RULE_LIST";
export const CONDITION_LIST = "CONDITION_LIST";
export const FIELD_LIST = "FIELD_LIST";
export const SCENE_LIST = "SCENE_LIST";
export const VERIFICATION_LIST = "VERIFICATION_LIST";
export const VERIFICATION_TODO = "VERIFICATION_TODO";
export const VERIFICATION_DONE = "VERIFICATION_DONE";
export const TYPE_SYSTEM = "SYSTEM";
export const TYPE_CUSTOM = "CUSTOM";
export const TYPE_SYSTEM_VALUE = 2;
export const TYPE_CUSTOM_VALUE = 3;
export const TYPE_NAME_LIST = "NAME_LIST";
export const TYPE_NAME_VALUE = "NAME_VALUE";
export const DMS_PREFIX = "dms";
export const UAA_PREFIX = "dms";
export const RULE_SET_MATCH_MODE_WORST = "worst";
export const RULE_SET_MATCH_MODE_WORST_TEXT = "最坏匹配";
export const RULE_SET_MATCH_MODE_RANK = "rank";
export const RULE_SET_MATCH_MODE_RANK_TEXT = "权重匹配";
export const RULE_SET_VERIFY_STATUS_LIST = ["pass", "reject"];
export const BLACK_LIST = "BLACK_LIST";

export const GET_ALL_OPERATORS = "GET_ALL_OPERATORS";
export const GET_ALL_OPERATORS_SUCCESS = "GET_ALL_OPERATORS_SUCCESS";
export const GET_ALL_OPERATORS_ERROR = "GET_ALL_OPERATORS_ERROR";

export const GET_BUSINESS_LINE = "GET_BUSINESS_LINE";
export const GET_BUSINESS_LINE_SUCCESS = "GET_BUSINESS_LINE_SUCCESS";
export const GET_BUSINESS_LINE_ERROR = "GET_BUSINESS_LINE_ERROR";

export const GET_FIELD_LIST_NEW = "GET_FIELD_LIST_NEW";
export const GET_FIELD_LIST_NEW_SUCCESS = "GET_FIELD_LIST_NEW_SUCCESS";
export const GET_FIELD_LIST_NEW_ERROR = "GET_FIELD_LIST_NEW_ERROR";

export const UN_ACTIVED = "UN_ACTIVED";
export const ACTIVED = "ACTIVED";
export const SET_USER_PERMISSION = "SET_USER_PERMISSION";
export const DictConfig = {
  conditionTypeList: {
    url: `/${DMS_PREFIX}/common/conditionTypeList.do`
  },
  conjunctionList: {
    url: `/${DMS_PREFIX}/common/conjunctionList.do`
  },
  operatorStrList: {
    url: `/${DMS_PREFIX}/common/operCharacterList.do`
  },
  unitList: {
    url: `/${DMS_PREFIX}/common/unitList.do`
  },
  operationList: {
    url: `/${DMS_PREFIX}/common/operationTypeList.do`
  },
  arithmeticStrList: {
    // 新增四则运算操作符
    url: `/${DMS_PREFIX}/common/arithmeticStrList.do`
  },
  dataTypeList: {
    url: `/${DMS_PREFIX}/common/dataTypeList.do`
  },
  fieldTypeList: {
    url: `/${DMS_PREFIX}/common/fieldTypeList.do`
  },
  verifyStatusList: {
    url: `/${DMS_PREFIX}/common/verifyObjectStatusList.do`
  },
  verifyTypeList: {
    url: `/${DMS_PREFIX}/common/dictionaryList.do`,
    dictType: "validation"
  },
  listTypeList: {
    url: `/${DMS_PREFIX}/common/dictionaryList.do`,
    dictType: "blacklist"
  },
  geoLocationList: {
    url: `/${DMS_PREFIX}/common/dictionaryList.do`,
    dictType: "location"
  },
  matchLevelList: {
    url: `/${DMS_PREFIX}/common/dictionaryList.do`,
    dictType: "matchLevel"
  },
  effectiveTimeList: {
    url: `/${DMS_PREFIX}/common/effecitveTimeTypeList.do`
  },
  fieldList: {
    url: `/${DMS_PREFIX}/rule/field/getFieldList.do`
  },
  scenarioList: {
    url: `/${DMS_PREFIX}/sys/scenarioDic/getList.do`
  },
  ruleList: {
    url: `/${DMS_PREFIX}/rule/ruleInfo/selectByConditions.do`
  },
  relatedOperationList: {
    url: `/${DMS_PREFIX}/common/lDataOperComparisonTable.do`,
    dictType: "relatedOperationList"
  },
  enumZdyList: {
    // 自定义枚举型
    url: `/${DMS_PREFIX}/rule/userDefineField/selectByConditions.do`,
    dataType: "enum"
  },
  enumSysList: {
    // 系统枚举型
    url: `/${DMS_PREFIX}/rule/sysDefaultField/filedAll.do`,
    dataType: "enum"
  }
};

export const CHANGE_NOTIFY_INFO = "CHANGE_NOTIFY_INFO";
export const CHANGE_NOTIFY_FREQUENCY = "CHANGE_NOTIFY_FREQUENCY";

export const LOGIN = "LOGIN";
export const DEMO = "DEMO";

export const DEMO_SUCCESS = "DEMO_SUCCESS";
export const DEMO_ERROR = "DEMO_ERROR";

export const EDIT = "EDIT";
export const DELETE = "DELETE";
export const ADD = "ADD";
export const POP_MENUS = {
  ADD: "添加",
  RENAME: "重命名",
  EDIT: "编辑",
  COPY: "复制",
  DELETE_CALCULATE: "删除",
  DELETE_CHART_CALCULATE: "删除",
  DELETE: "删除",
  MOVE: "移除",
  CHANGE_TO_MEASURE: "转化为指标",
  CHANGE_TO_DIMENSION: "转化为维度",
  CHANGE_TO_HIDDEN: "隐藏",
  CHANGE_TO_SHOWN: "显示",
  CHANGE_TO_GEO: "地理信息",
  CALCULATE_FIELD: "计算字段",
  HIERARCHICAL_STRUCTURE: "层次结构"
};

export const RESOURCE_TYPES = {
  RULE_SET: "规则集",
  SCORE_CARD: "评分卡",
  DECISION_TREE: "决策树",
  DECISION_STREAM: "决策流"
};

export const RISK_GRADE = {
  LOW: { name: "低风险", css: "risk-grade risk-grade-low" },
  MIDDLE: { name: "中风险", css: "risk-grade risk-grade-middle" },
  HIGH: { name: "高风险", css: "risk-grade risk-grade-high" }
};

export const HANDLE_STATUS = {
  CORRECT: { name: "预警无误", css: "correct" },
  INCORRECT: { name: "预警有误", css: "incorrect" },
  INEFFECTIVE: { name: "预警失效", css: "ineffective" }
};
// 规则管理
export const SYS_FIELD_LIST = "SYS_FIELD_LIST";
export const CUSTOM_FIELD_LIST = "CUSTOM_FIELD_LIST";
export const GET_SCENE_LIST = "GET_SCENE_LIST";
export const GET_DATA_TYPE_LIST = "GET_DATA_TYPE_LIST";
export const GET_FIELD_TYPE_LIST = "GET_FIELD_TYPE_LIST";
export const SYS_FIELD_DELETE = "SYS_FIELD_DELETE";
export const SYS_FIELD_SAVE = "SYS_FIELD_SAVE";
export const SYS_FIELD_UPDATE = "SYS_FIELD_UPDATE";
export const CUSTOM_FIELD_DELETE = "CUSTOM_FIELD_DELETE";
export const CUSTOM_FIELD_SAVE = "CUSTOM_FIELD_SAVE";
export const CUSTOM_FIELD_UPDATE = "CUSTOM_FIELD_UPDATE";
export const SAVE_SCENE = "SAVE_SCENE";
export const UPDATE_SCENE = "UPDATE_SCENE";
export const DELETE_SCENE = "DELETE_SCENE";
export const GET_RULE_SET_LIST = "GET_RULE_SET_LIST";
export const GET_RULE_SET_4_RULE_COPY_LIST = "GET_RULE_SET_4_RULE_COPY_LIST";
export const GET_RULE_LIST = "GET_RULE_LIST";
export const RULE_DELETE = "RULE_DELETE";
export const RULE_SAVE = "RULE_SAVE";
export const RULE_UPDATE = "RULE_UPDATE";
export const RULE_COPY = "RULE_COPY";
export const RULE_ACTIVE = "RULE_ACTIVE";
export const GET_MATCH_MODEL_SELECT = "GET_MATCH_MODEL_SELECT";
export const GET_APP_SELECT = "GET_APP_SELECT";
export const GET_SCENE_SELECT = "GET_SCENE_SELECT";
export const GET_CONDITION_TYPE_SELECT = "GET_CONDITION_TYPE_SELECT";
export const GET_CONDITION_ALL_SELECT = "GET_CONDITION_ALL_SELECT";
export const GET_VERIFICATION_LIST = "GET_VERIFICATION_LIST";
export const GET_VERIFY_OBJECT_TYPE_LIST = "GET_VERIFY_OBJECT_TYPE_LIST";
export const GET_VERIFY_STATUS_LIST = "GET_VERIFY_STATUS_LIST";
export const GET_OPERATION_TYPE_LIST = "GET_OPERATION_TYPE_LIST";
export const GET_VERIFICATION_ALL_SELECT = "GET_VERIFICATION_ALL_SELECT";

export const GET_SCENE_LIST_SUCCESS = "GET_SCENE_LIST_SUCCESS";
export const FIELD_LIST_SUCCESS = "FIELD_LIST_SUCCESS";
export const SYS_FIELD_LIST_SUCCESS = "SYS_FIELD_LIST_SUCCESS";
export const CUSTOM_FIELD_LIST_SUCCESS = "CUSTOM_FIELD_LIST_SUCCESS";
export const GET_DATA_TYPE_LIST_SUCCESS = "GET_DATA_TYPE_LIST_SUCCESS";
export const GET_FIELD_TYPE_LIST_SUCCESS = "GET_FIELD_TYPE_LIST_SUCCESS";
export const SYS_FIELD_DELETE_SUCCESS = "SYS_FIELD_DELETE_SUCCESS";
export const SYS_FIELD_SAVE_SUCCESS = "SYS_FIELD_SAVE_SUCCESS";
export const SYS_FIELD_UPDATE_SUCCESS = "SYS_FIELD_UPDATE_SUCCESS";
export const CUSTOM_FIELD_DELETE_SUCCESS = "CUSTOM_FIELD_DELETE_SUCCESS";
export const CUSTOM_FIELD_SAVE_SUCCESS = "CUSTOM_FIELD_SAVE_SUCCESS";
export const CUSTOM_FIELD_UPDATE_SUCCESS = "CUSTOM_FIELD_UPDATE_SUCCESS";
export const GET_RULE_SET_LIST_SUCCESS = "GET_RULE_SET_LIST_SUCCESS";
export const GET_RULE_SET_4_RULE_COPY_LIST_SUCCESS =
  "GET_RULE_SET_4_RULE_COPY_LIST_SUCCESS";
export const GET_RULE_LIST_SUCCESS = "GET_RULE_LIST_SUCCESS";
export const RULE_DELETE_SUCCESS = "RULE_DELETE_SUCCESS";
export const RULE_SAVE_SUCCESS = "RULE_SAVE_SUCCESS";
export const RULE_UPDATE_SUCCESS = "RULE_UPDATE_SUCCESS";
export const RULE_COPY_SUCCESS = "RULE_COPY_SUCCESS";
export const RULE_ACTIVE_SUCCESS = "RULE_ACTIVE_SUCCESS";
export const GET_MATCH_MODEL_SELECT_SUCCESS = "GET_MATCH_MODEL_SELECT_SUCCESS";
export const GET_APP_SELECT_SUCCESS = "GET_APP_SELECT_SUCCESS";
export const GET_SCENE_SELECT_SUCCESS = "GET_SCENE_SELECT_SUCCESS";
export const GET_CONDITION_TYPE_SELECT_SUCCESS =
  "GET_CONDITION_TYPE_SELECT_SUCCESS";
export const GET_CONDITION_ALL_SELECT_SUCCESS =
  "GET_CONDITION_ALL_SELECT_SUCCESS";
export const GET_VERIFICATION_LIST_SUCCESS = "GET_VERIFICATION_LIST_SUCCESS";
export const GET_VERIFY_OBJECT_TYPE_LIST_SUCCESS =
  "GET_VERIFY_OBJECT_TYPE_LIST_SUCCESS";
export const GET_OPERATION_TYPE_LIST_SUCCESS =
  "GET_OPERATION_TYPE_LIST_SUCCESS";
export const GET_VERIFY_STATUS_LIST_SUCCESS = "GET_VERIFY_STATUS_LIST_SUCCESS";
export const GET_VERIFICATION_ALL_SELECT_SUCCESS =
  "GET_VERIFICATION_ALL_SELECT_SUCCESS";
export const CLEAR_ERROR_MESSAGE_SUCCESS = "CLEAR_ERROR_MESSAGE_SUCCESS";

export const GET_SCENE_LIST_ERROR = "GET_SCENE_LIST_ERROR";
export const SYS_FIELD_LIST_ERROR = "SYS_FIELD_LIST_ERROR";
export const CUSTOM_FIELD_LIST_ERROR = "CUSTOM_FIELD_LIST_ERROR";
export const GET_DATA_TYPE_LIST_ERROR = "GET_DATA_TYPE_LIST_ERROR";
export const GET_FIELD_TYPE_LIST_ERROR = "GET_FIELD_TYPE_LIST_ERROR";
export const SYS_FIELD_DELETE_ERROR = "SYS_FIELD_DELETE_ERROR";
export const SYS_FIELD_SAVE_ERROR = "SYS_FIELD_SAVE_ERROR";
export const SYS_FIELD_UPDATE_ERROR = "SYS_FIELD_UPDATE_ERROR";
export const CUSTOM_FIELD_DELETE_ERROR = "CUSTOM_FIELD_DELETE_ERROR";
export const CUSTOM_FIELD_SAVE_ERROR = "CUSTOM_FIELD_SAVE_ERROR";
export const CUSTOM_FIELD_UPDATE_ERROR = "CUSTOM_FIELD_UPDATE_ERROR";
export const GET_RULE_SET_LIST_ERROR = "GET_RULE_SET_LIST_ERROR";
export const GET_RULE_SET_4_RULE_COPY_LIST_ERROR =
  "GET_RULE_SET_4_RULE_COPY_LIST_ERROR";
export const GET_RULE_LIST_ERROR = "GET_RULE_LIST_ERROR";
export const RULE_DELETE_ERROR = "RULE_DELETE_ERROR";
export const RULE_SAVE_ERROR = "RULE_SAVE_ERROR";
export const RULE_UPDATE_ERROR = "RULE_UPDATE_ERROR";
export const RULE_COPY_ERROR = "RULE_COPY_ERROR";
export const RULE_ACTIVE_ERROR = "RULE_ACTIVE_ERROR";
export const GET_MATCH_MODEL_SELECT_ERROR = "GET_MATCH_MODEL_SELECT_ERROR";
export const GET_APP_SELECT_ERROR = "GET_APP_SELECT_ERROR";
export const GET_SCENE_SELECT_ERROR = "GET_SCENE_SELECT_ERROR";
export const GET_CONDITION_TYPE_SELECT_ERROR =
  "GET_CONDITION_TYPE_SELECT_ERROR";
export const GET_CONDITION_ALL_SELECT_ERROR = "GET_CONDITION_ALL_SELECT_ERROR";
export const GET_VERIFICATION_LIST_ERROR = "GET_VERIFICATION_LIST_ERROR";
export const GET_VERIFY_OBJECT_TYPE_LIST_ERROR =
  "GET_VERIFY_OBJECT_TYPE_LIST_ERROR";
export const GET_OPERATION_TYPE_LIST_ERROR = "GET_OPERATION_TYPE_LIST_ERROR";
export const GET_VERIFY_STATUS_LIST_ERROR = "GET_VERIFY_STATUS_LIST_ERROR";
export const GET_VERIFICATION_ALL_SELECT_ERROR =
  "GET_VERIFICATION_ALL_SELECT_ERROR";

export const CHART_COLOR = {
  COLOR_THEME: [
    "#1C9477",
    "#46A690",
    "#71B9A9",
    "#85C2B6",
    "#9BCCC3",
    "#AFD4CF",
    "#C6DFDC",
    "#D0E3E2",
    "#DAE8E8",
    "#E4ECEE"
  ],
  COLOR_RED: [
    "#D7273C",
    "#DC4F61",
    "#E17786",
    "#E38C98",
    "#E6A1AB",
    "#E8B4BD",
    "#EBC9D0",
    "#ECD3D9",
    "#EDDDE2",
    "#EEE7EB"
  ],
  COLOR_ORANGE: [
    "#FF9A00",
    "#FCAB31",
    "#F9BC62",
    "#F7C57A",
    "#F6CF93",
    "#F4D6AB",
    "#F3E0C4",
    "#F2E4D0",
    "#F1E8DC",
    "#F0EDE8"
  ],
  COLOR_YELLOW: [
    "#FFCB00",
    "#FCD231",
    "#F9DA62",
    "#F7DE7A",
    "#F6E293",
    "#F4E5AB",
    "#F3EAC4",
    "#F2EBD0",
    "#F1EDDC",
    "#F0EFE8"
  ]
};
export const BUSINESS_TYPES = [
  "UNDERWRITING",
  "REPORT",
  "SURVEY",
  "SURVEHICLELOSS",
  "SURHUMANINJURY",
  "SURMATERIALLOSS"
];
export const BUSINESS_TYPE_MAP = {
  UNDERWRITING: "承保",
  REPORT: "报案",
  SURVEY: "查勘",
  SURVEHICLELOSS: "车定损",
  SURHUMANINJURY: "人定损",
  SURMATERIALLOSS: "物定损"
};
export const INSURANCE_TYPE = ["VEHICLEINSURANCE", "NOVEHICLEINSURANCE"];
export const INSURANCE_TYPE_MAP = {
  VEHICLEINSURANCE: "车险",
  NOVEHICLEINSURANCE: "非车险"
};
export const FIELD_TYPES = [
  "DECIMAL",
  "STRING",
  "BOOLEAN",
  "DATETIME",
  "ENUM",
  "LIST",
  "CUMULATIVE"
];

export const FIELD_TYPE_MAP = {
  DECIMAL: "数值型",
  STRING: "字符型",
  BOOLEAN: "布尔型",
  DATETIME: "时间日期类",
  ENUM: "枚举型",
  LIST: "列表类",
  CUMULATIVE: "统计类"
};

export const FACTOR_TEMPLATE_TYPES = ["ANTI_LEAKAGE"];
export const FACTOR_TEMPLATE_NEW_TYPES = ["ANTI_LEAKAGE", "ANTI_FRAUD"];

export const FACTOR_TEMPLATE_TYPE_MAP = {
  ANTI_LEAKAGE: "反渗漏",
  ANTI_FRAUD: "反欺诈"
};

// export const STRING_OPERATORS = ['CONTAINS_OR', 'CONTAINS_AND', 'NOT_CONTAINS_AND', 'EQUALS_OR', 'EQUALS_AND', 'EQUALS_NOT']
export const BASIC_STRING_OPERATORS = [
  "CONTAINS_OR",
  "NOT_CONTAINS_AND",
  "EQUALS_OR",
  "EQUALS_NOT",
  "EQUALS_FIELD"
];
export const LIST_STRING_OPERATORS = [
  "CONTAINS_OR",
  "CONTAINS_AND",
  "NOT_CONTAINS_AND",
  "NOT_CONTAINS_OR",
  "EQUALS_OR",
  "EQUALS_AND",
  "EQUALS_NOT",
  "EQUALS_NOT_OR"
];

export const STRING_OPERATOR_MAP = {
  CONTAINS_OR: "半包含",
  CONTAINS_AND: "全包含",
  NOT_CONTAINS_AND: "不包含（且）",
  NOT_CONTAINS_OR: "不包含（或）",
  EQUALS_OR: "完全半包含",
  EQUALS_AND: "完全全包含",
  EQUALS_NOT: "完全不包含（且）",
  EQUALS_NOT_OR: "完全不包含（或）",
  EQUALS_FIELD: "等于（基础字段）"
};

export const NUMBER_OPERATORS_IN_AGGREGATION = [
  "LESS_THAN",
  "LESS_EQUALS_THAN",
  "GREATER_THAN",
  "GREATER_EQUALS_THAN",
  "BETWEEN_LCRC",
  "BETWEEN_LCRO",
  "BETWEEN_LORC",
  "BETWEEN_LORO"
];

export const NUMBER_OPERATORS = [
  "LESS_THAN",
  "LESS_EQUALS_THAN",
  "GREATER_THAN",
  "GREATER_EQUALS_THAN",
  "DECIMAL_EQUALS",
  "BETWEEN_LCRC",
  "BETWEEN_LCRO",
  "BETWEEN_LORC",
  "BETWEEN_LORO",
  "LESS_THAN_LIMIT_TIME",
  "LESS_EQUALS_THAN_LIMIT_TIME",
  "GREATER_THAN_LIMIT_TIME",
  "GREATER_EQUALS_THAN_LIMIT_TIME",
  "DECIMAL_EQUALS_LIMIT_TIME",
  "BETWEEN_LCRC_DECIMAL_LIMIT_TIME",
  "BETWEEN_LCRO_DECIMAL_LIMIT_TIME",
  "BETWEEN_LORC_DECIMAL_LIMIT_TIME",
  "BETWEEN_LORO_DECIMAL_LIMIT_TIME"
];
export const OPERATE_TYPE_LIST = ["FILTER", "ARITHMETIC"];
export const OPERATE_TYPE_MAP = {
  FILTER: "过滤条件",
  ARITHMETIC: "四则运算"
};
export const DATE_FORMAT_LIST = ["YMDHMS", "HM"];
export const DATE_FORMAT_MAP = {
  YMDHMS: "日期",
  HM: "时间(HH:mm)"
};
export const NUMBER_OPERATOR_MAP = {
  GREATER_THAN: "大于",
  LESS_THAN: "小于",
  GREATER_EQUALS_THAN: "大于等于",
  LESS_EQUALS_THAN: "小于等于",
  DECIMAL_EQUALS: "等于",
  DIVISION: "除以",
  BETWEEN_LCRC: "介于（左闭右闭）",
  BETWEEN_LCRO: "介于（左闭右开）",
  BETWEEN_LORC: "介于（左开右闭）",
  BETWEEN_LORO: "介于（左开右开）",
  LESS_THAN_LIMIT_TIME: "小于（限定时间）",
  LESS_EQUALS_THAN_LIMIT_TIME: "小于等于（限定时间）",
  GREATER_THAN_LIMIT_TIME: "大于（限定时间）",
  GREATER_EQUALS_THAN_LIMIT_TIME: "大于等于（限定时间）",
  DECIMAL_EQUALS_LIMIT_TIME: "等于（限定时间）",
  BETWEEN_LCRC_DECIMAL_LIMIT_TIME: "介于（限定时间-左闭右闭）",
  BETWEEN_LCRO_DECIMAL_LIMIT_TIME: "介于（限定时间-左闭右开）",
  BETWEEN_LORC_DECIMAL_LIMIT_TIME: "介于（限定时间-左开右闭）",
  BETWEEN_LORO_DECIMAL_LIMIT_TIME: "介于（限定时间-左开右开）"
};
export const NUMBER_OPERATOR_MATH_MAP = {
  GREATER_THAN: ">",
  LESS_THAN: "<",
  GREATER_EQUALS_THAN: ">=",
  LESS_EQUALS_THAN: "<=",
  DECIMAL_EQUALS: "=",
  DIVISION: "/",
  BETWEEN_LCRC: ["<=", "<="],
  BETWEEN_LCRO: ["<=", "<"],
  BETWEEN_LORC: ["<", "<="],
  BETWEEN_LORO: ["<", "<"],
  LESS_THAN_LIMIT_TIME: "<",
  LESS_EQUALS_THAN_LIMIT_TIME: "<=",
  GREATER_THAN_LIMIT_TIME: ">",
  GREATER_EQUALS_THAN_LIMIT_TIME: ">=",
  DECIMAL_EQUALS_LIMIT_TIME: "=",
  BETWEEN_LCRC_DECIMAL_LIMIT_TIME: ["<=", "<="],
  BETWEEN_LCRO_DECIMAL_LIMIT_TIME: ["<=", "<"],
  BETWEEN_LORC_DECIMAL_LIMIT_TIME: ["<", "<="],
  BETWEEN_LORO_DECIMAL_LIMIT_TIME: ["<", "<"]
};

export const NUMBER_LIMIT_TIME_OPERATORS = [
  "RECENT_TIME_RANG_DAY",
  "RECENT_TIME_RANG_MONTH"
];
export const NUMBER_LIMIT_TIME_OPERATOR_MAP = {
  RECENT_TIME_RANG_DAY: "最近的时间范围（天）",
  RECENT_TIME_RANG_MONTH: "最近的时间范围（月）"
};
export const NUMBER_LIMIT_TIME_OPERATOR_VIEW_MAP = {
  RECENT_TIME_RANG_DAY: "天",
  RECENT_TIME_RANG_MONTH: "月"
};

export const DATE_HOURS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24"
];

export const DATE_FRAUD_OPERATORS = [
  "LESS_THAN_DATE",
  "LESS_EQUALS_THAN_DATE",
  "GREATER_THAN_DATE",
  "GREATER_EQUALS_THAN_DATE",
  "DATE_EQUALS",
  "BETWEEN_LCRC_DATE",
  "BETWEEN_LCRO_DATE",
  "BETWEEN_LORC_DATE",
  "BETWEEN_LORO_DATE",
  "SUBTRACTION",
  "EXTRACTION_TIME_POINT"
];

export const DATE_FRAUD_OPERATOR_MAP = {
  GREATER_THAN_DATE: "大于",
  LESS_THAN_DATE: "小于",
  GREATER_EQUALS_THAN_DATE: "大于等于",
  LESS_EQUALS_THAN_DATE: "小于等于",
  DATE_EQUALS: "等于",
  BETWEEN_LCRC_DATE: "介于（左闭右闭）",
  BETWEEN_LCRO_DATE: "介于（左闭右开）",
  BETWEEN_LORC_DATE: "介于（左开右闭）",
  BETWEEN_LORO_DATE: "介于（左开右开）",
  SUBTRACTION: "减去",
  EXTRACTION_TIME_POINT: "抽取时间点"
};

export const DATE_OPERATORS = [
  "LESS_THAN_DATE",
  "LESS_EQUALS_THAN_DATE",
  "GREATER_THAN_DATE",
  "GREATER_EQUALS_THAN_DATE",
  "DATE_EQUALS",
  "BETWEEN_LCRC_DATE",
  "BETWEEN_LCRO_DATE",
  "BETWEEN_LORC_DATE",
  "BETWEEN_LORO_DATE"
];

export const DATE_OPERATOR_MAP = {
  GREATER_THAN_DATE: "大于",
  LESS_THAN_DATE: "小于",
  GREATER_EQUALS_THAN_DATE: "大于等于",
  LESS_EQUALS_THAN_DATE: "小于等于",
  DATE_EQUALS: "等于",
  BETWEEN_LCRC_DATE: "介于（左闭右闭）",
  BETWEEN_LCRO_DATE: "介于（左闭右开）",
  BETWEEN_LORC_DATE: "介于（左开右闭）",
  BETWEEN_LORO_DATE: "介于（左开右开）"
};

export const DATE_OPERATOR_VIEW_MAP = {
  GREATER_THAN_DATE: ">",
  LESS_THAN_DATE: "<",
  GREATER_EQUALS_THAN_DATE: ">=",
  LESS_EQUALS_THAN_DATE: "<=",
  DATE_EQUALS: "=",
  BETWEEN_LCRC_DATE: ["<=", "<="],
  BETWEEN_LCRO_DATE: ["<=", "<"],
  BETWEEN_THIS_DAY: ["<=", "<"],
  BETWEEN_LORC_DATE: ["<", "<="],
  BETWEEN_LORO_DATE: ["<", "<"],
  SUBTRACTION: "-",
  EXTRACTION_TIME_POINT: "(24H)"
};

export const DATE_EXTRACTION_TIME_POINT_OPERATORS = [
  "BETWEEN_THIS_DAY",
  "BETWEEN_CROSS_DAY"
];
export const DATE_EXTRACTION_TIME_POINT_OPERATOR_MAP = {
  BETWEEN_THIS_DAY: "介于当天内时间段",
  BETWEEN_CROSS_DAY: "介于跨天时间段"
};

export const DATE_SUBTRACTION_UNITS = [
  "MILLISECOND",
  "SECOND",
  "MINUTE",
  "HOUR",
  "DAY",
  "MONTH",
  "YEAR"
];
export const DATE_SUBTRACTION_UNIT_MAP = {
  HOUR: "小时",
  DAY: "天",
  MONTH: "月",
  YEAR: "年",
  MINUTE: "分",
  SECOND: "秒",
  MILLISECOND: "毫秒"
};

export const BOOLEAN_OPERATORS = ["BOOLEAN_EQUALS"];

export const BOOLEAN_OPERATOR_VIEW_MAP = {
  BOOLEAN_EQUALS: "等于"
};

export const ENUM_OPERATORS = [
  "ENUM_EQUALS",
  "ENUM_BELONG",
  "ENUM_NOT_BELONG",
  "ENUM_EQUALS_FIELD"
];

export const ENUM_OPERATOR_MAP = {
  ENUM_EQUALS: "等于",
  ENUM_BELONG: "属于",
  ENUM_NOT_BELONG: "不包含",
  ENUM_EQUALS_FIELD: "等于（基础字段）"
};
export const ENUM_OPERATOR_VIEW_MAP = {
  ENUM_EQUALS: "=",
  ENUM_BELONG: "属于",
  ENUM_NOT_BELONG: "不包含",
  ENUM_EQUALS_FIELD: "="
};

export const AGGREGATE_NUMBER_OPERATORS = ["SUMMATION", "MAXIMUM", "MINIMUM"];
export const AGGREGATE_NOT_NUMBER_OPERATORS = ["COUNT_TIMES"];

export const AGGREGATE_OPERATOR_MAP = {
  SUMMATION: "求和",
  MAXIMUM: "最大值",
  MINIMUM: "最小值",
  COUNT_TIMES: "求个数"
};

export const ARITHMETIC_OPERATORS = [
  "ADDITION",
  "SUBTRACTION",
  "MULTIPLICATION",
  "DIVISION"
];

export const ARITHMETIC_OPERATOR_MAP = {
  ADDITION: "加",
  SUBTRACTION: "减",
  MULTIPLICATION: "乘",
  DIVISION: "除"
};
export const ARITHMETIC_OPERATOR_MATH_MAP = {
  ADDITION: "+",
  SUBTRACTION: "-",
  MULTIPLICATION: "*",
  DIVISION: "/"
};

export const TRIGGER_TYPES = ["ALL", "TRIGGER", "NOT_TRIGGER"];

export const TRIGGER_TYPE_MAP = {
  ALL: "全部",
  TRIGGER: "触发",
  NOT_TRIGGER: "未触发"
};

// 列表类型字段中的属性字段
export const DATE_IN_LIST_OPERATORS = [
  "DATE_EQUALS",
  "DATE_AFTER",
  "DATE_BEFORE"
];

export const DATE_IN_LIST_OPERATOR_MAP = {
  DATE_EQUALS: "等于",
  DATE_AFTER: "晚于",
  DATE_BEFORE: "早于"
};

export const DATE_IN_LIST_OPERATOR_VIEW_MAP = {
  DATE_EQUALS: "=",
  DATE_AFTER: "晚于",
  DATE_BEFORE: "早于"
};

export const NUMBER_IN_LIST_OPERATORS = [
  "LESS_THAN",
  "LESS_EQUALS_THAN",
  "GREATER_THAN",
  "GREATER_EQUALS_THAN",
  "BETWEEN_LCRC",
  "BETWEEN_LCRO",
  "BETWEEN_LORC",
  "BETWEEN_LORO"
];

export const NUMBER_IN_LIST_OPERATOR_MAP = {
  GREATER_THAN: "大于",
  LESS_THAN: "小于",
  GREATER_EQUALS_THAN: "大于等于",
  LESS_EQUALS_THAN: "小于等于",
  BETWEEN_LCRC: "介于（左闭右闭）",
  BETWEEN_LCRO: "介于（左闭右开）",
  BETWEEN_LORC: "介于（左开右闭）",
  BETWEEN_LORO: "介于（左开右开）"
};
export const NUMBER_IN_LIST_OPERATOR_MATH_MAP = {
  GREATER_THAN: ">",
  LESS_THAN: "<",
  GREATER_EQUALS_THAN: ">=",
  LESS_EQUALS_THAN: "<=",
  BETWEEN_LCRC: ["<=", "<="],
  BETWEEN_LCRO: ["<=", "<"],
  BETWEEN_LORC: ["<", "<="],
  BETWEEN_LORO: ["<", "<"]
};

export const AREA_TYPE = [
  "200",
  "201",
  "202",
  "203",
  "204",
  "205",
  "206",
  "207",
  "208",
  "209",
  "210",
  "211",
  "212",
  "213",
  "214",
  "215",
  "216",
  "217",
  "218",
  "219",
  "220",
  "221",
  "222",
  "223",
  "224",
  "225",
  "226",
  "227",
  "228",
  "229",
  "230",
  "231",
  "232",
  "233",
  "234",
  "235",
  "236",
  "237",
  "241",
  "245",
  "246",
  "248"
];
export const AREA_TYPE_MAP = {
  "200": "全国",
  "201": "北京",
  "202": "上海",
  "203": "天津",
  "204": "广东",
  "205": "深圳",
  "206": "辽宁",
  "207": "大连",
  "208": "吉林",
  "209": "湖北",
  "210": "江苏",
  "211": "青岛",
  "212": "浙江",
  "213": "福建",
  "214": "广西",
  "215": "海南",
  "216": "云南",
  "217": "陕西",
  "218": "重庆",
  "219": "黑龙江",
  "220": "湖南",
  "221": "贵州",
  "222": "江西",
  "223": "新疆",
  "224": "河北（含唐山）",
  "225": "安徽",
  "226": "四川",
  "227": "青海",
  "228": "宁夏",
  "229": "宁波",
  "230": "厦门",
  "231": "内蒙古",
  "232": "河南",
  "233": "山西",
  "234": "甘肃",
  "235": "东莞",
  "236": "山东",
  "237": "西藏",
  "241": "佛山",
  "245": "苏州",
  "246": "无锡",
  "248": "温州"
};

const treeChildren = [];
AREA_TYPE.slice(1).map(type => {
  treeChildren.push({
    title: AREA_TYPE_MAP[type],
    value: type,
    key: type
  });
});
export const AREA_TYPE_TREE_LIST_MAP = [
  {
    title: "全国",
    value: "200",
    key: "200",
    children: treeChildren
  }
];
