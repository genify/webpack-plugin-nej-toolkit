let fs = require('fs');
let expect = require('chai').expect;
let HTMLParser = require('../../../src/parser/HTML.js');
    
describe('HTMLParser',function(){
    
    describe('new Parser',function(){
        let cases = [
            {
                file: 'a.ftl',
                result: 'a.json'
            },
            {
                file: 'g.html',
                result: 'g.json'
            },
            {
                file: 'b.ftl',
                result: 'b.json'
            },
            {
                file: 'c.ftl',
                result: 'c.json'
            },
            {
                file: 'd.ftl',
                result: 'd.json'
            },
            {
                file: 'e.ftl',
                result: 'e.json'
            },
            {
                file: 'f.html',
                result: 'f.json'
            }
        ];

        cases.forEach((conf) => {
            it('should be ok to parse file '+conf.file, () => {
                let file = __dirname+'/'+conf.file;
                let parser = new HTMLParser({
                    file: file,
                    content:fs.readFileSync(file,'utf-8')
                });
                expect(parser instanceof HTMLParser).to.be.true;
                let match = require(__dirname+'/'+conf.result);
                let left = JSON.parse(JSON.stringify(parser.result));
                console.log('%j', left);
                expect(left).to.deep.equal(match);
            });
        });
    });
    
});
