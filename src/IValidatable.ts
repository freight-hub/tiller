export interface IValidatable {
    validate():Promise<any>;
    isValid():Promise<any>;
}