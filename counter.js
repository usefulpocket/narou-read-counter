const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const value = entry.target.textContent.length;
      const id = entry.target.id;
      const pathname = location.pathname;
      const match = pathname.match(/^\/(\w+)\/(\w+)/);
      const ncode = match ? match[1] : null;
      const episode = match ? match[2] : null;

      browser.runtime.sendMessage({ action: 'addCount', value, id, ncode, episode }).then(response => {
        if (response.status === 'success') {
          observer.unobserve(entry.target); // 必要に応じて監視を解除
        }
      });
    }
  });
};

const observer = new IntersectionObserver(callback, options);

document.querySelectorAll('.js-novel-text:not(.p-novel__text--afterword) p').forEach(el => {
  observer.observe(el);
});
