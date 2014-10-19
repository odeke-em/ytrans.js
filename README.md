
ytrans.js  [![Build Status](https://travis-ci.org/odeke-em/ytrans.js.svg)](https://travis-ci.org/odeke-em/ytrans.js)
=========

+ Unofficial Node.js API for [Yandex translation services](http://translate.yandex.com).

+ You'll need an API key in order to access the translation service.

* A similar project that I'd recommend checking out for Python is:

   [yTrans](https://github.com/rkashapov/yandex-translator) by [Rustam Kashapov](https://github.com/rkashapov)


Usage:
========

 + If you don't already have one, get an API key [here](http://api.yandex.com/key/form.xml?service=trnsl)

* For more detailed usage, please visit [Detailed usage](https://github.com/odeke-em/ytrans.js/blob/master/test/ytrans-test.js), otherwise:

```
    var ytrans = require('ytrans.js');
    var yt = new ytrans();
    yt.set_key(API_KEY);

    yt.translate('Hello there!', function(err, result) {
        ...;
    });
```

```
    yt.set_default_lang("sk", function(err, success) {
        if (err || ! success)
            console.log("Failed to set the default language: look at results ", arguments);
        else
            console.log("Successfully set the default language!");
    });
```

```  
    yt.translate({
        text: ['кофе', 'Я знаю, французской и правда'], lang: 'de'
    }, function(err, translation) {
        ...;
    });
```

```
    var ytk = new ytrans({api_key_path: API_KEY_PATH});
    ytk.get_allowed_translations("uk", function(err, secondaries) {
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

```
    var catfish = new ytrans(API_KEY_PATH);
    catfish.translate({
        text: ["Je sais espagnol pour de vrai, je suis couché LOL"], lang: "es"
    }, function(err, res) {
        ...;
    });
```
