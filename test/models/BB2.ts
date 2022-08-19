import {Collection} from "../../src";
import {collection} from "../../src";
import {embed} from "../../src";
import {AA} from "./AA";

@collection()
export class BB2 extends Collection {

    @embed(require('./AA'), {import: 'AA'})
    aa:AA

    @embed([require('./AA')], {import: 'AA'})
    aas:AA[]
}
