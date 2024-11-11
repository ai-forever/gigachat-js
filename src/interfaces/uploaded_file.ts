interface UploadedFile {
  /** Идентификатор файла, на который можно ссылаться в API */
  id: string;

  /** Тип объекта */
  object: string;

  /** Размер файла в байтах */
  bytes: number;

  /** Время создания файла в Unix-time формате */
  created_at: number;

  /** Имя файла */
  filename: string;

  /** Предполагаемое назначение файла */
  purpose: string;
}

export { UploadedFile };
