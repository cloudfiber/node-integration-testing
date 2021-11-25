import {
  AbstractMigrationContainer,
  AbstractStartedMigrationContainer,
} from "../abstract-migration-container";
import { AbstractStartedDatabaseContainer } from "../../databases/abstract-database-container";
import { GenericContainer, GenericContainerBuilder } from "testcontainers";
import path from "path";

const IMAGE = "node-integration-testing/flyway:latest";

export class FlywayContainer extends AbstractMigrationContainer<StartedFlywayContainer> {
  private readonly containerBuilder: GenericContainerBuilder;

  constructor(image = "flyway/flyway:latest-alpine") {
    super(IMAGE);

    this.containerBuilder = GenericContainer.fromDockerfile(
      path.resolve(__dirname)
    ).withBuildArg("IMAGE", image);
  }

  withLocation(schemaName: string, path: string): this {
    this.withBindMount(path, `/flyway/sql/${schemaName}`, "ro");
    return this;
  }

  async start(): Promise<StartedFlywayContainer> {
    await this.containerBuilder.build(IMAGE);
    return new StartedFlywayContainer(await super.init());
  }
}

export class StartedFlywayContainer extends AbstractStartedMigrationContainer {
  async migrate(schema: string, container: AbstractStartedDatabaseContainer) {
    await this.startedTestContainer.exec([
      "/bin/sh",
      "-c",
      `flyway -url=jdbc:${container.getInternalUrl(
        schema
      )} -user=${container.getUsername()} -password=${container.getPassword()} -locations=filesystem:/flyway/sql/${schema} migrate >> console.log 2>&1`,
    ]);
  }

  async clean(schema: string, container: AbstractStartedDatabaseContainer) {
    await this.startedTestContainer.exec([
      "/bin/sh",
      "-c",
      `flyway -url=jdbc:${container.getInternalUrl(
        schema
      )} -user=${container.getUsername()} -password=${container.getPassword()} clean >> console.log 2>&1`,
    ]);
  }
}
