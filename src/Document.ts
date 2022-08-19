import { __documents, populateReference, fromDB } from "./core";
import { isArray } from "./common/array";
import {
  validateDocument,
} from "./decorators/validate";

async function mapObjectHierarchy(
  obj,
  processScalar: (obj: any) => Promise<any>
) {
  if (obj && isArray(obj)) {
    let mapped = [];
    for (let i = 0; i < obj.length; i++) {
      mapped.push(await mapObjectHierarchy(obj[i], processScalar));
    }
    return mapped;
  } else {
    return processScalar(obj);
  }
}

export class Document {
  protected async toDB(saveDeep?: boolean): Promise<Object> {
    var copy: any = {};
    let keys = Object.keys(this);
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      let __document = __documents[(<any>this).constructor.name];

      if (!this[key]) {
        copy[key] = this[key];
        continue;
      }

      // Ignore keys, prefixed with "__"
      if (key.indexOf("__") >= 0) {
        continue;
      }

      // TODO This doesnt support arrays of arrays
      // this[key] holds an object that is a referenced document
      else if (
        !isArray(this[key]) &&
        __document &&
        __document["references"][key]
      ) {
        if (saveDeep && this[key].isNew()) {
          await this[key].save(saveDeep);
        }
        copy[key + "_id"] = this[key]._id;
        this[key + "_id"] = this[key]._id;
      }

      // this[key] is an array, holding referenced documents
      else if (isArray(this[key]) && __document["references"][key]) {
        copy[key + "_id"] = [];
        this[key + "_id"] = [];
        for (var v of this[key]) {
          if (saveDeep && v.isNew()) {
            await v.save(saveDeep);
          }
          copy[key + "_id"].push(v ? v._id : null);
          this[key + "_id"].push(v ? v._id : null);
        }
      }

      // this[key] holds embedded documents
      else if (__document["embeds"][key]) {
        //copy[key] = await Promise.all(this[key].map((v:Document) => v ? v.toDB(saveDeep) : v));
        copy[key] = await mapObjectHierarchy(this[key], async (obj) =>
          obj ? obj.toDB(saveDeep) : obj
        );
      } else {
        copy[key] = this[key];
      }
    }
    return this._serialize(copy);
  }

  public _serialize(obj: any) {
    return obj;
  }

  public _deserialize(doc: any) {
    return doc;
  }

  async validate() {
    return validateDocument(this);
  }

  async isValid(): Promise<boolean> {
    return (await this.validate()).valid();
  }

  async loadReference(property) {
    await populateReference(this, property);
    return this;
  }
}
