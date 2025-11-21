export const normalizeLang = (code) =>
    String(code || "")
        .toLowerCase()
        .split("-")[0];

export function resolveMenuLabel(node, locale = "de", fallback = "en") {
    if (!node) return "";

    const lang = normalizeLang(locale);
    const fb = normalizeLang(fallback);
    const raw = node.raw || node;

    const translations =
        raw.translations ||
        node.translations ||
        [];

    const byLang = translations.find(
        (t) =>
            normalizeLang(t.language_code) === lang &&
            t.label &&
            t.label.trim() !== ""
    );
    if (byLang) return byLang.label;

    const byFallback = translations.find(
        (t) =>
            normalizeLang(t.language_code) === fb &&
            t.label &&
            t.label.trim() !== ""
    );
    if (byFallback) return byFallback.label;

    const any = translations.find((t) => t.label);
    if (any) return any.label;

    return raw.name || raw.label || "";
}


export function resolveMenuUrl(node, locale = "de") {
    if (!node) return "#";

    const lang = normalizeLang(locale);
    const raw = node.raw || node;

    const pageTranslations =
        raw.page_translations ||
        node.page_translations ||
        [];

    const found = pageTranslations.find(
        (p) =>
            normalizeLang(p.language_code) === lang &&
            p.slug &&
            p.slug.trim() !== ""
    );

    if (found) return "/" + found.slug;

    return raw.url || node.url || "#";
}
