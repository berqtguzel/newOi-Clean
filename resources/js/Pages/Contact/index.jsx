import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import ContactSection from "@/Components/Home/Contact/ContactSection";
import ContactMap from "@/Components/Contact/ContactMaps";

export default function ContactIndex({ flash, currentRoute = "contact" }) {
    return (
        <AppLayout currentRoute={currentRoute}>
            <Head>
                <title>Kontakt – O&I CLEAN group GmbH</title>
                <meta
                    name="description"
                    content="Kontaktieren Sie uns für ein kostenloses, unverbindliches Angebot. Wir freuen uns auf Ihre Anfrage."
                />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "ContactPage",
                        name: "Kontakt – O&I CLEAN group GmbH",
                        url:
                            typeof window !== "undefined"
                                ? window.location.href
                                : undefined,
                    })}
                </script>
            </Head>

            {/* Başlık */}
            <section className="max-w-4xl mx-auto px-4 pt-10 pb-4">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Kontakt
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                    Kostenlos &amp; unverbindlich – wir melden uns zeitnah.
                </p>

                {flash?.success && (
                    <div className="mt-4 rounded-lg border border-emerald-300/60 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 px-4 py-3">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mt-4 rounded-lg border border-rose-300/60 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200 px-4 py-3">
                        {flash.error}
                    </div>
                )}
            </section>

            {/* İletişim formu */}
            <ContactSection />

            {/* Harita */}
            <ContactMap
                query="Spaldingstr. 77–79, 20097 Hamburg, Germany"
                zoom={15}
                title="Unser Standort"
                description="Besuchen Sie uns oder kontaktieren Sie uns über das Formular. Wir freuen uns auf Ihre Nachricht!"
            />
        </AppLayout>
    );
}
