export function initServices() {
  const rootSection = document.getElementById("srv-section");
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

  // Elements
        const section = document.getElementById('srv-section');
        const customCursor = document.getElementById('srv-custom-cursor');
        const imgWrappers = document.querySelectorAll('#srv-section .srv-img-wrap');
        const zoomableImages = document.querySelectorAll('#srv-section .srv-zoomable');
        const lightbox = document.getElementById('srv-lightbox');
        const lightboxImg = document.getElementById('srv-lightbox-image');
        const closeBtn = document.getElementById('srv-lightbox-close');

        // 1. Custom Cursor Logic
        // Only run on devices that support hover (non-touch)
        if (window.matchMedia("(pointer: fine)").matches) {
          imgWrappers.forEach(wrap => {
            wrap.addEventListener('mouseenter', () => {
              customCursor.classList.add('active');
            });

            wrap.addEventListener('mouseleave', () => {
              customCursor.classList.remove('active');
            });

            wrap.addEventListener('mousemove', (e) => {
              customCursor.style.left = `${e.clientX}px`;
              customCursor.style.top = `${e.clientY}px`;
            });
          });
        }

        // 2. Lightbox Logic
        const openLightbox = (src) => {
          // Prevent opening if src is empty (fallback protection)
          if (!src || src === window.location.href) return;

          lightboxImg.src = src;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden'; // Lock background scroll
          customCursor.classList.remove('active'); // Hide cursor while modal is open
        };

        const closeLightbox = () => {
          lightbox.classList.remove('active');
          document.body.style.overflow = ''; // Unlock background scroll

          // Wait for fade out transition before clearing source
          setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
              lightboxImg.src = '';
            }
          }, 400); 
        };

        // Bind click events to all images
        zoomableImages.forEach(img => {
          img.addEventListener('click', function() {
            // Use getAttribute to reliably check if src exists and isn't just the base URL
            const src = this.getAttribute('src');
            if(src) {
               openLightbox(this.src);
            }
          });
        });

        // Bind close events
        closeBtn.addEventListener('click', closeLightbox);

        // Close on background click
        lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) {
            closeLightbox();
          }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
          }
        });
}
