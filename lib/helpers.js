var util = require("util");
var request = require("request");

var YANDEX_URI = "https://translate.yandex.net/api/v1.5/tr.json";


var error_codes = {
    // Copied from https://github.com/rkashapov/yandex-translator's definitions
    401: "Invalid API key.",
    402: "This API key has been blocked.",
    403: "You have reach the daily limit for requests " +
         "(including calls to the translate method).",
    404: "You have reached the daily limit for volume of translated "+
         "text (including calls to the translate method).",
    413: "The text size exceeds the maximum",
    422: "The text could not be translated.",
    501: "The specified translation direction is not supported"
};


function textify(item) {
    if (! item)
        item = '';
    else if (typeof item !== 'string')
        item = item + '';

    // It is important to preserve the white space replacement scheme
    // ie instead of replacing multiple blanks with one '+', use many '+'s
    item = item.replace(/\s/g, '+');
    return util.format('text=%s', item);
};


function code_to_err(code) {
    if (code === 200)
        return null;

    return Error(error_codes[code] || 'Unhandled error');
};


function ytransify(uri, method, content) {
    if (!uri)
        uri = YANDEX_URI;

    uri = uri.trim() + '/' + method;

    return util.format("%s?%s", uri.trim(), content);
};


function _perform_net_get(obj, uri, attr_extractors, cb) {
    request.get(uri, function(err, response, result) {
        var json_result = JSON.parse(result);
        var thrown_err = obj.status_code_to_err(json_result.code || 200);

        var content = {};

        for (var i = 0, ext_len = attr_extractors.length; i < ext_len; i++) {
            var cur_attr = attr_extractors[i];

            if (cur_attr in json_result)
                content[cur_attr] = json_result[cur_attr];
        }

        obj.result_handler(content, thrown_err, cb);
    });
};


function hyphen_split(it) {
    if (typeof it !== 'string')
        return it;
    return it.split('-');
};


module.exports = {
    textify:            textify,
    ytransify:          ytransify,
    YANDEX_URI:         YANDEX_URI,
    code_to_err:        code_to_err,
    error_codes:        error_codes,
    hyphen_split :      hyphen_split,
    perform_net_get:    _perform_net_get
};
