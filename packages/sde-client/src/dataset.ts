import { Indexer, IndexValueExtractor } from './indexer';
import { Loader } from './loader';

export interface Indexed<T> {
  index: number;
  value: T;
}

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
    private readonly indexExtractors: { [ name: string ]: IndexValueExtractor<T>  }
  ) { }

  async init(): Promise<void> {
    this.initialized = false;

    this.dataset = await this.loader.load();
    this._indexes = { };

    await Promise.all(
      Object.entries(this.indexExtractors)
        .map(([name, extractor]) => {
          const idx = Indexer.create(this.dataset, extractor);
          this._indexes[name] = idx;
          return idx.init();
        })
    );

    this.initialized = true;
  }

  get(i: number): Indexed<T> {
    const tmp = this.dataset[i];
    if (!tmp) throw new Error(`Index ${ i } is out of bounds.`);
    return { index: i, value: tmp };
  }

  length(): number {
    if (Array.isArray(this.dataset)) {
      return this.dataset.length;
    } else {
      return Object.entries(this.dataset).length;
    }
  }

  index(index: string): ValueIndexer<Indexed<T>> {
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
