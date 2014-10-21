var assert = require("assert");
var ytrans = require("../lib/ytrans");
var settings = require("../lib/helpers");


describe("Initializer test", function() {
    it("# With no key invoked async", function(done) {
        new ytrans({api_key_path: __filename}, function(err, freshYTrans) {
            assert.equal(err instanceof Error, true, "Expecting an error back!");
            assert.equal(! freshYTrans, true, "Not expecting the object back!");
            done();
        });
    });

    it("# Initialization test sync", function(done) {
        var yt = new ytrans();
        assert.notEqual(yt, null, 'Cannot be null');
        assert.equal(yt instanceof ytrans, true, 'Should be a yt instance');
        done();
    });

    it("# Initialization test async", function(done) {
        new ytrans(function(err, yt) {
            assert.notEqual(yt, null, 'Cannot be null');
            assert.equal(yt instanceof ytrans, true, 'Should be a yt instance');
            done();
        });
    });

    it("# Testing for enumerability of key and translate_uri!", function(done) {
        var yt = new ytrans();
        assert.equal('api_secret' in yt, true, "api_secret is an attribute!");
        assert.equal(yt.propertyIsEnumerable('api_secret'),
                            false, "api_secret should be non-enumerable!");

        assert.equal('translate_uri' in yt, true, "translate_uri is an attribute!");
        assert.equal(yt.propertyIsEnumerable('translate_uri'),
                            false, "translate_uri should be non-enumerable!");
        done();
    });
});


describe("Result handler test", function() {
    before(function() {
        this.yt = new ytrans();
    });

    it("# Init with no cb", function(done) {
        var r1 = this.yt.result_handler(null, null);
        assert.notEqual(r1, true, "Should return some content");
        assert.equal(typeof r1, 'object', "Should return an object!");

        assert.equal(! r1.err, true, "Not expecting any error");

        var r2 = this.yt.result_handler(null, null, null);
        assert.notEqual(r2, true, "Should return some content");
        assert.equal(! r2.err, true, "Not expecting any error");

        done();
    });
});


describe("Key initialization test", function() {
    before(function() {
        this.yt = new ytrans();
    });

    it("# Initializing with directory", function(done) {
        var result = this.yt.read_key("/");
        assert.equal(result.err instanceof Error, true, 'An error should be returned');
        done();
    });

    it("# Init with directory async", function(done) {
        this.yt.read_key("/", function(err, res) {
            assert.equal(err instanceof Error, true, 'An error should be returned');
            done();
        });
    });


    it("# Init with invalid file sync", function(done) {
        var result = this.yt.read_key(__filename);
        assert.equal(result.err instanceof Error, true, 'An error should be returned');
        done();
    });

    it("# Init with invalid file async", function(done) {
        this.yt.read_key(__filename, function(err, res) {
            assert.equal(err instanceof Error, true, 'An error should be returned');;
            done();
        });
    });

    it("# Init with key from file", function(done) {
        var key_result = this.yt.set_key_from_path('../test/.test_key.json');
        assert.notEqual(! key_result, true, "Expecting results back!");
        done();
    });


    it("# Init with key from file async", function(done) {
        this.yt.set_key_from_path('../test/.test_key.json', function(err, res) {
            console.log(err);
            done();
        });
    });
});


describe("Handling error codes", function() {
    before(function() {
        this.yt = new ytrans();
    });

    it("# Known error codes", function(done) {
        assert.notEqual(! settings, true, "Expecting settings in");
        assert.notEqual(! settings.error_codes, true, "Expecting settings in");
        for (var status_code in settings.error_codes) {
            var err = this.yt.status_code_to_err(status_code);
            assert.equal(err instanceof Error, true, "Expecting an err");
        };
        done();
    });


    it("# Unknown error codes", function(done) {
        assert.notEqual(this.yt.status_code_to_err(200) instanceof Error,
                                            true, "A 200 shouldn't return an err!");

        assert.equal(this.yt.status_code_to_err(200), null, "A 200 is a successful op!");
        assert.equal(this.yt.status_code_to_err(500) instanceof Error, true, "Expecting an error!");
        assert.equal(this.yt.status_code_to_err(403) instanceof Error, true, "Expecting an error!");
        done();
    });
});

