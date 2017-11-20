import * as commandLineArgs from 'command-line-args';
import {existsSync} from 'fs-extra';
import {C45, DataSet, Display} from '../src/';

const optionDefinitions = [
  { name: 'dataFile', alias: 'd', type: String },
  { name: 'schemaFile', alias: 's', type: String },
  { name: 'target', alias: 't', type: String },
  { name: 'split', alias: 'p', type: Number, defaultValue: 66 },
  { name: 'trials', alias: 'n', type: Number, defaultValue: 1000 },
];

const options = commandLineArgs(optionDefinitions);

const verifyOptions = (): void => {
    if (options.trials <= 0 || options.trials > 10000) {
        throw new RangeError('Trial Range must be in Range 0-10,000');
    }
    if (!existsSync(`test/${options.dataFile}.csv`)) {
        throw new Error(`Data File Does not Exist at test/${options.dataFile}.csv`);
    }
    if (!existsSync(`test/${options.schemaFile}.json`)) {
        throw new Error(`Schema File Does not Exist at test/${options.schemaFile}.json`);
    }
    if (!existsSync(`test/${options.schemaFile}.json`)) {
        throw new Error(`Schema File Does not Exist at test/${options.schemaFile}.json`);
    }
    if (options.split < 0 || options.split > 100) {
        throw new RangeError(`Split Percentage must be in Range 0 - 100`);
    }
};

const runTrials = (): void => {
    const tick = Date.now();
    let total = 0;
    let bestAccuracy = 0;
    let bestC45 = null;
    let bestIteration = 0;
    for (let i = 0; i < options.trials; i++) {
        let d = new DataSet(`test/${options.dataFile}.csv`, `test/${options.schemaFile}.json`, options.target, options.split);
        let c45 = new C45(d);
        c45.train();
        c45.prune(false);
        c45.test();
        const accuracy = c45.numCorrect / c45.dataSet.testingInstances.length;
        if (accuracy > bestAccuracy) {
            if (bestC45) {
                if (c45.nodeCount() < bestC45.nodeCount()) {
                    bestIteration = i;
                    bestC45 = c45;
                    bestAccuracy = accuracy;
                }
            } else {
                bestIteration = i;
                bestC45 = c45;
                bestAccuracy = accuracy;
            }
        }
        total += accuracy;
        console.log(`Trial ${i + 1}: Correctly Classified ${c45.numCorrect} out of ${c45.dataSet.testingInstances.length}`);
    }
    const tock = Date.now();
    const outPath = new Display(`${options.trials}-trials-best`, bestC45).display();
    console.log(`Ran ${options.trials} Trials in ${(tock - tick) / 1000} seconds, with an Average Accuracy of ${((total / options.trials) * 100).toPrecision(4)}%`);
    console.log(`Best Decision Tree was built during iteration ${bestIteration + 1}, and classified all test instances with an accuracy of ${(bestAccuracy * 100).toPrecision(4)}%`);
    console.log(`Results Available in ${outPath}`);
};

const main = (): void => {
    try {
        verifyOptions();
        runTrials();
    } catch (error) {
        console.log(error.message);
    }
};

main();
