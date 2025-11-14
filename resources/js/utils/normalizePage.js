

export function normalizeCmsPage(cmsPage) {
    if (!cmsPage) return null;

    // API response’unda hangi field’lar var bilmiyorum;
    // aşağıyı kendi response’una göre ayarlarsın.
    // Örneğin:
    // cmsPage.title
    // cmsPage.subtitle
    // cmsPage.image
    // cmsPage.content (html gövde)
    // cmsPage.blocks vs.

    return {
        title: cmsPage.title || "",
        subtitle: cmsPage.subtitle || "",
        hero: {
            image: cmsPage.image || "/images/template.jpg",
            alt: cmsPage.title || "",
        },
        sections: [
            {
                heading: cmsPage.title || "",
                body:
                    cmsPage.content ||
                    cmsPage.body ||
                    cmsPage.description ||
                    "",
            },
        ],
    };
}
