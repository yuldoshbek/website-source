/**
 * INTERCARGO — Static Site Generator
 * Combines template.html + route JSON files → static HTML pages
 *
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

// ─── Paths ───────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(__dirname, 'template.html');
const ROUTES_DIR = path.join(ROOT, 'routes');
const OUTPUT_DIR = path.join(ROOT, 'output');
const DEFAULTS_PATH = path.join(ROOT, 'data', 'defaults.json');
const CITIES_PATH = path.join(ROOT, 'data', 'cities-catalog.json');

// ─── SVG Icon Maps ──────────────────────────────────────
const SERVICE_ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>`,
    document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>`,
    box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>`,
    storage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18" />
            </svg>`,
    special: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="13.5" cy="6.5" r="0.5" />
                <circle cx="17.5" cy="10.5" r="0.5" />
                <circle cx="8.5" cy="7.5" r="0.5" />
                <circle cx="6.5" cy="12.5" r="0.5" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
            </svg>`
};

const ADVANTAGE_ICONS = [
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>`,
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>`
];

const PRICING_ICONS = {
    truck: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 3h15v13H1z" />
                                <path d="M16 8h4l3 3v5h-7V8z" />
                                <circle cx="5.5" cy="18.5" r="2.5" />
                                <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>`,
    ship: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76" />
                                <path d="M12 2v8" />
                                <path d="M12 6l-4 2" />
                                <path d="M12 6l4 2" />
                            </svg>`,
    plane: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                            </svg>`,
    globe: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M2 12h20" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>`
};

// ─── UI Translations (hardcoded strings in template) ─────
const UI_DEFAULTS = {
    ru: {
        nav_services: "Услуги",
        nav_destinations: "Направления",
        nav_calculator: "Калькулятор",
        nav_about: "О компании",
        nav_contacts: "Контакты",
        status_text: "Работаем сейчас",
        cta_call: "Заказать звонок",
        menu_label: "Меню",
        hero_rating_mobile: "<strong>5.0</strong> — рейтинг на Google.Maps",
        hero_experience_mobile: "лет опыта в международных переездах",
        hero_association_mobile: "Член <strong>Международной Ассоциации</strong>",
        hero_stat_rating: "Рейтинг на Google.Maps",
        hero_stat_experience: "лет в международных переездах<br>и таможенном оформлении",
        hero_stat_association: "Intrelo — член Международной<br>Ассоциации Перевозчиков",
        hero_stat_moves: "успешных переездов<br>выполнено в 2025 году",
        prev_slide: "Предыдущий слайд",
        next_slide: "Следующий слайд",
        prev: "Назад",
        next: "Вперед",
        read_more: "Подробнее",
        form_name_label: "Ваше имя",
        form_name_placeholder: "Иван Иванов",
        form_phone_label: "Телефон",
        form_route_label: "Откуда → Куда",
        form_submit: "Получить расчёт",
        form_disclaimer: "Нажимая кнопку, вы соглашаетесь с<br>политикой конфиденциальности",
        contact_call: "Позвонить",
        contact_label: "Связаться",
        footer_col2_title: "Услуги",
        footer_col2_1: "Международные переезды",
        footer_col2_2: "Упаковка вещей",
        footer_col2_3: "Таможенное оформление",
        footer_col2_4: "Страхование груза",
        footer_col3_title: "Компания",
        footer_col3_1: "О компании",
        footer_col3_2: "Наши услуги",
        footer_col3_3: "Как это работает",
        footer_col3_4: "Контакты",
        footer_col4_title: "Помощь",
        footer_col4_1: "Калькулятор",
        footer_col4_2: "Часто задаваемые вопросы",
        footer_col4_3: "Отслеживание груза",
        footer_col4_4: "Политика конфиденциальности"
    },
    en: {
        nav_services: "Services",
        nav_destinations: "Destinations",
        nav_calculator: "Calculator",
        nav_about: "About",
        nav_contacts: "Contacts",
        status_text: "Available now",
        cta_call: "Request a call",
        menu_label: "Menu",
        hero_rating_mobile: "<strong>5.0</strong> — Google Maps rating",
        hero_experience_mobile: "years of international moving experience",
        hero_association_mobile: "Member of the <strong>International Movers Association</strong>",
        hero_stat_rating: "Google Maps rating",
        hero_stat_experience: "years in international moving<br>and customs clearance",
        hero_stat_association: "Intrelo — member of the International<br>Movers Association",
        hero_stat_moves: "successful relocations<br>completed in 2025",
        prev_slide: "Previous slide",
        next_slide: "Next slide",
        prev: "Back",
        next: "Forward",
        read_more: "Learn more",
        form_name_label: "Your name",
        form_name_placeholder: "John Smith",
        form_phone_label: "Phone",
        form_route_label: "From → To",
        form_submit: "Get a quote",
        form_disclaimer: "By clicking, you agree to our<br>privacy policy",
        contact_call: "Call us",
        contact_label: "Contact",
        footer_col2_title: "Services",
        footer_col2_1: "International moving",
        footer_col2_2: "Professional packing",
        footer_col2_3: "Customs clearance",
        footer_col2_4: "Cargo insurance",
        footer_col3_title: "Company",
        footer_col3_1: "About us",
        footer_col3_2: "Our services",
        footer_col3_3: "How it works",
        footer_col3_4: "Contacts",
        footer_col4_title: "Help",
        footer_col4_1: "Calculator",
        footer_col4_2: "Frequently asked questions",
        footer_col4_3: "Shipment tracking",
        footer_col4_4: "Privacy policy"
    },
    de: {
        nav_services: "Leistungen",
        nav_destinations: "Routen",
        nav_calculator: "Kalkulator",
        nav_about: "Über uns",
        nav_contacts: "Kontakt",
        status_text: "Jetzt erreichbar",
        cta_call: "Rückruf anfordern",
        menu_label: "Menü",
        hero_rating_mobile: "<strong>5.0</strong> — Google Maps Bewertung",
        hero_experience_mobile: "Jahre Erfahrung in internationalen Umzügen",
        hero_association_mobile: "Mitglied des <strong>Internationalen Umzugsverbands</strong>",
        hero_stat_rating: "Google Maps Bewertung",
        hero_stat_experience: "Jahre in internationalen Umzügen<br>und Zollabfertigung",
        hero_stat_association: "Intrelo — Mitglied des Internationalen<br>Umzugsverbands",
        hero_stat_moves: "erfolgreiche Umzüge<br>im Jahr 2025 durchgeführt",
        prev_slide: "Vorheriger Slide",
        next_slide: "Nächster Slide",
        prev: "Zurück",
        next: "Weiter",
        read_more: "Mehr erfahren",
        form_name_label: "Ihr Name",
        form_name_placeholder: "Max Mustermann",
        form_phone_label: "Telefon",
        form_route_label: "Von → Nach",
        form_submit: "Kalkulation anfordern",
        form_disclaimer: "Mit dem Klick stimmen Sie unserer<br>Datenschutzerklärung zu",
        contact_call: "Anrufen",
        contact_label: "Kontakt",
        footer_col2_title: "Leistungen",
        footer_col2_1: "Internationale Umzüge",
        footer_col2_2: "Verpackungsservice",
        footer_col2_3: "Zollabfertigung",
        footer_col2_4: "Frachtversicherung",
        footer_col3_title: "Unternehmen",
        footer_col3_1: "Über uns",
        footer_col3_2: "Unsere Leistungen",
        footer_col3_3: "So funktioniert es",
        footer_col3_4: "Kontakt",
        footer_col4_title: "Hilfe",
        footer_col4_1: "Kalkulator",
        footer_col4_2: "Häufige Fragen",
        footer_col4_3: "Sendungsverfolgung",
        footer_col4_4: "Datenschutz"
    }
};

// ─── Template Engine ─────────────────────────────────────

/**
 * Resolve a dot-separated path on an object, e.g. "seo.title" → data.seo.title
 */
