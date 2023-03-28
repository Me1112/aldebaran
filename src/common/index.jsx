
import JFetch from "./jfetch";

export const API_SITE_URL = `__SITE_URL__`;

export const jFetch = new JFetch({
  baseURI: API_SITE_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
  }
});

export const cFetch = new JFetch({
  baseURI: API_SITE_URL
});
