"use strict";
console.log('Hello from minisite.js');
window.minisite = (function (env) {
    'use strict';
    ////////////////////////////////////
    var MAX_PAGES = 10;
    var DEFAULT_LANG = 'en';
    var PAGE_ITERATOR = Array(MAX_PAGES).slice().map(function (x, i) { return i; });
    var DEFAULT_CONTENT = {
        common: {},
        pages: PAGE_ITERATOR.map(function (i) { return ({
            index: i + 1,
            title: "#" + (i + 1),
            image: 'cat.jpg',
            content: "#" + i + " Lorem ipsum"
        }); })
    };
    var NAVIGATOR_LANG = (window.navigator.userLanguage || window.navigator.language || 'en').split('-')[0];
    ////////////////////////////////////
    var state = {
        lang: NAVIGATOR_LANG,
        errors: [],
    };
    var content = {
        config: {},
        inferred_page_count: 0,
        pages: {},
    };
    ////////////////////////////////////
    var logger = console;
    var pegasus = env.pegasus;
    if (!pegasus)
        state.errors.push('Expected lib "pegasus" not found !');
    ////////////////////////////////////
    logger.log('constants', {
        MAX_PAGES: MAX_PAGES, DEFAULT_LANG: DEFAULT_LANG, DEFAULT_CONTENT: DEFAULT_CONTENT
    });
    function load_raw_file(url, required) {
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
    function attempt_load() {
        logger.info('Attempting to load latest data...');
        var raw = {
            fetch_begin_date: Date.now(),
            fetch_end_date: undefined,
            config: undefined,
            pages: [],
        };
        var promises = [];
        promises.push(load_raw_file('content/config.yaml', true)
            .then(function (data) { return raw.config = data; }));
        PAGE_ITERATOR.forEach(function (i) {
            return promises.push(load_raw_file("content/page" + (i + 1) + ".markdown")
                .then(function (data) {
                if (!data)
                    return;
                raw.pages[i] = data;
            }));
        });
        return Promise.all(promises)
            .then(function () {
            raw.fetch_end_date = Date.now();
            return raw;
        });
    }
    attempt_load()
        .then(function (raw_data) {
        logger.log('Load finished, latest load from server:', raw_data);
    });
    function render(content) {
    }
    return {
        render: render
    };
})(window);
//# sourceMappingURL=minisite.js.map