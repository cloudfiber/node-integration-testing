import { PostgresqlContainer } from "./postgresql-container";
import { expect } from "chai";
import { pgClient } from "../../../../utils/sql/pg";

describe("PostgresqlContainer", function () {
  it("should start database", async function () {
    // Arrange
    const container = new PostgresqlContainer();

    // Act
    const startedContainer = await container.start();

    // Assert
    const check = await startedContainer.exec([
      "psql",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-c",
      "SELECT 1",
    ]);
    expect(check.exitCode).equal(0);

    //Cleanup
    await startedContainer.stop({ removeVolumes: true });
  });

  it("should connect with pg client", async function () {
    // Arrange
    const container = new PostgresqlContainer();

    // Act
    const startedContainer = await container.start();
    const client = await pgClient(startedContainer);

    // Assert
    expect((await client.query("SELECT 1")).rowCount).equal(1);

    //Cleanup
    await client.end();
    await startedContainer.stop({ removeVolumes: true });
  });

  it("should connect with custom username", async function () {
    // Arrange
    const username = "customUsername";
    const container = new PostgresqlContainer().withUsername(username);

    // Act
    const startedContainer = await container.start();
    const client = await pgClient(startedContainer);

    // Assert
    const result = (await client.query("SELECT current_user")).rows[0];
    expect(result).to.have.property("current_user", username);

    //Cleanup
    await client.end();
    await startedContainer.stop({ removeVolumes: true });
  });

  it("should connect with custom database", async function () {
    // Arrange
    const database = "customDatabase";
    const container = new PostgresqlContainer().withDatabase(database);

    // Act
    const startedContainer = await container.start();
    const client = await pgClient(startedContainer);

    // Assert
    const result = (await client.query("SELECT current_database()")).rows[0];
    expect(result).to.have.property("current_database", database);

    //Cleanup
    await client.end();
    await startedContainer.stop({ removeVolumes: true });
  });

  it("should return connection with for default database", async function () {
    // Arrange
    const container = new PostgresqlContainer();

    // Act
    const startedContainer = await container.start();
    const connection = await startedContainer.getConnection();

    // Assert
    const result = await connection.query("SELECT current_database()");
    expect(result[0]).to.have.property(
      "current_database",
      startedContainer.getDatabase()
    );

    //Cleanup
    await connection.close();
    await startedContainer.stop({ removeVolumes: true });
  });

  it("should create new database and return connection to it", async function () {
    // Arrange
    const database = "newDatabase";
    const container = new PostgresqlContainer();

    // Act
    const startedContainer = await container.start();
    const connection = await startedContainer.createDatabase(database);

    // Assert
    const result = await connection.query("SELECT current_database()");
    expect(result[0]).to.have.property("current_database", database);

    //Cleanup
    await connection.close();
    await startedContainer.stop({ removeVolumes: true });
  });
});
