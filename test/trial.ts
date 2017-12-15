import * as commandLineArgs from 'command-line-args';
import {existsSync} from 'fs-extra';
import {C45, DataSet, Display} from '../src/';

const optionDefinitions = [
  { name: 'dataFile', alias: 'd', type: String },
  { name: 'schemaFile', alias: 's', type: String },
  { name: 'percentageSplit', alias: 'p', type: Number, defaultValue: 66 },
  { name: 'trials', alias: 'n', type: Number, defaultValue: 1000 },
];

const options = commandLineArgs(optionDefinitions);

/**
 * Verify Command Line Arguments
 *
 */
const verifyOptions = (): void => {
    if (!existsSync(`test/${options.dataFile}.csv`)) {
        throw new Error(`Data File Does not Exist at test/${options.dataFile}.csv`);
    }
    if (!existsSync(`test/${options.schemaFile}.json`)) {
        throw new Error(`Schema File Does not Exist at test/${options.schemaFile}.json`);
    }
    if (options.percentageSplit < 0 || options.percentageSplit > 100) {
        throw new RangeError(`Split Percentage must be in Range 0 - 100`);
    }
    if (options.trials <= 0 || options.trials > 10000) {
        throw new RangeError('Trial Range must be in Range 0-10,000');
    }
};

/**
 * Run Specified Number of Trials on the Specified Dataset with the Specified Split
 *
 */
const runTrials = (): void => {
    // Start time
    const tick: number = Date.now();

    // Keep track of states during iteration
    let total: number = 0;
    let bestAccuracy: number = 0;
    let bestC45: C45 = null;
    let bestIteration: number = 0;

    console.log(`Running ${options.trials} trials on the '${options.dataFile} dataset'.`);

    for (let i: number = 0; i < options.trials; i++) {
        let d: DataSet = new DataSet(`test/${options.dataFile}.csv`, `test/${options.schemaFile}.json`, options.percentageSplit);
        let c45: C45 = new C45(d);
        c45.train();
        c45.prune();
        c45.test();
        const accuracy: number = c45.numCorrect / c45.dataSet.testingInstances.length;
        // Shoud we replace the current best tree?
        const moreAccurate: boolean = accuracy > bestAccuracy;
        // If accuracies are roughly equivalent, take the one with fewer nodes
        // Okham's Razor -> The simplest hypothesis is the most accurate
        const shouldReplace: boolean  = (accuracy.toPrecision(2) === bestAccuracy.toPrecision(2) && bestC45 && (c45.nodeCount() < bestC45.nodeCount()));
        // Replace current best tree
        if (moreAccurate || shouldReplace) {
            bestIteration = i;
            bestC45 = c45;
            bestAccuracy = accuracy;
        }
        total += accuracy;
        console.log(`Trial ${i + 1}: Correctly Classified ${c45.numCorrect} out of ${c45.dataSet.testingInstances.length}`);
    }
    const tock: number = Date.now();
    const outPath: string = new Display(`${options.trials}-trials-best`, bestC45).display();
    // Print Results
    console.log(`Ran ${options.trials} Trials in ${(tock - tick) / 1000} seconds, with an Average Accuracy of ${((total / options.trials) * 100).toPrecision(4)}%`);
    console.log(`Best Decision Tree was built during iteration ${bestIteration + 1}, and classified all test instances with an accuracy of ${(bestAccuracy * 100).toPrecision(4)}%`);
    console.log(`Results Available in ${outPath}`);
};

/**
 * Parse CLI options and Run Trials
 *
 */
const main = (): void => {
    try {
        verifyOptions();
        runTrials();
    } catch (error) {
        console.log(error.message);
    }
};

main();
