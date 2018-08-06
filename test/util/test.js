let expect = require('chai').expect;
let util = require('../../src/util/util.js');

describe('util api', () => {

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
                expect(util.normalize(key, true)).to.eql(test[key]);
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
                expect(util.normalize(key)).to.eql(test[key]);
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
                expect(util.absolute(root, key)).to.eql(test[key]);
            });
        });
    });

    describe('.eval', () => {
        
        it('should be ok to eval right script', () => {
            expect(util.eval('a = "1111"').a).to.eql('1111');
        });

        it('should be ok to eval script with error', () => {
            expect(util.eval('a = alert(abc)').a).to.eql(undefined);
        });
        
    });

    describe('.ls', () => {

        it('should be ok to list not exist directory', () => {
            expect(util.ls('./abc')).to.eql([]);
        });

        it('should be ok to list files without filter', () => {
            let ret = util.ls(__dirname+'/a');
            expect(ret.length).to.eql(3);
        });

        it('should be ok to list files with filter', () => {
            let ret = util.ls(__dirname+'/a', function (name, file) {
                return name.indexOf('b')===0;
            });
            expect(ret.length).to.eql(2);
        });

    });

});


