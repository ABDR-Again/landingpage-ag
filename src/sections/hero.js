function formatUkPhone(value) {
  const digits = value.replace(/[^\d+]/g, '');
  if (!digits) return '';

  let normalized = digits;
  if (!normalized.startsWith('+44')) {
    normalized = `+44${normalized.replace(/^(\+?44)?0?/, '')}`;
  }

  const local = normalized.slice(3, 13);
  return ['+44', local.slice(0, 4), local.slice(4, 10)].filter(Boolean).join(' ');
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePostcode(value) {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(value.trim());
}

export function initHero() {
  const section = document.getElementById('hs-hero-section');
  if (!section || section.dataset.agInitialized === 'true') return;
  section.dataset.agInitialized = 'true';

  const form = document.getElementById('hs-quote-form');
  const phoneInput = document.getElementById('hs-phone');
  const postcodeInput = document.getElementById('hs-postcode');
  const submitButton = document.getElementById('hs-submit');
  const success = document.getElementById('hs-success');

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatUkPhone(phoneInput.value);
  });

  postcodeInput?.addEventListener('input', () => {
    postcodeInput.value = postcodeInput.value.toUpperCase();
  });

  form?.querySelectorAll('.hs-input').forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.hs-input-group')?.classList.remove('hs-error');
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const fields = [
      { id: 'hs-name', validate: (value) => value.trim().length > 1 },
      { id: 'hs-phone', validate: (value) => value.replace(/\D/g, '').length >= 11 },
      { id: 'hs-email', validate: (value) => validateEmail(value.trim()) },
      { id: 'hs-postcode', validate: validatePostcode },
      { id: 'hs-type', validate: (value) => Boolean(value) },
      { id: 'hs-details', validate: (value) => value.trim().length > 5 },
    ];

    let isValid = true;
    fields.forEach((field) => {
      const input = document.getElementById(field.id);
      const group = input?.closest('.hs-input-group');
      group?.classList.remove('hs-error');

      if (!input || !field.validate(input.value)) {
        isValid = false;
        group?.classList.add('hs-error');
      }
    });

    if (!isValid) {
      submitButton?.classList.add('hs-shake-anim');
      window.setTimeout(() => submitButton?.classList.remove('hs-shake-anim'), 500);
      return;
    }

    submitButton?.classList.add('hs-loading');
    submitButton?.setAttribute('disabled', 'true');

    window.setTimeout(() => {
      submitButton?.classList.remove('hs-loading');
      submitButton?.removeAttribute('disabled');
      success?.classList.add('hs-active');
      form.reset();
    }, 900);
  });
}
