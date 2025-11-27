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

    const tenant =
        tenantId ||
        remoteConfig.tenant ||
        import.meta.env.VITE_TENANT ||
        "oi_cleande_690e161c3a1dd";

    const lang = normalizeLang(locale || remoteConfig.locale || "de");

    const specialIds = {
        "404": 31,
        "500": 32,
    };

    const realKey = specialIds[slug] || slug;

    let res;
    try {
        res = await axios.get(`${API_BASE}/pages/${realKey}`, {
            params: { tenant, lang },
            headers: {
                Accept: "application/json",
                "X-Tenant-ID": tenant,
            },
        });
    } catch (err) {
        console.error("❌ ERROR:", err?.response?.data || err);
        return { page: null };
    }

    const raw = res?.data?.data || {};
    const translations = Array.isArray(raw.translations)
        ? raw.translations
        : [];

    const tLang =
        translations.find(
            (t) => normalizeLang(t.language_code) === lang
        ) || {};

    return {
        page: {
            id: raw.id,
            slug: raw.slug,
            title: tLang.name || raw.name || "",
            content: tLang.content || raw.content || "",
            metaTitle: tLang.meta_title || raw.meta_title || "",
            metaDescription:
                tLang.meta_description || raw.meta_description || "",
            image: raw.image || null,
            translations,
            raw,
            _meta: raw._meta || {},
        },
    };
}
