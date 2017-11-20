import {Attribute, Instance} from '../';

export class PredictionRule {

    public _label: string;
    private _target: Attribute;
    private _condition: string;
    private _instances: Array<Instance>;
    private _splitMap: any;

    constructor(target: Attribute, condition: string, label: string, instances: Array<Instance>) {
        this._target = target;
        this._condition = condition;
        this._splitMap = null;
        const found = this._target.uniqueValues.find((value) => value.toString() === label);
        if (!found) {
            throw new Error('Label not found in target');
        }
        this._label = found;
        this._instances = instances;
    }

    /**
     * Print Out Information on this Rule
     *
     */
    public print (): string {
      return `Condition: ${this._condition}, Choose: ${this._label} ${this.results()}`;
    }

    /**
     * Classify an Instance
     *
     */
    public classify(instance: Instance): boolean {
        return (this._label === instance.getAttributeValue(this._target.name).toString());
    }

    public get splitMap() {
        return this._splitMap;
    }

    public get condition() {
        return this._condition;
    }

    public get attribute() {
        return this._target;
    }

    public get label() {
        return this._label;
    }

    public get instances() {
        return this._instances;
    }

    public set instances(list: Array<Instance>) {
        this._instances = list;
    }

    public addInstance(instance: Instance) {
        this._instances.push(instance);
    }

    /**
     * Get a String Representation of the Rule's Performance
     * @returns {string} (correct / incorrect)
     *
     */
    private results(): string {
        let numRight = 0;
        let numWrong = 0;
        this._instances.forEach((instance: Instance) => {
            if (this.classify(instance)) {
                numRight++;
            } else {
                numWrong++;
            }
        });
        return `(${numRight}/${numWrong})`;
    }
}
