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
    return Promise.resolve(YAML.load(str) as any);
  }
}
