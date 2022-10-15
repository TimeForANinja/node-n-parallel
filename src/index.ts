type MapFunction<Input, Output> = (
  value: Input,
  index: number,
  array: Input[]
) => Promise<Output>;

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

type PromiseCallback = () => void;

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
