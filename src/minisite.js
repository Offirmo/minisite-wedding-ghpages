"use strict";

console.log('Hello from minisite.js')

window.minisite = (function(env) {
	'use strict';

	////////////////////////////////////
	const CONSTS = {
		LS_KEYS: {
			last_successful_password: 'minisite.last_successful_password',
			last_chosen_lang: 'minisite.last_chosen_lang'
		},
		MAX_PAGES: 12,
		AVAILABLE_UI_LANGUAGES: [ 'en', 'fr' ],
		DEFAULT_UI_LANG: 'en',
		NAVIGATOR_LANG: (window.navigator.userLanguage || window.navigator.language || 'en').split('-')[0]
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

	// Helper
	//const PAGE_ITERATOR = [...Array(CONSTS.MAX_PAGES)].map((x, i) => i)
	const PAGE_ITERATOR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] // transpilation has troubles

	////////////////////////////////////
	let on_successful_load
	let on_successful_auth

	const state = {
		is_ready: false,
		ready_p: new Promise((resolve) => on_successful_load = resolve),
		is_authentified: false,
		authentified_p: new Promise((resolve) => on_successful_auth = resolve),
		lang: undefined,
		errors: [],
	}

	////////////////////////////////////

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

	function TEMPLATE_FULLPAGE_SPLASH(data) {
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

	function TEMPLATE_FULLPAGE_SECTION(data) {
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



	////////////////////////////////////
	const logger = console
	logger.log('constants', CONSTS, PAGE_ITERATOR)

	const pegasus = env.pegasus // TODO use fetch
	if (! pegasus) state.errors.push('Expected lib "pegasus" not found !')

	const marked = env.marked
	if (! marked) state.errors.push('Expected lib "marked" not found !')

	////////////////////////////////////

	function fetch_raw_file(url, required = false) {
		// turn pegasus into real promise
		const p = new Promise((resolve, reject) => pegasus(url).then((x, xhr) => resolve(xhr.responseText), reject))

		return p
			.catch(e => {
				e = e || new Error('unknown error')
				e.message = `Failed to load ${required ? 'required' : 'optional'} file "${url}" ! (${e.message})`
				if (required)
					throw e
				else
					logger.warn(e)
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

	function attempt_load() {
		logger.info('Attempting to load latest data...')

		const raw = {
			fetch_begin_date: Date.now(),
			fetch_end_date: undefined,
			config: undefined,
			pages: [],
		}

		const promises = []

		promises.push(
			fetch_raw_file('content/config.yaml', true)
			.then(data => raw.config = data)
		)

		PAGE_ITERATOR.forEach(i =>
			promises.push(
				fetch_raw_file(`content/page${i+1}.markdown`)
				.then(data => {
					if (!data) return

					raw.pages[i] = data
				})
			)
		)

		return Promise.all(promises)
			.then(() => {
				raw.fetch_end_date = Date.now()
				logger.log('Load finished, latest load from server:', raw)
				return raw
			})
			.then(function check() {
				// check if a page is missing
				const allPagesOk = raw.pages.reduce((acc, page, index) => {
					const isPageOk = Boolean(page)
					if (!isPageOk) throw new Error(`Page ${index + 1} is missing !`)
					return acc && isPageOk
				}, true)
				if (!allPagesOk) throw new Error('A page is missing !')
				return raw
			})
			.catch(err => {
				logger.error('Load finished, fetch failed !', err)
				throw err
			})
	}

	function parse(raw_data) {
		// decode
		const content = {
			config: {},
			pages: {},
		}

		content.config = safely_parse_yaml(raw_data.config)

		content.pages = raw_data.pages.map(parse_page)

		return content
	}

	function parse_page(raw_data) {
		logger.group('parsing page data...');
		//logger.log('raw data', raw_data)

		const result = {}

		const raw_splitted = raw_data.split('---').map(s => s.trim()).filter(l => l)
		//logger.log('raw splitted', raw_splitted)

		let [raw_header, ...raw_content] = raw_splitted
		if (! raw_content.length) throw new Error('Malformed page: couldn’t separate header/content !')

		//logger.log('raw header', raw_header)

		const meta = safely_parse_yaml(raw_header)
		result.meta = meta
		logger.log('parsed header', result.meta)

		logger.log('raw content', raw_content)

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

	attempt_load()
		.then(parse)
		.then(content => {
			logger.log('content loaded and parsed !', content)
			on_successful_load(content)
		})
		.catch(err => {
			logger.error('Load failed !', err)
		})

	state.ready_p.then(() => logger.log('content is ready !'))
	state.ready_p.then(data => render(data, state))
	state.ready_p.then(function attempt_auto_auth(content) {
		const last_successful_password = env.localStorage.getItem(CONSTS.LS_KEYS.last_successful_password)
		if (!last_successful_password) return

		logger.info('attempting auto-auth...')
		if (last_successful_password === content.config.password) {
			state.lang = env.localStorage.getItem(CONSTS.LS_KEYS.last_chosen_lang)
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
		el_site.forEach(el => el.classList.remove('dn'))
	})

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
		el_wall.forEach(el => el.classList.remove('dn'))
	}

	function render_menu(content, state) {
		const new_html =  content.pages.map((page, i) => {
				return TEMPLATE_ANCHOR({
					page_id: i + 1,
					anchor: page.meta.anchors[state.lang],
				})
			})
			.join('\n')

		const el_menu = document.querySelectorAll('#fp-menu')[0]
		el_menu.innerHTML = new_html
	}

	function render_pages(content, state) {
		const new_html =  [
				TEMPLATE_FULLPAGE_SPLASH(Object.assign({}, content.config, {lang: state.lang})),
				...content.pages.slice(1).map((page, i) => {
					return TEMPLATE_FULLPAGE_SECTION({
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

		$('#fullpage').fullpage({
			sectionsColor: content.pages.map((page, i) => page.meta.background),
			anchors: content.pages.map((page, i) => `page${i+1}`),
			menu: '#fp-menu',
			paddingTop: '48px',
			bigSectionsDestination: 'top',
			//scrollBar: true,
			scrollOverflow: true
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
	}

	function render(data) {
		logger.log('Rendering...')

		// choose best language
		const best_auto_lang = data.config.languages.includes(CONSTS.NAVIGATOR_LANG) ? CONSTS.NAVIGATOR_LANG : CONSTS.DEFAULT_UI_LANG
		logger.log('best_auto_lang', best_auto_lang)
		state.lang = state.lang || best_auto_lang || 'en'

		env.document.title = I18N.wall_header[state.lang](data.config)

		render_wall(data, state)
		render_main(data, state)
	}
})(window)
