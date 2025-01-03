document.addEventListener('DOMContentLoaded', function() {
    function loadData() {
        browser.storage.local.get().then(function(storageData) {
            let output = document.getElementById('output');
            output.innerHTML = ''; // 既存の内容をクリア
            let dataObject = {};

            for (let [key, value] of Object.entries(storageData)) {
                let ncode = key.split('_')[0];
                if (!dataObject[ncode]) {
                    dataObject[ncode] = {};
                }
                dataObject[ncode][key.split('_')[1]] = value;
            }

            // ヘッダーを追加
            let header = document.createElement('div');
            header.className = 'row';
            header.innerHTML = `
                <div class="column"><strong>Ncode</strong></div>
                <div class="column column-20"><strong>Count</strong></div>
                <div class="column column-40"><strong>Last Read</strong></div>
            `;
            output.appendChild(header);

            let rows = [];

            for (let [ncode, data] of Object.entries(dataObject)) {
                let ncodeLink = `https://ncode.syosetu.com/${ncode}/`;
                let lastReadInfo = data.lastRead ? `${data.lastRead.episode}#${data.lastRead.position}` : 'N/A';
                let lastReadTime = data.lastRead ? 
                    new Date(data.lastRead.time).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }) : 'N/A';
                let lastReadLink = data.lastRead ? `https://ncode.syosetu.com/${ncode}/${data.lastRead.episode}/#${data.lastRead.position}` : 'N/A';
                let div = document.createElement('div');
                div.className = 'row';
                let lastReadTimestamp = data.lastRead ? new Date(data.lastRead.time).getTime() : 0;
                div.setAttribute('data-last-read-time', lastReadTimestamp);
                div.innerHTML = `
                    <div class="column"><a href="${ncodeLink}" target="_blank">${ncode}</a></div>
                    <div class="column column-20">${data.count || 0}</div>
                    <div class="column column-20">${lastReadTime}</div>
                    <div class="column column-20"><a href="${lastReadLink}" target="_blank">${lastReadInfo}</a></div>
                `;
                rows.push(div);
            }

            // 並び替え
            rows.sort((a, b) => b.getAttribute('data-last-read-time') - a.getAttribute('data-last-read-time'));
            rows.forEach(row => output.appendChild(row));
        });
    }

    loadData();

    // storage.localに変更があった場合に再読み込み
    browser.storage.onChanged.addListener(loadData);
});