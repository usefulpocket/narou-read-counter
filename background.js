const { openDB } = idb;
const DB_NAME = 'NarouReadCounterDB';
const DB_VERSION = 1;

browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        switch (oldVersion) {
          case 0:
            const dailyCounts = db.createObjectStore('dailyCounts', { autoIncrement: true });
            dailyCounts.createIndex('dateNcodeIndex', ['date', 'ncode'], { unique: true });
            dailyCounts.createIndex('dateIndex', 'date');

            const novels = db.createObjectStore('novels', { keyPath: 'ncode' });
            novels.createIndex('userIdIndex', 'userId', { unique: false });
            novels.createIndex('titleIndex', 'title', { unique: false });
            novels.createIndex('lastReadIndex', 'lastRead', { unique: false });

            const users = db.createObjectStore('users', { keyPath: 'userId' });
            users.createIndex('userNameIndex', 'userName', { unique: false });
        }
      }
    });
  }
});

class AsyncQueueStack {
  #stackPush = [];
  #stackPop = [];
  #processing = false;

  async enqueue(asyncFunction) {
    this.#stackPush.push(asyncFunction);
    if (!this.#processing) {
      this.#processing = true;
      await this.processQueue();
    }
  }

  async dequeue() {
    if (this.#stackPop.length === 0) {
      while (this.#stackPush.length > 0) {
        this.#stackPop.push(this.#stackPush.pop());
      }
    }
    return this.#stackPop.length > 0 ? this.#stackPop.pop() : undefined;
  }

  async processQueue() {
    while (this.#stackPush.length > 0 || this.#stackPop.length > 0) {
      const asyncFunction = await this.dequeue();
      if (asyncFunction) {
        await asyncFunction();
      }
    }
    this.#processing = false;
  }
}

function notifyOptionsPage() {
  const views = browser.extension.getViews({ type: 'tab' });
  const optionsPage = views.find(view => view.location.pathname === '/options.html');
  if (optionsPage) {
    browser.runtime.sendMessage({ action: 'dataChanged' });
  }
}

let db;

async function getDB() {
  if (!db) {
    db = await openDB(DB_NAME, DB_VERSION);
  }
  return db;
}

async function storePutIndex(storeName, indexName, key, newObj, onFound) {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  const cursor = await store.index(indexName).openCursor(key);
  if (cursor) {
    const obj = onFound(cursor.value);
    store.put(obj, cursor.primaryKey);
  } else {
    store.add(newObj);
  }
  await tx.done;
}

async function dailyCountPut(date, ncode, newObj, onFound) {
  await storePutIndex('dailyCounts', 'dateNcodeIndex', [date, ncode], newObj, onFound);
}

async function storePut(storeName, key, newObj, onFound) {
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.store;
  let obj = await store.get(key);
  if (obj) {
    obj = onFound(obj);
    store.put(obj);
  } else {
    store.add(newObj);
  }
  await tx.done;
}

async function novelGet(ncode) {
  const db = await getDB();
  return await db.transaction('novels', 'readonly').store.get(ncode);
}

async function addCount(date, ncode, row_count, episode, position) {
  const dateOnly = new Date(new Date().setHours(0, 0, 0, 0));
  await dailyCountPut(dateOnly, ncode,
    { date: dateOnly, ncode, count: row_count },
    (dailyCount) => {
      dailyCount.count = dailyCount.count || 0;
      dailyCount.count += row_count;
      return dailyCount;
    }
  );
  await storePut('novels', ncode,
    { ncode, lastEpisode: episode, lastPosition: position, lastRead: date },
    (novel) => {
      novel = { ...novel, lastEpisode: episode, lastPosition: position, lastRead: date };
      return novel;
    }
  );
}

async function addEpisodeCount(date, ncode, episode, title, userName, userId) {
  const novel = await novelGet(ncode);
  if (!novel || novel.lastEpisode !== episode) {
    const dateOnly = new Date(new Date().setHours(0, 0, 0, 0));
    await dailyCountPut(dateOnly, ncode,
      { date: dateOnly, ncode, episode_count: 1 },
      (dailyCount) => {
        dailyCount.episode_count = dailyCount.episode_count || 0;
        dailyCount.episode_count += 1;
        return dailyCount;
      }
    );
  }
  await storePut('novels', ncode,
    { ncode, userId, title, lastEpisode: episode },
    (novel) => {
      novel = { ...novel, title, lastEpisode: episode };
      return novel;
    }
  );
  if (userId) {
    await storePut('users', userId,
      { userId, userName },
      (user) => {
        user.userName = userName;
        return user;
      }
    );
  }
}

const queue = new AsyncQueueStack();

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'addCount') {
    queue.enqueue(async () => {
      await addCount(message.date, message.ncode, message.row_count, message.episode, message.id);
      sendResponse({ status: 'success' });
      notifyOptionsPage();
    });
  } else if (message.action === 'addEpisodeCount') {
    queue.enqueue(async () => {
      await addEpisodeCount(message.date, message.ncode, message.episode, message.title, message.userName, message.userId);
      sendResponse({ status: 'success' });
      notifyOptionsPage();
    });
  }

  return true; // 非同期で sendResponse を呼び出すために true を返す
});
