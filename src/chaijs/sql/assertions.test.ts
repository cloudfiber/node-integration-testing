import { PostgresqlContainer } from "../../containers/sql/databases/postgresql/postgresql-container";
import { FlywayContainer } from "../../containers/sql/migration/flyway/flyway-container";
import { AssertionError, expect, use } from "chai";
import { postgresPlugin } from "./assertions";
import { schemaPath } from "../../../fixtures/sql/migration";
import { Connection } from "../../utils/sql/query";

use(postgresPlugin);

describe("SQL assertions", function () {
  const schema = "schema";
  let connection: Connection;

  before(async function () {
    const postgres = await new PostgresqlContainer().start();
    const flyway = await new FlywayContainer()
      .withLocation(schema, schemaPath)
      .start();
    connection = await postgres.getConnection();
    await flyway.migrate(schema, connection);
  });

  context("#exist", function () {
    it("should reject when record does not exist", async function () {
      // Arrange
      const check = async () =>
        expect(connection).table("test").where({ id: 0 }).to.exist;

      // Act
      const result = check();

      // Assert
      await expect(result).to.be.rejectedWith(AssertionError);
    });

    it("should pass when more records are matching", async function () {
      // Arrange
      const check = async () =>
        expect(connection).table("test").where({ common: 1 }).to.exist;

      // Act
      const result = check();

      // Assert
      await expect(result).to.be.fulfilled;
    });
  });

  context("#result", function () {
    it("should pass result for verification ", async function () {
      // Arrange
      const check = async () =>
        expect(connection)
          .table("test")
          .where({ id: 1 })
          .result.have.lengthOf(1);

      // Act
      const result = check();

      // Assert
      await expect(result).to.be.fulfilled;
    });
  });
});
