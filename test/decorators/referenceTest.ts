import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip, A, B} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";
import {AA} from "../models/AA";
import {BB} from "../models/BB";

describe('@reference decorator', () => {
    includeHelper();
    
    it('saves references to referenced documents', async () => {
        let bob = new User('bob');
        await bob.save();
        let root = new Folder('Applications', bob);
        await root.save();

        let rootObj = (await (await DB.collection('folders')).find({_id: root._id}).toArray())[0];
        expect(rootObj.owner_id.toString()).to.eq(bob._id.toString())
    })

    it('saves referenced documents to the database if they are new', async () => {
        let bob = new User('bob');
        let root = new Folder('Applications', bob);
        await root.save(true);

        expect(bob.isNew()).to.be.false

        let rootObj = (await (await DB.collection('folders')).find({_id: root._id}).toArray())[0];
        expect(rootObj.owner_id.toString()).to.eq(bob._id.toString())
    })

    it('saves referenced documents in a sub-document', async () => {
        let bob = new User('bob');
        let alice = new User('alice');
        let root = new Folder('Applications', bob);
        let rootBackup1 = new File('Applications Backup 1', alice)
        root.backups = new Backups(rootBackup1, null);

        await root.save(true);

        expect(root.isNew()).to.be.false
        expect(rootBackup1.isNew()).to.be.false
        expect(bob.isNew()).to.be.false
        expect(alice.isNew()).to.be.false

        let rootObj = (await (await DB.collection('folders')).find({_id: root._id}).toArray())[0];
        expect(rootObj.owner_id.toString()).to.eq(bob._id.toString())
    })

    it('saves a document with an array of referenced documents, which are saved', async () => {
        let bundle1 = new Bundle(1);
        let bundle2 = new Bundle(2);
        await bundle1.save()
        await bundle2.save()

        let containerCount = await (await DB.collection('bundles')).count({});
        expect(containerCount).to.eq(2);

        let ship = new SpaceShip([bundle1, bundle2]);
        await ship.save();

        let shipObj = (await (await DB.collection('spaceships')).find({_id: ship._id}).toArray())[0];
        expect([shipObj.bundles_id[0].toString(), shipObj.bundles_id[1].toString()])
            .to.deep.equal([bundle1._id.toString(), bundle2._id.toString()])
    })

    it('saves a document with an array of referenced documents, some being null', async () => {
        let bundle1 = new Bundle(1);
        await bundle1.save()

        let ship = new SpaceShip([bundle1, null]);
        await ship.save();

        let ship_ = (await (await DB.collection('spaceships')).find({_id: ship._id}).toArray())[0];
        expect([ship_.bundles_id[0].toString(), null]).to.deep.equal([bundle1._id.toString(), null])
    })

    it('saves a document with an array of referenced documents, which are un-saved', async () => {
        let bundle1 = new Bundle(1);
        let bundle2 = new Bundle(2);

        let ship = new SpaceShip([bundle1, bundle2]);
        await ship.save(true);

        expect(bundle1.isNew()).to.be.false
        expect(bundle2.isNew()).to.be.false

        let ship_ = (await (await DB.collection('spaceships')).find({_id: ship._id}).toArray())[0];
        expect([ship_.bundles_id[0].toString(), ship_.bundles_id[1].toString()])
            .to.deep.equal([bundle1._id.toString(), bundle2._id.toString()])
    })

    it('returns an object hierarchy with referenced documents in an array', async() => {
        let ship = new SpaceShip([new Bundle(1), new Bundle(2)]);
        await ship.save(true);

        let ship_ = await SpaceShip.get<SpaceShip>(ship._id);
        expect(ship_.bundles.length).to.eq(2);
        expect(ship_.bundles[0]).to.be.instanceOf(Bundle)
        expect(ship_.bundles[0].id).eq(1)
        expect(ship_.bundles[1]).to.be.instanceOf(Bundle)
        expect(ship_.bundles[1].id).eq(2)
    })

    describe('with a lazy reference', () => {
        it('saves references to referenced documents', async () => {
            let b = await new B('My B').save();
            let a = await new A(b).save();
            
            let aObj = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];
            expect(aObj.b_id.toString()).to.eq(b._id.toString())
        })

        it('saves references to referenced documents in an array', async () => {
            let b1 = await new B('My B1').save();
            let b2 = await new B('My B2').save();
            let a = await new A(undefined, [b1, b2]).save();

            let aObj = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];
            expect(aObj.bs_id[0].toString()).to.eq(b1._id.toString())
            expect(aObj.bs_id[1].toString()).to.eq(b2._id.toString())
        })

        it('returns the id\'s of lazy referenced documents by default', async() => {
            let b = await new B('My B').save();
            let a = await new A(b).save();

            a = await A.get<A>(a._id);
            expect((<any>a).b_id.toString()).to.eq(b._id.toString());
        })

        it('returns the id\'s of lazy referenced documents in an array by default', async() => {
            let b1 = await new B('My B1').save();
            let b2 = await new B('My B2').save();
            let a = await new A(undefined, [b1, b2]).save();

            a = await A.get<A>(a._id);
            expect((<any>a).bs_id[0].toString()).to.eq(b1._id.toString());
            expect((<any>a).bs_id[1].toString()).to.eq(b2._id.toString());
        })

        it('returns lazy referenced documents when specified', async() => {
            let b = await new B('My B').save();
            let a = await new A(b).save();

            let a_ = await A.get<A>(a._id);
            await a_.loadReference('b');
            expect(a_.b.constructor).to.eq(B)
        })

        it('returns lazy referenced documents in an array when specified', async() => {
            let b1 = await new B('My B1').save();
            let b2 = await new B('My B2').save();
            let a = await new A(undefined, [b1, b2]).save();

            a = await A.get<A>(a._id);
            await a.loadReference('bs');
            expect(a.bs[0].constructor).to.eq(B)
            expect(a.bs[1].constructor).to.eq(B)
            expect(a.bs[0]._id.toString()).to.eq(b1._id.toString());
            expect(a.bs[1]._id.toString()).to.eq(b2._id.toString());
        })

        it('calling loadReference twice is idempotent', async() => {
            let b = await new B('My B').save();
            let a = await new A(b).save();

            let a_ = await A.get<A>(a._id);
            await a_.loadReference('b');
            await a_.loadReference('b');
            expect(a_).to.exist
            expect(a_.b.name).to.eq('My B')
        })

        it('calling loadReference on a new (fresh) object keeps the property intact', async() => {
            let b = await new B('My B').save();
            let a = await new A(b).save();

            expect(a).to.exist
            expect(a.b.name).to.eq('My B')
            await a.loadReference('b');
            expect(a).to.exist
            expect(a.b.name).to.eq('My B')
        })

        it('saving a loaded (only eager) document leaves the document intact in the database', async () => {
            let b = await new B('My B').save();
            let a = await new A(b).save();

            let a_ = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];

            a = await A.get<A>(a._id);
            await a.save();

            let a_2 = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];
            expect(a_._id.toString()).to.eq(a_2._id.toString());
            expect(a_.b_id.toString()).to.eq(a_2.b_id.toString());
        })

        it('saving a loaded (only eager) document with referenced documents in an array leaves the document intact in the database', async () => {
            let b1 = await new B('My B1').save();
            let b2 = await new B('My B2').save();
            let a = await new A(undefined, [b1, b2]).save();

            let a_ = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];

            a = await A.get<A>(a._id);
            await a.save();

            let a_2 = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];
            expect(a_.bs_id[0].toString()).to.eq(a_2.bs_id[0].toString());
            expect(a_.bs_id[1].toString()).to.eq(a_2.bs_id[1].toString());
        })

        it('saving a loaded (incl. lazy refs) document leaves the document intact in the database', async () => {
            let b = await new B('My B').save();
            let a = await new A(b).save();

            let a_ = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];

            a = await A.get<A>(a._id);
            await a.loadReference('b');
            await a.save();

            let a_2 = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];
            expect(a_._id.toString()).to.eq(a_2._id.toString());
            expect(a_.b_id.toString()).to.eq(a_2.b_id.toString());
        })

        it('saving a loaded (incl. lazy refs) document with referenced document in an array leaves the document intact in the database', async () => {
            let b1 = await new B('My B1').save();
            let b2 = await new B('My B2').save();
            let a = await new A(undefined, [b1, b2]).save();

            let a_ = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];

            a = await A.get<A>(a._id);
            await a.loadReference('bs');
            await a.save();

            let a_2 = (await (await DB.collection('A')).find({_id: a._id}).toArray())[0];
            expect(a_.bs_id[0].toString()).to.eq(a_2.bs_id[0].toString());
            expect(a_.bs_id[1].toString()).to.eq(a_2.bs_id[1].toString());
        })

        it('updates the reference properly, when the reference is lazy and has not been loaded', async () => {
            let b1 = await new B('My B1').save();
            let b2 = await new B('My B2').save();
            let a = await new A(b1).save();

            a = await A.get<A>(a._id);
            a.b = b2;
            await a.save();

            a = await (await A.get<A>(a._id)).loadReference('b');
            expect(a.b._id.toString()).to.eq(b2._id.toString());
        })
    })

    it('can handle transitive cyclic imports', async () => {
        let a = new AA();
        await a.save()

        let b = new BB();
        b.aa = a;
        await b.save()

        a.bb = b;
        await a.save()

        let _b = await BB.get<BB>(b._id)

        expect(_b).to.be.instanceOf(BB)
        expect(_b.aa).to.be.instanceOf(AA)
    })
})