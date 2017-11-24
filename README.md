[![Build Status](https://travis-ci.org/michaeljneelysd/C4.5.ts.svg?branch=master)](https://travis-ci.org/michaeljneelysd/C4.5.ts)
[![Coverage Status](https://coveralls.io/repos/github/michaeljneelysd/C4.5.ts/badge.svg?branch=master)](https://coveralls.io/github/michaeljneelysd/C4.5.ts?branch=master)
# C4.5.ts

:deciduous_tree: Ross Quinlan's C4.5 Decision Tree Algorithm<sup>[1](#references)</sup>, implemented in TypeScript. Handles Numeric (continuous) and Categorical (discrete) attributes. Uses the Information Gain Ratio to perform splits. Performs reduced error pruning based on confidence intervals.

# Getting Started

## Dependencies
What you need to run this app:
* `node` and `npm` (`brew install node`)
* Ensure you're running the latest versions Node `v8.x.x`+ (or `v9.x.x`) and NPM `5.x.x`+
* A Markdown viewer to visualize the results (See [MacDown](https://macdown.uranusjr.com/), [Typora](https://typora.io/), or The [MarkdownPreview](https://atom.io/packages/markdown-preview) plugin for [Atom](https://atom.io/)).

> If you have `nvm` installed, which is highly recommended (`brew install nvm`) you can do a `nvm install --lts && nvm use` in `$` to run with the latest Node LTS. You can also have this `zsh` done for you [automatically](https://github.com/creationix/nvm#calling-nvm-use-automatically-in-a-directory-with-a-nvmrc-file)

Once you have those, you should install these globals with `npm install --global`:
* `typescript` (`npm install --global typescript`)
* `ts-node` (`npm install --global ts-node`)

## Installing
* `fork` this repo
* `clone` your fork
* `npm install` to install required dependencies

## Running the app
You can run the sample application (`ts-node sample`) to build a decision tree for the 'owls' test data set.

# Usage Guide

## Adding a DataSet

Datasets are stored in the test folder. This application only supports unlabelled .csv files.

## Adding a Schema
The application learns about the structure of your data from a schema .json file, which is placed in the test folder.

In the schema you must specify the target attribute you wish to build the classification model on, as well as the names and types of all the attributes in the dataset.

C4.5 distinguishes between two types of attributes:
* `CATEGORICAL` - The attribute is a discrete set of strings. (e.g. 'dog', 'cat', etc...)
* `NUMERIC` - The attribute is a numerical value with no specified range. (e.g. 2.0, 4.5, 1.3, etc...)

Schemas are defined with a single `target` string and a list of `attributes` (`name` and `type` pairs).

A sample schema is shown below:
```javascript
{
    "target": "PlayGolf",
    "attributes": [
        {
            "name": "Outlook",
            "type": "CATEGORICAL"
        },
        {
            "name": "Temperature",
            "type": "NUMERIC"
        },
        {
            "name": "Humidity",
            "type": "CATEGORICAL"
        },
        {
            "name": "Windy",
            "type": "CATEGORICAL"
        },
        {
            "name": "PlayGolf",
            "type": "CATEGORICAL"
        }
    ]
}
```
## Constructing a DataSet
```javascript
const myDataSet = new DataSet('test/tennis.csv', 'test/tennis-schema.json', 70);
```
The `DataSet` class takes 3 arguments:
* The path to your data file (e.g. `tennis.csv`)
* The path to your schema file (e.g. `tennis-schema.json`)
* The split percentage you wish to use for training and testing the decision tree. (e.g. `66` indicates 66% of the data is used for training, and the remaining 33% is used for testing)

## Constructing a Decision Tree
```javascript
const myC45 = new C45(myDataSet);
```
The `C45` class takes 1 argument: the dataset you wish to build a decision tree for.
Once instantiated, you can call the following methods:
* `C45.train()` - Builds the unpruned decision Tree
* `C45.prune()` - Prunes the decision tree using reduced error pruning.
* `C45.test()` - Validates the tree against the withheld test data.

## Visualizing the Results
```javascript
const myVisualizer = new Display('mytree', myC45);
// Prints the Markdown file to 'results/mytree-tennis.md'
myVisualizer.display();
```
The `Display` class prints the results of the classification process to a Markdown file. It takes 2 arguments:
* `filePrefix` - The prefix for the resulting `.md` file
* `c45` - The C45 object you wish to display

Once instantiated, you can call the `display` method to print the results to `results/filePrefix-filename.md`

## Exploring the Results

The Markdown file generated by the `Display` class contains the following information:
* The name of the dataset
* The total number of data points (instances)
* The test/train split
* The unpruned decision tree
* The pruned decision tree and the results from the test set validation. Each prediction node contains a right/wrong number pair
* The test results (accuracy and number of correctly classified instances)
* A table that breaks down each test instance, along with its predicted and actual classifications

## Sample Results File

## Results for 'owls15.csv' Data Set

## Statistics

Number of Instances: 135

Percentage Train/Test Split: 66%

## Unpruned Decision Tree

Split on Numeric Attribute: wing-width, Value - 0.6

------Condition: lessThanEqual: 0.6, Choose: LongEaredOwl (27/0)

------Condition: greaterThan: 0.6, Split on Numeric Attribute: wing-width, Value - 1.7

------------Condition: lessThanEqual: 1.7, Split on Numeric Attribute: body-width, Value - 4.8

------------------Condition: lessThanEqual: 4.8, Split on Numeric Attribute: wing-width, Value - 1.6

------------------------Condition: lessThanEqual: 1.6, Choose: BarnOwl (25/0)

------------------------Condition: greaterThan: 1.6, Choose: SnowyOwl (1/0)

------------------Condition: greaterThan: 4.8, Split on Numeric Attribute: wing-width, Value - 1.6

------------------------Condition: lessThanEqual: 1.6, Split on Numeric Attribute: wing-length, Value - 6

------------------------------Condition: lessThanEqual: 6, Choose: BarnOwl (1/1)

------------------------------Condition: greaterThan: 6, Choose: SnowyOwl (3/0)

------------------------Condition: greaterThan: 1.6, Choose: BarnOwl (1/0)

------------Condition: greaterThan: 1.7, Split on Numeric Attribute: body-width, Value - 4.8

------------------Condition: lessThanEqual: 4.8, Split on Numeric Attribute: wing-length, Value - 5.9

------------------------Condition: lessThanEqual: 5.9, Choose: BarnOwl (1/0)

------------------------Condition: greaterThan: 5.9, Choose: SnowyOwl (1/0)

------------------Condition: greaterThan: 4.8, Choose: SnowyOwl (28/0)

## Pruned Decision Tree

Split on Numeric Attribute: wing-width, Value - 0.6

------Condition: lessThanEqual: 0.6, Choose: LongEaredOwl (18/0)

------Condition: greaterThan: 0.6, Split on Numeric Attribute: wing-width, Value - 1.7

------------Condition: lessThanEqual: 1.7, Split on Numeric Attribute: body-width, Value - 4.8

------------------Condition: lessThanEqual: 4.8, Split on Numeric Attribute: wing-width, Value - 1.6

------------------------Condition: lessThanEqual: 1.6, Choose: BarnOwl (15/0)

------------------------Condition: greaterThan: 1.6, Choose: SnowyOwl (0/0)

------------------Condition: greaterThan: 4.8, Choose: BarnOwl (2/0)

------------Condition: greaterThan: 1.7, Choose: SnowyOwl (11/0)

## Test Results

Correctly Classified 46 out of of 46 Instances

Accuracy: 100.0%

Instance Breakdown:


| instance number | body-length | wing-length | body-width | wing-width | predicted | actual |
| --- | --- | --- | --- | --- | --- | --- |
| 113 | 2.3 | 5 | 3.3 | 1 | BarnOwl | BarnOwl |
| 101 | 2.4 | 5.5 | 3.8 | 1.1 | BarnOwl | BarnOwl |
| 32 | 3.1 | 4.6 | 1.5 | 0.2 | LongEaredOwl | LongEaredOwl |
| 29 | 3.5 | 5 | 1.3 | 0.3 | LongEaredOwl | LongEaredOwl |
| 83 | 2.8 | 7.4 | 6.1 | 1.9 | SnowyOwl | SnowyOwl |
| 2 | 3.4 | 4.6 | 1.4 | 0.3 | LongEaredOwl | LongEaredOwl |
| 114 | 2.9 | 5.7 | 4.2 | 1.3 | BarnOwl | BarnOwl |
| 7 | 3.4 | 4.8 | 1.6 | 0.2 | LongEaredOwl | LongEaredOwl |
| 11 | 3.9 | 5.4 | 1.7 | 0.4 | LongEaredOwl | LongEaredOwl |
| 36 | 3.4 | 5 | 1.6 | 0.4 | LongEaredOwl | LongEaredOwl |
| 129 | 2.2 | 6 | 4 | 1 | BarnOwl | BarnOwl |
| 124 | 2.7 | 5.2 | 3.9 | 1.4 | BarnOwl | BarnOwl |
| 6 | 3.3 | 5.1 | 1.7 | 0.5 | LongEaredOwl | LongEaredOwl |
| 18 | 3 | 4.8 | 1.4 | 0.3 | LongEaredOwl | LongEaredOwl |
| 31 | 3.9 | 5.4 | 1.3 | 0.4 | LongEaredOwl | LongEaredOwl |
| 25 | 3.4 | 4.8 | 1.9 | 0.2 | LongEaredOwl | LongEaredOwl |
| 100 | 3.1 | 6.9 | 4.9 | 1.5 | BarnOwl | BarnOwl |
| 90 | 2.7 | 5.6 | 4.2 | 1.3 | BarnOwl | BarnOwl |
| 56 | 3.8 | 7.7 | 6.7 | 2.2 | SnowyOwl | SnowyOwl |
| 131 | 3.1 | 6.7 | 4.7 | 1.5 | BarnOwl | BarnOwl |
| 89 | 2.7 | 6.4 | 5.3 | 1.9 | SnowyOwl | SnowyOwl |
| 128 | 2.9 | 5.6 | 3.6 | 1.3 | BarnOwl | BarnOwl |
| 125 | 2.5 | 6.3 | 4.9 | 1.5 | BarnOwl | BarnOwl |
| 47 | 2.8 | 6.2 | 4.8 | 1.8 | SnowyOwl | SnowyOwl |
| 57 | 3.4 | 6.2 | 5.4 | 2.3 | SnowyOwl | SnowyOwl |
| 133 | 3 | 5.6 | 4.1 | 1.3 | BarnOwl | BarnOwl |
| 78 | 2.5 | 5.7 | 5 | 2 | SnowyOwl | SnowyOwl |
| 44 | 2.3 | 4.5 | 1.3 | 0.3 | LongEaredOwl | LongEaredOwl |
| 109 | 3 | 5.7 | 4.2 | 1.2 | BarnOwl | BarnOwl |
| 105 | 2.9 | 6.4 | 4.3 | 1.3 | BarnOwl | BarnOwl |
| 95 | 3 | 5.6 | 4.5 | 1.5 | BarnOwl | BarnOwl |
| 13 | 2.9 | 4.4 | 1.4 | 0.2 | LongEaredOwl | LongEaredOwl |
| 8 | 3.7 | 5.1 | 1.5 | 0.4 | LongEaredOwl | LongEaredOwl |
| 84 | 2.8 | 7.7 | 6.7 | 2 | SnowyOwl | SnowyOwl |
| 99 | 2.9 | 6.2 | 4.3 | 1.3 | BarnOwl | BarnOwl |
| 5 | 3 | 4.9 | 1.4 | 0.2 | LongEaredOwl | LongEaredOwl |
| 60 | 3 | 6.8 | 5.5 | 2.1 | SnowyOwl | SnowyOwl |
| 107 | 2.7 | 5.8 | 4.1 | 1 | BarnOwl | BarnOwl |
| 61 | 3.3 | 6.7 | 5.7 | 2.5 | SnowyOwl | SnowyOwl |
| 12 | 3 | 4.3 | 1.1 | 0.1 | LongEaredOwl | LongEaredOwl |
| 110 | 2.4 | 5.5 | 3.7 | 1 | BarnOwl | BarnOwl |
| 34 | 4 | 5.8 | 1.2 | 0.2 | LongEaredOwl | LongEaredOwl |
| 3 | 3.6 | 5 | 1.4 | 0.2 | LongEaredOwl | LongEaredOwl |
| 81 | 3 | 6.5 | 5.2 | 2 | SnowyOwl | SnowyOwl |
| 71 | 2.9 | 6.3 | 5.6 | 1.8 | SnowyOwl | SnowyOwl |
| 23 | 3.2 | 4.7 | 1.3 | 0.2 | LongEaredOwl | LongEaredOwl |

# Running Your Own Trials With Trial.ts
```
ts-node test/trial -d owls15 -s owls15-schema -p 66 -n 1000
```
The 'test/' folder contains a command line script to run multiple C4.5 trials. It will output the results of each trial to the console and print the highest performing Decision Tree to a markdown file (`[number of trials]-trials-best-[filename].md`).

`Trial.ts` accepts the following arguments:
* `-d` or `--dataFile` - The name of your `.csv` data file in the `test/` folder.
* `-s` or `--schemaFile` - The name of your `.json` schema file in the `test/` folder.
* `-p` or `--percentageSplit` - The train/test split you wish to use. Default value is 66%.
* `-n` or `--trials` - The number of trials you wish to run. Default value is 1000.

# Additional Options
The `constants.ts` file in the Constants folder contains several editable parameters to adjust the decision tree building and pruning processes:
* `useMinInstancePruning: boolean` - Default: false. If true, any leaf nodes that are only reached by a number of training instances less than the `minInstancesPerLeaf` value are pruned away.
* `minInstancesPerLeaf: number` - Default: 2. Minimum number of training instances that must reach a leaf node to spare it from pruning.
* `zValue: number` - Default: 0.69. The z-value for confidence interval calculations. Default confidence is 75% -> z-value of 0.69.


# Running the Tests
There are several units tests that validate the entropy and information gain calculations. You can run these with:
```
npm run test
```

# References
[1] Ross, Quinlan. C4.5: Programs for Machine Learning. Morgan Kaufmann Publishers Inc., 1993.
