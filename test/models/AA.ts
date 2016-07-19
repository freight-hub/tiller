import {Collection} from "../../src/Collection";
import {collection} from "../../src/decorators/collection";
import {reference} from "../../src/decorators/reference";
import {BB} from "./BB";

@collection()
export class AA extends Collection {

    @reference(BB, {lazy: true})
    bb:BB

}