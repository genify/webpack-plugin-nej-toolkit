let path = require('path');
let NEJPluginPrepareEntry = require('../../src/plugins/PrepareEntry');

module.exports = {
    entry: path.resolve(__dirname,'release.conf'),
    plugins: [
        new NEJPluginPrepareEntry()
    ]
};