import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import useWidgets from "@/hooks/useWidgets";

export default function WhatsAppWidget({ tenant, locale = "de" }) {
    const { widgets, loading } = useWidgets({
        tenant,
        locale,
        enabled: Boolean(tenant),
    });

    const config = widgets?.whatsapp?.[0];

    console.log("💬 WhatsApp Config:", config);

    if (loading || !config || !config.is_active) return null;

    const phone = config.phone_number?.replace(/\s|\+/g, "") || ""; // + işaretini kaldır
    if (!phone) return null;

    const message = config.default_message || "Hello! I need help";
    const position =
        config.button_position === "bottom-left" ? "left" : "right";

    const buttonColor = config.button_color || "#25D366";

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
        message
    )}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Chat"
            className={`
                fixed bottom-4 z-50 w-14 h-14
                flex items-center justify-center
                text-white text-3xl cursor-pointer
                rounded-full shadow-lg transition-all
                hover:scale-110 hover:shadow-2xl
                ${position === "left" ? "left-4" : "right-4"}
            `}
            style={{ backgroundColor: buttonColor }}
            title={config.welcome_text || ""}
        >
            <FaWhatsapp />
        </a>
    );
}
