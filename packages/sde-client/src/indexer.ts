import pointer from 'jsonpointer';

const NULL = 'null_ece1b6bf-b23b-4612-bd75-171ce31f4842';
const UNDEFINED = 'undefined_b04b5411-fc8b-40bc-adfc-781ece03819b';

export namespace Indexer {
  export function create(dataset: { [ key: number ]: unknown }, indexOn: string): Indexer {
    return new ReadonlyInMemoryIndexer(dataset, indexOn);
  }
}

export interface Indexer {
  init(): Promise<void>;
  find(value: unknown): Promise<number[]>;
  findOne(value: unknown): Promise<number>;
}

/**
 * The `ReadonlyInMemoryIndexer` will create index-like views of a dataset which
 * let you query the dataset by attribute values efficiently.
 *
 * Indexers must be initialized after construction. Indexers may be
 * reinitialized to reset them but this is relatively expensive.
 *
 * VERY IMPORTANT: the dataset used in an indexer and all of its elements
 * _MUST_ be read-only or this will fall apart very quickly. If you need to
 * modify the underlying dataset or its elements your only recourse with this
 * class is to rebuild the entire index.
 *
 * Example:
 * ```typescript
 * const dataset = [{
 *   id: 'abc',
 *   name: 'Bill',
 * }, {
 *   id: 'bcd',
 *   name: 'Suzy',
 * }, {
 *   id: 'cde',
 *   name: 'Bill',
 * }]
 *
 * const byId = new Indexer(dataset, '/id');
 * byId.init();
 *
 * const byName = new Indexer(dataset, '/name');
 * byName.init();
 *
 * byId.findOne('abc');    // returns the first Bill
 *
 * byName.find('Bill');    // returns both Bills
 *
 * byName.findOne('Bill'); // fails with an exception,
 *                         // there is not exactly 1 Bill
 * ```
 */
export class ReadonlyInMemoryIndexer implements Indexer {
  private indexes: { [ key: string ]: number[] } = { };

  constructor(
    private readonly dataset: { [ key: number ]: unknown },
    private readonly indexOn: string,
  ) { }

  init(): Promise<void> {
    this.indexes = {};

    if (Array.isArray(this.dataset)) {
      this.initArray(this.dataset);
    } else {
      this.initObject(this.dataset);
    }

    return Promise.resolve();
  }

  find(value: unknown): Promise<number[]> {
    return Promise.resolve([...(this.indexes[this.encodeValue(value)] ?? [])]);
  }

  async findOne(value: unknown): Promise<number> {
    const result = await this.find(value);
    if (result.length !== 1) {
      return Promise.reject(new Error(`Found ${ result.length } elements when exactly 1 was expected.`));
    }
    // It can't be null here
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Promise.resolve(result[0]!);
  }

  private initArray(dataset: unknown[]): void {
    dataset.forEach((el, i) => {
      const value = this.encodeValue(pointer.get(el as any, this.indexOn));
      if (!this.indexes[value]) {
        this.indexes[value] = [];
      }
      // Cannot be null
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.indexes[value]!.push(i);
    });
  }

  private initObject(dataset: { [ key: number ]: unknown }): void {
    Object.entries(dataset).forEach(([i, el]) => this.appendToIndex(el, Number(i)));
  }

  private appendToIndex(el: unknown, i: number): void {
    const value = this.encodeValue(pointer.get(el as any, this.indexOn));
    if (!this.indexes[value]) {
      this.indexes[value] = [];
    }
    // Cannot be null
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.indexes[value]!.push(i);
  }

  private encodeValue(value: unknown): string {
    // dangerous to use a null string value but it should be fine
    // here since the datasets this may be used on are pretty limited
    // (famous last words?)
    if (value === null) {
      return NULL;
    } else if (value === undefined) {
      return UNDEFINED;
    } else if (Array.isArray(value) || typeof value === 'object') {
      throw new Error(`Found object or array while indexing by '${ String(this.indexOn) }'. Indexes can only be created on primitive types.`);
    } else {
      return value.toString();
    }
  }
}