function resolvePath(obj, pathStr) {
    return pathStr.split('.').reduce((acc, key) => {
        if (acc == null) return undefined;
        return acc[key];
    }, obj);
}

/**
 * Find the outermost {{#each ...}} block (matching the correct {{/each}}).
 * Returns { before, arrayPath, innerTemplate, after } or null.
 */
function findOutermostEach(html) {
    const openTag = /\{\{#each\s+([\w.]+)\}\}/g;
    const match = openTag.exec(html);
    if (!match) return null;

    const startIdx = match.index;
    const afterOpen = startIdx + match[0].length;
    const arrayPath = match[1];

    // Find matching {{/each}} accounting for nesting
    let depth = 1;
    let i = afterOpen;
    const openRe = /\{\{#each\s+[\w.]+\}\}/g;
    const closeRe = /\{\{\/each\}\}/g;

    while (depth > 0 && i < html.length) {
        openRe.lastIndex = i;
        closeRe.lastIndex = i;
        const nextOpen = openRe.exec(html);
        const nextClose = closeRe.exec(html);

        if (!nextClose) break; // unmatched

        if (nextOpen && nextOpen.index < nextClose.index) {
            depth++;
            i = nextOpen.index + nextOpen[0].length;
        } else {
            depth--;
            if (depth === 0) {
                return {
                    before: html.slice(0, startIdx),
                    arrayPath,
                    innerTemplate: html.slice(afterOpen, nextClose.index),
                    after: html.slice(nextClose.index + nextClose[0].length)
                };
            }
            i = nextClose.index + nextClose[0].length;
        }
    }

    return null; // unmatched
}

/**
 * Recursively render template with context stack.
 * contextStack: array of objects, innermost last. Lookup checks from last to first.
 */
function render(html, contextStack) {
    let result = html;

    // Process outermost {{#each}} blocks one at a time
    let parsed;
    let output = '';
    let remaining = result;

    while ((parsed = findOutermostEach(remaining)) !== null) {
        // Add the part before the each block (with placeholder substitution)
        output += parsed.before;

        const arr = resolveFromStack(contextStack, parsed.arrayPath);
        if (!Array.isArray(arr)) {
            console.warn(`  ⚠ {{#each ${parsed.arrayPath}}} — not an array, skipping`);
        } else {
            // Expand the each block
            for (let idx = 0; idx < arr.length; idx++) {
                const item = arr[idx];
                let segment = parsed.innerTemplate;

                // Handle {{@index}}, {{#if @first}}, {{#if @last}}
                segment = segment.replace(/\{\{@index\}\}/g, String(idx));
                segment = segment.replace(/\{\{#if @first\}\}([\s\S]*?)\{\{\/if\}\}/g,
                    idx === 0 ? '$1' : '');
                segment = segment.replace(/\{\{#if @last\}\}([\s\S]*?)\{\{\/if\}\}/g,
                    idx === arr.length - 1 ? '$1' : '');

                // Handle generic {{#if prop}}...{{/if}} for boolean properties
                segment = segment.replace(/\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
                    (m, prop, content) => {
                        const val = (typeof item === 'object' && item !== null)
                            ? resolvePath(item, prop)
                            : undefined;
                        return val ? content : '';
                    });

                // Build child context
                let childCtx;
                if (typeof item === 'object' && item !== null) {
                    childCtx = item;
                } else {
                    childCtx = { __this__: item };
                }

                // Recursively render (handles nested {{#each}} and placeholders)
                output += render(segment, [...contextStack, childCtx]);
            }
        }

        remaining = parsed.after;
    }
    output += remaining;

    // Now substitute simple placeholders in the final output
    output = output.replace(/\{\{([\w.]+)\}\}/g, (match, pathStr) => {
        if (pathStr === 'this') {
            // Resolve {{this}} from the innermost context
            const top = contextStack[contextStack.length - 1];
            if (top && top.__this__ !== undefined) return String(top.__this__);
            return match;
        }
        const val = resolveFromStack(contextStack, pathStr);
        if (val !== undefined && val !== null && typeof val !== 'object') return String(val);
        return match;
    });

    return output;
}

/**
 * Resolve a dotted path by searching the context stack from innermost to outermost.
 */
function resolveFromStack(contextStack, pathStr) {
    // Try from innermost context to outermost
    for (let i = contextStack.length - 1; i >= 0; i--) {
        const val = resolvePath(contextStack[i], pathStr);
        if (val !== undefined) return val;
    }
    return undefined;
}

/**
 * Full template render entry point
 */
function renderTemplate(template, data) {
    return render(template, [data]);
}

// ─── Data Preprocessing ─────────────────────────────────

/**
 * Transform raw JSON data to match template expectations
 */
function preprocessData(data) {
    // asset_prefix is set before calling this function (../../ or ../../../)

    // UI translations — merge defaults, allow JSON to override
    const lang = data.lang || 'ru';
    data.ui = { ...(UI_DEFAULTS[lang] || UI_DEFAULTS.ru), ...(data.ui || {}) };

    // Phone raw (strip formatting for tel: links)
    if (data.footer && data.footer.phone) {
        data.footer.phone_raw = data.footer.phone.replace(/[\s()\-]/g, '');
    }

    // CTA title: \n → <br>
    if (data.cta && data.cta.title) {
        data.cta.title_html = data.cta.title.replace(/\n/g, '<br>');
    }

    // Services: resolve icon SVGs
    if (data.services && data.services.cards) {
        data.services.cards = data.services.cards.map(card => ({
            ...card,
            icon_svg: SERVICE_ICONS[card.icon] || ''
        }));
    }

    // Advantages: add icon SVGs (cycle through available icons)
    if (data.advantages && data.advantages.cards) {
        data.advantages.cards = data.advantages.cards.map((card, i) => ({
            ...card,
            icon_svg: ADVANTAGE_ICONS[i % ADVANTAGE_ICONS.length]
        }));
    }

    // Pricing plans: resolve icon SVGs and pair values with labels
    if (data.pricing) {
        const labels = data.pricing.features_labels || [];
        data.pricing.plans = (data.pricing.plans || []).map(plan => ({
            ...plan,
            icon_svg: PRICING_ICONS[plan.icon] || '',
            values: (plan.values || []).map((val, i) => ({
                label: labels[i] || '',
                value: val
            }))
        }));

        // Semantic <table> structure: transpose plans into rows for template
        data.pricing.plan_names = data.pricing.plans.map(p => ({ name: p.name }));
        data.pricing.table_rows = labels.map((label, i) => ({
            label: label,
            cells: data.pricing.plans.map(p => ({
                cell_value: (p.values[i] && p.values[i].value) ? p.values[i].value : ''
            }))
        }));
    }

    return data;
}

// ─── SEO Preprocessing ──────────────────────────────────

const OG_LOCALES = { ru: 'ru_RU', en: 'en_US', de: 'de_DE' };
const HOME_NAMES = { ru: 'Главная', en: 'Home', de: 'Startseite' };
const SERVICE_NAMES = {
    ru: 'Международные переезды',
    en: 'International Moving',
    de: 'Internationaler Umzug'
};

/**
 * Build a fully-localized URL path for a route.
 * E.g. RU: /mezhdunarodnyj-pereezd/germaniya-rossiya/
 *      EN: /en/international-moving/germany-russia/
 *      DE: /de/internationaler-umzug/deutschland-russland/
 */
function buildLocalizedPath(lang, defaults, routeFrom, routeTo) {
    const langPrefix = defaults.url_lang_prefix[lang] || '';
    const servicePrefix = defaults.url_service_prefix[lang] || 'international-moving';
    const fromSlug = (defaults.country_slugs[routeFrom] || {})[lang] || routeFrom.toLowerCase();
    const toSlug = (defaults.country_slugs[routeTo] || {})[lang] || routeTo.toLowerCase();
    const routeSlug = `${fromSlug}-${toSlug}`;

    if (langPrefix) {
        return `/${langPrefix}/${servicePrefix}/${routeSlug}/`;
    }
    return `/${servicePrefix}/${routeSlug}/`;
}

/**
 * Pre-compute all SEO fields for a route: canonical, hreflang, OG, breadcrumbs, JSON-LD.
 */
function preprocessSeo(data, defaults) {
    const lang = data.lang || 'ru';
    const domain = defaults.site.domain; // https://intrelo.com
    const routeFrom = data.route.from;
    const routeTo = data.route.to;

    // Localized path for this page
    const localPath = buildLocalizedPath(lang, defaults, routeFrom, routeTo);

    // Canonical URL
    data.seo.canonical = domain + localPath;

    // OG fields (check nested seo.og object from JSON, then flat, then fallback)
    const ogData = data.seo.og || {};
    data.seo.og_locale = OG_LOCALES[lang] || 'en_US';
    data.seo.og_title = data.seo.og_title || ogData.title || data.seo.title;
    data.seo.og_description = data.seo.og_description || ogData.description || data.seo.description;
    data.seo.og_image = data.seo.og_image || (ogData.image ? domain + ogData.image : domain + '/assets/og-default.jpg');

    // Hreflang tags — links to all language versions of this route
    const hreflangLangs = ['ru', 'en', 'de'];
    data.seo.hreflang_tags = hreflangLangs.map(hl => ({
        lang: hl,
        href: domain + buildLocalizedPath(hl, defaults, routeFrom, routeTo)
    }));
    // x-default → EN version
    data.seo.hreflang_tags.push({
        lang: 'x-default',
        href: domain + buildLocalizedPath('en', defaults, routeFrom, routeTo)
    });

    // Breadcrumbs (for HTML and structured data)
    const serviceUrl = defaults.url_lang_prefix[lang]
        ? `${domain}/${defaults.url_lang_prefix[lang]}/${defaults.url_service_prefix[lang]}/`
        : `${domain}/${defaults.url_service_prefix[lang]}/`;
    const homeUrl = defaults.url_lang_prefix[lang]
        ? `${domain}/${defaults.url_lang_prefix[lang]}/`
        : `${domain}/`;

    data.seo.breadcrumbs = [
        { name: HOME_NAMES[lang] || 'Home', url: homeUrl, position: '1' },
        { name: SERVICE_NAMES[lang] || 'International Moving', url: serviceUrl, position: '2' },
        { name: `${data.route.from_local} → ${data.route.to_local}`, position: '3' }
    ];

    // ── JSON-LD: Organization ──
    const org = defaults.organization;
    const addr = org.address[lang] || org.address.en;
    data.seo.jsonld_organization = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": org.name,
        "legalName": org.legal_name,
        "url": org.url,
        "logo": org.logo,
        "telephone": org.phone,
        "email": org.email,
        "foundingDate": String(org.founding_year),
        "sameAs": [org.social.telegram, org.social.whatsapp],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": addr.street,
            "addressLocality": addr.city,
            "addressCountry": addr.country
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": org.rating.value,
            "reviewCount": org.rating.count,
            "bestRating": org.rating.best
        }
    });

    // ── JSON-LD: BreadcrumbList ──
    data.seo.jsonld_breadcrumbs = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": data.seo.breadcrumbs.map((bc, i) => {
            const entry = {
                "@type": "ListItem",
                "position": i + 1,
                "name": bc.name
            };
            if (bc.url) entry.item = bc.url;
            return entry;
        })
    });

    // ── JSON-LD: FAQPage ──
    if (data.faq && data.faq.items && data.faq.items.length > 0) {
        data.seo.jsonld_faq = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.faq.items.map(item => ({
                "@type": "Question",
                "name": item.q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.a
                }
            }))
        });
    } else {
        data.seo.jsonld_faq = '{}';
    }

    return data;
}

