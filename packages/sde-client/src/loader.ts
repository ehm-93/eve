import { readFile } from 'node:fs/promises';

import YAML from 'js-yaml';

export interface Loader<T> {
  load(): Promise<T>;
}

export class FileLoader<T> {
  private _load: Promise<T>;

  constructor(
    private readonly path: string
  ) { }

  async load(): Promise<T> {
    if (!this._load) {
      this._load = this.doLoad();
    }

    return this._load;
  }

  private async doLoad(): Promise<T> {
    const buf = await readFile(this.path);
    const str = buf.toString();
    const data = YAML.load(str) as any;
    if (Array.isArray(data)) return Promise.resolve(data as any);
    else if (typeof data === 'object') return Promise.resolve(Object.values(data) as any);
    else throw new Error(`Unsupported dataset type: ${ typeof data }`);
  }
}
