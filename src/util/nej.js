/*
 * NEJ Utility API
 *
 * @author caijf(genify@163.com)
 */
const path = require('path');
const qs   = require('querystring');
const ut   = require('./util.js');

/**
 * check uri is nej define file
 *
 * @param  {String} uri - script uri
 * @return {Boolean} is nej define file
 */
exports.isNEJDefine = function (uri='') {
    return /\bdefine\.js\b/i.test(uri);
}

/**
 * check source is nej script code
 *
 * @param  {String} code - script code
 * @return {Boolean} is nej script code
 */
exports.isNEJScript = function (code='') {
    return /(NEJ\.)?define\s*\(/.test(code);
};

/**
 * parse nej define.js uri
 *
 * @param  {String} uri - define.js uri
 * @param  {String} root - web root path
 * @return {Object} parse result, e.g. {nejRoot:'http://a.b.com/nej/',nejPlatform:'td',params:{}}
 */
exports.parseNEJDefURI = function (uri, root) {
    // 0 - http://a.b.com/nej/define.js
    // 1 - a=aaaa&b=bbbb&c=ccccc
    let ret = {};
    let arr = (uri||'').split(/[?#]/);
    // for nej lib root
    ret.nejRoot = path.dirname(arr[0])+'/';
    // for nej config parameters
    ret.params = qs.parse(arr[1]||'')||{};
    // ignore c,g,d,p config
    // for default pro parameter
    if (!ret.params.pro){
        ret.params.pro = ut.absolute(
            root, './src/javascript/'
        );
    }
    return ret;
};

/**
 * check mode is match to test
 *
 * @param  {String} mode - mode string,e.g. online|test or !online
 * @param  {String} test - test string
 * @return {Boolean} mode is match to test
 */
exports.isModeOf = function(mode, test){
    let arr = (mode||'').split('|');
    // check mode
    let ret = false;
    arr.some((value) => {
        if (!value){
            return;
        }
        // for !xxxx
        let ret1 = value===test,
            // for yyyy
            ret2 = value.indexOf('!')===0&&
                value.substr(1)!=test;
        // match result
        ret = ret1||ret2;
        return ret;
    });
    return ret;
};

