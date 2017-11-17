import {outputFileSync} from 'fs-extra';
import {basename} from 'path';
import {C45, ITestResult} from '../C45';
import {Attribute, DataSet} from '../Models/';

export class Display {

    private _path: string;
    private _c45: C45;
    private _dataSet: DataSet;

    constructor(path: string, c45: C45 ) {
        this._path = path;
        this._c45 = c45;
        this._dataSet = this._c45.dataSet;
    }

    /**
     * Writes Results of a C4.5 Trial to a Markdown File
     */
    public display(): void {
        const out: string = `# Results for '${basename(this._dataSet.dataPath)}' Data Set\n\r`
        + `## Statistics`
        + `Number of Instances: ${this._dataSet.instances.length}\n\r`
        + `Percentage Train/Test Split: ${this._dataSet.percentageSplit}%\n\r`
        + `## Unpruned Decision Tree`
        + `${this._c45.displayTree()}\n\r`
        + `## Test Results\n\r`
        + `Correctly Classified ${this._c45.numCorrect} `
        + `out of of ${this._dataSet.testingInstances.length} Instances\n\r`
        + `Accuracy: ${(this._c45.accuracy * 100).toPrecision(4)}%\n\r`
        + `Instance Breakdown:\n\r\n\r`
        + `${this.buildResultTable()}`;
        outputFileSync(`results/out-${basename(this._dataSet.dataPath).split('.')[0]}.md`, out);
    }

    /**
     * Builds Markdown Table of All Tested Instances and Their Predicted and Actual Values
     */
    private buildResultTable(): string {
        const results: Array<ITestResult> = this._c45.test();
        let out: string = '| instance number |';
        this._dataSet.attributes.forEach((attribute: Attribute) => {
            out += ` ${attribute.name} |`;
        });
        out += ' predicted | actual |\n';
        for (let i: number = 0; i <= this._dataSet.attributes.length; i++) {
            out += `${(i === 0) ? '|' : ''} --- |`;
        }
        out += ' --- | --- |\n';
        results.forEach((result: ITestResult ) => {
            out += `| ${result.instance.number} |`;
            this._dataSet.attributes.forEach((attribute: Attribute) => {
                out += ` ${result.instance.getAttributeValue(attribute.name)} |`;
            });
            out += ` ${result.predicted} | ${result.actual} |\n`;
        });
        return out;
    }

}
