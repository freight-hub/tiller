import { setupDocument, __documents } from "../core";
import * as _ from "lodash";

export interface FieldOrder {
  [field: string]: "asc" | "desc";
}

export function ordered(
  fields: Array<string>,
  order?: Array<"asc" | "desc">
): any {
  return function (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    if (order && fields.length != order.length) {
      throw new Error(
        "If order of fields in @ordered is given, the order of all fields must be specified."
      );
    }

    setupDocument(target.constructor);

    __documents[target.constructor.name]["ordered"][propertyKey] = {
      fields: fields,
      order: order,
    };
  };
}

export function orderArray(array, order: Array<FieldOrder>) {
  return _.orderBy(
    array,
    order.map((o) => Object.keys(o)[0]),
    order.map((o) => o[Object.keys(o)[0]])
  );
}
