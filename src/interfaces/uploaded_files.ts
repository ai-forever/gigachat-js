import { UploadedFile } from './uploaded_file';

interface UploadedFiles {
  /** Идентификатор файла, на который можно ссылаться в API */
  data: UploadedFile[];
}

export type { UploadedFiles };