// ─── City-Level Page Generation ─────────────────────────

/**
 * Templates for city-level SEO fields per language.
 */
const CITY_TITLE = {
    ru: (fc, tc) => `Переезд ${fc} → ${tc} — перевозка вещей под ключ | Intrelo`,
    en: (fc, tc) => `Moving from ${fc} to ${tc} — Door-to-Door Service | Intrelo`,
    de: (fc, tc) => `Umzug ${fc} → ${tc} — Tür-zu-Tür Service | Intrelo`
};
const CITY_H1 = {
    ru: { line1: (fc) => `Перевозка вещей`, line2: (fc, tc) => `${fc}\u00a0→\u00a0${tc}` },
    en: { line1: (fc) => `Moving from\u00a0${fc}`, line2: (fc, tc) => `to\u00a0${tc}` },
    de: { line1: (fc) => `Umzug von\u00a0${fc}`, line2: (fc, tc) => `nach\u00a0${tc}` }
};
const CITY_DESC = {
    ru: (fc, tc, ff, tf) => `Переезд ${fc} → ${tc}. ${ff}. ${tf}. Упаковка, таможенное оформление, доставка door-to-door. 20 лет опыта.`,
    en: (fc, tc, ff, tf) => `Moving from ${fc} to ${tc}. ${ff}. ${tf}. Professional packing, customs clearance, door-to-door delivery.`,
    de: (fc, tc, ff, tf) => `Umzug ${fc} → ${tc}. ${ff}. ${tf}. Verpackung, Zollabfertigung, Tür-zu-Tür-Lieferung.`
};

