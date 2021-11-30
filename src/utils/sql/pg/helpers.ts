import { StartedPostgresqlContainer } from "../../../containers/sql/databases/postgresql/postgresql-container";
import { Client, Pool } from "pg";
import { Connection } from "../query";

export function pgPool(
  container: StartedPostgresqlContainer,
  database?: string
) {
  return new Pool({
    host: container.getHost(),
    port: container.getPort(),
    database: database ?? container.getDatabase(),
    user: container.getUsername(),
    password: container.getPassword(),
  });
}

export function pgClient(
  container: StartedPostgresqlContainer,
  database?: string
) {
  const client = new Client({
    host: container.getHost(),
    port: container.getPort(),
    database: database ?? container.getDatabase(),
    user: container.getUsername(),
    password: container.getPassword(),
  });
  return client.connect().then((_) => client);
}

export async function pgConnection(
  container: StartedPostgresqlContainer,
  database?: string
): Promise<Connection> {
  const client = await pgClient(container, database);
  return {
    query: (query, values) =>
      client.query(query, values).then((result) => result.rows),
    close: () => client.end(),
    connectionString: `postgresql://host.testcontainers.internal:${container.getPort()}/${
      database ?? container.getDatabase()
    }?user=${container.getUsername()}&password=${container.getPassword()}`,
  };
}
