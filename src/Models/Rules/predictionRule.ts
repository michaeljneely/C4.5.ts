import {Attribute, Instance} from '../';

export class PredictionRule {

    private _target: Attribute;
    private _label: string;

    constructor(target: Attribute, label: string) {
        this._target = target;
        const found = this._target.uniqueValues.find((value) => value.toString() === label);
        if (!found) {
            throw new Error('Label not found in target');
        }
        this._label = found;
    }

    public predict() {
        return this._label;
    }

    public print () {
        console.log('Choose ' + this._label);
    }
}
