import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip, Item, Loc, House} from "../models";
import {includeHelper, cleanDatabase} from '../helper'
import {DB, _DB} from "../../src/DB";

describe('@index decorator', () => {

    beforeEach(async() => {
        await DB.disconnect(true);
        await DB.connect('mongodb://localhost:27017/tiller_test_indexes');
    })

    it('creates a normal index', async() => {
        await new House('test', 'foo2').save();

        let indexes = await DB.db.collection('houses').indexes();
        expect(indexes.filter(i => i.name == 'doors.name_1' && !i.unique).length).to.eq(1)
        expect(indexes.filter(i => i.name == 'name_1' && !i.unique).length).to.eq(1)
        expect(indexes.filter(i => i.name == 'publicId_1' && i.unique).length).to.eq(1)
        expect(indexes.filter(i => i.name == '_id_').length).to.eq(1)
    })

    afterEach(async() => {
        await cleanDatabase();
        await DB.disconnect();
    })
})