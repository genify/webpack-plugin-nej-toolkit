let path = require('path');
let NEJEntry = require('../../../src/plugin/Entry');

module.exports = {
    entry: path.resolve(__dirname,'release.conf'),
    plugins: [
        new NEJEntry()
    ]
};