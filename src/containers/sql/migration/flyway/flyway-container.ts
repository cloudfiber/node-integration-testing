import { AbstractStartedMigrationContainer } from "../abstract-migration-container";
import { GenericContainer } from "testcontainers";
import { AbstractStartedDatabaseContainer } from "../../databases/abstract-database-container";
import path from "path";

export class FlywayContainer {
  private container: Promise<GenericContainer>;

  constructor(image = "flyway/flyway:latest-alpine") {
    this.container = GenericContainer.fromDockerfile(path.resolve(__dirname))
      .withBuildArg("IMAGE", image)
      .build();
  }

  withLocation(path: string): this {
    this.container = this.container.then((c) =>
      c.withBindMount(path, "/flyway/sql", "ro")
    );
    return this;
  }

  async start(): Promise<StartedFlywayContainer> {
    return new StartedFlywayContainer(await (await this.container).start());
  }
}

export class StartedFlywayContainer extends AbstractStartedMigrationContainer {
  migrate(container: AbstractStartedDatabaseContainer) {
    return this.startedTestContainer.exec([
      "/bin/sh",
      "-c",
      `flyway -url=jdbc:${container.getInternalUrl()} -user=${container.getUsername()} -password=${container.getPassword()} migrate >> console.log 2>&1`,
    ]);
  }
}
