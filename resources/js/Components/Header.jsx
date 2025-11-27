import "../../css/header.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    FaChevronDown,
    FaChevronRight,
    FaPhoneAlt,
    FaBars,
    FaTimes,
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaTwitter,
    FaYoutube,
    FaTiktok,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";
import DecryptedText from "./ReactBits/Texts/DescryptedText";
import { useMenus } from "../hooks/useMenus";
import { useSettings } from "@/hooks/useSettings";
import { useGlobalWebsites } from "@/hooks/useGlobal";
import SafeHtml from "@/Components/Common/SafeHtml";
import { getSocialSettings } from "@/services/settingsService";
import Cookies from "js-cookie";

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
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) {
        setTimeout(() => smoothScrollTo(hash), 120);
        return;
    }
    const headerOffset = getOffset();
    const rect = el.getBoundingClientRect();
    const y = rect.top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `${location.pathname}#${id}`);
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
                String(w?.talentId || w?.tenant_id || "") === String(talentId)
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

    if (!languages || languages.length <= 1) return null;

    const activeLang =
        languages.find((l) => normalizeLang(l.code) === normalizedCurrent) ||
        languages[0];

    return (
        <div className={cx("lang-switch", open && "is-open")} ref={ref}>
                       {" "}
            <button
                type="button"
                className="lang-switch__btn"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                               {" "}
                <span className="lang-switch__label">
                                       {" "}
                    {normalizeLang(activeLang?.code || "DE").toUpperCase()}     
                             {" "}
                </span>
                               {" "}
                <FaChevronDown
                    className="lang-switch__chev"
                    aria-hidden="true"
                />
                           {" "}
            </button>
                       {" "}
            {open && (
                <div className="lang-switch__popover" role="menu">
                                       {" "}
                    <ul className="lang-switch__list">
                                               {" "}
                        {languages.map((l) => {
                            const codeNorm = normalizeLang(l.code);
                            const isActive = codeNorm === normalizedCurrent;
                            return (
                                <li key={l.code}>
                                                                       {" "}
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
                                                                               {" "}
                                        <span className="lang-switch__item-code">
                                                                               
                                                    {codeNorm.toUpperCase()}   
                                                                               {" "}
                                        </span>
                                                                               {" "}
                                        <span className="lang-switch__item-label">
                                                                               
                                                   {" "}
                                            {l.label || codeNorm.toUpperCase()} 
                                                                               
                                             {" "}
                                        </span>
                                                                           {" "}
                                    </button>
                                                                   {" "}
                                </li>
                            );
                        })}
                                           {" "}
                    </ul>
                                   {" "}
                </div>
            )}
                   {" "}
        </div>
    );
};

