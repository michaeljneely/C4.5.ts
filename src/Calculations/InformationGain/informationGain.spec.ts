import { expect } from 'chai';
import 'mocha';
import { Attribute, DataSet, Instance } from '../../Models/';
import { Entropy } from '../Entropy/';
import { InformationGain } from './informationGain';

describe('Information Gain Calculation Tests', () => {

    const tennisDataSet = new DataSet('test/tennis.csv', 'test/tennis-schema.json', 'PlayTennis', 100);
    const outlook = tennisDataSet.attributes[0];
    const temperature = tennisDataSet.attributes[1];
    const humidity = tennisDataSet.attributes[2];
    const windy = tennisDataSet.attributes[3];
    const owlsDataSet = new DataSet('test/owls15.csv', 'test/owls15-schema.json', 'type', 100);
    const wingWidth = owlsDataSet.attributes[3];
    const bodyWidth = owlsDataSet.attributes[2];
    const wingLength = owlsDataSet.attributes[1];
    const bodyLength = owlsDataSet.attributes[0];

    /*
    Values Provided in Lecture 3/4 Notes:
        S = Tennis Data Set
        InformationGain(S, Outlook) = 0.247
        InformationGain(S, Temperature) = 0.029
        InformationGain(S, Humidity) = 0.152
        InformationGain(S, Windy) = 0.048
    */

    it('Correctly Calculates Categorical Attribute Information Gain', () => {
        const instances = tennisDataSet.instances;
        const target = tennisDataSet.target;
        expect(InformationGain.categoricalInformationGain(instances, outlook, target).toPrecision(3)).to.equal('0.247');
        expect(InformationGain.categoricalInformationGain(instances, temperature, target).toPrecision(2)).to.equal('0.029');
        expect(InformationGain.categoricalInformationGain(instances, humidity, target).toPrecision(3)).to.equal('0.152');
        expect(InformationGain.categoricalInformationGain(instances, windy, target).toPrecision(2)).to.equal('0.048');
        expect(InformationGain.categoricalInformationGain(new Array<Instance>(), windy, target)).to.equal(0);
    });

    it('Correctly Calculates Categorical Attribute Information Gain Ratio', () => {
        const instances = tennisDataSet.instances;
        const target = tennisDataSet.target;
        // Answers compared with:
        // https://www.slideshare.net/marinasantini1/lecture-4-decision-trees-2-entropy-information-gain-gain-ratio-55241087
        expect(InformationGain.categoricalInformationGainRatio(instances, outlook, target).toPrecision(3)).to.equal('0.156');
        expect(InformationGain.categoricalInformationGainRatio(instances, temperature, target).toPrecision(2)).to.equal('0.019');
        expect(InformationGain.categoricalInformationGainRatio(instances, humidity, target).toPrecision(3)).to.equal('0.152');
        expect(InformationGain.categoricalInformationGainRatio(instances, windy, target).toPrecision(2)).to.equal('0.049');
        expect(InformationGain.categoricalInformationGainRatio(new Array<Instance>(), outlook, target)).to.equal(0);
    });

    it('Correctly Calculates Numeric Attribute Information Gain', () => {
        const instances = owlsDataSet.instances;
        const target = owlsDataSet.target;
        /* Calculation:
            O = Owls Data set
            Entropy(Otype) = 1.585
            Entropy(Owingwidth <= 0.6) = 2/3; (Captures all Long Eared Owls)
            Entropy(ObodyWidth <= 1.9 ) = 2/3; (Captures all Long Eared Owls)
            1.585 - 2/3 = 0.918
        */
        expect(InformationGain.numericInformationGain(instances, wingWidth, target).maxGain.toPrecision(3)).to.equal('0.918');
        expect(InformationGain.numericInformationGain(instances, bodyWidth, target).maxGain.toPrecision(3)).to.equal('0.918');
        expect(InformationGain.numericInformationGain(instances, wingWidth, target).splitValue).to.equal('0.6');
        expect(InformationGain.numericInformationGain(instances, bodyWidth, target).splitValue).to.equal('1.9');
        expect(InformationGain.numericInformationGain(new Array<Instance>(), wingWidth, target).maxGain).to.equal(0);
        expect(InformationGain.numericInformationGain(new Array<Instance>(), wingWidth, target).splitValue).to.equal(0);
    });

    it('Correctly Calculates Numeric Attribute Information Gain Ratio', () => {
        const instances = owlsDataSet.instances;
        const target = owlsDataSet.target;
        /* Calculation:
            InformationGain(O, wingWidth <= 0.6) = 0.918
            Intrinsic value of wingWidth -> 4.05
        */
        expect(InformationGain.numericInformationGainRatio(instances, wingWidth, target).maxGain.toPrecision(3)).to.equal('0.227');
        expect(InformationGain.numericInformationGainRatio(instances, wingWidth, target).splitValue).to.equal('0.6');
        expect(InformationGain.numericInformationGainRatio(new Array<Instance>(), wingWidth, target).maxGain).to.equal(0);
    });

});
