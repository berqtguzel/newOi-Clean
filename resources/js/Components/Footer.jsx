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

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer
            className="footer relative text-slate-100 bg-gradient-to-b from-sky-900 via-sky-800 to-sky-900 overflow-hidden"
            aria-labelledby="footer-heading"
        >
            <h2 id="footer-heading" className="sr-only">
                Fußzeile und Kontaktinformationen
            </h2>
            <div className="footer-svg pointer-events-none absolute inset-x-0 -top-6 transform-gpu overflow-hidden">
                <svg
                    viewBox="0 0 1440 120"
                    className="w-full h-24 text-sky-900"
                    preserveAspectRatio="none"
                    aria-hidden
                >
                    <path
                        fill="currentColor"
                        d="M0,32L48,42.7C96,53,192,75,288,96C384,117,480,139,576,138.7C672,139,768,117,864,117.3C960,117,1056,139,1152,133.3C1248,128,1344,96,1392,80L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
                    />
                </svg>
            </div>

            <div className="container mx-auto px-6 pt-20 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-5">
                        <div className="flex items-start gap-4">
                            <div>
                                <h3 className="text-2xl font-extrabold">
                                    <Link
                                        href="/"
                                        aria-label="O&I CLEAN - Startseite"
                                    >
                                        O&amp;I CLEAN
                                    </Link>
                                </h3>
                                <p className="mt-2 text-sky-100 text-sm leading-relaxed max-w-md">
                                    Ihr Partner für professionelle Reinigung,
                                    Pflege und Gebäudemanagement mit deutscher
                                    Präzision und Zuverlässigkeit.
                                </p>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <a
                                        href="https://www.linkedin.com"
                                        aria-label="LinkedIn - O&I CLEAN"
                                        title="LinkedIn"
                                        className="inline-flex items-center justify-center p-2 rounded-md bg-white/6 hover:bg-white/10 transition inline-icon"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FaLinkedin size={16} />
                                    </a>
                                    <a
                                        href="https://www.instagram.com"
                                        aria-label="Instagram - O&I CLEAN"
                                        title="Instagram"
                                        className="inline-flex items-center justify-center p-2 rounded-md bg-white/6 hover:bg-white/10 transition inline-icon"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FaInstagram size={16} />
                                    </a>
                                    <a
                                        href="https://www.facebook.com"
                                        aria-label="Facebook - O&I CLEAN"
                                        title="Facebook"
                                        className="inline-flex items-center justify-center p-2 rounded-md bg-white/6 hover:bg-white/10 transition inline-icon"
                                        rel="noopener noreferrer"
                                        target="_blank"
                                    >
                                        <FaFacebook size={16} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav aria-label="Schnell Links" className="md:col-span-2">
                        <h4 className="text-lg font-semibold mb-3">Links</h4>
                        <ul className="space-y-2 text-sm text-sky-100">
                            <li>
                                <Link
                                    href="/uber-uns"
                                    className="hover:text-white"
                                    aria-label="Über uns"
                                >
                                    Über uns
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="hover:text-white"
                                    aria-label="Contact"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="hover:text-white"
                                    aria-label="FAQ"
                                >
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/datenschutz"
                                    className="hover:text-white"
                                    aria-label="Datenschutz"
                                >
                                    Datenschutz
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    <div className="md:col-span-3">
                        <h4 className="text-lg font-semibold mb-3">Kontakt</h4>
                        <address className="not-italic text-sm text-sky-100 space-y-3">
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-amber-400" />
                                <span>Spaldingstr. 77–79, 20097 Hamburg</span>
                            </div>
                            <div className="flex items-center">
                                <FaPhoneAlt className="mr-3 text-amber-400" />
                                <a
                                    href="tel:+494046633519"
                                    className="hover:text-white"
                                    aria-label="Telefonnummer"
                                >
                                    +49 (0)40 46 63 35 19
                                </a>
                            </div>
                            <div className="flex items-center">
                                <FaEnvelope className="mr-3 text-amber-400" />
                                <a
                                    href="mailto:info@oi-clean.de"
                                    className="hover:text-white"
                                    aria-label="E-Mail"
                                >
                                    info@oi-clean.de
                                </a>
                            </div>
                        </address>
                    </div>

                    <div className="md:col-span-12 mt-2">
                        <div className="mt-6 border-t border-white/10 pt-4 flex flex-col md:flex-row items-center justify-between gap-3">
                            <p className="text-sm text-sky-200">
                                © {year} O&amp;I CLEAN group GmbH. Alle Rechte
                                vorbehalten.
                            </p>

                            <div className="flex items-center gap-4">
                                <Link
                                    href="/impressum"
                                    className="text-sm hover:underline"
                                    aria-label="Impressum"
                                >
                                    Impressum
                                </Link>
                                <Link
                                    href="/datenschutz"
                                    className="text-sm hover:underline"
                                    aria-label="Datenschutz"
                                >
                                    Datenschutz
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Back to top */}
            <div className="footer-backtop">
                <a
                    href="#top"
                    className="inline-flex items-center justify-center p-2 rounded-full bg-white/6 hover:bg-white/10 transition"
                    aria-label="Nach oben"
                    title="Nach oben"
                >
                    <FaChevronUp />
                </a>
            </div>
        </footer>
    );
}
