let fs = require('fs');
let expect = require('chai').expect;
let NEJRoot = require('../../../src/parser/Root.js');
let CFGParser = require('../../../src/parser/Config.js');

let log = (msg) => {
    // console.log(msg);
};

describe('NEJRoot', function() {
    this.timeout(100000000);

    describe('new NEJRoot', () => {

        it('should be error if no nej config instance', (done) => {
            new NEJRoot({
                error: () => {
                    done();
                }
            });
        });

        it('should be ok to instance NEJRoot with config file', (done) => {
            let cfg = new CFGParser({
                config: __dirname+'/release.conf'
            });
            let error = false;
            let root = new NEJRoot({
                config: cfg,
                error: () => {
                    error = true;
                },
                done: () => {
                    expect(root instanceof NEJRoot).to.be.true;
                    expect(error).to.be.false;
                    done();
                }
            });

        });

        it('should be ok to instance NEJRoot with config file', (done) => {
            let cfg = new CFGParser({
                config: 'D:\\WorkSpace\\haitaowap\\src\\main\\deploy\\release.conf'
            });
            let error = false;
            let root = new NEJRoot({
                config: cfg,
                error: () => {
                    error = true;
                },
                done: () => {
                    expect(root instanceof NEJRoot).to.be.true;
                    expect(error).to.be.false;
                    done();
                }
            });
        });

    });




});


