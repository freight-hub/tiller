export function isArray(obj:any) {
    return obj && obj.constructor == Array;
}

export function pmap<T, T2>(array:Array<T>, fn:(v, i, a) => Promise<T2>):Promise<Array<T2>> {
    return Promise.all<T2>(array.map((v, i, a) => {
        return fn(v, i, a)
    }));
}
