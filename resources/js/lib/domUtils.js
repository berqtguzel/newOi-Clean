export function applyCssVars(vars = {}) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => {
    if (v == null || v === "") return;
    root.style.setProperty(`--${String(k).replace(/_/g, "-")}`, String(v));
  });
}

export function upsertMeta(attrName, attrValue, content) {
  if (!attrValue) return;
  const sel = `meta[${attrName}="${CSS.escape(attrValue)}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  if (content != null) el.setAttribute("content", String(content));
}

export function upsertLink(rel, href, extra = {}) {
  if (!rel || !href) return;
  const sel = `link[rel="${CSS.escape(rel)}"][href="${CSS.escape(href)}"]`;
  let el = document.head.querySelector(sel);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel; el.href = href;
    Object.entries(extra || {}).forEach(([k, v]) => v!=null && el.setAttribute(k, v));
    document.head.appendChild(el);
  }
  return el;
}

export function injectScript({ id, src, code, attrs = {}, position = "head" }) {
  if (id) {
    const existing = document.getElementById(id);
    if (existing) return existing;
  }
  const s = document.createElement("script");
  if (id) s.id = id;
  Object.entries(attrs || {}).forEach(([k, v]) => v!=null && s.setAttribute(k, v));
  if (src) s.src = src;
  if (code) s.text = code;
  const parent = position === "body" ? document.body : document.head;
  parent.appendChild(s);
  return s;
}

export function injectHtml(position, html, id) {
  if (!html) return;
  if (id && document.getElementById(id)) return;
  const container = document.createElement("div");
  if (id) container.id = id;
  container.innerHTML = html;
  const parent = position === "body-end" ? document.body : document.head;
  if (position === "body-end") parent.appendChild(container);
  else parent.appendChild(container);
}
