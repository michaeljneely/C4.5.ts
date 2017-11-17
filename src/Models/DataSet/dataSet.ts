import {readFileSync} from 'fs-extra';
import {homedir} from 'os';
import {resolve} from 'path';
import {Entropy, IGain, InformationGain} from '../../Calculations/';
import {shuffleArray} from '../../Utils';
import {Attribute} from '../Attribute';
import {Instance} from '../Instance';
import {ISchema} from '../Schema';
import {Type} from '../Type';

export class DataSet {

    private _dataPath: string;
    private _schemaPath: string;
    private _percentageSplit: number;
    private _attributes: Array<Attribute>;
    private _instances: Array<Instance>;
    private _training: Array<Instance>;
    private _testing: Array<Instance>;
    private _target: Attribute;
    private _testingValueMap: Map<Attribute, Array<Instance>>;
    private _trainingValueMap: Map<Attribute, Array<Instance>>;

    constructor(dataPath: string, schemaPath: string, target: string, percentageSplit: number) {
        if (percentageSplit < 0 || percentageSplit > 100) {
            throw new RangeError('Percentage Split must be between 0 and 100');
        }
        this._dataPath = resolve(dataPath);
        this._schemaPath = resolve(schemaPath);
        this._percentageSplit = percentageSplit;
        this._attributes = this.initializeAttributeList(schemaPath);
        this._instances = this.initializeInstanceList(dataPath);
        this.splitData(this._instances, percentageSplit);
        this.setUniqueValues();
        this._target = this.setTarget(target);
        this.stripTarget();
        this._testingValueMap = new Map<Attribute, Array<Instance>>();
        this._trainingValueMap = new Map<Attribute, Array<Instance>>();
        this.sortInstances();
    }

    /**
     * Get Testing Instances Sorted on Attribute
     *
     * @param {Array<Instance>} list List of instances
     * @param {Attribute} attribute Sorting Attribute
     * @returns {Array<Instance>} Sorted instances
     *
     */
    public getTestingInstancesSortedByAttribute(attribute: Attribute): Array<Instance> {
        return this._testingValueMap.get(attribute);
    }

    /**
     * Get Training Instances Sorted on Attribute
     *
     * @param {Array<Instance>} list List of instances
     * @param {Attribute} attribute Sorting Attribute
     * @returns {Array<Instance>} Sorted instances
     *
     */
    public getTrainingInstancesSortedByAttribute(attribute: Attribute): Array<Instance> {
        return this._trainingValueMap.get(attribute);
    }

    /**
     * Sorted List of Instances on an Attribute
     *
     * @param {Array<Instance>} list List of instances
     * @param {Attribute} attribute Sorting Attribute
     * @returns {Array<Instance>} Sorted instances
     *
     */
    public sortListByAttribute(list: Array<Instance>, attribute: Attribute): Array<Instance> {
        const sortedInstances = list.slice();
        if (attribute.type === Type.CATEGORICAL) {
            return sortedInstances.sort(Instance.categoricalComparator(attribute));
        } else {
            return sortedInstances.sort(Instance.numericComparator(attribute));
        }
    }

    /**
     * See if a List of Instances is Unanimous for a Target Attribute
     *
     * @param {Array<Instance>} list List of instances
     * @param {Attribute} target Target attribute
     * @returns {string} Unanimous value or 'false'
     *
     */
    public unanimousClass(list: Array<Instance>, target: Attribute): string {
        const value: any = list[0].getAttributeValue(target.name).toString();
        const unanimous: boolean = list.every((val) => val.getAttributeValue(target.name).toString() === value);
        return (value && unanimous) ? value.toString() : 'false';
    }

