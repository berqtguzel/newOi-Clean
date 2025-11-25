import axios from "axios";


const BASE = (import.meta?.env?.VITE_REMOTE_API_BASE || "https://omerdogan.de/api/v1").replace(/\/$/, "");
const TIMEOUT = Number(import.meta?.env?.VITE_REMOTE_TIMEOUT || 10000);
const TALENT_ID = import.meta?.env?.VITE_REMOTE_TALENT_ID;

export const http = axios.create({
  baseURL: BASE,
  timeout: TIMEOUT,
});


http.interceptors.request.use((config) => {


  config.headers = {
    Accept: "application/json",

    ...(import.meta.env.VITE_REMOTE_TALENT_ID ? { "X-Tenant-ID": import.meta.env.VITE_REMOTE_TALENT_ID } : {}),
    ...(config.data ? { "Content-Type": "application/json" } : {}),
    ...(config.headers || {}),
  };


  return config;
});

async function withRetry(doRequest, retries = 1, delayMs = 350) {
  try {
    return await doRequest();
  } catch (err) {
    const status = err?.response?.status;
    const retriable =
      !status || (status >= 500 && status <= 599) || err.code === "ECONNABORTED";
    if (retriable && retries > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
      return withRetry(doRequest, retries - 1, delayMs);
    }
    throw err;
  }
}

/**
 *
 * @param {string} path
 * @param {object} opts
 */
export function httpRequest(path, opts = {}) {
  const {
    method = "GET",
    params,
    data,
    headers,
    timeoutMs = TIMEOUT,
    retries = 1,
    signal,
  } = opts;


  const headersToSend = Object.assign({}, headers || {});
  try {
    const localeFromParams = params && params.locale ? String(params.locale) : null;
    if (localeFromParams) {
      const lang = localeFromParams.split("-")[0];
      headersToSend["Accept-Language"] = lang;
      headersToSend["X-Locale"] = lang;
    }
  } catch (e) {

  }

  return withRetry(
    () =>
      http.request({
        url: path,
        method,
        params,
        data,
        headers: headersToSend,
        timeout: timeoutMs,
        signal,
      }),
    retries
  ).then((r) => r.data);
}
