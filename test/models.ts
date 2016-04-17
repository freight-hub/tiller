import {Collection} from "../src/Collection";
import {reference} from "../src/decorators/reference";
import {document} from "../src/decorators/document";
import {collection} from "../src/decorators/collection";
import {embed} from "../src/decorators/embed";

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

    @reference(User)
    editors:Array<User>

    constructor(name:string, owner:User) {
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

    @reference(File)
    subfolders:Array<Folder>

    @reference(File)
    files:Array<File>

    constructor(name?:string, owner?:User) {
        super();
        this.name = name;
        this.owner = owner;
    }

    path() {
        return '/' + this.name;
    }
}