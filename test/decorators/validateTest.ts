import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip, Item, Loc, House, Door, A, B} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";
import {ValidationResult} from "../../src/decorators/validate";
import {Document} from "../../src/Document";

describe('@validate decorator', () => {
    includeHelper();

    // TODO Should test required: true for array
    // TODO Should test for null objects in array -> validation should not fail

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

        it('returns false if an embedded document is invalid', async () => {
            let house = new House('foo');
            house.doors = [new Door()];
            expect(await house.isValid()).to.be.false
        })
    })

    describe('#validate', () => {
        it('returns an error message if a required attribute is missing', async() => {
            let house = new House();
            let validation = await house.validate();
            expect(validation.constructor).to.eq(ValidationResult)
            expect(validation.errors['name']).to.exist
        })

        it('returns true if a required attribute is present', async() => {
            let house = new House('house1');
            let validation = await house.validate();
            expect(validation.constructor).to.eq(ValidationResult)
            expect(validation.valid()).to.be.true
        })

        it('calls custom validation functions', async () => {
            let house = new House('house1');
            house.doors = [new Door()]
            house.doors[0].color = 'blue';
            let validation = await house.validate();
            expect(validation.valid()).to.be.false

            house.doors[0].color = 'green';
            validation = await house.validate();
            expect(validation.valid()).to.be.false
        })

        it('returns true if a required lazy relationship is present, but not loaded', async() => {
            let a = new A();
            a.requiredB = await new B().save();
            await a.save();

            a = await A.get<A>(a._id);
            a.save();
        })
    });

    describe('ValidationResult', () => {
        describe('#valid()', () => {
            it('returns true if no error messages exist', async () => {
                expect(new ValidationResult().valid()).to.be.true
                expect(new ValidationResult({}).valid()).to.be.true
            })

            it('returns false if errors exist', async () => {
                expect(new ValidationResult({prop: ['must exist']}).valid()).to.be.false
            })
        })

        describe('#add()', () => {
            it('adds a new error message for a property', async () => {
                let v = new ValidationResult();
                v.add('prop', 'is null');
                expect(v.errors['prop']).to.eqls(['is null']);
            })
        })

        describe('#addErrors()', () => {
            it('adds an errors object of another ValidationResult', async () => {
                let inner = new ValidationResult({
                    foo: ['is null']
                });
                let outer = new ValidationResult({
                    foo: ['is also null']
                });
                outer.addErrors(inner.errors, 'inner');
                expect(outer.errors['foo']).to.eqls(['is also null']);
                expect(outer.errors['inner.foo']).to.eqls(['is null']);
            })
        })
    })
})
