var assert = require("assert");
var ytrans = require("../lib/ytrans");
var helpers = require("../lib/helpers");


describe("Initializer test", function() {
    it("# Sanity check!", function(done) {
        assert.equal(helpers.MIN_API_VERSION > 0, true, "Min should be > 0");
        assert.equal(helpers.MAX_API_VERSION > 0, true, "Max should be > 0");
        assert.equal(
            helpers.MIN_API_VERSION < helpers.MAX_API_VERSION, true, "Min must be >= max");
        done();
    });

    it("# Initialized with no api version", function(done) {
        var yt1 = new ytrans();
        assert.equal(! yt1, false, "Should init the object right");
        assert.equal(yt1.api_version == helpers.MIN_API_VERSION, true); 
        done();
    });

    it("# Range of spectrum for api versions", function(done) {
        var yt1 = new ytrans({__v: -0.1});
        assert.equal(yt1.api_version == helpers.MIN_API_VERSION, true); 

        yt1.set_api_version((helpers.MAX_API_VERSION + 1) * 10, function(err, __v) {
            assert.equal(__v == helpers.MIN_API_VERSION, true); 

            if (helpers.MAX_API_VERSION == helpers.MIN_API_VERSION)
                yt1.set_api_version(helpers.MAX_API_VERSION);
            else {
                yt1.set_api_version((helpers.MAX_API_VERSION + helpers.MIN_API_VERSION)/2);
                assert.equal(yt1.api_version > helpers.MIN_API_VERSION, true);
            }

            done();
        });
    });

    it("# Testing out illegal values", function(done) {
        var yt1 = new ytrans();
        yt1.set_api_version(function(err, __v) {
            assert.equal(!err, true, "No error expected!");
            assert.equal(__v == helpers.MIN_API_VERSION, true);

            yt1.set_api_version('garbage');
            assert.equal(yt1.api_version == helpers.MIN_API_VERSION, true);

            yt1.set_api_version(assert, function(err, __v2) {
                assert.equal(yt1.api_version == helpers.MIN_API_VERSION, true);
                done();
            });
        });
    });
});
