import { MongoClient, Db, Collection } from "mongodb";
import { MongoClientOptions } from "mongodb";
import { EventEmitter } from "events";
import { createIndexes } from "./decorators/index";

export class _DB extends EventEmitter {
    db: Db
    mongoClient: MongoClient

    async connect(uri: string, user?: string, password?: string) {
        if (!this.db) {
            let options: MongoClientOptions = { autoReconnect: true, ...(user && password ? { auth: { user, password } } : {}) };
            this.mongoClient = await MongoClient.connect(uri, options)
            this.db = this.mongoClient.db()

            await createIndexes()
        }
    }

    async disconnect(force?: boolean) {
        if (this.mongoClient) {
            await this.mongoClient.close(force);
        }
        this.db = null;
        this.mongoClient = null
    }

    isConnected() {
        return this.db != null;
    }

    async collection(collectionName: string): Promise<Collection> {
        if (!this.isConnected()) {
            throw new Error('DB is not connected');
        }

        return this.db.collection(collectionName);
    }

    async command(command: any) {
        if (!this.isConnected()) {
            throw new Error('DB is not connected');
        }

        return this.db.command(command);
    }
}

export let DB = new _DB();