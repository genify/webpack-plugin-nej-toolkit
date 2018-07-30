let expect = require('chai').expect;
let path = require('../../src/util/util.js');

describe('util', () => {

    describe('.normalize', () => {
        it('should be ok to normalize directory path', () => {
            let test = {
                'c:/c/v'      : 'c:/c/v/',
                'c:/c/v/'     : 'c:/c/v/',
                'c:\\a/d/'    : 'c:/a/d/',
                'c:\\a\\b'    : 'c:/a/b/',
                'c:\\a\\b\\'  : 'c:/a/b/',
                '//a.b.com'   : '//a.b.com/',
                '//a.b.com/a' : '//a.b.com/a/',
                'http://a.b.com'   : 'http://a.b.com/',
                'http://a.b.com/a' : 'http://a.b.com/a/'
            };
            Object.keys(test).forEach((key) => {
                expect(path.normalize(key, true)).to.eql(test[key]);
            });
        });
        it('should be ok to normalize file path', () => {
            let test = {
                'c:/a/d.html'      : 'c:/a/d.html',
                'c:\\a\\b\\d.html' : 'c:/a/b/d.html',
                '//a.b.com/a/a.html' : '//a.b.com/a/a.html',
                'http://a.b.com/a/a.html' : 'http://a.b.com/a/a.html'
            };
            Object.keys(test).forEach((key) => {
                expect(path.normalize(key)).to.eql(test[key]);
            });
        });
    });

    describe('.absolute', () => {
        it('should be ok to resolve window path', () => {
            let root = 'c:\\a\\b';
            let test = {
                'c:/a/d'    : 'c:/a/d',
                '/c/v'      : 'c:/c/v',
                'c/v'       : 'c:/a/b/c/v',
                './c/v'     : 'c:/a/b/c/v',
                '../c/v'    : 'c:/a/c/v',

                'c:\\a/d/'  : 'c:/a/d/',
                '/c/v\\'    : 'c:/c/v/',
                'c/v\\'     : 'c:/a/b/c/v/',
                './c\\v/'   : 'c:/a/b/c/v/',
                '../c/v/'   : 'c:/a/c/v/',
                '../c/v//'  : 'c:/a/c/v/',
                '../c/v/a.html' : 'c:/a/c/v/a.html'
            };
            Object.keys(test).forEach((key) => {
                expect(path.absolute(root, key)).to.eql(test[key]);
            });
        });
    });



});


