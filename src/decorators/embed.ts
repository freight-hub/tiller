import { setupDocument, __documents, unwindType } from "../core";
import { ReferenceType, ReferenceOptions } from "./reference";
import { isArray } from "util";
let assert = require("assert");

export function embed(type: ReferenceType, options?: EmbedOptions): any {
  options = options || {};

  if (!type) {
    let stack = new Error().stack
      .split("\n")
      .filter((l) => !!l.match(/\.ts/))
      .map((l) => l.match(/[^\/]+\.ts:[0-9]+:[0-9]+/)[0]);
    throw new Error(
      "type is undefined (transitive cyclic import in " +
        stack.join(" -> ") +
        ", consider using import option)"
    );
  }

  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    if (!unwindType(type)) {
      throw new Error(
        "Type of @embeds decorator at " +
          target.constructor.name +
          ":" +
          propertyKey +
          " is undefined"
      );
    }

    setupDocument(target.constructor);
    assert(__documents[target.constructor.name]);

    __documents[target.constructor.name]["embeds"][propertyKey] = function () {
      let { type: unwoundType, i } = unwind(type);
      if (options.import) {
        unwoundType = unwoundType[options.import];
        if (!unwoundType) {
          throw new Error("embedded type could not be resolved");
        }
      }

      return wind(unwoundType, i);
    };
  };
}

function unwind(type: any, i: number = 0): { type: any; i: number } {
  return isArray(type) ? unwind(type[0], i + 1) : { type, i };
}

function wind(type: any, i: number = 0) {
  for (let j = 0; j < i; j++) {
    type = [type];
  }
  return type;
}

export interface EmbedOptions {
  import?: string;
}
