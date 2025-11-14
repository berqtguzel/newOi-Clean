import axios from "axios";

const BASE = (import.meta?.env?.VITE_REMOTE_API_BASE || "https://omerdogan.de/api").replace(/\/$/, "");
const TIMEOUT = Number(import.meta?.env?.VITE_REMOTE_TIMEOUT || 10000);


export const http = axios.create({
  baseURL: BASE,
  timeout: TIMEOUT,

});

http.interceptors.request.use((config) => {
  config.headers = {
    Accept: "application/json",
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

  return withRetry(
    () =>
      http.request({
        url: path,
        method,
        params,
        data,
        headers,
        timeout: timeoutMs,
        signal,
      }),
    retries
  ).then((r) => r.data);
}
