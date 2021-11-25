import { StartedPostgresqlContainer } from "../../../containers/sql/databases/postgresql/postgresql-container";
import { Client, Pool } from "pg";

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
