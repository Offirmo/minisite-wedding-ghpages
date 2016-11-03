"use strict";
console.log('Hello from minisite.js');
window.minisite = (function (env) {
    'use strict';
    ////////////////////////////////////
    var CONSTS = {
        LS_KEYS: {
            last_successful_password: 'minisite.last_successful_password',
            last_chosen_lang: 'minisite.last_chosen_lang'
        },
        MAX_PAGES: 10,
        AVAILABLE_UI_LANGUAGES: ['en', 'fr'],
        DEFAULT_UI_LANG: 'en',
        NAVIGATOR_LANG: (window.navigator.userLanguage || window.navigator.language || 'en').split('-')[0]
    };
    var I18N = {
        svg_flag: {
            en: 'third-party/flags/svg/US.svg',
            fr: 'third-party/flags/svg/FR.svg',
        },
        wall_header: {
            en: function (_a) {
                var bride = _a.bride, groom = _a.groom;
                return ("Wedding of " + bride + " and " + groom);
            },
            fr: function (_a) {
                var bride = _a.bride, groom = _a.groom;
                return ("Mariage de " + bride + " et " + groom);
            },
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
    };
    // Helper
    var PAGE_ITERATOR = Array(CONSTS.MAX_PAGES).slice().map(function (x, i) { return i; });
    ////////////////////////////////////
    var on_successful_load;
    var on_successful_auth;
    var state = {
        is_ready: false,
        ready_p: new Promise(function (resolve) { return on_successful_load = resolve; }),
        is_authentified: false,
        authentified_p: new Promise(function (resolve) { return on_successful_auth = resolve; }),
        lang: undefined,
        errors: [],
    };
    ////////////////////////////////////
    function TEMPLATE_WALL(data) {
        var lang = data.lang, bride = data.bride, groom = data.groom;
        return "\n<div class=\"br2-ns bb ba-ns br2-ns b--black-10 bg-white-80 mv3-ns w-100 mw6-5 center\">\n\t<div class=\"ph3\">\n\t\t<h2 class=\"mv2\"><img src=\"" + I18N.svg_flag[lang] + "\" class=\"v-base mr2\" width=\"26\">" + I18N.wall_header[lang]({ bride: bride, groom: groom }) + "</h2>\n\t\t<p class=\"f6\">" + I18N.wall_text[lang] + "</p>\n\t\t<p>\n\t\t<form onSubmit=\"authentify(this.elements[0].value, this.elements[1].value), false\">\n\t\t\t<label for=\"mdpInput\">" + I18N.wall_password_label[lang] + "</label>\n\t\t\t<input id=\"langInput\" class=\"dn\" value=\"" + lang + "\" />\n\t\t\t<input id=\"mdpInput\" class=\"input-reset mw3\" placeholder=\"" + I18N.wall_password_placeholder[lang] + "\" />\n\t\t\t<button type=\"submit\" class=\"button-reset\">" + I18N.wall_password_cta[lang] + "</button>\n\t\t</form>\n\t\t</p>\n\t</div>\n</div>\n\t";
    }
    function TEMPLATE_ANCHOR(data) {
        var page_id = data.page_id, anchor = data.anchor;
        return "\n<a class=\"link near-black dib mr3 mr4-ns\" href=\"#page" + page_id + "\">" + anchor + "</a>\n\t";
    }
    function TEMPLATE_FULLPAGE_SPLASH(data) {
        var lang = data.lang, bride = data.bride, groom = data.groom;
        return "\n<div class=\"section\">\n\t<article class=\"dt w-100\">\n\t\t<div class=\"dtc v-mid tc\">\n\t\t\t<h1 class=\"f2 f1-ns\">" + I18N.wall_header[lang]({ bride: bride, groom: groom }) + "</h1>\n\t\t\t<h2 class=\"f3 f2-ns\">TODO Lorem ipsum dolor sit amet</h2>\n\n\t\t\t<div id=\"countdown\" class=\"dib\" style=\"width: auto; transform: scale(.5);\"></div>\n\t\t</div>\n\t</article>\n</div>\n";
    }
    function TEMPLATE_FULLPAGE_SECTION(data) {
        var title = data.title, picture = data.picture, markdown = data.markdown;
        return "\n<div class=\"section\">\n\t<article class=\"cf ph3 ph5-ns pv3 center mw60em\">\n\t\t<header class=\"fn fl-ns w-50-ns pr4-ns measure\">\n\t\t\t<h1 class=\"f2 lh-title fw9 mb3 mt0 pt3\">\n\t\t\t\t" + title + "\n\t\t\t</h1>\n\t\t\t<img src=\"../content/" + picture + "\" class=\"\">\n\t\t</header>\n\t\t<div class=\"fn fl-ns w-50-ns measure\">\n\t\t\t" + marked(markdown) + "\n\t\t</div>\n\t</article>\n</div>\n";
    }
    function TEMPLATE_FULLPAGE_FOOTER(data) {
        return "\n<div class=\"section fp-auto-height\">\n\t<footer class=\"pb4\">\n\t\t<small class=\"f6 db tc\">\u00A9 2016 <b class=\"ttu\">SOME COMPANY Inc</b>., All Rights Reserved</small>\n\t\t<div class=\"tc mt3\">\n\t\t\t<a href=\"/language/\" title=\"Language\" class=\"f6 dib ph2 link mid-gray dim\">Language</a>\n\t\t\t<a href=\"/terms/\"    title=\"Terms\" class=\"f6 dib ph2 link mid-gray dim\">Terms of Use</a>\n\t\t\t<a href=\"/privacy/\"  title=\"Privacy\" class=\"f6 dib ph2 link mid-gray dim\">Privacy</a>\n\t\t</div>\n\t</footer>\n</div>\n";
    }
    ////////////////////////////////////
    var logger = console;
    logger.log('constants', CONSTS);
    var pegasus = env.pegasus; // TODO use fetch
    if (!pegasus)
        state.errors.push('Expected lib "pegasus" not found !');
    var marked = env.marked;
    if (!marked)
        state.errors.push('Expected lib "marked" not found !');
    ////////////////////////////////////
    function fetch_raw_file(url, required) {
        if (required === void 0) { required = false; }
        // turn pegasus into real promise
        var p = new Promise(function (resolve, reject) { return pegasus(url).then(function (x, xhr) { return resolve(xhr.responseText); }, reject); });
        return p
            .catch(function (e) {
            e = e || new Error('unknown error');
            e.message = "Failed to load " + (required ? 'required' : 'optional') + " file \"" + url + "\" ! (" + e.message + ")";
            if (required)
                throw e;
            else
                logger.warn(e);
        });
    }
    function safely_parse_yaml(raw_data) {
        try {
            return jsyaml.safeLoad(raw_data, { onWarning: logger.warn });
        }
        catch (err) {
            // TODO rewrite the error to be more explicit
            err.message = 'YAML parsing: ' + err.message;
            throw err;
        }
    }
    function attempt_load() {
        logger.info('Attempting to load latest data...');
        var raw = {
            fetch_begin_date: Date.now(),
            fetch_end_date: undefined,
            config: undefined,
            pages: [],
        };
        var promises = [];
        promises.push(fetch_raw_file('content/config.yaml', true)
            .then(function (data) { return raw.config = data; }));
        PAGE_ITERATOR.forEach(function (i) {
            return promises.push(fetch_raw_file("content/page" + (i + 1) + ".markdown")
                .then(function (data) {
                if (!data)
                    return;
                raw.pages[i] = data;
            }));
        });
        return Promise.all(promises)
            .then(function () {
            raw.fetch_end_date = Date.now();
            logger.log('Load finished, latest load from server:', raw);
            return raw;
        })
            .then(function check() {
            // check if a page is missing
            var allPagesOk = raw.pages.reduce(function (acc, page, index) {
                var isPageOk = Boolean(page);
                if (!isPageOk)
                    throw new Error("Page " + (index + 1) + " is missing !");
                return acc && isPageOk;
            }, true);
            if (!allPagesOk)
                throw new Error('A page is missing !');
            return raw;
        })
            .catch(function (err) {
            logger.error('Load finished, fetch failed !', err);
            throw err;
        });
    }
    function parse(raw_data) {
        // decode
        var content = {
            config: {},
            pages: {},
        };
        content.config = safely_parse_yaml(raw_data.config);
        content.pages = raw_data.pages.map(parse_page);
        return content;
    }
    function parse_page(raw_data) {
        logger.group('parsing page data...');
        //logger.log('raw data', raw_data)
        var result = {};
        var raw_splitted = raw_data.split('---').map(function (s) { return s.trim(); }).filter(function (l) { return l; });
        //logger.log('raw splitted', raw_splitted)
        var raw_header = raw_splitted[0], raw_content = raw_splitted.slice(1);
        if (!raw_content.length)
            throw new Error('Malformed page: couldn’t separate header/content !');
        //logger.log('raw header', raw_header)
        var meta = safely_parse_yaml(raw_header);
        result.meta = meta;
        logger.log('parsed header', result.meta);
        logger.log('raw content', raw_content);
        raw_content = raw_content.join('---'); // to take into account possible useful --- in markdown
        result.content = {};
        var lines = raw_content.split('\n').map(function (s) { return s.trim(); });
        var current_lang = undefined;
        var title = undefined;
        lines.forEach(function (line) {
            if (line.length === 4 && line[0] === '`' && line[3] === '`') {
                // this is a lang marker
                current_lang = line.slice(1, 3);
                logger.log('found lang', current_lang);
                result.content[current_lang] = {
                    title: '',
                    text: '',
                };
                title = undefined;
                return;
            }
            if (!current_lang)
                throw new Error('Can’t find text language !');
            if (!line && !result.content[current_lang].text)
                return; // ignore blank lines while we haven't found the start of content
            if (!result.content[current_lang].title && line[0] === '#' && line[1] === '#') {
                // this is the tagline
                var _a = line.split(' '), marker = _a[0], remain = _a.slice(1);
                title = remain.join(' ');
                result.content[current_lang].title = remain.join(' ');
                return;
            }
            result.content[current_lang].text += line + "\n";
        });
        logger.log('parsed final result', result);
        logger.groupEnd();
        return result;
    }
    attempt_load()
        .then(parse)
        .then(function (content) {
        logger.log('content loaded and parsed !', content);
        on_successful_load(content);
    })
        .catch(function (err) {
        logger.error('Load failed !', err);
    });
    state.ready_p.then(function () { return logger.log('content is ready !'); });
    state.ready_p.then(function (data) { return render(data, state); });
    state.ready_p.then(function attempt_auto_auth(content) {
        var last_successful_password = env.localStorage.getItem(CONSTS.LS_KEYS.last_successful_password);
        if (!last_successful_password)
            return;
        logger.info('attempting auto-auth...');
        if (last_successful_password === content.config.password) {
            state.lang = env.localStorage.getItem(CONSTS.LS_KEYS.last_chosen_lang);
            on_successful_auth();
        }
    });
    env.authentify = function (lang, password) {
        logger.info('[authentify] chosen lang', lang);
        state.lang = lang;
        logger.info('[authentify] checking', password);
        state.ready_p
            .then(function (content) {
            logger.info('[authentify] content ready, checking pwd', content.config.password);
            if (password === content.config.password) {
                state.lang = lang;
                on_successful_auth();
                env.localStorage.setItem(CONSTS.LS_KEYS.last_successful_password, password);
                env.localStorage.setItem(CONSTS.LS_KEYS.last_chosen_lang, lang);
            }
            else {
            }
        });
    };
    state.authentified_p.then(function () {
        logger.info('Successful auth !');
        var el_wall = document.querySelectorAll('#wall')[0];
        el_wall.style.display = 'none';
        var el_site = document.querySelectorAll('.main-delayed');
        el_site.forEach(function (el) { return el.classList.remove('dn'); });
    });
    function render_wall(content, state) {
        var languages = content.config.languages;
        languages = languages.filter(function (lang) { return CONSTS.AVAILABLE_UI_LANGUAGES.includes(lang); });
        if (languages.length === 0) {
            if (CONSTS.AVAILABLE_UI_LANGUAGES.includes(CONSTS.NAVIGATOR_LANG))
                languages.push(CONSTS.NAVIGATOR_LANG);
            if (!languages.includes(CONSTS.DEFAULT_UI_LANG))
                languages.push(CONSTS.DEFAULT_UI_LANG);
        }
        var new_html = languages
            .map(function (lang) { return TEMPLATE_WALL(Object.assign({}, content.config, { lang: lang })); })
            .join('\n');
        var el_wall_form = document.querySelectorAll('#wall-form')[0];
        el_wall_form.innerHTML = new_html;
        var el_wall = document.querySelectorAll('.wall-delayed');
        el_wall.forEach(function (el) { return el.classList.remove('dn'); });
    }
    function render_menu(content, state) {
        var new_html = content.pages.map(function (page, i) {
            return TEMPLATE_ANCHOR({
                page_id: i + 1,
                anchor: page.meta.anchors[state.lang],
            });
        })
            .join('\n');
        var el_menu = document.querySelectorAll('#fp-menu')[0];
        el_menu.innerHTML = new_html;
    }
    function render_pages(content, state) {
        var new_html = [
            TEMPLATE_FULLPAGE_SPLASH(Object.assign({}, content.config, { lang: state.lang }))
        ].concat(content.pages.slice(1).map(function (page, i) {
            return TEMPLATE_FULLPAGE_SECTION({
                title: page.content[state.lang].title,
                markdown: page.content[state.lang].text,
                picture: page.meta.picture,
            });
        }), [
            TEMPLATE_FULLPAGE_FOOTER()
        ])
            .join('\n');
        var el_fullpage = document.querySelectorAll('#fullpage')[0];
        el_fullpage.innerHTML = new_html;
    }
    function render_main(content, state) {
        console.log('render_main', content, state);
        render_menu(content, state);
        render_pages(content, state);
        $('#fullpage').fullpage({
            sectionsColor: content.pages.map(function (page, i) { return page.meta.background; }),
            anchors: content.pages.map(function (page, i) { return ("page" + (i + 1)); }),
            menu: '#fp-menu',
            paddingTop: '48px',
            bigSectionsDestination: 'top',
            //scrollBar: true,
            scrollOverflow: true
        });
        // countdown to ; month starts at 0
        var date = new Date(Date.UTC(2017, 6, 1, 16, 0, 0));
        var now = new Date();
        var diff = date.getTime() / 1000 - now.getTime() / 1000;
        $('#countdown').FlipClock(diff, {
            clockFace: 'DailyCounter',
            countdown: true,
            language: 'fr'
        });
    }
    function render(data) {
        logger.log('Rendering...');
        // choose best language
        var best_auto_lang = data.config.languages.includes(CONSTS.NAVIGATOR_LANG) ? CONSTS.NAVIGATOR_LANG : CONSTS.DEFAULT_UI_LANG;
        logger.log('best_auto_lang', best_auto_lang);
        state.lang = state.lang || best_auto_lang || 'en';
        env.document.title = I18N.wall_header[state.lang](data.config);
        render_wall(data, state);
        render_main(data, state);
    }
})(window);
//# sourceMappingURL=minisite.js.map