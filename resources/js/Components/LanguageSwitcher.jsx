import React, { useEffect, useState, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import { router } from "@inertiajs/react";
import Loading from "./Common/Loading";

function normalizeLang(code) {
    return String(code || "")
        .toLowerCase()
        .split("-")[0];
}

const LanguageSwitcher = ({ currentLang, languages }) => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [switchDuration, setSwitchDuration] = useState(null);
    const ref = useRef(null);

    const normalizedCurrent = normalizeLang(currentLang);

    // 🔥 Dil değişimi tamamlandığında süreyi hesapla
    useEffect(() => {
        if (!isLoading) return;
        const ms = performance.now() - window.__langSwitchStart;
        setSwitchDuration(ms.toFixed(0));
        console.log(
            `%cDil değişimi tamamlandı: ${ms.toFixed(0)} ms`,
            "color:#4ade80;font-weight:bold"
        );
        setIsLoading(false);
    }, [currentLang]);

    // Dışarıya tıklayınca menü kapansın
    useEffect(() => {
        const closeDrop = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const escClose = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("click", closeDrop);
        window.addEventListener("keydown", escClose);
        return () => {
            document.removeEventListener("click", closeDrop);
            window.removeEventListener("keydown", escClose);
        };
    }, []);

    const handleLanguageChange = (codeNorm) => {
        if (codeNorm === normalizedCurrent) return;

        window.__langSwitchStart = performance.now();
        setIsLoading(true);
        setSwitchDuration(null);
        setOpen(false);

        const currentPath = window.location.pathname;

        router.visit(currentPath, {
            method: "get",
            preserveScroll: true,
            preserveState: true,
            replace: true,
            data: { lang: codeNorm },
            only: ["locale"], // ⚡ SADECE locale state güncellenir
            onFinish: () => {
                const ms = performance.now() - window.__langSwitchStart;
                console.log(
                    `%cDil API dönüş süresi: ${ms.toFixed(0)} ms`,
                    "color:#60a5fa;font-weight:bold"
                );
                setIsLoading(false);
            },
            onError: () => {
                console.error("⚠ Dil değişiminde hata oluştu!");
                setIsLoading(false);
            },
        });
    };

    if (!languages || languages.length <= 1) return null;

    const activeLang =
        languages.find((l) => normalizeLang(l.code) === normalizedCurrent) ||
        languages[0];

    return (
        <div className={`lang-switch ${open ? "is-open" : ""}`} ref={ref}>
            <button
                type="button"
                className="lang-switch__btn"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loading small />
                ) : (
                    <>
                        <span className="lang-switch__label">
                            {activeLang?.code?.toUpperCase() || "DE"}
                        </span>
                        <FaChevronDown className="lang-switch__chev" />
                    </>
                )}
            </button>

            {switchDuration && (
                <span className="lang-switch__duration">
                    {switchDuration} ms
                </span>
            )}

            {open && !isLoading && (
                <div className="lang-switch__popover" role="menu">
                    <ul className="lang-switch__list">
                        {languages.map((l) => {
                            const codeNorm = normalizeLang(l.code);
                            const isActive = codeNorm === normalizedCurrent;
                            return (
                                <li key={l.code}>
                                    <button
                                        type="button"
                                        className={`lang-switch__item ${
                                            isActive ? "is-active" : ""
                                        }`}
                                        onClick={() =>
                                            handleLanguageChange(codeNorm)
                                        }
                                        disabled={isLoading}
                                    >
                                        <span className="lang-switch__item-code">
                                            {codeNorm.toUpperCase()}
                                        </span>
                                        <span className="lang-switch__item-label">
                                            {l.label || codeNorm.toUpperCase()}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
