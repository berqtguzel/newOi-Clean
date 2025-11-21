import React, { useEffect, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaChevronUp,
    FaFacebook,
    FaInstagram,
    FaLinkedin,
    FaYoutube,
    FaTiktok,
} from "react-icons/fa";

import SafeHtml from "@/Components/Common/SafeHtml";
import { useTranslation } from "react-i18next";
import { useMenus } from "@/hooks/useMenus";
import {
    normalizeLang,
    resolveMenuLabel,
    resolveMenuUrl,
} from "@/helpers/menuHelpers";

import "../../css/Footer.css";

export default function Footer({ settings }) {
    const { t } = useTranslation();
    const { props } = usePage();

    /** INERTIA LOCALE */
    const inertiaLocale = props?.locale || "en";
    const locale = normalizeLang(inertiaLocale);

    /** Tenant ID */
    const tenantId =
        props?.global?.tenantId ||
        props?.global?.tenant_id ||
        props?.global?.talentId ||
        "";

    /** MENÜLERİ ÇEK */
    const { data: menus, loading } = useMenus({
        tenantId,
        locale,
        perPage: 100,
    });

    const [footerLinks, setFooterLinks] = useState([]);

    /** FOOTER MENÜ HAZIRLA */
    useEffect(() => {
        if (!menus || !menus.length) {
            setFooterLinks([]);
            return;
        }

        const footerMenu = menus.find((m) => m.slug === "footer");

        if (!footerMenu || !footerMenu.items) {
            setFooterLinks([]);
            return;
        }

        const links = footerMenu.items.map((it) => ({
            label: resolveMenuLabel(it, locale),
            url: resolveMenuUrl(it, locale),
        }));

        setFooterLinks(links);
    }, [menus, locale]);

    // --- SETTINGS PARSING (GÜNCELLENDİ) ---
    const contactData = settings?.contact || {};
    const social = settings?.social || {};
    const footer = settings?.footer || {};
    const general = settings?.general || {};

    // API'den gelen yapı: { contact_infos: [...] }
    // Diziden 'is_primary' olanı bul, yoksa ilkini al, o da yoksa boş obje.
    const contactInfos = contactData?.contact_infos || [];
    const activeContact =
        contactInfos.find((c) => c.is_primary) || contactInfos[0] || {};

    const siteName = general?.site_name || "O&I CLEAN";

    // Verileri activeContact üzerinden çekiyoruz
    const address = activeContact.address || "";
    // Phone yoksa mobile alanına bak
    const phone = activeContact.phone || activeContact.mobile || "";
    const email = activeContact.email || "";

    const phoneHref = phone.replace(/[^+\d]/g, "");
    const year = new Date().getFullYear();

    return (
        <footer className="footer relative overflow-hidden">
            <div className="container mx-auto px-6 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* SOL BLOK */}
                    <div className="md:col-span-5">
                        <h3 className="text-2xl font-extrabold">
                            <a href="/">{siteName}</a>
                        </h3>

                        <SafeHtml
                            html={footer?.footer_text}
                            as="div"
                            className="mt-2 muted text-sm leading-relaxed max-w-md footer-desc-content"
                        />

                        {/* Sosyal medya */}
                        <div className="mt-4 flex flex-wrap gap-3">
                            {social.facebook_url && (
                                <a
                                    href={social.facebook_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaFacebook />
                                </a>
                            )}
                            {social.instagram_url && (
                                <a
                                    href={social.instagram_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaInstagram />
                                </a>
                            )}
                            {social.linkedin_url && (
                                <a
                                    href={social.linkedin_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaLinkedin />
                                </a>
                            )}
                            {social.youtube_url && (
                                <a
                                    href={social.youtube_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaYoutube />
                                </a>
                            )}
                            {social.tiktok_url && (
                                <a
                                    href={social.tiktok_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <FaTiktok />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* FOOTER MENÜ */}
                    <nav className="md:col-span-3">
                        <h4 className="text-lg font-semibold mb-3">
                            {t("footer.links_title", "Links")}
                        </h4>

                        <ul className="space-y-2 text-sm">
                            {footerLinks.map((link, i) => (
                                <li key={i}>
                                    <Link
                                        href={link.url}
                                        className="footer-link"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}

                            {!loading && footerLinks.length === 0 && (
                                <li className="text-xs text-gray-500">
                                    Menü boş veya ayarlanmamış
                                </li>
                            )}
                        </ul>
                    </nav>

                    {/* İLETİŞİM (GÜNCELLENDİ) */}
                    <div className="md:col-span-4">
                        <h4 className="text-lg font-semibold mb-3">
                            {t("footer.contact_title", "Kontakt")}
                        </h4>

                        <address className="not-italic text-sm space-y-4">
                            {/* Adres Kısmı */}
                            {address && (
                                <div className="flex items-start">
                                    <FaMapMarkerAlt className="mr-3 mt-1 text-accent shrink-0" />
                                    <SafeHtml html={address} as="span" />
                                </div>
                            )}

                            {/* Telefon Kısmı */}
                            {phone && (
                                <div className="flex items-center">
                                    <FaPhoneAlt className="mr-3 text-accent shrink-0" />
                                    <a
                                        href={`tel:${phoneHref}`}
                                        className="footer-link"
                                    >
                                        {phone}
                                    </a>
                                </div>
                            )}

                            {/* Email Kısmı */}
                            {email && (
                                <div className="flex items-center">
                                    <FaEnvelope className="mr-3 text-accent shrink-0" />
                                    <a
                                        href={`mailto:${email}`}
                                        className="footer-link"
                                    >
                                        {email}
                                    </a>
                                </div>
                            )}
                        </address>
                    </div>
                </div>

                {/* ALT */}
                <div className="mt-12 border-t pt-8 text-sm text-center md:text-left">
                    © {year} {siteName} {footer.footer_copyright}
                </div>
            </div>

            <a
                href="#top"
                className="footer-backtop absolute bottom-10 right-6"
            >
                <FaChevronUp />
            </a>
        </footer>
    );
}
