import {
  AbstractMigrationContainer,
  AbstractStartedMigrationContainer,
} from "../abstract-migration-container";
import { GenericContainer, GenericContainerBuilder } from "testcontainers";
import path from "path";
import { log } from "../../../../logger";
import { Connection } from "../../../../utils/sql/query";

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
    log.debug(`Building image ${IMAGE}`);
    await this.containerBuilder.build(IMAGE);
    log.debug(`Starting Flyway Container`);
    return new StartedFlywayContainer(
      await super.init().then((value) => {
        log.debug("Flyway Container started");
        return value;
      })
    );
  }
}

export class StartedFlywayContainer extends AbstractStartedMigrationContainer {
  async migrate(schema: string, connection: Connection) {
    log.debug(`Starting ${schema} migration`);
    await this.exec([
      "/bin/sh",
      "-c",
      `flyway -url="jdbc:${connection.connectionString}" -locations=filesystem:/flyway/sql/${schema} migrate >> console.log 2>&1`,
    ]);
    log.debug(`${schema} migration done`);
  }

  async clean(connection: Connection) {
    log.debug(`Starting cleanup`);
    await this.exec([
      "/bin/sh",
      "-c",
      `flyway -url="jdbc:${connection.connectionString}" clean >> console.log 2>&1`,
    ]);
    log.debug(`Cleanup done`);
  }
}
