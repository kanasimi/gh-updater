'use strict';

// load module
var updater = require('../GitHub.updater.node.js');

// ============================================================================

// @see work_crawler/work_crawler.updater.js

updater.update('kanasimi/CeJS', null, function(version_data) {
	console.log(process.cwd());
	console.log(require('fs').readdirSync('.'));
	require('./CeJS-master/_for include/node.loader.js');

	CeL.run([ 'data.math', 'application.debug.log' ], function() {
		CeL.assert([ CeL.GCD(4, 6), 2 ]);
	});
});
