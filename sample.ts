import {C45, DataSet, Display} from './src/';

const owlDataSet = new DataSet('test/owls15.csv', 'test/owls15-schema.json', 66);
const owlC45 = new C45(owlDataSet);
owlC45.train();
owlC45.prune();
owlC45.test();
const visualizeResults = new Display('sample', owlC45);
visualizeResults.display();
