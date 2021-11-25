import { PostgresqlContainer } from "../../../containers/sql/databases/postgresql/postgresql-container";
import { pgClient, pgPool } from "./helpers";
import { expect } from "chai";

describe("Node Postgres Helpers", function () {
  it("should create pool", async function () {
    // Arrange
    const postgres = await new PostgresqlContainer().start();

    // Act
    const pool = pgPool(postgres);

    // Assert
    expect(await pool.query("SELECT 1")).to.have.property("rowCount", 1);

    //Cleanup
    await pool.end();
    await postgres.stop({ removeVolumes: true });
  });

  it("should create client", async function () {
    // Arrange
    const postgres = await new PostgresqlContainer().start();

    // Act
    const client = await pgClient(postgres);

    // Assert
    expect(await client.query("SELECT 1")).to.have.property("rowCount", 1);

    //Cleanup
    await client.end();
    await postgres.stop({ removeVolumes: true });
  });
});
