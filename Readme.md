[![NPM Module](https://badge.fury.io/js/tiller.svg)](https://npmjs.org/package/tiller)
[![Build Status](https://travis-ci.org/erikmuttersbach/tiller.svg?branch=master)](https://travis-ci.org/erikmuttersbach/tiller)

# Tiller - MongoDB ODM for TypeScript
Tiller is an ODM for MongoDB, written in TypeScript with an ActiveRecord-inspired API.

Capabilities of Tiller include:
* Modeling entire typed hierarchies through sub-documents or references
* Ability to include serializers/deserializers to modify the structure of a JSON document in the database
* Modern `async`/`await` API to evade callback hell
* Add indexes right in the class definition
* Extensible validation layer

## Installation
    $ npm install tiller --save
    $ tsd install mongodb --save

Make sure that you compile to ES6 JavaScript.

## Getting Started

```js
    import 'source-map-support/register'
    import {DB, Document, collection, Collection, document, embed} from 'tiller';

    @document()
    export class Cannon {
        power:number

        shoot() {
            console.log('wumm')
        }
    }

    @collection('spaceShips')
    export class SpaceShip extends Collection {
        name:string

        @embed(Cannon)
        cannons:Array<Cannon>

        constructor(name?:string) {
            super()
            this.name = name;
        }

        fly() {
            console.log('flyiiiinng...');
        }
    }

    (async () => {
        await DB.connect('testdb')
        let ship = new SpaceShip('SpaceShip1')
        ship.cannons = [new Cannon()];

        // Save to the database
        await ship.save();

        // Load from the database
        ship = await SpaceShip.findOne<SpaceShip>({name: 'SpaceShip1'})
        ship.fly();                 // flyiiiinng
        ship.cannons[0].shoot();    // wumm

        await DB.disconnect(true)
    })().catch((e) => {
        console.error(e.stack)
    })
```

## Manual
### Creating Collections
Making a JS class being stored as MongoDB collection is as easy as adding the `@collection()` decorator and
inheriting from `Collection`:

    @collection()
    export class MyModel extends Collection {

    }

Optionall you can pass a parameter to the decorator that names the collection:

    @collection('myCollectionName')

The API to interact with the database is heavily inspired by ActiveRecord:

    let objs:Promise<Array<MyModel>> = MyModel.find<MyModel>({key: ...})
    // or using await:
    let objs:Array<MyModel> = await MyModel.find<MyModel>({key: ...})

    let objs:MyModel = await MyModel.findOne<MyModel>({key: ...})

    let objs:MyModel = await MyModel.get<MyModel>(idValue)

    myModel.save()

#### Adding indexes
Indexes can easily be added using the `@index` decorator. They
are also supported on subdocuments:

    @collection()
    class MyModel extends Collection {

        @index({unique: true})
        myId:number

        @index()
        name:string
    }

Indexes spanning multiple fields are currently not supported.

#### `Collection` instance states & lifecycle hooks
Using the functions `isNew()` and `isSaved()` you can find out whether an instance of `Collection` has been saved
in the database already:

    let obj = new MyModel()
    assert(!obj.isSaved() && obj.isNew())
    await obj.save()
    assert(obj.isSaved() && !obj.isNew())

To perform pre- or post-save actions you can override the `Collection` methods `beforeSave()`
and `afterSave()`.

#### Using non-ObjectId `_ids`
You can use non-ObjectId types for `_id` by redefining `_id`:

    @collection()
    export class MyModel extends Collection {
        _id:string
    }

### Saving Objects
#### `#save()`
Regardless of whether an instance is a new completely new instance, was loaded from a
database with (`find()` or similar) or an upsert should be performed - the `#save()` method
will do:

    // Saves a new instance
    var obj1 = new MyModel()
    obj1.save()

    // Updates an instance
    var obj1 = MyModel.get<MyModel>(...)
    obj1.save()

    // Upsert an instance
    var obj1 = new MyModel()
    obj1._id =
    obj1.save(undefined, true)

#### Saving Referenced Objects
TODO

### Finding Objects

#### `Collection#get()`

Using `Collection#get()` you can fetch a single object using its `_id` value. You have to use `ObjectID`
if you use standard `_id` values:

    obj = await MyModel.get<MyModel>(new ObjectID("56f90cf44c57a9c97f1ac295"))

    // or using numeric _id's
    obj = await ModelWithStandardId.get<ModelWithStandardId>(123)

#### `Collection#find()`

The static method `#find(selector:any, limit?:number, sort?:any)` will return an array of objects that
match `selector`. Optionally you can specify a limit (or set this parameter to `null`) and a sort order.

    // Finding all objects with key == 'value'
    objs = await MyModel.find<MyModel>({key: 'value'})

    // Limiting the returned objects to 3
    objs = await MyModel.find<MyModel>({key: 'value'}, 3)

    // Sorting the returned objects to id, not limiting the returned objects
    objs = await MyModel.find<MyModel>({key: 'value'}, null, {id: 1})

Of course `#find()` doesn't just return `Objects`. It rebuilds entire object hierarchies, and sets the
correct object prototypes.

#### `Collection#findOne()`

`Collection#findOne(selector)` is similar to `Collection#find()`, but it returns only the first found
document.

### Deleting Objects

#### `Collection#destroy()`
An object can be destroyed using the `#destroy()` method:

    await obj.destroy();


### Validating Objects
Tiller also contains a basic, but extensible, validation layer. Use the
`@validate` decorator to add a schema to your model:


    @collection()
    export class House extends Collection {

       @validate({required: true})
       name:string

       @validate({type: ['red', 'white']})
       color:string
    }

    house = new House();
    house.isValid() // false

    house.name = 'My House';
    house.isValid() // true

    house.color = 'brown';
    house.isValid() // false
    house.validate() // {color: ...}

    house.color = 'red';
    house.isValid() // true
    house.validate() // {}


Refer to [js-schema](https://github.com/molnarg/js-schema) for details about supported types.


### Working with Plain old JavaScript `Object`s

To recreate a typed object hierarchy from JSON/JavaScript Objects `Collection.create()` can be used. It will
also recreate embedded and referenced documents.

    let myModel = MyCollection.create<MyCollection>({foo: 'bar', child: {a: 'b'}})


## Roadmap
* DIRTY Tracking to improve save speed
* Remove problems with two documents/collections named equally
* Implement batch operations
* Add Continous Integration build
* Complete Readme: References, Embedded Documents
* Keep upward references in @document
* Implement $lookup aggregation for fast loading of references
* Implement support for aggregation queries
* Support Model-level hooks, to support external service-based model validation, i.e. MyModel.addHook('afterSave', ...)
* Add chai plugins: expect(myModel).to.be.valid/invalid

## Bugs
* Arrays of Referenced Objects are supported, but not arrays of arrays of referenced objects

## Issues
* "Required" validation of references, when we don't deep-save

