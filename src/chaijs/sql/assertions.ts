import { Assertion, use } from "chai";
import chaiAsPromised from "chai-as-promised";

declare global {
  export namespace Chai {
    interface Assertion {
      table: (name: string) => Assertion;
      where: (args: Record<string, any>) => Assertion;
      result: Assertion;
    }
  }
}

export function postgresPlugin(
  _chai: typeof Chai,
  utils: Chai.ChaiUtils
): void {
  use(chaiAsPromised);

  Assertion.addMethod("table", function (name: string) {
    utils.flag(this, "table", name);
  });

  Assertion.addMethod(
    "where",
    function (this: Chai.AssertionStatic, args: Record<string, any>) {
      utils.flag(this, "where", {
        ...args,
        ...utils.flag(this, "where"),
      });
    }
  );

  Assertion.addProperty("result", function () {
    return queryAssertion(this);
  });

  Assertion.overwriteProperty(
    "exist",
    overwrite((assertion) => assertion.not.lengthOf(0, "Record does not exist"))
  );

  function overwrite(f: (assertion: any, ...args: any[]) => void): any {
    return (base: any) => {
      return function (this: any, ...args: any[]) {
        if (typeof this._obj.query === "function") {
          const newAssertion = queryAssertion(this);
          utils.transferFlags(this, newAssertion, false);
          f(newAssertion, ...args);
          return newAssertion;
        }
        return base.apply(this, args);
      };
    };
  }

  function createQuery(that: any) {
    const conditions = Object.keys(utils.flag(that, "where"))
      .map((value, index) => `${value} = $${index + 1}`)
      .join(" AND ");
    return `SELECT *
                    FROM ${utils.flag(that, "table")}
                    WHERE ${conditions}`;
  }

  function queryAssertion(that: any) {
    const query = createQuery(that);
    const result = that._obj.query(
      query,
      Object.values(utils.flag(that, "where"))
    );
    return new Assertion(result).eventually;
  }
}
