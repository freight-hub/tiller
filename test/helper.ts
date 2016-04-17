import {DB} from "../src/DB";
let DatabaseCleaner = require('database-cleaner');
import * as fs from 'fs'

export function includeHelper() {
    async function connect() {
        await DB.connect('tiller_test');
    }

    async function disconnect() {
        await DB.disconnect();
    }

    function cleanDatabase() {
        var databaseCleaner = new DatabaseCleaner('mongodb');
        return new Promise((resolve) => {
            databaseCleaner.clean(DB.db, () => {
                resolve();
            })
        });
    }

    async function seedDatabase() {

    }

    before(async () => {
        await connect();
    })

    beforeEach(async () => {
        await cleanDatabase();
        await seedDatabase();
    })

    after(async () => {
        
    })
}

export function _async(fn:() => Promise<any>):((MochaDone) => Promise<any>) {
    return (done:MochaDone) => {
        return fn().then(function() {
            done();
        }, function(e) {
            done(e);
        });
    }
}