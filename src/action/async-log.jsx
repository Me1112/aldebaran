import { jFetch } from "../common";
import { DMS_PREFIX } from "../common/constant";
import { buildUrlParamOnlyCheckNullOrUnder } from "../util";
export function getLogList(data) {
  return jFetch.get(
    `/${DMS_PREFIX}/case/trace/page?${buildUrlParamOnlyCheckNullOrUnder(data)}`
  );
}
