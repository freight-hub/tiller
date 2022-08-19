import {Collection} from "../../src";
import {collection} from "../../src";
import {reference} from "../../src";
import {AA} from "./AA";

@collection()
export class BB extends Collection {

    @reference(require('./AA'), {import: 'AA'})
    aa:AA
}
