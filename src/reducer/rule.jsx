import { Map } from 'immutable'
import {
  GET_SCENE_LIST_SUCCESS,
  SYS_FIELD_LIST_SUCCESS,
  CUSTOM_FIELD_LIST_SUCCESS,
  GET_DATA_TYPE_LIST_SUCCESS,
  GET_FIELD_TYPE_LIST_SUCCESS,
  SYS_FIELD_DELETE_SUCCESS,
  SYS_FIELD_SAVE_SUCCESS,
  SYS_FIELD_UPDATE_SUCCESS,
  CUSTOM_FIELD_DELETE_SUCCESS,
  CUSTOM_FIELD_SAVE_SUCCESS,
  CUSTOM_FIELD_UPDATE_SUCCESS,
  GET_RULE_SET_LIST_SUCCESS,
  GET_RULE_SET_4_RULE_COPY_LIST_SUCCESS,
  GET_RULE_LIST_SUCCESS,
  RULE_DELETE_SUCCESS,
  RULE_SAVE_SUCCESS,
  RULE_UPDATE_SUCCESS,
  RULE_COPY_SUCCESS,
  RULE_ACTIVE_SUCCESS,
  GET_VERIFY_OBJECT_TYPE_LIST_SUCCESS,
  GET_OPERATION_TYPE_LIST_SUCCESS,
  GET_VERIFY_STATUS_LIST_SUCCESS,
  GET_VERIFICATION_ALL_SELECT_SUCCESS,

  GET_SCENE_LIST_ERROR,
  SYS_FIELD_LIST_ERROR,
  CUSTOM_FIELD_LIST_ERROR,
  GET_DATA_TYPE_LIST_ERROR,
  GET_FIELD_TYPE_LIST_ERROR,
  SYS_FIELD_DELETE_ERROR,
  SYS_FIELD_SAVE_ERROR,
  SYS_FIELD_UPDATE_ERROR,
  CUSTOM_FIELD_DELETE_ERROR,
  CUSTOM_FIELD_SAVE_ERROR,
  CUSTOM_FIELD_UPDATE_ERROR,
  GET_RULE_SET_LIST_ERROR,
  GET_RULE_SET_4_RULE_COPY_LIST_ERROR,
  GET_RULE_LIST_ERROR,
  RULE_DELETE_ERROR,
  RULE_SAVE_ERROR,
  RULE_UPDATE_ERROR,
  RULE_COPY_ERROR,
  RULE_ACTIVE_ERROR,
  GET_APP_SELECT_SUCCESS,
  GET_APP_SELECT_ERROR,
  GET_SCENE_SELECT_SUCCESS,
  GET_SCENE_SELECT_ERROR,
  GET_MATCH_MODEL_SELECT_SUCCESS,
  GET_MATCH_MODEL_SELECT_ERROR,
  GET_CONDITION_TYPE_SELECT_SUCCESS,
  GET_CONDITION_TYPE_SELECT_ERROR,
  GET_CONDITION_ALL_SELECT_SUCCESS,
  GET_CONDITION_ALL_SELECT_ERROR,
  GET_VERIFY_OBJECT_TYPE_LIST_ERROR,
  GET_OPERATION_TYPE_LIST_ERROR,
  GET_VERIFY_STATUS_LIST_ERROR,
  GET_VERIFICATION_ALL_SELECT_ERROR,
  DictConfig,
  GET_ALL_OPERATORS_ERROR,
  GET_ALL_OPERATORS_SUCCESS,
  GET_BUSINESS_LINE_SUCCESS,
  GET_BUSINESS_LINE_ERROR,
  GET_FIELD_LIST_NEW_SUCCESS,
  GET_FIELD_LIST_NEW_ERROR,
  SUCCESS
} from '../common/constant'

