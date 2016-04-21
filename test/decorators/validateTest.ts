import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip, Item, Loc, House} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";

describe('@validate decorator', () => {
    includeHelper();

    it('validates required attributes', async () => {
        let house = new House('foo', 'bar');
        expect(await house.isValid()).to.be.true
    })
})