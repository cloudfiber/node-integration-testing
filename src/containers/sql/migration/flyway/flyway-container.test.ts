import { PostgresqlContainer } from "../../databases/postgresql/postgresql-container";
import { schemaPath } from "../../../../../fixtures/sql/migration";
import { expect } from "chai";
import { FlywayContainer } from "./flyway-container";

describe("FlywayContainer", function () {
  it("should migrate to database container", async function () {
    // Arrange
    const startedPostgresContainer = await new PostgresqlContainer().start();
    const connection = await startedPostgresContainer.getConnection();
    const migrateSchema = "schema";

    const startedFlywayContainer = await new FlywayContainer()
      .withLocation(migrateSchema, schemaPath)
      .start();

    // Act
    await startedFlywayContainer.migrate(migrateSchema, connection);

    // Assert
    const result = await connection.query(
      "SELECT * FROM pg_catalog.pg_tables WHERE tablename = $1",
      ["test"]
    );
    expect(result).length(1);

    //Cleanup
    await connection.close();
    await startedFlywayContainer.stop({ removeVolumes: true });
    await startedPostgresContainer.stop({ removeVolumes: true });
  });

  it("should be able to clean database", async function () {
    // Arrange
    const startedPostgresContainer = await new PostgresqlContainer().start();
    const connection = await startedPostgresContainer.getConnection();
    const cleanSchema = "schema";

    const startedFlywayContainer = await new FlywayContainer()
      .withLocation(cleanSchema, schemaPath)
      .start();

    await startedFlywayContainer.migrate(cleanSchema, connection);

    // Act
    await startedFlywayContainer.clean(connection);

    // Assert
    const result = await connection.query(
      "SELECT * FROM pg_catalog.pg_tables WHERE tablename = $1",
      ["test"]
    );
    expect(result).length(0);

    //Cleanup
    await connection.close();
    await startedFlywayContainer.stop({ removeVolumes: true });
    await startedPostgresContainer.stop({ removeVolumes: true });
  });
});
