import {Attribute} from '../../Models/Attribute';
import {Instance} from '../../Models/Instance';
import {Type} from '../../Models/Type';
import {logBaseN} from '../../Utils';
import {Entropy} from '../Entropy';

export class InformationGain {

    public static calcInformationGainCategorical(list: Array<Instance>, attribute: Attribute, target: Attribute): number {
        if (list.length === 0) {
            return 0;
        }
        let priorEntropy = Entropy.categoricalEntropy(list, attribute, target);
        attribute.uniqueValues.forEach((value) => {
            const entropy = Entropy.categoricalEntropy(list, attribute, target, value);
            const proportion = (Entropy.getNumInstancesWithAttributeValue(list, attribute, value) / list.length);
            priorEntropy -= (proportion * entropy);
        });
        return priorEntropy;
    }

    public static calcInformationGainNumeric(list: Array<Instance>, attribute: Attribute, target: Attribute): IGain {
        if (list.length === 0) {
            return {
                maxGain: 0,
                splitValue: 0,
            };
        }
        const priorEntropy = Entropy.numericEntropy(list, attribute, target);
        let maxGain: number = -1;
        let splitValue: number = 0;
        const candidateSplits = InformationGain.calcSplitPoints(list, attribute);
        candidateSplits.forEach((index: number) => {
            const value = list[index].getAttributeValue(attribute.name);
            const entropy = Entropy.numericEntropy(list, attribute, target, value);
            const delta = priorEntropy - entropy;
            if (delta  > maxGain) {
                maxGain = delta;
                splitValue = value;
            }
        });
        return {maxGain, splitValue};
    }

    public static InformationGainRatioNumeric(list: Array<Instance>, attribute: Attribute, target: Attribute): IGain {
        const informationGain = this.calcInformationGainNumeric(list, attribute, target);
        const splitValue = informationGain.splitValue;
        let maxGain  = informationGain.maxGain;
        const splitEntropy = Entropy.splitEntropy(list, attribute);
        maxGain = (splitEntropy === 0) ? 0 : (maxGain / splitEntropy);
        return {maxGain, splitValue};
    };

    public static InformationGainRatioCategorical(list: Array<Instance>, attribute: Attribute, target: Attribute): number {
        const informationGain = this.calcInformationGainCategorical(list, attribute, target);
        const maxGain =  informationGain / Entropy.splitEntropy(list, attribute);
        return maxGain;
    }

    // Calculate the Split Points on a List of Instances Sorted By particular Attributes Values
    private static calcSplitPoints(list: Array<Instance>, attribute: Attribute): Array<number> {
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

}

export interface IGain {
    maxGain: number;
    splitValue: number;
}
