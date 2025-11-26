const API_BASE_URL = "https://omerdogan.de/api/v1/widgets";

const fetchData = async (endpoint, tenant, locale = "de") => {
    if (!tenant) throw new Error("Tenant parametresi eksik!");

    const finalLocale = locale?.toLowerCase() || "de";

    const params = new URLSearchParams({
        tenant,
        locale: finalLocale,
    });

    const url = `${API_BASE_URL}${endpoint}?${params.toString()}`;

    console.log("🌍 API Request:", url);

    const res = await fetch(url);
    const json = await res.json();

    console.log("📦 API Response:", json);

    return json.data || [];
};


// 🔥 Parametre zorunlu
export const getWhatsappWidget = (tenant, locale) =>
    fetchData("/whatsapp", tenant, locale);

export const getRatingsWidget = (tenant, locale) =>
    fetchData("/ratings", tenant, locale);

export const getServiceHighlightsWidget = (tenant, locale) =>
    fetchData("/service-highlights", tenant, locale);

// 🔥 Tüm widgetlar
export const getAllWidgets = async (tenant, locale) => {
    try {
        const [whatsapp, ratings, highlights] = await Promise.all([
            getWhatsappWidget(tenant, locale),
            getRatingsWidget(tenant, locale),
            getServiceHighlightsWidget(tenant, locale),
        ]);

        return {
            whatsapp,
            ratings,
            highlights,
        };
    } catch (error) {
        console.error("❌ Tüm widget'lar çekilirken hata:", error);
        throw error;
    }
};
