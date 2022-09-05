import { Dataset } from '../../dataset';
import { FileLoader } from '../../loader';

export interface I18n {
  de: string;
  en: string;
  fr: string;
  ja: string;
  ru: string;
  zh: string;
}

export interface Type {
  basePrice: number;
  capacity: number;
  description: I18n;
  factionID: number;
  graphicID: number;
  groupID: number;
  mass: number;
  name: I18n;
  portionSize: number;
  published: boolean;
  raceID: number;
  radius: number;
  sofFactionName: string;
  soundID: number;
  volume: number;
}

export interface TypeApiOptions {
  path: string;
}

export class TypeApi {
  private readonly dataset: Dataset<Type>;
  private init: Promise<void>;

  constructor(
    options: TypeApiOptions,
  ) {
    this.dataset = new Dataset(
      new FileLoader(options.path),
      [ 'groupID' ],
    );
  }

  async findById(id: number): Promise<Type> {
    await this.checkInit();

    return this.dataset.get(id);
  }

  async findByGroupId(groupId: number): Promise<Type[]> {
    await this.checkInit();

    return this.dataset.index('groupID').find(groupId);
  }

  private checkInit(): Promise<void> {
    if (!this.init) {
      this.init = this.dataset.init();
    }
    return this.init;
  }
}
