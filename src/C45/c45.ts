import {Entropy, IGain, InformationGain} from '../Calculations';
import {Attribute, CategoricalRule, DataSet, DecisionTree, Instance, InstanceAttributeMap, NumericRule, PredictionRule, Rule, Type} from '../Models';

export class C45 {

    private _dataSet: DataSet;
    private _decisionTree: DecisionTree;
    private _results: Array<ITestResult>;
    private _numCorrect: number;
    private _accuracy: number;

    constructor(dataSet: DataSet) {
        this._dataSet = dataSet;
        this._decisionTree = new DecisionTree(null, null, null);
        this._results = new Array<ITestResult>();
    }

    /**
     * Train - Build Decision Tree
     *
     * @param {Array<Instance>} list Training Instances
     * @param {Attribute} target Attribute to classify
     * @returns {string} Predicted classification
     *
     */
    public train(list: Array<Instance> = this._dataSet.trainingInstances, target: Attribute = this._dataSet.target) {
        this.buildDecisionTree(list, this._dataSet.attributes, target, this._decisionTree);
    }

    /**
     * Test - Evaluate Performance
     *
     * @returns {Array<ITestResult>} Test results
     *
     */
    public test(): Array<ITestResult> {
        const results: Array<ITestResult> = new Array<ITestResult>();
        this._dataSet.testingInstances.forEach((instance: Instance) => {
            const predicted: string = this._decisionTree.classify(instance);
            const actual: any = instance.getAttributeValue(this._dataSet.target.name);
            results.push({instance, predicted, actual});
        });
        this._numCorrect = this._decisionTree.report();
        this._accuracy = this._numCorrect / this.dataSet.testingInstances.length;
        return results;
    }

    /**
     * Display String Representation of Tree
     *
     * @returns {string} String representation of tree
     *
     */
    public displayTree(): string {
        return this._decisionTree.print();
    }

    public get dataSet(): DataSet {
        return this._dataSet;
    }

    public get numCorrect(): number {
        return this._numCorrect;
    }

    public get accuracy(): number {
        return this._accuracy;
    }

    /**
     * Recursive C4.5 Algorithm to Build Decision Tree
     *
     * @param {Array<Instance>} list Instances
     * @param {Array<Attribute>} attributes Attributes
     * @param {Attribute} target Classification attribute
     * @param {DecisionTree} parent Current decision tree, necessary for recursion
     * @param {string} condition Current prediction rule condition, necessary for recursion
     *
     */
    private buildDecisionTree(list: Array<Instance>, attributes: Array<Attribute>, target: Attribute, parent: DecisionTree, condition?: string): void {
          // Base Zero: If the list is empty we are done
          if (list.length === 0) {
              return;
          }
          // Base One: If all belong to same class, declare new PredictionRule Leaf
          const baseOne: string = this._dataSet.unanimousClass(list, target);
          if (baseOne !== 'false') {
              parent.rule = new PredictionRule(target, condition, baseOne, list);
              return;
          }
          // For each attribute a, find the normalized information gain ratio from splitting on a.
          // Let a_best be the attribute with the highest normalized information gain.
          const aBest: ISelectedAttribute = this.chooseSplitAttribute(list, attributes, target);
          // Base Two: If 0 InformationGain => declare new Prediction Rule Leaf with majority class
          if (!aBest.desiredAttribute) {
              parent.rule = new PredictionRule(target, condition, this._dataSet.majorityClass(list, target), list);
              return;
          }
          // Body of of Algorithm
          // Select rule type depending on a_best
          let rule: Rule = (aBest.desiredAttribute.type === Type.CATEGORICAL)
              ? new CategoricalRule(aBest.desiredAttribute, condition)
              : new NumericRule(aBest.desiredAttribute, aBest.splitValue, condition);
          // Set rule
          parent.rule = rule;
          // Split current list on the rule
          const subLists: Map<string, Array<Instance>> = rule.split(list);
          // Recursion on the sublists
          subLists.forEach((subList: Array<Instance>, key: string) => {
              if (subList.length > 0) {
                  const child = new DecisionTree(null, null, parent);
                  parent.addChild(child);
                  return this.buildDecisionTree(subList, this._dataSet.attributes, this._dataSet.target, child, key);
              }
          });
    }

    /**
     * Choose Splitting Attribute based on the Highest Information Gain Ratio
     *
     * @param {Array<Instance>} list Instances
     * @param {Array<Attribute>} attributes Attributes
     * @param {Attribute} target Classification attribute
     * @returns {ISelectedAttribute} Selected attribute and its corresponding split value if numeric
     *
     */
    private chooseSplitAttribute(list: Array<Instance>, attributes: Array<Attribute>, target: Attribute): ISelectedAttribute {
        if (list.length === 0 || attributes.length === 0) {
            throw new TypeError('Lists cannot be empty');
        }
        let desiredAttribute: Attribute = null;
        let splitValue: number = 0;
        let maxInformGainRatio: number = 0;
        for (let attribute of attributes) {
            const sortedList: Array<Instance> = this._dataSet.sortListByAttribute(list, target);
            if (attribute.type === Type.CATEGORICAL) {
                const potentialGainRatio: number  = InformationGain.categoricalInformationGainRatio(sortedList, attribute, target);
                if (potentialGainRatio > maxInformGainRatio) {
                    maxInformGainRatio = potentialGainRatio;
                    desiredAttribute = attribute;
                }
            } else if (attribute.type === Type.NUMERIC) {
                const potentialGainRatio: IGain = InformationGain.numericInformationGainRatio(sortedList, attribute, target);
                if (potentialGainRatio.maxGain > maxInformGainRatio) {
                    maxInformGainRatio = potentialGainRatio.maxGain;
                    splitValue = potentialGainRatio.splitValue;
                    desiredAttribute = attribute;
                }
            } else {
                throw new Error('Attribute is neither CATEGORICAL nor NUMERIC');
            }
        }
        return (maxInformGainRatio === 0) ? {desiredAttribute: null, splitValue: null} :  {desiredAttribute, splitValue};
    }
}

export interface ISelectedAttribute {
    desiredAttribute: Attribute;
    splitValue: number;
}

export interface ITestResult {
    instance: Instance;
    predicted: string;
    actual: string;
}
