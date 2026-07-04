export function initFounder() {
  const rootSection = document.getElementById("fnd-section");
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

  const section = document.getElementById('fnd-section');

        // Setup Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Add visible class to trigger CSS keyframes
              section.classList.add('is-visible');
              // Unobserve to only animate once
              observer.unobserve(section);
            }
          });
        }, {
          threshold: 0.15 // Triggers when 15% visible
        });

        if (section) {
          observer.observe(section);
        }

        // Founder Lightbox Logic
        const founderImg = document.querySelector('.fnd-lightbox-trigger');
        if (founderImg) {
          founderImg.addEventListener('click', () => {
            let lightbox = document.getElementById('founder-lightbox');
            if (!lightbox) {
              lightbox = document.createElement('div');
              lightbox.id = 'founder-lightbox';
              lightbox.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(10,10,10,0.95);z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;padding:20px;';
              
              const img = document.createElement('img');
              img.style.cssText = 'max-width:100%;max-height:90vh;object-fit:contain;border-radius:8px;transform:scale(0.95);transition:transform 0.3s ease;';
              
              const closeBtn = document.createElement('button');
              closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
              closeBtn.style.cssText = 'position:absolute;top:24px;right:24px;width:48px;height:48px;background:rgba(255,255,255,0.1);border-radius:50%;color:white;display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;';
              
              lightbox.appendChild(img);
              lightbox.appendChild(closeBtn);
              document.body.appendChild(lightbox);

              const closeLb = () => {
                lightbox.style.opacity = '0';
                img.style.transform = 'scale(0.95)';
                document.body.style.overflow = '';
                setTimeout(() => { lightbox.style.display = 'none'; }, 300);
              };

              closeBtn.addEventListener('click', closeLb);
              lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLb();
              });
              document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightbox.style.display === 'flex') closeLb();
              });
            }

            const img = lightbox.querySelector('img');
            img.src = founderImg.dataset.original || founderImg.src;
            img.alt = founderImg.alt;
            
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            // Trigger reflow
            void lightbox.offsetWidth;
            lightbox.style.opacity = '1';
            img.style.transform = 'scale(1)';
          });
        }
}