const Header = ({ currentRoute, settings: propSettings }) => {
    const { i18n, t } = useTranslation();
    const { props } = usePage(); // 🔥 HYDRATION FIX – sadece client’ta true oluyor

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []); // 1. Mevcut Host ve Tenant Bilgilerini Al

    const [currentHost, setCurrentHost] = useState("");
    useEffect(() => {
        if (typeof window !== "undefined") {
            setCurrentHost(window.location.hostname);
        }
    }, []);

    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";
    const initialLocale = normalizeLang(props?.locale || "de");
    const omrTalentId = props?.global?.talentId || ""; // 2. Global Siteleri Çek

    const { websites: globalWebsites } = useGlobalWebsites(); // 3. Şu anki siteyi bul

    const currentSite = useMemo(() => {
        const sites =
            props?.global?.websites?.length > 0
                ? props.global.websites
                : globalWebsites;

        return pickOmrSite(sites, {
            host: currentHost,
            talentId: tenantId || omrTalentId,
        });
    }, [
        props?.global?.websites,
        globalWebsites,
        currentHost,
        tenantId,
        omrTalentId,
    ]); // 4. Ayarları Çek

    const { data: apiSettings, loading: settingsLoading } = useSettings(); // Tüm ayarları birleştir

    const settings = useMemo(() => {
        return { ...propSettings, ...apiSettings };
    }, [propSettings, apiSettings]); // İletişim bilgisi

    const contactInfo = useMemo(() => {
        const contactInfos =
            settings?.contact_infos || settings?.contact?.contact_infos || [];

        if (Array.isArray(contactInfos) && contactInfos.length > 0) {
            return contactInfos.find((c) => c.is_primary) || contactInfos[0];
        }
        return settings?.contact || {};
    }, [settings]);

    const siteName =
        settings?.branding?.site_name ||
        settings?.site_name ||
        currentSite?.name ||
        "O&I CLEAN";

    const sitePhone =
        contactInfo.phone ||
        contactInfo.mobile ||
        settings?.contact?.phone ||
        settings?.phone ||
        currentSite?.contact?.phone ||
        "+49 (0)36874 38 55 67"; // 🔥 ÖNEMLİ: tagline artık sadece backend + sabit fallback

    const topbarTagline =
        currentSite?.content?.topbarTagline ||
        settings?.branding?.topbar_tagline ||
        settings?.general?.topbar_tagline ||
        "Sauberkeit, auf die Sie sich verlassen können — 24/7 Service"; // ==================================================================== // 💡 CTA HATA DÜZELTME BAŞLANGICI: Dili baz alarak URL oluşturuluyor // ====================================================================

    const ctaPathFromSettings = currentSite?.cta?.href || settings?.cta?.href;

    const normalizedLocale = normalizeLang(initialLocale);
    let defaultFallbackHref = "/kontakt"; // Varsayılan: Almanca için

    if (normalizedLocale === "en") {
        defaultFallbackHref = "/contact"; // İngilizce için
    } else if (normalizedLocale === "tr") {
        defaultFallbackHref = "/iletisim"; // Türkçe için
    } // Diğer diller de (fr, es, vb.) buraya eklenebilir.
    const ctaHref = ctaPathFromSettings || defaultFallbackHref; // CTA objesini yeni oluşturulan dinamik URL ile güncelle

    const cta = {
        href: ctaHref,
        label:
            currentSite?.cta?.label ||
            settings?.cta?.label ||
            "Termin vereinbaren", // Label için i18n kullanmak daha iyidir, ancak mevcut yapıyı koruyorum.
    }; // ==================================================================== // 💡 CTA HATA DÜZELTME SONU // ==================================================================== // Logolar - HYDRATION FIX: Server ve client'ta aynı değerleri kullan // isMounted kontrolü ile client-side'da güncelleme yapılır
    const siteLogos = useMemo(() => {
        const getUrl = (src) =>
            src?.url || (typeof src === "string" ? src : null); // Her zaman aynı fallback değerlerini kullan (server ve client'ta aynı)

        const defaultLight = "/images/logo/Logo.png";
        const defaultDark = "/images/logo/darkLogo.png"; // Server-side render için: Her zaman fallback kullan // Client-side'da isMounted olduktan sonra settings kullanılır

        if (!isMounted || !settings || settingsLoading) {
            return {
                light: defaultLight,
                dark: defaultDark,
            };
        }

        const lightUrl =
            getUrl(settings?.logo) ||
            getUrl(settings?.data?.logo) ||
            getUrl(settings?.branding?.logo) ||
            getUrl(settings?.general?.logo) ||
            defaultLight;

        const darkUrl = // API'den gelen dark_logo (top-level)
            getUrl(settings?.dark_logo) || // Bazı yerlerde logo_dark adıyla gelebilir
            getUrl(settings?.logo_dark) || // API response data içinde olabilir
            getUrl(settings?.data?.dark_logo) ||
            getUrl(settings?.data?.logo_dark) || // Eski / farklı config yapıları
            getUrl(settings?.branding?.dark_logo) ||
            getUrl(settings?.branding?.logo_dark) ||
            getUrl(settings?.general?.dark_logo) ||
            getUrl(settings?.general?.logo_dark) || // Hiçbiri yoksa light logoyu kullan
            lightUrl ||
            defaultDark;

        return { light: lightUrl, dark: darkUrl };
    }, [settings, isMounted, settingsLoading]);

    const [currentLang, setCurrentLang] = useState(initialLocale || "de"); // i18n başlangıç dilini backend ile senkron tut

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
        } catch (e) {}
    }, [initialLocale, i18n]);

    const allLanguages = useMemo(() => {
        let source = [];

        if (
            currentSite &&
            currentSite.languages &&
            currentSite.languages.length > 0
        ) {
            source = currentSite.languages;
        } else if (props?.languages && props.languages.length > 0) {
            source = props.languages;
        } else {
            source = [
                { locale: "de", name: "Deutsch" },
                { locale: "en", name: "English" },
                { locale: "tr", name: "Türkçe" },
            ];
        }

        return source.map((l) => {
            const code = normalizeLang(l.code || l.language_code || l.locale);
            return {
                code,
                label: l.name || l.label || code.toUpperCase(),
            };
        });
    }, [currentSite, props?.languages]);

    const changeLanguage = (codeRaw) => {
        const code = normalizeLang(codeRaw);
        if (!code || normalizeLang(currentLang) === code) return;

        setCurrentLang(code);
        try {
            localStorage.setItem("locale", code);
        } catch {}
        Cookies.set("locale", code, {
            expires: 365,
            path: "/",
            sameSite: "Lax",
        });

        try {
            if (normalizeLang(i18n.language) !== code)
                i18n.changeLanguage(code);
        } catch (e) {}

        window.dispatchEvent(
            new CustomEvent("language-changed", { detail: { locale: code } })
        );

        let targetUrl = `/lang/${code}`;
        try {
            if (typeof route === "function")
                targetUrl = route("lang.switch", { locale: code });
        } catch {}

        router.visit(targetUrl, {
            method: "get",
            preserveScroll: true,
            preserveState: false,
        });
    }; // --- SOSYAL MEDYA ---

    const [socialLinks, setSocialLinks] = useState(null);
    useEffect(() => {
        const fetchSocials = async () => {
            try {
                const data = await getSocialSettings({
                    tenantId,
                    locale: initialLocale,
                });
                setSocialLinks(data);
            } catch (error) {}
        };
        fetchSocials();
    }, [tenantId, initialLocale]);

    const socialMapping = [
        { key: "facebook_url", icon: <FaFacebook />, label: "Facebook" },
        { key: "instagram_url", icon: <FaInstagram />, label: "Instagram" },
        { key: "twitter_url", icon: <FaTwitter />, label: "Twitter" },
        { key: "linkedin_url", icon: <FaLinkedin />, label: "LinkedIn" },
        { key: "youtube_url", icon: <FaYoutube />, label: "Youtube" },
        { key: "tiktok_url", icon: <FaTiktok />, label: "TikTok" },
    ]; // --- MENU ---

    const {
        data: menusResponse,
        loading: menuLoading,
        error: menuError,
    } = useMenus({ perPage: 100, tenantId });

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
                if (!hasChildren) return { name: label, url };
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
        if (remoteNavItems && remoteNavItems.length) return remoteNavItems;
        if (menuLoading) return []; // HYDRATION FIX: Server-side'da sabit değer kullan
        const homeLabel = isMounted
            ? t("nav.home", "Startseite")
            : "Startseite";
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
    }, [remoteNavItems, menuLoading, t, isMounted]);

    const currentPath =
        typeof window !== "undefined"
            ? window.location.pathname.replace(/\/+$/, "")
            : "";
    const isPathActive = (urlOrList) => {
        const list = Array.isArray(urlOrList) ? urlOrList : [urlOrList];
        return list.some((u) => u && currentPath === u.replace(/\/+$/, ""));
    };

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

    const navigate =
        (url, close = false) =>
        (e) => {
            if (!url) return;
            const raw = String(url).trim();
            if (raw.startsWith("#")) {
                e.preventDefault();
                smoothScrollTo(raw);
                if (close) setOpenMenu(false);
                return;
            }
            if (raw.includes("#")) {
                e.preventDefault();
                const [path, hashOnly] = raw.split("#");
                const hash = `#${hashOnly}`;
                const current = window.location.pathname.replace(/\/+$/, "");
                const target = path.replace(/\/+$/, "");
                if (current === target) {
                    smoothScrollTo(hash);
                    if (close) setOpenMenu(false);
                    return;
                }
                router.visit(path, {
                    preserveScroll: true,
                    onSuccess: () =>
                        requestAnimationFrame(() => smoothScrollTo(hash)),
                });
                if (close) setOpenMenu(false);
                return;
            }
            e.preventDefault();
            router.visit(raw);
            if (close) setOpenMenu(false);
        };
    window.addEventListener("scroll", () => {
        const header = document.querySelector("header");
        header.classList.toggle("shadow-md", window.scrollY > 5);
    });

    const menuErrorText = menuError ? String(menuError) : "";

    return (
        <header ref={headerRef} class="fixed top-0 left-0 w-full z-50">
                        <BitsBackground />         
            <div className="topbar">
                               {" "}
                <div className="container">
                                       {" "}
                    <div className="topbar__inner">
                                               {" "}
                        <div className="topbar__left">
                                                       {" "}
                            <span className="topbar__phone">
                                                               {" "}
                                <FaPhoneAlt aria-hidden="true" />               
                                               {" "}
                                {isMounted ? (
                                    <a
                                        href={`tel:${sitePhone.replace(
                                            /\s+/g,
                                            ""
                                        )}`}
                                    >
                                                                               {" "}
                                        <DecryptedText
                                            text={sitePhone}
                                            animateOn="view"
                                            speed={100}
                                            revealDirection="center"
                                            key={currentLang}
                                        />
                                                                           {" "}
                                    </a>
                                ) : (
                                    <a
                                        href={`tel:${sitePhone.replace(
                                            /\s+/g,
                                            ""
                                        )}`}
                                    >
                                                                               {" "}
                                        {sitePhone}                             
                                             {" "}
                                    </a>
                                )}
                                                           {" "}
                            </span>
                                                       {" "}
                            <span className="topbar__tagline">
                                                               {" "}
                                <div style={{ marginTop: 0 }}>
                                                                       {" "}
                                    {isMounted ? (
                                        <DecryptedText
                                            text={topbarTagline}
                                            animateOn="view"
                                            speed={100}
                                            revealDirection="center"
                                            key={currentLang}
                                        />
                                    ) : (
                                        <span>{topbarTagline}</span>
                                    )}
                                                                   {" "}
                                </div>
                                                           {" "}
                            </span>
                                                   {" "}
                        </div>
                                               {" "}
                        <div
                            className="topbar__right"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                            }}
                        >
                                                       {" "}
                            {socialLinks && (
                                <div
                                    className="social-icons"
                                    style={{ display: "flex", gap: "10px" }}
                                >
                                                                       {" "}
                                    {socialMapping.map((item) => {
                                        const link = socialLinks[item.key];
                                        if (link && link.trim() !== "") {
                                            return (
                                                <a
                                                    key={item.key}
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    aria-label={item.label}
                                                    style={{
                                                        color: "inherit",
                                                        fontSize: "1.1em",
                                                        display: "flex",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                                               
                                                                           {" "}
                                                    {item.icon}                 
                                                                               
                                                     {" "}
                                                </a>
                                            );
                                        }
                                        return null;
                                    })}
                                                                   {" "}
                                </div>
                            )}
                            {/* 🎯 HATA DÜZELTME: href="/kontakt" yerine cta.href kullanılıyor. */}
                                                       {" "}
                            <a
                                href={cta.href}
                                onClick={navigate(cta.href)}
                                className="btn btn--ghost"
                            >
                                                               {" "}
                                <SafeHtml html={cta.label} as="span" />         
                                                 {" "}
                            </a>
                                                   {" "}
                        </div>
                                           {" "}
                    </div>
                                   {" "}
                </div>
                           {" "}
            </div>
                       {" "}
            <div className="navwrap">
                               {" "}
                <div className="container">
                                       {" "}
                    <div className="navwrap__inner">
                                               {" "}
                        <a
                            href="/"
                            onClick={navigate("/")}
                            className="brand"
                            aria-label={
                                isMounted
                                    ? t("header.home_aria", "Startseite")
                                    : "Startseite"
                            }
                        >
                                                       {" "}
                            {settingsLoading && !siteLogos.light ? (
                                <div className="w-32 h-10 bg-gray-200 animate-pulse rounded" />
                            ) : (
                                <>
                                                                       {" "}
                                    <img
                                        src={siteLogos.light}
                                        alt={`${siteName} Logo`}
                                        className="brand__logo brand__logo--light"
                                    />
                                                                       {" "}
                                    <img
                                        src={siteLogos.dark}
                                        alt={`${siteName} Logo (Dark)`}
                                        className="brand__logo brand__logo--dark"
                                    />
                                                                   {" "}
                                </>
                            )}
                                                   {" "}
                        </a>
                                               {" "}
                        <nav
                            className="nav nav--desktop"
                            aria-label={
                                isMounted
                                    ? t("header.main_nav", "Hauptnavigation")
                                    : "Hauptnavigation"
                            }
                        >
                                                       {" "}
                            {menuLoading && (
                                <div className="nav__item">
                                                                       {" "}
                                    <span className="nav__link" />             
                                                     {" "}
                                </div>
                            )}
                                                       {" "}
                            {menuErrorText && (
                                <div className="nav__item">
                                                                       {" "}
                                    <span className="nav__link">
                                                                               {" "}
                                        {menuErrorText}                         
                                                 {" "}
                                    </span>
                                                                   {" "}
                                </div>
                            )}
                                                       {" "}
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
                                                                               {" "}
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
                                                                               
                                                   {" "}
                                            <SafeHtml
                                                html={item.name}
                                                as="span"
                                                className="nav__label"
                                            />
                                                                               
                                                   {" "}
                                            {hasDropdown && (
                                                <FaChevronDown
                                                    className="nav__chev"
                                                    aria-hidden="true"
                                                />
                                            )}
                                                                               
                                               {" "}
                                        </a>
                                                                               {" "}
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
                                                                               
                                                               {" "}
                                                {item.mega ? (
                                                    <div className="mega" />
                                                ) : (
                                                    <div className="menu">
                                                                               
                                                                               
                                                               {" "}
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
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               {" "}
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
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 {" "}
                                                                                <SafeHtml
                                                                                    html={
                                                                                        subItem.name
                                                                                    }
                                                                                    as="span"
                                                                                    className="menu__label"
                                                                                />

                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 {" "}
                                                                                <FaChevronRight
                                                                                    className="menu__chev"
                                                                                    aria-hidden
                                                                                />

                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 {" "}
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
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 {" "}
                                                                                <SafeHtml
                                                                                    html={
                                                                                        subItem.name
                                                                                    }
                                                                                    as="span"
                                                                                />

                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 
                                                                                 {" "}
                                                                            </a>
                                                                        )}
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               {" "}
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
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     {" "}
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
                                                                                                    inner.url,
                                                                                                    true
                                                                                                )}
                                                                                            >
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 {" "}
                                                                                                <SafeHtml
                                                                                                    html={
                                                                                                        inner.name
                                                                                                    }
                                                                                                    as="span"
                                                                                                />

                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 {" "}
                                                                                            </a>
                                                                                        )
                                                                                    )}

                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     
                                                                                     {" "}
                                                                                </div>
                                                                            )}
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                           {" "}
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                                               
                                                                               
                                                           {" "}
                                                    </div>
                                                )}
                                                                               
                                                           {" "}
                                            </div>
                                        )}
                                                                           {" "}
                                    </div>
                                );
                            })}
                                                   {" "}
                        </nav>
                                               {" "}
                        <div className="nav__cta">
                                                        <ThemeToggle />         
                                             {" "}
                            <LanguageSwitcher
                                currentLang={currentLang}
                                languages={allLanguages}
                                onChange={changeLanguage}
                            />
                                                       {" "}
                            <a
                                href="/impressum"
                                onClick={navigate("/impressum")}
                                className="btn bg-button btn--primary ml-4"
                            >
                                                               {" "}
                                {isMounted
                                    ? t("header.impressum", "Impressum")
                                    : "Impressum"}
                                                           {" "}
                            </a>
                                                   {" "}
                        </div>
                                               {" "}
                        <button
                            className="hamburger"
                            onClick={() => setOpenMenu(true)}
                            aria-label={
                                isMounted
                                    ? t("header.menu_open", "Menü öffnen")
                                    : "Menü öffnen"
                            }
                        >
                                                        <FaBars size={22} />   
                                               {" "}
                        </button>
                                           {" "}
                    </div>
                                   {" "}
                </div>
                           {" "}
            </div>
                       {" "}
            <div
                className={cx("drawer", openMenu && "is-open")}
                aria-hidden={!openMenu}
            >
                               {" "}
                <div
                    className="drawer__backdrop"
                    onClick={() => setOpenMenu(false)}
                />
                               {" "}
                <aside className="drawer__panel" role="dialog" aria-modal>
                                       {" "}
                    <div className="drawer__head">
                                               {" "}
                        <a
                            href="/"
                            className="brand brand--sm"
                            onClick={navigate("/", true)}
                        >
                                                       {" "}
                            <img
                                src={siteLogos.light}
                                alt={`${siteName} Logo`}
                                className="brand__logo brand__logo--light"
                            />
                                                       {" "}
                            <img
                                src={siteLogos.dark}
                                alt={`${siteName} Logo (Dark)`}
                                className="brand__logo brand__logo--dark"
                            />
                                                   {" "}
                        </a>
                                               {" "}
                        <button
                            className="btn btn--icon"
                            onClick={() => setOpenMenu(false)}
                            aria-label={
                                isMounted
                                    ? t("header.menu_close", "Menü schließen")
                                    : "Menü schließen"
                            }
                        >
                                                        <FaTimes size={20} />   
                                               {" "}
                        </button>
                                           {" "}
                    </div>
                                       {" "}
                    <div className="drawer__body">
                                               {" "}
                        {navItems.map((item, idx) => {
                            const key = item.dropdownKey || item.route;
                            const hasDropdown = !!item.dropdown || !!item.mega;
                            const expanded = !!mobileAccordions[key];
                            return (
                                <div key={idx} className="acc">
                                                                       {" "}
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
                                                                               {" "}
                                        <span className="acc__left">
                                                                               
                                                   {" "}
                                            <span className="acc__icon">
                                                                               
                                                                {item.icon}     
                                                                               
                                                     {" "}
                                            </span>
                                                                               
                                                   {" "}
                                            <SafeHtml
                                                html={item.name}
                                                as="span"
                                            />
                                                                               
                                               {" "}
                                        </span>
                                                                               {" "}
                                        {hasDropdown && (
                                            <FaChevronDown
                                                className={cx(
                                                    "acc__chev",
                                                    expanded && "rot"
                                                )}
                                                aria-hidden
                                            />
                                        )}
                                                                           {" "}
                                    </button>
                                                                       {" "}
                                    {hasDropdown && (
                                        <div
                                            className={cx(
                                                "acc__content",
                                                expanded && "open"
                                            )}
                                        >
                                                                               
                                                   {" "}
                                            <div className="acc__menu">
                                                                               
                                                               {" "}
                                                {dedupeByKey(item.dropdown).map(
                                                    (subItem, i) => (
                                                        <div
                                                            key={i}
                                                            className="acc__item"
                                                        >
                                                                               
                                                                               
                                                                               {" "}
                                                            {subItem.submenu ? (
                                                                <details className="acc__details">
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                           {" "}
                                                                    <summary className="acc__summary">
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               {" "}
                                                                        <SafeHtml
                                                                            html={
                                                                                subItem.name
                                                                            }
                                                                            as="span"
                                                                        />
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               {" "}
                                                                        <div className="acc__submenu">
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               {" "}
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
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         {" "}
                                                                                        <SafeHtml
                                                                                            html={
                                                                                                inner.name
                                                                                            }
                                                                                            as="span"
                                                                                        />

                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         
                                                                                         {" "}
                                                                                    </a>
                                                                                )
                                                                            )}
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               {" "}
                                                                        </div>
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                           {" "}
                                                                    </summary>
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                       {" "}
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
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                           {" "}
                                                                    <SafeHtml
                                                                        html={
                                                                            subItem.name
                                                                        }
                                                                        as="span"
                                                                    />
                                                                               
                                                                               
                                                                               
                                                                               
                                                                               
                                                                       {" "}
                                                                </a>
                                                            )}
                                                                               
                                                                               
                                                                           {" "}
                                                        </div>
                                                    )
                                                )}
                                                                               
                                                           {" "}
                                            </div>
                                                                               
                                               {" "}
                                        </div>
                                    )}
                                                                   {" "}
                                </div>
                            );
                        })}
                                               {" "}
                        <div className="drawer__theme-toggle">
                                                        <ThemeToggle />         
                                         {" "}
                        </div>
                                               {" "}
                        <div className="drawer__lang">
                                                       {" "}
                            <span className="drawer__lang-label">
                                                               {" "}
                                {isMounted
                                    ? t("header.language", "Sprache")
                                    : "Sprache"}
                                                           {" "}
                            </span>
                                                       {" "}
                            <div className="drawer__lang-buttons">
                                                               {" "}
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
                                                                               {" "}
                                        {l.label}                               
                                           {" "}
                                    </button>
                                ))}
                                                           {" "}
                            </div>
                                                   {" "}
                        </div>
                                           {" "}
                    </div>
                                   {" "}
                </aside>
                           {" "}
            </div>
                   {" "}
        </header>
    );
};

export default Header;
