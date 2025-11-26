// resources/js/services/servicesService.js
import { httpRequest } from "../lib/http";
import { remoteConfig } from "./remoteConfig";

function pickImage(it) {
    return (
        it?.image_url ||
        it?.thumbnail ||
        it?.cover ||
        (typeof it?.image === "string" ? it.image : null) ||
        "/images/Wohnungsrenovierung.jpg"
    );
}

function normLang(code) {
    return String(code || "").toLowerCase().split("-")[0];
}

export function normalizeService(it, i = 0, options = {}) {
    const { locale, fallbackLocale } = options;
    let translations = Array.isArray(it?.translations) ? it.translations : [];

    if (translations.length === 0) {
        translations = [
            {
                language_code: normLang(locale || "de"),
                name: it?.name,
                title: it?.title,
                description: it?.description || it?.content,
                short_description: it?.short_description,
                content: it?.content,
            },
        ];
    }

    const want = normLang(locale);
    const fallback = normLang(fallbackLocale);

    let activeTr =
        translations.find((tr) => normLang(tr.language_code) === want) ||
        translations.find((tr) => normLang(tr.language_code) === fallback) ||
        translations[0];

    return {
        id: it?.id ?? i,
        title: activeTr?.title || activeTr?.name || it?.title || it?.name,
        name: activeTr?.title || activeTr?.name,
        description:
            activeTr?.short_description ||
            activeTr?.description ||
            activeTr?.content ||
            "",
        shortDescription: activeTr?.short_description || "",
        slug: it?.slug || null,
        url: it?.url || null,
        image: pickImage(it),
        categoryId: it?.category_id
            ? Number(it.category_id)
            : it?.category?.id
              ? Number(it.category.id)
              : null,
        categoryName: it?.category_name || it?.category?.name,
        categorySlug: it?.category_slug || it?.category?.slug,
        city: it?.city || null,
        latitude: it?.latitude ? Number(it.latitude) : null,
        longitude: it?.longitude ? Number(it.longitude) : null,
        hasMaps: !!it?.has_maps,
        maps: Array.isArray(it?.maps) ? it.maps : [],
        raw: it,
    };
}

export async function fetchServices(options = {}) {
    const {
        page = 1,
        perPage = 200,
        tenantId,
        locale,
        search,
        city,
        district,
        locationSlug,
        locationId,
        categoryId,
    } = options;

    const headers = {};
    if (tenantId) headers["X-Tenant-ID"] = String(tenantId);

    const params = { page, per_page: perPage };
    if (search) params.search = search;
    if (locale) params.locale = String(locale);
    if (city) params.city = city;
    if (district) params.district = district;
    if (locationSlug) params.location_slug = locationSlug;
    if (locationId) params.location_id = locationId;
    if (categoryId != null) params.category_id = Number(categoryId);

    const res = await httpRequest("/v1/services", {
        method: "GET",
        headers,
        params,
        timeoutMs: remoteConfig.timeout,
        retries: 1,
    });

    const list = Array.isArray(res?.data) ? res.data : [];
    const meta = res?.meta || {};
    const languagesMeta = meta.languages || {};

    const services = list.map((it, i) =>
        normalizeService(it, i, {
            locale: locale || languagesMeta.current || languagesMeta.default,
            fallbackLocale: languagesMeta.default || languagesMeta.current,
        })
    );

    return { services, meta: meta || {}, pagination: res?.pagination || null };
}

export async function fetchAllServices(options = {}) {
    let all = [];
    let page = 1;
    const perPage = options.perPage || 200;
    let lastMeta = {};
    let lastPagination = null;

    while (true) {
        const { services, meta, pagination } = await fetchServices({
            ...options,
            page,
            perPage,
        });

        all = all.concat(services);
        lastMeta = meta;
        lastPagination = pagination;

        if (!pagination || pagination.current_page >= pagination.last_page) {
            break;
        }

        page++;
    }

    return { services: all, meta: lastMeta, pagination: lastPagination };
}

/* ------------------------------------------------------
 * YENİ - Slug hiçbir değişikliğe uğramaz!
 * ------------------------------------------------------ */
function buildApiSlug(identifier) {
    return String(identifier || "").trim().toLowerCase();
}

export async function fetchServiceBySlug(slug, opts = {}) {
    const { tenantId, locale } = opts;

    const headers = {};
    if (tenantId) headers["X-Tenant-ID"] = String(tenantId);

    const params = {};
    if (locale) params.locale = String(locale);

    const apiSlug = buildApiSlug(slug);

    const res = await httpRequest(`/v1/services/${apiSlug}`, {
        method: "GET",
        headers,
        params,
    });

    const raw = res?.data || res;
    return {
        service: normalizeService(raw, 0, {
            locale,
            fallbackLocale: locale,
        }),
        raw,
    };
}

export async function fetchServiceByIdOrSlug(identifier, opts = {}) {
    return fetchServiceBySlug(identifier, opts);
}
