import { Choices } from './choices';
import { Usage } from './usage';

interface ChatCompletion {
  /** Массив ответов модели */
  choices: Choices[];

  /** Дата и время создания ответа в формате Unix time */
  created: number;

  /** Название модели, которая вернула ответ */
  model: string;

  /** Данные об использовании модели */
  usage: Usage;

  /** Название вызываемого метода */
  object: string;
}

export { ChatCompletion };
