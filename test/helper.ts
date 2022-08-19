import {DB} from "../src";

let DatabaseCleaner = require('database-cleaner');

export function cleanDatabase(): Promise<void> {
    var databaseCleaner = new DatabaseCleaner('mongodb');
    return new Promise((resolve, reject) => {
        databaseCleaner.clean(DB.db, () => {
            resolve();
        })
    });
}

export function includeHelper(cleanBeforeEach?: boolean) {
    cleanBeforeEach = cleanBeforeEach == undefined ? true : false;

    async function connect() {
        await DB.connect('mongodb://localhost:27017/tiller_test');
    }

    async function disconnect() {
        await DB.disconnect();
    }

    async function seedDatabase() {

    }

    beforeAll(async () => {
        await connect();
    })

    beforeEach(async () => {
        if (cleanBeforeEach) {
            await cleanDatabase();
        }
        await seedDatabase();
    })

    afterEach(async () => {
        if (!cleanBeforeEach) {
            await cleanDatabase();
        }
    })
}