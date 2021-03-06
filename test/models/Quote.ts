import {Collection} from "../../src/Collection";
import {collection} from "../../src/decorators/collection";
import {embed} from "../../src/decorators/embed";
import {reference} from "../../src/decorators/reference";
import {document} from "../../src/decorators/document";
import {validate} from "../../src/decorators/validate";
import {Currency} from "./Currency";

@document()
export class LineItem {
    name: string

    @embed(Currency)
    total: Currency
}

@document()
export class Product {
    name: string
    sku: string

    constructor(name: string, sku: string) {
        this.name = name;
        this.sku = sku;
    }
}

@document()
export class Option {
    @reference(Product, {lazy: true})
    product: Product

    @embed([LineItem])
    lineItems: Array<LineItem>
}

@collection()
export class Quote extends Collection {
    @embed([Option])
    options: Array<Option>
}