import {document} from "../../src";

@document()
export class Currency {
    value: number
    code: string

    constructor(value: number, code: string) {
        this.value = value;
        this.code = code;
    }
}

export function EUR(value) {
    return new Currency(value, 'EUR')
}