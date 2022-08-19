import {Collection} from "../../src";
import {collection} from "../../src";
import {reference} from "../../src";
import {BB} from "./BB";

@collection()
export class AA extends Collection {

    @reference(BB, {lazy: true})
    bb:BB

}