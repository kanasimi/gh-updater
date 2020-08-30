[![npm version](https://badge.fury.io/js/gh-updater.svg)](https://www.npmjs.com/package/gh-updater)
[![npm downloads](https://img.shields.io/npm/dm/gh-updater.svg)](https://www.npmjs.com/package/gh-updater)
[![Build Status](https://travis-ci.org/kanasimi/gh-updater.svg?branch=master)](https://travis-ci.org/kanasimi/gh-updater)
[![codecov](https://codecov.io/gh/kanasimi/gh-updater/branch/master/graph/badge.svg)](https://codecov.io/gh/kanasimi/gh-updater)

[![Known Vulnerabilities](https://snyk.io/test/github/kanasimi/gh-updater/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kanasimi/gh-updater?targetFile=package.json)
[![codebeat badge](https://codebeat.co/badges/e1f640e9-afec-482b-83b0-5c684958ba05)](https://codebeat.co/projects/github-com-kanasimi-gh-updater-master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2d3464182d23463bb851f99cf06eaa28)](https://app.codacy.com/app/kanasimi/gh-updater?utm_source=github.com&utm_medium=referral&utm_content=kanasimi/gh-updater&utm_campaign=Badge_Grade_Settings)
[![DeepScan grade](https://deepscan.io/api/teams/4788/projects/6556/branches/55215/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=4788&pid=6556&bid=55215)

# GitHub repository auto-updater
The project aims to develop a GitHub repository auto-updater tool using 7-Zip or unzip.

## Installation
1. Install [node.js](https://nodejs.org/). For windows, please also install [7-Zip](https://www.7-zip.org/) 18.01+.
2. Install gh-updater via npm:
```bash
npm i gh-updater
```

## Usage
Here lists the usage of this tool.

### As CLI update tool
If installed as `node_modules/.bin/gh-updater`:
```bash
node_modules/.bin/gh-updater user/repository-branch [target_directory]
```

Or under Windows:
```bat
node_modules\.bin\gh-updater user/repository-branch [target_directory]
```
The commands above will extract `user/repository-branch` in default target directory: `repository-branch/`

e.g.,
```bash
# install into gh-updater-master/
node_modules/.bin/gh-updater kanasimi/gh-updater-master
# install into **current directory**
node_modules/.bin/gh-updater kanasimi/gh-updater-master .
```

Testing `GitHub.updater.node.js`:
```bash
node GitHub.updater.node.js user/repository-branch [target_directory]
```

### As node.js module
```javascript
const updater = require('gh-updater');

// to check version
updater.check_version('kanasimi/gh-updater-master', version_data => console.log(version_data) );

// to update
updater.update('kanasimi/gh-updater-master', '.');
```

## OS support
| Platform | support |
| --- | --- |
| Windows | ✔️ |
| macOS | ✔️ |
| UNIX, Linux | ✔️ |

## Requires
In UNIX or macOS, thie update tool will use unzip to extract files.
In Windows, the client must install [7-Zip](https://en.wikipedia.org/wiki/7-Zip) first.

## Note
The update tool checks the latest commits of GitHub repository, NOT releases or npm package.

## Contact 聯絡我們
Contact us at [GitHub](https://github.com/kanasimi/gh-updater/issues).

[![logo](https://raw.githubusercontent.com/kanasimi/CeJS/master/_test%20suite/misc/logo.jpg)](http://lyrics.meicho.com.tw/)
