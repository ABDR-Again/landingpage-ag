export function initFaq() {
  const rootSection = document.getElementById("faq-section");
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

  const faqButtons = document.querySelectorAll('#faq-section .faq-btn');

        faqButtons.forEach(button => {
          button.addEventListener('click', () => {
            const currentItem = button.closest('.faq-item');
            const isCurrentlyActive = currentItem.classList.contains('active');

            // Close all FAQ items first
            document.querySelectorAll('#faq-section .faq-item').forEach(item => {
              item.classList.remove('active');
              item.querySelector('.faq-btn').setAttribute('aria-expanded', 'false');
            });

            // If the clicked item was NOT active, open it
            // (If it was active, it will now just stay closed, acting as a toggle)
            if (!isCurrentlyActive) {
              currentItem.classList.add('active');
              button.setAttribute('aria-expanded', 'true');
            }
          });
        });
}
