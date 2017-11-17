import {Instance} from '../Instance';
import {Type} from '../Type';

export class Attribute {

    /**
     * Get the Number of Instances in a List with a Specified Attribute Value
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute Specified attribute
     * @param {any} value Specified attribute value
     * @returns {number} Number of instances with that attribute value
     *
     */
    public static getNumInstancesWithAttributeValue(list: Array<Instance>, attribute: Attribute, value: any): number {
        const found: Array<Instance> = list.filter((instance: Instance) => {
            let instanceValue: any = instance.getAttributeValue(attribute.name);
            if (attribute.type === Type.CATEGORICAL) {
                instanceValue = instanceValue.toString();
                value = value.toString();
            } else {
                instanceValue = parseFloat(instanceValue);
                value = parseFloat(value);
            }
            return instanceValue === value;
        });
        return found.length;
    }

    /**
     * Calculates the Candidate Split Points on a List of Instances Sorted by Particular Attributes Values
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute Specified attribute
     * @returns {Array<number>} Array of candidate split values
     *
     */
    public static candidateSplitValues(list: Array<Instance>, attribute: Attribute): Array<number> {
        const candidateSplits: Array<number> = new Array<number>();
        for (let i: number = 0; i < list.length - 1; i++) {
            const val1: number = parseFloat(list[i].getAttributeValue(attribute.name));
            const val2: number = parseFloat(list[i + 1].getAttributeValue(attribute.name));
            if (val1 !== val2) {
                candidateSplits.push(i);
            }
        }
        return candidateSplits;
    }

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

    /**
     * Add Unique Values from a List of Instances to the Attribute's Unique Value List
     *
     * @param {Array<Instance>} list The list of instances
     *
     */
    public addUniqueValues(list: Array<Instance>): void {
        list.forEach((instance: Instance) => {
            this.addValue(instance.getAttributeValue(this._name));
        });
    }

    /**
     * See if a Particular Value is Unique for the Attribute
     *
     * @param {any} value Specified values
     * @returns {boolean} True or False
     *
     */
    public isUniqueValue(value: any): boolean {
        return (this._uniqueValues.indexOf(value) === -1) as boolean;
    }

    /**
     * Add Value to an Attribute's Unique Value List if Possible and Maintain Sort
     *
     * @param {any} value Specified value
     *
     */
    private addValue(value: any): void {
        if (this.isUniqueValue(value)) {
            this._uniqueValues.push(value);
            if (this._type === Type.NUMERIC) {
                this._uniqueValues.sort(this.numericComparator);
            } else {
                this._uniqueValues.sort();
            }
        }
    }

    /**
     * Numeric Comparator for Sorting
     *
     * @param {number} a First number
     * @param {number} a Second number
     * @returns {number} 1 -> A is greater than B, -1 -> A is less than B, 0 -> A equals B
     *
     */
    private numericComparator(a: number, b: number): number {
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        }
        return 0;
    }
}
