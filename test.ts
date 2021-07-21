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

Deno.test("Iterator.map", () => {
  const iterator = createIterator([1, 2, 3]).map((e) => e + 1);
  const array = iterator.toArray();
  assertEquals(array, [2, 3, 4]);
});

Deno.test("AsyncIterator.map", async () => {
  const iterator = createAsyncIterator([1, 2, 3]).map((e) => e + 1);
  const array = await iterator.toArray();
  assertEquals(array, [2, 3, 4]);
});

Deno.test("Iterator.filter", () => {
  const iterator = createIterator([1, 2, 3, 4]).filter((e) => e % 2 === 0);
  const array = iterator.toArray();
  assertEquals(array, [2, 4]);
});

Deno.test("AsyncIterator.filter", async () => {
  const iterator = createAsyncIterator([1, 2, 3, 4]).filter((e) => e % 2 === 0);
  const array = await iterator.toArray();
  assertEquals(array, [2, 4]);
});

Deno.test("Iterator.take", () => {
  const iterator = createIterator([1, 2, 3]).take(2);
  const array = iterator.toArray();
  assertEquals(array, [1, 2]);
});

Deno.test("AsyncIterator.take", async () => {
  const iterator = createAsyncIterator([1, 2, 3]).take(2);
  const array = await iterator.toArray();
  assertEquals(array, [1, 2]);
});

Deno.test("Iterator.drop", () => {
  const iterator = createIterator([1, 2, 3]).drop(2);
  const array = iterator.toArray();
  assertEquals(array, [3]);
});

Deno.test("AsyncIterator.drop", async () => {
  const iterator = createAsyncIterator([1, 2, 3]).drop(2);
  const array = await iterator.toArray();
  assertEquals(array, [3]);
});

Deno.test("Iterator.flatMap", () => {
  const iterator = createIterator([1, 2, 3]).flatMap((e) => [e, e + 1]);
  const array = iterator.toArray();
  assertEquals(array, [1, 2, 2, 3, 3, 4]);
});

Deno.test("AsyncIterator.flatMap", async () => {
  const iterator = createAsyncIterator([1, 2, 3]).flatMap((e) => [e, e + 1]);
  const array = await iterator.toArray();
  assertEquals(array, [1, 2, 2, 3, 3, 4]);
});

Deno.test("Iterator.reduce", () => {
  const iterator = createIterator([1, 2, 3]).reduce((acc, e) => acc + e, 0);
  assertEquals(iterator, 6);
});

Deno.test("AsyncIterator.reduce", async () => {
  const iterator = await createAsyncIterator([1, 2, 3]).reduce(
    (acc, e) => acc + e,
    0,
  );
  assertEquals(iterator, 6);
});

Deno.test("Iterator.toArray", () => {
  const iterator = createIterator([1, 2, 3]);
  const array = iterator.toArray();
  assertEquals(array, [1, 2, 3]);
});

Deno.test("AsyncIterator.toArray", async () => {
  const iterator = createAsyncIterator([1, 2, 3]);
  const array = await iterator.toArray();
  assertEquals(array, [1, 2, 3]);
});

Deno.test("Iterator.forEach", () => {
  createIterator([2, 2, 2]).forEach((e) => {
    assertEquals(e, 2);
  });
});

Deno.test("AsyncIterator.forEach", async () => {
  await new Promise<void>(async (resolve) => {
    const data = [2, 2, 2];
    const iterator = createAsyncIterator(data);
    let i = 0;
    await iterator.forEach((e) => {
      assertEquals(e, 2);
      i++;
      if (i === data.length) {
        resolve();
      }
    });
  });
});

Deno.test("Iterator.some", () => {
  const iterator = createIterator([1, 2, 3]);
  const some = iterator.some((e) => e === 2);
  assertEquals(some, true);
});

Deno.test("AsyncIterator.some", async () => {
  assertEquals(await createAsyncIterator([1, 2, 3]).some((e) => e === 2), true);
});

Deno.test("Iterator.every", () => {
  assertEquals(createIterator([1, 2, 3]).every((e) => e === 2), false);
});

Deno.test("AsyncIterator.every", async () => {
  assertEquals(
    await createAsyncIterator([1, 2, 3]).every((e) => e === 2),
    false,
  );
});
