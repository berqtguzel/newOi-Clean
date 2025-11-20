import axios from "axios";

// 1. .env dosyasından verileri çekiyoruz
const BASE = (import.meta?.env?.VITE_REMOTE_API_BASE || "https://omerdogan.de/api/v1").replace(/\/$/, "");
const TIMEOUT = Number(import.meta?.env?.VITE_REMOTE_TIMEOUT || 10000);
const TALENT_ID = import.meta?.env?.VITE_REMOTE_TALENT_ID; // <-- Bunu ekledik

export const http = axios.create({
  baseURL: BASE,
  timeout: TIMEOUT,
});

// 2. Her isteğe otomatik olarak Tenant ID ekliyoruz
http.interceptors.request.use((config) => {
  // URL'yi ve Header'ı konsola basalım ki ne gittiğini görelim
  console.log("İstek Atılıyor ->", config.baseURL + config.url);
  
  config.headers = {
    Accept: "application/json",
    // ID varsa ekle, yoksa boş geç
    ...(import.meta.env.VITE_REMOTE_TALENT_ID ? { "X-Tenant-ID": import.meta.env.VITE_REMOTE_TALENT_ID } : {}),
    ...(config.data ? { "Content-Type": "application/json" } : {}),
    ...(config.headers || {}),
  };
  
  console.log("Giden Headerlar ->", config.headers);
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
console.log("API URL:", import.meta.env.VITE_REMOTE_API_BASE);
console.log("TENANT ID:", import.meta.env.VITE_REMOTE_TALENT_ID);