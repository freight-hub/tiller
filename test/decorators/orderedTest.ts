import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip, Item, Loc} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";
import * as _ from 'lodash';

describe('@ordered decorator', () => {
    includeHelper();
    
    it('can return a referenced collection in order', async () => {
        let folder = new Folder('root');
        folder.files = [
            new File('c'),
            new File('a'),
            new File('b'),
        ]
        await folder.save(true);

        folder = await Folder.get<Folder>(folder._id);
        expect(folder.files.map(f => f.name)).to.eqls(['a', 'b', 'c'])
    })
})

describe('_.orderBy', () => {
    let array = [{
        foo: 1,
        inner: {
            foo: 10
        }
    },{
        foo: 2,
        inner: {
            foo: 30
        }
    },{
        foo: -2,
        inner: {
            foo: 20
        }
    }]

    it('sorts by 1st level properties', async () => {
        let ordered = _.orderBy(array, ['foo'], ['asc'])
        expect(ordered.map(o => o.foo)).to.eqls([-2,1,2]);
    })

    it('sorts by nested properties', async () => {
        let ordered = _.orderBy(array, ['inner.foo'], ['asc'])
        expect(ordered.map(o => o.foo)).to.eqls([1,-2,2]);
        expect(ordered.map(o => o.inner.foo)).to.eqls([10,20,30]);
    })
})