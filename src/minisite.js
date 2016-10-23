"use strict";

console.log('Hello from minisite.js')

window.minisite = (function(env) {
	'use strict';

	////////////////////////////////////
	const MAX_PAGES = 10
	const DEFAULT_LANG = 'en'
	const PAGE_ITERATOR = [...Array(MAX_PAGES)].map((x, i) => i)
	const DEFAULT_CONTENT = {
		common: {},
		pages: PAGE_ITERATOR.map(i => ({
			index: i+1,
			title: `#${i+1}`,
			image: 'cat.jpg',
			content: `#${i} Lorem ipsum`
		}))
	}
	const NAVIGATOR_LANG = (window.navigator.userLanguage || window.navigator.language || 'en').split('-')[0]

	function TEMPLATE_SPLASH_() {
		const { lang, }
		`
<div class="br2-ns bb ba-ns br2-ns b--black-10 bg-white-80 mv3-ns w-100 w-50-m w-50-l mw6 center">
	<div class="ph3">
		<h2 class="mv2"><img src="third-party/flags/svg/FR.svg" class="v-base mr1" width="26">Bienvenue</h2>
		<p class="f6">L'accès à ce site est réservé à la famille et aux amis.</p>
		<p>
		<form>
			<label for="mdpInput">Mot de passe :</label>
			<input id="mdpInput" class="input-reset mw3" placeholder="XYZ" />
			<button type="submit" class="button-reset">Entrer</button>
		</form>
		</p>
	</div>
</div>
	`
	}
	////////////////////////////////////
	const state = {
		lang: NAVIGATOR_LANG,
		errors: [],
	}

	const content = {
		config: {},
		inferred_page_count: 0,
		pages: {},
	}

	////////////////////////////////////
	const logger = console
	const pegasus = env.pegasus
	if (! pegasus) state.errors.push('Expected lib "pegasus" not found !')

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
				return raw
			})
	}

	attempt_load()
		.then(raw_data => {
			logger.log('Load finished, latest load from server:', raw_data)
		})

	function render(content) {

	}

	return {
		render
	}
})(window)
