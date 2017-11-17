import {Attribute, Instance, Type} from '../../Models/';
import {logBaseN} from '../../Utils';

export class Entropy {

    /**
     * Calculates the Entropy From Splitting Instances on a Value of a Categorical Attribute, Given a Target Attribute
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting  CATEGORICAL attribute
     * @param {String} val The attribute value
     * @param {Attribute} target The target attribute for the classifer
     * @returns {number} Entropy value
     *
     */
    public static categoricalEntropy(list: Array<Instance>, attribute: Attribute, target: Attribute, val: string): number {
        const listSize: number = list.length;
        if (listSize === 0) {
            return 0;
        }
        const targetOccurences: Map<string, number> = new Map<string, number>();
        let sum: number = 0;
        let entropy: number = 0;
        target.uniqueValues.forEach((label: string) => {
            targetOccurences.set(label.toString(), 0);
        });
        list.forEach((instance: Instance) => {
            if (instance.getAttributeValue(attribute.name).toString().toLowerCase() === val.toLowerCase()) {
                const label: string = instance.getAttributeValue(target.name).toString();
                targetOccurences.set(label, targetOccurences.get(label) + 1);
                sum++;
            }
        });
        targetOccurences.forEach((count: number) => {
            const proportion: number = (count / sum) || 0;
            entropy += (proportion * -1) * (logBaseN(proportion, 2));
        });
        return entropy;
    }

    /**
     * Calculates the Entropy From Splitting Instances on a Threshold of a Numeric Attribute, Given a Target Attribute
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting NUMERIC attribute
     * @param {Attribute} target The target attribute for the classifer
     * @param {number} treshold The threshold value
     * @returns {number} Entropy value
     *
     */
    public static numericEntropy(list: Array<Instance>, attribute: Attribute, target: Attribute, threshold: number): number {
        const listSize: number = list.length;
        if (listSize === 0) {
            return 0;
        }
        const lessThanEqual: Map<string, number> = new Map<string, number>();
        const greaterThan: Map<string, number> = new Map<string, number>();
        let lessThanEqualSize: number = 0;
        let greaterThanSize: number = 0;
        let entropyOne: number = 0;
        let entropyTwo: number = 0;
        target.uniqueValues.forEach((label: string) => {
            lessThanEqual.set(label, 0);
            greaterThan.set(label, 0);
        });
        list.forEach((instance: Instance) => {
            const value: number = parseFloat(instance.getAttributeValue(attribute.name));
            const label: string = instance.getAttributeValue(target.name).toString();
            if (value <= threshold) {
                lessThanEqual.set(label, lessThanEqual.get(label) + 1);
                lessThanEqualSize++;
            } else {
                greaterThan.set(label, greaterThan.get(label) + 1);
                greaterThanSize++;
            }
        });
        lessThanEqual.forEach((count: number) => {
            const proportion: number = (count / lessThanEqualSize) || 0;
            entropyOne += ((proportion * -1) * (logBaseN(proportion, 2)));
        });
        greaterThan.forEach((count: number) => {
            const proportion: number = (count / greaterThanSize) || 0;
            entropyTwo += ((proportion * -1) * (logBaseN(proportion, 2)));
        });
        return ((lessThanEqualSize / list.length) * entropyOne) +  ((greaterThanSize / list.length) * entropyTwo);
    }

    /**
     * Calculates the Entropy From Splitting Instances on all Outcomes of an Attribute
     *
     * @param {Array<Instance>} list The list of instances
     * @param {Attribute} attribute The splitting attribute
     * @returns {number} Entropy value
     *
     */
    public static attributeEntropy(list: Array<Instance>, attribute: Attribute): number {
        let splitEntropy: number = 0;
        if (list.length !== 0) {
            attribute.uniqueValues.forEach((value: any) => {
                const proportion: number =  Attribute.getNumInstancesWithAttributeValue(list, attribute, value) / list.length;
                splitEntropy += (-1 * proportion * logBaseN(proportion, 2));
            });
        }
        return splitEntropy;
    };

}
