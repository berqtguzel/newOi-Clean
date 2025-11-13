import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

export async function getAllSettings({ tenantId, locale } = {}) {
  const headers = {};
  if (tenantId) headers["X-Tenant-ID"] = String(tenantId);
  const params = {};
  if (locale) params.locale = String(locale);
  const res = await httpRequest("/v1/settings/all", {
    method: "GET",
    headers,
    params,
    timeoutMs: remoteConfig.timeout,
    retries: 1,
  });

  return res?.data || res || {};
}


