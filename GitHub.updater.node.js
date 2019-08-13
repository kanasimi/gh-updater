/**
 * @name gh-updater. GitHub repository auto-updater, and auto-update CeJS via
 *       GitHub. GitHub repository 自動更新工具 / 自動配置好最新版本 CeJS 程式庫的工具。
 * 
 * @fileoverview 將會採用系統已有的 7-Zip 程式，自動取得並解開 GitHub 最新版本 repository zip
 *               壓縮檔案至當前工作目錄下 (e.g., ./CeJS-master)。
 * 
 * @example<code>

TODO:
use Zlib

use https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.archive/Expand-Archive?view=powershell-6
https://docs.microsoft.com/en-us/windows/desktop/api/shldisp/nf-shldisp-folder-copyhere

 </code>
 * 
 * @see https://stackoverflow.com/questions/1021557/how-to-unzip-a-file-using-the-command-line
 * 
 * @since 2017/3/13 14:39:41 初版<br />
 *        2018/8/20 12:52:34 改寫成 GitHub 泛用的更新工具 GitHub Upgrade Tool，並將
 *        _CeL.path.txt → _repository_path_list.txt<br />
 *        2018/8/30 20:17:7 增加 target_directory 功能。<br />
 *        2018/9/8 18:29:29 Create npm package: gh-updater, _CeL.updater.node.js →
 *        gh-updater/GitHub.updater.node.js
 */

/** global: Buffer */

'use strict';

// --------------------------------------------------------------------------------------------
// setup. 設定區。

var default_repository_path = 'kanasimi/CeJS', extract_program_path = [ '7z',
// e.g., install p7zip package via yum
'7za', 'unzip',
// '%ProgramFiles%\\7-Zip\\7z.exe',
'"' + (process.env.ProgramFiles || 'C:\\Program Files') + '\\7-Zip\\7z.exe"' ],

// modify from _CeL.loader.nodejs.js
repository_path_list_file = './_repository_path_list.txt',
/** {String}CeJS 更新工具相對於 CeJS 根目錄的路徑。 e.g., "CeJS-master/_for include/". const */
default_update_script_directory = '_for include/',

// const
node_https = require('https'), node_fs = require('fs'), node_child_process = require('child_process'), path_separator = require('path').sep,
// e.g., "kanasimi/gh-updater-master"
// matched: [ all, user_name, repository+branch ]
PATTERN_repository_path = /([a-z\d_\-]+)\/([a-z\d_\-]+?)(?:-([a-z\d_]+))?$/i;

// --------------------------------------------------------------------------------------------

function test_each_path(repository, branch, path) {
	if (path.charAt(0) === '#'
	//
	&& path.endsWith(repository + '-' + branch)) {
		// path is comments
		return false;
	}

	var matched = path.match(/(?:^|[\\\/])([a-z_\d]+)-([a-z_\d]+)[\\\/]?$/i);
	if (matched && (matched[1] !== repository || matched[2] !== branch)) {
		// 是其他 repository 的 path。
		return false;
	}

	// ensure `path` is directory
	try {
		var fso_status = node_fs.lstatSync(path);
		if (!fso_status.isDirectory()
		//
		|| /^\.\.(?:$|[\\\/])/.test(path) && !node_fs.existsSync('../ce.js')) {
			return false;
		}
	} catch (e) {
		// try next path
		return false;
	}

	// console.info('detect_base_path: Use base path: ' + path);
	return path;
}

/**
 * Detect if the CeJS repository exists in the pathes listed in the
 * `repository_path_list_file`, test one by one.
 * 
 * @param {String}repository
 *            CeJS repository name
 * @param {String}branch
 *            branch name
 */
function detect_base_path(repository, branch) {
	var CeL_path_list;

	try {
		CeL_path_list = node_fs.readFileSync(repository_path_list_file)
				.toString();
	} catch (e) {
		// node_fs.readFileSync() may throw but no matter
	}

	if (!CeL_path_list) {
		// ignore repository_path_list_file
		return undefined;
	}

	// modify from _CeL.loader.nodejs.js
	CeL_path_list = CeL_path_list.split(CeL_path_list.includes('\n') ? /\r?\n/
			: '|');
	CeL_path_list.unshift('./' + repository + '-' + branch);
	// console.log(CeL_path_list);
	// 載入 CeJS 基礎泛用之功能。（非特殊目的使用的載入功能）
	for (var index = 0; index < CeL_path_list.length; index++) {
		var target_directory = test_each_path(repository, branch,
				CeL_path_list[index]);
		if (target_directory) {
			return target_directory;
		}
	}
}

