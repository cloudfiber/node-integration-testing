import { schemaPath } from "../../../fixtures/sql/migration";
import { expect } from "chai";
import { PostgresqlContainer } from "../../containers/sql/databases/postgresql/postgresql-container";
import { FlywayContainer } from "../../containers/sql/migration/flyway/flyway-container";
import { Database } from "./database";
import { pgClient } from "./pg";

describe("Database", function () {
  it("should spin up and migrate database", async function () {
    // Arrange
    const databaseName = "spinUpTestDatabase";
    const postgresContainer = new PostgresqlContainer();
    const flywayContainer = new FlywayContainer();
    const databaseBuilder = Database.builder().withSchema(
      databaseName,
      schemaPath
    );

    // Act
    const database = await databaseBuilder.build(
      postgresContainer,
      flywayContainer
    );
    const client = await pgClient(
      database.getDatabaseContainer(),
      databaseName
    );

    // Assert
    const result = await client.query("SELECT * FROM test");
    expect(result.rowCount).equal(1);

    //Cleanup
    await client.end();
    await database.stop({ removeVolumes: true });
  });

  it("should be possible to clean and migrate schema", async function () {
    // Arrange
    const databaseName = "cleanAndMigrateDatabase";
    const postgresContainer = new PostgresqlContainer();
    const flywayContainer = new FlywayContainer();
    const databaseBuilder = Database.builder().withSchema(
      databaseName,
      schemaPath
    );
    const database = await databaseBuilder.build(
      postgresContainer,
      flywayContainer
    );
    const client = await pgClient(
      database.getDatabaseContainer(),
      databaseName
    );

    await client.query("INSERT INTO test VALUES (2)");

    // Act
    await database.cleanAndMigrate(databaseName);

    // Assert
    const result = await client.query("SELECT * FROM test");
    expect(result.rowCount).equal(1);

    //Cleanup
    await client.end();
    await database.stop({ removeVolumes: true });
  });
});
