import { cFetch } from '../common'
import {
  DMS_PREFIX
} from '../common/constant'
import {
  GET_SCORE_LIST, DELETE_SCORE, PREVIEW_SCORE, SAVE_SCORE_INFO
} from '../common/scoreConstant'

export function getScoreList(query) {
  return async () => {
    return {
      type: GET_SCORE_LIST,
      promise: cFetch.get(`/${DMS_PREFIX}/rs/list?${query}`)
    }
  }
}

export function deleteScore(data) {
  return async () => {
    return {
      type: DELETE_SCORE,
      promise: cFetch.post(`/${DMS_PREFIX}/rs/delete`, {
        data
      })
    }
  }
}

export function activeScore(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/activate`, {
        data
      })
    }
  }
}

export function copyScore(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/copy`, {
        data
      })
    }
  }
}

export function previewScore(p) {
  return async () => {
    return {
      type: PREVIEW_SCORE,
      promise: cFetch.get(`/${DMS_PREFIX}/rs/preview?scoreId=${p}`)
    }
  }
}

export function saveScoreInfo(data) {
  return async () => {
    return {
      type: SAVE_SCORE_INFO,
      promise: cFetch.post(`/${DMS_PREFIX}/rs`, {
        data
      })
    }
  }
}

export function updateScoreInfo(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/update`, {
        data
      })
    }
  }
}

// 配置模型
export function addMainModule(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/mainModule`, { data })
    }
  }
}

export function getMainModule(scoreId) {
  return async () => {
    return {
      type: '',
      promise: cFetch.get(`/${DMS_PREFIX}/rs/mainModules?scoreId=${scoreId}`, {})
    }
  }
}

export function deleteMainModule(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/dataSet/delete`, { data })
    }
  }
}

export function updateMainModule(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/mainModule/update`, {
        data
      })
    }
  }
}

export function addTarget(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/scoreIndex`, {
        data
      })
    }
  }
}

export function updateTarget(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/scoreIndex/update`, {
        data
      })
    }
  }
}

export function getTarget(id) {
  return async () => {
    return {
      type: '',
      promise: cFetch.get(`/${DMS_PREFIX}/rs/scoreIndexes?id=${id}`, {})
    }
  }
}

export function getTargetFields(id = '') {
  return {
    promise: cFetch.get(`/${DMS_PREFIX}/rs/fields?mainModuleId=${id}`)
  }
}

export function getValue(id) {
  return async () => {
    return {
      type: '',
      promise: cFetch.get(`/${DMS_PREFIX}/rs/scoreValues?id=${id}`, {})
    }
  }
}

export function updateValue(data) {
  return async () => {
    return {
      type: '',
      promise: cFetch.post(`/${DMS_PREFIX}/rs/update/scoreValue`, {
        data
      })
    }
  }
}
