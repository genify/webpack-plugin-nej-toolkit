/*
 * NEJ Root Parser
 *
 * @author caijf(genify@163.com)
 */
const fs         = require('fs');
const util       = require('util');
const _util      = require('../util/util.js');
const Emitter    = require('../util/emitter.js');
const HTMLParser = require('./HTML.js');
const CFGParser  = require('./Config.js');

// private name
const config = Symbol('config');
const parse  = Symbol('parse');

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
        // parse entry
        if (this[config]){
            // dump static html files
            let sopt = this[config].format({
                dir: 'DIR_SOURCE',
                sub: 'DIR_SOURCE_SUB'
            });
            let ret1 = this[parse](sopt);
            // dump server template files
            let topt = this[config].format({
                dir: 'DIR_SOURCE_TP',
                sub: 'DIR_SOURCE_TP_SUB'
            });
            let ret2 = this[parse](topt);
            // ensure all resource loaded
            Promise.all([...ret1,...ret2]).then(() => {
                this.emit('done');
            });
        }
    }

    /**
     * parse project entry
     *
     * @param  {Object}   opt     - config object
     * @param  {String}   opt.dir - input directory
     * @param  {String[]} opt.sub - sub directory list
     * @return {Promise[]} file load promise list
     */
    [parse](opt) {
        let filter = this[config].get('FILE_FILTER');
        let exclude = this[config].get('FILE_EXCLUDE');
        // dump file list from directory
        let ret = [];
        (opt.sub||[opt.dir]).forEach((dir) => {
            // list files that match config rules
            let list = _util.ls(dir, (name, file) => {
                return !/^\./.test(name)&&
                    (!filter||filter.test(file))&&   // match path
                    (!exclude||!exclude.test(file)); // not exclude path
            });
            // parse file content
            list.forEach((it) => {
                let load = util.promisify(fs.readFile)(it,'utf-8')
                    .then((content) => {
                        this.root.push(new HTMLParser({
                            file: it,
                            content: content
                        }));
                    });
                ret.push(load);
            });
        });
        return ret;
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