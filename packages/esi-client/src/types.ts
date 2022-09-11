export interface Page<T> {
  items: T[];
  hasNext: boolean;
  next(): Promise<Page<T>>;
}
