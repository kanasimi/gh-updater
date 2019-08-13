'use strict';

// load module
var updater = require('../GitHub.updater.node.js');

// ============================================================================

// @see work_crawler/work_crawler.updater.js

updater.update('kanasimi/CeJS', null, function(version_data) {
	// /home/travis/build/kanasimi/gh-updater
	// console.log(process.cwd());
	// has 'CeJS-master'
	// console.log(require('fs').readdirSync('.'));
	require('../CeJS-master/ce.js');
	require('../CeJS-master/_for include/node.loader.js');

	CeL.run([ 'data.math', 'application.debug.log' ], function() {
		CeL.assert([ CeL.GCD(4, 6), 2 ]);
	});
});
