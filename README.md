
ytrans.js  [![Build Status](https://travis-ci.org/odeke-em/ytrans.js.svg)](https://travis-ci.org/odeke-em/ytrans.js)  [![Coverage Status](https://coveralls.io/repos/odeke-em/ytrans.js/badge.png)](https://coveralls.io/r/odeke-em/ytrans.js)
=========

+ Unofficial NodeJS API for Yandex translation services.

* A similar project that I'd recommend checking out for Python is:

   [yTrans](https://github.com/rkashapov/yandex-translator) by [Rustam Kashapov](https://github.com/rkashapov)


Usage:
========

```
    var ytrans = require('ytrans.js');
    var yt = new ytrans();
    yt.set_key(API_KEY);

    yt.translate({
        text: ['good afternoon!', 'what is your name?'], lang: 'en-de'
    }, function(err, translation) {
        ...;
    });

```
    var ytk = new ytrans({api_key_path: API_KEY_PATH});
    ytk.get_allowed_translations("uk", function(err, secondaries {
        ...;
    });
```

```
    var ytk1 = new ytrans(API_KEY_PATH);
    ytk1.translate_file({
        path: TARGET_FILE, lang: 'cs-ru'
    }, function(err, content) {
        ...;
    });

    ytk1.is_allowed_transition("ru", "ch", function(err, validity) {
        ...;
    });
```

* [Detailed usage](https://github.com/odeke-em/ytrans.js/blob/master/test/ytrans-test.js)
