import {Collection} from "../../src/Collection";
import {collection} from "../../src/decorators/collection";
import {reference} from "../../src/decorators/reference";
import {AA} from "./AA";

@collection()
export class BB extends Collection {

    @reference(require('./AA'), {import: 'AA'})
    aa:AA
}
