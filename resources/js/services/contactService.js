import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

function normalizeField(f, i) {
  return {
    id: f?.id ?? i,
    name: f?.name || f?.key || `field_${i}`,
    type: (f?.type || "text").toLowerCase(),
    label: f?.label || f?.name || `Field ${i + 1}`,
    required: !!f?.required,
    placeholder: f?.placeholder || "",
    options: Array.isArray(f?.options) ? f.options : [],
  };
}

function normalizeForm(it, i) {
  const fields = Array.isArray(it?.fields) ? it.fields.map(normalizeField) : [];
  return {
    id: it?.id ?? i,
    name: it?.name || it?.title || `Form #${(it?.id ?? i)}`,
    fields,
    raw: it,
  };
}

export async function getContactForms({ tenantId, locale } = {}) {
  const headers = {};
  if (tenantId) headers["X-Tenant-ID"] = String(tenantId);
  const params = {};
  if (locale) params.locale = String(locale);
  const res = await httpRequest("/v1/contact/forms", {
    method: "GET",
    headers,
    params,
    timeoutMs: remoteConfig.timeout,
    retries: 1,
  });
  const list = Array.isArray(res?.data) ? res.data : [];
  return list.map(normalizeForm);
}

export async function submitContactForm({ formId, payload, tenantId, locale }) {
  if (!formId) throw new Error("formId required");
  const headers = {};
  if (tenantId) headers["X-Tenant-ID"] = String(tenantId);
  const params = {};
  if (locale) params.locale = String(locale);
  const path = `/v1/contact/forms/${encodeURIComponent(formId)}/submit`;
  return httpRequest(path, {
    method: "POST",
    headers,
    params,
    data: payload,
    timeoutMs: remoteConfig.timeout,
    retries: 0,
  });
}


