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
}
