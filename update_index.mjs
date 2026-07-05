import fs from 'fs/promises';
import path from 'path';

async function updateIndex() {
  const indexPath = path.join(process.cwd(), 'index.html');
  let html = await fs.readFile(indexPath, 'utf-8');

  // 1. Update Founder Section
  // Replace "Andrius Grisanovas" with "Andre"
  html = html.replace(
    /<span class="fnd-signature fnd-anim-item" style="animation-delay: 0.2s;">Andrius Grisanovas<\/span>/g,
    '<span class="fnd-signature fnd-anim-item" style="animation-delay: 0.2s;">Andre</span>'
  );
  
  // Replace image
  const oldImg = '<img alt="Andrius Grisanovas - Founder" class="fnd-img" loading="lazy" decoding="async" />';
  const newImg = '<img src="./assets/images/optimized/andre.webp" data-original="./assets/images/andre.jpeg" alt="Andre - Founder" class="fnd-img fnd-lightbox-trigger" style="cursor: pointer;" loading="lazy" decoding="async" />';
  html = html.replace(oldImg, newImg);

  // 2. Projects Section Replacement
  const projectsData = JSON.parse(await fs.readFile(path.join(process.cwd(), 'public', 'projects_data.json'), 'utf-8'));
  const first10 = projectsData.slice(0, 10);
  
  let cardsHtml = '';
  first10.forEach((data, index) => {
    // Make the first one large if possible, or just keep its size
    let size = data.sizeClass;
    if (index === 0) size = 'size-large';
    
    let badge = index === 0 ? '<div class="ag-pfm-badge">Featured Project</div>' : '';
    
    // Create a clean title from alt
    const title = data.alt; // Use full alt text for uniqueness
    
    cardsHtml += `
            <!-- Card ${index + 1} -->
            <div class="ag-pfm-card ${size}" role="button" aria-label="View ${title}">
                <img src="${data.thumbnail}" data-original="${data.original}" alt="${data.alt}" class="ag-pfm-img" loading="lazy" decoding="async">
                ${badge}
            </div>`;
  });

  const masonryHtml = `
    <!-- Projects (Masonry Portfolio) -->
    <section id="ag-pfm-section">
        <div class="ag-pfm-container">
            
            <!-- Header -->
            <div class="ag-pfm-header">
                <div class="ag-pfm-eyebrow">Our Portfolio</div>
                <h2 class="ag-pfm-title">Beautiful Spaces, Expertly Renovated</h2>
                <p class="ag-pfm-desc">
                    Explore a selection of our completed renovations across West London. Every detail thoughtfully designed. Every finish expertly delivered.
                </p>
            </div>

            <!-- Masonry Grid -->
            <div class="ag-pfm-grid" id="ag-pfm-grid">
${cardsHtml}
            </div>

            <!-- Footer / Action -->
            <div class="ag-pfm-footer">
                <button class="ag-pfm-btn" id="ag-pfm-load-more">
                    <span>Load More Projects</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                </button>
            </div>
        </div>

        <!-- Lightbox Modal Container -->
        <div class="ag-pfm-lightbox" id="ag-pfm-lightbox-modal">
            <button class="ag-pfm-lightbox-close" aria-label="Close image">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <!-- Modal Image -->
            <img src="" alt="Expanded View" class="ag-pfm-lightbox-img" id="ag-pfm-lightbox-img-el">
        </div>
    </section>
`;

  // Use regex to replace the old section. It starts with <section id="ag-pfm-section" and ends before <!-- Reviews -->
  const oldSectionRegex = /<section id="ag-pfm-section"[\s\S]*?<\/section>/;
  html = html.replace(oldSectionRegex, masonryHtml.trim());

  await fs.writeFile(indexPath, html);
  console.log('index.html updated successfully.');
}

updateIndex().catch(console.error);
