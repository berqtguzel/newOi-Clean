import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";

export default function ServicesIndex({ services = [] }) {
    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-4 py-10">
                <Head title="Leistungen" />
                <h1 className="text-3xl font-extrabold mb-6">Leistungen</h1>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s) => (
                        <article key={s.slug} className="rounded-xl border p-4">
                            <img
                                src={s.image}
                                alt={s.title}
                                className="rounded-lg mb-3"
                            />
                            <h2 className="font-bold text-lg">{s.title}</h2>
                            <p className="text-slate-600 text-sm">
                                {s.excerpt}
                            </p>
                            <Link
                                href={`/services/${s.slug}`}
                                className="inline-block mt-3 text-sky-600 font-semibold"
                            >
                                Details ansehen →
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
