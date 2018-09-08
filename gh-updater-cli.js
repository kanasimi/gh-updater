#!/usr/bin/env node
//

function handle_termination_signal(signal) {
	process.on(signal, function signal_handler() {
		if (!child.killed) {
			child.kill(signal);
		}
	})
}

handle_termination_signal('SIGINT');
handle_termination_signal('SIGTERM');

var updater = require('./GitHub.updater.node.js');

// console.log(process.argv);
updater.update(process.argv[2], process.argv[3]);
