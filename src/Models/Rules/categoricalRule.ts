import {Attribute, Instance} from '../';

export class CategoricalRule {

    private _attribute: Attribute;
    private  _splitMap: Map<string, Array<Instance>>;

    constructor(attribute: Attribute) {
        this._attribute = attribute;
        this._splitMap = new Map<string, Array<Instance>>();
        this._attribute.uniqueValues.forEach((value) => {
            this._splitMap.set(value.toString(), new Array<Instance>());
        });
    }

    public split(list: Array<Instance>): Map<string, Array<Instance>> {
        list.forEach((instance) => {
            const value = instance.getAttributeValue(this._attribute.name).toString();
            this._splitMap.get(value).push(instance);
        });
        return this._splitMap;
    }

    public print() {
        console.log('Split on ' + this._attribute.name);
    }
}
