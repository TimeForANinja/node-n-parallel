import assert from 'assert';

import MapNParallel from '../dist';

const sleep = (time: number) => new Promise(resolve => setTimeout(resolve, time));

describe('MapNParallel', () => {
  const testElements = new Array(12).fill(0).map((_, idx) => idx);

  it('Executes function with Data In-Order', async() => {
    let counter = 0;

    await MapNParallel(testElements, async(element: number) => {
      assert.strictEqual(element, testElements[counter]);
      counter++;
      await sleep(Math.random() * 50);
    }, 3);
    assert.strictEqual(counter, testElements.length);
  });

  it('It only executes n threads in parallel', async() => {
    let running = 0;
    const threads = 3;

    await MapNParallel(testElements, async() => {
      running++;
      assert.ok(running <= threads);
      await sleep(Math.random() * 50);
      running--;
    }, threads);
  });

  it('Calls map with data, idx and array', async() => {
    let counter = 0;

    await MapNParallel(testElements, async(element, index, array) => {
      assert.equal(element, testElements[counter]);
      assert.equal(index, counter);
      assert.deepStrictEqual(array, testElements);
      counter++;
      await sleep(Math.random() * 50);
    }, 3);
  });

  it('It resolves with the mapped data', async() => {
    const test_response = testElements.map(te => te.toString(16));
    const resp = await MapNParallel(testElements, async(_, idx) => {
      await sleep(Math.random() * 50);
      return test_response[idx];
    }, 3);
    assert.deepStrictEqual(resp, test_response);
  });

  it('It does wait (blocking) for map function', async() => {
    const start = Date.now();
    await MapNParallel([1, 2, 3], async val => {
      await sleep(val * 100);
    }, 1);
    const diff = Date.now() - start;
    assert.ok(diff > 600);
  });

  it('It passes throws from map-function', () => {
    assert.rejects(() => MapNParallel(testElements, async(_, idx) => {
      if (idx === 5) throw new Error('Async Map-Function Failed');
      await sleep(Math.random() * 50);
    }, 3));
  });

  it('Fails when Thread is an invalid number', () => {
    assert.rejects(() => MapNParallel([], n => n, 0));
  });
});

describe('Array.prototype.nmap', () => {
  const testElements = new Array(12).fill(0).map((_, idx) => idx);

  it('Maps values the same way NParallel does', async() => {
    const resp = await testElements.nmap(async(element: number) => {
      await sleep(Math.random() * 50);
      return element + 1;
    }, 3);
    assert.strictEqual(resp[2], 3);
  });
});
