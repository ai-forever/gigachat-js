import { FewShotExample } from './few_shot_example';
import { FunctionParameters } from './function_parameters';

interface Function {
  /** Название функции */
  name: string;

  /** Описание функции */
  description?: string;

  /** Список параметров функции */
  parameters?: FunctionParameters;

  /** Примеры использования (Few-shot) */
  few_shot_examples?: FewShotExample[];

  /** Список возвращаемых параметров функции */
  return_parameters?: { [key: string]: any };
}

export { Function };
