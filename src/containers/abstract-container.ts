import { GenericContainer } from "testcontainers";
import { AbstractStartedContainer as TSAbstractStartedContainer } from "testcontainers/dist/modules/abstract-started-container";

export abstract class AbstractContainer extends GenericContainer {}

export abstract class AbstractStartedContainer extends TSAbstractStartedContainer {
  async log() {
    const stream = await this.logs();
    stream
      .on("data", (chunk) => console.log(chunk))
      .on("error", (err) => console.error(err));
  }
}
