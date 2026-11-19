// Optional theme preview only. No persistence, analytics, requests or app imports.
document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const light = document.body.dataset.theme !== 'light';
    document.body.dataset.theme = light ? 'light' : 'dark';
    button.textContent = light ? 'Tema scuro' : 'Tema chiaro';
  });
});
