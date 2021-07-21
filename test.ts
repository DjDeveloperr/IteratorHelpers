import "./mod.ts";
import { assertEquals } from "https://deno.land/std@0.102.0/testing/asserts.ts";

function createIterator<T>(from: T[]) {
  return Iterator.from(from);
}

function createAsyncIterator<T>(from: T[], delay = 10) {
  let i = 0;
  return AsyncIterator.from({
    next: async () => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return { value: from[i++], done: i >= from.length };
    },
  });
}

Deno.test("Iterator()", () => {
  assertEquals(new Iterator().next().value, undefined);
});

Deno.test("AsyncIterator()", async () => {
  assertEquals((await new AsyncIterator().next()).value, undefined);
});

Deno.test("Iterator.from", () => {
  const iterator = createIterator([1, 2, 3]);
  assertEquals(iterator.next().value, 1);
  assertEquals(iterator.next().value, 2);
  assertEquals(iterator.next().value, 3);
});

Deno.test("AsyncIterator.from", async () => {
  const asyncIterator = createAsyncIterator([1, 2, 3]);
  assertEquals((await asyncIterator.next()).value, 1);
  assertEquals((await asyncIterator.next()).value, 2);
  assertEquals((await asyncIterator.next()).value, 3);
});

Deno.test("Iterator.prototype.map", () => {
  const iterator = createIterator([1, 2, 3]).map((e) => e + 1);
  const array = iterator.toArray();
  assertEquals(array, [2, 3, 4]);
});

Deno.test("AsyncIterator.prototype.map", async () => {
  const iterator = createAsyncIterator([1, 2, 3]).map((e) => e + 1);
  const array = await iterator.toArray();
  assertEquals(array, [2, 3, 4]);
});

Deno.test("Iterator.prototype.filter", () => {
  const iterator = createIterator([1, 2, 3, 4]).filter((e) => e % 2 === 0);
  const array = iterator.toArray();
  assertEquals(array, [2, 4]);
});

Deno.test("AsyncIterator.prototype.filter", async () => {
  const iterator = createAsyncIterator([1, 2, 3, 4]).filter((e) => e % 2 === 0);
  const array = await iterator.toArray();
  assertEquals(array, [2, 4]);
});

Deno.test("Iterator.prototype.take", () => {
  const iterator = createIterator([1, 2, 3]).take(2);
  const array = iterator.toArray();
  assertEquals(array, [1, 2]);
});

Deno.test("AsyncIterator.prototype.take", async () => {
  const iterator = createAsyncIterator([1, 2, 3]).take(2);
  const array = await iterator.toArray();
  assertEquals(array, [1, 2]);
});

Deno.test("Iterator.prototype.drop", () => {
  const iterator = createIterator([1, 2, 3]).drop(2);
  const array = iterator.toArray();
  assertEquals(array, [3]);
});

Deno.test("AsyncIterator.prototype.drop", async () => {
  const iterator = createAsyncIterator([1, 2, 3]).drop(2);
  const array = await iterator.toArray();
  assertEquals(array, [3]);
});

Deno.test("Iterator.prototype.flatMap", () => {
  const iterator = createIterator([1, 2, 3]).flatMap((e) => [e, e + 1]);
  const array = iterator.toArray();
  assertEquals(array, [1, 2, 2, 3, 3, 4]);
});

Deno.test("AsyncIterator.prototype.flatMap", async () => {
  const iterator = createAsyncIterator([1, 2, 3]).flatMap((e) => [e, e + 1]);
  const array = await iterator.toArray();
  assertEquals(array, [1, 2, 2, 3, 3, 4]);
});

Deno.test("Iterator.prototype.reduce", () => {
  const iterator = createIterator([1, 2, 3]);
  const reduce = iterator.reduce((acc, e) => acc + e, 0);
  assertEquals(reduce, 6);
});

Deno.test("AsyncIterator.prototype.reduce", async () => {
  const iterator = createAsyncIterator([1, 2, 3]);
  const reduce = await iterator.reduce(
    (acc, e) => acc + e,
    0,
  );
  assertEquals(reduce, 6);
});

Deno.test("Iterator.prototype.toArray", () => {
  const iterator = createIterator([1, 2, 3]);
  const array = iterator.toArray();
  assertEquals(array, [1, 2, 3]);
});

Deno.test("AsyncIterator.prototype.toArray", async () => {
  const iterator = createAsyncIterator([1, 2, 3]);
  const array = await iterator.toArray();
  assertEquals(array, [1, 2, 3]);
});

Deno.test("Iterator.prototype.forEach", () => {
  const iterator = createIterator([2, 2, 2]);
  iterator.forEach((e) => {
    assertEquals(e, 2);
  });
});

Deno.test("AsyncIterator.prototype.forEach", async () => {
  const data = [2, 2, 2];
  const iterator = createAsyncIterator(data);
  await iterator.forEach((e) => {
    assertEquals(e, 2);
  });
});

Deno.test("Iterator.prototype.some", () => {
  const iterator = createIterator([1, 2, 3]);
  const some = iterator.some((e) => e === 2);
  assertEquals(some, true);
});

Deno.test("AsyncIterator.prototype.some", async () => {
  const iterator = createAsyncIterator([1, 2, 3]);
  const some = await iterator.some((e) => e === 2);
  assertEquals(some, true);
});

Deno.test("Iterator.prototype.every", () => {
  const iterator = createIterator([1, 2, 3]);
  const every = iterator.every((e) => e === 2);
  assertEquals(every, false);
});

Deno.test("AsyncIterator.prototype.every", async () => {
  const iterator = createAsyncIterator([1, 2, 3]);
  assertEquals(
    await iterator.every((e) => e === 2),
    false,
  );
});