// --------------------------------------------------------------------------------------------

function simplify_path(path) {
	return path.replace(/[\\\/]+$/, '').replace(/^(?:\.\/)+/, '') || '.';
}

// 把 source_directory 下面的檔案全部搬移到 target_directory 下面去。
function move_all_files_under_directory(source_directory, target_directory,
		overwrite, create_empty_directory) {
	if (!target_directory) {
		return 'NEEDLESS';
	}

	function move(_source, _target) {
		var fso_list = node_fs.readdirSync(_source);
		if (!node_fs.existsSync(_target)
		// 對於空目錄看看是否要創建一個。
		&& (fso_list.length > 0 || create_empty_directory)) {
			node_fs.mkdirSync(_target);
		}
		_source += path_separator;
		_target += path_separator;
		fso_list.forEach(function(fso_name) {
			var fso_status = node_fs.lstatSync(_source + fso_name);
			if (fso_status.isDirectory()) {
				move(_source + fso_name, _target + fso_name);
			} else {
				if (node_fs.existsSync(_target + fso_name)) {
					if (overwrite) {
						node_fs.unlinkSync(_target + fso_name);
					} else {
						return undefined;
					}
				}
				// console.log(_source + fso_name+'→'+ _target + fso_name);
				node_fs.renameSync(_source + fso_name, _target + fso_name);
			}
			return undefined;
		});
		node_fs.rmdirSync(_source);
		return undefined;
	}

	source_directory = simplify_path(source_directory);
	target_directory = simplify_path(target_directory);
	if (source_directory !== target_directory) {
		console.log('move_all_files_under_directory [' + source_directory
				+ ']→[' + target_directory + ']');
		move(source_directory, target_directory);
	}
	return undefined;
}

/**
 * determine what extract program to use.
 * 
 * @param {Array|String}extract_program_path
 *            Array: path list to test, String: using this path.
 * 
 * @returns {String} extract program path. e.g., `/path/to/7z`
 */
function detect_extract_program_path(extract_program_path) {
	if (!Array.isArray(extract_program_path)) {
		return extract_program_path;
	}

	// var program_path = undefined;
	var program_path;
	// detect 7zip path: 若是 $PATH 中有 7-zip 的可執行檔，應該在這邊就能夠被偵測出來。
	extract_program_path.some(function(path) {
		var normalized_path = path.trim();
		if (!normalized_path) {
			return false;
		}
		// console.log('detect_extract_program_path: ' + normalized_path);

		// mute stderr
		// var stderr = process.stderr.write;
		// process.stderr.write = function() { };
		try {
			node_child_process.execSync(normalized_path + ' -h', {
				stdio : 'ignore'
			});
			program_path = normalized_path;
			return true;
		} catch (e) {
			// console.error(e);
		}
		// process.stderr.write = stderr;
		return false;
	});
	// else: Can not find any extract program.

	return program_path;
}

// --------------------------------------------------------

// @see function get_URL_node() @ CeL.application.net.Ajax
function get_proxy_server() {
	return process.env.http_proxy;
}

function get_target_file(version_data) {
	return version_data.repository + '-' + version_data.branch + '.zip';
}

