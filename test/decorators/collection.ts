import {expect} from 'chai'
import {Folder} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";
import {collection, Collection} from "../../src/index";

includeHelper();

describe('@collection decorator', () => {
    it('resolves the correct collection name', async () => {
        let folder = new Folder();
        await folder.save();

        let collections = await DB.db.collections();
        expect(collections[0].namespace).to.eq('tiller_test.folders')
    })

    it('can use a specified collection name instead of the default derived one', async () => {
        @collection('weird_collection')
        class WeirdCollectionClazz extends Collection {

        }

        await new WeirdCollectionClazz().save();

        let collections = await DB.db.collections();
        expect(collections[0].namespace).to.eq('tiller_test.weird_collection')
    })
})