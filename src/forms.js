export function initForms() {
  const forms = [
    { id: 'hs-quote-form', prefix: 'hs' },
    { id: 'syp-form', prefix: 'syp' }
  ];

  const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/27822859/4bkdgjs/';

  forms.forEach(f => {
    const form = document.getElementById(f.id);
    if (!form) return;

    const phoneInput = form.querySelector('[name="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let val = e.target.value;
        // Strip non-digits
        val = val.replace(/\D/g, '');
        // Remove leading zero
        if (val.startsWith('0')) {
          val = val.substring(1);
        }
        // Cap at 10 digits
        if (val.length > 10) {
          val = val.substring(0, 10);
        }
        e.target.value = val;
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const loader = form.querySelector('.hs-loader'); // if exists
      const btnText = btn.querySelector('span') || btn;
      const originalText = btnText ? btnText.textContent : btn.textContent;
      const formAlert = document.getElementById(`${f.prefix}-form-alert`);
      
      if (formAlert) {
        formAlert.style.display = 'none';
        formAlert.textContent = '';
      }

      // Reset all errors
      const inputGroups = form.querySelectorAll('.hs-input-group, .syp-input-group');
      inputGroups.forEach(group => group.classList.remove('hs-error', 'is-error'));
      const inputs = form.querySelectorAll('.hs-input, .syp-input, .syp-textarea');
      inputs.forEach(input => input.classList.remove('error', 'hs-error', 'syp-error'));

      const formData = new FormData(form);
      let isValid = true;

      const showError = (name, errorIdSuffix) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) {
            input.classList.add('error');
            const group = input.closest('.hs-input-group, .syp-input-group');
            if (group) {
              if (f.prefix === 'hs') group.classList.add('hs-error');
              if (f.prefix === 'syp') group.classList.add('is-error');
            }
        }
        isValid = false;
      };

      // Validation
      const fullName = formData.get('full_name') || '';
      if (!fullName.trim() || /\d/.test(fullName)) {
        showError('full_name', 'name');
      }

      const email = formData.get('email') || '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.trim() || !emailRegex.test(email)) {
        showError('email', 'email');
      }

      const phone = formData.get('phone') || '';
      const phoneRegex = /^[1-9]\d{8,9}$/;
      if (!phone.trim() || !phoneRegex.test(phone)) {
        showError('phone', 'phone');
      }

      const address = formData.get('address') || '';
      if (!address.trim()) {
        showError('address', 'address');
      }

      const city = formData.get('city') || '';
      if (!city.trim()) {
        showError('city', 'city');
      }

      const postCode = formData.get('post_code') || '';
      const postCodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
      if (!postCode.trim() || !postCodeRegex.test(postCode)) {
        showError('post_code', 'postcode');
      }

      const message = formData.get('message') || '';
      if (!message.trim()) {
        showError('message', 'message');
      }

      if (!isValid) return;

      // Loading state
      btn.disabled = true;
      btn.classList.add('is-loading');
      if (btnText) btnText.textContent = 'Sending...';
      if (loader) loader.style.display = 'block';
      btn.style.opacity = '0.7';

      // Prepend +44 to phone
      formData.set('phone', `+44 ${phone}`);

      try {
        const res = await fetch(ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          body: formData,
        });
        
        // Success
        form.style.display = 'none';
        
        // Find success state sibling
        const successState = document.getElementById(`${f.prefix}-success`);
        if (successState) {
          successState.style.display = 'flex';
        } else {
          if (formAlert) {
            form.style.display = 'grid'; // bring back form to show alert (syp form is a grid)
            if (f.prefix === 'hs') form.style.display = 'block';
            formAlert.style.background = '#e8f5e9';
            formAlert.style.borderColor = '#4caf50';
            formAlert.style.color = '#2e7d32';
            formAlert.textContent = 'Request received / thank you! Our team will contact you shortly.';
            formAlert.style.display = 'block';
            form.reset(); // clear fields
          }
        }
      } catch (error) {
        console.error('Submission error', error);
        if (formAlert) {
          formAlert.style.background = '#fdf7f7';
          formAlert.style.borderColor = '#d9534f';
          formAlert.style.color = '#d9534f';
          formAlert.textContent = 'There was an issue sending your request. Please try again or call us directly.';
          formAlert.style.display = 'block';
        }
      } finally {
        btn.disabled = false;
        btn.classList.remove('is-loading');
        if (btnText) btnText.textContent = originalText;
        if (loader) loader.style.display = 'none';
        btn.style.opacity = '1';
      }
    });
  });
}
