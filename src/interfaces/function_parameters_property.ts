interface FunctionParametersProperty {
  /** Тип аргумента функции */
  type?: string;

  /** Описание аргумента */
  description?: string;

  /** Возможные значения аргумента */
  items?: { [key: string]: any };

  /** Возможные значения enum */
  enum?: string[];

  /** Свойства аргументов (рекурсивное определение) */
  properties?: { [key: string]: FunctionParametersProperty };
}

export { FunctionParametersProperty };
