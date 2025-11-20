import "../../css/header.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    FaChevronDown,
    FaChevronRight,
    FaPhoneAlt,
    FaBars,
    FaTimes,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import DecryptedText from "./ReactBits/Texts/DescryptedText";
import { useMenus } from "../hooks/useMenus";
import { useLanguages } from "../hooks/useLanguages";
import SafeHtml from "@/Components/Common/SafeHtml";

/* ============================== helpers ============================== */

function cx(...args) {
    return args.filter(Boolean).join(" ");
}

const BitsBackground = () => <div aria-hidden className="rbits-bg" />;

const getOffset = () => {
    const el = document.querySelector(".site-header");
    const h = el ? el.offsetHeight : 0;
    return Math.max(0, h - 4);
};

const smoothScrollTo = (hash) => {
    const id = hash.replace(/^#/, "");
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = getOffset();
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.pageYOffset - headerOffset;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `${location.pathname}#${id}`);
};

const isHashOnly = (url) => /^#/.test(url);

const splitPathHash = (url) => {
    const [path, hash] = url.split("#");
    return { path: path || "/", hash: hash ? `#${hash}` : "" };
};

const dedupeByKey = (items = [], keyA = "url", keyB = "name") => {
    const seen = new Set();
    return (items || []).filter((it) => {
        const k = (it?.[keyA] || it?.[keyB] || "").trim();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
    });
};

function pickOmrSite(websites = [], { host, talentId } = {}) {
    if (!Array.isArray(websites)) return null;

    const byHost =
        host &&
        websites.find((w) => {
            const domains = []
                .concat(w?.domains || [])
                .map((d) =>
                    String(d || "")
                        .toLowerCase()
                        .trim()
                )
                .filter(Boolean);
            return domains.includes(String(host).toLowerCase());
        });
    if (byHost) return byHost;

    if (talentId) {
        const byTalent = websites.find(
            (w) =>
                String(w?.talentId || w?.talent_id || "") === String(talentId)
        );
        if (byTalent) return byTalent;
    }
    return websites[0] || null;
}

const cleanUrl = (u) => String(u || "#").replace(/:\d+$/, "");

const normalizeLang = (code) =>
    String(code || "")
        .toLowerCase()
        .split("-")[0];

function resolveMenuLabel(node, locale = "de", fallback = "de") {
    if (!node) return "";

    const lang = normalizeLang(locale);
    const fb = normalizeLang(fallback);
    const raw = node.raw || node;

    const translations = Array.isArray(raw.translations)
        ? raw.translations
        : Array.isArray(node.translations)
        ? node.translations
        : [];

    const byLang = translations.find(
        (t) =>
            normalizeLang(t.language_code) === lang &&
            t.label &&
            String(t.label).trim() !== ""
    );
    if (byLang) return byLang.label;

    const byFallback = translations.find(
        (t) =>
            normalizeLang(t.language_code) === fb &&
            t.label &&
            String(t.label).trim() !== ""
    );
    if (byFallback) return byFallback.label;

    const firstAny = translations.find(
        (t) => t.label && String(t.label).trim() !== ""
    );
    if (firstAny) return firstAny.label;

    if (node.name && String(node.name).trim() !== "") return node.name;
    if (raw.name && String(raw.name).trim() !== "") return raw.name;

    if (node.label && String(node.label).trim() !== "") return node.label;

    return "";
}

function resolveMenuUrl(node, locale = "de") {
    if (!node) return "#";

    const lang = normalizeLang(locale);
    const raw = node.raw || node;

    const pageTranslations =
        (Array.isArray(node.page_translations) && node.page_translations.length
            ? node.page_translations
            : Array.isArray(raw.page_translations) &&
              raw.page_translations.length
            ? raw.page_translations
            : []) || [];

    const byLang = pageTranslations.find(
        (p) =>
            normalizeLang(p.language_code) === lang &&
            p.slug &&
            String(p.slug).trim() !== ""
    );
    if (byLang) {
        return cleanUrl(`/${byLang.slug}`);
    }

    return cleanUrl(node.url);
}

