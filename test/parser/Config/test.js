let expect = require('chai').expect;
let CFGParser = require('../../../lib/parser/Config.js');

describe('CFGParser', () => {

    describe('new CFGParser', () => {

        it('should be ok to instance CFGParser without config file', () => {
            let inst = new CFGParser();
            expect(inst instanceof CFGParser).to.be.true;
        });

        it('should be ok to instance CFGParser with config file', () => {
            let inst = new CFGParser({
                config: __dirname+'/release.conf'
            });
            expect(inst instanceof CFGParser).to.be.true;
        });

    });

});


