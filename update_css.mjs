import fs from 'fs/promises';
import path from 'path';

async function updateCss() {
  const cssPath = path.join(process.cwd(), 'style.css');
  const pfPath = path.join(process.cwd(), 'portfolio_masonry_section (1).html');
  
  const pfHtml = await fs.readFile(pfPath, 'utf-8');
  
  // Extract CSS
  const styleMatch = pfHtml.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    let css = styleMatch[1];
    
    // Add lightbox CSS for Founder if missing
    css += `\n
/* ==========================================================================
   FOUNDER LIGHTBOX & STICKY HEADER
   ========================================================================== */
.fnd-lightbox-trigger {
    transition: transform 0.3s ease;
}
.fnd-lightbox-trigger:hover {
    transform: scale(1.02);
}
`;
    
    await fs.appendFile(cssPath, css);
    console.log('Appended to style.css');
  } else {
    console.error('Could not extract style block');
  }
}

updateCss().catch(console.error);
