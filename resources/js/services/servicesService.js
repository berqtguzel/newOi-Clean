// resources/js/services/servicesService.js
import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

/* ------------------------------------------------------
 * IMAGE PICKER
 * ------------------------------------------------------ */
function pickImage(it) {
    return (
        it?.image_url ||
        it?.thumbnail ||
        it?.cover ||
        (typeof it?.image === "string" ? it.image : null) ||
        "/images/Wohnungsrenovierung.jpg"
    );
}

/* ------------------------------------------------------
 * NORMALIZE LANGUAGE CODE
 * ------------------------------------------------------ */
function normLang(code) {
    return String(code || "").toLowerCase().split("-")[0];
}

/* ------------------------------------------------------
 * NORMALIZE SERVICE
 * ------------------------------------------------------ */
export function normalizeService(it, i = 0, options = {}) {
    const { locale, fallbackLocale } = options;

    // 🔵 Eğer API translations göndermiyorsa → biz üretelim
    let translations = Array.isArray(it?.translations)
        ? it.translations
        : [];

    if (translations.length === 0) {
        // Tek dil verisini translations formatına oturt
        translations = [
            {
                language_code: normLang(locale || "en"),
                name: it?.name,
                title: it?.title,
                description: it?.description || it?.content,
                short_description: it?.short_description,
                content: it?.content,
            },
        ];
    }

    // 🔵 Aktif çeviriyi seç
    const want = normLang(locale);
    const fallback = normLang(fallbackLocale);

    let activeTr =
        translations.find((tr) => normLang(tr.language_code) === want) ||
        translations.find((tr) => normLang(tr.language_code) === fallback) ||
        translations[0] ||
        null;

    // 🔥 TERCİH SIRASI
    const translatedTitle =
        activeTr?.title ||
        activeTr?.name ||
        it?.title ||
        it?.name ||
        null;

    const translatedDescription =
        activeTr?.short_description ||
        activeTr?.description ||
        activeTr?.content ||
        it?.short_description ||
        it?.description ||
        it?.content ||
        "";

    return {
        id: it?.id ?? i,
        title: translatedTitle,
        name: translatedTitle,
        description: translatedDescription,
        shortDescription: activeTr?.short_description || "",

        slug: it?.slug || null,
        url: it?.url || null,
        image: pickImage(it),

        categoryId: it?.category_id ?? null,
        categoryName: it?.category_name || null,
        categorySlug: it?.category_slug || null,

        parentId: it?.parent_id ?? null,
        parentName: it?.parent_name ?? null,

        country: it?.country || null,
        city: it?.city || null,
        district: it?.district || null,
        latitude: it?.latitude ? Number(it.latitude) : null,
        longitude: it?.longitude ? Number(it.longitude) : null,

        hasMaps: !!it?.has_maps,
        maps: Array.isArray(it?.maps) ? it.maps : [],

        status: it?.status || null,
        order: typeof it?.order === "number" ? it.order : null,
        views: typeof it?.views === "number" ? it.views : null,

        // ⭐ Çeviri bilgileri
        translations,
        activeTranslation: activeTr,
        hasTranslations: translations.length > 0,

        raw: it,
    };
}

/* ------------------------------------------------------
 * FETCH SERVICES LIST
 * ------------------------------------------------------ */
export async function fetchServices({
    page = 1,
    perPage = 50,
    tenantId,
    locale,
    search,
    city,
    district,
    locationSlug,
    locationId,
} = {}) {
    const headers = {};
    if (tenantId) headers["X-Tenant-ID"] = String(tenantId);

    const params = { page, per_page: perPage };
    if (search) params.search = search;
    if (locale) params.locale = String(locale);
    if (city) params.city = city;
    if (district) params.district = district;
    if (locationSlug) params.location_slug = locationSlug;
    if (locationId) params.location_id = locationId;

    const res = await httpRequest("/v1/services", {
        method: "GET",
        headers,
        params,
        timeoutMs: remoteConfig.timeout,
        retries: 1,
    });

    const list = Array.isArray(res?.data) ? res.data : [];

    const languagesMeta = res?.meta?.languages || {};
    const currentLang = locale || languagesMeta.current || languagesMeta.default;
    const fallbackLang = languagesMeta.default || languagesMeta.current;

    const services = list.map((it, i) =>
        normalizeService(it, i, {
            locale: currentLang,
            fallbackLocale: fallbackLang,
        })
    );

    return {
        services,
        meta: res?.meta || {},
        pagination: res?.pagination || null,
    };
}

/* ------------------------------------------------------
 * BUILD SLUG FOR API REQUEST
 * ------------------------------------------------------ */
const SERVICE_PREFIXES = [
    "gebaudereinigung",
    "wohnungsrenovierung",
    "hotelreinigung",
];

function buildApiSlug(identifier) {
    const slugOriginal = String(identifier || "").trim();
    if (!slugOriginal) return slugOriginal;

    const slug = slugOriginal.toLowerCase();

    if (SERVICE_PREFIXES.includes(slug)) return slugOriginal;

    if (/^(gebaudereinigung|hotelreinigung|wohnungsrenovierung)-/.test(slug))
        return slugOriginal;

    return `gebaudereinigung-${slug}`;
}

/* ------------------------------------------------------
 * FETCH SINGLE SERVICE
 * ------------------------------------------------------ */
export async function fetchServiceBySlug(identifier, opts = {}) {
    const { tenantId, locale } = opts;

    const headers = {};
    if (tenantId) headers["X-Tenant-ID"] = String(tenantId);

    const params = {};
    if (locale) params.locale = String(locale);

    const apiSlug = buildApiSlug(identifier);

    try {
        const res = await httpRequest(
            `/v1/services/${encodeURIComponent(apiSlug)}`,
            {
                method: "GET",
                headers,
                params,
                timeoutMs: remoteConfig.timeout,
                retries: 1,
            }
        );

        const raw = res?.data || res;
        const languagesMeta =
            raw?._meta?.languages || res?.meta?.languages || {};

        const currentLang = locale || languagesMeta.current || languagesMeta.default;
        const fallbackLang = languagesMeta.default || languagesMeta.current;

        return {
            service: normalizeService(raw, 0, {
                locale: currentLang,
                fallbackLocale: fallbackLang,
            }),
            raw,
        };
    } catch (err) {
        if (err?.response?.status !== 404) throw err;

        const idStr = String(identifier || "").trim();
        const trySlugs = [apiSlug];

        if (idStr.includes("-")) {
            trySlugs.push(idStr);
            trySlugs.push(idStr.split("-")[0]);
        }

        for (const slug of trySlugs) {
            try {
                const r = await httpRequest(
                    `/v1/services/${encodeURIComponent(slug)}`,
                    { method: "GET", headers, params }
                );

                const raw = r?.data || r;
                const languagesMeta =
                    raw?._meta?.languages || r?.meta?.languages || {};

                const currentLang =
                    locale || languagesMeta.current || languagesMeta.default;
                const fallbackLang =
                    languagesMeta.default || languagesMeta.current;

                return {
                    service: normalizeService(raw, 0, {
                        locale: currentLang,
                        fallbackLocale: fallbackLang,
                    }),
                    raw,
                };
            } catch {}
        }

        throw err;
    }
}
