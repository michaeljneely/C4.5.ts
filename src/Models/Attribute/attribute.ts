import {Instance} from '../Instance';
import {Type} from '../Type';

export class Attribute {

    private _name: string;
    private _type: Type;
    private _values: Array<any>;
    private _uniqueValues: Array<any>;

    constructor(name: string, type: Type) {
        this._name = name;
        this._type = type;
        this._uniqueValues = new Array<any>();
        this._values = new Array<any>();
    }

    public get name(): string {
        return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    public get type(): Type {
        return this._type;
    }

    public get uniqueValues(): Array<any> {
        return this._uniqueValues;
    }

    public get values(): Array<any> {
        return this._values;
    }

    public setUniqueValues(list: Array<Instance>): void {
        list.forEach((instance: Instance) => {
            this.addValue(instance.getAttributeValue(this._name));
        });
    }

    public isUniqueValue(value: any): boolean {
        return (this._uniqueValues.indexOf(value) === -1) as boolean;
    }

    public addValue(value: any): void {
        if (this.isUniqueValue(value)) {
            this._uniqueValues.push(value);
            if (this._type === Type.NUMERIC) {
                this._uniqueValues.sort(this.numericSort);
            } else {
                this._uniqueValues.sort();
            }
        }
    }

    public setValues(list: Array<Instance>): void {
        list.forEach((instance: Instance) => {
            this._values.push(instance.getAttributeValue(this._name));
        });
        this._values.sort(this.numericSort);
    }

    private numericSort(a: number, b: number): number {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        }
        return 0;
    }

    // Categorical Sort is standard string sort

}
