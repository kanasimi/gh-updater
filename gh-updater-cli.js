#!/usr/bin/env node
//

var updater = require('./GitHub.updater.node.js');

// console.log(process.argv);
updater.update(process.argv[2], process.argv[3]);
