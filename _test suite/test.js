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

	require('../CeJS-master/_for include/node.loader.js');

	CeL.run([ 'data.math', 'application.debug.log' ], function() {
		CeL.assert(require('fs').readdirSync('.').includes('wikibot-master'),
				'node gh-updater-cli.js kanasimi/wikibot');

		// CeL.log('test: ' + CeL.GCD(4, 6));
		CeL.assert([ CeL.GCD(4, 6), 2 ]);
	});
});

// For node >= 10.0
process.env.NODE_PATH += ':../node_modules';
updater.update_package('wikiapi');
var Wikiapi = require('wikiapi');

// load page
(function() {
	var wiki = new Wikiapi;
	wiki.page('Universe')
	//
	.then(function(page_data) {
		CeL.assert(page_data.wikitext.includes('space]]')
		//
		&& page_data.wikitext.includes('time]]'), 'load page: wikitext');
	});
})();
