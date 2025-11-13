import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

function normalizeLanguages(res) {
  let rawLanguages = [];
  let defaultCode = null;

  // 1) /global/settings/languages beklenen klasik yapı:
  // { data: { languages: [...], default: {...} } }
  if (Array.isArray(res?.data?.languages)) {
    rawLanguages = res.data.languages;
    defaultCode =
      res?.data?.default?.locale ||
      res?.data?.default?.code ||
      null;
  }

  // 2) Düz dizi: { languages: [...] }
  if (!rawLanguages.length && Array.isArray(res?.languages)) {
    rawLanguages = res.languages;
  }

  // 3) Düz dizi: { data: [ { locale: 'de', ...}, ... ] }
  if (!rawLanguages.length && Array.isArray(res?.data)) {
    rawLanguages = res.data;
  }

  // 4) Sadece string liste: _meta.available_languages veya meta.languages.available
  // Örnek: ["de", "en", "tr"]
  if (
    !rawLanguages.length &&
    Array.isArray(res?._meta?.available_languages)
  ) {
    rawLanguages = res._meta.available_languages.map((code) => ({
      locale: code,
      code,
      name: code.toUpperCase(),
    }));
    defaultCode =
      res?._meta?.default_language ||
      res?._meta?.current_language ||
      defaultCode;
  }

  if (
    !rawLanguages.length &&
    Array.isArray(res?.meta?.languages?.available)
  ) {
    rawLanguages = res.meta.languages.available.map((code) => ({
      locale: code,
      code,
      name: code.toUpperCase(),
    }));
    defaultCode =
      res?.meta?.languages?.default ||
      res?.meta?.languages?.current ||
      defaultCode;
  }

  // Son güvenlik: hâlâ boşsa DE / EN / TR fallback
  if (!rawLanguages.length) {
    rawLanguages = [
      { locale: "de", code: "de", name: "DE", is_default: true },
      { locale: "en", code: "en", name: "EN" },
      { locale: "tr", code: "tr", name: "TR" },
    ];
    defaultCode = defaultCode || "de";
  }

  // Normalize edilmiş dizi
  const languages = rawLanguages.map((l) => {
    const code = l?.locale || l?.code || "de";
    const isDefault =
      !!l?.is_default ||
      !!l?.default ||
      code === defaultCode;

    return {
      code,
      label: l?.name || code.toUpperCase(),
      isDefault,
      raw: l,
    };
  });

  // Default code son hâli
  const finalDefaultCode =
    languages.find((l) => l.isDefault)?.code ||
    defaultCode ||
    (languages[0]?.code || "de");

  return { languages, defaultCode: finalDefaultCode };
}

export async function getLanguages() {
  const path = "/global/settings/languages";

  const res = await httpRequest(path, {
    method: "GET",
    headers: { Accept: "application/json" },
    timeoutMs: remoteConfig.timeout,
    retries: 1,
  });

  return normalizeLanguages(res);
}
