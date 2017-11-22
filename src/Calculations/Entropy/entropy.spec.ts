import { expect } from 'chai';
import 'mocha';
import { DataSet, Instance } from '../../Models/';
import { Entropy } from './entropy';

describe('Entropy Calculation Tests', () => {

    const tennisDataSet = new DataSet('test/tennis.csv', 'test/tennis-schema.json', 100);
    const owlsDataSet = new DataSet('test/owls15.csv', 'test/owls15-schema.json', 100);
    const instances = tennisDataSet.instances;
    const windy = tennisDataSet.attributes[3];
    const wingWidth = owlsDataSet.attributes[3];

    /*
    Values Provided in Lecture 3/4 Notes:
        S = Tennis Data Set
        Ent(Swindy = false) = 0.811
        Ent(Swindy = true) = 1
        Ent(S) = 0.9403
    */

    it('Correctly Calculates Attribute Entropy ', () => {
        expect(Entropy.attributeEntropy(instances, tennisDataSet.target).toPrecision(4)).to.equal('0.9403');
        // |1/3 * log2(1/3)| * 3 = 1.585
        expect(Entropy.attributeEntropy(owlsDataSet.instances, owlsDataSet.target).toPrecision(4)).to.equal('1.585');
        expect(Entropy.attributeEntropy(new Array<Instance>(), tennisDataSet.target)).to.equal(0);
    });

    it('Correctly Calculates Entropy for Categorical Attributes', () => {
        expect(Entropy.categoricalEntropy(instances, windy, tennisDataSet.target, 'False').toPrecision(3)).to.equal('0.811');
        expect(Entropy.categoricalEntropy(instances, windy, tennisDataSet.target, 'True')).to.equal(1);
        expect(Entropy.categoricalEntropy(instances, windy, tennisDataSet.target, 'Not an Attribute')).to.equal(0);
        expect(Entropy.categoricalEntropy(new Array<Instance>(), windy, tennisDataSet.target, 'Not an Attribute')).to.equal(0);
    });

    it('Correctly Calculates Entropy for Numeric Attributes', () => {
        expect(Entropy.numericEntropy(new Array<Instance>(), wingWidth, owlsDataSet.target, 0.6)).to.equal(0);
        // Wing Width at 0.6 Captures All Long Eared Owls (E = 1 - 1/3 = 2/3)
        expect(Entropy.numericEntropy(owlsDataSet.instances, wingWidth, owlsDataSet.target, 0.6)).to.equal(2 / 3);
    });
});
