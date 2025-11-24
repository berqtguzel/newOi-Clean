import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../css/OfferDock.css";

export default function OfferDock() {
    const { t } = useTranslation();

    const PANEL_W = 280;
    const TAB_W = 40;
    const HIDE_X = -(PANEL_W - TAB_W);

    // 1. Başlangıç değeri her zaman false olsun (SSR uyumu için)
    const [collapsed, setCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // 2. Tarayıcı yüklendikten sonra localStorage'dan durumu oku
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

    const cssVars = {
        "--panel-w": `${PANEL_W}px`,
        "--tab-w": `${TAB_W}px`,
        "--panel-x": collapsed ? `${HIDE_X}px` : "0px",
    };

    const title = t("offerDock.title", "Teklif");
    const subtitle = t("offerDock.subtitle", "Ücretsiz & bağlayıcı değil");
    const buttonLabel = t("offerDock.button", "Talep et");

    const ariaOpen = t("offerDock.aria_open", "Teklif panelini aç");
    const ariaClose = t("offerDock.aria_close", "Teklif panelini kapat");

    return (
        <div
            className={`odock ${collapsed ? "odock--collapsed" : ""}`}
            style={cssVars}
        >
            <div className="odock__panel">
                <div className="odock__body">
                    <div className="odock__group">
                        <div className="odock__title">{title}</div>
                        <div className="odock__sub">{subtitle}</div>
                    </div>

                    <button
                        type="button"
                        className="odock__cta bg-button"
                        onClick={openQuoteModal}
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
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    {/* SVG yolu 'd' özelliğindeki mantık aynı kalıyor */}
                    <path
                        d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
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
