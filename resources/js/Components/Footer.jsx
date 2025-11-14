import React from "react";
import { Link } from "@inertiajs/react";
import {
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaLinkedin,
    FaInstagram,
    FaFacebook,
    FaChevronUp,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";

import "../../css/Footer.css";
import SafeHtml from "@/Components/Common/SafeHtml";

export default function Footer({ settings }) {
    const { t } = useTranslation();

    const year = new Date().getFullYear();
    const brand = settings?.branding || {};
    const contact = settings?.contact || {};
    const social = settings?.social || {};

    const fallbackFooterDesc = t(
        "footer.description",
        "Ihr Partner für professionelle Reinigung, Pflege und Gebäudemanagement mit deutscher Präzision und Zuverlässigkeit."
    );

    const fallbackAddress = t(
        "footer.address",
        "Spaldingstr. 77–79, 20097 Hamburg"
    );
    const fallbackPhone = t("footer.phone", "+49 (0)40 46 63 35 19");
    const fallbackPhoneRaw = t("footer.phone_raw", "+494046633519");
    const fallbackEmail = t("footer.email", "info@oi-clean.de");

    const phone = contact?.phone || fallbackPhone;
    const phoneHref = (contact?.phone || fallbackPhoneRaw).replace(/\s+/g, "");
    const email = contact?.email || fallbackEmail;

    const siteName = brand?.site_name || "O&I CLEAN";
    const companyName = brand?.company_name || "O&I CLEAN group GmbH";

    const linksTitle = t("footer.links_title", "Links");
    const contactTitle = t("footer.contact_title", "Kontakt");

    const linkAboutLabel = t("footer.link_about", "Über uns");
    const linkContactLabel = t("footer.link_contact", "Kontakt");
    const linkContactHref = t("footer.link_contact_href", "/contact");
    const linkFaqLabel = t("footer.link_faq", "FAQ");
    const linkPrivacyLabel = t("footer.link_privacy", "Datenschutz");

    const impressumLabel = t("footer.link_imprint", "Impressum");
    const privacyLabelBottom = t("footer.link_privacy_bottom", "Datenschutz");

    const copyrightText = t("footer.copyright", "Alle Rechte vorbehalten.");

    const backToTopLabel = t("footer.back_to_top", "Nach oben");

    return (
        <footer
            className="footer relative overflow-hidden"
            aria-labelledby="footer-heading"
        >
            <h2 id="footer-heading" className="sr-only">
                {t("footer.region_label", "Fußzeile und Kontaktinformationen")}
            </h2>

            <div className="container mx-auto px-6 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-5">
                        <div className="flex items-start gap-4">
                            <div>
                                <h3 className="text-2xl font-extrabold">
                                    <Link
                                        href="/"
                                        aria-label={t(
                                            "footer.home_aria",
                                            "O&I CLEAN - Startseite"
                                        )}
                                    >
                                        <SafeHtml html={siteName} as="span" />
                                    </Link>
                                </h3>

                                <SafeHtml
                                    html={
                                        settings?.footer?.description ||
                                        fallbackFooterDesc
                                    }
                                    as="p"
                                    className="mt-2 muted text-sm leading-relaxed max-w-md"
                                />

                                <div className="mt-4 flex flex-wrap gap-3">
                                    {social?.linkedin && (
                                        <a
                                            href={social.linkedin}
                                            aria-label={t(
                                                "footer.linkedin_aria",
                                                "LinkedIn - O&I CLEAN"
                                            )}
                                            title="LinkedIn"
                                            className="link-ghost inline-icon"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            <FaLinkedin size={16} />
                                        </a>
                                    )}
                                    {social?.instagram && (
                                        <a
                                            href={social.instagram}
                                            aria-label={t(
                                                "footer.instagram_aria",
                                                "Instagram - O&I CLEAN"
                                            )}
                                            title="Instagram"
                                            className="link-ghost inline-icon"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            <FaInstagram size={16} />
                                        </a>
                                    )}
                                    {social?.facebook && (
                                        <a
                                            href={social.facebook}
                                            aria-label={t(
                                                "footer.facebook_aria",
                                                "Facebook - O&I CLEAN"
                                            )}
                                            title="Facebook"
                                            className="link-ghost inline-icon"
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            <FaFacebook size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav
                        aria-label={t(
                            "footer.quicklinks_aria",
                            "Schnell Links"
                        )}
                        className="md:col-span-2"
                    >
                        <h4 className="text-lg font-semibold mb-3">
                            {linksTitle}
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/uber-uns"
                                    className="footer-link"
                                    aria-label={linkAboutLabel}
                                >
                                    {linkAboutLabel}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={linkContactHref}
                                    className="footer-link"
                                    aria-label={linkContactLabel}
                                >
                                    {linkContactLabel}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="footer-link"
                                    aria-label={linkFaqLabel}
                                >
                                    {linkFaqLabel}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/datenschutz"
                                    className="footer-link"
                                    aria-label={linkPrivacyLabel}
                                >
                                    {linkPrivacyLabel}
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="md:col-span-3">
                        <h4 className="text-lg font-semibold mb-3">
                            {contactTitle}
                        </h4>
                        <address className="not-italic text-sm space-y-3">
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-accent" />
                                <SafeHtml
                                    html={contact?.address || fallbackAddress}
                                    as="span"
                                />
                            </div>
                            <div className="flex items-center">
                                <FaPhoneAlt className="mr-3 text-accent" />
                                <a
                                    href={`tel:${phoneHref}`}
                                    className="footer-link"
                                    aria-label={t(
                                        "footer.phone_aria",
                                        "Telefonnummer"
                                    )}
                                >
                                    {phone}
                                </a>
                            </div>
                            <div className="flex items-center">
                                <FaEnvelope className="mr-3 text-accent" />
                                <a
                                    href={`mailto:${email}`}
                                    className="footer-link"
                                    aria-label={t(
                                        "footer.email_aria",
                                        "E-Mail"
                                    )}
                                >
                                    {email}
                                </a>
                            </div>
                        </address>
                    </div>

                    <div className="md:col-span-12 mt-2">
                        <div className="mt-6 border-t pt-4 flex flex-col md:flex-row items-center justify-between gap-3 footer-bottom">
                            <p className="text-sm muted">
                                © {year}{" "}
                                <SafeHtml html={companyName} as="span" />.{" "}
                                {copyrightText}
                            </p>
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/impressum"
                                    className="text-sm footer-link"
                                    aria-label={impressumLabel}
                                >
                                    {impressumLabel}
                                </Link>
                                <Link
                                    href="/datenschutz"
                                    className="text-sm footer-link"
                                    aria-label={privacyLabelBottom}
                                >
                                    {privacyLabelBottom}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-backtop">
                <a
                    href="#top"
                    className="btn"
                    aria-label={backToTopLabel}
                    title={backToTopLabel}
                >
                    <FaChevronUp />
                </a>
            </div>
        </footer>
    );
}
