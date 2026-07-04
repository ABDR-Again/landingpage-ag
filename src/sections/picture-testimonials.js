import { testimonialImages } from './testimonial-images.js';

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
