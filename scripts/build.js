#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec /usr/bin/env node "$0" "$@"
'use strict';

const path = require('path')

//const _ = require('lodash')
const semver = require('semver')
const fs = require('@offirmo/cli-toolbox/fs/extra')


const NEEDED_FILES_FROM_MODULES = [
	// order matters !
	'@typicode/pegasus/dist/pegasus.js',
	'tachyons/css/tachyons.min.css',
	'js-yaml/dist/js-yaml.js',
	'jquery/dist/jquery.js',
	'fullpage.js/vendors/scrolloverflow.js',
	'fullpage.js/dist/jquery.fullpage.extensions.min.js',
	'fullpage.js/dist/jquery.fullpage.css',
	'flipclock/compiled/flipclock.js',
	'flipclock/compiled/flipclock.css',
]

const MODULES_ROOT = 'node_modules'
const BUILD_DIR = 'third-party'

fs.emptyDirSync(BUILD_DIR)

let header_deps = ''

NEEDED_FILES_FROM_MODULES.forEach(dep_path => {
	const module = dep_path.startsWith('@') ? dep_path.split('/').slice(0, 2).join('/') : dep_path.split('/')[0]

	const version = semver.clean(require(`${module}/package.json`).version)
	const id = (module.endsWith('js') ? module.slice(0, -3) : module).split('/').slice(-1)[0]
	const dep_path_parsed = path.parse(dep_path)

	let target_name = dep_path_parsed.name
	if (! target_name.includes(id)) target_name = id + '.' + target_name
	target_name = target_name.slice(target_name.indexOf(id))

	let target_filename = target_name + '@' + version + dep_path_parsed.ext
	let target_filename_major = target_name + '@' + semver.major(version) + dep_path_parsed.ext
	console.log(module, version, id, semver.major(version), target_filename, target_filename_major)

	fs.copySync(path.join(MODULES_ROOT, dep_path), path.join(BUILD_DIR, target_filename))
	fs.copySync(path.join(BUILD_DIR, target_filename), path.join(BUILD_DIR, target_filename_major))

	if (dep_path_parsed.ext === '.css')
		header_deps += `\n<link rel="stylesheet" type="text/css" href="../${BUILD_DIR}/${target_filename_major}" />`
	else
		header_deps += `\n<script src="../${BUILD_DIR}/${target_filename_major}"></script>`
})

console.log(header_deps)
