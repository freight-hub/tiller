import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip, Item, Loc} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";

includeHelper();

describe('@embed decorator', () => {
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
})