#!/usr/bin/env node
// @see https://github.com/electron/electron
var updater = require('./GitHub.updater.node.js');

var child_process = require('child_process');

var child = child_process.spawn(updater, process.argv, {
	stdio : 'inherit'
})
child.on('close', function(code) {
	process.exit(code);
})

var handle_termination_signal = function(signal) {
	process.on(signal, function signal_handler() {
		if (!child.killed) {
			child.kill(signal)
		}
	})
}

handle_termination_signal('SIGINT');
handle_termination_signal('SIGTERM');
