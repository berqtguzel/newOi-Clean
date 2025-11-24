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

// --- Form Gönderme (POST) - Form ID 1 İçin Hazır ---
export async function submitContactForm({ formId, payload, tenantId, locale }) {
  // Form ID gelmezse hata verelim (veya varsayılan 1 yapabiliriz ama componentten gelmesi daha sağlıklı)
  if (!formId) throw new Error("formId required");

  const headers = {
      "Content-Type": "application/json", // <--- 422 Hatası Çözümü
      "Accept": "application/json",
  };

  if (tenantId) headers["X-Tenant-ID"] = String(tenantId);

  const params = {};
  if (locale) params.locale = String(locale);

  // URL Yapısı: /api/v1/contact/forms/1/submit
  const path = `/v1/contact/forms/${formId}/submit`;

  return httpRequest(path, {
    method: "POST",
    headers,
    params,
    data: payload, // Payload JSON olarak gider
    timeoutMs: remoteConfig.timeout,
    retries: 0,
  });
}
