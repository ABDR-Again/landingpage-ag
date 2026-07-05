import { initHero } from './sections/hero.js';
import { initForms } from './forms.js';
function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }

  callback();
}

const lazySections = [
  {
    selector: "#rd-section",
    loader: () => import('./sections/renovation-dilemma.js').then((module) => module.initRenovationDilemma()),
  },
  {
    selector: "#srv-section",
    loader: () => import('./sections/services.js').then((module) => module.initServices()),
  },
  {
    selector: "#ag-pfm-section",
    loader: () => import('./sections/projects.js').then((module) => module.initProjects()),
  },
  {
    selector: "#cr-reviews-section",
    loader: () => import('./sections/reviews.js').then((module) => module.initReviews()),
  },
  {
    selector: "#client-stories-section",
    loader: () => import('./sections/client-stories.js').then((module) => module.initClientStories()),
  },
  {
    selector: "#tsm-section",
    loader: () => import('./sections/picture-testimonials.js').then((module) => module.initPictureTestimonials()),
  },
  {
    selector: "#fnd-section",
    loader: () => import('./sections/founder.js').then((module) => module.initFounder()),
  },
  {
    selector: "#faq-section",
    loader: () => import('./sections/faq.js').then((module) => module.initFaq()),
  },
  {
    selector: "#syp-section",
    loader: () => import('./sections/start-project.js').then((module) => module.initStartProject()),
  },
];

function loadSection(entry) {
  if (entry.loaded) return;
  entry.loaded = true;
  entry.loader();
}

onReady(() => {
  initHero();
  initForms();

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
