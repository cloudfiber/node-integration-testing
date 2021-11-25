import {
  AbstractDatabaseContainer,
  AbstractStartedDatabaseContainer,
} from "../abstract-database-container";
import { StartedTestContainer, Wait } from "testcontainers";
import { Port } from "testcontainers/dist/port";

const PORT = 5432;

export class PostgresqlContainer extends AbstractDatabaseContainer {
  private database = "postgres";
  private username = "postgres";
  private password = "postgres";

  constructor(image = "postgres:alpine") {
    super(image);
  }

  withUsername(username: string): this {
    this.username = username;
    return this;
  }

  withPassword(password: string): this {
    this.password = password;
    return this;
  }

  withDatabase(database: string): this {
    this.database = database;
    return this;
  }

  async start(): Promise<StartedPostgresqlContainer> {
    this.withEnv("POSTGRES_DB", this.database);
    this.withEnv("POSTGRES_USER", this.username);
    this.withEnv("POSTGRES_PASSWORD", this.password);
    this.withExposedPorts(PORT);
    this.withHealthCheck({
      test: `pg_isready -U ${this.username} -d ${this.database} -h localhost -t 1 --port=5432`,
      interval: 1000,
      retries: 50,
    });
    this.withWaitStrategy(Wait.forHealthCheck());

    return new StartedPostgresqlContainer(
      await super.start(),
      this.database,
      this.username,
      this.password
    );
  }
}

export class StartedPostgresqlContainer extends AbstractStartedDatabaseContainer {
  private readonly port: Port;

  constructor(
    startedTestContainer: StartedTestContainer,
    private readonly database: string,
    private readonly username: string,
    private readonly password: string
  ) {
    super(startedTestContainer);
    this.port = startedTestContainer.getMappedPort(PORT);
  }

  getPort() {
    return this.port;
  }

  getDatabase() {
    return this.database;
  }

  getUsername() {
    return this.username;
  }

  getPassword() {
    return this.password;
  }

  getInternalUrl(): string {
    return `postgresql://host.testcontainers.internal:${this.port}/${this.database}`;
  }
}
