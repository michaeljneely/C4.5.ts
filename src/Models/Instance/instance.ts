import {Attribute} from '../Attribute';
import {Type} from '../Type';

export class Instance {

    public static categoricalComparator = (attribute: Attribute) => {
        return (i1: Instance, i2: Instance): number => {
            const val1 = i1.getAttributeValue(attribute.name) as string;
            const val2 = i2.getAttributeValue(attribute.name) as string;
            return val1.localeCompare(val2);
        };
    }

    public static numericComparator = (attribute: Attribute) => {
        return (i1: Instance, i2: Instance): number => {
            const val1 = parseFloat(i1.getAttributeValue(attribute.name));
            const val2 = parseFloat(i2.getAttributeValue(attribute.name));
            if (val1 > val2) {
                return 1;
            } else if (val1 < val2) {
                return -1;
            } else {
                return 0;
            }
        };
    }

    private static _nextInstanceNumber: number = 0;

    private _data: InstanceAttributeMap;
    private _number: number;

    constructor(data: string, attributes: Array<Attribute>) {
        this._data = this.initializeInstance(data, attributes);
        this._number = Instance._nextInstanceNumber;
        Instance._nextInstanceNumber++;
    }

    public initializeInstance(data: string, attributes: Array<Attribute>): InstanceAttributeMap {
        const instanceMap = new Map<string, any>();
        const values: Array<string> = data.split(',').filter(Boolean); // only include truthy values
        if (values.length !== attributes.length) {
            throw new TypeError('Number Of Attributes Does Not Match Values in Row');
        }
        for (let i = 0; i < values.length; i++) {
            instanceMap.set(attributes[i].name, values[i]);
        }
        return instanceMap;
    }

    public getAttributeValue(name: string): any {
        return this._data.get(name);
    }

    public get number(): number {
        return this._number;
    }
}

export type InstanceAttributeMap = Map<string, any>;
