import { GenericContainer } from "testcontainers";
import { AbstractStartedContainer as TSAbstractStartedContainer } from "testcontainers/dist/modules/abstract-started-container";
import { Command, ExecResult } from "testcontainers/dist/docker/types";

export abstract class AbstractContainer extends GenericContainer {}

export abstract class AbstractStartedContainer extends TSAbstractStartedContainer {
  async log() {
    const stream = await this.logs();
    stream
      .on("data", (chunk) => console.log(chunk))
      .on("error", (err) => console.error(err));
  }

  exec(command: Command[]): Promise<ExecResult> {
    return super.exec(command).then((output) => {
      if (output.exitCode !== 0)
        throw new Error(
          `Command execution failed with output: \n${output.output}`
        );
      return output;
    });
  }
}
