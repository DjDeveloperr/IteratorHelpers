// #region Types

// Prevent TS2669 in "declare global"
export {};

declare global {
  interface IteratorLike<T> {
    next: () => IteratorResult<T>;
  }

  class Iterator<T> {
    map<T2>(mapperFn: (value: T) => T2): Iterator<T2>;
    filter(filterFn: (value: T) => boolean): Iterator<T>;
    take(count: number): Iterator<T>;
    drop(count: number): Iterator<T>;
    flatMap<T2>(mapperFn: (value: T) => T2[]): Iterator<T2>;
    reduce<T2>(
      reducerFn: (previousValue: T2, currentValue: T) => T2,
      initialValue?: T2,
    ): T2;
    toArray(): T[];
    forEach(callback: (value: T) => unknown): void;
    some(callback: (value: T) => boolean): boolean;
    every(callback: (value: T) => boolean): boolean;
    static from(): Iterator<unknown>;
    static from<T>(array: T[]): Iterator<T>;
    static from<T>(iterator: IteratorLike<T>): Iterator<T>;
  }

  interface AsyncIteratorLike<T> {
    next: () => Promise<IteratorResult<T>>;
  }

  class AsyncIterator<T> {
    map<T2>(filterFn: (value: T) => T2): AsyncIterator<T2>;
    filter(filterFn: (value: T) => boolean): AsyncIterator<T>;
    take(count: number): AsyncIterator<T>;
    drop(count: number): AsyncIterator<T>;
    flatMap<T2>(mapperFn: (value: T) => T2[]): AsyncIterator<T2>;
    reduce<T2>(
      reducerFn: (previousValue: T2, currentValue: T) => T2,
      initialValue?: T2,
    ): Promise<T2>;
    toArray(): Promise<T[]>;
    forEach(callback: (value: T) => unknown): Promise<void>;
    some(callback: (value: T) => boolean): Promise<boolean>;
    every(callback: (value: T) => boolean): Promise<boolean>;
    static from(): AsyncIterator<unknown>;
    static from<T>(array: T[]): AsyncIterator<T>;
    static from<T>(iterator: AsyncIteratorLike<T>): AsyncIterator<T>;
  }
}

// #endregion

// #region Utility

/** Define a Prototype method only if it doesn't exist */
function definePrototypeMethod(
  proto: any,
  value: CallableFunction,
) {
  const method = value.name;
  if (typeof proto[method] === "undefined") {
    Object.defineProperty(proto, method, {
      value,
      enumerable: false,
    });
  }
}

// #endregion

// #region Prototypes and Globals

const GeneratorPrototype = (function* () {})().constructor.prototype;
const AsyncGeneratorPrototype = (async function* () {})().constructor.prototype;

const InvalidFromValue = new TypeError(
  `Expected array or iterator-like object`,
);

if (typeof (globalThis as any).Iterator === "undefined") {
  function Iterator() {
    return function* () {};
  }

  Object.setPrototypeOf(Iterator.prototype, GeneratorPrototype);

  Object.defineProperty(Iterator, "from", {
    value: function (what: unknown) {
      if (typeof what === "object" && what !== null) {
        if (Array.isArray(what)) {
          return (function* () {
            for (const value of what) {
              yield value;
            }
          })();
        } else if (typeof (what as any).next === "function") {
          return (function* () {
            let value;
            while ((value = (what as any).next().value)) {
              yield value;
            }
          })();
        } else throw InvalidFromValue;
      } else throw InvalidFromValue;
    },
    enumerable: false,
  });

  Object.defineProperty(globalThis, "Iterator", {
    value: Iterator,
  });
}

if (typeof (globalThis as any).AsyncIterator === "undefined") {
  function AsyncIterator() {
    return async function* () {};
  }

  Object.setPrototypeOf(AsyncIterator.prototype, GeneratorPrototype);

  Object.defineProperty(AsyncIterator, "from", {
    value: function (what: unknown) {
      if (typeof what === "object" && what !== null) {
        if (Array.isArray(what)) {
          return (async function* () {
            for (const item of what) {
              yield item;
            }
          })();
        } else if (typeof (what as any).next === "function") {
          return (async function* () {
            let value;
            while ((value = (await (what as any).next()).value)) {
              yield value;
            }
          })();
        } else throw InvalidFromValue;
      } else throw InvalidFromValue;
    },
    enumerable: false,
  });

  Object.defineProperty(globalThis, "AsyncIterator", {
    value: AsyncIterator,
  });
}

// #endregion

// #region (Async)Iterator.map

