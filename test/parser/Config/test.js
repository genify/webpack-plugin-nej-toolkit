// let expect = require('chai').expect;
let CFGParser = require('../../../src/parser/Config.js');

describe('CFGParser', () => {

    describe('new CFGParser', () => {

        it('should be ok to instance CFGParser without config file', (done) => {
            new CFGParser({
                error: (e) => {
                    console.error(e.message);
                },
                warn: (e) => {
                    console.warn(e.message);
                },
                info: (e) => {
                    console.info(e.message);
                },
                debug: (e) => {
                    console.debug(e.message);
                },
                done: (e) => {
                    console.info(e.message);
                    done();
                }
            });
        });

        it('should be ok to instance CFGParser with config file', (done) => {
            new CFGParser({
                config: __dirname+'/release.conf',
                error: (e) => {
                    console.error(e.message);
                },
                warn: (e) => {
                    console.warn(e.message);
                },
                info: (e) => {
                    console.info(e.message);
                },
                debug: (e) => {
                    console.debug(e.message);
                },
                done: (e) => {
                    console.info(e.message);
                    done();
                }
            });
        });

    });

});


