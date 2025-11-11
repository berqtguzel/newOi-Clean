import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

function normalizeLanguages(res) {
  const arr = Array.isArray(res?.data?.languages) ? res.data.languages : [];
  const def = res?.data?.default || {};
  const languages = arr.map((l) => ({
    code: l?.locale || l?.code || "de",
    label: l?.name || (l?.locale || "de").toUpperCase(),
    isDefault: !!l?.is_default || l?.locale === def?.locale,
    raw: l,
  }));
  const defaultCode =
    languages.find((l) => l.isDefault)?.code ||
    def?.locale ||
    (languages[0]?.code || "de");
  return { languages, defaultCode };
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


