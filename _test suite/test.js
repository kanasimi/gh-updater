'use strict';

// load module
var updater = require('../GitHub.updater.node.js');

// ============================================================================

// @see work_crawler/work_crawler.updater.js

updater.update('kanasimi/CeJS', null, function(version_data) {
	require('./CeJS-master/_for include/_CeL.loader.nodejs.js');

	CeL.run([ 'data.math', 'application.debug.log' ], function() {
		CeL.assert([ CeL.GCD(4, 6), 2 ]);
	});
});
