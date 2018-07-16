let expect = require('chai').expect;
let webpack = require('webpack');
let config = require('./webpack.config.js');

describe('PrepareEntryPlugin', () => {

    it('should be ok to new PrepareEntryPlugin', (done) => {
        let compiler = webpack(config);
        compiler.apply(new webpack.ProgressPlugin());
        compiler.run(function(err, stats) {
            done();
        });
    });

});
