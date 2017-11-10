import {readFileSync} from 'fs';
import {homedir} from 'os';
import {join} from 'path';
import {Entropy} from '../../Calculations/Entropy';
import {IGain, InformationGain} from '../../Calculations/InformationGain';
import {Attribute} from '../Attribute';
import {Instance} from '../Instance';
import {ISchema} from '../Schema';
import {Type} from '../Type';

export class DataSet {

    private _attributes: Array<Attribute>;
    private _instances: Array<Instance>;
    private _target: Attribute;
    private _valueMap: Map<Attribute, Array<Instance>>;

    constructor(dataPath: string, schemaPath: string, target: string) {
        this._attributes = this.initializeAttributeList(schemaPath);
        this._instances = this.initializeInstanceList(dataPath);
        this.setUniqueValues();
        this.setValues();
        this._target = this.setTarget(target);
        this.stripTarget();
        this._valueMap = new Map<Attribute, Array<Instance>>();
        this.sortInstances();
    }

    public getInstancesSortedByAttribute(attribute: Attribute): Array<Instance> {
        return this._valueMap.get(attribute);
    }

    public sortListByAttribute(list: Array<Instance>, attribute: Attribute) {
        const sortedInstances = list.slice();
        if (attribute.type === Type.CATEGORICAL) {
            return sortedInstances.sort(Instance.categoricalComparator(attribute));
        } else {
            return sortedInstances.sort(Instance.numericComparator(attribute));
        }
    }

    public unanimousClass(list: Array<Instance>, target: Attribute): string {
        const a = list[0].getAttributeValue(target.name).toString();
        const b = list.every((val) => val.getAttributeValue(target.name).toString() === a);
        return (a && b) ? a.toString() : 'false';
    }

    public majorityClass(list: Array<Instance>, target: Attribute): string {
        const countMap = new Map<string, number>();
        const unknownClasses = new Array<string>();
        let maxCount: number = 0;
        let majorityClass: string = null;
        target.uniqueValues.forEach((value: string) => {
            countMap.set(value, 0);
        });
        list.forEach((instance) => {
            const value = instance.getAttributeValue(target.name);
            if (countMap.has(value)) {
                countMap.set(value, countMap.get(value) + 1);
            }
        });
        countMap.forEach((count, key) => {
            if (count > maxCount) {
                maxCount = count;
                majorityClass = key;
            }
        });
        return majorityClass;
    }

    private initializeAttributeList(schemaPath: string): Array<Attribute> {
        const rawSchema = JSON.parse(readFileSync(join(homedir(), schemaPath), 'utf8')) as ISchema;
        return rawSchema.attributes.map((attribute: Attribute) => {
            return new Attribute(attribute.name, attribute.type);
        });
    }

    private initializeInstanceList(dataPath: string): Array<Instance> {
        const rawInstances = readFileSync(join(homedir(), dataPath), 'utf8').replace(/[\r]/g, '').trim().split('\n');
        return rawInstances.map((instance: string) => {
            return new Instance(instance, this._attributes);
        });
    }

    private setTarget(target: string): Attribute {
        const found = this._attributes.find((attribute) => attribute.name === target);
        if (!found ) {
            throw new TypeError('Target Not Found in Attribute List');
        }
        return found;
    }

    private stripTarget(): void {
        const a = this._attributes.findIndex((attr) => attr === this.target);
        this._attributes.splice(a, 1);
    }

    private setUniqueValues(): void {
        this._attributes.forEach((attribute: Attribute) => {
            attribute.setUniqueValues(this._instances);
        });
    }

    private setValues(): void {
        this._attributes.forEach((attribute: Attribute) => {
            attribute.setValues(this._instances);
        });
    }

    private sortInstances(): void {
        this._attributes.forEach((attribute: Attribute) => {
            this._valueMap.set(attribute, this.sortInstanceByAttribute(attribute));
        });
    }

    private sortInstanceByAttribute(attribute: Attribute): Array<Instance> {
        const sortedInstances = this._instances.slice();
        if (attribute.type === Type.CATEGORICAL) {
            return sortedInstances.sort(Instance.categoricalComparator(attribute));
        } else {
            return sortedInstances.sort(Instance.numericComparator(attribute));
        }
    }

    public get attributes(): Array<Attribute> {
        return this._attributes;
    }

    public get instances(): Array<Instance> {
        return this._instances;
    }

    public get target(): Attribute {
        return this._target;
    }

}
