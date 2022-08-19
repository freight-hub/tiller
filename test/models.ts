import {Collection} from "../src";
import {reference} from "../src";
import {document} from "../src";
import {collection} from "../src";
import {embed} from "../src";
import {ordered} from "../src";
import {validate, validateDocument, ValidationResult} from "../src";
import {index} from "../src";
import {ObjectId} from "mongodb";

@collection()
export class User extends Collection {
    id:string

    constructor(id:string) {
        super();
        this.id = id;
    }

    login() {
        return this.id.toUpperCase;
    }
}

@collection()
export class File extends Collection {
    name:string;

    @reference(User)
    owner:User
    owner_id: ObjectId;

    @reference([User])
    editors:Array<User>
    editors_id: ObjectId[];
    
    constructor(name:string, owner?:User) {
        super();
        this.name = name;
        this.owner = owner;
    }
}

@document()
export class Backups {
    @reference(File)
    backup1:File

    @reference(File)
    backup2:File

    constructor(backup1?:File, backup2?:File) {
        this.backup1 = backup1;
        this.backup2 = backup2;
    }

    count():number {
        return (this.backup1 ? 1 : 0) + (this.backup2 ? 1 : 0);
    }
}

@collection()
export class Folder extends Collection {
    name:string;

    @reference(User)
    owner:User

    @embed(Backups)
    backups:Backups

    @reference([Folder])
    subfolders:Array<Folder>

    @reference([File]) @ordered(['name'], ['asc'])
    files:Array<File>

    constructor(name?:string, owner?:User) {
        super();
        if(name) this.name = name;
        if(owner) this.owner = owner;
    }

    path() {
        return '/' + this.name;
    }
}

@document()
export class Item {
    name:string

    constructor(name:string) {
        this.name = name;
    }
}

@document()
export class Loc {
    latitude:number
    longitude:number

    constructor(longitude:number, latitude:number) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    _serialize(location:Loc):any {
        return {
            type: 'Point',
            coordinates: [location.longitude, location.latitude]
        }
    }

    _deserialize(doc) {
        return doc ? {
            latitude: doc.coordinates[1],
            longitude: doc.coordinates[0]
        } : null;
    }
}

@collection()
export class Bundle extends Collection {
    id:number

    @embed([Item])
    items:Array<Item>

    @embed([Loc])
    locations:Array<Loc>

    constructor(id:number, items?:Array<Item>, locations?:Array<Loc>) {
        super();
        this.id = id;
        this.items = items;
        this.locations = locations;
    }

    foo() {
        return this.id;
    }
}

@collection()
export class SpaceShip extends Collection {
    @reference([Bundle])
    bundles:Array<Bundle>

    constructor(bundles:Array<Bundle>) {
        super();
        this.bundles = bundles;
    }
}

@collection()
export class Foo extends Collection {
    s1:string
    s2:string
    n1:number

    constructor(s1:string, s2:string, n1:number) {
        super()
        this.s1 = s1;
        this.s2 = s2;
        this.n1 = n1;
    }

    hello() {
        return 'hello';
    }
}

@collection('weird_collection')
export class WeirdCollectionClazz extends Collection {

}

@document()
export class Door {
    @index()
    name:string

    @validate({required: true})
    locked:boolean

    color:string

    async validate():Promise<ValidationResult> {
        let v = await validateDocument(this)
        if(this.color && this.color != 'green') {
            v.add('color', 'must be green');
        }
        return v;
    }
}

@collection()
export class House extends Collection {

    @index({unique: true})
    publicId:string

    @validate({required: true, type:String}) @index()
    name:string

    @validate({required: false, type: Boolean})
    dog:boolean

    @embed([Door])
    doors:Array<Door>

    @validate({type: ['red', 'white']})
    color:string

    constructor(name?:string, publicId?:string) {
        super();
        this.name = name;
        this.publicId = publicId;
    }
}

@collection()
export class Bar extends Collection{
    _id:number

    constructor(id:number) {
        super();
        this._id = id;
    }
}

@collection('B')
export class B extends Collection {
    name:string

    constructor(name?:string) {
        super();
        this.name = name;
    }
}

@collection('B1')
export class B1 extends Collection {
    
    @validate({required: true})
    name:string

    constructor(name?:string) {
        super();
        this.name = name;
    }
}

@collection('A')
export class A extends Collection {
    @reference(B, {lazy: true})
    b:B

    @reference([B], {lazy: true})
    bs:Array<B>

    constructor(b?:B, bs?:Array<B>) {
        super();
        this.b = b;
        this.bs = bs;
    }
}

@collection('A2')
export class A2 extends Collection {
    @reference(B, {lazy: true})
    @validate({required: true})
    requiredB:B
}

@collection('A3')
export class A3 extends Collection {
    //@reference([B])
    bs:B
}

@collection('A4')
export class A4 extends Collection {

    @embed([[B]])
    bs:Array<Array<B>>

    @reference([[B]])
    bs_ref:Array<Array<B>>
}



