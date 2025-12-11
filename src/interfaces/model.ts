interface Model {
  /** Название модели */
  id: string;

  /** Тип сущности в ответе, например, модель */
  object: string;

  /** Владелец модели */
  owned_by: string;

  /** Тип модели */
  type: 'chat' | 'aicheck' | 'embedder';
}

export type { Model };
