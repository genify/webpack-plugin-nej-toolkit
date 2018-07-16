let path = require('path');
let NEJPluginPrepareEntry = require('../../lib/plugins/PrepareEntry');

module.exports = {
    entry: path.resolve(__dirname,'release.conf'),
    plugins: [
        new NEJPluginPrepareEntry()
    ]
};