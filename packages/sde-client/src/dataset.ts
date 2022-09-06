import { Indexer } from './indexer';
import { Loader } from './loader';

export interface ValueIndexer<T> {
  find(value: unknown): Promise<T[]>,
  findOne(value: unknown): Promise<T>,
}

export class Dataset<T> {
  private initialized = false;

  private dataset: { [ key: number ]: T } = [];
  private _indexes: { [ key: string ]: Indexer } = {};

  constructor(
    private readonly loader: Loader<{ [ key: number ]: T }>,
    private readonly indexOn: string[],
  ) { }

  async init(): Promise<void> {
    this.initialized = false;

    this.dataset = await this.loader.load();
    this._indexes = {};

    await Promise.all(
      this.indexOn.flatMap(index => {
        this._indexes[String(index)] = Indexer.create(this.dataset, index);
        return Object.values(this._indexes).map(i => i.init());
      })
    );

    this.initialized = true;
  }

  get(i: number): T {
    const tmp = this.dataset[i];
    if (!tmp) throw new Error(`Index ${ i } is out of bounds.`);
    return tmp;
  }

  length(): number {
    if (Array.isArray(this.dataset)) {
      return this.dataset.length;
    } else {
      return Object.entries(this.dataset).length;
    }
  }

  index(index: string): ValueIndexer<T> {
    this.checkInitialized();

    const tmp = this._indexes[String(index)];
    if (!tmp) throw new Error(`No such index ${ String(index) }`);
    return {
      find: async (value: unknown) =>
        Promise.all((await tmp.find(value)).map(it => this.get(it))),
      findOne: async (value: unknown) => 
        this.get(await tmp.findOne(value)),
    };
  }

  indexes(): string[] {
    return Object.keys(this._indexes);
  }

  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('Dataset not yet initialized or is still initializing.');
    }
  }
}
