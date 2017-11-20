import {Attribute, Instance} from '../';

export class CategoricalRule {

    private _attribute: Attribute;
    private _condition: string;
    private  _splitMap: Map<string, Array<Instance>>;

    constructor(attribute: Attribute, condition: string) {
        this._attribute = attribute;
        this._condition = condition;
        this._splitMap = new Map<string, Array<Instance>>();
        this._attribute.uniqueValues.forEach((value) => {
            this._splitMap.set(value.toString(), new Array<Instance>());
        });
    }

    /**
     * Split Instances on the Categorical Attribute
     *
     * @param {Array<Instance>} list List of instances
     * @returns {Map<string, Array<Instance>>} Map of unique values to instance sublists
     *
     */
    public split(list: Array<Instance>): Map<string, Array<Instance>> {
        list.forEach((instance) => {
            const value = instance.getAttributeValue(this._attribute.name).toString();
            this._splitMap.get(value).push(instance);
        });
        return this._splitMap;
    }

    /**
     * Print Out Information on this Rule
     *
     */
    public print(): string {
        const prepend = (this._condition) ? `Condition: ${this._condition}, ` : ``;
        return `${prepend}Split on Categorical Attribute: ${this._attribute.name}`;
    }

    public get attribute() {
        return this._attribute;
    }

    public get condition() {
        return this._condition;
    }

    public get splitMap() {
        return this._splitMap;
    }
}
