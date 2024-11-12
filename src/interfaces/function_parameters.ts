import { FunctionParametersProperty } from './function_parameters_property';

interface FunctionParameters {
  /** Тип параметров функции */
  type?: string;

  /** Описание функции */
  properties?: { [key: string]: FunctionParametersProperty };

  /** Список обязательных параметров */
  required?: string[];
}

export type { FunctionParameters };
