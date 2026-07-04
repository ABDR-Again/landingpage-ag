import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sectionDir = path.join(root, 'src', 'sections');

const sections = [
  {
    key: 'hero',
    file: 'hero_section.html',
    title: 'Hero',
    sectionId: 'hs-hero-section',
    moduleFile: 'hero.js',
    exportName: 'initHero',
    eager: true,
    customModule: true,
  },
  {
    key: 'renovation-dilemma',
    file: 'renovation_dilemma_section (1).html',
    title: 'Renovation Dilemma',
    sectionId: 'rd-section',
    moduleFile: 'renovation-dilemma.js',
    exportName: 'initRenovationDilemma',
  },
  {
    key: 'solution',
    file: 'our_solution.html',
    title: 'Our Solution',
    sectionId: 'os-section',
  },
  {
    key: 'services',
    file: 'services_section (1).html',
    title: 'Services',
    sectionId: 'srv-section',
    moduleFile: 'services.js',
    exportName: 'initServices',
  },
  {
    key: 'projects',
    file: 'project_gallery_section (1).html',
    title: 'Projects',
    sectionId: 'our-projects-section',
    moduleFile: 'projects.js',
    exportName: 'initProjects',
  },
  {
    key: 'reviews',
    file: 'reviews_section (1).html',
    title: 'Reviews',
    sectionId: 'cr-reviews-section',
    moduleFile: 'reviews.js',
    exportName: 'initReviews',
  },
  {
    key: 'client-stories',
    file: 'client_stories_section.html',
    title: 'Video Testimonials',
    sectionId: 'client-stories-section',
    moduleFile: 'client-stories.js',
    exportName: 'initClientStories',
    customModule: true,
  },
  {
    key: 'picture-testimonials',
    file: 'testimonials_section (1).html',
    title: 'Picture Testimonials',
    sectionId: 'tsm-section',
    moduleFile: 'picture-testimonials.js',
    exportName: 'initPictureTestimonials',
    customModule: true,
  },
  {
    key: 'founder',
    file: 'founder_section.html',
    title: 'Founder',
    sectionId: 'fnd-section',
    moduleFile: 'founder.js',
    exportName: 'initFounder',
  },
  {
    key: 'faq',
    file: 'faq_section.html',
    title: 'FAQ',
    sectionId: 'faq-section',
    moduleFile: 'faq.js',
    exportName: 'initFaq',
  },
  {
    key: 'start-project',
    file: 'start_your_project_section.html',
    title: 'Start Project',
    sectionId: 'syp-section',
    moduleFile: 'start-project.js',
    exportName: 'initStartProject',
  },
];

const videoEmbeds = [
  'https://www.youtube.com/embed/EtA7BSqWoIk',
  'https://www.youtube.com/embed/sYP9J7smT0U',
  'https://www.youtube.com/embed/L9vh8-w270g',
  'https://www.youtube.com/embed/4tUDPCJde24',
];

const pictureClients = [
  'Alexandra Neto',
  'Ksenia Belova',
  'Leonardo Ramirez',
  'Rupert Tubbs',
  'Dani Coyle',
  'Carys Blackman-Rogers',
  'Simon Wain',
  'Natalie Sloan',
];

function stripFontImports(css) {
  return css
    .replace(/@import\s+url\([^)]*fonts\.googleapis[^)]*\);\s*/g, '')
    .replace(/--font-script:\s*'Dancing Script'[^;]+;/g, "--font-script: 'Cormorant Garamond', serif;")
    .replace(/letter-spacing:\s*-0\.02em;/g, 'letter-spacing: 0;')
    .trim();
}

function extractStyles(raw) {
  return [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((match) => stripFontImports(match[1]))
    .filter(Boolean)
    .join('\n\n');
}

function extractScripts(raw) {
  return [...raw.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1].trim())
    .filter(Boolean)
    .join('\n\n');
}

