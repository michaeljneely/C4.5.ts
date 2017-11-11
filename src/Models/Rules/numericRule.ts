import {Attribute, Instance} from '../';

export class NumericRule {

    private _attribute: Attribute;
    private _splitMap: Map<string, Array<Instance>>;
    private _threshold: number;
    private _condition: string;

    constructor(attribute: Attribute, threshold: number, condition: string) {
        this._attribute = attribute;
        this._threshold = threshold;
        this._condition = condition;
        this._splitMap = new Map<string, Array<Instance>>();
        this._splitMap.set(`lessThanEqual: ${threshold}`, new Array<Instance>());
        this._splitMap.set(`greaterThan: ${threshold}`, new Array<Instance>());
    }

    public split(list: Array<Instance>): Map<string, Array<Instance>> {
        list.forEach((instance) => {
            const value = parseFloat(instance.getAttributeValue(this._attribute.name));
            if (value <= this._threshold) {
                this._splitMap.get(`lessThanEqual: ${this._threshold}`).push(instance);
            } else {
                this._splitMap.get(`greaterThan: ${this._threshold}`).push(instance);
            }
        });
        return this._splitMap;
    }

    public print (): string {
        const prepend = (this._condition) ? `Condition: ${this._condition}, ` : ``;
        return `${prepend}Split on Numeric Attribute: ${this._attribute.name}, Value - ${this._threshold}`;
    }

    public classify(instance: Instance): number {
        if (parseFloat(instance.getAttributeValue(this._attribute.name)) <= this._threshold) {
            return 0;
        }
        return 1;
    }

    public get condition() {
        return this._condition;
    }

    public get splitMap() {
        return this._splitMap;
    }
}
