import {cloneDeep} from 'lodash';
import {Entropy, IGain, InformationGain} from '../Calculations';
import {Constants} from '../Constants';
import {Attribute, CategoricalRule, DataSet, DecisionTree, Instance, InstanceAttributeMap,
NumericRule, PredictionRule, Rule, Type} from '../Models';

export class C45 {

    private _dataSet: DataSet;
    private _unPrunedTree: DecisionTree;
    private _prunedTree: DecisionTree;
    private _results: Array<ITestResult>;
    private _numCorrect: number;
    private _accuracy: number;

    constructor(dataSet: DataSet) {
        this._dataSet = dataSet;
        this._unPrunedTree = new DecisionTree(null, null, null);
        this._prunedTree = new DecisionTree(null, null, null);
        this._results = new Array<ITestResult>();
    }

    /**
     * Train - Build Decision Tree
     *
     * @param {Array<Instance>} list Training Instances
     * @param {Attribute} target Attribute to classify
     *
     */
    public train(list: Array<Instance> = this._dataSet.trainingInstances, target: Attribute = this._dataSet.target): void {
        this.buildDecisionTree(list, this._dataSet.attributes, target, this._unPrunedTree);
    }

    /**
     * Prune - Trim Decision Tree with Reduced Error Pruning and (Optionally) Minimum Instance Per Leaf Pruning
     *
     */
    public prune(): void {
        this.pruneDecisionTree(this._unPrunedTree);
    }

    /**
     * Test - Evaluate Performance
     *
     * @param {Array<Instance>} list Test instances
     * @param {DecisionTree} target Which tree to test on
     * @returns {Array<ITestResult>} Test results
     *
     */
    public test(list: Array<Instance> = this._dataSet.testingInstances, root: DecisionTree = this._prunedTree): Array<ITestResult> {
        if (list.length === 0) {
            return new Array<ITestResult>();
        }
        const results: Array<ITestResult> = new Array<ITestResult>();
        list.forEach((instance: Instance) => {
            const predicted: string = root.classify(instance);
            const actual: any = instance.getAttributeValue(this._dataSet.target.name);
            results.push({instance, predicted, actual});
        });
        this._numCorrect = root.report();
        this._accuracy = this._numCorrect / list.length;
        return results;
    }

    /**
     * Display String Representation of Unpruned Decision Tree
     *
     * @returns {string} String representation of unpruned tree
     *
     */
    public displayUnPrunedTree(): string {
        return this._unPrunedTree.print();
    }

    /**
     * Display String Representation of Pruned Decision Tree
     *
     * @returns {string} String representation of pruned tree
     *
     */
    public displayPrunedTree(): string {
        return this._prunedTree.print();
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

    public nodeCount(): number {
        return this._prunedTree.countNodes();
    }

    /**
     * Recursive Algorithm to Build Decision Tree
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
     * Prune Decision Tree By Enforcing a Minimum Number of Instances Per Leaf Node and By
     * Performing Reduced Error Pruning
     *
     * @param {DecisionTree} root - Decision Tree to prune
     * @param {boolean} minimumInstancePruning Require a minimum number of training instances to reach leaves (specified in constants file)
     *
     */
    private pruneDecisionTree(root: DecisionTree = this._unPrunedTree): void {
        this._prunedTree = cloneDeep(this._unPrunedTree);
        this._prunedTree.reset();
        this.test(this._dataSet.trainingInstances, this._prunedTree);
        this.reducedErrorPruning(this._prunedTree);
        this._prunedTree.reset();
        if (Constants.useMinInstancePruning) {
            this.test(this._dataSet.trainingInstances, this._prunedTree);
            this.pruneMinInstancesPerLeaf(this._prunedTree);
            this._prunedTree.reset();
        }
     }

    /**
     * Recursive Algorithm to Prune Leaves that Aren't Reached by a Sufficient Number of Instances
     *
     * @param {DecisionTree} root - Subtree to prune
     */
    private pruneMinInstancesPerLeaf(root: DecisionTree): void {
        if (root.children) {
            root.children.forEach((child: DecisionTree) => {
                // Collapse subtrees that aren't reached by sufficient instances
                if ((child.rule instanceof PredictionRule) &&
                (child.rule.instances.length > 0 && child.rule.instances.length < Constants.minInstancesPerLeaf)) {
                    child.parent = this.collapseSubTree(child.parent);
                }
                this.pruneMinInstancesPerLeaf(child);
            });
        }
    }

    /**
     * Recursive Algorithm to Perform Reduced Error Pruning
     *
     * @param {DecisionTree} root - Subtree to prune
     */
    private reducedErrorPruning(root: DecisionTree): void {
        if (root.children) {
            root.children.forEach((child: DecisionTree) => {
                if (child.children) {
                    // Only Attempt to Prune Nodes with Only Prediction Rules as Children
                    const onlyPredictionNodes: boolean = child.children.every((c: DecisionTree) => {
                        return c.rule instanceof PredictionRule;
                    });
                    if (onlyPredictionNodes && child.children.length > 0) {
                        // See accuracy from replacing node as majority class
                        const newRoot = cloneDeep(child);
                        const testNode: DecisionTree = this.collapseSubTree(newRoot);
                        if (testNode.rule instanceof PredictionRule) {
                            testNode.rule.instances.forEach((instance: Instance) => {
                                testNode.classify(instance);
                            });
                            const testConfidence: number = this.confidenceInterval(testNode.numWrong, testNode.rule.instances.length);
                            const currentConfidence: number = this.confidenceInterval(testNode.rule.instances.length - child.report(), testNode.rule.instances.length);
                            if (testConfidence < currentConfidence) {
                                child.parent = this.collapseSubTree(child.parent);
                            }
                        }
                    }
                    this.reducedErrorPruning(child);
                }
            });
        }
    }

    /**
     * Combine all Instances of the Immediate Children of a Decision Tree into a Single List
     *
     * @param {DecisionTree} root Root of subtree
     * @returns {Array<Instance>} Combined child instances
     *
     */
    private combineChildInstances(root: DecisionTree): Array<Instance> {
        let childInstances = new Array<Instance>();
        if (root.children) {
            root.children.forEach((child: DecisionTree) => {
                if (child.rule instanceof PredictionRule) {
                    childInstances = childInstances.concat(child.rule.instances);
                }
            });
        }
        return childInstances;
    }

    /**
     * Collapses Subtree into a Leaf Node
     *
     * @param {DecisionTree} root Root of subtree to collapse
     * @returns {DecisionTree} Leaf Node
     *
     */
    private collapseSubTree(root: DecisionTree): DecisionTree {
        if (root.children) {
            const childInstances = this.combineChildInstances(root);
            const majorityClass: string = this._dataSet.majorityClass(childInstances, this._dataSet.target);
            if (majorityClass !== null) {
                root.rule = new PredictionRule(this._dataSet.target, root.rule.condition, majorityClass, childInstances);
                root.children = null;
                root.rule.instances = childInstances;
            }
        }
        return root;
     }

     /**
      * Calculate Confidence Interval
      *
      * @param {number} f Number of instances incorrectly classified by the subtree
      * @param {number} n Total number of instances classified by the subtree
      * @returns {number} Highest confidence value
      *
      */
     private confidenceInterval(f: number, n: number): number {
        const p1: number = (f / n) + (Constants.zValue * Math.sqrt(((f / n) * (1 / (f / n))) / n));
        const p2: number = (f / n) - (Constants.zValue * Math.sqrt(((f / n) * (1 / (f / n))) / n));
        return p1 > p2 ? p1 : p2;
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
