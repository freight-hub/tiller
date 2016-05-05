import {MongoClient, Db, Collection} from "mongodb";
import {MongoClientOptions} from "mongodb";
import {EventEmitter} from "events";

export class _DB extends EventEmitter {
    db:Db
    dbName:string

    async connect(dbName:string) {
        this.dbName = dbName;

        if (this.db) {
            // Already connected
        } else {
            let url = 'mongodb://localhost:27017/' + this.dbName;
            
            let options:MongoClientOptions = {server: {socketOptions: {autoReconnect: true}}};
            this.db = await MongoClient.connect(url, options)
            this.emit('connected');
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