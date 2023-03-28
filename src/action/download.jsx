import { cFetch } from '../common'
import { DMS_PREFIX } from '../common/constant'

export function getDownloadRecords() {
  return cFetch.get(`/${DMS_PREFIX}/download/records`)
}
