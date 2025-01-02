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

class Syosetu {
  constructor(ncode) {
    this.ncode = ncode;
    this._count = `${this.ncode}_count`;
    this._lastRead = `${this.ncode}_lastRead`;
    this.queue = new AsyncQueueStack();
  }

  async addCount(value, id, episode) {
    this.queue.enqueue(async () => {
      let count = await this.getValue(this._count, 0);
      count += value;
      return this.setValue(this._count, count);
    });
    this.setLastRead(id, episode);
  }

  setLastRead(id, episode) {
    let info = {
      episode: episode,
      position: id,
      time: Date.now()
    }
    this.setValue(this._lastRead, info);
  }

  async getValue(name, defaultValue) {
    const item = await browser.storage.local.get(name);
    let value;
    if (item.hasOwnProperty(name)) {
      [,value] = Object.entries(item)[0];
    } else {
      value = defaultValue;
    }
    return value;
  }

  async setValue(name, value) {
    return browser.storage.local.set({ [name]: value });
  }
}

const syosetuInstances = {};

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const ncode = message.ncode;

  if (message.action === 'addCount') {
    if (!syosetuInstances[ncode]) {
      syosetuInstances[ncode] = new Syosetu(ncode);
    }
    syosetuInstances[ncode].addCount(message.value, message.id, message.episode).then(() => {
      sendResponse({ status: 'success' });
    });
  }

  return true; // 非同期で sendResponse を呼び出すために true を返す
});
