import {
  AbstractContainer,
  AbstractStartedContainer,
} from "../../abstract-container";

export abstract class AbstractDatabaseContainer extends AbstractContainer {}

export abstract class AbstractStartedDatabaseContainer extends AbstractStartedContainer {
  abstract getUsername(): string;

  abstract getPassword(): string;

  abstract getInternalUrl(): string;
}
