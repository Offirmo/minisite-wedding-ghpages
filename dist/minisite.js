"use strict";
console.log('Hello from minisite.js !');
// for IE
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
function polyfill_forEach_if_missing_on(x) {
    if (x.forEach)
        return;
    x.forEach = function (callback, thisArg) {
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
polyfill_forEach_if_missing_on(Array.prototype);
window.minisite = (function (env) {
    'use strict';
    //////////// CONSTANTS ////////////
    var CONSTS = {
        LS_KEYS: {
            last_successful_raw_config: 'minisite.last_successful_raw_config',
            last_successful_raw_pages: 'minisite.last_successful_raw_pages',
            last_successful_password: 'minisite.last_successful_password',
            last_chosen_lang: 'minisite.last_chosen_lang'
        },
        MAX_PAGES: 12,
        AVAILABLE_UI_LANGUAGES: ['en', 'fr'],
        DEFAULT_UI_LANG: 'en',
        NAVIGATOR_LANG: (env.navigator.userLanguage || env.navigator.language || 'en').split('-')[0],
        NOT_SMALL_WIDTH_PX: 480,
        REPO_URL: 'https://github.com/Offirmo/minisite-w',
    };
    var I18N = {
        svg_flag: {
            en: 'third-party/flags/svg/US.svg',
            fr: 'third-party/flags/svg/FR.svg',
        },
        wall_header: {
            en: function (_a) {
                var bride = _a.bride, groom = _a.groom;
                return "Wedding of " + bride + " and " + groom;
            },
            fr: function (_a) {
                var bride = _a.bride, groom = _a.groom;
                return "Mariage de " + bride + " et " + groom;
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
    //////////// TEMPLATES ////////////
    function TEMPLATE_WALL(data) {
        var lang = data.lang, bride = data.bride, groom = data.groom;
        return "\n<div class=\"br2-ns bb ba-ns br2-ns b--black-10 bg-white-80 mv3-ns w-100 mw6-5 center\">\n\t<div class=\"ph3\">\n\t\t<h2 class=\"mv2\"><img src=\"" + I18N.svg_flag[lang] + "\" class=\"v-base mr2\" width=\"26\">" + I18N.wall_header[lang]({ bride: bride, groom: groom }) + "</h2>\n\t\t<p class=\"f6\">" + I18N.wall_text[lang] + "</p>\n\t\t<p>\n\t\t<form onSubmit=\"console.info('onSubmit', arguments, this), arguments[0].preventDefault(), authentify(this.elements[0].value, this.elements[1].value), false\">\n\t\t\t<label for=\"mdpInput\">" + I18N.wall_password_label[lang] + "</label>\n\t\t\t<input id=\"langInput\" class=\"dn\" value=\"" + lang + "\" />\n\t\t\t<input id=\"mdpInput\" class=\"input-reset mw3\" placeholder=\"" + I18N.wall_password_placeholder[lang] + "\" />\n\t\t\t<button type=\"submit\" class=\"button-reset\">" + I18N.wall_password_cta[lang] + "</button>\n\t\t</form>\n\t\t</p>\n\t</div>\n</div>\n\t";
    }
    function TEMPLATE_ANCHOR(data) {
        var page_id = data.page_id, anchor = data.anchor;
        return "\n<a class=\"link near-black dib mr3 mr4-ns\" href=\"#page" + page_id + "\">" + anchor + "</a>\n\t";
    }
    function TEMPLATE_FULLPAGE_SECTION_HOME(data) {
        var lang = data.lang, bride = data.bride, groom = data.groom;
        return "\n<div class=\"section\">\n\t<article class=\"dt w-100\">\n\t\t<div class=\"dtc v-mid tc\">\n\t\t\t<h1 class=\"f2 f1-ns\">" + I18N.wall_header[lang]({ bride: bride, groom: groom }) + "</h1>\n\t\t\t<h2 class=\"f3 f2-ns\">TODO Lorem ipsum dolor sit amet</h2>\n\n\t\t\t<!-- <div id=\"countdown\" class=\"dib\" style=\"width: auto; transform: scale(.5);\"></div> -->\n\t\t</div>\n\t</article>\n</div>\n";
    }
    function TEMPLATE_FULLPAGE_SECTION_DEFAULT(data) {
        var title = data.title, picture = data.picture, markdown = data.markdown;
        return "\n<div class=\"section\">\n\t<article class=\"cf ph3 ph5-ns pv3 center\">\n\t\t<header class=\"fn fl-ns w-50-ns pr4-ns\">\n\t\t\t<h1 class=\"f2 lh-title fw9 mb3 mt0 pt3\">\n\t\t\t\t" + title + "\n\t\t\t</h1>\n\t\t\t<img src=\"content/" + picture + "\" class=\"\">\n\t\t</header>\n\t\t<div class=\"fn fl-ns w-50-ns measure\">\n\t\t\t" + marked(markdown) + "\n\t\t</div>\n\t</article>\n</div>\n";
    }
    function TEMPLATE_FULLPAGE_SECTION_MAP(data) {
        var title = data.title, container_id = data.container_id, picture = data.picture, markdown = data.markdown;
        return "\n<div class=\"section\">\n\t<article class=\"cf ph3 ph5-ns pv3 center\">\n\t\t<header class=\"fn fl-ns w-50-ns pr4-ns\">\n\t\t\t<h1 class=\"f2 lh-title fw9 mb3 mt0 pt3\">\n\t\t\t\t" + title + "\n\t\t\t</h1>\n\t\t\t<div id=\"" + container_id + "\" class=\"aspect-ratio aspect-ratio--6x4\"></div>\n\t\t</header>\n\t\t<div class=\"fn fl-ns w-50-ns measure\">\n\t\t\t" + marked(markdown) + "\n\t\t</div>\n\t</article>\n</div>\n";
    }
    function TEMPLATE_FULLPAGE_SECTION_CONTACT(data) {
        var title = data.title, picture = data.picture, markdown = data.markdown;
        return "\n<div class=\"section\">\n\t<article class=\"cf ph3 ph5-ns pv3 center\">\n\t\t<header class=\"fn fl-ns w-50-ns pr4-ns\">\n\t\t\t<h1 class=\"f2 lh-title fw9 mb3 mt0 pt3\">\n\t\t\t\t" + title + "\n\t\t\t</h1>\n\t\t\t<img src=\"content/" + picture + "\" class=\"\">\n\t\t</header>\n\t\t<div class=\"fn fl-ns w-50-ns measure\">\n\t\t\t" + marked(markdown) + "\n\t\t\tTODO contact form !\n\t\t</div>\n\t</article>\n</div>\n";
    }
    function TEMPLATE_FULLPAGE_FOOTER(lang) {
        // TODO localize
        return "\n<div class=\"section fp-auto-height\">\n\t<footer class=\"pb4\">\n\t\t<small class=\"f6 db tc\">\u00A9 2016 <b class=\"ttu\">Offirmo Inc</b>., All Rights Reserved</small>\n\t\t<div class=\"tc mt3\">\n\t\t\t<a class=\"f6 dib ph2 link mid-gray dim\" href=\"/terms/\" title=\"Legal\">Legal stuff</a>\n\t\t\t<a class=\"f6 dib ph2 link mid-gray dim\" href=\"" + CONSTS.REPO_URL + "\" title=\"fork\" target=\"_blank\" rel=\"noopener noreferrer\">Fork on Github</a>\n\t\t\t<a href=\"\" onClick=\"logout()\"><svg viewBox=\"0 0 1000 1000\" class=\"h1 w1\"><g>\n\t\t\t\t<path d=\"M485.3,572h29.4c30.4,0,55.2-24.8,55.2-55.2V63.9c0-30.4-24.9-55.2-55.2-55.2h-29.4c-30.4,0-55.2,24.9-55.2,55.2v452.9C430.1,547.1,454.9,572,485.3,572z\"/>\n\t\t\t\t<path d=\"M763.8,114.4c-23.2-14.3-53,2.8-53,30v74.9c0,17.9,7.7,35,21.2,46.7c75.7,65.9,122.1,140.5,117.4,250.4C841.9,696,696.7,842.1,517.1,850.7c-200.6,9.6-366.9-150.8-366.9-349.3c0-105.2,46.7-175.1,120.4-237.8c13.3-11.3,20.8-28.1,20.8-45.6v-74c0-27.8-30.5-44.8-54.2-30.3C98.5,198.9,7,332.8,10.1,509.9C14.5,768.5,222.2,980.9,480.6,991c279,10.8,509.4-213,509.4-489.6C990,328.2,899.7,198.2,763.8,114.4z\"/>\n\t\t\t\t</g></svg></a>\n\t\t</div>\n\t</footer>\n</div>\n";
    }
    //////////// TODO ////////////
    // mini state ;) It's ugly, I know...
    var state = {
        errors: [],
        authentified: false,
    };
    function report_error_msg(msg) { logger.error(msg), state.errors.push(msg); }
    //////////// LIBS ////////////
    var logger = console;
    logger.log('constants =', CONSTS);
    var $ = env.$;
    if (!$)
        report_error_msg('Expected lib "jQuery" not found !');
    var marked = env.marked;
    if (!marked)
        report_error_msg('Expected lib "marked" not found !');
    var jsyaml = env.jsyaml;
    if (!jsyaml)
        report_error_msg('Expected lib "jsyaml" not found !');
    var storage = env.localStorage;
    if (!jsyaml)
        report_error_msg('Expected API "localStorage" not found !');
    var leaflet = env.L;
    if (!leaflet)
        report_error_msg('Expected lib "leaflet" not found !');
    //////////// SERVICES ////////////
    var PAGE_ITERATOR = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // transpilation has troubles with more "clever" writings :/
    // Fetch given file or reject. Resolve with null if 404 and !expected
    function fetch_raw_file(url, expected) {
        if (expected === void 0) { expected = true; }
        return Promise
            .resolve($.ajax({
            url: url,
            dataType: 'text',
        }))
            .catch(function fix_bad_promise_rejection_from_jquery(jqXHR, textStatus, errorThrown) {
            var err = errorThrown || new Error(jqXHR.responseText || 'unknown error');
            err.status = err.status || jqXHR.status || 500;
            throw err;
        })
            .catch(function swallow_error_if_file_is_not_required(e) {
            //logger.log('swallow_error_if_file_is_not_required', e, expected)
            e = e || new Error('unknown error while fetching a raw file');
            e.message = "Failed to fetch " + (expected ? 'required' : 'optional') + " file \"" + url + "\" ! (" + e.status + ", " + e.message + ")";
            if (e.status === 404 && !expected)
                return null; /* swallow error */
            throw e;
        });
    }
    function retry_until_successful_resolution(promise_returning_fn, description) {
        if (description === void 0) { description = '(unknown op)'; }
        var MAX_TRY_COUNT = 20;
        return new Promise(function (resolve) {
            var try_count = 0;
            function attempt() {
                try_count++;
                var retry_delay_ms = try_count * try_count * 1000;
                logger.log("\"" + description + "\" attempt #" + try_count + ", timeout = " + retry_delay_ms + "ms");
                var p = promise_returning_fn();
                p.then(function (x) { return resolve(x); }, function (e) { if (try_count <= MAX_TRY_COUNT)
                    setTimeout(attempt, retry_delay_ms); });
            }
            // launch 1st attempt asynchronously to not block DOM ready
            setTimeout(attempt, 0);
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
    // a variant of Promise.race which'll reject only when all have failed
    function promise_race_successful(p1, p2) {
        return new Promise(function (resolve, reject) {
            // resolve with 1st
            p1.then(resolve);
            p2.then(resolve);
            // reject with last
            p1.catch(function () { return p2.catch(reject); });
            p2.catch(function () { return p1.catch(reject); });
        });
    }
    function make_deferred() {
        var res_fn = {};
        var p = new Promise(function (resolve, reject) {
            res_fn.resolve = resolve;
            res_fn.reject = reject;
        });
        p.resolve = res_fn.resolve;
        p.reject = res_fn.reject;
        return p;
    }
    function log_promise(p, target) {
        p.then(function (d) { return logger.log('* promised "' + target + '" ✓', d); }, function (err) { return logger.error('! promised "' + target + '" ❌', err); });
    }
    //////////// RENDERING ////////////
    function get_unique_section_container_id(section_number, sub_container) {
        if (sub_container === void 0) { sub_container = ''; }
        return "section" + section_number + "-container" + (sub_container ? "-" + sub_container : '');
    }
    function render_wall(config) {
        logger.groupCollapsed('rendering wall...');
        logger.log(config);
        var languages = config.languages;
        // TODO config and avail lang must intersect
        languages = languages.filter(function (lang) { return CONSTS.AVAILABLE_UI_LANGUAGES.includes(lang); });
        if (languages.length === 0) {
            if (CONSTS.AVAILABLE_UI_LANGUAGES.includes(CONSTS.NAVIGATOR_LANG))
                languages.push(CONSTS.NAVIGATOR_LANG);
            if (!languages.includes(CONSTS.DEFAULT_UI_LANG))
                languages.push(CONSTS.DEFAULT_UI_LANG);
        }
        var new_html = languages
            .map(function (lang) { return TEMPLATE_WALL(Object.assign({}, config, { lang: lang })); })
            .join('\n');
        var el_wall_form = document.querySelectorAll('#wall-form')[0];
        if (!el_wall_form)
            logger.error("couldn't find #wall-form !!");
        else
            el_wall_form.innerHTML = new_html;
        var el_wall = document.querySelectorAll('.wall-delayed');
        if (!el_wall)
            logger.error("couldn't find #wall-delayed !!");
        else {
            polyfill_forEach_if_missing_on(el_wall);
            el_wall.forEach(function (el) { if (el.classList)
                el.classList.remove('dn'); });
        }
        logger.groupEnd();
    }
    function render_menu(pages, lang) {
        logger.log("rendering menu...", { pages: pages, lang: lang });
        var new_html = pages.map(function (page, i) {
            return TEMPLATE_ANCHOR({
                page_id: i + 1,
                anchor: page.meta.anchor[lang],
            });
        })
            .join('\n');
        var el_menu = document.querySelectorAll('#fp-menu')[0];
        el_menu.innerHTML = new_html;
    }
    function render_pages(config, pages, lang) {
        logger.log("rendering pages...", { config: config, pages: pages, lang: lang });
        var templates_by_layout = {
            home: TEMPLATE_FULLPAGE_SECTION_HOME,
            map: TEMPLATE_FULLPAGE_SECTION_MAP,
            contact: TEMPLATE_FULLPAGE_SECTION_CONTACT,
            default: TEMPLATE_FULLPAGE_SECTION_DEFAULT,
        };
        var new_html = pages.map(function (page, i) {
            var layout = templates_by_layout[page.meta.layout] ? page.meta.layout : 'default'; // TODO check
            return templates_by_layout[layout]({
                lang: lang,
                bride: config.bride,
                groom: config.groom,
                title: page.content[lang].title,
                markdown: page.content[lang].text,
                picture: page.meta.picture,
                container_id: get_unique_section_container_id(i),
            });
        }).concat([
            TEMPLATE_FULLPAGE_FOOTER()
        ]).join('\n');
        var el_fullpage = document.querySelectorAll('#fullpage')[0];
        el_fullpage.innerHTML = new_html;
    }
    function render_maps(pages, config) {
        logger.log("rendering maps...", { pages: pages, config: config });
        pages.forEach(function (page, index) {
            if (page.meta.layout !== 'map')
                return;
            var container_id = get_unique_section_container_id(index);
            logger.log("map container id =", container_id);
            // leaflet doesn't like when it's container changes its size
            // So we delay the setup a bit to wait for redraw.
            // http://stackoverflow.com/questions/17863904/leaflet-mapbox-rendering-issue-grey-area
            setTimeout(function setup_map_on_stable_dom() {
                var leaflet_map = leaflet.map(container_id);
                leaflet_map.setView([51.505, -0.09], 13);
                leaflet.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw', {
                    maxZoom: 18,
                    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
                    id: 'mapbox.streets'
                }).addTo(leaflet_map);
                var marker = leaflet.marker([51.5, -0.09]);
                marker.addTo(leaflet_map);
                marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
                // TODO
                // http://stackoverflow.com/questions/16845614/zoom-to-fit-all-markers-in-mapbox-or-leaflet
                /*
                 var circle = L.circle([51.508, -0.11], {
                 color: 'red',
                 fillColor: '#f03',
                 fillOpacity: 0.5,
                 radius: 500
                 }).addTo(mymap);
                 circle.bindPopup("I am a circle.");

                 var polygon = L.polygon([
                 [51.509, -0.08],
                 [51.503, -0.06],
                 [51.51, -0.047]
                 ]).addTo(mymap);
                 polygon.bindPopup("I am a polygon.");

                 var popup = L.popup()
                 .setLatLng([51.5, -0.09])
                 .setContent("I am a standalone popup.")
                 .openOn(mymap);
                 */
            }, 5);
        });
    }
    function render_main(config, pages, lang) {
        logger.groupCollapsed('rendering main...');
        logger.log({ config: config, pages: pages, lang: lang });
        render_menu(pages, lang);
        render_pages(config, pages, lang);
        render_maps(pages, config);
        // need a small timeout to let the DOM reflow before
        // 1) scrollOverflow does calculations
        // 2) fullpage attempt to scroll to required page (url options)
        setTimeout(function () {
            logger.log("activating fullpage...");
            $('#fullpage').fullpage({
                sectionsColor: pages.map(function (page, i) { return page.meta.background; }),
                anchors: pages.map(function (page, i) { return "page" + (i + 1); }).concat('footer'),
                menu: '#fp-menu',
                paddingTop: '48px',
                //verticalCentered: false,
                bigSectionsDestination: 'top',
                //scrollBar: $(window).width() > CONSTS.NOT_SMALL_WIDTH_PX,
                scrollOverflow: $(window).width() > CONSTS.NOT_SMALL_WIDTH_PX,
                responsiveWidth: 480,
            });
            logger.log("activating countdown...");
            // countdown to ; month starts at 0
            var date = new Date(Date.UTC(2017, 6, 1, 16, 0, 0));
            var now = new Date();
            var diff = date.getTime() / 1000 - now.getTime() / 1000;
            $('#countdown').FlipClock(diff, {
                clockFace: 'DailyCounter',
                countdown: true,
                language: 'fr'
            });
        }, 25);
        logger.groupEnd();
    }
    //////////// PROCESSING STEPS ////////////
    function fetch_raw_config_from_network() {
        return retry_until_successful_resolution(function () { return fetch_raw_file('content/config.yaml'); }, 'fetch config');
    }
    function fetch_raw_config_from_local_storage() {
        return new Promise(function (resolve, reject) {
            var data = storage.getItem(CONSTS.LS_KEYS.last_successful_raw_config);
            if (typeof data === 'string')
                return resolve(data);
            reject(new Error('raw config not found in storage'));
        });
    }
    function cache_latest_successful_raw_config_to_local_storage(_a) {
        var raw_config = _a[0], config = _a[1];
        storage.setItem(CONSTS.LS_KEYS.last_successful_raw_config, raw_config);
    }
    function fetch_raw_pages_from_network() {
        function attempt() {
            return Promise.all(PAGE_ITERATOR.map(function (i) { return fetch_raw_file("content/page" + (i + 1) + ".markdown", false); }));
        }
        return retry_until_successful_resolution(attempt, 'fetch pages');
    }
    function fetch_raw_pages_from_local_storage() {
        return new Promise(function (resolve, reject) {
            var data = JSON.parse(env.localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_pages));
            if (Array.isArray(data))
                return resolve(data);
            reject(new Error('raw pages not found in storage !'));
        });
    }
    function cache_latest_successful_raw_pages_to_local_storage(_a) {
        var raw_pages = _a[0], pages = _a[1];
        storage.setItem(CONSTS.LS_KEYS.last_successful_raw_pages, JSON.stringify(raw_pages));
    }
    function parse_config(raw_config) {
        return new Promise(function (resolve) { return resolve(safely_parse_yaml(raw_config)); });
    }
    function parse_pages(raw_pages) {
        function check_coherency_and_remove_empty(raw_pages) {
            // it's ok to have less than the max count of pages
            // but check if there is a hole
            var cleaned_pages = [];
            raw_pages.forEach(function (page, index) {
                var isPageOk = Boolean(page);
                if (!isPageOk)
                    return;
                if (cleaned_pages.length < index)
                    throw new Error("page # " + (cleaned_pages.length + 1) + " is missing !");
                cleaned_pages.push(page);
            });
            return cleaned_pages;
        }
        function parse_page(raw_page, debug_id) {
            if (debug_id === void 0) { debug_id = '?'; }
            logger.groupCollapsed("parsing page \"" + debug_id + "\"...");
            //logger.log('raw data', raw_data)
            var result = {};
            var raw_split = raw_page.split('---').map(function (s) { return s.trim(); }).filter(function (l) { return l; });
            //logger.log('raw split', raw_split)
            var raw_header = raw_split[0], raw_content = raw_split.slice(1);
            if (!raw_content.length)
                throw new Error('Malformed page: couldn’t separate header/content !');
            //logger.log('raw header', raw_header)
            var meta = safely_parse_yaml(raw_header);
            result.meta = meta;
            //logger.log('parsed header', result.meta)
            //logger.log('raw content', raw_content)
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
                    // TODO check if lang is supported !
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
            // TODO check lang coherency ! (all lang have their versions)
            return result;
        }
        return Promise.resolve(raw_pages)
            .then(check_coherency_and_remove_empty)
            .then(function (raw_pages) { return raw_pages.map(parse_page); });
    }
    //////////// SEQUENCING ////////////
    var cascade = {};
    var cascade_begin_date = Date.now();
    function log_cascade(id) {
        var TIMEOUT_MS = 20 * 1000;
        var resolved = false;
        var p = cascade[id];
        p.then(function (d) {
            logger.groupCollapsed("\u2713 promised \"" + id + "\" (" + (Date.now() - cascade_begin_date) + "ms)");
            logger.info(d);
            logger.groupEnd();
            resolved = true;
        }, function (err) {
            logger.groupCollapsed("\u274C\u274C\u274C promised \"" + id + "\" (" + (Date.now() - cascade_begin_date) + "ms)");
            logger.error(err);
            logger.groupEnd();
            resolved = true;
        });
        setTimeout(function () {
            //logger.log('checking state of cascade ' + id)
            if (resolved)
                return;
            logger.groupCollapsed("??? promised \"" + id + "\" not yet resolved after " + (Date.now() - cascade_begin_date) + "ms...");
            logger.error('Timed out...', TIMEOUT_MS);
            logger.groupEnd();
        }, TIMEOUT_MS);
    }
    ////////////////////////////////////
    cascade.raw_config_from_network = fetch_raw_config_from_network();
    log_cascade('raw_config_from_network');
    ////////////////////////////////////
    cascade.raw_config_fast = promise_race_successful(cascade.raw_config_from_network, fetch_raw_config_from_local_storage());
    log_cascade('raw_config_fast');
    ////////////////////////////////////
    cascade.config_fast = cascade.raw_config_fast.then(parse_config);
    log_cascade('config_fast');
    ////////////////////////////////////
    cascade.config_latest = cascade.raw_config_from_network.then(parse_config);
    log_cascade('config_latest');
    ////////////////////////////////////
    cascade.raw_pages_from_network = fetch_raw_pages_from_network();
    log_cascade('raw_pages_from_network');
    ////////////////////////////////////
    cascade.raw_pages_fast = promise_race_successful(cascade.raw_pages_from_network, fetch_raw_pages_from_local_storage());
    log_cascade('raw_pages_fast');
    ////////////////////////////////////
    cascade.pages_fast = cascade.raw_pages_fast.then(parse_pages);
    log_cascade('pages_fast');
    ////////////////////////////////////
    cascade.pages_latest = cascade.raw_pages_from_network.then(parse_pages);
    log_cascade('pages_latest');
    ////////////////////////////////////
    cascade.dom_ready = new Promise(function (resolve) { return $(env.document).ready(function () { return resolve(); }); });
    log_cascade('dom_ready');
    ////////////////////////////////////
    Promise.all([
        cascade.raw_config_from_network,
        cascade.config_latest,
    ]).then(cache_latest_successful_raw_config_to_local_storage);
    Promise.all([
        cascade.raw_pages_from_network,
        cascade.pages_latest,
    ]).then(cache_latest_successful_raw_pages_to_local_storage);
    cascade.dom_ready
        .then(function () { return cascade.config_fast; })
        .then(render_wall)
        .catch(function (e) { return logger.error('fast wall rendering error', e); })
        .then(function () { return cascade.config_latest; })
        .then(render_wall)
        .catch(function (e) { return logger.error('latest wall rendering error', e); });
    ////////////////////////////////////
    env.logout = function () {
        Object.keys(CONSTS.LS_KEYS).forEach(function (k, v) {
            env.localStorage.clear();
        });
    };
    env.authentify = function (user_selected_lang, password, from_saved_data) {
        if (from_saved_data === void 0) { from_saved_data = false; }
        //logger.info('[authentify]', {user_selected_lang, password, from_saved_data, state.authentified})
        if (state.authentified)
            return;
        var best_config = promise_race_successful(cascade.config_latest, cascade.config_fast);
        best_config.then(function (config) {
            logger.info("[authentify] config ready, advancing...");
            //logger.info(`[authentify] checking pwd against "${config.password}"…`)
            if (password === config.password) {
                logger.info("[authentify] success !");
                state.authentified = true;
                if (!from_saved_data) {
                    env.localStorage.setItem(CONSTS.LS_KEYS.last_successful_password, password);
                    env.localStorage.setItem(CONSTS.LS_KEYS.last_chosen_lang, user_selected_lang);
                }
                // choose best language
                logger.log('choosing lang', config.languages, user_selected_lang, CONSTS.NAVIGATOR_LANG, CONSTS.DEFAULT_UI_LANG);
                var best_auto_lang = config.languages.includes(CONSTS.NAVIGATOR_LANG) ? CONSTS.NAVIGATOR_LANG : CONSTS.DEFAULT_UI_LANG;
                logger.log('best_auto_lang', best_auto_lang);
                var lang_1 = user_selected_lang || best_auto_lang || CONSTS.DEFAULT_UI_LANG;
                env.document.title = I18N.wall_header[lang_1](config);
                var best_pages = promise_race_successful(cascade.pages_latest, cascade.pages_fast);
                best_pages
                    .then(function (pages) { return render_main(config, pages, lang_1); })
                    .then(function swap_wall_and_content() {
                    var el_wall = document.querySelectorAll('#wall')[0];
                    el_wall.style.display = 'none';
                    var el_site = document.querySelectorAll('.main-delayed');
                    polyfill_forEach_if_missing_on(el_site);
                    el_site.forEach(function (el) { if (el.classList)
                        el.classList.remove('dn'); });
                })
                    .catch(function (e) { return logger.error('rendering error', e); });
            }
            else {
            }
        });
        return false;
    };
    cascade.dom_ready.then(function () {
        var last_successful_password = env.localStorage.getItem(CONSTS.LS_KEYS.last_successful_password);
        if (!last_successful_password)
            return;
        var last_chosen_lang = env.localStorage.getItem(CONSTS.LS_KEYS.last_chosen_lang);
        if (!last_chosen_lang)
            return;
        logger.info('attempting auto-auth...');
        env.authentify(last_chosen_lang, last_successful_password, true);
    });
})(window);
//# sourceMappingURL=minisite.js.map