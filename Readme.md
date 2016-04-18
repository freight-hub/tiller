# Tiller - MongoDB ODM for TypeScript
Tiller is an ODM for MongoDB, written in TypeScript with an ActiveRecord-inspired API.

Capabilities of Tiller include:
* Modeling entire typed hierarchies through sub-documents or references
* Ability to include serializers/deserializers to modify the structure of a JSON document in the database
* Modern `async`/`await` API to evade callback hell

## Installation
    $ npm install tiller --save
    $ tsd install mongodb --save

Make sure that you compile to ES6 JavaScript.

## Getting Started

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

## Manual
### Collections
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

#### Using non-ObjectId `_ids`
You can use non-ObjectId types for `_id` by redefining `_id`:

    @collection()
    export class MyModel extends Collection {
        _id:string
    }


## Roadmap
* Implement lazy loading
* Remove problems with two documents/collections named equally
* Implement `upsert()`
* Implement batch operations
* Implement validations
* Implement `delete()`
* Add Continous Integration build
* Complete Readme: References, Embedded Documents


