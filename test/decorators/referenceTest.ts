import {expect} from 'chai'
import {Folder, User, Backups, File, Bundle, SpaceShip} from "../models";
import {includeHelper} from '../helper'
import {DB} from "../../src/DB";

describe('@reference decorator', () => {
    includeHelper();
    
    it('saves references to referenced documents', async () => {
        let bob = new User('bob');
        await bob.save();
        let root = new Folder('Applications', bob);
        await root.save();

        let root_ = (await (await DB.collection('folders')).find({_id: root._id}).toArray())[0];
        expect(root_.owner.toString()).to.eq(bob._id.toString())
    })

    it('saves referenced documents to the database if they are new', async () => {
        let bob = new User('bob');
        let root = new Folder('Applications', bob);
        await root.save();

        expect(bob.isNew()).to.be.false

        let root_ = (await (await DB.collection('folders')).find({_id: root._id}).toArray())[0];
        expect(root_.owner.toString()).to.eq(bob._id.toString())
    })

    it('saves referenced documents in a sub-document', async () => {
        let bob = new User('bob');
        let alice = new User('alice');
        let root = new Folder('Applications', bob);
        let rootBackup1 = new File('Applications Backup 1', alice)
        root.backups = new Backups(rootBackup1, null);

        await root.save();

        expect(root.isNew()).to.be.false
        expect(rootBackup1.isNew()).to.be.false // Because it's a sub document here, not a reference
        expect(bob.isNew()).to.be.false
        expect(alice.isNew()).to.be.false

        let root_ = (await (await DB.collection('folders')).find({_id: root._id}).toArray())[0];
        expect(root_.owner.toString()).to.eq(bob._id.toString())
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

        let ship_ = (await (await DB.collection('spaceships')).find({_id: ship._id}).toArray())[0];
        expect([ship_.bundles[0].toString(), ship_.bundles[1].toString()])
            .to.deep.equal([bundle1._id.toString(), bundle2._id.toString()])
    })

    it('saves a document with an array of referenced documents, which are un-saved', async () => {
        let bundle1 = new Bundle(1);
        let bundle2 = new Bundle(2);

        let ship = new SpaceShip([bundle1, bundle2]);
        await ship.save();

        expect(bundle1.isNew()).to.be.false
        expect(bundle2.isNew()).to.be.false

        let ship_ = (await (await DB.collection('spaceships')).find({_id: ship._id}).toArray())[0];
        expect([ship_.bundles[0].toString(), ship_.bundles[1].toString()])
            .to.deep.equal([bundle1._id.toString(), bundle2._id.toString()])
    })

    it('returns an object hierarchy with referenced documents in an array', async() => {
        let ship = new SpaceShip([new Bundle(1), new Bundle(2)]);
        await ship.save();

        let ship_ = await SpaceShip.get<SpaceShip>(ship._id);
        expect(ship_.bundles.length).to.eq(2);
        expect(ship_.bundles[0]).to.be.instanceOf(Bundle)
        expect(ship_.bundles[0].id).eq(1)
        expect(ship_.bundles[1]).to.be.instanceOf(Bundle)
        expect(ship_.bundles[1].id).eq(2)
    })
})