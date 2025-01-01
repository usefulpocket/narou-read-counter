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
  static getNcodeAndEpisode() {
    const pathname = location.pathname;
    const match = pathname.match(/^\/(\w+)\/(\w+)/);
    const ncode = match ? match[1] : null;
    const episode = match ? match[2] : null;
    return [ncode, episode];
  }

  constructor() {
    [this.ncode, this.episode] = Syosetu.getNcodeAndEpisode();
    this._count = `${this.ncode}_count`;
    this._lastRead = `${this.ncode}_lastRead`;
    this.queue = new AsyncQueueStack();
  }

  async addCount(value, id) {
    this.queue.enqueue(async () => {
      let count = await this.getValue(this._count, 0);
      count += value;
      return this.setValue(this._count, count);
    });
    this.setLastRead(id);
  }

  setLastRead(id) {
    let info = {
      episode: this.episode,
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

const syosetu = new Syosetu();

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      syosetu.addCount(entry.target.textContent.length, entry.target.id);
      observer.unobserve(entry.target); // 必要に応じて監視を解除
    }
  });
};

const observer = new IntersectionObserver(callback, options);

document.querySelectorAll('.js-novel-text:not(.p-novel__text--afterword) p').forEach(el => {
  observer.observe(el);
});
