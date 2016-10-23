"use strict";

console.log('Hello from minisite.js')

window.minisite = (function(env) {
	'use strict';

	////////////////////////////////////
	const CONSTS = {
		LS_KEYS: {
			last_successful_password: 'minisite.last_successful_password'
		}
	}
	const MAX_PAGES = 10
	const AVAILABLE_LANGUAGES = [ 'en', 'fr' ]
	const DEFAULT_LANG = 'en'
	const PAGE_ITERATOR = [...Array(MAX_PAGES)].map((x, i) => i)
	const DEFAULT_CONTENT = {
		common: {
		},
		pages: PAGE_ITERATOR.map(i => ({
			index: i+1,
			title: `#${i+1}`,
			image: 'cat.jpg',
			content: `#${i} Lorem ipsum`
		}))
	}
	const NAVIGATOR_LANG = (window.navigator.userLanguage || window.navigator.language || 'en').split('-')[0]
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
	function TEMPLATE_WALL(data) {
		const { lang } = data

		return `
<div class="br2-ns bb ba-ns br2-ns b--black-10 bg-white-80 mv3-ns w-100 mw6-5 center">
	<div class="ph3">
		<h2 class="mv2"><img src="${I18N.svg_flag[lang]}" class="v-base mr1" width="26">${I18N.wall_header[lang](data)}</h2>
		<p class="f6">${I18N.wall_text[lang]}</p>
		<p>
		<form onSubmit="wall_check(this.elements[0].value), false">
			<label for="mdpInput">${I18N.wall_password_label[lang]}</label>
			<input id="mdpInput" class="input-reset mw3" placeholder="${I18N.wall_password_placeholder[lang]}" />
			<button type="submit" class="button-reset">${I18N.wall_password_cta[lang]}</button>
		</form>
		</p>
	</div>
</div>
	`
	}

	////////////////////////////////////
	const state = {
		ready: undefined,
		authentified: undefined,
		lang: NAVIGATOR_LANG,
		errors: [],
	}

	const content = {
		config: {},
		pages: {},
	}

	////////////////////////////////////
	const logger = console
	const pegasus = env.pegasus
	if (! pegasus) state.errors.push('Expected lib "pegasus" not found !')

	////////////////////////////////////

	////////////////////////////////////
	logger.log('constants', {
		MAX_PAGES, DEFAULT_LANG, DEFAULT_CONTENT
	})

	function load_raw_file(url, required = false) {
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
			load_raw_file('content/config.yaml', true)
			.then(data => raw.config = data)
		)

		PAGE_ITERATOR.forEach(i =>
			promises.push(
				load_raw_file(`content/page${i+1}.markdown`)
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
				console.error('Load finished, fetch failed !', err)
				throw err
			})
	}

	let on_successful_load
	state.ready = new Promise((resolve) => on_successful_load = resolve)
	let on_successful_auth
	state.authentified = new Promise((resolve) => on_successful_auth = resolve)

	attempt_load()
		.then(raw_data => {
			// decode
			const content = {
				config: {},
				pages: {},
			}

			content.config = jsyaml.safeLoad(raw_data.config, { onWarning: console.warn })

			return content
		})
		.then(content => {
			console.log('content loaded !', content)
			on_successful_load(content)
		})
		.catch(err => {
			console.error('Load failed !', err)
		})

	state.ready.then(() => console.log('content is ready !'))
	state.ready.then(render)
	state.ready.then(function attempt_auto_auth(content) {
		const last_successful_password = env.localStorage.getItem(CONSTS.LS_KEYS.last_successful_password)
		if (!last_successful_password) return

		logger.info('attempting auto-auth...')
		if (last_successful_password === content.config.password) {
			on_successful_auth()
		}
	})

	env.wall_check = (password) => {
		console.info('checking', password)
		state.ready
			.then(content => {
				console.info('content ready, checking pwd', content.config.password)
				if (password === content.config.password) {
					on_successful_auth()
					env.localStorage.setItem(CONSTS.LS_KEYS.last_successful_password, password)
				}
				else {
					// TODO instructions !
				}
			})
	}

	state.authentified.then(() => {
		logger.info('Successful auth !')
		const el_wall = document.querySelectorAll('#wall')[0]
		el_wall.style.display = 'none'
		const el_site = document.querySelectorAll('.delayed-display')
		el_site.forEach(el => el.classList.remove('dn'))
	})

	function render_wall(content) {
		const new_html = content.config.languages.map(lang => TEMPLATE_WALL(Object.assign({}, content.config, {lang}))).join('\n')
		const el_wall_form = document.querySelectorAll('#wall-form')[0]
		el_wall_form.innerHTML = new_html
	}

	function render_main(content) {
		$('#fullpage').fullpage({
			sectionsColor: ['#4BBFC3', '#7BAABE', '#4BBFC3', '#7BAABE', '#4BBFC3', '#7BAABE', ],
			anchors: ['page1', 'page2', 'page3', 'page4', 'page5', 'page6'],
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

	function render(content) {
		logger.log('Rendering...')
		render_wall(content)
		render_main(content)
	}

	return {
		render
	}
})(window)
