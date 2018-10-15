[![npm version](https://badge.fury.io/js/gh-updater.svg)](https://www.npmjs.com/package/gh-updater)
[![npm downloads](https://img.shields.io/npm/dm/gh-updater.svg)](https://www.npmjs.com/package/gh-updater)
[![Known Vulnerabilities](https://snyk.io/test/github/kanasimi/gh-updater/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kanasimi/gh-updater?targetFile=package.json)

# GitHub repository auto-updater
The project aims to develop a GitHub repository auto-updater tool using 7-Zip or unzip.

##  usage 運行方式

### As CLI update tool
``` sh
node GitHub.updater.node.js user/repository-branch [target_directory]
```
default target directory: <code>repository-branch/</code>

e.g.,
``` sh
# install into gh-updater-master/
node GitHub.updater.node.js kanasimi/gh-updater
# install into current directory
node GitHub.updater.node.js kanasimi/gh-updater .
```

If installed as <code>node_modules/.bin/gh-updater</code>:
``` sh
gh-updater user/repository-branch [target_directory]
```

### As node.js module
``` JavaScript
const updater = require('gh-updater');

// to check version
updater.check_version('kanasimi/gh-updater', version_data => console.log(version_data) );

// to update
updater.update('kanasimi/gh-updater', '.');
```

## Requires
In UNIX or macOS, thie update tool will use unzip to extract files.
In Windows, the client must install [7-Zip](https://en.wikipedia.org/wiki/7-Zip) first.

## Note
The update tool checks the latest commits of GitHub repository, NOT releases or npm package.

## Contact 聯絡我們
Contact us at [GitHub](https://github.com/kanasimi/gh-updater/issues).

[![logo](https://raw.githubusercontent.com/kanasimi/CeJS/master/_test%20suite/misc/logo.jpg)](http://lyrics.meicho.com.tw/)
