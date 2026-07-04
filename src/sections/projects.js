export function initProjects() {
  const rootSection = document.getElementById("our-projects-section");
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

  const track = document.getElementById('pg-track');
        const btnPrev = document.getElementById('pg-btn-prev');
        const btnNext = document.getElementById('pg-btn-next');
        const cards = document.querySelectorAll('.pg-card');
        const cursor = document.getElementById('pg-custom-cursor');

        const lightbox = document.getElementById('pg-lightbox');
        const lightboxImg = document.getElementById('pg-lightbox-img');
        const lightboxClose = document.getElementById('pg-lightbox-close');

        // -- Navigation Arrows Logic --
        const scrollAmount = () => {
          // Scroll by the width of one item + gap on desktop, or viewport width on mobile
          return window.innerWidth < 1024 ? window.innerWidth : 500; 
        };

        btnPrev.addEventListener('click', () => {
          track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        });

        btnNext.addEventListener('click', () => {
          track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        });

        // -- Custom Cursor Logic --
        // Only attach mousemove tracking if we are on a non-touch device (desktop)
        if (window.matchMedia("(pointer: fine)").matches) {
          cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
              cursor.classList.add('active');
            });

            card.addEventListener('mouseleave', () => {
              cursor.classList.remove('active');
            });

            card.addEventListener('mousemove', (e) => {
              cursor.style.left = `${e.clientX}px`;
              cursor.style.top = `${e.clientY}px`;
            });
          });
        }

        // -- Lightbox Modal Logic --
        let isDesktopFormat = window.innerWidth >= 1024;

        const openLightbox = (src) => {
          lightboxImg.src = src;
          lightbox.classList.remove('hidden');

          // Lock body scroll
          document.body.style.overflow = 'hidden';

          // Small delay to allow display:block to apply before animating opacity/transform
          requestAnimationFrame(() => {
            lightbox.classList.remove('opacity-0');
            lightbox.classList.add('opacity-100');
            lightboxImg.classList.remove('scale-95');
            lightboxImg.classList.add('scale-100');
          });
        };

        const closeLightbox = () => {
          lightbox.classList.remove('opacity-100');
          lightbox.classList.add('opacity-0');
          lightboxImg.classList.remove('scale-100');
          lightboxImg.classList.add('scale-95');

          // Wait for transition to finish before hiding element entirely
          setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxImg.src = ''; // Clear source
            document.body.style.overflow = ''; // Unlock body scroll
          }, 400); // Matches the duration-400 transition
        };

        cards.forEach(card => {
          card.addEventListener('click', () => {
            const img = card.querySelector('img');
            // Open lightbox only if there's a valid src, or open it anyway to fulfill specs
            const rawSrc = img.dataset.fullSrc || img.getAttribute('src');
            if (rawSrc) openLightbox(img.currentSrc || img.src); 
          });
        });

        lightboxClose.addEventListener('click', closeLightbox);

        // Close on background click
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox || e.target.id === 'pg-lightbox-content') {
            closeLightbox();
          }
        });

        // Handle Device Switch (Resize observer)
        // Auto-closes modal if crossing the desktop/mobile breakpoint while open
        window.addEventListener('resize', () => {
          const newIsDesktopFormat = window.innerWidth >= 1024;
          if (isDesktopFormat !== newIsDesktopFormat) {
            isDesktopFormat = newIsDesktopFormat;
            if (!lightbox.classList.contains('hidden')) {
              closeLightbox();
            }
          }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            closeLightbox();
          }
        });
}
