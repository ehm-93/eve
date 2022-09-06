import { Dataset } from '../../dataset';
import { FileLoader } from '../../loader';
import { I18n } from '../../types';

export interface Type {
  basePrice?: number;
  capacity?: number;
  description?: I18n;
  factionID?: number;
  graphicID?: number;
  groupID: number;
  iconID?: number;
  id: number;
  mass: number;
  marketGroupID?: number;
  masteries?: { [ key: number ]: number[] }
  name: I18n;
  portionSize: number;
  published: boolean;
  raceID?: number;
  radius?: number;
  sofFactionName?: string;
  soundID?: number;
  traits?: { types: { [ key: number ]: TraitType[] } };
  volume?: number;
}

export interface TraitType {
  bonus: number;
  bonusText: I18n;
  importance: number;
  unitId: number;
}

export interface TypeApiOptions {
  path: string;
}

export class TypeApi {
  private readonly dataset: Dataset<Omit<Type, 'id'>>;
  private init: Promise<void>;

  constructor(
    options: TypeApiOptions,
  ) {
    this.dataset = new Dataset(
      new FileLoader(options.path),
      [
        '/groupID',
        '/name/de',
        '/name/en',
        '/name/fr',
        '/name/ja',
        '/name/ru',
        '/name/zh',
      ],
    );
  }

  async findById(id: number): Promise<Type> {
    await this.checkInit();

    const tmp = this.dataset.get(id);
    return { id: tmp.index, ...tmp.value };
  }

  async findByGroupId(groupId: number): Promise<Type[]> {
    await this.checkInit();

    return (await this.dataset.index('/groupID').find(groupId))
      .map(it => ({ id: it.index, ...it.value }));
  }

  async findByName(lang: keyof I18n, value: string): Promise<Type[]> {
    await this.checkInit();

    return (await this.dataset.index(`/name/${ lang }`).find(value))
      .map(it => ({ id: it.index, ...it.value }));
  }

  private checkInit(): Promise<void> {
    if (!this.init) {
      this.init = this.dataset.init();
    }
    return this.init;
  }
}
