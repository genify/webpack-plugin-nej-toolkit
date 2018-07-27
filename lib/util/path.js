/*
 * Path Utility API
 *
 * @author caijf(genify@163.com)
 */
const path = require('path');


/**
 * resolves a sequence of paths or path segments into an absolute path
 *
 * @return {String} absolute path
 */
exports.resolve = function () {
    let ret = path.resolve(...arguments);
    return ret.replace(/\\+/g,'/');
};