function extract_repository_archive(version_data, post_install,
		target_directory, sum_size) {
	/** {String}下載之後將壓縮檔存成這個檔名。 */
	var target_file = get_target_file(version_data);

	console.info(target_file + ': ' + sum_size
			+ ' bytes done. Extracting files to ' + process.cwd() + '...');

	// check file size
	var file_size = node_fs.statSync(target_file).size;
	if (file_size !== sum_size) {
		throw 'The file size ' + file_size + ' is not ' + sum_size
				+ ' bytes! Please try to run again.';
	}

	if (!extract_program_path) {
		throw 'Please extract the archive file manually: ' + target_file;
	}

	var command,
	//
	quoted_target_file = '"' + target_file + '"';
	if (extract_program_path.includes('unzip')) {
		command = extract_program_path + ' -t ' + quoted_target_file + ' && '
		// 解開 GitHub 最新版本壓縮檔案 via unzip。
		+ extract_program_path + ' -x -o ' + quoted_target_file;
	} else {
		command = extract_program_path + ' t ' + quoted_target_file + ' && '
		// 解開 GitHub 最新版本壓縮檔案 via 7z。
		+ extract_program_path + ' x -y ' + quoted_target_file;
	}

	node_child_process.execSync(command, {
		// pass I/O to the child process
		// https://nodejs.org/api/child_process.html#child_process_options_stdio
		stdio : 'inherit'
	});

	if (version_data.latest_version) {
		node_fs.writeFileSync(version_data.latest_version_file, JSON
				.stringify(version_data));

		try {
			// 解壓縮完成之後，可以不必留著程式碼檔案。 TODO: backup
			node_fs.unlinkSync(target_file);
		} catch (e) {
			// node_fs.unlinkSync() may throw but no matter
		}

		var repository_path = version_data.repository + '-'
				+ version_data.branch;
		move_all_files_under_directory(repository_path, target_directory, true);
		var update_script_path = (target_directory ? target_directory.replace(
				/[\\\/]+$/, '') : repository_path)
				+ path_separator + default_update_script_directory;

		// 成功解壓縮。
		console.info('Successful decompression: ' + version_data.repository);

		if (typeof post_install === 'function') {
			post_install(update_script_path);
		}
	}

	// throw 'Some error occurred! Bad archive?';
}

function download_repository_archive(version_data, post_install,
		target_directory) {
	/** {String}下載之後將壓縮檔存成這個檔名。 */
	var target_file = get_target_file(version_data);

	try {
		// 清理戰場。
		node_fs.unlinkSync(target_file);
	} catch (e) {
		// node_fs.unlinkSync() may throw but no matter
	}

	var archive_url = 'https://codeload.github.com/' + version_data.user_name
	//
	+ '/' + version_data.repository + '/zip/' + version_data.branch;

	// ----------------------------------------------------

	if (get_proxy_server()) {
		console.log('It seems you using proxy server: ' + get_proxy_server()
				+ '. Downloading tool to use proxy server...');
		update_package('cejs');
		var CeL = require('cejs');
		CeL.run('application.net.Ajax');
		CeL.get_URL_cache(archive_url, function(data, error, XMLHttp) {
			extract_repository_archive(version_data, post_install,
			//
			target_directory, XMLHttp.buffer.length);
		}, {
			file : target_file,
			charset : 'buffer',
			get_URL_options : {
				error_retry : 2
			}
		});
		return;
	}

	// ----------------------------------------------------

	// 先確認/轉到目標目錄，才能 open file。
	var write_stream = node_fs.createWriteStream(target_file),
	// 已經取得的檔案大小
	sum_size = 0, start_time = Date.now(), total_size;

	function on_response(response) {
		// 採用這種方法容易漏失資料。 @ node.js v7.7.3
		// response.pipe(write_stream);

		// 可惜 GitHub 沒有提供 Content-Length，無法加上下載進度。
		total_size = +response.headers['content-length'];
		var buffer_array = [];

		response.on('data', function(data) {
			sum_size += data.length;
			buffer_array.push(data);
			process.stdout.write(target_file + ': ' + sum_size
			//
			+ (total_size ? '/' + total_size : '') + ' bytes ('
			// 00% of 0.00MiB
			+ (total_size ? (100 * sum_size / total_size | 0) + '%, ' : '')
			//
			+ (sum_size / 1.024 / (Date.now() - start_time)).toFixed(2)
					+ ' KiB/s)...\r');
		});

		response.on('end', function(/* error */) {
			if (total_size && sum_size !== total_size) {
				console.error('Expected ' + total_size + ' bytes, but get '
						+ sum_size + ' bytes!');
			}
			write_stream.write(Buffer.concat(buffer_array, sum_size));
			// flush data
			write_stream.end();
		});
	}

	// 取得 GitHub 最新版本 .zip 壓縮檔案。
	node_https.get(archive_url, on_response)
	//
	.on('error', function(error) {
		// network error?
		// console.error(error);
		throw error;
	});

	// ---------------------------

	write_stream.on('close', function() {
		extract_repository_archive(version_data, post_install,
		//
		target_directory, sum_size);
	});
}

