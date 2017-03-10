import {MongoClient, Db, Collection} from "mongodb";
import {MongoClientOptions} from "mongodb";
import {EventEmitter} from "events";
import {createIndexes} from "./decorators/index";

export class _DB extends EventEmitter {
    db:Db

    async connect(uri:string, user?:string, password?:string) {
        if (!this.db) {
            let options:MongoClientOptions = {autoReconnect: true};
            this.db = await MongoClient.connect(uri, options)
            if(user && password) {
                await this.db.authenticate(user, password)
            }

            await createIndexes()
        }
    }

    async disconnect(force?:boolean) {
        if(this.db) {
            await this.db.close(force);
        }
        this.db = null;
    }

    isConnected() {
        return this.db != null;
    }

    async collection(collectionName:string):Promise<Collection> {
        if(!this.isConnected()) {
            throw new Error('DB is not connected');
        }

        return this.db.collection(collectionName);
    }

    async command(command:any) {
        if(!this.isConnected()) {
            throw new Error('DB is not connected');
        }

        return this.db.command(command);
    }
}

export let DB = new _DB();