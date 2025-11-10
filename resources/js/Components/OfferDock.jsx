import React, { useEffect, useState } from "react";
import "../../css/OfferDock.css";

export default function OfferDock() {
    const PANEL_W = 280;
    const TAB_W = 40;
    const HIDE_X = -(PANEL_W - TAB_W);

    const [collapsed, setCollapsed] = useState(() => {
        try {
            const v = localStorage.getItem("offerDockCollapsed");
            return v === "1";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem("offerDockCollapsed", collapsed ? "1" : "0");
        } catch {}
    }, [collapsed]);

    useEffect(() => {
        try {
            if (!sessionStorage.getItem("odockOpenedOnce")) {
                setCollapsed(false);
                localStorage.setItem("offerDockCollapsed", "0");
                sessionStorage.setItem("odockOpenedOnce", "1");
            }
        } catch {}
    }, []);

    const openQuoteModal = () => {
        window.dispatchEvent(new Event("open-quote-modal"));
    };

    const cssVars = {
        ["--panel-w"]: `${PANEL_W}px`,
        ["--tab-w"]: `${TAB_W}px`,
        ["--panel-x"]: collapsed ? `${HIDE_X}px` : "0px",
    };

    return (
        <div
            className={`odock ${collapsed ? "odock--collapsed" : ""}`}
            style={cssVars}
        >
            <div className="odock__panel">
                <div className="odock__body">
                    <div className="odock__group">
                        <div className="odock__title">Angebot</div>
                        <div className="odock__sub">
                            Kostenlos &amp; unverbindlich
                        </div>
                    </div>

                    <button
                        type="button"
                        className="odock__cta bg-button"
                        onClick={openQuoteModal}
                    >
                        Anfordern
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="odock__tab bg-button"
                aria-label={
                    collapsed
                        ? "Angebot-Leiste öffnen"
                        : "Angebot-Leiste schließen"
                }
                onClick={() => setCollapsed((s) => !s)}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
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
