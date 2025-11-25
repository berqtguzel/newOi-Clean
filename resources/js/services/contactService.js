import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

// --- Helper Fonksiyonlar (Aynen Kalsın) ---
function normalizeField(f, index) {
  const name = f?.name || f?.key || f?.label || `field_${index}`;
  return {
    id: f?.id ?? index,
    name,
    type: (f?.type || "text").toLowerCase(),
    label: f?.label || f?.name || `Field ${index + 1}`,
    required: !!f?.required,
    placeholder: f?.placeholder || "",
    options: Array.isArray(f?.options) ? f.options : [],
  };
}

function normalizeForm(rawForm, index) {
  const fields = Array.isArray(rawForm?.fields) ? rawForm.fields.map(normalizeField) : [];
  return {
    id: rawForm?.id ?? index,
    name: rawForm?.name || rawForm?.title || `Form #${rawForm?.id ?? index}`,
    fields,
    isActive: !!rawForm?.is_active,
    raw: rawForm,
  };
}

// --- Formları Çekme (GET) ---
export async function getContactForms({ tenantId, locale } = {}) {
  const headers = { "Accept": "application/json" };
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

  const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
  };

  if (tenantId) headers["X-Tenant-ID"] = String(tenantId);

  const params = {};
  if (locale) params.locale = String(locale);


  const path = `/v1/contact/forms/${formId}/submit`;

  return httpRequest(path, {
    method: "POST",
    headers,
    params,
    data: payload,
    timeoutMs: remoteConfig.timeout,
    retries: 0,
  });
}