definePrototypeMethod(
  GeneratorPrototype,
  function map(this: IterableIterator<any>, mapperFn: (value: any) => any) {
    return (function* (this: IterableIterator<any>) {
      let value;
      while ((value = this.next().value)) {
        yield mapperFn(value);
      }
    }).bind(this)();
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  function map(
    this: AsyncIterableIterator<any>,
    mapperFn: (value: any) => any,
  ) {
    return (async function* (this: AsyncIterableIterator<any>) {
      let value;
      while ((value = await this.next().then((e) => e.value))) {
        yield mapperFn(value);
      }
    }).bind(this)();
  },
);

// #endregion

// #region (Async)Iterator.filter

definePrototypeMethod(
  GeneratorPrototype,
  function filter(this: IterableIterator<any>, filterFn: (value: any) => any) {
    return (function* (this: IterableIterator<any>) {
      let value;
      while ((value = this.next().value)) {
        if (filterFn(value)) {
          yield value;
        }
      }
    }).bind(this)();
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  function filter(
    this: AsyncIterableIterator<any>,
    filterFn: (value: any) => any,
  ) {
    return (async function* (this: AsyncIterableIterator<any>) {
      let value;
      while ((value = await this.next().then((e) => e.value))) {
        if (filterFn(value)) {
          yield value;
        }
      }
    }).bind(this)();
  },
);

// #endregion

// #region (Async)Iterator.take

definePrototypeMethod(
  GeneratorPrototype,
  function take(this: IterableIterator<any>, count: number) {
    return (function* (this: IterableIterator<any>) {
      let value;
      while ((value = this.next().value)) {
        if (count-- > 0) {
          yield value;
        } else {
          break;
        }
      }
    }).bind(this)();
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  function take(
    this: AsyncIterableIterator<any>,
    count: number,
  ) {
    return (async function* (this: AsyncIterableIterator<any>) {
      let value;
      while ((value = await this.next().then((e) => e.value))) {
        if (count-- > 0) {
          yield value;
        } else {
          break;
        }
      }
    }).bind(this)();
  },
);

// #endregion

// #region (Async)Iterator.drop

definePrototypeMethod(
  GeneratorPrototype,
  function drop(this: IterableIterator<any>, count: number) {
    return (function* (this: IterableIterator<any>) {
      let value;
      while ((value = this.next().value)) {
        if (count-- > 0) {
          continue;
        } else {
          yield value;
        }
      }
    }).bind(this)();
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  function drop(
    this: AsyncIterableIterator<any>,
    count: number,
  ) {
    return (async function* (this: AsyncIterableIterator<any>) {
      let value;
      while ((value = await this.next().then((e) => e.value))) {
        if (count-- > 0) {
          continue;
        } else {
          yield value;
        }
      }
    }).bind(this)();
  },
);

// #endregion

// #region (Async)Iterator.flatMap

definePrototypeMethod(
  GeneratorPrototype,
  function flatMap(
    this: IterableIterator<any>,
    mapperFn: (value: any) => IterableIterator<any>,
  ) {
    return (function* (this: IterableIterator<any>) {
      let value;
      while ((value = this.next().value)) {
        for (const item of mapperFn(value)) {
          yield item;
        }
      }
    }).bind(this)();
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  function flatMap(
    this: AsyncIterableIterator<any>,
    mapperFn: (value: any) => AsyncIterableIterator<any>,
  ) {
    return (async function* (this: AsyncIterableIterator<any>) {
      let value;
      while ((value = await this.next().then((e) => e.value))) {
        for await (const item of mapperFn(value)) {
          yield item;
        }
      }
    }).bind(this)();
  },
);

// #endregion

// #region (Async)Iterator.reduce

definePrototypeMethod(
  GeneratorPrototype,
  function reduce(
    this: IterableIterator<any>,
    reducerFn: (accumulator: any, value: any) => any,
    initialValue: any,
  ) {
    let accumulator = initialValue;
    let value;
    while ((value = this.next().value)) {
      accumulator = reducerFn(accumulator, value);
    }
    return accumulator;
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  async function reduce(
    this: AsyncIterableIterator<any>,
    reducerFn: (accumulator: any, value: any) => any,
    initialValue: any,
  ) {
    let accumulator = initialValue;
    let value;
    while ((value = await this.next().then((e) => e.value))) {
      accumulator = reducerFn(accumulator, value);
    }
    return accumulator;
  },
);

// #endregion

// #region (Async)Iterator.toArray

definePrototypeMethod(
  GeneratorPrototype,
  function toArray(this: IterableIterator<any>) {
    const result = [];
    let value;
    while ((value = this.next().value)) {
      result.push(value);
    }
    return result;
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  async function toArray(this: AsyncIterableIterator<any>) {
    const result = [];
    let value;
    while ((value = await this.next().then((e) => e.value))) {
      result.push(value);
    }
    return result;
  },
);

// #endregion

// #region (Async)Iterator.forEach

definePrototypeMethod(
  GeneratorPrototype,
  function forEach<T>(
    this: IterableIterator<T>,
    callbackFn: (value: T) => unknown,
  ) {
    let value;
    while ((value = this.next().value)) {
      callbackFn(value);
    }
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  async function forEach<T>(
    this: AsyncIterableIterator<T>,
    callbackFn: (value: T) => unknown,
  ) {
    let value;
    while ((value = await this.next().then((e) => e.value))) {
      await callbackFn(value);
    }
  },
);

// #endregion

// #region (Async)Iterator.some

definePrototypeMethod(
  GeneratorPrototype,
  function some(
    this: IterableIterator<any>,
    predicateFn: (value: any) => boolean,
  ) {
    let value;
    while ((value = this.next().value)) {
      if (predicateFn(value)) {
        return true;
      }
    }
    return false;
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  async function some(
    this: AsyncIterableIterator<any>,
    predicateFn: (value: any) => boolean,
  ) {
    let value;
    while ((value = await this.next().then((e) => e.value))) {
      if (predicateFn(value)) {
        return true;
      }
    }
    return false;
  },
);

// #endregion

// #region (Async)Iterator.every

definePrototypeMethod(
  GeneratorPrototype,
  function every(
    this: IterableIterator<any>,
    predicateFn: (value: any) => boolean,
  ) {
    let value;
    while ((value = this.next().value)) {
      if (!predicateFn(value)) {
        return false;
      }
    }
    return true;
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  async function every(
    this: AsyncIterableIterator<any>,
    predicateFn: (value: any) => boolean,
  ) {
    let value;
    while ((value = await this.next().then((e) => e.value))) {
      if (!predicateFn(value)) {
        return false;
      }
    }
    return true;
  },
);

// #endregion
