import {includeHelper} from "./helper";
import {collection} from "../src/decorators/collection";
import {document} from "../src/decorators/document";
import {Collection} from "../src/Collection";
import {Document} from "../src/Document";
import {DB} from "../src/DB";
import {embed} from "../src/decorators/embed";
import {expect} from 'chai'

describe('Document', () => {
    includeHelper();
    
    describe('Transformations', () => {

        @document()
        class Inner {
            a:number
            b:number

            _serialize(doc) {
                return [doc.a, doc.b];
            }

            _deserialize(doc) {
                return {
                    a: doc ? doc[0] : null,
                    b: doc ? doc[1] : null
                }
            }

            constructor(a:number, b:number) {
                this.a = a;
                this.b = b;
            }
        }

        @collection()
        class Outer extends Collection {
            name:string

            @embed(Inner)
            inner:Inner

            constructor(name:string, inner:Inner) {
                super()
                this.name = name;
                this.inner = inner;
            }
        }

        it('can save embedded documents as array', async() => {
            let outer = new Outer('Foo', new Inner(1, 2));
            await outer.save();

            let outer_ = (await (await DB.collection('outers')).find({_id: outer._id}).toArray())[0];
            expect(outer_.name).to.eq('Foo')
            expect(outer_.inner).to.eql([1, 2])

            outer_ = await Outer.get<Outer>(outer._id);
            expect(outer_.inner.a).to.eq(1);
            expect(outer_.inner.b).to.eq(2);
        })
    })
})