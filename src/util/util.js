/*
 * Path Utility API
 *
 * @author caijf(genify@163.com)
 */
const fs   = require('fs');
const vm   = require('vm');
const path = require('path');

/**
 * normalizes the given path, all "\" or "/" format to "/"
 *
 * @param  {String}   value - path value
 * @param  {Boolean=} isdir - is directory
 * @return {String} normalize path
 */
exports.normalize = function(value, isdir) {
    if (!value){
        return value;
    }
    // format path
    let format = (val='') => {
        val = val.replace(/[\\/]+/g,'/');
        if (isdir&&!/\/$/.test(val)){
            val += '/';
        }
        return val;
    };
    // for url
    // e.g. http://a.b.com/x/y
    if (value.indexOf('://')>=0){
        let arr = value.split('://');
        arr[1] = format(arr[1]);
        return arr.join('://');
    }
    // e.g. //a.b.com/a/b
    if (/^\/\//.test(value)){
        return '/'+format(value);
    }
    // for directory or file path
    return format(value);
};

/**
 * resolves a sequence of paths or path segments into an absolute path
 *
 * @return {String} absolute path
 */
exports.absolute = function (...last) {
    let ret = path.resolve(...arguments);
    return exports.normalize(
        ret, /[/\\]$/.test(last||'')
    );
};

/**
 * create directory recursion
 *
 * @param {String} dir - directory path
 */
exports.mkdir = function (dir) {
    if (fs.existsSync(dir)){
        return;
    }
    this.mkdir(
        path.dirname(dir)
    );
    fs.mkdirSync(dir);
};

/**
 * list file under directory recursive
 *
 * @param  {String} dir - directory
 * @param  {Function=} filter - file filter action
 * @return {Array} file list
 */
exports.ls = function (dir, filter) {
    // format filter function
    let isOK = filter;
    if (typeof isOK!=='function'){
        isOK = () => {
            return true;
        };
    }
    // try to dump files
    let list;
    let ret = [];
    // check file list
    try{
        list = fs.readdirSync(dir);
    }catch(ex){
        // ignore
    }
    if (!list||!list.length){
        return ret;
    }
    // dump file list
    list.forEach((name) => {
        let file = exports.absolute(
            dir, name
        );
        // for single file
        if (fs.statSync(file).isFile()){
            if (isOK(name, file)){
                ret.push(file);
            }
            return;
        }
        // for directory
        let arr = exports.ls(file, isOK);
        ret.push(...arr);
    });
    // return file list
    return ret;
};

/**
 * eval script code
 *
 * @param  {String} code   - script code
 * @param  {Object=} global - global context
 * @return {Object} sandbox
 */
exports.eval = function (code, global) {
    let sandbox = global||{};
    try{
        vm.runInNewContext(code, sandbox);
    }catch (e) {
        // ignore script error
    }
    return sandbox;
};
