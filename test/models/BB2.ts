import {Collection} from "../../src/Collection";
import {collection} from "../../src/decorators/collection";
import {embed} from "../../src/decorators/embed";
import {AA} from "./AA";

@collection()
export class BB2 extends Collection {

    @embed(require('./AA'), {import: 'AA'})
    aa:AA
}