// --------------------------------------------------------

function update_via_7zip(version_data, post_install, target_directory) {
	extract_program_path = detect_extract_program_path(extract_program_path);
	if (!extract_program_path
	// Windows 10: 'win32'
	&& process.platform.startsWith('win')) {
		try {
			extract_program_path = (process.env.TEMP || process.env.TMP || '.')
					+ path_separator + 'detect_7z_path.' + Math.random()
					+ '.js';
			// @see CeL.application.storage.archive
			// @see run_JSctipt() @ CeL.application.platform.nodejs
			// try to read 7z program path from Windows registry
			var command = "var WshShell=WScript.CreateObject('WScript.Shell'),key='HKCU\\\\Software\\\\7-Zip\\\\Path';"
					// use stdout
					+ "try{WScript.Echo(WshShell.RegRead(key+64));WScript.Quit();}catch(e){}"
					+ "try{WScript.Echo(WshShell.RegRead(key));}catch(e){}";
			node_fs.writeFileSync(extract_program_path, command);
			extract_program_path = node_child_process.spawnSync('CScript.exe',
					[ '//Nologo', extract_program_path ]);
			// add_quote()
			extract_program_path = '"'
					+ extract_program_path.stdout.toString().trim() + '7z.exe'
					+ '"';
			// console.log(extract_program_path);
			extract_program_path = detect_extract_program_path([ extract_program_path ]);
		} catch (e) {
			extract_program_path = null;
		}
	}

	if (!extract_program_path) {
		// 'Please set up the extract_program_path first!'
		console.error('Please install 7-Zip first: https://www.7-zip.org/');
	}

	// assert: typeof extract_program_path === 'string'
	// console.log(extract_program_path);

	// ------------------------------------------

	download_repository_archive(version_data, post_install, target_directory);
}

// --------------------------------------------------------------------------------------------

// parse repository path
function parse_repository_path(repository_path) {
	if (typeof repository_path === 'object' && repository_path.user_name
			&& repository_path.repository && repository_path.branch) {
		return repository_path;
	}

	/** {String}Repository name */
	var repository = repository_path.trim().match(PATTERN_repository_path),
	//
	user_name = repository[1], branch = repository[3] || 'master';
	repository = repository[2];

	return {
		user_name : user_name,
		repository : repository,
		branch : branch
	};
}

function installed_version(repository_path, callback, target_directory) {
	var original_working_directory, version_data = parse_repository_path(repository_path),
	//
	repository = version_data.repository, branch = version_data.branch;

	if (!target_directory) {
		target_directory = detect_base_path(repository, branch);
	} else if (!node_fs.existsSync(target_directory)) {
		node_fs.mkdirSync(target_directory);
	}
	if (target_directory) {
		// console.log('target_directory: ' + target_directory);
		target_directory = target_directory.replace(/[\\\/]+$/, '');
		if (target_directory
				&& (target_directory.endsWith(path_separator + repository + '-'
						+ branch) || target_directory.endsWith('\\'
						+ repository + '-' + branch))) {
			original_working_directory = process.cwd();
			process.chdir(target_directory.slice(0, -(path_separator
					+ repository + '-' + branch).length));
		}
		// target_directory += path_separator;
	}

	var latest_version_file = repository + '-' + branch + '.version.json', has_version, has_version_data;
	console.info('Read the latest version from cache file '
			+ latest_version_file);
	try {
		has_version_data = JSON.parse(node_fs.readFileSync(latest_version_file)
				.toString());
		has_version = has_version_data.latest_version;
		// 不累積古老的(前前次)之 version_data。
		delete has_version_data.has_version_data;
	} catch (e) {
		// Unexpected use of undefined. (no-undefined)
		// has_version = undefined;
	}

	Object.assign(version_data, {
		check_date : new Date(),

		latest_version_file : latest_version_file,
		has_version_data : has_version_data,
		has_version : has_version
	});

	function recover_working_directory() {
		original_working_directory && process.chdir(original_working_directory);
	}

	if (typeof callback === 'function') {
		try {
			callback(version_data, original_working_directory
			// recover working directory.
			&& recover_working_directory);
		} catch (e) {
			recover_working_directory();
		}
	} else {
		recover_working_directory();
	}

	return version_data;
}

