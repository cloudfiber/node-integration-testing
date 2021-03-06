import {
  AbstractContainer,
  AbstractStartedContainer,
} from "../../abstract-container";
import { Port } from "testcontainers/dist/port";
import { Connection } from "../../../utils/sql/query";

export abstract class AbstractDatabaseContainer<
  C extends AbstractStartedContainer
> extends AbstractContainer {
  abstract start(): Promise<C>;

  protected init() {
    return super.start();
  }
}

export abstract class AbstractStartedDatabaseContainer extends AbstractStartedContainer {
  abstract getUsername(): string;

  abstract getPassword(): string;

  abstract getDatabase(): string;

  abstract getInternalUrl(database: string): string;

  abstract getPort(): Port;

  abstract createDatabase(database: string): Promise<Connection>;

  abstract getConnection(): Promise<Connection>;
}
