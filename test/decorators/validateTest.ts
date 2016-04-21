import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip, Item, Loc, House} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";

describe('@validate decorator', () => {
    includeHelper();

    describe('#isValid', () => {
        it('returns false if a required attribute is missing', async () => {
            let house = new House();
            expect(await house.isValid()).to.be.false
        })

        it('returns true if a required attribute is present', async () => {
            let house = new House('house1');
            expect(await house.isValid()).to.be.true
        })

        it('returns false if an attribute\'s type is wrong', async () => {
            let house = new House();
            (<any>house).name = 1;
            expect(await house.isValid()).to.be.false
        })

        it('returns true if an attribute\'s type is right', async () => {
            let house = new House('foo');
            house.dog = true
            expect(await house.isValid()).to.be.true
        })

        it('returns false if an attribute\'s type is wrong', async () => {
            let house = new House('foo');
            house.dog = null
            expect(await house.isValid()).to.be.false
        })

        it('returns true if an optional attribute is not present', async () => {
            let house = new House('foo');
            expect(await house.isValid()).to.be.true
        })

        it('returns false if an attribute is not withing allowed values', async () => {
            let house = new House('foo');
            expect(await house.isValid()).to.be.true
            house.color = 'green';
            expect(await house.isValid()).to.be.false
        })
    })

    describe('#validate', () => {
        it('returns an error message if a required attribute is missing', async() => {
            let house = new House();
            let validation = await house.validate();
            expect(validation['name']).to.be.exist
        })

        it('returns true if a required attribute is present', async() => {
            let house = new House('house1');
            let validation = await house.validate();
            expect(validation).to.be.eqls({})
        })
    });
})