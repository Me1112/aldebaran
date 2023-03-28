import { jFetch, cFetch } from '../common'
import { DMS_PREFIX } from '../common/constant'
import {
  GET_BLACK_LIST,
  GET_BLACK_LIST_TYPE_LIST,
  BLACK_SAVE,
  BLACK_DELETE,
  BLACK_UPLOAD
} from '../common/black_constant'

export function getNameList(data) {
  return cFetch.get(`/${DMS_PREFIX}/blacklist/list?${data}`)
}

export function getNameSelect(data = '') {
  return cFetch.get(`/${DMS_PREFIX}/blacklist/all/list?${data}`)
}

export function deleteName(data) {
  return cFetch.post(`/${DMS_PREFIX}/blacklist/delete`, {
    data
  })
}

export function saveName(data) {
  return cFetch.post(`/${DMS_PREFIX}/blacklist/add`, {
    data
  })
}

export function updateName(data) {
  return cFetch.post(`/${DMS_PREFIX}/blacklist/update`, {
    data
  })
}

export function getNameDataList(data) {
  const { listData, blacklistId, pageNum, pageSize, state } = data
  return cFetch.get(`/${DMS_PREFIX}/blacklist/data/list?blacklistValue=${listData}&blacklistId=${blacklistId}&pageNum=${pageNum}&pageSize=${pageSize}&state=${state}`)
}

export function saveDataName(data) {
  return cFetch.post(`/${DMS_PREFIX}/blacklist/data/add`, {
    data
  })
}

export function deleteDataName(data) {
  return cFetch.post(`/${DMS_PREFIX}/blacklist/data/delete`, {
    data
  })
}

export function updateDataStatus(data) {
  return cFetch.post(`/${DMS_PREFIX}/blacklist/data/state`, {
    data
  })
}

export function uploadDataName(data) {
  return cFetch.post(`/${DMS_PREFIX}/blacklist/data/upload`, {
    data
  })
}

export function getNameDependencies(id) {
  return cFetch.get(`/${DMS_PREFIX}/blacklist/dependencies?id=${id}`)
}

export function getBlackList(data) {
  return {
    type: GET_BLACK_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/blacklist/blacklist/getBlackList.do`, {
        data
      })
    }
  }
}

export function getBlackListTypeList() {
  return {
    type: GET_BLACK_LIST_TYPE_LIST,
    payload: {
      promise: jFetch.post(`/${DMS_PREFIX}/blacklist/blacklistType/getBlackListTypeList.do`)
    }
  }
}

export function saveBlack(data) {
  return async () => {
    return {
      type: BLACK_SAVE,
      promise: jFetch.post(`/${DMS_PREFIX}/blacklist/blacklist/insert.do`, {
        data
      })
    }
  }
}

export function deleteBlack(data) {
  return async () => {
    return {
      type: BLACK_DELETE,
      promise: jFetch.post(`/${DMS_PREFIX}/blacklist/blacklist/delete.do`, {
        data
      })
    }
  }
}

export function uploadBlack(data) {
  return async () => {
    return {
      type: BLACK_UPLOAD,
      promise: cFetch.post(`/${DMS_PREFIX}/blacklist/blacklist/upload.do`, {
        data
      })
    }
  }
}
