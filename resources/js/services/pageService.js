// resources/js/services/pageService.js
import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

function pickTranslation(it, locale) {
    if (!Array.isArray(it?.translations)) return null;

    const lang = locale || remoteConfig.locale || "de";

    return (
        it.translations.find((t) => t.language_code === lang) ||
        it.translations.find((t) => t.language_code === it?._meta?.current_language) ||
        it.translations[0] ||
        null
    );
}

function normalizePage(it, locale) {
    if (!it) return null;

    const tr = pickTranslation(it, locale);

    // Başlık
    const title =
        tr?.name ||
        it.name ||
        it.title ||
        "";

    // İçerik (dashboarddaki Content alanı)
    const content =
        tr?.content ||
        it.content ||
        it.body ||
        it.description ||
        "";

    return {
        id: it.id,
        slug: it.slug,
        title,
        content,
        metaTitle: it.meta_title || "",
        metaDescription: it.meta_description || "",
        image: it.image || null,
        raw: it,
    };
}

/**
 * /api/v1/pages/{id|slug}
 */
export async function fetchPageBySlug(slug, { tenantId, locale } = {}) {
    if (!slug) throw new Error("slug is required");

    const headers = {};
    if (tenantId) headers["X-Tenant-ID"] = String(tenantId);

    const lang = locale || remoteConfig.locale || "de";

    const res = await httpRequest(`/v1/pages/${slug}`, {
        method: "GET",
        headers,
        params: { locale: lang },
        timeoutMs: remoteConfig.timeout,
        retries: 1,
    });

    const raw = res?.data || res;
    const page = normalizePage(raw, lang);

    return { page };
}