function extractSection(raw) {
  const withoutHeadAssets = raw
    .replace(/<!DOCTYPE[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*?<\/html>/i, '')
    .replace(/<link[^>]*fonts\.googleapis[^>]*>\s*/g, '')
    .replace(/<link[^>]*fonts\.gstatic[^>]*>\s*/g, '')
    .replace(/<script[^>]*cdn\.tailwindcss\.com[^>]*><\/script>\s*/g, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>\s*/g, '')
    .replace(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>\s*/g, '');

  const match = withoutHeadAssets.match(/<section[\s\S]*<\/section>/i);
  if (match) {
    return match[0].trim();
  }

  const sectionStart = withoutHeadAssets.search(/<section/i);
  if (sectionStart !== -1) {
    const scriptStart = withoutHeadAssets.indexOf('<script', sectionStart);
    const end = scriptStart === -1 ? withoutHeadAssets.length : scriptStart;
    return `${withoutHeadAssets.slice(sectionStart, end).trim()}\n</section>`;
  }

  throw new Error('No section tag found.');
}

function unwrapDomReady(script) {
  const listenerIndex = script.search(/document\.addEventListener\((['"])DOMContentLoaded\1\s*,\s*\(\)\s*=>\s*\{/);
  if (listenerIndex === -1) {
    return script.trim();
  }

  const openBrace = script.indexOf('{', listenerIndex);
  const close = script.lastIndexOf('});');
  if (openBrace === -1 || close === -1 || close <= openBrace) {
    return script.trim();
  }

  return script.slice(openBrace + 1, close).trim();
}

function indent(code, spaces = 2) {
  const pad = ' '.repeat(spaces);
  return code
    .split('\n')
    .map((line) => (line.trim() ? `${pad}${line}` : ''))
    .join('\n');
}

function createModule(config, script) {
  let body = unwrapDomReady(script);

  if (config.key === 'projects') {
    body = body.replace(
      'openLightbox(img.src);',
      "const rawSrc = img.dataset.fullSrc || img.getAttribute('src');\n          if (rawSrc) openLightbox(img.currentSrc || img.src);",
    );
  }

  return `export function ${config.exportName}() {
  const rootSection = document.getElementById(${JSON.stringify(config.sectionId)});
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

${indent(body, 2)}
}
`;
}

function prepareSection(config, section) {
  let next = section;

  if (config.key === 'hero') {
    next = next
      .replace(/<source([^>]+)srcset="">/g, '<source$1data-srcset="">')
      .replace(/<img src=""([^>]+class="hs-bg-picture")/g, '<img$1')
      .replace('href="#projects"', 'href="#syp-section"');
  }

  if (config.key === 'services') {
    next = next.replaceAll('src="image_5717b7.jpg"', 'data-src=""');
  }

  if (config.key === 'projects') {
    next = next
      .replaceAll('src="image_e8b17c.jpg"', 'data-src=""')
      .replaceAll('cursor-none', 'cursor-pointer');
  }

  if (config.key === 'reviews') {
    next = next
      .replace('<section class="cr-reviews-section">', '<section id="cr-reviews-section" class="cr-reviews-section">')
      .replace(/<img[^>]+alt="Google"[^>]*>/g, '<span class="cr-logo-word cr-google-word">Google</span>')
      .replace(/<img[^>]+alt="Trustpilot"[^>]*>/g, '<span class="cr-logo-word cr-trustpilot-word">Trustpilot</span>');
  }

  if (config.key === 'client-stories') {
    let index = 0;
    next = next
      .replace(/src=""/g, () => `data-src="${videoEmbeds[index++] ?? ''}"`)
      .replace('id="cs-main-video"', 'id="cs-main-video" loading="lazy"')
      .replace('href="" class="cs-btn"', 'href="https://www.youtube.com/@andriusgrisanovas2670" class="cs-btn"');
  }

  if (config.key === 'picture-testimonials') {
    let cardIndex = 0;
    next = next.replace(/<div class="tsm-card([^"]*)">/g, (match, suffix) => {
      const client = pictureClients[cardIndex++] ?? '';
      return `<div class="tsm-card${suffix}" data-client="${client}">`;
    });
  }

  next = next.replace(/\s+src=""/g, '');

  return `<!-- ${config.title} -->\n${next}`;
}

function fontFaces() {
  return `@font-face {
  font-family: 'DM Sans';
  src: url('./assets/fonts/dm-sans-v17-latin-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'DM Sans';
  src: url('./assets/fonts/dm-sans-v17-latin-500.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'DM Sans';
  src: url('./assets/fonts/dm-sans-v17-latin-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'DM Sans';
  src: url('./assets/fonts/dm-sans-v17-latin-700.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Cormorant Garamond';
  src: url('./assets/fonts/cormorant-garamond-v21-latin-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Cormorant Garamond';
  src: url('./assets/fonts/cormorant-garamond-v21-latin-500.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Cormorant Garamond';
  src: url('./assets/fonts/cormorant-garamond-v21-latin-600.woff2') format('woff2');
  font-weight: 600 700;
  font-style: normal;
  font-display: swap;
}`;
}

function globalCss() {
  return `${fontFaces()}

:root {
  color-scheme: light;
  --ag-page-bg: #fcfaf8;
  --ag-text: #111111;
}

html {
  scroll-behavior: smooth;
  text-size-adjust: 100%;
}

body {
  margin: 0;
  min-width: 320px;
  background: var(--ag-page-bg);
  color: var(--ag-text);
  font-family: 'DM Sans', Arial, sans-serif;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

main {
  overflow-x: hidden;
}

img,
svg,
video,
iframe {
  max-width: 100%;
}

button,
input,
select,
textarea {
  font: inherit;
}

a {
  color: inherit;
}

.hidden {
  display: none !important;
}

@media (min-width: 768px) {
  .md\\:block {
    display: block !important;
  }
}

@media (min-width: 1024px) {
  .lg\\:flex {
    display: flex !important;
  }
}

img:not([src]),
img[src=""] {
  background:
    linear-gradient(135deg, rgba(184, 142, 82, 0.12), rgba(255, 255, 255, 0.86)),
    #eae7e2;
  color: transparent;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}`;
}

function projectCss() {
  return `#our-projects-section {
  position: relative;
  background: #fcfaf8;
  color: #1a1a1a;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
  padding: 96px 0;
}

#our-projects-section .font-serif,
#our-projects-section h2,
#our-projects-section h4 {
  font-family: 'Cormorant Garamond', serif;
}

#our-projects-section > .text-center {
  max-width: 900px;
  margin: 0 auto 64px;
  padding: 0 24px;
  text-align: center;
}

#our-projects-section h3 {
  margin: 0 0 24px;
  color: #a68a61;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.25em;
  text-transform: uppercase;
}

#our-projects-section h2 {
  margin: 0 0 24px;
  color: #111111;
  font-size: 48px;
  font-weight: 500;
  line-height: 1.06;
}

#our-projects-section > .text-center p {
  max-width: 680px;
  margin: 0 auto;
  color: #555555;
  font-size: 16px;
  line-height: 1.65;
}

#our-projects-section > .relative.w-full {
  position: relative;
  max-width: 1920px;
  width: 100%;
  margin: 0 auto;
}

#pg-track {
  display: flex;
  align-items: center;
  gap: 16px;
  overflow-x: auto;
  padding: 32px 16px;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

#pg-track::-webkit-scrollbar {
  display: none;
}

#pg-btn-prev,
#pg-btn-next {
  position: absolute;
  top: 50%;
  z-index: 20;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: #1f2937;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transform: translateY(-50%);
  transition: transform 0.3s ease, background 0.3s ease;
}

#pg-btn-prev {
  left: 16px;
}

#pg-btn-next {
  right: 16px;
}

#pg-btn-prev:hover,
#pg-btn-next:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.05);
}

#pg-btn-prev svg,
#pg-btn-next svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
}

#our-projects-section .pg-card {
  position: relative;
  flex: 0 0 min(88vw, 520px);
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
  border-radius: 8px;
  background: #eae7e2;
  cursor: pointer;
  scroll-snap-align: center;
}

#our-projects-section .pg-card img {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 300px;
  object-fit: cover;
  transition: transform 0.8s ease;
}

#our-projects-section .pg-card:hover img {
  transform: scale(1.05);
}

#our-projects-section .pg-card > div:first-child:not([class*="from-black"]) {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
  background: #c4a478;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 10px 16px;
  text-transform: uppercase;
}

#our-projects-section .pg-card > div[class*="from-black"] {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.18), transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease;
}

#our-projects-section .pg-card:hover > div[class*="from-black"] {
  opacity: 1;
}

#our-projects-section .pg-card [class*="bottom-0"] {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(24px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

#our-projects-section .pg-card:hover [class*="bottom-0"] {
  opacity: 1;
  transform: translateY(0);
}

#our-projects-section .pg-card h4 {
  margin: 0 0 12px;
  color: #ffffff;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.1;
}

#our-projects-section .pg-card p {
  margin: 0 0 6px;
  color: #d4c3a3;
  font-size: 14px;
}

#our-projects-section .pg-card p:last-child,
#our-projects-section .pg-card span:last-child {
  color: #d1d5db;
}

#pg-lightbox {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.95);
  opacity: 1;
  transition: opacity 0.4s ease;
}

#pg-lightbox.opacity-0 {
  opacity: 0;
}

#pg-lightbox.opacity-100 {
  opacity: 1;
}

#pg-lightbox-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

#pg-lightbox-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 110;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  cursor: pointer;
}

#pg-lightbox-close svg {
  width: 24px;
  height: 24px;
}

#pg-lightbox-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(1);
  transition: transform 0.5s ease;
}

#pg-lightbox-img.scale-95 {
  transform: scale(0.95);
}

#pg-lightbox-img.scale-100 {
  transform: scale(1);
}

@media (min-width: 768px) {
  #our-projects-section h2 {
    font-size: 64px;
  }

  #pg-track {
    gap: 24px;
    padding-right: 48px;
    padding-left: 48px;
  }

  #pg-btn-prev {
    left: 48px;
  }

  #pg-btn-next {
    right: 48px;
  }
}

@media (min-width: 1024px) {
  #our-projects-section .pg-card {
    flex-basis: auto;
    width: auto;
    height: 600px;
  }

  #our-projects-section .pg-card:nth-child(3) {
    height: 650px;
  }

  #pg-lightbox-content {
    width: 90vw;
    height: 90vh;
    padding: 24px;
  }

  #pg-lightbox-img {
    border-radius: 8px;
  }
}`;
}

function extraCss() {
  return `${projectCss()}

#fnd-section .fnd-signature {
  font-style: italic;
}

#tsm-section .tsm-img {
  opacity: 1;
  transition: opacity 0.35s ease, transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

#tsm-section .tsm-img.is-fading {
  opacity: 0;
}

.cr-logo-word {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.cr-google-word::first-letter {
  color: #4285f4;
}

.cr-trustpilot-word {
  color: #00b67a;
}`;
}

function heroModule() {
  return `function formatUkPhone(value) {
  const digits = value.replace(/[^\\d+]/g, '');
  if (!digits) return '';

  let normalized = digits;
  if (!normalized.startsWith('+44')) {
    normalized = \`+44\${normalized.replace(/^(\\+?44)?0?/, '')}\`;
  }

  const local = normalized.slice(3, 13);
  return ['+44', local.slice(0, 4), local.slice(4, 10)].filter(Boolean).join(' ');
}

function validateEmail(value) {
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
}

function validatePostcode(value) {
  return /^[A-Z]{1,2}\\d[A-Z\\d]?\\s*\\d[A-Z]{2}$/i.test(value.trim());
}

export function initHero() {
  const section = document.getElementById('hs-hero-section');
  if (!section || section.dataset.agInitialized === 'true') return;
  section.dataset.agInitialized = 'true';

  const form = document.getElementById('hs-quote-form');
  const phoneInput = document.getElementById('hs-phone');
  const postcodeInput = document.getElementById('hs-postcode');
  const submitButton = document.getElementById('hs-submit');
  const success = document.getElementById('hs-success');

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatUkPhone(phoneInput.value);
  });

  postcodeInput?.addEventListener('input', () => {
    postcodeInput.value = postcodeInput.value.toUpperCase();
  });

  form?.querySelectorAll('.hs-input').forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.hs-input-group')?.classList.remove('hs-error');
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = [
      { id: 'hs-name', validate: (value) => value.trim().length > 1 },
      { id: 'hs-phone', validate: (value) => value.replace(/\\D/g, '').length >= 11 },
      { id: 'hs-email', validate: (value) => validateEmail(value.trim()) },
      { id: 'hs-postcode', validate: validatePostcode },
      { id: 'hs-type', validate: (value) => Boolean(value) },
      { id: 'hs-details', validate: (value) => value.trim().length > 5 },
    ];

    let isValid = true;
    fields.forEach((field) => {
      const input = document.getElementById(field.id);
      const group = input?.closest('.hs-input-group');
      group?.classList.remove('hs-error');

      if (!input || !field.validate(input.value)) {
        isValid = false;
        group?.classList.add('hs-error');
      }
    });

    if (!isValid) {
      submitButton?.classList.add('hs-shake-anim');
      window.setTimeout(() => submitButton?.classList.remove('hs-shake-anim'), 500);
      return;
    }

    submitButton?.classList.add('hs-loading');
    submitButton?.setAttribute('disabled', 'true');

    window.setTimeout(() => {
      submitButton?.classList.remove('hs-loading');
      submitButton?.removeAttribute('disabled');
      success?.classList.add('hs-active');
      form.reset();
    }, 900);
  });
}
`;
}

function clientStoriesModule() {
  return `function withParams(src, params) {
  const url = new URL(src);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function initClientStories() {
  const section = document.getElementById('client-stories-section');
  if (!section || section.dataset.agInitialized === 'true') return;
  section.dataset.agInitialized = 'true';

  const iframes = section.querySelectorAll('.cs-iframe');
  const mainVideo = section.querySelector('#cs-main-video');

  iframes.forEach((iframe) => {
    iframe.addEventListener('load', function onLoad() {
      if (this.src && this.src !== window.location.href && this.src !== 'about:blank') {
        const skeleton = this.previousElementSibling;
        if (skeleton?.classList.contains('cs-skeleton')) {
          skeleton.style.display = 'none';
        }
      }
    });
  });

  iframes.forEach((iframe) => {
    const source = iframe.dataset.src;
    if (!source || iframe.src) return;

    iframe.src = iframe === mainVideo
      ? withParams(source, { autoplay: '1', mute: '1', loop: '1', playlist: source.split('/').pop() })
      : withParams(source, { rel: '0', modestbranding: '1' });
  });
}
`;
}

function pictureTestimonialsModule() {
  return `import { testimonialImages } from './testimonial-images.js';

function setCardImage(img, image) {
  img.src = image.low;
  img.dataset.fullSrc = image.full;
}

export function initPictureTestimonials() {
  const section = document.getElementById('tsm-section');
  if (!section || section.dataset.agInitialized === 'true') return;
  section.dataset.agInitialized = 'true';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        section.classList.add('is-visible');
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(section);

  section.querySelectorAll('.tsm-card').forEach((card) => {
    const client = card.dataset.client;
    const images = testimonialImages[client] ?? [];
    const img = card.querySelector('.tsm-img');
    if (!img || images.length === 0) return;

    let index = 0;
    setCardImage(img, images[index]);

    if (images.length > 1) {
      window.setInterval(() => {
        index = (index + 1) % images.length;
        img.classList.add('is-fading');
        window.setTimeout(() => {
          setCardImage(img, images[index]);
          img.classList.remove('is-fading');
        }, 350);
      }, 4200);
    }
  });

  const lightbox = document.getElementById('tsm-lightbox');
  const lightboxImg = document.getElementById('tsm-lightbox-image');
  const closeBtn = document.getElementById('tsm-lightbox-close');
  let isDesktopView = window.innerWidth >= 1024;

  const openLightbox = (src) => {
    if (!src || !lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    window.setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightboxImg.src = '';
      }
    }, 400);
  };

  section.querySelectorAll('.tsm-img-wrap').forEach((wrap) => {
    wrap.addEventListener('click', () => {
      const img = wrap.querySelector('.tsm-img');
      openLightbox(img?.dataset.fullSrc || img?.src);
    });
  });

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox?.classList.contains('active')) {
      closeLightbox();
    }
  });

  window.addEventListener('resize', () => {
    const newIsDesktopView = window.innerWidth >= 1024;
    if (isDesktopView !== newIsDesktopView) {
      isDesktopView = newIsDesktopView;
      if (lightbox?.classList.contains('active')) {
        closeLightbox();
      }
    }
  });
}
`;
}

function mainModule(lazyConfigs) {
  const imports = lazyConfigs
    .map((config) => `    loader: () => import('./sections/${config.moduleFile}').then((module) => module.${config.exportName}()),`)
    .join('\n');

  const entries = lazyConfigs
    .map((config) => `  {\n    selector: ${JSON.stringify(`#${config.sectionId}`)},\n${importsForConfig(config)}\n  },`)
    .join('\n');

  return `import { initHero } from './sections/hero.js';

function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }

  callback();
}

const lazySections = [
${entries}
];

function loadSection(entry) {
  if (entry.loaded) return;
  entry.loaded = true;
  entry.loader();
}

onReady(() => {
  initHero();

  if (!('IntersectionObserver' in window)) {
    lazySections.forEach(loadSection);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((observedEntry) => {
      if (!observedEntry.isIntersecting) return;
      const match = lazySections.find((entry) => entry.element === observedEntry.target);
      if (match) {
        loadSection(match);
        observer.unobserve(match.element);
      }
    });
  }, {
    rootMargin: '650px 0px',
    threshold: 0.01,
  });

  lazySections.forEach((entry) => {
    entry.element = document.querySelector(entry.selector);
    if (entry.element) {
      observer.observe(entry.element);
    }
  });
});
`;
}

function importsForConfig(config) {
  return `    loader: () => import('./sections/${config.moduleFile}').then((module) => module.${config.exportName}()),`;
}

function indexHtml(markup) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A&G Renovations provides bathroom, kitchen, and full home renovations across West London.">
  <title>A&G Renovations | West London Renovation Specialists</title>
  <link rel="preload" href="./assets/fonts/dm-sans-v17-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="./assets/fonts/dm-sans-v17-latin-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="./assets/fonts/cormorant-garamond-v21-latin-600.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="./critical.css">
  <link rel="preload" href="./style.css" as="style">
  <link rel="stylesheet" href="./style.css">
  <script type="module" src="./src/main.js"></script>
</head>
<body>
  <main id="ag-page">
${indent(markup, 4)}
  </main>
</body>
</html>
`;
}

async function main() {
  await mkdir(sectionDir, { recursive: true });

  const generatedSections = [];
  const styleBlocks = [];
  const lazyConfigs = [];
  let critical = '';

  for (const config of sections) {
    const raw = await readFile(path.join(root, config.file), 'utf8');
    const css = extractStyles(raw);
    const section = prepareSection(config, extractSection(raw));
    const script = extractScripts(raw);

    generatedSections.push(section);

    if (config.key === 'hero') {
      critical = `${globalCss()}\n\n${css}\n`;
    } else {
      styleBlocks.push(`/* ${config.title} */\n${css}`);
    }

    if (config.moduleFile && !config.customModule) {
      await writeFile(path.join(sectionDir, config.moduleFile), createModule(config, script), 'utf8');
    }

    if (config.moduleFile && !config.eager) {
      lazyConfigs.push(config);
    }
  }

  await writeFile(path.join(sectionDir, 'hero.js'), heroModule(), 'utf8');
  await writeFile(path.join(sectionDir, 'client-stories.js'), clientStoriesModule(), 'utf8');
  await writeFile(path.join(sectionDir, 'picture-testimonials.js'), pictureTestimonialsModule(), 'utf8');
  await writeFile(path.join(root, 'critical.css'), critical, 'utf8');
  await writeFile(path.join(root, 'style.css'), `${styleBlocks.join('\n\n')}\n\n${extraCss()}\n`, 'utf8');
  await writeFile(path.join(root, 'index.html'), indexHtml(generatedSections.join('\n\n')), 'utf8');
  await writeFile(path.join(root, 'src', 'main.js'), mainModule(lazyConfigs), 'utf8');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
