import React from "react";
import { safeParse } from "@/utils/safeParse";

export default function SafeHtml({ html, as: Tag = "div", ...rest }) {
    if (!html) return null;

    // Metin içeriği uyuşmazlığı hatasını gidermek için suppressHydrationWarning eklendi.
    // Bu, dil çevirisinin client-side'da asenkron olarak gerçekleştiği senaryolarda güvenli bir çözümdür.
    return (
        <Tag {...rest} suppressHydrationWarning={true}>
            {safeParse(html)}
        </Tag>
    );
}
