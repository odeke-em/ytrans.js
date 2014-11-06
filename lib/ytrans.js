var fs = require('fs');
var util = require('util');
var assert = require('assert');
var _un     = require('underscore');
var request = require('request');

var helpers = require('./helpers');

function YTrans(params, cb) {
    this.init.apply(this, arguments);
};

module.exports = YTrans;

YTrans.prototype.set_api_version = function(__v, cb) {
    if (typeof __v === 'function' && ! cb) {
        cb = __v;
        __v = null;
    }

    var api_info = helpers.get_api_info(__v);
    this.api_version = api_info.version;
    this.translate_uri = api_info.uri;

    return this.result_handler(this.api_version, null, cb);
};

YTrans.prototype.init = function(init_params, cb) {
    var argc = arguments.length;
    if (argc == 1) {
        if (typeof arguments[0] === 'function') {
            cb = arguments[0];
            init_params = null;
        }
    }

    var params = init_params || {};

    this.api_secret = null;
    this.set_api_version(params.__v);
 
    // Make both the api_key and translate_uri
    // unenumerable and not console loggable by default
    if (typeof Object.defineProperty === 'function') {
        Object.defineProperty(this, 'api_secret', {enumerable: false});
        Object.defineProperty(this, 'translate_uri', {enumerable: false});
    }

    this._valid_langs = {};
    this._invalid_langs = {};

    this.default_lang = params.default_lang || 'ru';

    api_key =  params.api_key;
    var can_callback = typeof cb === 'function' ? true : false;

    if (params.api_key_path) {
        result = this.read_key(params.api_key_path);
        if (! result.err)
            api_key = result.result;
        else {
            if (can_callback)
                return cb(result.err, result.err ? null : this);
            else
                throw result.err;
        }
    }

    if (api_key) {
        result = this.init_api_key(api_key);

        if (can_callback) {
            return cb(result.err, result.err ? null : this);
        } else {
            if (result.err)
                throw result.err;
            else
                return this;
        }
    } else {
        if (can_callback)
            return cb(null, this);
        
        return this;
    }
};

YTrans.prototype.result_handler = function(result, err, cb) {
    if (err) {
        if (! (err instanceof Error)) // Could be the intended message
            err = Error(err);
    }

    if (typeof cb === 'function') {
        return cb(err, result);
    } else {
        var res = {
            result: result
        };

        if (err)
            res.err = err;

        return res;
    }
};

YTrans.prototype.init_api_key = function(key, cb) {
    if (! key)
        return this.result_handler(key, 'A key is needed!', cb);

    this.api_secret = key;
    return this.result_handler('OK', null, cb);
};

YTrans.prototype.get_default_lang = function() {
    return this.default_lang;
};

YTrans.prototype.set_default_lang = function(lang, cb) {
    if (! (lang && typeof lang === 'string' && lang.length >= 1))
        return this.result_handler(false,
                    'Can only set \'default_lang\' to a non empty string', cb);

    var that = this;
    this.is_valid_lang(lang, function(err, is_valid) {
        if (err)
            return that.result_handler(false, err, cb);
        else if (! is_valid)
            return that.result_handler(false, 'Unacceptable language!', cb);

        that.default_lang = lang;
        return that.result_handler(true, null, cb);
    });
};

YTrans.prototype.set_key = function(key, cb) {
    this.init_api_key(key, cb);
};

YTrans.prototype.set_key_from_path = function(path, cb) {
    var read_result = this.read_key(path);
    if (read_result.err)
        return this.result_handler(read_result, read_result.err, cb);

    return this.result_handler(read_result.result, null, cb);
};

YTrans.prototype.appendKeyToURI = function(obj) {
    obj = obj || {};
    assert.notEqual(
            ! this.api_secret, true, 'Expecting the API key to have been set!');

    return util.format('%s/%s?key=%s', obj.uri || this.translate_uri,
                                obj.method || 'translate', this.api_secret);
};

YTrans.prototype.invoke_api = function(method, data, attr_selectors, cb) {
    var preparedURI = this.appendKeyToURI({method: method});
    if (data)
        preparedURI += '&' + data;

    helpers.perform_net_get(this,  encodeURI(preparedURI), attr_selectors, cb);
};

YTrans.prototype.status_code_to_err = function(status_code) {
    return helpers.code_to_err(status_code);
};

YTrans.prototype.err_if_unexpected_type = function(item, expected_type) {
    var item_type = typeof item;
    if (expected_type !== item_type)
        return Error(
              util.format('Expected \'%s\', instead got \'%s\'',
                                                expected_type, item_type));
};