const LanguageSwitcher = ({ currentLang, languages, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const normalizedCurrent = normalizeLang(currentLang);

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("click", onClick);
        window.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("click", onClick);
            window.removeEventListener("keydown", onKey);
        };
    }, []);

    if (!languages || !languages.length) return null;

    const activeLang =
        languages.find((l) => normalizeLang(l.code) === normalizedCurrent) ||
        languages[0];

    return (
        <div className={cx("lang-switch", open && "is-open")} ref={ref}>
            <button
                type="button"
                className="lang-switch__btn"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                <span className="lang-switch__label">
                    {normalizeLang(activeLang.code).toUpperCase()}
                </span>
                <FaChevronDown
                    className="lang-switch__chev"
                    aria-hidden="true"
                />
            </button>

            {open && (
                <div className="lang-switch__popover" role="menu">
                    <ul className="lang-switch__list">
                        {languages.map((l) => {
                            const codeNorm = normalizeLang(l.code);
                            const isActive = codeNorm === normalizedCurrent;

                            return (
                                <li key={l.code}>
                                    <button
                                        type="button"
                                        className={cx(
                                            "lang-switch__item",
                                            isActive && "is-active"
                                        )}
                                        onClick={() => {
                                            onChange(codeNorm);
                                            setOpen(false);
                                        }}
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

const Header = ({ currentRoute, settings }) => {
    const { i18n, t } = useTranslation();

    const currentPath =
        typeof window !== "undefined"
            ? window.location.pathname.replace(/\/+$/, "")
            : "";

    const isPathActive = (urlOrList) => {
        const list = Array.isArray(urlOrList) ? urlOrList : [urlOrList];
        return list.some((u) => u && currentPath === u.replace(/\/+$/, ""));
    };

    const [isTopBarVisible, setIsTopBarVisible] = useState(true);
    const [openMenu, setOpenMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [mobileAccordions, setMobileAccordions] = useState({});
    const headerRef = useRef(null);

    const closeTimer = useRef(null);
    const subCloseTimer = useRef(null);
    const HOVER_INTENT = 160;

    const cancelClose = () => {
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
    };

    const cancelSubClose = () => {
        if (subCloseTimer.current) {
            clearTimeout(subCloseTimer.current);
            subCloseTimer.current = null;
        }
    };

    const openDrop = (key) => {
        cancelClose();
        setOpenDropdown(key);
    };

    const scheduleCloseDrop = () => {
        cancelClose();
        closeTimer.current = setTimeout(() => {
            setOpenDropdown(null);
            setOpenSubmenu(null);
        }, HOVER_INTENT);
    };

    const openSub = (key) => {
        cancelSubClose();
        setOpenSubmenu(key);
    };

    const scheduleCloseSub = () => {
        cancelSubClose();
        subCloseTimer.current = setTimeout(
            () => setOpenSubmenu(null),
            HOVER_INTENT
        );
    };

    useEffect(() => {
        const onDocClick = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setOpenDropdown(null);
                setOpenSubmenu(null);
                setOpenMenu(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                setOpenDropdown(null);
                setOpenSubmenu(null);
                setOpenMenu(false);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const toggleMobileAccordion = (key) =>
        setMobileAccordions((prev) => {
            const nextOpen = !prev[key];
            return nextOpen ? { [key]: true } : {};
        });

    const { props } = usePage();

    const initialLocale = normalizeLang(props?.locale || "de");
    const sharedLanguages = props?.languages || [];

    const omrWebsites = props?.global?.websites || [];
    const omrTalentId = props?.global?.talentId || "";

    const [currentHost, setCurrentHost] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentHost(window.location.hostname);
        }
    }, []);

    const site = useMemo(
        () =>
            pickOmrSite(omrWebsites, {
                host: currentHost,
                talentId: omrTalentId,
            }),
        [omrWebsites, omrTalentId, currentHost]
    );

    const siteName = settings?.branding?.site_name || site?.name || "O&I CLEAN";
    const sitePhone =
        settings?.contact?.phone ||
        site?.contact?.phone ||
        "+49 (0)36874 38 55 67";

    const topbarTagline =
        site?.content?.topbarTagline ||
        t("header.topbar_tagline", {
            defaultValue:
                "Sauberkeit, auf die Sie sich verlassen können — 24/7 Service",
        });

    const cta = {
        href:
            site?.cta?.href ||
            t("header.cta_href", { defaultValue: "/contact" }),
        label:
            site?.cta?.label ||
            t("header.cta_label", { defaultValue: "Termin vereinbaren" }),
    };

    const siteLogos = {
        light:
            settings?.branding?.logo_light ||
            settings?.branding?.logo_light_url ||
            settings?.branding?.logo ||
            settings?.branding?.logo_url ||
            settings?.general?.logo ||
            site?.branding?.logoLight ||
            "/images/logo/Logo.png",
        dark:
            settings?.branding?.logo_dark ||
            settings?.branding?.logo_dark_url ||
            settings?.branding?.logo ||
            settings?.branding?.logo_url ||
            settings?.general?.logo_dark ||
            site?.branding?.logoDark ||
            "/images/logo/darkLogo.png",
    };

    const { languages: fetchedLanguages } = useLanguages();

    const [currentLang, setCurrentLang] = useState(initialLocale || "de");

    useEffect(() => {
        if (!initialLocale) return;
        const normInit = normalizeLang(initialLocale);

        setCurrentLang((prev) => {
            const normPrev = normalizeLang(prev);
            if (normPrev === normInit) return prev;
            try {
                localStorage.setItem("locale", normInit);
            } catch {}
            return normInit;
        });

        try {
            if (normalizeLang(i18n.language) !== normInit) {
                i18n.changeLanguage(normInit);
            }
        } catch (e) {
            console.warn("i18n changeLanguage failed:", e);
        }
    }, [initialLocale, i18n]);

    const allLanguages = useMemo(() => {
        if (Array.isArray(sharedLanguages) && sharedLanguages.length) {
            return sharedLanguages.map((l) => {
                const code = normalizeLang(l.code || l.locale || "de");
                return {
                    code,
                    label:
                        l.label || l.name || (code ? code.toUpperCase() : "DE"),
                };
            });
        }

        if (Array.isArray(fetchedLanguages) && fetchedLanguages.length) {
            return fetchedLanguages.map((l) => {
                const code = normalizeLang(l.code);
                return {
                    code,
                    label: l.label || code.toUpperCase() || "DE",
                };
            });
        }

        return [
            { code: "de", label: "Deutsch" },
            { code: "en", label: "English" },
            { code: "tr", label: "Türkçe" },
        ];
    }, [sharedLanguages, fetchedLanguages]);

    const changeLanguage = (codeRaw) => {
        const code = normalizeLang(codeRaw);
        if (!code || normalizeLang(currentLang) === code) return;

        setCurrentLang(code);

        try {
            localStorage.setItem("locale", code);
        } catch {}

        try {
            if (normalizeLang(i18n.language) !== code) {
                i18n.changeLanguage(code);
            }
        } catch (e) {
            console.warn("i18n changeLanguage failed:", e);
        }

        window.dispatchEvent(
            new CustomEvent("language-changed", { detail: { locale: code } })
        );

        let targetUrl = `/lang/${code}`;

        try {
            if (typeof route === "function") {
                targetUrl = route("lang.switch", { locale: code });
            }
        } catch {}

        router.visit(targetUrl, {
            method: "get",
            preserveScroll: true,
            preserveState: false,
        });
    };

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    const {
        data: menusResponse,
        loading: menuLoading,
        error: menuError,
    } = useMenus({
        perPage: 100,
        tenantId,
    });

    const remoteNavItems = useMemo(() => {
        if (!menusResponse) return [];

        const rawMenusSource =
            Array.isArray(menusResponse?.data) || !menusResponse.data
                ? menusResponse.data || menusResponse
                : menusResponse;

        const rawMenus = Array.isArray(rawMenusSource)
            ? rawMenusSource
            : Array.isArray(rawMenusSource?.data)
            ? rawMenusSource.data
            : [];

        const headerMenu =
            rawMenus.find((m) => m.slug === "header") || rawMenus[0] || null;

        const items = Array.isArray(headerMenu?.items) ? headerMenu.items : [];

        const lang = currentLang || "de";

        const toDropdown = (children = []) =>
            (children || []).map((it, idx) => {
                const hasChildren =
                    Array.isArray(it.children) && it.children.length > 0;

                const label = resolveMenuLabel(it, lang, "de");
                const url = resolveMenuUrl(it, lang);

                if (!hasChildren) {
                    return {
                        name: label,
                        url,
                    };
                }

                return {
                    name: label,
                    submenuKey: `sub-${it.id || idx}`,
                    submenu: (it.children || []).map((c) => ({
                        name: resolveMenuLabel(c, lang, "de"),
                        url: resolveMenuUrl(c, lang),
                    })),
                };
            });

        return items.map((node, i) => {
            const routeKey = `menu-${node.id || i}`;
            const hasChildren =
                Array.isArray(node.children) && node.children.length > 0;

            const label = resolveMenuLabel(node, lang, "de");
            const url = resolveMenuUrl(node, lang);

            return {
                name: label,
                route: routeKey,
                url: url || "#",
                ...(hasChildren
                    ? {
                          dropdownKey: routeKey,
                          dropdown: toDropdown(node.children),
                      }
                    : {}),
                isActive: () =>
                    typeof window !== "undefined"
                        ? window.location.pathname.replace(/\/+$/, "") ===
                          url.replace(/\/+$/, "")
                        : false,
            };
        });
    }, [menusResponse, currentLang]);

    const navItems = useMemo(() => {
        if (remoteNavItems && remoteNavItems.length) {
            return remoteNavItems;
        }

        if (menuLoading) {
            return [];
        }

        const homeLabel = t("nav.home", "Startseite");

        return [
            {
                name: homeLabel,
                route: "home",
                url: "/",
                isActive: () =>
                    typeof window !== "undefined"
                        ? window.location.pathname.replace(/\/+$/, "") === "/"
                        : false,
            },
        ];
    }, [remoteNavItems, menuLoading, t]);

    const navigate =
        (url, close = false) =>
        (e) => {
            if (!url) return;
            if (isHashOnly(url)) {
                e.preventDefault();
                setOpenDropdown(null);
                setOpenSubmenu(null);
                if (close) setOpenMenu(false);
                smoothScrollTo(url);
                return;
            }
            if (/#/.test(url)) {
                e.preventDefault();
                const { path, hash } = splitPathHash(url);
                if (path.replace(/\/+$/, "") === currentPath) {
                    setOpenDropdown(null);
                    setOpenSubmenu(null);
                    if (close) setOpenMenu(false);
                    smoothScrollTo(hash);
                } else {
                    router.visit(path, {
                        preserveScroll: true,
                        onSuccess: () =>
                            requestAnimationFrame(() => smoothScrollTo(hash)),
                    });
                }
                return;
            }
            e.preventDefault();
            setOpenDropdown(null);
            setOpenSubmenu(null);
            if (close) setOpenMenu(false);
            router.visit(url);
        };

    /* ============================== render ============================== */

    const menuErrorText = menuError ? String(menuError) : "";

    return (
        <header ref={headerRef} className="site-header">
            <BitsBackground />

            {isTopBarVisible && (
                <div className="topbar">
                    <div className="container">
                        <div className="topbar__inner">
                            <div className="topbar__left">
                                <span className="topbar__phone">
                                    <FaPhoneAlt aria-hidden="true" />
                                    <a
                                        href={`tel:${sitePhone.replace(
                                            /\s+/g,
                                            ""
                                        )}`}
                                    >
                                        <DecryptedText
                                            text={sitePhone}
                                            animateOn="view"
                                            speed={100}
                                            revealDirection="center"
                                        />
                                    </a>
                                </span>
                                <span className="topbar__tagline">
                                    <div style={{ marginTop: 0 }}>
                                        <DecryptedText
                                            text={topbarTagline}
                                            animateOn="view"
                                            speed={100}
                                            revealDirection="center"
                                        />
                                    </div>
                                </span>
                            </div>
                            <div className="topbar__right">
                                <a
                                    href={cta.href}
                                    onClick={navigate(cta.href)}
                                    className="btn btn--ghost"
                                >
                                    <SafeHtml html={cta.label} as="span" />
                                </a>
                                <button
                                    className="btn btn--ghost btn--circle"
                                    aria-label={t(
                                        "header.hide_topbar",
                                        "Top-Leiste ausblenden"
                                    )}
                                    onClick={() => setIsTopBarVisible(false)}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="navwrap">
                <div className="container">
                    <div className="navwrap__inner">
                        <a
                            href="/"
                            onClick={navigate("/")}
                            className="brand"
                            aria-label={t("header.home_aria", "Startseite")}
                        >
                            <img
                                src={siteLogos.light}
                                alt={`${siteName} Logo`}
                                className="brand__logo brand__logo--light"
                            />
                            <img
                                src={siteLogos.dark}
                                alt={`${siteName} Logo (Dark)`}
                                className="brand__logo brand__logo--dark"
                            />
                        </a>

                        <nav
                            className="nav nav--desktop"
                            aria-label={t("header.main_nav", "Hauptnavigation")}
                        >
                            {menuLoading && (
                                <div className="nav__item">
                                    <span className="nav__link" />
                                </div>
                            )}
                            {menuErrorText && (
                                <div className="nav__item">
                                    <span className="nav__link">
                                        {menuErrorText}
                                    </span>
                                </div>
                            )}

                            {navItems.map((item) => {
                                const isActive =
                                    typeof item.isActive === "function"
                                        ? item.isActive()
                                        : currentRoute === item.route;
                                const hasDropdown =
                                    !!item.dropdown || !!item.mega;
                                const dropdownKey =
                                    item.dropdownKey || item.route;
                                const isOpen = openDropdown === dropdownKey;

                                return (
                                    <div
                                        key={item.route}
                                        className={cx(
                                            "nav__item",
                                            isActive && "is-active"
                                        )}
                                        onMouseEnter={() =>
                                            hasDropdown && openDrop(dropdownKey)
                                        }
                                        onMouseLeave={() =>
                                            hasDropdown && scheduleCloseDrop()
                                        }
                                    >
                                        <a
                                            href={item.url}
                                            className={cx(
                                                "nav__link",
                                                hasDropdown && "has-dropdown"
                                            )}
                                            aria-haspopup={
                                                hasDropdown || undefined
                                            }
                                            aria-expanded={
                                                hasDropdown ? isOpen : undefined
                                            }
                                            onFocus={() =>
                                                hasDropdown &&
                                                openDrop(dropdownKey)
                                            }
                                            onBlur={() =>
                                                hasDropdown &&
                                                scheduleCloseDrop()
                                            }
                                            onClick={navigate(item.url)}
                                        >
                                            <SafeHtml
                                                html={item.name}
                                                as="span"
                                                className="nav__label"
                                            />
                                            {hasDropdown && (
                                                <FaChevronDown
                                                    className="nav__chev"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </a>

                                        {hasDropdown && isOpen && (
                                            <div
                                                className={cx(
                                                    "dropdown",
                                                    item.mega &&
                                                        "dropdown--mega"
                                                )}
                                                role="menu"
                                                onMouseEnter={cancelClose}
                                                onMouseLeave={scheduleCloseDrop}
                                            >
                                                {item.mega ? (
                                                    <div className="mega" />
                                                ) : (
                                                    <div className="menu">
                                                        {dedupeByKey(
                                                            item.dropdown
                                                        ).map(
                                                            (subItem, idx) => {
                                                                const hasSub =
                                                                    !!subItem.submenu;
                                                                const subKey =
                                                                    subItem.submenuKey ||
                                                                    `${dropdownKey}-sub-${idx}`;
                                                                const subOpen =
                                                                    openSubmenu ===
                                                                    subKey;

                                                                return (
                                                                    <div
                                                                        className="menu__item"
                                                                        key={
                                                                            idx
                                                                        }
                                                                        onMouseEnter={() =>
                                                                            hasSub &&
                                                                            openSub(
                                                                                subKey
                                                                            )
                                                                        }
                                                                        onMouseLeave={() =>
                                                                            hasSub &&
                                                                            scheduleCloseSub()
                                                                        }
                                                                    >
                                                                        {hasSub ? (
                                                                            <button
                                                                                type="button"
                                                                                className="menu__link has-sub"
                                                                                aria-haspopup
                                                                                onClick={() =>
                                                                                    openSub(
                                                                                        subKey
                                                                                    )
                                                                                }
                                                                                aria-expanded={
                                                                                    subOpen
                                                                                }
                                                                            >
                                                                                <SafeHtml
                                                                                    html={
                                                                                        subItem.name
                                                                                    }
                                                                                    as="span"
                                                                                    className="menu__label"
                                                                                />
                                                                                <FaChevronRight
                                                                                    className="menu__chev"
                                                                                    aria-hidden
                                                                                />
                                                                            </button>
                                                                        ) : (
                                                                            <a
                                                                                href={
                                                                                    subItem.url
                                                                                }
                                                                                className={cx(
                                                                                    "menu__link",
                                                                                    isPathActive(
                                                                                        subItem.url
                                                                                    ) &&
                                                                                        "is-active"
                                                                                )}
                                                                                onClick={navigate(
                                                                                    subItem.url
                                                                                )}
                                                                            >
                                                                                <SafeHtml
                                                                                    html={
                                                                                        subItem.name
                                                                                    }
                                                                                    as="span"
                                                                                />
                                                                            </a>
                                                                        )}

                                                                        {hasSub &&
                                                                            subOpen && (
                                                                                <div
                                                                                    className="submenu"
                                                                                    role="menu"
                                                                                    onMouseEnter={
                                                                                        cancelSubClose
                                                                                    }
                                                                                    onMouseLeave={
                                                                                        scheduleCloseSub
                                                                                    }
                                                                                >
                                                                                    {subItem.submenu.map(
                                                                                        (
                                                                                            inner,
                                                                                            j
                                                                                        ) => (
                                                                                            <a
                                                                                                key={
                                                                                                    j
                                                                                                }
                                                                                                href={
                                                                                                    inner.url
                                                                                                }
                                                                                                className={cx(
                                                                                                    "submenu__link",
                                                                                                    isPathActive(
                                                                                                        inner.url
                                                                                                    ) &&
                                                                                                        "is-active"
                                                                                                )}
                                                                                                onClick={navigate(
                                                                                                    inner.url
                                                                                                )}
                                                                                            >
                                                                                                <SafeHtml
                                                                                                    html={
                                                                                                        inner.name
                                                                                                    }
                                                                                                    as="span"
                                                                                                />
                                                                                            </a>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>

                        <div className="nav__cta">
                            <ThemeToggle />

                            <LanguageSwitcher
                                currentLang={currentLang}
                                languages={allLanguages}
                                onChange={changeLanguage}
                            />

                            <a
                                href="/impressum"
                                onClick={navigate("/impressum")}
                                className="btn bg-button btn--primary ml-4"
                            >
                                {t("header.impressum", "Impressum")}
                            </a>
                        </div>

                        <button
                            className="hamburger"
                            onClick={() => setOpenMenu(true)}
                            aria-label={t("header.menu_open", "Menü öffnen")}
                        >
                            <FaBars size={22} />
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={cx("drawer", openMenu && "is-open")}
                aria-hidden={!openMenu}
            >
                <div
                    className="drawer__backdrop"
                    onClick={() => setOpenMenu(false)}
                />
                <aside className="drawer__panel" role="dialog" aria-modal>
                    <div className="drawer__head">
                        <a
                            href="/"
                            className="brand brand--sm"
                            onClick={navigate("/", true)}
                        >
                            <img
                                src={siteLogos.light}
                                alt={`${siteName} Logo`}
                                className="brand__logo brand__logo--light"
                            />
                            <img
                                src={siteLogos.dark}
                                alt={`${siteName} Logo (Dark)`}
                                className="brand__logo brand__logo--dark"
                            />
                        </a>
                        <button
                            className="btn btn--icon"
                            onClick={() => setOpenMenu(false)}
                            aria-label={t(
                                "header.menu_close",
                                "Menü schließen"
                            )}
                        >
                            <FaTimes size={20} />
                        </button>
                    </div>

                    <div className="drawer__body">
                        {navItems.map((item, idx) => {
                            const key = item.dropdownKey || item.route;
                            const hasDropdown = !!item.dropdown || !!item.mega;
                            const expanded = !!mobileAccordions[key];

                            return (
                                <div key={idx} className="acc">
                                    <button
                                        className="acc__toggle"
                                        aria-expanded={expanded}
                                        onClick={(e) => {
                                            if (hasDropdown) {
                                                toggleMobileAccordion(key);
                                            } else {
                                                navigate(item.url, true)(e);
                                            }
                                        }}
                                    >
                                        <span className="acc__left">
                                            <span className="acc__icon">
                                                {item.icon}
                                            </span>
                                            <SafeHtml
                                                html={item.name}
                                                as="span"
                                            />
                                        </span>
                                        {hasDropdown && (
                                            <FaChevronDown
                                                className={cx(
                                                    "acc__chev",
                                                    expanded && "rot"
                                                )}
                                                aria-hidden
                                            />
                                        )}
                                    </button>

                                    {hasDropdown && (
                                        <div
                                            className={cx(
                                                "acc__content",
                                                expanded && "open"
                                            )}
                                        >
                                            <div className="acc__menu">
                                                {dedupeByKey(item.dropdown).map(
                                                    (subItem, i) => (
                                                        <div
                                                            key={i}
                                                            className="acc__item"
                                                        >
                                                            {subItem.submenu ? (
                                                                <details className="acc__details">
                                                                    <summary className="acc__summary">
                                                                        <SafeHtml
                                                                            html={
                                                                                subItem.name
                                                                            }
                                                                            as="span"
                                                                        />
                                                                    </summary>
                                                                    <div className="acc__submenu">
                                                                        {subItem.submenu.map(
                                                                            (
                                                                                inner,
                                                                                j
                                                                            ) => (
                                                                                <a
                                                                                    key={
                                                                                        j
                                                                                    }
                                                                                    href={
                                                                                        inner.url
                                                                                    }
                                                                                    className="acc__link"
                                                                                    onClick={(
                                                                                        e
                                                                                    ) =>
                                                                                        navigate(
                                                                                            inner.url,
                                                                                            true
                                                                                        )(
                                                                                            e
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <SafeHtml
                                                                                        html={
                                                                                            inner.name
                                                                                        }
                                                                                        as="span"
                                                                                    />
                                                                                </a>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </details>
                                                            ) : (
                                                                <a
                                                                    href={
                                                                        subItem.url
                                                                    }
                                                                    className="acc__link"
                                                                    onClick={(
                                                                        e
                                                                    ) =>
                                                                        navigate(
                                                                            subItem.url,
                                                                            true
                                                                        )(e)
                                                                    }
                                                                >
                                                                    <SafeHtml
                                                                        html={
                                                                            subItem.name
                                                                        }
                                                                        as="span"
                                                                    />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="drawer__theme-toggle">
                            <ThemeToggle />
                        </div>

                        <div className="drawer__lang">
                            <span className="drawer__lang-label">
                                {t("header.language", "Sprache")}
                            </span>
                            <div className="drawer__lang-buttons">
                                {allLanguages.map((l) => (
                                    <button
                                        key={l.code}
                                        type="button"
                                        className={cx(
                                            "btn btn--ghost",
                                            normalizeLang(l.code) ===
                                                normalizeLang(currentLang) &&
                                                "is-active"
                                        )}
                                        onClick={() => changeLanguage(l.code)}
                                    >
                                        {l.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </header>
    );
};

export default Header;
