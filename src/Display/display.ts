import {outputFileSync} from 'fs-extra';
import {homedir} from 'os';
import {basename, join} from 'path';
import {C45, ITestResult} from '../C45';
import {DataSet} from '../Models/DataSet';

export class Display {

    private _path: string;
    private _c45: C45;
    private _dataSet: DataSet;

    constructor(path: string, c45: C45 ) {
        this._path = path;
        this._c45 = c45;
        this._dataSet = this._c45.dataSet;
    }
    public display(): void {
        const out: string = `# Results for '${basename(this._dataSet.dataPath)}' Data Set\n`
        + `## Statistics`
        + `Number of Instances: ${this._dataSet.instances.length}\n`
        + `Percentage Train/Test Split: ${this._dataSet.percentageSplit}%\n`
        + `## Unpruned Decision Tree`
        + `${this._c45.displayTree()}\n`
        + `## Test Results\n`
        + `Correctly Classified ${this._c45.numCorrect} `
        + `out of of ${this._dataSet.testingInstances.length} Instances\n`
        + `Accuracy: ${(this._c45.accuracy * 100).toPrecision(4)}%\n`
        + `Instance Breakdown:\n\n`
        + `${this.buildResultTable()}`;
        outputFileSync(`results/out-${basename(this._dataSet.dataPath).split('.')[0]}.md`, out);
    }

    private buildResultTable(): string {
        const results = this._c45.test();
        let out = '| instance number |';
        this._dataSet.attributes.forEach((attribute, index) => {
            out += ` ${attribute.name} |`;
        });
        out += ' predicted | actual |\n';
        for (let i = 0; i < this._dataSet.attributes.length; i++) {
            out += `${(i === 0) ? '|' : ''} --- |`;
        }
        out += ' --- | --- |\n';
        results.forEach((result: ITestResult ) => {
            out += `| ${result.instance.number} |`;
            this._dataSet.attributes.forEach((attribute) => {
                out += ` ${result.instance.getAttributeValue(attribute.name)} |`;
            });
            out += ` ${result.predicted} | ${result.actual} |\n`;
        });
        return out;
    }

}
