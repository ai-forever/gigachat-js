import { Model } from './model';

interface Models {
  /** Массив объектов с данными доступных моделей */
  data: Model[];

  /** Тип сущности в ответе, например, список */
  object: string;
}

export { Models };
