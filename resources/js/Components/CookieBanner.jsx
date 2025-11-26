import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import { FaCookieBite, FaCheck, FaTimes } from "react-icons/fa";

import "../../css/CookieBanner.css";

const INITIAL_COOKIES = {
    necessary: { id: 1, required: true },
    analytics: { id: 2, required: false },
    marketing: { id: 3, required: false },
};

const CookieBanner = ({ forceVisible = false }) => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        const consent = Cookies.get("cookie_consent");

        if (!consent || forceVisible) {
            setTimeout(() => setIsVisible(true), 200);
        } else {
            try {
                setPreferences(JSON.parse(consent));
            } catch {}
        }
    }, [forceVisible]);

    const saveConsent = (prefs) => {
        Cookies.set("cookie_consent", JSON.stringify(prefs), {
            expires: 365,
            path: "/",
            sameSite: "Lax",
        });

        setIsVisible(false);

        window.dispatchEvent(new Event("cookie-saved"));
    };

    const handleAcceptAll = () => {
        const all = { necessary: true, analytics: true, marketing: true };
        setPreferences(all);
        saveConsent(all);
    };

    const handleRejectAll = () => {
        const onlyNecessary = {
            necessary: true,
            analytics: false,
            marketing: false,
        };
        setPreferences(onlyNecessary);
        saveConsent(onlyNecessary);
    };

    const handleSaveSelection = () => {
        saveConsent(preferences);
    };

    const togglePreference = (key) => {
        if (INITIAL_COOKIES[key].required) return;
        setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner-container">
            <div className="cookie-card">
                <div className="cookie-header">
                    <div className="cookie-icon-box">
                        <FaCookieBite />
                    </div>
                    <div className="cookie-title-area">
                        <h3>{t("cookies.title", "Çerez Tercihleri")}</h3>
                        <p className="cookie-text">
                            {t(
                                "cookies.message",
                                "Size daha iyi bir deneyim sunmak için çerezleri kullanıyoruz."
                            )}
                        </p>
                    </div>
                </div>

                {showDetails && (
                    <div className="cookie-details">
                        {Object.keys(INITIAL_COOKIES).map((key) => (
                            <div key={key} className="cookie-option">
                                <label
                                    className="cookie-option-label"
                                    htmlFor={`cookie-${key}`}
                                >
                                    <span className="cookie-opt-name">
                                        {t(
                                            `cookies.cat_${key}`,
                                            key.charAt(0).toUpperCase() +
                                                key.slice(1)
                                        )}
                                    </span>
                                </label>
                                <div className="cookie-switch">
                                    <input
                                        type="checkbox"
                                        id={`cookie-${key}`}
                                        checked={preferences[key]}
                                        disabled={INITIAL_COOKIES[key].required}
                                        onChange={() => togglePreference(key)}
                                    />
                                    <span className="cookie-slider"></span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="cookie-actions">
                    <div className="cookie-btn-group">
                        {showDetails ? (
                            <button
                                className="cookie-btn btn-secondary"
                                onClick={handleSaveSelection}
                            >
                                <FaCheck size={12} /> {t("cookies.save", "Kaydet")}
                            </button>
                        ) : (
                            <button
                                className="cookie-btn btn-secondary"
                                onClick={handleRejectAll}
                            >
                                <FaTimes size={12} /> {t("cookies.reject", "Reddet")}
                            </button>
                        )}

                        <button
                            className="cookie-btn btn-accept"
                            onClick={handleAcceptAll}
                        >
                            {t("cookies.accept_all", "Kabul Et")}
                        </button>
                    </div>

                    <button
                        className="btn-ghost"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        {showDetails
                            ? t("cookies.hide_details", "Gizle")
                            : t("cookies.settings", "Tercihler & Detaylar")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
