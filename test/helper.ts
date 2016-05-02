import {DB} from "../src/DB";
let DatabaseCleaner = require('database-cleaner');
import * as fs from 'fs'

export function cleanDatabase() {
    var databaseCleaner = new DatabaseCleaner('mongodb');
    return new Promise((resolve) => {
        databaseCleaner.clean(DB.db, () => {
            resolve();
        })
    });
}

export function includeHelper(cleanBeforeEach?:boolean) {
    cleanBeforeEach = cleanBeforeEach == undefined ? true : false;

    async function connect() {
        await DB.connect('tiller_test2');
    }

    async function disconnect() {
        await DB.disconnect();
    }

    async function seedDatabase() {

    }

    before(async () => {
        await connect();
    })

    beforeEach(async () => {
        if(cleanBeforeEach) {
            await cleanDatabase();
        }
        await seedDatabase();
    })

    after(async () => {
        if(!cleanBeforeEach) {
            await cleanDatabase();
        }
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