import { PostgresqlContainer } from "./postgresql-container";
import { expect } from "chai";
import { Client, Pool } from "pg";

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
    const client = new Client({
      host: startedContainer.getHost(),
      port: startedContainer.getPort(),
      database: startedContainer.getDatabase(),
      user: startedContainer.getUsername(),
      password: startedContainer.getPassword(),
    });
    await client.connect();

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
    const client = new Client({
      host: startedContainer.getHost(),
      port: startedContainer.getPort(),
      database: startedContainer.getDatabase(),
      user: startedContainer.getUsername(),
      password: startedContainer.getPassword(),
    });
    await client.connect();

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
    await startedContainer.log();

    const client = new Pool({
      host: startedContainer.getHost(),
      port: startedContainer.getPort(),
      database: startedContainer.getDatabase(),
      user: startedContainer.getUsername(),
      password: startedContainer.getPassword(),
    });

    // Assert
    const result = (await client.query("SELECT current_database()")).rows[0];
    expect(result).to.have.property("current_database", database);

    //Cleanup
    await client.end();
    await startedContainer.stop({ removeVolumes: true });
  });
});
