export interface BalanceValue {
  /** Наименование услуги */
  usage: string;
  /** Количество доступных токенов */
  value: number;
}

export interface Balance {
  /** Список объектов BalanceValue */
  balance: BalanceValue[];
}
