import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip, Item, Loc} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";

includeHelper();

describe('@ordered decorator', () => {
    it('can return a referenced collection in order', async () => {
        let folder = new Folder('root');
        folder.files = [
            new File('c'),
            new File('a'),
            new File('b'),
        ]
        await folder.save();

        folder = await Folder.get<Folder>(folder._id);
        expect(folder.files.map(f => f.name)).to.eqls(['a', 'b', 'c'])
    })
})