    /**
     * Get Majority Target Label for a List of Instances
     *
     * @param {Array<Instance>} list List of instances
     * @param {Attribute} target Target attribute
     * @returns {string} majority target label
     *
     */
    public majorityClass(list: Array<Instance>, target: Attribute): string {
        const countMap: Map<string, number> = new Map<string, number>();
        let maxCount: number = 0;
        let majorityClass: string = null;
        target.uniqueValues.forEach((value: string) => {
            countMap.set(value, 0);
        });
        list.forEach((instance: Instance) => {
            const value: any = instance.getAttributeValue(target.name);
            if (countMap.has(value)) {
                countMap.set(value, countMap.get(value) + 1);
            }
        });
        countMap.forEach((count: number, key: string) => {
            if (count > maxCount) {
                maxCount = count;
                majorityClass = key;
            }
        });
        return majorityClass;
    }

    /**
     * Initialize Attributes from JSON Schema
     *
     * @param {string} schemaPath Path to JSON schemas
     * @returns {Array<Attribute>} Initialized attributes
     *
     */
    private initializeAttributeList(schemaPath: string): Array<Attribute> {
        const rawSchema: ISchema = JSON.parse(readFileSync(this._schemaPath, 'utf8')) as ISchema;
        return rawSchema.attributes.map((attribute: Attribute) => {
            return new Attribute(attribute.name, attribute.type);
        });
    }

    /**
     * Initialize Instances from CSV File
     *
     * @param {string} dataPath Path to file
     * @returns {Array<Instance>} Initialized instances
     *
     */
    private initializeInstanceList(dataPath: string): Array<Instance> {
        const rawInstances: Array<string> = readFileSync(this._dataPath, 'utf8').replace(/[\r]/g, '').trim().split('\n');
        return rawInstances.map((instance: string) => {
            return new Instance(instance, this._attributes);
        });
    }

    /**
     * Set the Target Attribute for the Data Set
     *
     * @param {string} target Target attribute name
     * @returns {Attribute} Target Attribute
     *
     */
    private setTarget(target: string): Attribute {
        const found: Attribute = this._attributes.find((attribute) => attribute.name === target);
        if (!found ) {
            throw new TypeError('Target Not Found in Attribute List');
        }
        return found;
    }

    /**
     * Remove Target from Attributes
     *
     */
    private stripTarget(): void {
        const index: number = this._attributes.findIndex((attr) => attr === this.target);
        this._attributes.splice(index, 1);
    }

    /**
     * Set Unique Values for Attributes
     *
     */
    private setUniqueValues(): void {
        this._attributes.forEach((attribute: Attribute) => {
            attribute.addUniqueValues(this._testing);
            attribute.addUniqueValues(this._training);
        });
    }

    /**
     * Sort Training and Testing Instances
     *
     */
    private sortInstances(): void {
        this._attributes.forEach((attribute: Attribute) => {
            this._testingValueMap.set(attribute, this.sortInstancesByAttribute(attribute, 'testing'));
            this._trainingValueMap.set(attribute, this.sortInstancesByAttribute(attribute, 'training'));
        });
    }

    /**
     * Sort List of Instances By Attribute
     *
     * @param {Attribute} attribute Sorting attribute
     * @param {string} section Either 'testing' or 'training' instance lists
     *
     */
    private sortInstancesByAttribute(attribute: Attribute, section: 'testing' | 'training'): Array<Instance> {
        const sortedInstances = (section === 'testing') ? this._testing.slice() : this._training.slice();
        if (attribute.type === Type.CATEGORICAL) {
            return sortedInstances.sort(Instance.categoricalComparator(attribute));
        } else {
            return sortedInstances.sort(Instance.numericComparator(attribute));
        }
    }

    /**
     * Split Data into Training and Testing Sets
     *
     * @param {Array<Instance>} list Instance list
     * @param {number} percentageSplit Training/Test split
     *
     */
    private splitData(list: Array<Instance>, percentageSplit: number): void {
        const splitPoint: number = Math.floor(((list.length * percentageSplit) / 100));
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

    public get dataPath(): string {
        return this._dataPath;
    }

    public get percentageSplit(): number {
        return this._percentageSplit;
    }

}
