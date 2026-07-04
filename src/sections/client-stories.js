function withParams(src, params) {
  const url = new URL(src);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function initClientStories() {
  const section = document.getElementById('client-stories-section');
  if (!section || section.dataset.agInitialized === 'true') return;
  section.dataset.agInitialized = 'true';

  const iframes = section.querySelectorAll('.cs-iframe');
  const mainVideo = section.querySelector('#cs-main-video');

  iframes.forEach((iframe) => {
    iframe.addEventListener('load', function onLoad() {
      if (this.src && this.src !== window.location.href && this.src !== 'about:blank') {
        const skeleton = this.previousElementSibling;
        if (skeleton?.classList.contains('cs-skeleton')) {
          skeleton.style.display = 'none';
        }
      }
    });
  });

  iframes.forEach((iframe) => {
    const source = iframe.dataset.src;
    if (!source || iframe.src) return;

    iframe.src = iframe === mainVideo
      ? withParams(source, { autoplay: '1', mute: '1', loop: '1', playlist: source.split('/').pop() })
      : withParams(source, { rel: '0', modestbranding: '1' });
  });
}
