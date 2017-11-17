import {Attribute, Instance} from '../../Models/';
import {Entropy} from '../Entropy';

export class InformationGain {

    /**
     * Calculates the Information Gain From Splitting Instances on a Value of a Categorical Attribute, Given a Target Attribute
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting CATEGORICAL attribute
     * @param {Attribute} target The target attribute for the classifer
     * @returns {number} Information Gain
     *
     */
    public static categoricalInformationGain(list: Array<Instance>, attribute: Attribute, target: Attribute): number {
        if (list.length === 0) {
            return 0;
        }
        let priorEntropy: number = Entropy.attributeEntropy(list, target);
        attribute.uniqueValues.forEach((value: any) => {
            const entropy: number = Entropy.categoricalEntropy(list, attribute, target, value);
            const proportion: number = (Attribute.getNumInstancesWithAttributeValue(list, attribute, value) / list.length);
            priorEntropy -= (proportion * entropy);
        });
        return priorEntropy;
    }

    /**
     * Calculates the Information Gain Ratio From Splitting Instances on a Value of a Categorical Attribute, Given a Target Attribute
     * The Normalized information gain using the intrinsic value of the attribute
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting CATEGORICAL attribute
     * @param {Attribute} target The target attribute for the classifer
     * @returns {number} Information Gain Ratio
     *
     */
    public static categoricalInformationGainRatio(list: Array<Instance>, attribute: Attribute, target: Attribute): number {
        const informationGain: number = this.categoricalInformationGain(list, attribute, target);
        return ( (informationGain / Entropy.attributeEntropy(list, attribute)) || 0 );
    }

    /**
     * Calculates the Highest Information Gain From Splitting Instances on Thresholds of a Numeric Attribute, Given a Target Attribute
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting NUMERIC attribute
     * @param {Attribute} target The target attribute for the classifer
     * @returns {IGain} The highest information gain and split value
     *
     */
    public static numericInformationGain(list: Array<Instance>, attribute: Attribute, target: Attribute): IGain {
        if (list.length === 0) {
            return {
                maxGain: 0,
                splitValue: 0,
            };
        }
        const priorEntropy: number = Entropy.attributeEntropy(list, target);
        let maxGain: number = -1;
        let splitValue: number = 0;
        const candidateSplits: Array<number> = Attribute.candidateSplitValues(list, attribute);
        candidateSplits.forEach((index: number) => {
            const value: any = list[index].getAttributeValue(attribute.name);
            const entropy: number = Entropy.numericEntropy(list, attribute, target, value);
            const delta: number = priorEntropy - entropy;
            if (delta  > maxGain) {
                maxGain = delta;
                splitValue = value;
            }
        });
        return {maxGain, splitValue};
    }

    /**
     * Calculates the Information Gain Ratio From Splitting Instances on Thresholds of a Numeric Attribute, Given a Target Attribute
     * The Normalized information gain using the intrinsic value of the attribute
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting NUMERIC attribute
     * @param {Attribute} target The target attribute for the classifer
     * @returns {IGAIN} The highest information gain ratio and split value
     *
     */
    public static numericInformationGainRatio(list: Array<Instance>, attribute: Attribute, target: Attribute): IGain {
        const informationGain: IGain = this.numericInformationGain(list, attribute, target);
        const splitValue: number = informationGain.splitValue;
        let maxGain: number = informationGain.maxGain;
        const splitEntropy: number = Entropy.attributeEntropy(list, attribute);
        maxGain = (splitEntropy === 0) ? 0 : (maxGain / splitEntropy);
        return {maxGain, splitValue};
    };

}

export interface IGain {
    maxGain: number;
    splitValue: number;
}
