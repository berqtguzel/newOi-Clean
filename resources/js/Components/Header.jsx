// resources/js/Components/Header.jsx
import "../../css/header.css";
import React, { useEffect, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import {
    FaHome,
    FaBuilding,
    FaBroom,
    FaMapMarkerAlt,
    FaPaperPlane,
    FaChevronDown,
    FaChevronRight,
    FaPhoneAlt,
    FaBars,
    FaTimes,
    FaQuestionCircle,
} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import DecryptedText from "./ReactBits/Texts/DescryptedText";

function cx(...args) {
    return args.filter(Boolean).join(" ");
}
const BitsBackground = () => <div aria-hidden className="rbits-bg" />;

/* ---------- Smooth scroll helpers ---------- */
const getOffset = () => {
    // sabit header yüksekliğini telafi et (gerekiyorsa ayarla)
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
    // URL hash'i güncelle (yenileme olmadan)
    history.replaceState(null, "", `${location.pathname}#${id}`);
};
const isHashOnly = (url) => /^#/.test(url);
const splitPathHash = (url) => {
    const [path, hash] = url.split("#");
    return { path: path || "/", hash: hash ? `#${hash}` : "" };
};

const Header = ({ currentRoute }) => {
    /* ---------- active path ---------- */
    const currentPath =
        typeof window !== "undefined"
            ? window.location.pathname.replace(/\/+$/, "")
            : "";

    const isPathActive = (urlOrList) => {
        const list = Array.isArray(urlOrList) ? urlOrList : [urlOrList];
        return list.some((u) => u && currentPath === u.replace(/\/+$/, ""));
    };

    /* ---------- states ---------- */
    const [isTopBarVisible, setIsTopBarVisible] = useState(true);
    const [openMenu, setOpenMenu] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [openSubmenu, setOpenSubmenu] = useState(null);
    const [mobileAccordions, setMobileAccordions] = useState({});
    const headerRef = useRef(null);

    /* ---------- hover-intent ---------- */
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

    /* ---------- outside click + ESC ---------- */
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

    /* ---------- language ---------- */
    const [languages, setLanguages] = useState([
        { code: "de", label: "DE" },
        { code: "en", label: "EN" },
    ]);
    const [currentLang, setCurrentLang] = useState(() => {
        try {
            return localStorage.getItem("locale") || "de";
        } catch {
            return "de";
        }
    });
    const langRef = useRef(null);
    useEffect(() => {
        const onUpdateLangs = (e) => {
            if (e?.detail && Array.isArray(e.detail)) setLanguages(e.detail);
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

    /* ---------- unified navigation (no page reload) ---------- */
    const navigate =
        (url, close = false) =>
        (e) => {
            if (!url) return;
            // aynı sayfa içi hash
            if (isHashOnly(url)) {
                e.preventDefault();
                setOpenDropdown(null);
                setOpenSubmenu(null);
                if (close) setOpenMenu(false);
                smoothScrollTo(url);
                return;
            }
            // /path#hash
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
                        onSuccess: () => {
                            requestAnimationFrame(() => smoothScrollTo(hash));
                        },
                    });
                }
                return;
            }
            // normal sayfa
            e.preventDefault();
            setOpenDropdown(null);
            setOpenSubmenu(null);
            if (close) setOpenMenu(false);
            router.visit(url);
        };

    /* ---------- nav items ---------- */
    const navItems = [
        {
            name: "Startseite",
            route: "home",
            url: "/",
            icon: <FaHome aria-hidden="true" />,
            isActive: () => isPathActive("/"),
        },
        {
            name: "Über uns",
            route: "about",
            url: "/uber-uns",
            icon: <FaBuilding aria-hidden="true" />,
            dropdownKey: "about",
            dropdown: [
                { name: "Über uns", url: "/uber-uns" },
                { name: "Qualitätsmanagement", url: "/qualitatsmanagement" },
                {
                    name: "Mitarbeiter Schulungen",
                    url: "/mitarbeiter-schulungen",
                },
                {
                    name: "Rechtliches",
                    submenuKey: "legal",
                    submenu: [
                        { name: "Datenschutzhinweise", url: "/datenschutz" },
                        { name: "Impressum", url: "/impressum" },
                        { name: "Stockfotos", url: "/stockfotos" },
                    ],
                },
                { name: "Häufig gestellte Fragen (FAQ)", url: "/faq" },
            ],
            isActive: () =>
                isPathActive([
                    "/uber-uns",
                    "/qualitatsmanagement",
                    "/mitarbeiter-schulungen",
                    "/datenschutz",
                    "/impressum",
                    "/stockfotos",
                    "/faq",
                ]),
        },
        {
            name: "Reinigungsleistungen",
            route: "services",
            url: "/#services",
            icon: <FaBroom aria-hidden="true" />,
            dropdownKey: "services",
        },
        {
            name: "Standorte",
            route: "locations",
            url: "/#location",
            icon: <FaMapMarkerAlt aria-hidden="true" />,
        },
        {
            name: "Kontakt",
            route: "contact",
            url: "/contact",
            icon: <FaPaperPlane aria-hidden="true" />,
        },
    ];

    return (
        <header ref={headerRef} className="site-header">
            <BitsBackground />

            {/* TOP BAR */}
            {isTopBarVisible && (
                <div className="topbar">
                    <div className="container">
                        <div className="topbar__inner">
                            <div className="topbar__left">
                                <span className="topbar__phone">
                                    <FaPhoneAlt aria-hidden="true" />
                                    <a href="tel:+490000000">
                                        <DecryptedText
                                            text="+49 000 0000 000"
                                            animateOn="view"
                                            speed={100}
                                            revealDirection="center"
                                        />
                                    </a>
                                </span>
                                <span className="topbar__tagline">
                                    <div style={{ marginTop: 0 }}>
                                        <DecryptedText
                                            text="Sauberkeit, auf die Sie sich verlassen können — 24/7 Service"
                                            animateOn="view"
                                            speed={100}
                                            revealDirection="center"
                                        />
                                    </div>
                                </span>
                            </div>
                            <div className="topbar__right">
                                <a
                                    href="/contact"
                                    onClick={navigate("/contact")}
                                    className="btn btn--ghost"
                                >
                                    Termin vereinbaren
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

            {/* MAIN NAV */}
            <div className="navwrap">
                <div className="container">
                    <div className="navwrap__inner">
                        <a
                            href="/"
                            onClick={navigate("/")}
                            className="brand"
                            aria-label="Startseite"
                        >
                            {/* Light tema için */}
                            <img
                                src="/images/logo/Logo.png"
                                alt="O&I CLEAN Logo"
                                className="brand__logo brand__logo--light"
                            />
                            {/* Dark tema için */}
                            <img
                                src="/images/logo/darkLogo.png"
                                alt="O&I CLEAN Logo (Dark)"
                                className="brand__logo brand__logo--dark"
                            />
                        </a>

                        {/* Desktop nav */}
                        <nav
                            className="nav nav--desktop"
                            aria-label="Hauptnavigation"
                        >
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
                                            onClick={
                                                hasDropdown
                                                    ? navigate(item.url) // parent tıklanınca da gider
                                                    : navigate(item.url)
                                            }
                                        >
                                            <span className="nav__icon">
                                                {item.icon}
                                            </span>
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
                                                        {item.dropdown.map(
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
                                                                                    <FaQuestionCircle
                                                                                        className="menu__ico"
                                                                                        aria-hidden
                                                                                    />
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

                            <div className="nav__cta">
                                <ThemeToggle />
                                {/* Language switch */}
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
                                                            changeLanguage(
                                                                l.code
                                                            )
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
                                    className="btn btn--primary ml-4"
                                >
                                    Impressum
                                </a>
                            </div>
                        </nav>

                        {/* Mobile trigger */}
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

            {/* MOBILE DRAWER */}
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
                        <a href="/" className="brand brand--sm">
                            {/* light/dark logo switch */}
                            <img
                                src="/images/logo/Logo.png"
                                alt="O&I CLEAN Logo"
                                className="brand__logo brand__logo--light"
                            />
                            <img
                                src="/images/logo/darkLogo.png"
                                alt="O&I CLEAN Logo"
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
                                        onClick={() =>
                                            hasDropdown
                                                ? toggleMobileAccordion(key)
                                                : setOpenMenu(false)
                                        }
                                    >
                                        <span className="acc__left">
                                            <span className="acc__icon">
                                                {item.icon}
                                            </span>
                                            {item.name}
                                        </span>

                                        {/* OK sadece dropdown’ı olanlarda ve AÇIKKEN görünür */}
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

                                    {hasDropdown ? (
                                        <div
                                            className={cx(
                                                "acc__content",
                                                expanded && "open"
                                            )}
                                        >
                                            <div className="acc__menu">
                                                {item.dropdown?.map(
                                                    (subItem, i) => (
                                                        <div
                                                            key={i}
                                                            className="acc__item"
                                                        >
                                                            {subItem.submenu ? (
                                                                /* Nested submenu: details/summary ile aç-kapa */
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
                                                                                    onClick={() =>
                                                                                        setOpenMenu(
                                                                                            false
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
                                                                    onClick={() =>
                                                                        setOpenMenu(
                                                                            false
                                                                        )
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
                                    ) : (
                                        <a
                                            href={item.url}
                                            className="acc__link"
                                            onClick={() => setOpenMenu(false)}
                                        >
                                            Öffnen
                                        </a>
                                    )}
                                </div>
                            );
                        })}

                        <div className="drawer__theme-toggle">
                            <ThemeToggle />
                        </div>
                        {/* ... dil butonları ve Impressum aynen devam ... */}
                    </div>
                </aside>
            </div>
        </header>
    );
};

export default Header;
