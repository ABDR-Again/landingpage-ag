export function initReviews() {
  const rootSection = document.getElementById("cr-reviews-section");
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

  const track = document.getElementById("cr-track");
        const wrapper = document.getElementById("cr-track-wrapper");
        let originalCards = Array.from(track.children);

        // Deep clone the original cards to create the seamless infinite scroll effect
        originalCards.forEach(card => {
          let clone = card.cloneNode(true);
          // Remove pop-up animations from the cloned cards so they don't unexpectedly flash 
          // when they scroll into view later
          clone.style.animation = "none";
          clone.style.opacity = "1";
          clone.style.transform = "none";
          track.appendChild(clone);
        });

        // State checking for layout mode
        let isMobile = window.innerWidth <= 1024;

        // Speed Tuning (User requested faster desktop speed, decent mobile speed)
        const desktopSpeed = 2.5; // Fast vertical movement
        const mobileSpeed = 1.5;  // Decent horizontal movement

        let positionY = 0;
        let isHovered = false;
        let isTouching = false;

        // Event listeners to pause animation on user interactions
        wrapper.addEventListener("mouseenter", () => isHovered = true);
        wrapper.addEventListener("mouseleave", () => isHovered = false);

        // Mobile specific touch listeners to allow user to scroll themselves
        wrapper.addEventListener("touchstart", () => isTouching = true, {passive: true});
        wrapper.addEventListener("touchend", () => {
          // Resume the auto-scroll smoothly 1.5 seconds after a swipe
          setTimeout(() => isTouching = false, 1500); 
        });

        // Re-evaluate context smoothly on window resize
        window.addEventListener("resize", () => {
          const wasMobile = isMobile;
          isMobile = window.innerWidth <= 1024;

          // Reset positions if switching between layout types
          if (wasMobile !== isMobile) {
            positionY = 0;
            track.style.transform = `translate3d(0, 0, 0)`;
            wrapper.scrollLeft = 0;
          }
        });

        // Delay the continuous scroll briefly so the CSS entrance animations can finish
        setTimeout(() => {
          requestAnimationFrame(animateScroll);
        }, 1500);

        function animateScroll() {
          if (isMobile) {
            // MOBILE / TABLET MODE: Horizontal scroll 
            // Modify scrollLeft which works perfectly with native CSS touch scrolling
            if (!isTouching && !isHovered) {
              wrapper.scrollLeft += mobileSpeed;

              // Seamless loop: snap back when the halfway point (end of original list) is reached
              if (wrapper.scrollLeft >= (track.scrollWidth / 2)) {
                wrapper.scrollLeft = 0;
              }
            }
          } else {
            // DESKTOP MODE: Vertical scroll 
            // Using translate3d forces hardware acceleration on the GPU for 60FPS smoothness
            if (!isHovered) {
              positionY -= desktopSpeed;
              const trackHeight = track.scrollHeight / 2; // Height of the original non-cloned set

              if (Math.abs(positionY) >= trackHeight) {
                positionY = 0;
              }
              track.style.transform = `translate3d(0, ${positionY}px, 0)`;
            }
          }

          // Call the next frame
          requestAnimationFrame(animateScroll);
        }
}
