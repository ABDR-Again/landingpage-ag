export function initProjects() {
  const rootSection = document.getElementById("ag-pfm-section");
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

  // Lightbox Elements
  const lightbox = document.getElementById('ag-pfm-lightbox-modal');
  const lightboxImg = document.getElementById('ag-pfm-lightbox-img-el');
  const closeBtn = document.querySelector('.ag-pfm-lightbox-close');

  function attachLightboxListeners(cardsNodeList) {
    cardsNodeList.forEach(card => {
      if (card.dataset.listenerAttached === 'true') return;
      card.dataset.listenerAttached = 'true';

      card.addEventListener('click', () => {
        const imgEl = card.querySelector('.ag-pfm-img');
        if (!imgEl) return;
        
        // Use original high-res image if available, else thumbnail
        lightboxImg.src = imgEl.dataset.original || imgEl.src;
        lightboxImg.alt = imgEl.alt;
        
        lightbox.classList.add('ag-active');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // Initial attachment
  attachLightboxListeners(document.querySelectorAll('.ag-pfm-card'));

  const closeLightbox = () => {
    lightbox.classList.remove('ag-active');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  };

  closeBtn.addEventListener('click', closeLightbox);
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('ag-active')) closeLightbox();
  });

  // Load More Logic
  const loadMoreBtn = document.getElementById('ag-pfm-load-more');
  const grid = document.getElementById('ag-pfm-grid');
  
  let currentLoadCount = 10; // We initially loaded 10 in index.html
  let projectsData = null;

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      try {
        if (!projectsData) {
          const res = await fetch('./projects_data.json');
          projectsData = await res.json();
        }

        if (currentLoadCount >= projectsData.length) {
          const btnText = loadMoreBtn.querySelector('span');
          btnText.textContent = "All projects loaded";
          loadMoreBtn.classList.add('ag-loading');
          return;
        }

        loadMoreBtn.classList.add('ag-loading');
        const btnText = loadMoreBtn.querySelector('span');
        const originalText = btnText.textContent;
        btnText.textContent = "Loading...";

        // Add 10 more
        const nextBatch = projectsData.slice(currentLoadCount, currentLoadCount + 10);
        
        // Append
        nextBatch.forEach((data, i) => {
          const card = document.createElement('div');
          card.className = `ag-pfm-card ${data.sizeClass}`;
          card.setAttribute('role', 'button');
          
          const title = data.alt.split(' Image ')[0] || data.alt;
          
          card.innerHTML = `
            <img src="${data.thumbnail}" data-original="${data.original}" alt="${data.alt}" class="ag-pfm-img" loading="lazy" decoding="async">
            <div class="ag-pfm-overlay"></div>
            <div class="ag-pfm-content">
                <h3 class="ag-pfm-card-title">${title}</h3>
            </div>
          `;
          grid.appendChild(card);
        });

        attachLightboxListeners(document.querySelectorAll('.ag-pfm-card'));

        currentLoadCount += 10;
        
        if (currentLoadCount >= projectsData.length) {
          btnText.textContent = "All projects loaded";
        } else {
          btnText.textContent = originalText;
          loadMoreBtn.classList.remove('ag-loading');
        }
      } catch (e) {
        console.error('Failed to load more projects:', e);
        const btnText = loadMoreBtn.querySelector('span');
        btnText.textContent = "Error loading";
      }
    });
  }
}
