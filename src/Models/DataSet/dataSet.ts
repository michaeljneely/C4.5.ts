import {readFileSync} from 'fs';
import {homedir} from 'os';
import {join} from 'path';
import {Entropy} from '../../Calculations/Entropy';
import {IGain, InformationGain} from '../../Calculations/InformationGain';
import {shuffleArray} from '../../Utils';
import {Attribute} from '../Attribute';
import {Instance} from '../Instance';
import {ISchema} from '../Schema';
import {Type} from '../Type';

export class DataSet {

    private _attributes: Array<Attribute>;
    private _instances: Array<Instance>;
    private _training: Array<Instance>;
    private _testing: Array<Instance>;
    private _target: Attribute;
    private _testingValueMap: Map<Attribute, Array<Instance>>;
    private _trainingValueMap: Map<Attribute, Array<Instance>>;

    constructor(dataPath: string, schemaPath: string, target: string, percentageSplit: number) {
        if (percentageSplit < 0 || percentageSplit > 100) {
            throw new TypeError('Percentage Split must be between 0 and 100');
        }
        this._attributes = this.initializeAttributeList(schemaPath);
        this._instances = this.initializeInstanceList(dataPath);
        this.splitData(this._instances, percentageSplit);
        this.setUniqueValues();
        this.setValues();
        this._target = this.setTarget(target);
        this.stripTarget();
        this._testingValueMap = new Map<Attribute, Array<Instance>>();
        this._trainingValueMap = new Map<Attribute, Array<Instance>>();
        this.sortInstances();
    }

    public getTestingInstancesSortedByAttribute(attribute: Attribute): Array<Instance> {
        return this._testingValueMap.get(attribute);
    }

    public getTrainingInstancesSortedByAttribute(attribute: Attribute): Array<Instance> {
        return this._trainingValueMap.get(attribute);
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
            attribute.setUniqueValues(this._testing);
            attribute.setUniqueValues(this._training);
        });
    }

    private setValues(): void {
        this._attributes.forEach((attribute: Attribute) => {
            attribute.setUniqueValues(this._testing);
            attribute.setUniqueValues(this._training);
        });
    }

    private sortInstances(): void {
        this._attributes.forEach((attribute: Attribute) => {
            this._testingValueMap.set(attribute, this.sortTestingInstancesByAttribute(attribute));
            this._trainingValueMap.set(attribute, this.sortTrainingInstancesByAttribute(attribute));
        });
    }

    private sortTestingInstancesByAttribute(attribute: Attribute): Array<Instance> {
        const sortedInstances = this._testing.slice();
        if (attribute.type === Type.CATEGORICAL) {
            return sortedInstances.sort(Instance.categoricalComparator(attribute));
        } else {
            return sortedInstances.sort(Instance.numericComparator(attribute));
        }
    }

    private sortTrainingInstancesByAttribute(attribute: Attribute): Array<Instance> {
        const sortedInstances = this._training.slice();
        if (attribute.type === Type.CATEGORICAL) {
            return sortedInstances.sort(Instance.categoricalComparator(attribute));
        } else {
            return sortedInstances.sort(Instance.numericComparator(attribute));
        }
    }

    private splitData(list: Array<Instance>, percentageSplit: number): void {
        const splitPoint = Math.floor(((list.length * percentageSplit) / 100));
        list = shuffleArray(list);
        this._training = list.slice(0, splitPoint);
        this._testing = list.slice(splitPoint, list.length);
    }

    public get attributes(): Array<Attribute> {
        return this._attributes;
    }

    public get instances(): Array<Instance> {
        return this._instances;
    }

    public get trainingInstances(): Array<Instance> {
        return this._training;
    }

    public get testingInstances(): Array<Instance> {
        return this._testing;
    }

    public get target(): Attribute {
        return this._target;
    }

}
