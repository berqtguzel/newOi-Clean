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
import ThemeToggle from "./ThemeToggle";
import DecryptedText from "./ReactBits/Texts/DescryptedText";
import { useMenus } from "../hooks/useMenus";
import { useLanguages } from "../hooks/useLanguages";

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

/* ============================== component ============================== */
const Header = ({ currentRoute, settings }) => {
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

    const [isLangOpen, setIsLangOpen] = useState(false);
    useEffect(() => {
        const onDocClick = (e) => {
            if (headerRef.current && !headerRef.current.contains(e.target)) {
                setOpenDropdown(null);
                setOpenSubmenu(null);
                setOpenMenu(false);
                setIsLangOpen(false);
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
                setIsLangOpen(false);
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

    /* -------------------------- OMR global props -------------------------- */
    const { props } = usePage();
    const omrWebsites = props?.global?.websites || [];
    const omrTalentId = props?.global?.talentId || "";

    const currentHost =
        typeof window !== "undefined" ? window.location.hostname : "";

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
        settings?.contact?.phone || site?.contact?.phone || "+49 000 0000 000";
    const topbarTagline =
        site?.content?.topbarTagline ||
        "Sauberkeit, auf die Sie sich verlassen können — 24/7 Service";
    const cta = site?.cta || { href: "/contact", label: "Termin vereinbaren" };

    // Dashboard → Branding logoları (çeşitli alan adlarını destekle)
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

    // Diller: uzak settings API'den
    const { languages: fetchedLanguages, defaultCode: fetchedDefaultLang } =
        useLanguages();

    const [languages, setLanguages] = useState([]);

    useEffect(() => {
        if (Array.isArray(fetchedLanguages) && fetchedLanguages.length) {
            setLanguages(
                fetchedLanguages.map((l) => ({
                    code: l.code,
                    label: l.label || l.code?.toUpperCase() || "DE",
                }))
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchedLanguages]);

    const [currentLang, setCurrentLang] = useState(() => {
        try {
            return localStorage.getItem("locale") || fetchedDefaultLang || "de";
        } catch {
            return "de";
        }
    });
    useEffect(() => {
        // default API'den geldiyse ve localStorage yoksa onunla başlat
        try {
            const saved = localStorage.getItem("locale");
            if (!saved && fetchedDefaultLang) {
                setCurrentLang(fetchedDefaultLang);
                localStorage.setItem("locale", fetchedDefaultLang);
            }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchedDefaultLang]);
    const langRef = useRef(null);
    useEffect(() => {
        const onUpdateLangs = (e) => {
            if (e?.detail && Array.isArray(e.detail))
                setLanguages(
                    e.detail.map((l) => ({
                        code: l.code,
                        label: l.label || l.code?.toUpperCase() || l,
                    }))
                );
        };
        window.addEventListener("update-languages", onUpdateLangs);
        return () =>
            window.removeEventListener("update-languages", onUpdateLangs);
    }, []);
    const toggleLang = () => setIsLangOpen((s) => !s);
    const changeLanguage = (code) => {
        setCurrentLang(code);
        setIsLangOpen(false);
        try {
            localStorage.setItem("locale", code);
        } catch {}
        window.dispatchEvent(
            new CustomEvent("language-changed", { detail: { locale: code } })
        );
    };

    /* ----------------------- UZAK MENÜ: veri çek / hazırla ------------------ */
    // Tenant kimliği inertia props’larından çözümlenir
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";
    const {
        data: remoteMenus,
        loading: remoteLoading,
        error: remoteErr,
    } = useMenus({ perPage: 100, tenantId, locale: currentLang || "de" });
    const remoteError = remoteErr ? String(remoteErr) : "";

    const remoteNavItems = useMemo(() => {
        const first =
            Array.isArray(remoteMenus) && remoteMenus.length
                ? remoteMenus[0]
                : null;
        const items = Array.isArray(first?.items) ? first.items : [];
        const toDropdown = (children = []) =>
            children.map((it, idx) => {
                const hasChildren =
                    Array.isArray(it.children) && it.children.length > 0;
                if (!hasChildren)
                    return { name: it.label, url: cleanUrl(it.url) };
                return {
                    name: it.label,
                    submenuKey: `sub-${it.id || idx}`,
                    submenu: (it.children || []).map((c) => ({
                        name: c.label,
                        url: cleanUrl(c.url),
                    })),
                };
            });

        return items.map((node, i) => {
            const route = `menu-${node.id || i}`;
            const hasChildren =
                Array.isArray(node.children) && node.children.length > 0;
            return {
                name: node.label,
                route,
                url: cleanUrl(node.url) || "#",
                ...(hasChildren
                    ? {
                          dropdownKey: route,
                          dropdown: toDropdown(node.children),
                      }
                    : {}),
                isActive: () =>
                    typeof window !== "undefined"
                        ? window.location.pathname.replace(/\/+$/, "") ===
                          cleanUrl(node.url).replace(/\/+$/, "")
                        : false,
            };
        });
    }, [remoteMenus]);

    /* ------------------------------ navigate ------------------------------ */
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

    const navItems = useMemo(() => {
        if (remoteNavItems && remoteNavItems.length) return remoteNavItems;
        return [
            {
                name: "Startseite",
                route: "home",
                url: "/",
                isActive: () =>
                    typeof window !== "undefined"
                        ? window.location.pathname.replace(/\/+$/, "") === "/"
                        : false,
            },
        ];
    }, [remoteNavItems]);

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
                                    {cta.label}
                                </a>
                                <button
                                    className="btn btn--ghost btn--circle"
                                    aria-label="Top-Leiste ausblenden"
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
                            aria-label="Startseite"
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
                            aria-label="Hauptnavigation"
                        >
                            {remoteLoading && (
                                <div className="nav__item">
                                    <span className="nav__link"></span>
                                </div>
                            )}
                            {remoteError && (
                                <div className="nav__item">
                                    <span className="nav__link">
                                        {remoteError}
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
                                            <span className="nav__label">
                                                {item.name}
                                            </span>
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
                                                                                <span className="menu__label">
                                                                                    {
                                                                                        subItem.name
                                                                                    }
                                                                                </span>
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
                                                                                {
                                                                                    subItem.name
                                                                                }
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
                                                                                                {
                                                                                                    inner.name
                                                                                                }
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
                            <div className="lang-switch" ref={langRef}>
                                <button
                                    type="button"
                                    className="btn btn--ghost ml-3 lang-switch__btn"
                                    aria-haspopup="true"
                                    aria-expanded={isLangOpen}
                                    onClick={toggleLang}
                                >
                                    {currentLang.toUpperCase()}
                                </button>
                                {isLangOpen && (
                                    <ul
                                        className="lang-switch__list"
                                        role="menu"
                                    >
                                        {languages.map((l) => (
                                            <li key={l.code}>
                                                <button
                                                    type="button"
                                                    className={cx(
                                                        "lang-switch__item",
                                                        l.code ===
                                                            currentLang &&
                                                            "is-active"
                                                    )}
                                                    onClick={() =>
                                                        changeLanguage(l.code)
                                                    }
                                                >
                                                    {l.label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <a
                                href="/impressum"
                                onClick={navigate("/impressum")}
                                className="btn bg-button btn--primary ml-4"
                            >
                                Impressum
                            </a>
                        </div>

                        <button
                            className="hamburger"
                            onClick={() => setOpenMenu(true)}
                            aria-label="Menü öffnen"
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
                                alt={`${siteName} Logo`}
                                className="brand__logo brand__logo--dark"
                            />
                        </a>
                        <button
                            className="btn btn--icon"
                            onClick={() => setOpenMenu(false)}
                            aria-label="Menü schließen"
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
                                            {item.name}
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
                                                                        {
                                                                            subItem.name
                                                                        }
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
                                                                                    {
                                                                                        inner.name
                                                                                    }
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
                                                                    {
                                                                        subItem.name
                                                                    }
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
                            <span className="drawer__lang-label">Sprache</span>
                            <div className="drawer__lang-buttons">
                                {languages.map((l) => (
                                    <button
                                        key={l.code}
                                        type="button"
                                        className={cx(
                                            "btn btn--ghost",
                                            l.code === currentLang &&
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
