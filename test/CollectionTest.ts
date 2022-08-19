import {expect} from 'chai'
import {User, Folder, Backups, File, Foo, Bundle, Item, Bar, House, Door} from "./models";
import {Quote, Option, LineItem, Product} from "./models/Quote";
import {includeHelper} from './helper'
import {DB} from '../src';
import {Collection, collection} from '../src';
import {ValidationError} from '../src';
import {EUR} from "./models/Currency";

describe('Collection', () => {
    includeHelper();

    describe('#toDb()', () => {
        it('projects embedded and referenced documents', async() => {
            let bob = new User('bob');
            let alice = new User('alice');
            let root = new Folder('Applications', bob);
            let rootBackup1 = new File('Applications Backup 1', alice)
            await rootBackup1.save();
            root.backups = new Backups(rootBackup1, null);

            let obj = await (<any>root).toDB(true);
            expect(obj).to.have.property('name', 'Applications')
            expect(obj.owner_id.toString()).to.eq(bob._id.toString());
            expect(obj).to.have.property('backups')
            expect(obj.backups.backup1_id.toString()).to.eq(rootBackup1._id.toString())
        })
    })

    describe('#create', () => {
        it('created object hierarchies from objecta', async() => {
            let house = await House.create<House>({
                name: 'foo',
                doors: [{
                    name: 'Door 1',
                    locked: true
                }]
            });

            expect(house).to.be.an.instanceOf(House);
            expect(house.doors[0]).to.be.an.instanceOf(Door);
        })
    });

    describe('#save()', () => {
        it('can save a model with a string id', async() => {
            @collection('coll1')
            class StringIdColl extends Collection {
                _id: string
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

        it('saves documents as new, even if the _id is set', async() => {
            await new Bar(1).save();
            try {
                // Saving as new means a new is to be inserted -> will raise an error
                // because the key already exists
                await new Bar(1).save();
                expect.fail()
            } catch (e) {
            }
        })

        it('raises a ValidationError the object is invalid', async() => {
            try {
                await new House().save();
                expect.fail()
            } catch (e) {
                expect(e).to.be.an.instanceOf(ValidationError)
            }
        })

        it('sets property_id of references on save', async() => {
            let user = await new User('anna').save();
            let file = await new File('name1');
            file.owner = user;
            await file.save();

            expect(file.owner_id.toString()).to.eq(user._id.toString());
        })
    })

    describe('#save(..., true)', () => {
        it('upserts existing documents', async() => {
            let house = new House('My House 1');
            await house.save();

            house = await House.get<House>(house._id);
            house.color = 'red';
            await house.save();

            let _house = await House.get<House>(house._id);
            expect(_house.name).to.eq('My House 1');
            expect(_house.color).to.eq('red');
        })

        it('totally replaces objects when upserting', async() => {
            let house = new House('My House 1');
            house.color = 'red';
            await house.save();

            let _id = house._id;
            let _house = await House.get<House>(_id);
            expect(_house.name).to.eq('My House 1');
            expect(_house.color).to.eq('red');

            // Now upsert, and totally replace
            house = new House('My House 1 - Updated');
            house._id = _id;
            await house.save(true, true);

            _house = await House.get<House>(_id);
            expect(_house.name).to.eq('My House 1 - Updated');
            expect(_house.color).to.eq(undefined);
        })
    })

    describe('#get()', () => {
        it('returns a document if it exists', async() => {
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

        it('returns undefined if a document doesn exist', async() => {
            let folder_ = await Folder.get<Folder>('ABC')

            expect(folder_).to.be.undefined;
        })

        it('returns an object hierarchy', async() => {
            let bob = new User('bob');
            let root = new Folder('Applications', bob);
            root.backups = new Backups(new File('test', bob));
            await root.save(true)

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
            await root.save(true);

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
        it('returns all documents', async() => {
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

    describe('#count()', () => {
        it('returns the count of documents', async() => {
            await new User('bob').save();
            await new User('anne').save();
            await new User('judith').save();

            expect(await User.count()).to.eq(3);
            expect(await User.count({id: 'bob'})).to.eq(1);
            expect(await User.count({id: 'nonono'})).to.eq(0);
        })
    })

    describe('#destroy', async() => {
        it('destroy the instance of an object', async() => {
            let bob = await new User('bob').save();
            expect(await User.count()).to.eq(1);
            await bob.destroy();
            expect(await User.count()).to.eq(0);
        })
    })

    describe('#updateProperties', () => {
        it('updates scalar properties of unsaved models', async() => {
            let file = new File('name1');
            await file.updateProperties({name: 'name2'})
            expect(file.name).to.eq('name2');
        })

        it('updates scalar properties of saved models', async() => {
            let file = await new File('name1').save();
            await file.updateProperties({name: 'name2'})
            await file.save();

            file = await File.get<File>(file._id);
            expect(file.name).to.eq('name2');


        })

        it('updates referenced documents of saved models', async() => {
            let user = await new User('anna').save();
            let file = await new File('name1').save();
            await file.updateProperties({owner_id: user._id})
            await file.save();

            file = await File.get<File>(file._id);
            expect(file.owner._id.toString()).to.eq(user._id.toString());
        })
    })

    it('save() -> find() -> save() -> find() is an idempotent operation chain', async() => {
        let bob = new User('bob');
        let root = new Folder('Applications', bob);
        root.backups = new Backups(new File('test', bob));
        await root.save(true);

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

    it('loads huge documents fast', async function () {
        this.timeout(60 * 1000)

        let quote = new Quote();
        quote.options = [];
        for (let i = 0; i < 400; i++) {
            let option = new Option();
            option.product = new Product('Product ' + i, 'PRODUCT-' + i);
            option.lineItems = [];
            for (let j = 0; j < 15; j++) {
                let lineItem = new LineItem();
                lineItem.name = 'Line Item ' + j;
                lineItem.total = EUR(j * 100);
                option.lineItems.push(lineItem);
            }
            quote.options.push(option);
        }

        let start = new Date().getTime();
        await quote.save()
        //await (<any>quote).toDB()
        //await DB.db.collection('tests').insertOne(quote);
        console.log('Saving: '+(new Date().getTime()-start))

        let t = 0;
        for(let i=0; i<5; i++) {
            let start = new Date().getTime();

            quote = await Quote.get<Quote>(quote._id);

            let end = new Date().getTime();
            t += end-start;
        }
        t /= 5;

        console.log('Loading 5 times: '+t)
    })
})