/**
 * Find a country object in the cities catalog by English name.
 */
function findCountryInCatalog(catalog, countryName) {
    for (const region of Object.values(catalog.regions)) {
        for (const [countryId, country] of Object.entries(region.countries)) {
            if (country.name.en === countryName) return country;
        }
    }
    return null;
}

/**
 * Build a city-level URL path.
 * E.g. RU: /mezhdunarodnyj-pereezd/germaniya-rossiya/berlin-moskva/
 *      EN: /en/international-moving/germany-russia/berlin-moscow/
 */
function buildCityPath(lang, defaults, routeFrom, routeTo, cityFromSlug, cityToSlug) {
    const countryPath = buildLocalizedPath(lang, defaults, routeFrom, routeTo);
    // countryPath ends with /, so append city slug
    return `${countryPath}${cityFromSlug}-${cityToSlug}/`;
}

/**
 * Generate city-level page data by cloning country data and overriding SEO fields.
 */
function buildCityPageData(countryData, cityFrom, cityTo, lang, defaults, catalog) {
    // Deep clone the country data
    const data = JSON.parse(JSON.stringify(countryData));

    const fcName = cityFrom.name[lang];
    const tcName = cityTo.name[lang];
    const fcFact = cityFrom.local_facts[lang];
    const tcFact = cityTo.local_facts[lang];
    const fcSlug = cityFrom.slug[lang];
    const tcSlug = cityTo.slug[lang];

    // Override SEO
    const tpl = CITY_TITLE[lang] || CITY_TITLE.en;
    data.seo.title = tpl(fcName, tcName);
    data.seo.description = (CITY_DESC[lang] || CITY_DESC.en)(fcName, tcName, fcFact, tcFact);

    const h1 = CITY_H1[lang] || CITY_H1.en;
    data.seo.h1_line1 = h1.line1(fcName);
    data.seo.h1_line2 = h1.line2(fcName, tcName);

    // Override hero subtitle with city-specific mention
    const cityMention = lang === 'ru'
        ? `${fcName} — ${fcFact}. ${tcName} — ${tcFact}.`
        : lang === 'de'
            ? `${fcName} — ${fcFact}. ${tcName} — ${tcFact}.`
            : `${fcName} — ${fcFact}. ${tcName} — ${tcFact}.`;
    data.hero.subtitle = data.hero.subtitle.split('.').slice(0, 2).join('.') + '. ' + cityMention;

    // Override OG
    data.seo.og_title = data.seo.title;
    data.seo.og_description = data.seo.description;
    // Clear nested og so preprocessSeo uses the flat overrides
    delete data.seo.og;

    // City route metadata
    data.city_route = {
        from: cityFrom,
        to: cityTo,
        from_slug: fcSlug,
        to_slug: tcSlug,
        localized_slug: `${fcSlug}-${tcSlug}`
    };

    // CTA form placeholder with city names
    if (data.cta) {
        data.cta.form_route_placeholder = `${fcName} → ${tcName}`;
    }

    return data;
}

