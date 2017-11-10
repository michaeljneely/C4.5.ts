import {Attribute, C45, DataSet, Entropy, InformationGain, Instance, logBaseN, Type} from './src';

const root: string = 'Documents/AdaBoost---TypeScript/test/';
const d1 = new DataSet(root + 'owls15.csv', root + 'owls15-schema.json', 'type');
const d2 = new DataSet(root + 'illness.csv', root + 'illness-schema.json', 'test_result');
const d3 = new DataSet(root + 'tennis.csv', root + 'tennis-schema.json', 'PlayTennis');
const tick = Date.now();
const d1C45 = new C45(d1);
d1C45.train();
const d2C45 = new C45(d2);
d2C45.train();
const d3C45 = new C45(d3);
d3C45.train();
const tock = Date.now();
console.log(tock - tick);
