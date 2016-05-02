import {expect} from 'chai'
import {Folder, WeirdCollectionClazz} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";
import {collection, Collection} from "../../src/index";

describe('@collection decorator', () => {
    includeHelper();
    
    it('resolves the correct collection name', async () => {
        let folder = new Folder();
        await folder.save();

        let collections = await DB.db.collections();
        expect(collections[0].namespace).to.eq(DB.db.databaseName+'.folders')
    })

    it('can use a specified collection name instead of the default derived one', async () => {
        await new WeirdCollectionClazz().save();

        let collections = await DB.db.collections();
        expect(collections[0].namespace).to.eq(DB.db.databaseName+'.weird_collection')
    })
})