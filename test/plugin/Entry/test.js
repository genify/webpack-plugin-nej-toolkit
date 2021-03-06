let expect = require('chai').expect;
let webpack = require('webpack');
let config = require('./webpack.config.js');

describe('Entry', () => {

    it('should be ok to new Entry Plugin', (done) => {
        let compiler = webpack(config);
        compiler.apply(new webpack.ProgressPlugin());
        compiler.run(function(err, stats) {
            console.error(err);
            console.error(stats);
            done();
        });
    });

});
