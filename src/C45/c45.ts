import {Entropy, InformationGain} from '../Calculations';
import {Attribute, CategoricalRule, DataSet, DecisionTree, Instance, NumericRule, PredictionRule, Rule, Type} from '../Models';

export class C45 {

    private _dataSet: DataSet;
    private _decisionTree: DecisionTree;

    constructor(dataSet: DataSet) {
        this._dataSet = dataSet;
        this._decisionTree = new DecisionTree(null, null, null);
    }

    public train(list: Array<Instance> = this._dataSet.trainingInstances, target: Attribute = this._dataSet.target) {
        this.buildDecisionTree(list, this._dataSet.attributes, target, this._decisionTree);
        this.displayTree();
        this.test();
        this.report();
    }

    // TODO
    private report(): void {
        return;
    }

    // TODO
    private test(): void {
        return;
    }

    // TODO
    private displayTree(): void {
        return this._decisionTree.print();
    }

    private buildDecisionTree(list: Array<Instance>, attributes: Array<Attribute>, target: Attribute, parent: DecisionTree, condition?: string) {
          // Base Zero: If the list is empty we are done
          if (list.length === 0) {
              return;
          }
          // Base One: If all belong to same class, declare new PredictionRule Leaf
          const baseOne = this._dataSet.unanimousClass(list, target);
          if (baseOne !== 'false') {
              parent.rule = new PredictionRule(target, condition, baseOne, list);
              return;
          }
          // For each attribute a, find the normalized information gain ratio from splitting on a.
          // Let a_best be the attribute with the highest normalized information gain.
          const split = this.chooseSplitAttribute(list, attributes, target);
          // Base Two: If 0 InformationGain => declare new Prediction Rule Leaf with majority class
          if (!split.desiredAttribute) {
              parent.rule = new PredictionRule(target, condition, this._dataSet.majorityClass(list, target), list);
              return;
          }
          // Body of of Algorithm
          let rule: Rule = (split.desiredAttribute.type === Type.CATEGORICAL)
              ? new CategoricalRule(split.desiredAttribute, condition)
              : new NumericRule(split.desiredAttribute, split.splitValue, condition);
          parent.rule = rule;
          const subLists = rule.split(list);
          subLists.forEach((subList, key) => {
              if (subList.length > 0) {
                  const b = new DecisionTree(null, null, parent);
                  parent.addChild(b);
                  return this.buildDecisionTree(subList, this._dataSet.attributes, this._dataSet.target, b, key);
              }
          });
    }

    private chooseSplitAttribute(list: Array<Instance>, attributes: Array<Attribute>, target: Attribute): ISelectedAttribute {
        if (list.length === 0 || attributes.length === 0) {
            throw new TypeError('Something is Empty!');
        }
        let desiredAttribute: Attribute = null;
        let splitValue: number = 0;
        let maxInformGainRatio: number = 0;
        for (let attribute of attributes) {
            const sortedList = this._dataSet.sortListByAttribute(list, target);
            if (attribute.type === Type.CATEGORICAL) {
                const a  = InformationGain.InformationGainRatioCategorical(sortedList, attribute, target);
                if (a > maxInformGainRatio) {
                    maxInformGainRatio = a;
                    desiredAttribute = attribute;
                }
            } else if (attribute.type === Type.NUMERIC) {
                const a = InformationGain.InformationGainRatioNumeric(sortedList, attribute, target);
                if (a.maxGain > maxInformGainRatio) {
                    maxInformGainRatio = a.maxGain;
                    splitValue = a.splitValue;
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
