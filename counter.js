const match = location.pathname.match(/^\/(\w+)\/(\w+)/);
const ncode = match ? match[1] : null;
const episode = match ? match[2] : null;

function extractAndSendData() {
  // HTMLの内容
  const htmlContent = document.querySelector('.c-announce:not(.c-announce--note)').outerHTML;

  // DOMパーサーを使用してHTMLを解析
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // タイトルを取得
  const titleElement = doc.querySelector(`a[href^="/${ncode}/"]`);
  const title = titleElement ? titleElement.textContent : null;

  // 作者名を取得
  const userElement = doc.querySelector('a[href^="https://mypage.syosetu.com/"]');
  const userName = userElement ? userElement.textContent : null;

  // 作者IDを取得
  const userIdMatch = userElement ? userElement.href.match(/https:\/\/mypage\.syosetu\.com\/(\d+)\//) : null;
  const userId = userIdMatch ? userIdMatch[1] : null;

  const date = new Date();

  browser.runtime.sendMessage({
    action: 'addEpisodeCount',
    date,
    ncode,
    episode,
    title,
    userName,
    userId
  });
}
extractAndSendData();

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const date = new Date();
      const row_count = entry.target.textContent.length;
      const id = entry.target.id;

      browser.runtime.sendMessage({ action: 'addCount', date, ncode, episode, row_count, id }).then(response => {
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