export default function rule(state = Map({}), action = {}) {
  const { type, payload } = action
  state = state.set('error', '')
  switch (type) {
    case GET_SCENE_LIST_SUCCESS:
      const { content = [] } = payload
      content.forEach((s, index) => {
        const { scenarioDicId = '' } = s
        s.key = scenarioDicId
        content[index] = s
      })
      return state.set('sceneList', content)
    case SYS_FIELD_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('sysFieldContent', payload.content)
      }
      return state
    case CUSTOM_FIELD_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('customFieldContent', payload.content)
      }
      return state
    case GET_DATA_TYPE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('dataTypeList', payload.content)
      }
      return state
    case GET_FIELD_TYPE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('fieldTypeList', payload.content)
      }
      return state
    case SYS_FIELD_DELETE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('deleteSysField:', payload)
      }
      return state
    case SYS_FIELD_SAVE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('saveSysField:', payload)
      }
      return state
    case SYS_FIELD_UPDATE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('updateSysField:', payload)
      }
      return state
    case CUSTOM_FIELD_DELETE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('deleteCustomField:', payload)
      }
      return state
    case CUSTOM_FIELD_SAVE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('saveCustomField:', payload)
      }
      return state
    case CUSTOM_FIELD_UPDATE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('updateCustomField:', payload)
      }
      return state
    case GET_RULE_SET_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('ruleSetContent', payload.content)
      }
      return state
    case GET_RULE_SET_4_RULE_COPY_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('ruleSet4RuleCopyContent', payload.content)
      }
      return state
    case GET_RULE_LIST_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('ruleContent', payload.content)
      }
      return state
    case RULE_DELETE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('deleteRule:', payload)
      }
      return state
    case RULE_SAVE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('saveRule:', payload)
      }
      return state
    case RULE_UPDATE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('updateRule:', payload)
      }
      return state
    case RULE_COPY_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('copyRule:', payload)
      }
      return state
    case RULE_ACTIVE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        console.log('activeRule:', payload)
      }
      return state

    case GET_APP_SELECT_SUCCESS:
      return state.set('appSelect', payload.content || [])
    case GET_SCENE_SELECT_SUCCESS:
      return state.set('sceneSelect', payload.content)
    case GET_MATCH_MODEL_SELECT_SUCCESS:
      return state.set('matchModelSelect', payload.content)
    case GET_CONDITION_TYPE_SELECT_SUCCESS:
      const conditionTypeList = payload.content || []
      return state.set('conditionTypeList', conditionTypeList)
    case GET_FIELD_LIST_NEW_SUCCESS:
      const source = payload.content || []
      let newfieldListObj = {}
      source.forEach(item => {
        if (!newfieldListObj[item.fieldDataCategory]) {
          newfieldListObj[item.fieldDataCategory] = []
        }
        newfieldListObj[item.fieldDataCategory].push(item)
      })
      state.set('fieldListSource', source)
      return state.set('fieldList', Object.values(newfieldListObj))
    case GET_CONDITION_ALL_SELECT_SUCCESS:
      let index = 0
      let fieldTypeList = []
      let fieldList = []
      let fieldListConvert = {}
      let fieldListObj = {}
      let unitListObj = {}
      let operatorStrObj = {}
      let operatorStrKeyObj = {}
      let operatorStrBakObj = {}
      let scenarioListObj = {}
      let matchLevelObj = {}
      let arithmeticObj = {}
      let typeDict = {}
      for (let k in DictConfig) {
        const { content = [] } = payload[index]
        const isArray = Object.prototype.toString.call(content) === '[object Array]'
        let { result = [] } = content
        result = isArray ? content : result
        switch (k) {
          case 'fieldTypeList':
            fieldTypeList = result
            fieldTypeList.push({ name: '数据服务类', index: 'dataService' }) // hack for data service
            break
          case 'fieldList':
            fieldList = result
            result.forEach(f => {
              const { fieldName, fieldDisplayName } = f
              fieldListObj[fieldName] = fieldDisplayName
            })
            break
          case 'geoLocationList':
          case 'listTypeList':
            result.forEach(f => {
              const { dictValue, dictName } = f
              fieldListObj[dictValue] = dictName
            })
            break
          case 'operatorStrList':
            result.forEach(f => {
              const { index, value2, name } = f
              operatorStrObj[index] = name
              operatorStrBakObj[value2] = name
              operatorStrKeyObj[index] = value2
            })
            break
          case 'scenarioList':
            result.forEach(f => {
              const { scenarioValue, scenarioName } = f
              scenarioListObj[scenarioValue] = scenarioName
            })
            break
          case 'matchLevelList':
            result.forEach(f => {
              const { dictValue, dictName } = f
              matchLevelObj[dictValue] = dictName
            })
            break
          case 'arithmeticStrList':
            result.forEach(f => {
              const { index, name } = f
              arithmeticObj[index] = name
            })
            break
          case 'relatedOperationList':
            let tmpRelatedOperationList = {}
            result.forEach(f => {
              const { type, option = [] } = f
              if (!tmpRelatedOperationList[type]) {
                tmpRelatedOperationList[type] = option.map(item => {
                  let { value1, name, value2 } = item
                  value1 = value1 === 'not contains' ? 'not_contains' : value1
                  return { index: value1, name, value2 }
                })
              }
            })
            result = tmpRelatedOperationList
            break
          case 'unitList':
            result.forEach(f => {
              const { index, name } = f
              unitListObj[index] = name
            })
            break
        }
        state = state.set(k, result)
        index++
      }
      fieldTypeList.forEach(filedType => {
        const { index = '', name = '' } = filedType
        if (!typeDict[index]) {
          typeDict[index] = name
          fieldListConvert[name] = []
        }
      })
      fieldList.forEach(filed => {
        const { fieldType = '', fieldDisplayName = '', fieldName = '', dataType = '' } = filed
        const type = typeDict[fieldType]
        if (fieldListConvert[type]) {
          fieldListConvert[type].push({
            type: fieldType,
            disName: fieldDisplayName,
            name: fieldName,
            dataType: dataType
          })
        }
      })
      const computeModeList = [{
        key: '3',
        value: '求和'
      }, {
        key: '4',
        value: '求平均'
      }, {
        key: '5',
        value: '个数'
      }, {
        key: '6',
        value: '次数'
      }]
      state = state.set('unitListObj', unitListObj)
      state = state.set('matchLevelObj', matchLevelObj)
      state = state.set('arithmeticObj', arithmeticObj)
      state = state.set('scenarioListObj', scenarioListObj)
      state = state.set('operatorStrObj', operatorStrObj)
      state = state.set('operatorStrBakObj', operatorStrBakObj)
      state = state.set('operatorStrKeyObj', operatorStrKeyObj)
      state = state.set('fieldListObj', fieldListObj)
      state = state.set('ComputeModeList', computeModeList)
      state = state.set('fieldListConvert', fieldListConvert)
      return state
    case GET_VERIFY_OBJECT_TYPE_LIST_SUCCESS:
      const verifyObjectTypeContent = payload.content || []
      return state.set('verifyObjectTypeList', verifyObjectTypeContent)
    case GET_OPERATION_TYPE_LIST_SUCCESS:
      const operationTypeContent = payload.content || []
      return state.set('operationTypeList', operationTypeContent)
    case GET_VERIFY_STATUS_LIST_SUCCESS:
      const verifyStatusList = payload.content || []
      return state.set('verifyStatusList', verifyStatusList)
    case GET_VERIFICATION_ALL_SELECT_SUCCESS:
      state = state.set('verifyObjectTypeList', payload[0].content || [])
      state = state.set('operationTypeList', payload[1].content || [])
      return state.set('verifyStatusList', payload[2].content || [])
    case GET_ALL_OPERATORS_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('allOperators', payload.content)
      }
      return state
    case GET_BUSINESS_LINE_SUCCESS:
      if (payload.actionStatus === SUCCESS) {
        state = state.set('businessLine', payload.content)
      }
      return state
    case GET_BUSINESS_LINE_ERROR:
    case GET_SCENE_LIST_ERROR:
    case SYS_FIELD_LIST_ERROR:
    case CUSTOM_FIELD_LIST_ERROR:
    case GET_DATA_TYPE_LIST_ERROR:
    case GET_FIELD_TYPE_LIST_ERROR:
    case SYS_FIELD_DELETE_ERROR:
    case SYS_FIELD_SAVE_ERROR:
    case SYS_FIELD_UPDATE_ERROR:
    case CUSTOM_FIELD_DELETE_ERROR:
    case CUSTOM_FIELD_SAVE_ERROR:
    case CUSTOM_FIELD_UPDATE_ERROR:
    case GET_RULE_SET_LIST_ERROR:
    case GET_RULE_SET_4_RULE_COPY_LIST_ERROR:
    case GET_RULE_LIST_ERROR:
    case RULE_DELETE_ERROR:
    case RULE_SAVE_ERROR:
    case RULE_UPDATE_ERROR:
    case RULE_COPY_ERROR:
    case RULE_ACTIVE_ERROR:
    case GET_APP_SELECT_ERROR:
    case GET_SCENE_SELECT_ERROR:
    case GET_MATCH_MODEL_SELECT_ERROR:
    case GET_CONDITION_TYPE_SELECT_ERROR:
    case GET_CONDITION_ALL_SELECT_ERROR:
    case GET_VERIFY_OBJECT_TYPE_LIST_ERROR:
    case GET_OPERATION_TYPE_LIST_ERROR:
    case GET_VERIFY_STATUS_LIST_ERROR:
    case GET_ALL_OPERATORS_ERROR:
    case GET_FIELD_LIST_NEW_ERROR:
    case GET_VERIFICATION_ALL_SELECT_ERROR:
      const { message = '' } = payload.content || {}
      return state.set('error', { id: new Date().getMilliseconds(), message: message || '操作失败，请稍后再试！' })
    default:
      return state
  }
}
