// @see work_crawler/work_crawler.updater.js

'use strict';

// load module
var updater = require('../GitHub.updater.node.js');

// ============================================================================

function main_test() {
	updater.check_version('kanasimi/gh-updater-master', function(version_data) {
		CeL.assert([ version_data.user_name, 'kanasimi' ],
				'version_data.user_name');
		CeL.assert([ version_data.repository, 'gh-updater' ],
				'version_data.repository');
		CeL.assert([ version_data.branch, 'master' ], 'version_data.branch');
		CeL.assert(Date.parse(version_data.latest_version) > Date
				.parse('2017-01-01'), 'version_data.latest_version');
	});

	CeL.run([ 'data.math', 'application.debug.log' ], function() {
		CeL.assert(require('fs').readdirSync('.').includes('wikibot-master'),
				'node gh-updater-cli.js kanasimi/wikibot');

		// CeL.log('test: ' + CeL.GCD(4, 6));
		CeL.assert([ CeL.GCD(4, 6), 2 ]);
	});
}

updater.update('kanasimi/CeJS', null, function(version_data) {
	// /home/travis/build/kanasimi/gh-updater
	// console.log(process.cwd());

	// has 'CeJS-master'
	// console.log(require('fs').readdirSync('.'));

	require('../CeJS-master/_for include/node.loader.js');

	main_test();
});

// For node >= 10.0
// process.env.NODE_PATH += ':../node_modules';
updater.update_package('wikiapi');

// load page
(function() {
	/**
	 * <code>

	var Wikiapi = require('wikiapi');
	var wiki = new Wikiapi;
	wiki.page('Universe')
	//
	.then(function(page_data) {
		CeL.assert(page_data.wikitext.includes('space]]')
		//
		&& page_data.wikitext.includes('time]]'), 'load page: wikitext');
	});

	 </code>
	 */
})();
