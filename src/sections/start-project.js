export function initStartProject() {
  const rootSection = document.getElementById("syp-section");
  if (!rootSection || rootSection.dataset.agInitialized === 'true') return;
  rootSection.dataset.agInitialized = 'true';

  const form = document.getElementById('syp-form');
        const phoneInput = document.getElementById('syp-phone');
        const selectInput = document.getElementById('syp-type');
        const submitBtn = document.getElementById('syp-submit');
        const btnText = submitBtn.querySelector('.syp-btn-text');

        // Change select color when option is chosen
        selectInput.addEventListener('change', function() {
          if(this.value !== "") {
            this.classList.add('has-value');
          }
        });

        // Strict UK Phone Formatter (+44 format)
        phoneInput.addEventListener('input', function(e) {
          // Strip everything except digits and plus sign
          let val = this.value.replace(/[^\d+]/g, '');

          // If empty, reset
          if (val.length === 0) {
            this.value = '';
            return;
          }

          // Force +44 at the start
          if (!val.startsWith('+44')) {
             // Remove any leading + or 0, then prepend +44
             let rawDigits = val.replace(/^(\+?44)?0?/, '');
             val = '+44' + rawDigits;
          }

          // Format spacing: +44 XXXX XXXXXX
          let formatted = '+44';
          let digits = val.substring(3); // Get numbers after +44

          if (digits.length > 0) formatted += ' ' + digits.substring(0, 4);
          if (digits.length > 4) formatted += ' ' + digits.substring(4, 10);

          this.value = formatted;
        });

        // Validation Helper
        const validateEmail = (email) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };

        // Form Submit Handler
        form.addEventListener('submit', (e) => {
          e.preventDefault();

          let isValid = true;

          // Elements to validate
          const fields = [
            { id: 'syp-name', validate: (v) => v.trim() !== '' },
            { id: 'syp-phone', validate: (v) => v.length >= 12 }, // Basic length check for +44 format
            { id: 'syp-email', validate: (v) => validateEmail(v.trim()) },
            { id: 'syp-postcode', validate: (v) => v.trim() !== '' },
            { id: 'syp-type', validate: (v) => v !== '' },
            { id: 'syp-details', validate: (v) => v.trim() !== '' }
          ];

          // Reset errors
          document.querySelectorAll('.syp-input-group').forEach(group => {
            group.classList.remove('is-error');
          });

          // Run validation
          fields.forEach(field => {
            const el = document.getElementById(field.id);
            const group = el.closest('.syp-input-group');

            if (!field.validate(el.value)) {
              isValid = false;
              group.classList.add('is-error');
            }
          });

          if (!isValid) {
            // Error UI for Submit Button
            submitBtn.classList.add('btn-error', 'syp-shake-anim');
            btnText.innerText = 'Please complete all fields';

            // Remove shake animation after it completes so it can be triggered again
            setTimeout(() => {
              submitBtn.classList.remove('syp-shake-anim');
            }, 500);

            // Reset button text color after a delay
            setTimeout(() => {
              submitBtn.classList.remove('btn-error');
              btnText.innerText = 'Send Enquiry';
            }, 2500);

            return;
          }

          // Valid State -> Loading UI
          submitBtn.classList.add('is-loading');
          submitBtn.disabled = true;
          btnText.innerText = 'Sending...';

          // Simulate API Request
          setTimeout(() => {
            // Success UI
            submitBtn.classList.remove('is-loading');
            submitBtn.classList.add('is-success');
            btnText.innerText = 'Enquiry Sent Successfully';

            // Reset form
            form.reset();
            selectInput.classList.remove('has-value');

            // Reset button back to normal after 3 seconds
            setTimeout(() => {
              submitBtn.classList.remove('is-success');
              submitBtn.disabled = false;
              btnText.innerText = 'Send Enquiry';
            }, 3000);

          }, 1500);
        });

        // Remove error state on input
        form.querySelectorAll('.syp-input, .syp-select, .syp-textarea').forEach(input => {
          input.addEventListener('input', function() {
            this.closest('.syp-input-group').classList.remove('is-error');
          });
        });
}
