/* jshint -W030 */
var expect = require('chai').expect;
var splitter = require('../lib/splitter')();

var grunt = require('grunt');
var path = require('path');

describe('splitter', function () {
    var result;

    beforeEach(function () {
        result = splitter.split(grunt.file.read('test/fixtures/flatten/threeRules.css'), 2);
    });

    it('splits a stylesheet into the correct number of pages', function () {

        expect(result).to.be.an('array');
        expect(result).to.have.length(2);
    });
});

describe('csssplit', function () {

    it('creates all the expected files', function () {
        grunt.file.recurse('test/expected', function (abspath, rootdir, subdir, filename) {
            var expected = grunt.file.read(path.join('test', 'expected', subdir || '', filename));
            var actual = grunt.file.read(path.join('tmp',  subdir || '', filename));
            expect(expected).to.equal(actual);
        });
    });

    it('didnt create any unexpected files', function () {
        grunt.file.recurse('tmp', function (abspath, rootdir, subdir, filename) {
            var expected = grunt.file.read(path.join('tmp',  subdir || '', filename));
            var actual = grunt.file.read(path.join('test', 'expected', subdir || '', filename));
            expect(expected).to.equal(actual);
        });
    });
});
