import {Attribute, Instance} from '../';

export class PredictionRule {

    private _target: Attribute;
    private _condition: string;
    private _label: string;
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

    public predict() {
        return this._label;
    }

    public print (): string {
      return `Condition: ${this._condition}, Choose: ${this._label}, Num Reaching: ${this._instances.length}`;
    }

    public classify(instance: Instance): boolean {
        return (this._label === instance.getAttributeValue(this._target.name).toString());
    }

    public get splitMap() {
        return this._splitMap;
    }

    public get condition() {
        return this._condition;
    }
}