/**
 * Pre-compute SEO for a city-level page (extends preprocessSeo with 4-level breadcrumbs).
 */
function preprocessCitySeo(data, defaults) {
    const lang = data.lang || 'ru';
    const domain = defaults.site.domain;
    const routeFrom = data.route.from;
    const routeTo = data.route.to;
    const cr = data.city_route;

    // City-level canonical
    const cityPath = buildCityPath(lang, defaults, routeFrom, routeTo, cr.from_slug, cr.to_slug);
    data.seo.canonical = domain + cityPath;

    // OG
    const ogData = data.seo.og || {};
    data.seo.og_locale = OG_LOCALES[lang] || 'en_US';
    data.seo.og_title = data.seo.og_title || ogData.title || data.seo.title;
    data.seo.og_description = data.seo.og_description || ogData.description || data.seo.description;
    data.seo.og_image = data.seo.og_image || (domain + '/assets/og-default.jpg');

    // Hreflang (city-level across all 3 languages)
    const hreflangLangs = ['ru', 'en', 'de'];
    data.seo.hreflang_tags = hreflangLangs.map(hl => ({
        lang: hl,
        href: domain + buildCityPath(hl, defaults, routeFrom, routeTo,
            cr.from.slug[hl], cr.to.slug[hl])
    }));
    data.seo.hreflang_tags.push({
        lang: 'x-default',
        href: domain + buildCityPath('en', defaults, routeFrom, routeTo,
            cr.from.slug.en, cr.to.slug.en)
    });

    // 4-level breadcrumbs: Home → Service → Country Route → City Route
    const countryPath = buildLocalizedPath(lang, defaults, routeFrom, routeTo);
    const homeUrl = defaults.url_lang_prefix[lang]
        ? `${domain}/${defaults.url_lang_prefix[lang]}/`
        : `${domain}/`;
    const serviceUrl = defaults.url_lang_prefix[lang]
        ? `${domain}/${defaults.url_lang_prefix[lang]}/${defaults.url_service_prefix[lang]}/`
        : `${domain}/${defaults.url_service_prefix[lang]}/`;

    data.seo.breadcrumbs = [
        { name: HOME_NAMES[lang] || 'Home', url: homeUrl, position: '1' },
        { name: SERVICE_NAMES[lang] || 'International Moving', url: serviceUrl, position: '2' },
        { name: `${data.route.from_local} → ${data.route.to_local}`, url: domain + countryPath, position: '3' },
        { name: `${cr.from.name[lang]} → ${cr.to.name[lang]}`, position: '4' }
    ];

    // JSON-LD: Organization (same as country level)
    const org = defaults.organization;
    const addr = org.address[lang] || org.address.en;
    data.seo.jsonld_organization = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": org.name, "legalName": org.legal_name,
        "url": org.url, "logo": org.logo,
        "telephone": org.phone, "email": org.email,
        "foundingDate": String(org.founding_year),
        "sameAs": [org.social.telegram, org.social.whatsapp],
        "address": { "@type": "PostalAddress", "streetAddress": addr.street, "addressLocality": addr.city, "addressCountry": addr.country },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": org.rating.value, "reviewCount": org.rating.count, "bestRating": org.rating.best }
    });

    // JSON-LD: BreadcrumbList (4 levels)
    data.seo.jsonld_breadcrumbs = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": data.seo.breadcrumbs.map((bc, i) => {
            const entry = { "@type": "ListItem", "position": i + 1, "name": bc.name };
            if (bc.url) entry.item = bc.url;
            return entry;
        })
    });

    // JSON-LD: FAQPage
    if (data.faq && data.faq.items && data.faq.items.length > 0) {
        data.seo.jsonld_faq = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.faq.items.map(item => ({
                "@type": "Question", "name": item.q,
                "acceptedAnswer": { "@type": "Answer", "text": item.a }
            }))
        });
    } else {
        data.seo.jsonld_faq = '{}';
    }

    return data;
}

