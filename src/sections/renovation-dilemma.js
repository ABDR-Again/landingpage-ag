export function initRenovationDilemma() {
  const rootSection = document.getElementById("rd-section");
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

  const section = document.getElementById('rd-section');

        // Setup Intersection Observer to trigger animations when the section comes into view
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // Add the class that triggers all CSS keyframes
              section.classList.add('is-visible');
              // Unobserve after animating once
              observer.unobserve(section);
            }
          });
        }, {
          threshold: 0.15 // Triggers when 15% of the section is visible
        });

        if (section) {
          observer.observe(section);
        }
}