function get_GitHub_version(repository_path, callback/* , target_directory */) {
	var version_data = parse_repository_path(repository_path), user_name = version_data.user_name, repository = version_data.repository, branch = version_data.branch;

	console.info('Get the infomation of latest version of '
	// 取得 GitHub 最新版本 infomation。
	+ repository + '...');
	node_https.get({
		// https://api.github.com/repos/kanasimi/CeJS/commits/master
		host : 'api.github.com',
		path : '/repos/' + user_name + '/' + repository + '/commits/' + branch,
		// https://developer.github.com/v3/#user-agent-required
		headers : {
			'user-agent' : 'CeL_updater/2.0'
		}
	}, function(response) {
		response.setTimeout(10000);
		var buffer_array = [], sum_size = 0;

		response.on('data', function(data) {
			sum_size += data.length;
			buffer_array.push(data);
		});

		response.on('end', function(/* error */) {
			var contents = Buffer.concat(buffer_array, sum_size).toString(),
			//
			latest_commit = JSON.parse(contents),
			//
			latest_version = latest_commit.commit.author.date;

			Object.assign(version_data, {
				check_date : new Date(),

				latest_commit : latest_commit,
				latest_version : latest_version
			});

			callback(version_data);
		});
	})
	//
	.on('error', function(error) {
		// network error?
		console.error(error);
		callback(version_data);
	});
}

/**
 * detect repository version
 * 
 * @param {String}repository_path
 *            repository path. e.g., user/repository-branch
 * @param {Function}callback
 * @param {String}[target_directory]
 *            install repository to this local file system path.
 *            目標目錄位置。將會解壓縮至這個目錄底下。 default: repository-branch/
 */
function check_version(repository_path, callback, target_directory) {
	if (!repository_path) {
		throw 'No repository path specified!';
	}

	installed_version(repository_path, function(version_data,
			recover_working_directory) {
		get_GitHub_version(version_data, function(version_data) {
			version_data.has_new_version
			//
			= version_data.has_version !== version_data.latest_version
					&& version_data.latest_version;

			callback(version_data, recover_working_directory);
		}/* , target_directory */);
	}, target_directory);
}

function check_and_update(repository_path, target_directory, callback) {

	check_version(repository_path, function(version_data,
			recover_working_directory) {
		var has_version = version_data.has_version,
		//
		latest_version = version_data.latest_version;

		function recover(update_script_path) {
			if (typeof callback === 'function') {
				callback(version_data, recover_working_directory,
						target_directory || '', update_script_path);
			} else if (recover_working_directory) {
				recover_working_directory();
			}
		}

		if (version_data.has_new_version) {
			process.title = 'Update ' + repository_path;
			console.info('Update: '
					+ (has_version ? has_version + '\n     → ' : 'to ')
					+ latest_version);
			update_via_7zip(version_data, recover, target_directory);

		} else {
			console.info('Already have the latest version: ' + has_version);
			recover();
		}

	}, target_directory);

}

// --------------------------------------------------------------------------------------------

function copy_library_file(source_name, taregt_name, base_directory,
		update_script_path) {
	var taregt_path = (base_directory || '') + (taregt_name || source_name);
	try {
		node_fs.unlinkSync(taregt_path);
	} catch (e) {
		// node_fs.unlinkSync() may throw
		// TODO: handle exception
	}
	if (false) {
		console.log('copy_library_file [' + update_script_path + source_name
				+ ']→[' + taregt_path + ']');
	}
	node_fs.renameSync(update_script_path + source_name, taregt_path);
}

// --------------------------------------------------------------------------------------------
// actions after file extracted

function default_post_install_for_all(/* base_directory */) {
}

function default_post_install(base_directory, update_script_path) {
	if (false) {
		// using npm instead: require('gh-updater');
		console.info('Update the tool itself...');
		copy_library_file('gh-updater/GitHub.updater.node.js', null,
				base_directory);
	}

	console.info('Setup basic execution environment...');
	copy_library_file('_CeL.loader.nodejs.js', null, base_directory,
			update_script_path);
	try {
		// Do not overwrite repository_path_list_file.
		node_fs.accessSync(base_directory + repository_path_list_file,
				node_fs.constants.R_OK);
	} catch (e) {
		try {
			node_fs.renameSync(update_script_path
					+ repository_path_list_file.replace(/(\.[^.]+)$/,
							'.sample$1'), base_directory
					+ repository_path_list_file);
		} catch (e) {
			// node_fs.renameSync() may throw
			// TODO: handle exception
		}
	}
}