// ─── File Operations ─────────────────────────────────────

/**
 * Recursively copy a directory
 */
function copyDirSync(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

/**
 * Ensure directory exists
 */
function ensureDirSync(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

// ─── Index Page Generator ────────────────────────────────

function generateIndexPage(routes, defaults) {
    const LANG_LABELS = { ru: 'Русский', en: 'English', de: 'Deutsch' };

    // Group routes by language
    const byLang = {};
    for (const r of routes) {
        const lang = r.lang || 'ru';
        if (!byLang[lang]) byLang[lang] = [];
        byLang[lang].push(r);
    }

    let sections = '';
    for (const lang of ['ru', 'en', 'de']) {
        const langRoutes = byLang[lang];
        if (!langRoutes) continue;

        const servicePrefix = defaults.url_service_prefix[lang] || 'international-moving';

        const links = langRoutes.map(r => {
            const name = `${r.route.from_local} → ${r.route.to_local}`;
            const localSlug = r.route.localized_slug || r.route.slug;
            const href = lang === 'ru'
                ? `${servicePrefix}/${localSlug}/index.html`
                : `${lang}/${servicePrefix}/${localSlug}/index.html`;
            return `        <li><a href="${href}">${name}</a> — ${r.seo.title}</li>`;
        }).join('\n');

        sections += `
    <h2>${LANG_LABELS[lang] || lang}</h2>
    <ul>
${links}
    </ul>`;
    }

    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Intrelo — Международные переезды</title>
    <link rel="stylesheet" href="css/styles.css">
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #1C1C1C; }
        h2 { color: #333; margin-top: 32px; }
        ul { list-style: none; padding: 0; }
        li { margin: 16px 0; padding: 16px; background: #f3f4f6; border-radius: 12px; }
        a { color: #EB2A2A; text-decoration: none; font-weight: 600; font-size: 18px; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>Intrelo — Международные переезды</h1>
    <p>Выберите направление:</p>${sections}
</body>
</html>`;
}

// ─── Main Build ──────────────────────────────────────────

function build() {
    console.log('\n🔨 INTERCARGO Static Site Generator v2.0\n');

    // 1. Read defaults
    if (!fs.existsSync(DEFAULTS_PATH)) {
        console.error('❌ data/defaults.json not found at', DEFAULTS_PATH);
        process.exit(1);
    }
    const defaults = JSON.parse(fs.readFileSync(DEFAULTS_PATH, 'utf-8'));
    console.log('⚙️  Defaults loaded:', DEFAULTS_PATH);

    // 1b. Read cities catalog (optional)
    let catalog = null;
    if (fs.existsSync(CITIES_PATH)) {
        catalog = JSON.parse(fs.readFileSync(CITIES_PATH, 'utf-8'));
        console.log('🏙️  Cities catalog loaded:', CITIES_PATH);
    } else {
        console.log('⚠️  No cities catalog — skipping city-level pages');
    }

    // 2. Read template
    if (!fs.existsSync(TEMPLATE_PATH)) {
        console.error('❌ template.html not found at', TEMPLATE_PATH);
        process.exit(1);
    }
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    console.log('📄 Template loaded:', TEMPLATE_PATH);

    // 3. Read route JSONs
    if (!fs.existsSync(ROUTES_DIR)) {
        console.error('❌ routes/ directory not found at', ROUTES_DIR);
        process.exit(1);
    }
    const jsonFiles = fs.readdirSync(ROUTES_DIR).filter(f => f.endsWith('.json'));
    if (jsonFiles.length === 0) {
        console.error('❌ No JSON files found in', ROUTES_DIR);
        process.exit(1);
    }
    console.log(`📂 Found ${jsonFiles.length} route files\n`);

    // 4. Clean and prepare output
    if (fs.existsSync(OUTPUT_DIR)) {
        fs.rmSync(OUTPUT_DIR, { recursive: true });
    }
    ensureDirSync(OUTPUT_DIR);

    // 5. Copy static assets
    console.log('📦 Copying static assets...');
    copyDirSync(path.join(ROOT, 'css'), path.join(OUTPUT_DIR, 'css'));
    copyDirSync(path.join(ROOT, 'js'), path.join(OUTPUT_DIR, 'js'));
    copyDirSync(path.join(ROOT, 'assets'), path.join(OUTPUT_DIR, 'assets'));
    console.log('   ✅ css/, js/, assets/ copied\n');

    // 6. Generate pages
    const routeData = [];
    const sitemapEntries = [];

    for (const file of jsonFiles) {
        const filePath = path.join(ROUTES_DIR, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        let data;

        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error(`   ❌ JSON parse error in ${file}:`, e.message);
            continue;
        }

        const lang = data.lang || 'ru';
        const routeFrom = data.route.from;
        const routeTo = data.route.to;

        // Build localized URL segments
        const servicePrefix = defaults.url_service_prefix[lang] || 'international-moving';
        const fromSlug = (defaults.country_slugs[routeFrom] || {})[lang] || routeFrom.toLowerCase();
        const toSlug = (defaults.country_slugs[routeTo] || {})[lang] || routeTo.toLowerCase();
        const localizedSlug = `${fromSlug}-${toSlug}`;

        // Determine output path with localized segments
        // ru → output/{servicePrefix}/{localizedSlug}/index.html  (asset_prefix ../../)
        // en → output/en/{servicePrefix}/{localizedSlug}/index.html  (asset_prefix ../../../)
        // de → output/de/{servicePrefix}/{localizedSlug}/index.html  (asset_prefix ../../../)
        let outDir, relPath, assetPrefix;

        if (lang === 'ru') {
            outDir = path.join(OUTPUT_DIR, servicePrefix, localizedSlug);
            relPath = `${servicePrefix}/${localizedSlug}/index.html`;
            assetPrefix = '../../';
        } else {
            outDir = path.join(OUTPUT_DIR, lang, servicePrefix, localizedSlug);
            relPath = `${lang}/${servicePrefix}/${localizedSlug}/index.html`;
            assetPrefix = '../../../';
        }

        // Store localized slug back into route for downstream use
        data.route.localized_slug = localizedSlug;

        // Set asset prefix and preprocess UI/data
        data.asset_prefix = assetPrefix;
        preprocessData(data);

        // Preprocess SEO (canonical, hreflang, OG, breadcrumbs, JSON-LD)
        preprocessSeo(data, defaults);

        routeData.push(data);

        // Collect sitemap entry
        sitemapEntries.push({
            loc: data.seo.canonical,
            lastmod: new Date().toISOString().split('T')[0],
            hreflang_tags: data.seo.hreflang_tags
        });

        // Render HTML
        const html = renderTemplate(template, data);

        // Write output
        ensureDirSync(outDir);
        const outPath = path.join(outDir, 'index.html');
        fs.writeFileSync(outPath, html, 'utf-8');

        console.log(`   ✅ ${localizedSlug} [${lang}] → output/${relPath}`);
    }

    // 7. Generate city-level pages from catalog
    let cityPageCount = 0;
    if (catalog) {
        console.log('\n🏙️  Generating city-level pages...\n');

        for (const countryData of routeData) {
            const lang = countryData.lang || 'ru';
            const routeFrom = countryData.route.from;
            const routeTo = countryData.route.to;

            // Find from/to countries in catalog
            const fromCountry = findCountryInCatalog(catalog, routeFrom);
            const toCountry = findCountryInCatalog(catalog, routeTo);

            if (!fromCountry || !toCountry) continue;
            if (!fromCountry.enabled || !toCountry.enabled) continue;

            const fromCities = fromCountry.cities.filter(c => c.enabled);
            const toCities = toCountry.cities.filter(c => c.enabled);

            if (fromCities.length === 0 || toCities.length === 0) continue;

            // URL segments for this country route
            const servicePrefix = defaults.url_service_prefix[lang] || 'international-moving';
            const countryFromSlug = (defaults.country_slugs[routeFrom] || {})[lang] || routeFrom.toLowerCase();
            const countryToSlug = (defaults.country_slugs[routeTo] || {})[lang] || routeTo.toLowerCase();
            const countrySlug = `${countryFromSlug}-${countryToSlug}`;

            for (const cityFrom of fromCities) {
                for (const cityTo of toCities) {
                    // Build city page data
                    const cityData = buildCityPageData(countryData, cityFrom, cityTo, lang, defaults, catalog);
                    const citySlug = cityData.city_route.localized_slug;

                    // Output path: one level deeper than country
                    let outDir, relPath, assetPrefix;
                    if (lang === 'ru') {
                        outDir = path.join(OUTPUT_DIR, servicePrefix, countrySlug, citySlug);
                        relPath = `${servicePrefix}/${countrySlug}/${citySlug}/index.html`;
                        assetPrefix = '../../../';
                    } else {
                        outDir = path.join(OUTPUT_DIR, lang, servicePrefix, countrySlug, citySlug);
                        relPath = `${lang}/${servicePrefix}/${countrySlug}/${citySlug}/index.html`;
                        assetPrefix = '../../../../';
                    }

                    cityData.asset_prefix = assetPrefix;
                    preprocessData(cityData);
                    preprocessCitySeo(cityData, defaults);

                    // Sitemap
                    sitemapEntries.push({
                        loc: cityData.seo.canonical,
                        lastmod: new Date().toISOString().split('T')[0],
                        hreflang_tags: cityData.seo.hreflang_tags
                    });

                    // Render & write
                    const html = renderTemplate(template, cityData);
                    ensureDirSync(outDir);
                    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
                    cityPageCount++;
                }
            }

            if (fromCities.length > 0 && toCities.length > 0) {
                console.log(`   🏙️  ${routeFrom}→${routeTo} [${lang}]: ${fromCities.length}×${toCities.length} = ${fromCities.length * toCities.length} city pages`);
            }
        }

        console.log(`\n   ✅ Total city pages: ${cityPageCount}`);
    }

    // 8. Generate index page (country-level only)
    const indexHtml = generateIndexPage(routeData, defaults);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf-8');
    console.log('\n   ✅ Index page → output/index.html');

    // 8. Generate sitemap.xml
    const sitemapXml = generateSitemap(sitemapEntries, defaults.site.domain);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
    console.log('   ✅ Sitemap → output/sitemap.xml');

    // 9. Generate robots.txt
    const robotsTxt = generateRobots(defaults.site.domain);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), robotsTxt, 'utf-8');
    console.log('   ✅ Robots → output/robots.txt');

    const totalPages = routeData.length + cityPageCount;
    console.log(`\n✨ Done! ${totalPages} pages generated (${routeData.length} country + ${cityPageCount} city).\n`);
}

// ─── Sitemap Generator ───────────────────────────────────

function generateSitemap(entries, domain) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    // Homepage
    xml += '  <url>\n';
    xml += `    <loc>${domain}/</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // Route pages
    for (const entry of entries) {
        xml += '  <url>\n';
        xml += `    <loc>${entry.loc}</loc>\n`;
        xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.8</priority>\n';

        // Hreflang annotations in sitemap
        for (const hl of entry.hreflang_tags) {
            xml += `    <xhtml:link rel="alternate" hreflang="${hl.lang}" href="${hl.href}" />\n`;
        }

        xml += '  </url>\n';
    }

    xml += '</urlset>\n';
    return xml;
}

// ─── Robots.txt Generator ────────────────────────────────

function generateRobots(domain) {
    return `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap.xml
`;
}

// Run
build();
