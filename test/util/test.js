let expect = require('chai').expect;
let path = require('../../lib/util/path.js');

describe('path', () => {

    describe('.resolve', () => {

        it('should be ok to resolve window path', () => {
            var root = 'c:\\a\\b';
            var test = {
                'c:/a/d'    : 'c:/a/d',
                '/c/v'      : 'c:/c/v',
                'c/v'       : 'c:/a/b/c/v',
                './c/v'     : 'c:/a/b/c/v',
                '../c/v'    : 'c:/a/c/v'
            };
            Object.keys(test).forEach((key) => {
                expect(path.resolve(root, key)).to.eql(test[key]);
            });
        });

    });

});


