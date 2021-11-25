import { PostgresqlContainer } from "../../databases/postgresql/postgresql-container";
import { schemaPath } from "../../../../../fixtures/sql/migration";
import { Client } from "pg";
import { expect } from "chai";
import { FlywayContainer } from "./flyway-container";
import { TestContainers } from "testcontainers";

describe("FlywayContainer", function () {
  it("should migrate to database container", async function () {
    // Arrange
    const startedPostgresContainer = await new PostgresqlContainer().start();
    await TestContainers.exposeHostPorts(startedPostgresContainer.getPort());

    const startedFlywayContainer = await new FlywayContainer()
      .withLocation(schemaPath)
      .start();

    const client = new Client({
      host: startedPostgresContainer.getHost(),
      port: startedPostgresContainer.getPort(),
      database: startedPostgresContainer.getDatabase(),
      user: startedPostgresContainer.getUsername(),
      password: startedPostgresContainer.getPassword(),
    });
    await client.connect();

    // Act
    await startedFlywayContainer.migrate(startedPostgresContainer);

    // Assert
    const result = await client.query("SELECT * FROM test");
    expect(result.rowCount).equal(1);

    //Cleanup
    await client.end();
    await startedFlywayContainer.stop({ removeVolumes: true });
    await startedPostgresContainer.stop({ removeVolumes: true });
  });
});