// --------------------------------------------------------------------------------------------

/**
 * handle arguments when running with CLI or calling with `updater.update(...)`
 * 
 * @param {String}repository_path
 *            repository path
 * @param {any}target_directory
 *            target directory
 * @param {any}callback
 *            callback when updated
 */
function handle_arguments(repository_path, target_directory, callback) {
	if (repository_path ? PATTERN_repository_path.test(repository_path)
			: default_repository_path) {
		check_and_update(repository_path || default_repository_path,
		// run in CLI. GitHub 泛用的更新工具。
		target_directory, function(version_data, recover_working_directory,
				target_directory, update_script_path) {
			if (version_data.has_new_version) {
				// 在 repository 目錄下執行 post_install()
				(repository_path ? default_post_install_for_all
						: default_post_install)(target_directory,
						update_script_path);
				// 成功安裝了 repository 的組件。
				console.info('Successfully installed '
						+ version_data.repository);
			}
			// 之後回到原先的目錄底下。
			if (recover_working_directory) {
				recover_working_directory();
			}
			if (typeof callback === 'function') {
				callback(version_data);
			}
		});

	} else {
		console.log((repository_path ? 'Invalid repository: '
		// node GitHub.updater.node.js user/repository-branch [target_directory]
		+ JSON.stringify(repository_path) : '') + 'Usage:\n	'
				+ process.argv[0].replace(/[^\\\/]+$/)[0] + ' '
				+ process.argv[1].replace(/[^\\\/]+$/)[0]
				+ ' "user/repository-branch" ["target_directory"]'
				+ '\n\ndefault repository path: ' + default_repository_path);
	}
}

// --------------------------------------------------------------------------------------------
// other tools not used by this module itself

var npm_updated;
function npm_update_all(force) {
	if (npm_updated && !force)
		return;

	require('child_process').execSync('npm update', {
		stdio : 'inherit'
	});
	npm_updated = true;
}

function show_info(message) {
	process.title = message;
	console.info('\x1b[35;46m' + message + '\x1b[0m');
}

// npm install package_name
function update_package(package_name, for_development, message, options) {
	if (!/^[\w\d_\-]+$/.test(package_name)) {
		throw new Error('update_package: Invalid package name: ' + package_name);
	}

	var module_installed;
	try {
		// 先測試看看套件存不存在。存在就不用重新安裝了。
		require(package_name);
		module_installed = true;

		// 但這會造成套件有新版本時不會更新的問題。因此可能的話，還是應強制檢測安裝。
		if (options && options.skip_installed) {
			return;
		}
	} catch (e) {
		// e.code: 'MODULE_NOT_FOUND'
		// console.error(e);
	}

	show_info(message || ((module_installed ? '更新' : '安裝')
	// for development purpose
	+ (for_development ? '開發時' : '執行時')
	// 下載並更新本工具需要用到的套件 [gh-updater]...
	+ '需要用到的組件 [' + package_name + ']...'));

	if (!node_fs.existsSync('node_modules')) {
		// Install in the current directory.
		node_fs.mkdirSync('node_modules');
	}

	require('child_process').execSync('npm '
	//
	+ (module_installed ? 'update' : 'install') + ' '
	// https://github.com/kanasimi/work_crawler/issues/104
	// https://docs.npmjs.com/cli/install
	// npm install electron --save-dev
	// sudo npm install -g electron --unsafe-perm=true --allow-root
	+ (for_development ? '--save-dev ' : '') + package_name + '@latest', {
		stdio : 'inherit'
	});
}

// --------------------------------------------------------------------------------------------
// main process

if (typeof module === 'object' && module !== require.main) {
	// required as module
	module.exports = {
		parse_repository_path : parse_repository_path,
		installed_version : installed_version,
		get_GitHub_version : get_GitHub_version,
		check_version : check_version,
		// TODO: use Promise
		update : handle_arguments,
		update_package : update_package,
		npm_update_all : npm_update_all
	};

} else {
	// default action: update
	handle_arguments(process.argv[2], process.argv[3]);
}
