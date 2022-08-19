import {expect} from 'chai'
import {Folder, WeirdCollectionClazz} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src";

describe('@collection decorator', () => {
    includeHelper();
    
    it('resolves the correct collection name', async () => {
        let folder = new Folder();
        await folder.save();

        let collections = await DB.db.collections();
        expect(collections.find(c => c.namespace == (DB.db.databaseName+'.folders'))).to.exist
    })

    it('can use a specified collection name instead of the default derived one', async () => {
        await new WeirdCollectionClazz().save();

        let collections = await DB.db.collections();
        expect(collections.find(c => c.namespace.indexOf('weird_collection') >= 0)).to.exist
    })
})