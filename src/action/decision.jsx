import { jFetch, cFetch } from '../common'
import { DMS_PREFIX } from '../common/constant'
import { GET_DECISION_SELECT } from '../common/decision_constant'
import { buildUrlParam } from '../util'

export function getDataTypeList(data) {
  return {
    promise: jFetch.post(`/${DMS_PREFIX}/common/dataTypeList.do`, {
      data
    })
  }
}

export function getDecisionIndicatorsList(data) {
  return jFetch.get(`/${DMS_PREFIX}/dti/getIndicatorList?${data}`)
}

export function getDecisionStrategyList(data) {
  console.log(data)
  return jFetch.get(`/${DMS_PREFIX}/decision-tree/list?${data}`)
}

export function delDecisionStrategyItem(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-tree/del`, {
    data
  })
}

export function addDecisionBasicInfo(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-tree/add`, {
    data
  })
}

export function updateDecisionBasicInfo(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-tree/update`, {
    data
  })
}

export function setDecisionActive(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-tree/activate`, {
    data
  })
}

export function onOfflineDecision(data) {
  return {
    promise: cFetch.post(`/${DMS_PREFIX}/decision-tree/onOffline`, {
      data
    })
  }
}

export function getTreeNodes(data) {
  return {
    promise: jFetch.post(`/${DMS_PREFIX}/decision-tree/get-nodes`, {
      data
    })
  }
}

export function verifyTree(data) {
  return {
    promise: jFetch.post(`/${DMS_PREFIX}/decision-tree/verify`, {
      data
    })
  }
}

export function getDecisionTreeNodes(id) {
  return jFetch.get(`/${DMS_PREFIX}/decision-tree/get?${buildUrlParam({ treeId: `${id}` })}`)
}

export function updateNodeInfo(data) {
  return cFetch.post(`/${DMS_PREFIX}/dtn/update`, {
    data
  })
}

export function deleteTreeNode(id) {
  return cFetch.post(`/${DMS_PREFIX}/dtn/delete?${buildUrlParam({ nodeId: `${id}` })}`)
}

export function getTreeNode(id) {
  return cFetch.get(`/${DMS_PREFIX}/dtn/detail?${buildUrlParam({ nodeId: `${id}` })}`)
}

export function addCondition(data) {
  return cFetch.post(`/${DMS_PREFIX}/dtc/add`, {
    data
  })
}

export function getIndicatorSelect({ businessLineId }) {
  return jFetch.get(`/${DMS_PREFIX}/dtn/indexList?businessLineId=${businessLineId}`)
}

export function getDecisionSelect() {
  const promises = [jFetch.post(`/${DMS_PREFIX}/common/riskPolicyList.do`), jFetch.get(`/${DMS_PREFIX}/common/decisionReasonList.do`)]
  return Promise.all(promises)
}

export function getEdgeSelect(data) {
  const promises = [cFetch.get(`/${DMS_PREFIX}/common/decisionTreeConditionGateList.do `)]
  return Promise.all(promises)
}

export function getEdgeInfo(id) {
  return cFetch.get(`/${DMS_PREFIX}/decision-tree/edge/?${buildUrlParam({ edgeId: `${id}` })}`)
}

export function addConditionList(data) {
  return cFetch.post(`/${DMS_PREFIX}/dtc/add/condition`, {
    data
  })
}

// 决策流接口(待对接)
export function getDecisionStrategyFlowList(data) {
  return jFetch.get(`/${DMS_PREFIX}/decision-stream?${data}`)
}

export function copyDecisionStrategyFlow(data) {
  return {
    promise: cFetch.post(`/${DMS_PREFIX}/decision-stream/copy`, {
      data
    })
  }
}

export function delDecisionStrategyFlowItem(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream/delete`, {
    data
  })
}

export function setDecisionFlowActive(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream/activate`, {
    data
  })
}

export function addDecisionFlowBasicInfo(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream/add`, {
    data
  })
}

export function updateDecisionFlowBasicInfo(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream/update`, {
    data
  })
}

export function setOnOffLine(data) {
  return jFetch.post(`/${DMS_PREFIX}/decision-stream/online-offline`, {
    data
  })
}

export function getDecisionFlowNodes(id) {
  return jFetch.get(`/${DMS_PREFIX}/decision-stream/get-decision-stream?${buildUrlParam({ id: `${id}` })}`)
}

export function addFlowNode(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream-node/add`, {
    data
  })
}

export function deleteFlowNode(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream-node/delete`, {
    data
  })
}

export function addFlowNodeLine(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream-edge/add`, {
    data
  })
}

export function deleteFlowNodeLine(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream-edge/delete`, {
    data
  })
}

export function updateFlowNodePosition(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream-node/update-position`, {
    data
  })
}

export function checkDecisionFlow(id) {
  return cFetch.get(`/${DMS_PREFIX}/decision-stream/check?id=${id}`)
}

export function getStreamNodeInfo(id) {
  return cFetch.get(`/${DMS_PREFIX}/decision-stream-node/${id}`)
}

export function updateDecisionMakingNode(data) {
  return cFetch.post(`/${DMS_PREFIX}/decision-stream-node/updateDecisionNode`, { data })
}

export function decisionStreamDependencies(data) {
  return cFetch.get(`/${DMS_PREFIX}/decision-stream/dependencies?${data}`)
}

export function dependenciesTree(data) {
  return cFetch.get(`/${DMS_PREFIX}/decision-tree/dependencies?${data}`)
}

export function getDecisionList() {
  return {
    type: GET_DECISION_SELECT,
    payload: {
      promise: cFetch.get(`/${DMS_PREFIX}/decision/list`)
    }
  }
}

export function copyDecisionStrategyTree(data) {
  return {
    promise: cFetch.post(`/${DMS_PREFIX}/decision-tree/copy`, {
      data
    })
  }
}
