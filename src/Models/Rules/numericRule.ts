import {Attribute, Instance} from '../';

export class NumericRule {

    private _attribute: Attribute;
    private _splitMap: Map<string, Array<Instance>>;
    private _threshold: number;

    constructor(attribute: Attribute, threshold: number) {
        this._attribute = attribute;
        this._threshold = threshold;
        this._splitMap = new Map<string, Array<Instance>>();
        this._splitMap.set('lessThanEqual', new Array<Instance>());
        this._splitMap.set('greaterThan', new Array<Instance>());
    }

    public split(list: Array<Instance>): Map<string, Array<Instance>> {
        list.forEach((instance) => {
            const value = parseFloat(instance.getAttributeValue(this._attribute.name));
            if (value <= this._threshold) {
                this._splitMap.get('lessThanEqual').push(instance);
            } else {
                this._splitMap.get('greaterThan').push(instance);
            }
        });
        return this._splitMap;
    }

    public print () {
        console.log('Split on:' + this._attribute.name + ' Value - ' + this._threshold);
    }
}
