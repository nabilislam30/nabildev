(() => {
  if (document.body?.dataset.page !== 'contact') return;

  const form = document.querySelector('[data-contact-form]');
  const submit = document.querySelector('[data-contact-submit]');
  const submitLabel = document.querySelector('[data-contact-submit-label]');
  const status = document.querySelector('[data-contact-status]');
  if (!form || !submit || !submitLabel || !status) return;

  const endpoint = form.dataset.contactEndpoint || form.action;

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.classList.toggle('is-success', type === 'success');
    status.classList.toggle('is-error', type === 'error');
  };

  if (new URLSearchParams(window.location.search).get('sent') === '1') {
    setStatus('Thanks — your message has been submitted.', 'success');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const honeypot = form.querySelector('[name="_honey"]');
    if (honeypot?.value) {
      form.reset();
      setStatus('Thanks — your message has been submitted.', 'success');
      return;
    }

    submit.disabled = true;
    submit.classList.add('is-sending');
    submitLabel.textContent = 'Sending…';
    setStatus('Sending your message…');

    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error('Submission failed');

      form.reset();
      setStatus('Thanks — your message has been submitted.', 'success');
    } catch (_) {
      setStatus('Your message could not be sent. Please try again or connect on LinkedIn.', 'error');
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-sending');
      submitLabel.textContent = 'Send message';
    }
  });
})();
