

export function normalizeCmsPage(cmsPage) {
    if (!cmsPage) return null;

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
