import {expect} from 'chai'
import {User, Folder, Backups, File, Foo, Bundle, Item} from "./models";
import {includeHelper} from './helper'
import {DB} from '../src/DB';
import {Collection,collection} from '../src/index';

describe('Collection', () => {
    includeHelper();
    
    describe('#toDb()', () => {
        it('projects embedded and referenced documents', async() => {
            let bob = new User('bob');
            let alice = new User('alice');
            let root = new Folder('Applications', bob);
            let rootBackup1 = new File('Applications Backup 1', alice)
            root.backups = new Backups(rootBackup1, null);

            let obj = await (<any>root)._toDb();
            expect(obj).to.have.property('name', 'Applications')
            expect(obj.owner.toString()).to.eq(bob._id.toString());
            expect(obj).to.have.property('backups')
            expect(obj.backups.backup1.toString()).to.eq(rootBackup1._id.toString())
        })
    })

    describe('#save()', () => {
        it('can save a model with a string id', async () => {
            @collection('coll1')
            class StringIdColl extends Collection {
                _id:string
            }

            let obj = new StringIdColl();
            obj._id = 'myid1';
            await obj.save();

            expect(obj.isNew()).to.be.false
            expect(obj._id).to.eq('myid1');

            let coll = await DB.collection('coll1');
            let obj_ = (await (await DB.collection('coll1')).find({_id: obj._id}).toArray())[0];
            expect(obj_._id).to.eq('myid1')
        })

        it('saves a document properly to the database if it\'s new', async() => {
            let foo = new Foo('a', 'b', 1);
            expect(foo.isNew()).to.be.true;
            await foo.save();
            expect(foo.isNew()).to.be.false;

            let foo_ = (await (await DB.collection('foos')).find({_id: foo._id}).toArray())[0];
            expect(foo_).to.have.property('_id')
            expect(foo_).to.have.property('s1', 'a')
            expect(foo_).to.have.property('s2', 'b')
            expect(foo_).to.have.property('n1', 1)
            expect(Object.getOwnPropertyNames(foo_).length).to.eq(Object.getOwnPropertyNames(foo_).length)
        });

        it('updates a document properly in the database', async() => {
            let foo = new Foo('a', 'b', 1);
            await foo.save();
            foo.s1 = 'aa'
            await foo.save();

            let foo_ = (await (await DB.collection('foos')).find({_id: foo._id}).toArray())[0];
            expect(foo_).to.have.property('_id')
            expect(foo_).to.have.property('s1', 'aa')
            expect(foo_).to.have.property('s2', 'b')
            expect(foo_).to.have.property('n1', 1)
            expect(Object.getOwnPropertyNames(foo_).length).to.eq(Object.getOwnPropertyNames(foo_).length)
        });
    })

    describe('#get()', () => {
        it('returns a document if it exists', async () => {
            var folder = new Folder('myfolder');
            await folder.save();

            let folder_ = await Folder.get<Folder>(folder._id)

            expect(folder_.name).to.eq(folder.name);
        })

        it('returns an object with the correct prototype set', async() => {
            var folder = new Folder('myfolder');
            await folder.save();

            let folder_ = await Folder.get<Folder>(folder._id)

            expect(folder_).to.be.an.instanceOf(Folder);
        })

        it('returns undefined if a document doesn exist', async () => {
            let folder_ = await Folder.get<Folder>('ABC')

            expect(folder_).to.be.undefined;
        })

        it('returns an object hierarchy', async() => {
            let bob = new User('bob');
            let root = new Folder('Applications', bob);
            root.backups = new Backups(new File('test', bob));
            await root.save()

            let bob_ = await User.get<User>(bob._id);
            expect(bob_.login()).to.eq(bob.login())

            let root_ = await Folder.get<Folder>(root._id)
            expect(root_.path()).to.eq(root.path());

            expect(root_.backups.count()).to.eq(root.backups.count());
            expect(root_.owner.login()).to.eq(bob.login());
        })

        it('returns an object hierarchy with embedded documents in an array', async() => {
            let bundle = new Bundle(1, [new Item('Apple'), new Item('Banana')]);
            await bundle.save();

            let bundle_ = await Bundle.get<Bundle>(bundle._id);
            expect(bundle_.items[0].constructor).eq(Item)
            expect(bundle_.items[0].name).eq('Apple')
            expect(bundle_.items[1].constructor).eq(Item)
            expect(bundle_.items[1].name).eq('Banana')
        })
    })

    describe('#find', () => {
        it('returns null if the document doesn\'t exist', async() => {
            let foo = await Foo.get<Foo>('12')
            expect(foo).not.to.exist
        });

        it('returns the document', async() => {
            var foo = new Foo('a', 'b', 1);
            await foo.save();

            foo = await Foo.get<Foo>(foo._id)

            expect(foo).to.have.property('_id')
            expect(foo).to.have.property('s1', 'a')
            expect(foo).to.have.property('s2', 'b')
            expect(foo).to.have.property('n1', 1)
        });

        it('returns an object with the right prototype', async() => {
            var foo = new Foo('a', 'b', 1);
            await foo.save();
            expect(foo.hello()).to.eq('hello');
            foo = await Foo.get<Foo>(foo._id)
            expect(foo.hello()).to.eq('hello');
        })

        it('returns an object hierarchy', async() => {
            let bob = new User('bob');
            let root = new Folder('Applications', bob);
            root.backups = new Backups(new File('test', bob));
            await root.save();

            let bob_ = await User.get<User>(bob._id);
            expect(bob_.login()).to.eq(bob.login())

            let root_ = await Folder.get<Folder>(root._id);
            expect(root_.path()).to.eq(root.path());

            expect(root_.backups.count()).to.eq(root.backups.count());
            expect(root_.owner.login()).to.eq(bob.login());
        })

        it('supports sorting the result array', async() => {
            let lucy = await new User('lucy').save();
            let alice = await new User('alice').save();
            let bob = await new User('bob').save();

            let users = await User.find<User>({}, null, {id: 1})
            expect(users.map(u => u.id)).to.eqls(['alice', 'bob', 'lucy']);

            users = await User.find<User>({}, null, {id: -1})
            expect(users.map(u => u.id)).to.eqls(['lucy', 'bob', 'alice']);
        })

        it('supported limiting the result array', async() => {
            let lucy = await new User('lucy').save();
            let alice = await new User('alice').save();
            let bob = await new User('bob').save();

            expect(await User.find<User>({}, undefined, {id: 1})).to.have.length(3);
            expect(await User.find<User>({}, null, {id: 1})).to.have.length(3);
            expect(await User.find<User>({}, 1, {id: 1})).to.have.length(1);
        })
    });

    describe('#all()', () => {
        it('returns all documents', async () => {
            await new User('bob').save();
            await new User('anne').save();
            await new User('judith').save();

            let users = await User.all<User>();
            expect(users).to.have.length(3)
            expect(users[0]).itself.to.respondTo('login')
            expect(users[1]).itself.to.respondTo('login')
            expect(users[2]).itself.to.respondTo('login')
        })
    })

    it('save() -> find() -> save() -> find() is an idempotent operation chain', async() => {
        let bob = new User('bob');
        let root = new Folder('Applications', bob);
        root.backups = new Backups(new File('test', bob));
        await root.save();

        let root_ = await Folder.get<Folder>(root._id);
        let bob_ = await User.get<User>(bob._id);
        expect(root_.name).to.eq(root.name);
        expect(root_.owner._id.toString()).to.eq(root.owner._id.toString());
        expect(root_.backups.backup1.name).to.eq(root.backups.backup1.name);
        expect(root_.backups.count()).to.eq(root.backups.count());
        expect(root_.backups.backup1.owner.id).to.eq(root.backups.backup1.owner.id);

        root_.save();
        root_ = await Folder.get<Folder>(root._id);
        bob_ = await User.get<User>(bob._id);
        expect(root_.name).to.eq(root.name);
        expect(root_.owner._id.toString()).to.eq(root.owner._id.toString());
        expect(root_.backups.backup1.name).to.eq(root.backups.backup1.name);
        expect(root_.backups.count()).to.eq(root.backups.count());
        expect(root_.backups.backup1.owner.id).to.eq(root.backups.backup1.owner.id);
    })
})