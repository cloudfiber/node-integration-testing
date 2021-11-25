import {
  AbstractContainer,
  AbstractStartedContainer,
} from "../../abstract-container";
import { AbstractStartedDatabaseContainer } from "../databases/abstract-database-container";

export abstract class AbstractMigrationContainer<
  M extends AbstractStartedMigrationContainer
> extends AbstractContainer {
  abstract start(): Promise<M>;

  abstract withLocation(schemaName: string, path: string): this;

  protected init() {
    return super.start();
  }
}

export abstract class AbstractStartedMigrationContainer extends AbstractStartedContainer {
  abstract migrate(
    schemaName: string,
    container: AbstractStartedDatabaseContainer
  ): Promise<void>;

  abstract clean(
    schemaName: string,
    container: AbstractStartedDatabaseContainer
  ): Promise<void>;
}
