import {C45, DataSet} from '../src/';

console.log(`Using the Owls15 DataSet`);
const tick = Date.now();
let total = 0;
for (let i = 0; i < 10; i++) {
    let d = new DataSet('test/owls15.csv', 'test/owls15-schema.json', 'type', 66);
    let c45 = new C45(d);
    c45.train();
    c45.test();
    const accuracy = c45.numCorrect / c45.dataSet.testingInstances.length;
    total += accuracy;
    console.log(`Trial ${i + 1}: Correctly Classified ${c45.numCorrect} out of ${c45.dataSet.testingInstances.length}`);
}
const tock = Date.now();
console.log(`Ran 10 Trials in ${(tock - tick) / 1000} seconds, with an Average Accuracy of ${((total / 10) * 100).toPrecision(4)}%`);

/*
Other DataSets:
new DataSet(root + 'illness.csv', root + 'illness-schema.json', 'test_result', 66);
new DataSet(root + 'tennis.csv', root + 'tennis-schema.json', 'PlayTennis', 66);
*/
