import React from "react";
import { safeParse } from "@/utils/safeParse";

export default function SafeHtml({ html, as: Tag = "div", ...rest }) {
    if (!html) return null;

    return (
        <Tag {...rest} suppressHydrationWarning={true}>
            {safeParse(html)}
        </Tag>
    );
}
