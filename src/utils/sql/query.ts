export type QueryResult = any[];

export type Query = (query: string, values?: any[]) => Promise<QueryResult>;

export type Connection = {
  query: Query;
  close: () => Promise<void>;
  connectionString: string;
};
