import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, Item, Loc, A4, B} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src";
import {embed} from "../../src";
import {AA} from "../models/AA";
import {BB2} from "../models/BB2";

describe('@embed decorator', () => {
    includeHelper();

    it('saves embedded documents', () => {
        let bob = new User('bob');
        let alice = new User('alice');
        let root = new Folder('Applications', bob);
        let rootBackup1 = new File('Applications Backup 1', alice)
        let rootBackup2 = new File('Applications Backup 2', bob)
        root.backups = new Backups(rootBackup1, rootBackup2);
    })

    it('saves a document with an array of embedded documents', async () => {
        let bundle = new Bundle(1, [new Item('Apple'), new Item('Banana')]);
        await bundle.save();

        let bundle_ = (await (await DB.collection('bundles')).find({_id: bundle._id}).toArray())[0];
        expect(bundle_.id).to.eq(1)
        expect(bundle_.items).to.eqls([{name: 'Apple'}, {name: 'Banana'}])
    })

    it('saves a document with an array of an array of embedded documents', async () => {
        let a = new A4();
        a.bs = [[new B('hello')]]
        await a.save();

        let aObj = (await (await DB.collection('A4')).find({_id: a._id}).toArray())[0];
        expect(aObj.bs).to.eqls([[{name: 'hello'}]])
    })

    it('saves a document with an array of embedded documents, some being null', async () => {
        let bundle = new Bundle(1, [new Item('Apple'), new Item('Banana'), null]);
        await bundle.save();

        let bundle_ = (await (await DB.collection('bundles')).find({_id: bundle._id}).toArray())[0];
        expect(bundle_.id).to.eq(1)
        expect(bundle_.items).to.eqls([{name: 'Apple'}, {name: 'Banana'}, null])
    })

    it('saves a document with an array of an array of embedded documents, some being null', async () => {
        let a = new A4();
        a.bs = [[new B('b1'), new B('b2')], null, [new B('b3'), null]];
        await a.save();

        let aObj = (await (await DB.collection('A4')).find({_id: a._id}).toArray())[0];
        expect(aObj.bs).to.eqls([[{name: 'b1'}, {name: 'b2'}], null, [{name: 'b3'}, null]])
    })

    it('saves a document with an array of embedded document set to null', async () => {
        let bundle = new Bundle(1, null);
        await bundle.save();

        let bundle_ = (await (await DB.collection('bundles')).find({_id: bundle._id}).toArray())[0];
        expect(bundle_.id).to.eq(1)
        expect(bundle_.items).to.eq(null)
    })

    it('saves a document with an array of embedded documents, which use a custom serializer', async () => {
        let bundle = new Bundle(1, null, [new Loc(1,2), new Loc(3,4)]);
        await bundle.save();

        let bundle_ = (await (await DB.collection('bundles')).find({_id: bundle._id}).toArray())[0];
        expect(bundle_.id).to.eq(1)
        expect(bundle_.items).to.eq(null)
        expect(bundle_.locations).to.eqls([{type: 'Point', coordinates: [1,2]}, {type: 'Point', coordinates: [3,4]}])
    })

    it('throws an error if the embedded type is undefined', async () => {
        // Manually call the decorator
        try {
            embed([undefined])(Bundle, 'someUndefinedEmbeds', null)
            expect.fail()
        } catch(e) {
            expect(e.message).to.eq('Type of @embeds decorator at Function:someUndefinedEmbeds is undefined')
        }
    })

    it('can handle transitive cyclic imports', async () => {
        let b = new BB2();
        b.aa = new AA()
        b.aas = [new AA(), new AA()]
        await b.save()

        b = await BB2.get(b._id)
        expect(b.aa).to.be.instanceof(AA)
        expect(b.aas[0]).to.be.instanceof(AA)
        expect(b.aas[1]).to.be.instanceof(AA)
    })
})