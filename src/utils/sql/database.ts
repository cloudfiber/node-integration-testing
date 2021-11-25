import {
  AbstractDatabaseContainer,
  AbstractStartedDatabaseContainer,
} from "../../containers/sql/databases/abstract-database-container";
import {
  AbstractMigrationContainer,
  AbstractStartedMigrationContainer,
} from "../../containers/sql/migration/abstract-migration-container";
import { TestContainers } from "testcontainers";
import { StopOptions } from "testcontainers/dist/test-container";

type StartedDatabase<D> = D extends AbstractDatabaseContainer<infer DD>
  ? DD
  : never;
type StartedMigration<D> = D extends AbstractMigrationContainer<infer DD>
  ? DD
  : never;

export class Database<
  C extends Record<string, string>,
  D extends AbstractStartedDatabaseContainer,
  M extends AbstractStartedMigrationContainer
> {
  private static Builder = class<C extends Record<string, string>> {
    constructor(readonly configuration: C) {}

    withSchema<S extends string>(database: S, schemaPath: string) {
      return new Database.Builder<C & Record<S, string>>({
        ...this.configuration,
        [database]: schemaPath,
      });
    }

    async build<
      D extends AbstractDatabaseContainer<any>,
      M extends AbstractMigrationContainer<any>
    >(
      databaseContainer: D,
      migrationContainer: M
    ): Promise<Database<C, StartedDatabase<D>, StartedMigration<M>>> {
      const startedDatabaseContainer = await databaseContainer.start();
      await Promise.all(
        Object.keys(this.configuration).map((schema) => {
          migrationContainer.withLocation(schema, this.configuration[schema]);
          return startedDatabaseContainer.createSchema(schema);
        })
      );
      await TestContainers.exposeHostPorts(startedDatabaseContainer.getPort());

      const startedMigrationContainer = await migrationContainer.start();
      await Promise.all(
        Object.keys(this.configuration).map((schema) => {
          return startedMigrationContainer.migrate(
            schema,
            startedDatabaseContainer
          );
        })
      );
      return new Database<
        C,
        Awaited<ReturnType<typeof databaseContainer.start>>,
        Awaited<ReturnType<typeof migrationContainer.start>>
      >(startedDatabaseContainer, startedMigrationContainer);
    }
  };

  private constructor(
    private readonly databaseContainer: D,
    private readonly migrationContainer: M
  ) {}

  static builder() {
    return new Database.Builder({});
  }

  getHost() {
    return this.databaseContainer.getHost();
  }

  getPort() {
    return this.databaseContainer.getPort();
  }

  getUsername() {
    return this.databaseContainer.getUsername();
  }

  getPassword() {
    return this.databaseContainer.getPassword();
  }

  async cleanAndMigrate(database: string) {
    await this.migrationContainer.clean(database, this.databaseContainer);
    await this.migrationContainer.migrate(database, this.databaseContainer);
  }

  async stop(options?: Partial<StopOptions>) {
    await this.migrationContainer.stop(options);
    await this.databaseContainer.stop(options);
  }

  getDatabaseContainer() {
    return this.databaseContainer;
  }
}