YTrans.prototype.translate = function(data, cb) {
    var text_args = '';
    var lang_str = this.default_lang;

    if (! data)
        return this.result_handler(null,
                                'Expecting an object or non-empty string!', cb);

    else if (typeof data === 'string')
        text_args = [data];
    else if (! (data instanceof Object))
        return this.result_handler(null,
                        'Expecting an object if a string is not passed in', cb);
                    
    else {
        if (typeof data.lang === 'string')
            lang_str = data.lang;

        if (data.text instanceof Array)
            text_args = data.text;
        else
            text_args = [data.text];
    }

    var mapped = _un.map(text_args, helpers.textify);
    joined = util.format('lang=%s&%s', lang_str, mapped.join('&'));

    return this.invoke_api('translate', joined, ['message', 'text'], cb);
};

YTrans.prototype.detect = function(text, cb) {
    return this.invoke_api('detect', 'text=' + text, ['lang', 'message'], cb);
};

YTrans.prototype.read_file_content = function(path, cb) {
    if (! path)
        return this.result_handler(null, 'Non empty path expected', cb);
    else if (typeof path !== 'string')
        return this.result_handler(null, 'Expecting strings only!', cb);
    else if (! fs.existsSync(path))
        return this.result_handler(null, 'No such file exists!', cb);
    else if (! fs.lstatSync(path).isFile())
        return this.result_handler(null, 'Is not a file!', cb);
    else {
        var content = fs.readFileSync(path).toString();
        return this.result_handler(content.split('\n'), null, cb);
    }
};

YTrans.prototype.translate_file = function(params, cb) {
    if (typeof params === 'string')
        params = {path: params};
    else if (! (params instanceof Object))
        return this.result_handler(
                    null, '\'params\' should be an object or string', cb);

    var res = this.read_file_content(params.path);
    if (res.err)
        return this.result_handler(null, res.err, cb);

    return this.translate({
        text: res.result, lang: params.lang
    }, cb);
};

YTrans.prototype.read_key = function(path, cb) {
    var err = null;
    var key = null;

    try {
        config = require(path);
        if (! (config && config.key && typeof config.key === 'string'))
            throw Error('Could not get a key in');
        else
            key = config.key;
    } catch (ex) {
        err = ex;
    } finally {
        return this.result_handler(key, err, cb);
    }
};

YTrans.prototype.fetch_languages = function(cb) {
    var that = this;
    this.invoke_api('getLangs', '', ['dirs'], function(err, res) {
        if (err)
            return that.result_handler(null, err, cb);
        else {
            var lang_map = {};
            var split_langs = _un.map(res.dirs, helpers.hyphen_split);

            split_langs.forEach(function(arr_item) {
                var primary = arr_item[0];
                var secondary = arr_item[1];

                if (! (primary in lang_map)) {
                    // Using a map for constant time lookups
                    // when determining if a secondary is allowed
                    lang_map[primary] = {};
                }

                lang_map[primary][secondary] = true;
            });

            that._valid_langs = lang_map;
            that.result_handler(lang_map, null, cb);
        }
    });
};

YTrans.prototype.is_valid_lang = function(lang_str, cb) {
    var bad_type_err = this.err_if_unexpected_type(lang_str, 'string');
    if (bad_type_err)
        return this.result_handler(null, bad_type_err, cb);

    lang_str = lang_str.toLowerCase();

    if (lang_str in this._invalid_langs)
        return this.result_handler(false, null, cb);
    else if (lang_str in this._valid_langs)
        return this.result_handler(true, null, cb);

    var that = this;

    // Could be a compulsory miss, so refresh anyways
    this.fetch_languages(function() {
        if (lang_str in that._valid_langs)
            return that.result_handler(true, null, cb);
        else {
            // Black list/cache that miss now
            that._invalid_langs[lang_str] = true;
            return that.result_handler(false, null, cb);
        }
    });
};

YTrans.prototype.get_allowed_translations = function(lang_str, cb) {
     var bad_type_err = this.err_if_unexpected_type(lang_str, 'string');
    if (bad_type_err)
        return this.result_handler(null, bad_type_err, cb);

    lang_str = lang_str.toLowerCase();
    return this.result_handler(this._valid_langs[lang_str], null, cb);
};

YTrans.prototype.is_allowed_transition = function(primary, secondary, cb) {
    var that = this;
    this.get_allowed_translations(primary, function(err, secondary_map) {
        if (err)
            return that.result_handler(false, err, cb);

        return that.result_handler(secondary in secondary_map, null, cb);
    });
};
