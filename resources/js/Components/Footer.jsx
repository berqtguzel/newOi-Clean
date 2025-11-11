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
import "../../css/Footer.css";

export default function Footer({ settings }) {
    const year = new Date().getFullYear();
    const brand = settings?.branding || {};
    const contact = settings?.contact || {};
    const social = settings?.social || {};

    return (
        <footer
            className="footer relative overflow-hidden"
            aria-labelledby="footer-heading"
        >
            <h2 id="footer-heading" className="sr-only">
                Fußzeile und Kontaktinformationen
            </h2>

            <div className="container mx-auto px-6 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Brand + desc + socials */}
                    <div className="md:col-span-5">
                        <div className="flex items-start gap-4">
                            <div>
                                <h3 className="text-2xl font-extrabold">
                                    <Link
                                        href="/"
                                        aria-label="O&I CLEAN - Startseite"
                                    >
                                        {brand?.site_name || "O&I CLEAN"}
                                    </Link>
                                </h3>

                                <p className="mt-2 muted text-sm leading-relaxed max-w-md">
                                    {settings?.footer?.description ||
                                        "Ihr Partner für professionelle Reinigung, Pflege und Gebäudemanagement mit deutscher Präzision und Zuverlässigkeit."}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    {social?.linkedin && (
                                    <a
                                        href={social.linkedin}
                                        aria-label="LinkedIn - O&I CLEAN"
                                        title="LinkedIn"
                                        className="link-ghost inline-icon"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FaLinkedin size={16} />
                                    </a>)}
                                    {social?.instagram && (
                                    <a
                                        href={social.instagram}
                                        aria-label="Instagram - O&I CLEAN"
                                        title="Instagram"
                                        className="link-ghost inline-icon"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FaInstagram size={16} />
                                    </a>)}
                                    {social?.facebook && (
                                    <a
                                        href={social.facebook}
                                        aria-label="Facebook - O&I CLEAN"
                                        title="Facebook"
                                        className="link-ghost inline-icon"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FaFacebook size={16} />
                                    </a>)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick links */}
                    <nav aria-label="Schnell Links" className="md:col-span-2">
                        <h4 className="text-lg font-semibold mb-3">Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/uber-uns"
                                    className="footer-link"
                                    aria-label="Über uns"
                                >
                                    Über uns
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="footer-link"
                                    aria-label="Contact"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="footer-link"
                                    aria-label="FAQ"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/datenschutz"
                                    className="footer-link"
                                    aria-label="Datenschutz"
                                >
                                    Datenschutz
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Contact */}
                    <div className="md:col-span-3">
                        <h4 className="text-lg font-semibold mb-3">Kontakt</h4>
                        <address className="not-italic text-sm space-y-3">
                            <div>
                                <FaMapMarkerAlt className="mr-3 mt-1 text-accent" />
                                <span>{contact?.address || "Spaldingstr. 77–79, 20097 Hamburg"}</span>
                            </div>
                            <div>
                                <FaPhoneAlt className="mr-3 text-accent" />
                                <a
                                    href={`tel:${(contact?.phone || "+494046633519").replace(/\s+/g,"")}`}
                                    className="footer-link"
                                    aria-label="Telefonnummer"
                                >
                                    {contact?.phone || "+49 (0)40 46 63 35 19"}
                                </a>
                            </div>
                            <div>
                                <FaEnvelope className="mr-3 text-accent" />
                                <a
                                    href={`mailto:${contact?.email || "info@oi-clean.de"}`}
                                    className="footer-link"
                                    aria-label="E-Mail"
                                >
                                    {contact?.email || "info@oi-clean.de"}
                                </a>
                            </div>
                        </address>
                    </div>

                    {/* Bottom row */}
                    <div className="md:col-span-12 mt-2">
                        <div className="mt-6 border-t pt-4 flex flex-col md:flex-row items-center justify-between gap-3 footer-bottom">
                            <p className="text-sm muted">
                                © {year} {brand?.company_name || "O&I CLEAN group GmbH"}. Alle Rechte
                                vorbehalten.
                            </p>
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/impressum"
                                    className="text-sm footer-link"
                                    aria-label="Impressum"
                                >
                                    Impressum
                                </Link>
                                <Link
                                    href="/datenschutz"
                                    className="text-sm footer-link"
                                    aria-label="Datenschutz"
                                >
                                    Datenschutz
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* back to top */}
            <div className="footer-backtop">
                <a
                    href="#top"
                    className="btn"
                    aria-label="Nach oben"
                    title="Nach oben"
                >
                    <FaChevronUp />
                </a>
            </div>
        </footer>
    );
}
