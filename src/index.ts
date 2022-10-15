/**
 * Function used to map a single input value to an output value
 */
type MapFunction<Input, Output> = (
  value: Input,
  index: number,
  array: Input[]
) => Promise<Output>;

/**
 * Map an array using a function utilising multiple parallel workers
 *
 * @param {Input[]} data The Input Data to transform
 * @param {Function} mapFunc The function to transform a single element
 * @param {number} threads The count of workers to use
 * @returns {Output[]} a Promise resolving to the array of mapped objects
 */
const mapNParallel = <Input, Output>(
  data: Input[],
  mapFunc: MapFunction<Input, Output>,
  threads: number,
): Promise<Output[]> => {
  if (threads < 1) {
    throw new RangeError('Expected at least 1 thread when calling MapNParallel');
  }
  const mutex = new Mutex(threads);

  const workQ = data.map(async(dataChunk: Input, idx: number, arr: Input[]) => {
    await mutex.block();
    const res = await mapFunc.call({}, dataChunk, idx, arr);
    mutex.free();
    return res;
  });

  return Promise.all(workQ);
};

/**
 * The Data-Type storing the resolve callback inside the Mutex
 */
type PromiseCallback = () => void;

/**
 * Utility class to manage n-resources and
 * allow async/await blocking until a resource is free.
 */
class Mutex {
  private max: number;
  private current: number;
  private q: PromiseCallback[];

  constructor(max: number) {
    this.max = max;
    this.current = 0;
    this.q = [];
  }

  block(): Promise<void> {
    if (this.current < this.max) {
      this.current++;
      return Promise.resolve();
    }
    const p = new Promise<void>(res => this.q.push(res));
    return p;
  }

  free() {
    this.current--;
    const head = this.q.shift();
    head?.();
  }
}

export default mapNParallel;

/**
 * Expand the Global Array-Type by an nmap function
 */
declare global {
  interface Array<T> {
    nmap<J>(mapFunc: MapFunction<T, J>, threads: number): Promise<Array<J>>;
  }
}

/**
 * Map an array using a function utilising multiple parallel workers
 *
 * @param {Input[]} this The Input Data to transform
 * @param {Function} mapFunc The function to transform a single element
 * @param {number} threads The count of workers to use
 * @returns {Output[]} a Promise resolving to the array of mapped objects
 */
Array.prototype.nmap = function nmap<Output>(
  this: any[],
  mapFunc: MapFunction<any, Output>,
  threads: number,
): Promise<Output[]> {
  return mapNParallel(this, mapFunc, threads);
};
