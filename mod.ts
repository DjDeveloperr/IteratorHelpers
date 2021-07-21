// #region Types

declare global {
  interface IteratorLike<T> {
    next: () => IteratorResult<T>;
  }

  class Iterator<T> {
    map<T2>(mapperFn: (value: T) => T2): Iterator<T2>;
    filter(filterFn: (value: T) => boolean): Iterator<T>;
    take(count: number): Iterator<T>;
    drop(count: number): Iterator<T>;
    asIndexedPairs(): Iterator<[number, T]>;
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
    asIndexedPairs(): AsyncIterator<[number, T]>;
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

// Prevent TS2669 in "declare global"
export {};

// #endregion

// #region Prototypes and Globals

/** Define a Prototype method only if it doesn't exist */
function definePrototypeMethod(
  proto: unknown,
  value: CallableFunction,
) {
  const method = value.name;
  if (
    typeof proto === "object" && proto !== null &&
    typeof (proto as Record<string, unknown>)[method] === "undefined"
  ) {
    Object.defineProperty(proto, method, {
      value: asNative(value),
      enumerable: false,
    });
  }
}

const GeneratorPrototype = (function* () {})().constructor.prototype;
const AsyncGeneratorPrototype = (async function* () {})().constructor.prototype;

const InvalidFromValue = new TypeError(
  `Expected array or iterator-like object`,
);

function asNative<T extends CallableFunction>(val: T): T {
  Object.defineProperty(val, "toString", {
    value: () => `function ${val.name}() { [native code] }`,
    enumerable: false,
  });
  return val;
}

const Iterator = asNative(function Iterator() {
  return (function* () {})();
});

Object.setPrototypeOf(Iterator.prototype, GeneratorPrototype);

Object.defineProperty(Iterator, "from", {
  value: asNative(function from(what: unknown) {
    if (typeof what === "object" && what !== null) {
      if (Array.isArray(what)) {
        return (function* () {
          for (const value of what) {
            yield value;
          }
        })();
      } else if (typeof (what as IteratorLike<unknown>).next === "function") {
        return (function* () {
          let value;
          while ((value = (what as IteratorLike<unknown>).next().value)) {
            yield value;
          }
        })();
      } else throw InvalidFromValue;
    } else throw InvalidFromValue;
  }),
  enumerable: false,
});

if (
  typeof (globalThis as unknown as { Iterator: unknown }).Iterator ===
    "undefined"
) {
  Object.defineProperty(globalThis, "Iterator", {
    value: Iterator,
  });
}

const AsyncIterator = asNative(function AsyncIterator() {
  return (async function* () {})();
});

Object.setPrototypeOf(AsyncIterator.prototype, GeneratorPrototype);

Object.defineProperty(AsyncIterator, "from", {
  value: asNative(function from(what: unknown) {
    if (typeof what === "object" && what !== null) {
      if (Array.isArray(what)) {
        return (async function* () {
          for (const item of what) {
            yield item;
          }
        })();
      } else if (
        typeof (what as AsyncIteratorLike<unknown>).next === "function"
      ) {
        return (async function* () {
          let value;
          while (
            (value = (await (what as AsyncIteratorLike<unknown>).next()).value)
          ) {
            yield value;
          }
        })();
      } else throw InvalidFromValue;
    } else throw InvalidFromValue;
  }),
  enumerable: false,
});

if (
  typeof (globalThis as unknown as { AsyncIterator: CallableFunction })
    .AsyncIterator === "undefined"
) {
  Object.defineProperty(globalThis, "AsyncIterator", {
    value: AsyncIterator,
  });
}

// #endregion

// #region (Async)Iterator.map

definePrototypeMethod(
  GeneratorPrototype,
  function map<T>(this: IterableIterator<T>, mapperFn: <T2>(value: T) => T2) {
    return (function* (this: IterableIterator<T>) {
      let value;
      while ((value = this.next().value)) {
        yield mapperFn(value);
      }
    }).bind(this)();
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  function map<T>(
    this: AsyncIterableIterator<T>,
    mapperFn: <T2>(value: T) => T2,
  ) {
    return (async function* (this: AsyncIterableIterator<T>) {
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
  function filter<T>(
    this: IterableIterator<T>,
    filterFn: (value: T) => boolean,
  ) {
    return (function* (this: IterableIterator<T>) {
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
  function filter<T>(
    this: AsyncIterableIterator<T>,
    filterFn: (value: T) => boolean,
  ) {
    return (async function* (this: AsyncIterableIterator<T>) {
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
  function take<T>(this: IterableIterator<T>, count: number) {
    return (function* (this: IterableIterator<T>) {
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
  function take<T>(
    this: AsyncIterableIterator<T>,
    count: number,
  ) {
    return (async function* (this: AsyncIterableIterator<T>) {
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
  function drop<T>(this: IterableIterator<T>, count: number) {
    return (function* (this: IterableIterator<T>) {
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
  function drop<T>(
    this: AsyncIterableIterator<T>,
    count: number,
  ) {
    return (async function* (this: AsyncIterableIterator<T>) {
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

// #region (Async)Iterator.asIndexedPairs

definePrototypeMethod(
  GeneratorPrototype,
  function asIndexedPairs<T>(this: IterableIterator<T>) {
    return (function* (this: IterableIterator<T>) {
      let value;
      let index = 0;
      while ((value = this.next().value)) {
        yield [index++, value];
      }
    }).bind(this)();
  },
);

definePrototypeMethod(
  AsyncGeneratorPrototype,
  function asIndexedPairs<T>(this: AsyncIterableIterator<T>) {
    return (async function* (this: AsyncIterableIterator<T>) {
      let value;
      let index = 0;
      while ((value = await this.next().then((e) => e.value))) {
        yield [index++, value];
      }
    }).bind(this)();
  },
);

// #endregion

// #region (Async)Iterator.flatMap

definePrototypeMethod(
  GeneratorPrototype,
  function flatMap<T>(
    this: IterableIterator<T>,
    mapperFn: <T2>(value: T) => T2[],
  ) {
    return (function* (this: IterableIterator<T>) {
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
  function flatMap<T>(
    this: AsyncIterableIterator<T>,
    mapperFn: <T2>(value: T) => T2[],
  ) {
    return (async function* (this: AsyncIterableIterator<T>) {
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
  function reduce<T, T2>(
    this: IterableIterator<T>,
    reducerFn: (accumulator: T2, value: T) => T2,
    initialValue: T2,
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
  async function reduce<T, T2>(
    this: AsyncIterableIterator<T>,
    reducerFn: (accumulator: T2, value: T) => T2,
    initialValue: T2,
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
  function toArray<T>(this: IterableIterator<T>) {
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
  async function toArray<T>(this: AsyncIterableIterator<T>) {
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
  function some<T>(
    this: IterableIterator<T>,
    predicateFn: (value: T) => boolean,
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
  async function some<T>(
    this: AsyncIterableIterator<T>,
    predicateFn: (value: T) => boolean,
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
  function every<T>(
    this: IterableIterator<T>,
    predicateFn: (value: T) => boolean,
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
  async function every<T>(
    this: AsyncIterableIterator<T>,
    predicateFn: (value: T) => boolean,
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
