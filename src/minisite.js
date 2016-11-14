"use strict";

console.log('Hello from minisite.js !')

// for IE
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
function polyfill_forEach_if_missing_on(x) {
	if (x.forEach) return

	x.forEach = function(callback, thisArg) {

		var T, k;

		if (this === null) {
			throw new TypeError(' this is null or not defined');
		}

		// 1. Let O be the result of calling toObject() passing the
		// |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get() internal
		// method of O with the argument "length".
		// 3. Let len be toUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If isCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== "function") {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. If thisArg was supplied, let T be thisArg; else let
		// T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let k be 0
		k = 0;

		// 7. Repeat, while k < len
		while (k < len) {

			var kValue;

			// a. Let Pk be ToString(k).
			//    This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty
			//    internal method of O with argument Pk.
			//    This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal
				// method of O with argument Pk.
				kValue = O[k];

				// ii. Call the Call internal method of callback with T as
				// the this value and argument list containing kValue, k, and O.
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined
	};
}
polyfill_forEach_if_missing_on(Array.prototype)

window.minisite = (function(env) {
	'use strict';

	//////////// CONSTANTS ////////////
	const CONSTS = {
		LS_KEYS: {
			last_successful_raw_config: 'minisite.last_successful_raw_config',
			last_successful_raw_pages: 'minisite.last_successful_raw_pages',
			last_successful_password: 'minisite.last_successful_password',
			last_chosen_lang: 'minisite.last_chosen_lang'
		},
		MAX_PAGES: 12,
		AVAILABLE_UI_LANGUAGES: [ 'en', 'fr' ],
		DEFAULT_UI_LANG: 'en',
		NAVIGATOR_LANG: (window.navigator.userLanguage || window.navigator.language || 'en').split('-')[0],
		NOT_SMALL_WIDTH_PX: 480, // tachyons "not small" breakpoint, experimentally measured
	}

	const I18N = {
		svg_flag: {
			en: 'third-party/flags/svg/US.svg',
			fr: 'third-party/flags/svg/FR.svg',
		},
		wall_header: {
			en: ({bride, groom}) => `Wedding of ${bride} and ${groom}`,
			fr: ({bride, groom}) => `Mariage de ${bride} et ${groom}`,
		},
		wall_text: {
			en: 'Access to this website is reserved to family and friends.',
			fr: 'L\'accès à ce site est réservé à la famille et aux amis.',
		},
		wall_password_label: {
			en: 'Password:',
			fr: 'Mot de passe :',
		},
		wall_password_placeholder: {
			en: 'XYZ:',
			fr: 'XYZ',
		},
		wall_password_cta: {
			en: 'Enter',
			fr: 'Entrer',
		},
	}

	//////////// TEMPLATES ////////////

	function TEMPLATE_WALL(data) {
		const { lang, bride, groom } = data

		return `
<div class="br2-ns bb ba-ns br2-ns b--black-10 bg-white-80 mv3-ns w-100 mw6-5 center">
	<div class="ph3">
		<h2 class="mv2"><img src="${I18N.svg_flag[lang]}" class="v-base mr2" width="26">${I18N.wall_header[lang]({ bride, groom })}</h2>
		<p class="f6">${I18N.wall_text[lang]}</p>
		<p>
		<form onSubmit="authentify(this.elements[0].value, this.elements[1].value), false">
			<label for="mdpInput">${I18N.wall_password_label[lang]}</label>
			<input id="langInput" class="dn" value="${lang}" />
			<input id="mdpInput" class="input-reset mw3" placeholder="${I18N.wall_password_placeholder[lang]}" />
			<button type="submit" class="button-reset">${I18N.wall_password_cta[lang]}</button>
		</form>
		</p>
	</div>
</div>
	`
	}

	function TEMPLATE_ANCHOR(data) {
		const { page_id, anchor } = data

		return `
<a class="link near-black dib mr3 mr4-ns" href="#page${page_id}">${anchor}</a>
	`
	}

	function TEMPLATE_FULLPAGE_SECTION_HOME(data) {
		const { lang, bride, groom } = data

		return `
<div class="section">
	<article class="dt w-100">
		<div class="dtc v-mid tc">
			<h1 class="f2 f1-ns">${I18N.wall_header[lang]({ bride, groom })}</h1>
			<h2 class="f3 f2-ns">TODO Lorem ipsum dolor sit amet</h2>

			<!-- <div id="countdown" class="dib" style="width: auto; transform: scale(.5);"></div> -->
		</div>
	</article>
</div>
`
	}

	function TEMPLATE_FULLPAGE_SECTION_DEFAULT(data) {
		const { title, picture, markdown } = data

		return `
<div class="section">
	<article class="cf ph3 ph5-ns pv3 center mw60em">
		<header class="fn fl-ns w-50-ns pr4-ns measure">
			<h1 class="f2 lh-title fw9 mb3 mt0 pt3">
				${title}
			</h1>
			<img src="content/${picture}" class="">
		</header>
		<div class="fn fl-ns w-50-ns measure">
			${marked(markdown)}
		</div>
	</article>
</div>
`
	}

	function TEMPLATE_FULLPAGE_FOOTER(data) {
		return `
<div class="section fp-auto-height">
	<footer class="pb4">
		<small class="f6 db tc">© 2016 <b class="ttu">SOME COMPANY Inc</b>., All Rights Reserved</small>
		<div class="tc mt3">
			<a href="/language/" title="Language" class="f6 dib ph2 link mid-gray dim">Language</a>
			<a href="/terms/"    title="Terms" class="f6 dib ph2 link mid-gray dim">Terms of Use</a>
			<a href="/privacy/"  title="Privacy" class="f6 dib ph2 link mid-gray dim">Privacy</a>
		</div>
	</footer>
</div>
`
	}

	//////////// TODO ////////////

	const state = {
		errors: [],
	}
	function report_error_msg(msg) { logger.error(msg), state.errors.push(msg)}

	//////////// LIBS ////////////

	const logger = console
	logger.log('constants =', CONSTS)

	const marked = env.marked
	if (! marked) report_error_msg('Expected lib "marked" not found !')

	const jsyaml = env.jsyaml
	if (! jsyaml) report_error_msg('Expected lib "jsyaml" not found !')

	const storage = env.localStorage
	if (! jsyaml) report_error_msg('Expected API "localStorage" not found !')

	//////////// SERVICES ////////////

	const PAGE_ITERATOR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // transpilation has troubles with more "clever" writings :/

	// Fetch given file or reject. Resolve with null if 404 and !expected
	function fetch_raw_file(url, expected = true) {
		return Promise
			.resolve($.ajax({
				url,
				dataType: 'text',
			}))
			.catch(function fix_bad_promise_rejection_from_jquery(jqXHR, textStatus, errorThrown) {
				const err = errorThrown || new Error(jqXHR.responseText || 'unknown error')
				err.status = err.status || jqXHR.status || 500
				throw err
			})
			.catch(function swallow_error_if_file_is_not_required(e) {
				//console.log('swallow_error_if_file_is_not_required', e, expected)
				e = e || new Error('unknown error while fetching a raw file')
				e.message = `Failed to fetch ${expected ? 'required' : 'optional'} file "${url}" ! (${e.status}, ${e.message})`

				if (e.status === 404 && !expected)
					return null /* swallow error */

				throw e
			})
	}

	function retry_until_successful_resolution(promise_returning_fn, description = '(unknown op)') {
		const MAX_TRY_COUNT = 20

		return new Promise(resolve => {
			let try_count = 0

			function attempt() {
				try_count++
				const retry_delay_ms = try_count * try_count * 1000
				console.log(`attempting ${description} #${try_count}`, retry_delay_ms)
				const p = promise_returning_fn()
				p.then(
					x => resolve(x),
					e => { if (try_count <= MAX_TRY_COUNT) setTimeout(attempt, retry_delay_ms) }
				)
			}

			attempt()
		})
	}

	function safely_parse_yaml(raw_data) {
		try {
			return jsyaml.safeLoad(raw_data, { onWarning: logger.warn })
		}
		catch (err) {
			// TODO rewrite the error to be more explicit
			err.message = 'YAML parsing: ' + err.message
			throw err
		}
	}

	// a variant of Promise.race which'll reject only when all have failed
	function promise_race_successful(p1, p2) {
		return new Promise((resolve, reject) => {
			// resolve with 1st
			p1.then(resolve)
			p2.then(resolve)
			// reject with last
			p1.catch(() => p2.catch(reject))
			p2.catch(() => p1.catch(reject))
		})
	}

	function make_deferred() {
		 const res_fn = {}

		 const p = new Promise((resolve, reject) => {
			 res_fn.resolve = resolve
			 res_fn.reject = reject
		 })

		 p.resolve = res_fn.resolve
		 p.reject = res_fn.reject

		 return p
	 }

	function log_promise(p, target) {
		p.then(
			(d) => logger.log('* promised "' + target + '" ✓', d),
			(err) => logger.error('! promised "' + target + '" ❌', err)
		)
	}

	//////////// RENDERING ////////////

	function render_wall(content, state) {
		let languages = content.config.languages
		languages = languages.filter(lang => CONSTS.AVAILABLE_UI_LANGUAGES.includes(lang))
		if (languages.length === 0) {
			if (CONSTS.AVAILABLE_UI_LANGUAGES.includes(CONSTS.NAVIGATOR_LANG))
				languages.push(CONSTS.NAVIGATOR_LANG)
			if (!languages.includes(CONSTS.DEFAULT_UI_LANG))
				languages.push(CONSTS.DEFAULT_UI_LANG)
		}

		const new_html = languages
			.map(lang => TEMPLATE_WALL(Object.assign({}, content.config, {lang})))
			.join('\n')
		const el_wall_form = document.querySelectorAll('#wall-form')[0]
		el_wall_form.innerHTML = new_html
		const el_wall = document.querySelectorAll('.wall-delayed')
		polyfill_forEach_if_missing_on(el_wall)
		el_wall.forEach(el => { if (el.classList) el.classList.remove('dn') })
	}

	function render_menu(content, state) {
		const new_html =  content.pages.map((page, i) => {
				return TEMPLATE_ANCHOR({
					page_id: i + 1,
					anchor: page.meta.anchor[state.lang],
				})
			})
			.join('\n')

		const el_menu = document.querySelectorAll('#fp-menu')[0]
		el_menu.innerHTML = new_html
	}

	function render_pages(content, state) {
		const new_html =  [
				TEMPLATE_FULLPAGE_SECTION_HOME(Object.assign({}, content.config, {lang: state.lang})),
				...content.pages.slice(1).map((page, i) => {
					return TEMPLATE_FULLPAGE_SECTION_DEFAULT({
						title: page.content[state.lang].title,
						markdown: page.content[state.lang].text,
						picture: page.meta.picture,
					})
				}),
				TEMPLATE_FULLPAGE_FOOTER()
			]
			.join('\n')

		const el_fullpage = document.querySelectorAll('#fullpage')[0]
		el_fullpage.innerHTML = new_html
	}

	function render_main(content, state) {
		console.log('render_main', content, state)

		render_menu(content, state)
		render_pages(content, state)

		// need a small timeout to let the DOM reflow before
		// 1) scrollOverflow does calculations
		// 2) fullpage attempt to scroll to required page (url options)
		setTimeout(() => {
			$('#fullpage').fullpage({
				sectionsColor: content.pages.map((page, i) => page.meta.background),
				anchors: content.pages.map((page, i) => `page${i+1}`),
				menu: '#fp-menu',
				paddingTop: '48px',
				bigSectionsDestination: 'top',
				//scrollBar: $(window).width() > CONSTS.NOT_SMALL_WIDTH_PX,
				scrollOverflow: $(window).width() > CONSTS.NOT_SMALL_WIDTH_PX,
				responsiveWidth: 480,
			})

			// countdown to ; month starts at 0
			var date  = new Date(Date.UTC(2017, 6, 1, 16, 0, 0));
			var now   = new Date();
			var diff  = date.getTime()/1000 - now.getTime()/1000;
			$('#countdown').FlipClock(diff, {
				clockFace: 'DailyCounter',
				countdown: true,
				language: 'fr'
			})
		}, 25)
	}

	function render(data) {
		logger.log('Rendering...')

		// choose best language
		logger.log('choosing lang', data.config.languages, state.lang, CONSTS.NAVIGATOR_LANG, CONSTS.DEFAULT_UI_LANG)

		const best_auto_lang = data.config.languages.includes(CONSTS.NAVIGATOR_LANG) ? CONSTS.NAVIGATOR_LANG : CONSTS.DEFAULT_UI_LANG
		logger.log('best_auto_lang', best_auto_lang)
		state.lang = state.lang || best_auto_lang || 'en'

		env.document.title = I18N.wall_header[state.lang](data.config)

		render_wall(data, state)
		render_main(data, state)
	}

	//////////// PROCESSING STEPS ////////////

	function fetch_raw_config_from_network() {
		return retry_until_successful_resolution(
			() => fetch_raw_file('content/config.yaml'),
			'fetch config'
		)
	}

	function fetch_raw_config_from_local_storage() {
		return new Promise((resolve, reject) => {
			const data = storage.getItem(CONSTS.LS_KEYS.last_successful_raw_config)

			if (typeof data === 'string') return resolve(data)

			reject(new Error('raw config not found in storage'))
		})
	}

	function cache_latest_successful_raw_config_to_local_storage([raw_config, config]) {
		storage.setItem(CONSTS.LS_KEYS.last_successful_raw_config, raw_config)
	}

	function fetch_raw_pages_from_network() {
		function attempt() {
			return Promise.all(
				PAGE_ITERATOR.map(i => fetch_raw_file(`content/page${i+1}.markdown`, false))
			)
		}

		return retry_until_successful_resolution(
			attempt,
			'fetch pages'
		)
	}

	function fetch_raw_pages_from_local_storage() {
		return new Promise((resolve, reject) => {
			const data = JSON.parse(env.localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_pages))

			if (Array.isArray(data)) return resolve(data)

			reject(new Error('raw pages not found in storage !'))
		})
	}

	function cache_latest_successful_raw_pages_to_local_storage([raw_pages, pages]) {
		debugger
		storage.setItem(CONSTS.LS_KEYS.last_successful_raw_pages, JSON.stringify(raw_pages))
	}

	function parse_config(raw_config) {
		return new Promise(resolve => resolve(safely_parse_yaml(raw_config)))
	}

	function parse_pages(raw_pages) {

		function check_coherency(raw_pages) {
			// check if a page is missing
			// TODO recode
			/*const allPagesOk = raw_pages.reduce((acc, page, index) => {
				const isPageOk = Boolean(page)
				if (!isPageOk) throw new Error(`Page ${index + 1} is missing !`)
				return acc && isPageOk
			}, true)
			if (!allPagesOk) throw new Error('A page is missing !')*/
			return raw_pages
		}

		function parse_page(raw_page, debug_id = '?') {
			logger.groupCollapsed(`parsing page "${debug_id}"...`);
			//logger.log('raw data', raw_data)

			const result = {}

			const raw_split = raw_page.split('---').map(s => s.trim()).filter(l => l)
			//logger.log('raw split', raw_split)

			let [raw_header, ...raw_content] = raw_split
			if (! raw_content.length) throw new Error('Malformed page: couldn’t separate header/content !')

			//logger.log('raw header', raw_header)

			const meta = safely_parse_yaml(raw_header)
			result.meta = meta
			//logger.log('parsed header', result.meta)

			//logger.log('raw content', raw_content)

			raw_content = raw_content.join('---') // to take into account possible useful --- in markdown

			result.content = {}

			const lines = raw_content.split('\n').map(s => s.trim())

			let current_lang = undefined
			let title = undefined
			lines.forEach(line => {
				if (line.length === 4 && line[0] === '`' && line[3] === '`') {
					// this is a lang marker
					current_lang = line.slice(1,3)
					logger.log('found lang', current_lang)
					result.content[current_lang] = {
						title: '',
						text: '',
					}
					title = undefined
					return
				}
				if (!current_lang) throw new Error('Can’t find text language !')

				if (!line && !result.content[current_lang].text) return // ignore blank lines while we haven't found the start of content

				if (!result.content[current_lang].title && line[0] === '#' && line[1] === '#') {
					// this is the tagline
					let [marker, ...remain] = line.split(' ')
					title = remain.join(' ')
					result.content[current_lang].title = remain.join(' ')
					return
				}

				result.content[current_lang].text += `${line}\n`
			})
			logger.log('parsed final result', result)

			logger.groupEnd()

			return result
		}

		return Promise.resolve(raw_pages)
			.then(check_coherency)
			.then(raw_pages => raw_pages.map(parse_page))
	}

	//////////// SEQUENCING ////////////

	const cascade = {}
	const cascade_begin_date = Date.now()

	function log_cascade(id) {
		const TIMEOUT_MS = 10 * 1000
		let resolved = false

		const p = cascade[id]
		p.then(
			(d) => {
				logger.groupCollapsed(`✓ promised "${id}" (${Date.now() - cascade_begin_date})`)
				logger.info(d)
				logger.groupEnd()
				resolved = true
			},
			(err) => {
				logger.groupCollapsed(`❌❌❌ promised "${id}" (${Date.now() - cascade_begin_date})`)
				logger.error(err)
				logger.groupEnd()
				resolved = true
			}
		)

		setTimeout(() => {
			if (resolved) return

			logger.groupCollapsed(`❌❌❌ promised "${id}" (${Date.now() - cascade_begin_date})`)
			logger.error('Timed out...')
			logger.groupEnd()
		}, TIMEOUT_MS)
	}

	////////////////////////////////////
	cascade.raw_config_from_network = fetch_raw_config_from_network()
	log_cascade('raw_config_from_network')

	////////////////////////////////////
	cascade.raw_config_fast = promise_race_successful(
		cascade.raw_config_from_network,
		fetch_raw_config_from_local_storage()
	)
	log_cascade('raw_config_fast')

	////////////////////////////////////
	cascade.config_fast = cascade.raw_config_fast.then(parse_config)
	log_cascade('config_fast')

	////////////////////////////////////
	cascade.config_latest = cascade.raw_config_from_network.then(parse_config)
	log_cascade('config_latest')

	////////////////////////////////////
	cascade.raw_pages_from_network = fetch_raw_pages_from_network()
	log_cascade('raw_pages_from_network')

	////////////////////////////////////
	cascade.raw_pages_fast = promise_race_successful(
		cascade.raw_pages_from_network,
		fetch_raw_pages_from_local_storage()
	)
	log_cascade('raw_pages_fast')

	////////////////////////////////////
	cascade.pages_fast = cascade.raw_pages_fast.then(parse_pages)
	log_cascade('pages_fast')

	////////////////////////////////////
	cascade.pages_latest = cascade.raw_pages_from_network.then(parse_pages)
	log_cascade('pages_latest')

	////////////////////////////////////
	cascade.authentication_success = make_deferred()
	log_cascade('authentication_success')

	////////////////////////////////////
	cascade.user_selected_language = make_deferred()
	log_cascade('user_selected_language')

	////////////////////////////////////

	Promise.all([
		cascade.raw_config_from_network,
		cascade.config_latest,
	]).then(cache_latest_successful_raw_config_to_local_storage)

	Promise.all([
		cascade.raw_pages_from_network,
		cascade.pages_latest,
	]).then(cache_latest_successful_raw_pages_to_local_storage)

	Promise.all([
		cascade.config_fast,
		cascade.pages_fast,
		cascade.user_selected_language,
		cascade.authentication_success,
	]).then(function TODO() {})

	return

	//////////// TOSORT XXX ////////////

	state.ready_p.then(data => render(data, state)).catch(e => console.error('rendering error', e))
	state.ready_p.then(function attempt_auto_auth(content) {
		const last_successful_password = env.localStorage.getItem(CONSTS.LS_KEYS.last_successful_password)
		if (!last_successful_password) return

		logger.info('attempting auto-auth...')
		if (last_successful_password === content.config.password) {
			state.lang = env.localStorage.getItem(CONSTS.LS_KEYS.last_chosen_lang)
			console.info(CONSTS.LS_KEYS.last_chosen_lang, env.localStorage.getItem(CONSTS.LS_KEYS.last_chosen_lang))
			on_successful_auth()
		}
	})

	env.authentify = (lang, password) => {
		logger.info('[authentify] chosen lang', lang)
		state.lang = lang
		logger.info('[authentify] checking', password)
		state.ready_p
			.then(content => {
				logger.info('[authentify] content ready, checking pwd', content.config.password)
				if (password === content.config.password) {
					state.lang = lang
					on_successful_auth()
					env.localStorage.setItem(CONSTS.LS_KEYS.last_successful_password, password)
					env.localStorage.setItem(CONSTS.LS_KEYS.last_chosen_lang, lang)
				}
				else {
					// TODO instructions !
				}
			})
	}

	state.authentified_p.then(() => {
		logger.info('Successful auth !')
		const el_wall = document.querySelectorAll('#wall')[0]
		el_wall.style.display = 'none'
		const el_site = document.querySelectorAll('.main-delayed')
		polyfill_forEach_if_missing_on(el_site)
		el_site.forEach(el => { if (el.classList) el.classList.remove('dn') })
	})

})(window)
