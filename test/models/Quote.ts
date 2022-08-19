import {Collection} from "../../src";
import {collection} from "../../src";
import {embed} from "../../src";
import {reference} from "../../src";
import {document} from "../../src";
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