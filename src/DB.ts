import {MongoClient, Db, Collection} from "mongodb";
import {MongoClientOptions} from "mongodb";

export class _DB {
    db:Db
    dbName:string

    async connect(dbName:string) {
        this.dbName = dbName;

        if (this.db) {
            Promise.resolve(this.db);
        } else {
            let url = 'mongodb://localhost:27017/' + this.dbName;
            
            let options:MongoClientOptions = {server: {socketOptions: {autoReconnect: true}}};
            this.db = await MongoClient.connect(url, options)
        }
    }

    async disconnect() {
        this.db.close();
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