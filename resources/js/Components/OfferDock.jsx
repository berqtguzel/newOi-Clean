import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../css/OfferDock.css";

// Panel boyutları
const PANEL_W = 280;
const TAB_W = 40;
const HIDE_X = -(PANEL_W - TAB_W);

export default function OfferDock() {
    const { t } = useTranslation();

    // 1. Hidrasyon Uyumlu State'ler: Varsayılan değerler sunucu ve istemcide aynı olmalıdır.
    const [collapsed, setCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // 2. Tarayıcı yüklendikten sonra (SADECE CLIENT) localStorage'dan durumu oku
    useEffect(() => {
        setIsMounted(true);
        try {
            const v = localStorage.getItem("offerDockCollapsed");

            // Eğer daha önce kapatılmışsa (v === "1"), state'i güncelle
            if (v === "1") {
                setCollapsed(true);
            }

            // İlk ziyaret kontrolü (Otomatik açılma)
            if (!sessionStorage.getItem("odockOpenedOnce")) {
                setCollapsed(false);
                localStorage.setItem("offerDockCollapsed", "0");
                sessionStorage.setItem("odockOpenedOnce", "1");
            }
        } catch {}
    }, []);

    // 3. State değişince localStorage'ı güncelle (Sadece mounted olduktan sonra)
    useEffect(() => {
        if (!isMounted) return;
        try {
            localStorage.setItem("offerDockCollapsed", collapsed ? "1" : "0");
        } catch {}
    }, [collapsed, isMounted]);

    const openQuoteModal = () => {
        window.dispatchEvent(new Event("open-quote-modal"));
    };

    // Dinamik CSS değişkenleri
    const cssVars = {
        "--panel-w": `${PANEL_W}px`,
        "--tab-w": `${TAB_W}px`,
        // collapsed state'i mounted olduktan sonra çalışır
        "--panel-x": isMounted && collapsed ? `${HIDE_X}px` : "0px",
    };

    // Çeviri metinleri (Hidrasyon sorununu gidermek için burada tutulur)
    const title = t("offerDock.title", "Teklif");
    const subtitle = t("offerDock.subtitle", "Ücretsiz & bağlayıcı değil");
    const buttonLabel = t("offerDock.button", "Talep et");

    const ariaOpen = t("offerDock.aria_open", "Teklif panelini aç");
    const ariaClose = t("offerDock.aria_close", "Teklif panelini kapat");

    // SVG için kapalı/açık yol mantığı
    const svgPath = collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6";

    // Eğer bileşen henüz mount edilmediyse (SSR sırasında), minimum DOM çıktısı ver.
    if (!isMounted) {
        return (
            <div
                className={`odock`}
                style={{
                    "--panel-w": `${PANEL_W}px`,
                    "--tab-w": `${TAB_W}px`,
                    "--panel-x": "0px",
                }}
                // Dinamik CSS olduğu için hidrasyon uyarısını yutuyoruz
                suppressHydrationWarning={true}
            >
                {/* Sunucu/SSR için sabitlenmiş, basit çıktı */}
                <div className="odock__panel">
                    <div className="odock__body">
                        <div className="odock__group">
                            <div
                                className="odock__title"
                                suppressHydrationWarning={true}
                            >
                                {title}
                            </div>
                            <div
                                className="odock__sub"
                                suppressHydrationWarning={true}
                            >
                                {subtitle}
                            </div>
                        </div>
                        {/* 🚨 DÜZELTME: disabled prop'una açık değer atandı */}
                        <button
                            type="button"
                            className="odock__cta bg-button"
                            disabled={true}
                            suppressHydrationWarning={true}
                        >
                            {buttonLabel}
                        </button>
                    </div>
                </div>
                {/* 🚨 DÜZELTME: disabled prop'una açık değer atandı */}
                <button
                    type="button"
                    className="odock__tab bg-button"
                    aria-label={ariaClose}
                    disabled={true}
                    suppressHydrationWarning={true}
                >
                    {/* 🚨 DÜZELTME: aria-hidden="true" eklendi */}
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            d="M15 6l-6 6 6 6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        );
    }

    return (
        <div
            className={`odock ${collapsed ? "odock--collapsed" : ""}`}
            style={cssVars}
            // Style object dinamik olduğu için hidrasyon uyarısını yutuyoruz.
            suppressHydrationWarning={true}
        >
            <div className="odock__panel">
                <div className="odock__body">
                    <div className="odock__group">
                        <div
                            className="odock__title"
                            suppressHydrationWarning={true}
                        >
                            {title}
                        </div>
                        <div
                            className="odock__sub"
                            suppressHydrationWarning={true}
                        >
                            {subtitle}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="odock__cta bg-button"
                        onClick={openQuoteModal}
                        suppressHydrationWarning={true}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="odock__tab bg-button"
                aria-label={collapsed ? ariaOpen : ariaClose}
                onClick={() => setCollapsed((s) => !s)}
                suppressHydrationWarning={true}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true" // Bu kısım zaten doğruydu
                >
                    {/* SVG yolu collapsed state'e göre değişir */}
                    <path
                        d={svgPath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
