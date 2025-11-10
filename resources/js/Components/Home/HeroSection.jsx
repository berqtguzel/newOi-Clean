import React from "react";
import { motion } from "motion/react";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.15 },
    },
};

const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function HeroSection({ content }) {
    return (
        <div className="relative min-h-[70svh] md:min-h-[600px] lg:min-h-[720px] overflow-hidden flex items-center justify-center text-white px-4 py-16 sm:py-20">
            <motion.video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
            >
                <source src="/videos/headerVideo.mp4" type="video/mp4" />
                Ihr Browser unterstützt das Video-Tag nicht.
            </motion.video>

            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70 md:from-black/50 md:via-black/40 md:to-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />

            <motion.div
                className="relative z-10 text-center"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.h1
                    className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight"
                    variants={item}
                >
                    {content?.hero_title ||
                        "Umfassende Lösungen für Ihre Anlagen und Gebäude"}
                </motion.h1>

                <motion.p
                    className="mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl font-light max-w-[28rem] sm:max-w-2xl md:max-w-3xl mx-auto"
                    variants={item}
                >
                    Mit über 25 Jahren Erfahrung bieten wir maßgeschneiderte,
                    integrierte Lösungen für Reinigung, Pflege und
                    Instandhaltung.
                </motion.p>

                <motion.div
                    className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4"
                    variants={item}
                >
                    <a
                        href="#services"
                        className="w-full sm:w-auto bg-button text-gray-900 font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-button transition duration-300"
                    >
                        Unsere Leistungen entdecken
                    </a>
                    <a
                        href="#contact"
                        className="w-full sm:w-auto bg-transparent border-2 border-white text-white font-bold py-3 px-6 sm:px-8 rounded-full hover:bg-white hover:text-gray-900 transition duration-300"
                    >
                        Kontakt aufnehmen
                    </a>
                </motion.div>
            </motion.div>
        </div>
    );
}