describe("Invoking the API", function() {
    before(function() {
        this.yt = new ytrans({api_key_path: '../test/.test_key.json'});
    });


    it("# Detect language", function(done) {
        this.yt.detect('přeložit', function(err, res) {
            console.log('lang detected', res, err);
            assert.notEqual(! res, true, "Expected a result back!");
            assert.equal(res.lang, 'cs', 'CS expected!');
            done();
        });
    });

    it("# Call API", function(done) {
        this.yt.translate({text: ['translate', 'person'], lang: 'en-ru'}, function(err, res) {
            assert.equal(err, null, "No error expected back!");
            done();
        });
    });

    it("# # Non string default lang setting", function(done) {
        var that = this;
        that.yt.set_default_lang(12, function(err, validity) {
            assert.equal(err instanceof Error, true, "Expecting an error back!");
            assert.equal(validity, false, "Not a valid language!");
            that.yt.set_default_lang({}, function(err2, validity2) {
                assert.equal(err2 instanceof Error, true, "Expecting an error back!");
                assert.equal(validity2, false, "Not a valid language!");
                done();
            });
        });
    });

    it("# # Non string default lang setting", function(done) {
        var that = this;
        that.yt.set_default_lang(12, function(err, success) {
            assert.equal(err instanceof Error, true, "Expecting an error back!");
            assert.equal(! success, true, "Not a valid language!");
            that.yt.set_default_lang({}, function(err2, success2) {
                assert.equal(err2 instanceof Error, true, "Expecting an error back!");
                assert.equal(! success2, true, "Not a valid language!");
                done();
            });
        });
    });

    it("# Proper Default lang setting", function(done) {
        var that = this;
        that.yt.set_default_lang("es", function(err, success) {
            assert.equal(err instanceof Error, false, "No error expected!");
            assert.notEqual(! success, true, "This is a valid language!");
            assert.equal(that.yt.get_default_lang(), "es", "'es' should have been set as default lang!");

            that.yt.set_default_lang("sv", function(err2, success2) {
                assert.equal(err2 instanceof Error, false, "No error expected!");
                assert.notEqual(! success2, true, "This is a valid language!");
                assert.equal(that.yt.get_default_lang(), "sv", "'sv' expected!");

                done();
            });
        });
    });


    it("# Translate", function(done) {
        this.yt.translate("hello", function(err, res) {
            assert.equal(err, null, "No error expected!");
            console.log(res);
            done();
        });
    });

    it("# Getting allowed translations", function(done) {
        this.yt.fetch_languages(function(err, res) {
            assert.equal(! err, true, "Not expecting errors back!");
            done();
        });
    });

    it("# Checking for validity of translations", function(done) {
        var that = this;
        that.yt.fetch_languages(function() {
            var response = that.yt.get_allowed_translations("uk");
            assert.notEqual(! response, true, "Expecting databack!");

            var from_ukrainian = response.result;
            assert.notEqual(! from_ukrainian, true, "Expecting a map of translations");
            assert.equal(from_ukrainian instanceof Object, true, "Expecting a map!");

            done();
        });
    });

    it("# Checking for lang validity, compulsory miss then a cached miss", function(done) {
        var that  = this;
        var test_lang = "FAKE";
        that.yt.is_valid_lang(test_lang, function(err, validity) {
            assert.equal(err, null, "No errors expected!");
            assert.equal(validity, false, "Fake language is not valid!");

            // No net call expected now -- this miss was already cached!
            that.yt.is_valid_lang(test_lang, function(err, v2) {
                assert.equal(err, null, "No errors expected!");
                assert.equal(v2, false, "Fake language is not valid!");
                done();
            });
        });
    });


    it("# Checking for allowed transitions known", function(done) {
        this.yt.is_allowed_transition("en", "uk", function(err, validity) {
            assert.equal(err, null, "No errors expected!");
            assert.equal(validity, true, "This is a known & acceptable transition!");
            done();
        });
    });


    it("# Checking for feigned transitions", function(done) {
        this.yt.is_allowed_transition("en", "at", function(err, validity) {
            assert.equal(err, null, "No errors expected!");
            assert.equal(validity, false, "This is a fake transition!");
            done();
        });
    });
});


describe("Flavours of file translation", function() {
    before(function() {
        this.yt = new ytrans({api_key_path: '../test/.test_key.json'});
    });

    it("# With null path", function(done) {
        this.yt.translate_file(null, function(err, result) {
            assert.equal(err instanceof Error, true, "Expecting an error");
            done();
        });
    });

    it("# Passing just path into func", function(done) {
        this.timeout(100000); // Translating massive files
        this.yt.translate_file(__filename, function(err, content) {
            console.log(content);
            assert.equal(err, null, "No errors expected!");
            assert.equal(! content, false, "Expecting content back!");
            done();
        });
    });

    it("# Passing in params by object", function(done) {
        this.timeout(100000); // Translating massive files
        this.yt.translate_file({
            path: __filename, lang: 'de'
        }, function(err, content) {
            console.log(content);
            assert.equal(err, null, "No errors expected!");
            assert.equal(! content, false, "Expecting content back!");
            done();
        });
    });
});
