#!/bin/sh
':' //# http://sambal.org/?p=1014 ; exec /usr/bin/env node "$0" "$@"
'use strict';

const path = require('path')

//const _ = require('lodash')
const semver = require('semver')
const fs = require('@offirmo/cli-toolbox/fs/extra')


const NEEDED_FILES_FROM_MODULES = [
	'jquery/dist/jquery.js',
	'fullpage.js/vendors/scrolloverflow.js',
	'fullpage.js/dist/jquery.fullpage.extensions.min.js',
	'fullpage.js/dist/jquery.fullpage.css',
	'flipclock/compiled/flipclock.js',
	'flipclock/compiled/flipclock.css',
	'tachyons/css/tachyons.min.css',
]

const FILES_RENAMES = {
	'fullpage.js/vendors/scrolloverflow.js':
		''
}

const MODULES_ROOT = 'node_modules'
const BUILD_DIR = 'third-party'

fs.emptyDirSync(BUILD_DIR)

NEEDED_FILES_FROM_MODULES.forEach(dep_path => {
	const [module, ...temp] = dep_path.split('/')
	const [filename] = temp.slice(-1)

	const version = semver.clean(require(`${module}/package.json`).version)
	const id = module.endsWith('js') ? module.slice(0, -3) : module
	const dep_path_parsed = path.parse(dep_path)

	let target_name = dep_path_parsed.name
	if (! target_name.includes(id)) target_name = id + '.' + target_name
	target_name = target_name.slice(target_name.indexOf(id))

	let target_filename = target_name + '@' + version + dep_path_parsed.ext
	let target_filename_major = target_name + '@' + semver.major(version) + dep_path_parsed.ext
	console.log(module, version, id, filename, semver.major(version), target_filename, target_filename_major)

	fs.copySync(path.join(MODULES_ROOT, dep_path), path.join(BUILD_DIR, target_filename))
	fs.copySync(path.join(BUILD_DIR, target_filename), path.join(BUILD_DIR, target_filename_major))
})
