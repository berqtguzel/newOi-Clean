import axios from "axios";
import remoteConfig from "./remoteConfig";

function normalizeLang(code) {
    return String(code || "de").toLowerCase().split("-")[0];
}


const API_BASE =
    remoteConfig.baseUrl ||
    remoteConfig.apiBaseUrl ||
    remoteConfig.apiUrl ||
    "/api/v1";

export async function fetchPageBySlug(slug, { tenantId, locale } = {}) {
    if (!slug) throw new Error("slug is required");

    const tenant = tenantId || remoteConfig.tenant;
    const lang = normalizeLang(locale || remoteConfig.locale || "de");

    const res = await axios.get(`${API_BASE}/pages/${slug}`, {
        params: {
            tenant,
            lang,
        },
    });

    const raw = res?.data?.data || res?.data || {};
    const translations = Array.isArray(raw.translations)
        ? raw.translations
        : [];

    const tLang =
        translations.find(
            (t) => normalizeLang(t.language_code) === lang
        ) || {};

    const title = tLang.name || raw.name || "";
    const content = tLang.content || raw.content || "";
    const metaTitle = tLang.meta_title || raw.meta_title || "";
    const metaDescription =
        tLang.meta_description || raw.meta_description || "";

    const page = {
        id: raw.id,
        slug: raw.slug,
        title,
        content,
        image: raw.image || null,
        metaTitle,
        metaDescription,
        raw,
        translations,
        _meta: raw._meta || res?.data?._meta || {},
    };

    return { page };
}
