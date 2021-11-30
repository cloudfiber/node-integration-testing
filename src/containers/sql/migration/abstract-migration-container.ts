import {
  AbstractContainer,
  AbstractStartedContainer,
} from "../../abstract-container";
import { Connection } from "../../../utils/sql/query";

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
  abstract migrate(schemaName: string, connection: Connection): Promise<void>;

  abstract clean(connection: Connection): Promise<void>;
}
