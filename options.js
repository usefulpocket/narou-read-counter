const { openDB } = idb;
const DB_NAME = 'NarouReadCounterDB';
const DB_VERSION = 1;

let db;
let currentPage = 0;
const itemsPerPage = 99999;

async function getDailyCountsDescending(limit, offset) {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION);
  }
  const tx = db.transaction('dailyCounts', 'readonly');
  const store = tx.store;
  const index = store.index('dateIndex');
  const results = [];
  let cursor = await index.openCursor(null, 'prev'); // 降順でカーソルを開く

  // オフセットをスキップ
  for (let i = 0; i < offset && cursor; i++) {
    cursor = await cursor.continue();
  }

  // リミット分だけ取得
  for (let i = 0; i < limit && cursor; i++) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }

  await tx.done;
  return results;
}

function groupedDailyCounts(allData) {
  const groupedData = Object.groupBy(allData, item => item.date);
  return Object.values(groupedData).map(group => {
    return group.reduce((acc, current) => {
      acc.date = current.date;
      acc.episodeCount += current.episode_count || 0;
      acc.novelCount += 1;
      acc.totalCount += current.count || 0;
      return acc;
    }, { episodeCount: 0, novelCount: 0, totalCount: 0 });
  });
}

async function loadPage(page) {
  const offset = page * itemsPerPage;
  const dailyCountsList = await getDailyCountsDescending(itemsPerPage, offset);
  const groupedData = groupedDailyCounts(dailyCountsList);

  const output = document.getElementById('output');
  output.innerHTML = ''; // 既存の内容をクリア

  // ヘッダーを追加
  let header = document.createElement('div');
  header.className = 'row';
  header.innerHTML = `
      <div class="column"><strong>日付</strong></div>
      <div class="column column-20"><strong>文字数</strong></div>
      <div class="column column-20"><strong>作品数</strong></div>
      <div class="column column-20"><strong>エピソード数</strong></div>
  `;
  output.appendChild(header);

  let rows = [];

  for (let data of groupedData) {
    let div = document.createElement('div');
    div.className = 'row';

    // 日付をx月x日形式に変換
    const date = data.date;
    const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;

    div.innerHTML = `
        <div class="column">${formattedDate}</div>
        <div class="column column-20">${data.totalCount}</div>
        <div class="column column-20">${data.novelCount}</div>
        <div class="column column-20">${data.episodeCount}</div>
    `;
    rows.push(div);
  }

  rows.forEach(row => output.appendChild(row));
}

document.addEventListener('DOMContentLoaded', function() {
  // 初期ページの読み込み
  loadPage(currentPage);
});

browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'dataChanged') {
    loadPage(currentPage);
  }
  return true;
});
