import {Attribute, DataSet, Instance, Type} from '../../Models/';
import {logBaseN} from '../../Utils';

export class Entropy {

    /**
     * Calculates the Entropy From Splitting Instances on a Value of a Categorical Attribute, Given a Target Attributes
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting attribute
     * @param {String} val The attribute value
     * @param {Attribute} target The target attribute for the classifer
     * @returns {number} Entropy value
     *
     */
    public static categoricalEntropy(list: Array<Instance>, attribute: Attribute, target: Attribute, val: string = null): number {
        const listSize: number = list.length;
        if (listSize === 0) {
            return 0.0;
        }
        const targetOccurences = new Map<string, number>();
        let sum = 0;
        let entropy = 0;
        target.uniqueValues.forEach((label: string) => {
            targetOccurences.set(label, 0);
        });
        list.forEach((instance) => {
            if (val) {
                if (instance.getAttributeValue(attribute.name) === val) {
                    const label = instance.getAttributeValue(target.name);
                    targetOccurences.set(label, targetOccurences.get(label) + 1);
                    sum++;
                }
            } else {
                const label = instance.getAttributeValue(target.name);
                targetOccurences.set(label, targetOccurences.get(label) + 1);
                sum++;
            }
        });
        targetOccurences.forEach((count: number) => {
            const proportion = count / sum;
            entropy += (proportion * -1) * (logBaseN(proportion, 2));
        });
        return entropy;
    }

    /**
     * Calculates the Entropy From Splitting Instances on a Threshold of a Numeric Attribute, Given a Target Attributes
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting attribute
     * @param {Attribute} target The target attribute for the classifer
     * @param {number} treshold The threshold value
     * @returns {number} Entropy value
     *
     */
    public static numericEntropy(list: Array<Instance>, attribute: Attribute, target: Attribute, threshold: number = 0 ): number {
        const listSize: number = list.length;
        if (listSize === 0) {
            return 0.0;
        }
        const lessThanEqual = new Map<string, number>();
        const greaterThan = new Map<string, number>();
        let lessThanEqualSize = 0;
        let greaterThanSize = 0;
        let entropyOne = 0;
        let entropyTwo = 0;
        target.uniqueValues.forEach((label: string) => {
            lessThanEqual.set(label, 0);
            greaterThan.set(label, 0);
        });
        list.forEach((instance) => {
            const value = parseFloat(instance.getAttributeValue(attribute.name));
            const label = instance.getAttributeValue(target.name);
            if (value <= threshold) {
                lessThanEqual.set(label, lessThanEqual.get(label) + 1);
                lessThanEqualSize++;
            } else {
                greaterThan.set(label, greaterThan.get(label) + 1);
                greaterThanSize++;
            }
        });
        lessThanEqual.forEach((count: number) => {
            const proportion = (count / lessThanEqualSize) || 0;
            entropyOne += ((proportion * -1) * (logBaseN(proportion, 2)));
        });
        greaterThan.forEach((count: number) => {
            const proportion = (count / greaterThanSize) || 0;
            entropyTwo += ((proportion * -1) * (logBaseN(proportion, 2)));
        });
        return ((lessThanEqualSize / list.length) * entropyOne) +  ((greaterThanSize / list.length) * entropyTwo);
    }

    public static getNumInstancesWithAttributeValue(list: Array<Instance>, attribute: Attribute, value: any): number {
        const found = list.filter((instance: Instance) => {
            let instanceValue = instance.getAttributeValue(attribute.name);
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

    public static splitEntropy(list: Array<Instance>, attribute: Attribute): number {
        let splitEntropy: number = 0;
        if (list.length !== 0) {
            attribute.uniqueValues.forEach((value) => {
                const proportion =  this.getNumInstancesWithAttributeValue(list, attribute, value) / list.length;
                splitEntropy += (-1 * proportion * logBaseN(proportion, 2));
            });
        }
        return splitEntropy;
    };
}
