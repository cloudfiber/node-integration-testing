import { PostgresqlContainer } from "../../databases/postgresql/postgresql-container";
import { schemaPath } from "../../../../../fixtures/sql/migration";
import { expect } from "chai";
import { FlywayContainer } from "./flyway-container";
import { TestContainers } from "testcontainers";
import { pgClient } from "../../../../utils/sql/pg";

describe("FlywayContainer", function () {
  it("should migrate to database container", async function () {
    // Arrange
    const startedPostgresContainer = await new PostgresqlContainer().start();
    const migrateSchema = startedPostgresContainer.getDatabase();
    await TestContainers.exposeHostPorts(startedPostgresContainer.getPort());

    const startedFlywayContainer = await new FlywayContainer()
      .withLocation(startedPostgresContainer.getDatabase(), schemaPath)
      .start();

    const client = await pgClient(startedPostgresContainer, migrateSchema);

    // Act
    await startedFlywayContainer.migrate(
      migrateSchema,
      startedPostgresContainer
    );

    // Assert
    const result = await client.query("SELECT * FROM test");
    expect(result.rowCount).equal(1);

    //Cleanup
    await client.end();
    await startedFlywayContainer.stop({ removeVolumes: true });
    await startedPostgresContainer.stop({ removeVolumes: true });
  });

  it("should be able to clean database", async function () {
    // Arrange
    const startedPostgresContainer = await new PostgresqlContainer().start();
    const cleanSchema = startedPostgresContainer.getDatabase();
    await TestContainers.exposeHostPorts(startedPostgresContainer.getPort());

    const startedFlywayContainer = await new FlywayContainer()
      .withLocation(startedPostgresContainer.getDatabase(), schemaPath)
      .start();

    const client = await pgClient(startedPostgresContainer, cleanSchema);

    await startedFlywayContainer.migrate(cleanSchema, startedPostgresContainer);

    // Act
    await startedFlywayContainer.clean(cleanSchema, startedPostgresContainer);

    // Assert
    const result = await client.query(
      "SELECT * FROM pg_catalog.pg_tables WHERE tablename = $1",
      ["test"]
    );
    expect(result.rowCount).equal(0);

    //Cleanup
    await client.end();
    await startedFlywayContainer.stop({ removeVolumes: true });
    await startedPostgresContainer.stop({ removeVolumes: true });
  });
});
