import {Attribute, C45, DataSet, Entropy, InformationGain, Instance, logBaseN, Type} from './src';

const root: string = 'Documents/AdaBoost---TypeScript/test/';
const tick = Date.now();
let total = 0;
for (let i = 0; i < 1000; i++) {
    let d = new DataSet(root + 'illness.csv', root + 'illness-schema.json', 'test_result', 66);
    let c45 = new C45(d);
    c45.train();
    total += c45.test();
}
const res = ((total / 1000) * 100).toPrecision(4);
const tock = Date.now();
console.log(`Ran 1000 Trials in ${(tock - tick) / 1000} seconds, with an Average Accuracy of ${res}%`);

/*
Other DataSets:
new DataSet(root + 'illness.csv', root + 'illness-schema.json', 'test_result', 66);
new DataSet(root + 'tennis.csv', root + 'tennis-schema.json', 'PlayTennis', 66);
*/
