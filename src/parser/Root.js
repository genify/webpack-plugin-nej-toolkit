/*
 * NEJ Root Parser
 *
 * @author caijf(genify@163.com)
 */
const fs         = require('fs');
const ut         = require('util');
const util       = require('../../util/util.js');
const Emitter    = require('../../util/emitter.js');
const CFGParser  = require('../config/Config.js');
const HTMLParser = require('../HTML.js');

// private name
const config        = Symbol('config');
const procSource    = Symbol('procSource');
const loadSource    = Symbol('loadSource');
const loadAllSource = Symbol('loadAllSource');

/**
 * NEJ Root Parser
 */
class NEJRoot extends Emitter {
    /**
     * NEJ Root Parser
     *
     * @param options - config object
     * @param options.config - nej config instance
     */
    constructor(options={}) {
        super(options);
        this.root = [];
        // check config parser instance
        this[config] = options.config;
        if (!(this[config] instanceof CFGParser)){
            this[config] = null;
            this.emit('error',{
                message: 'nej config instance illegal'
            });
        }
        // load entry source
        if (this[config]){
            this[loadAllSource]();
        }
    }

    /**
     * load all entry files
     */
    [loadAllSource]() {
        let ret = [];
        let test = {};
        // dump static html files
        let sopt = this[config].format({
            flag: false,
            dir: 'DIR_SOURCE',
            sub: 'DIR_SOURCE_SUB'
        });
        ret.push(...this[loadSource](sopt,test));
        // dump server template files
        let topt = this[config].format({
            flag: true,
            dir: 'DIR_SOURCE_TP',
            sub: 'DIR_SOURCE_TP_SUB'
        });
        ret.push(...this[loadSource](topt,test));
        // ensure all resource loaded
        Promise.all(ret).then(() => {
            this.emit('done');
        });
    }

    /**
     * load project entry files
     *
     * @param  {Object}   opt      - config object
     * @param  {String}   opt.dir  - input directory
     * @param  {String[]} opt.sub  - sub directory list
     * @param  {Boolean}  opt.flag - server template flag
     * @param  {Object}   test     - file load test
     * @return {Promise[]} file load promise list
     */
    [loadSource](opt, test) {
        let filter = this[config].get('FILE_FILTER');
        let exclude = this[config].get('FILE_EXCLUDE');
        // dump file list from directory
        let ret = [];
        (opt.sub||[opt.dir]).forEach((dir) => {
            // list files that match config rules
            let list = util.ls(dir, (name, file) => {
                return !/^\./.test(name)&&
                    (!filter||filter.test(file))&&   // match path
                    (!exclude||!exclude.test(file)); // not exclude path
            });
            // parse file content
            list.forEach((it) => {
                // lock file load
                if (test[it]){
                    return;
                }
                test[it] = true;
                // load file
                ret.push(
                    ut.promisify(fs.readFile)(it,'utf-8').then(
                        (content) => {
                            this[procSource](it, content, opt.flag);
                        }
                    )
                );
            });
        });
        return ret;
    }

    /**
     * process resource content
     *
     * @param  {String}  file    - file path
     * @param  {String}  content - resource content
     * @param  {Boolean} flag    - is template flag
     */
    [procSource](file, content, flag) {
        let parser = new HTMLParser({
            file: file,
            flag: flag,
            content: content
        });
        this.root.push(parser);

    }

    /**
     * get webpack entry list
     *
     * @return {Object} webpack entry
     */
    getWebPackEntry() {
        let ret = {};
        // TODO
        return ret;
    }
}

// export nej root
module.exports = NEJRoot;