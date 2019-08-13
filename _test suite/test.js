'use strict';

// load module
var updater = require('../GitHub.updater.node.js');

// ============================================================================

// @see work_crawler/work_crawler.updater.js

updater.update('kanasimi/CeJS', null, function(version_data) {
	var CeL = require('cejs');

	console.log(CeL);
});
