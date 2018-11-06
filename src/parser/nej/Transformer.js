/*
 * HTML Parser and NEJ Config Transformer
 *
 * @author caijf(genify@163.com)
 */
const path       = require('path');
const nt         = require('../node/const.js');
const cfg        = require('../config/const.js');
const util       = require('../../util/util.js');
const nej        = require('../../util/nej.js');
const Emitter    = require('../../util/emitter.js');

// private name
const status     = Symbol('status');
const parser     = Symbol('parser');
const config     = Symbol('config');
const defau1t    = Symbol('default');
const resource   = Symbol('resource');
const transform  = Symbol('transform');
const getAbsURI  = Symbol('getAbsURI');

// deploy tag state
const STATE = {
    NULL    : Symbol('null'),
    MERGE   : Symbol('merge'),
    MODULE  : Symbol('module'),
    IGNORE  : Symbol('ignore'),
    NOPARSE : Symbol('noparse'),
    VERSION : Symbol('version')
};

// transform instruction
const INSTRUCTION = {
    // opt - {type:'styles',index:10,config:{},entry:true}
    [resource]: function (opt) {
        let last;
        // only one entry for resource
        if (opt.entry){
            last = this[parser][opt.type].find((it) => {
                return !!it.entry;
            });
        }
        if (last){
            // update position to style tag
            last.position = opt.index;
        }else{
            // add style insert pointer
            let conf = opt.config||{};
            last = {
                position: index,
                entry: opt.entry,
                core: conf.core,
                name: conf.name,
                list: []
            }
            this[parser][opt.type].push(last);
        }
        return last;
    },
    // for <!-- @style -->
    STYLE: function (node={}, index) {
        return INSTRUCTION[resource].call(this,{
            type: 'styles',
            index: index,
            entry: true,
            config: node.config
        });
    },
    // for <!-- @script -->
    SCRIPT: function (node={}, index) {
        return INSTRUCTION[resource].call(this,{
            type: 'scripts',
            index: index,
            entry: true,
            config: node.config
        });
    },
    // for <!-- @template -->
    TEMPLATE: function (node={}, index) {
        return INSTRUCTION[resource].call(this,{
            type: 'templates',
            index: index,
            config: node.config
        });
    },
    // for <!-- @umi -->
    UMI: function (node, index) {
        this[status] = STATE.VERSION;
        this[parser].umiConfig = {
            position: index,
            umi: node.config.umi,
            root: node.config.root
        };
        // TODO umi config parse
    },
    // for <!-- @module -->  <!-- /@module -->
    MODULE: {
        beg: function () {
            
        },
        end: function () {
            
        }
    },
    // for <!-- @noparse -->  <!-- /@noparse -->
    NOPARSE: {
        beg: function () {
            this[status] = STATE.NOPARSE;
        },
        end: function () {
            this[status] = STATE.NULL;
        }
    },
    // for <!-- @ignore -->  <!-- /@ignore -->
    IGNORE: {
        beg: function (node) {
            let mode = node.config.mode||'online';
            let test = this[config].get('X_RELEASE_MODE');
            if (nej.isModeOf(mode, test)){
                this[status] = STATE.IGNORE;
            }
        },
        end: function () {
            this[status] = STATE.NULL;
        }
    },
    // for <!-- @merge -->  <!-- /@merge -->
    MERGE: {
        beg: function () {
            
        },
        end: function () {
            this[status] = STATE.NULL;
        }
    }
};
INSTRUCTION.DEFINE  = INSTRUCTION.SCRIPT;
INSTRUCTION.VERSION = INSTRUCTION.UMI;

/**
 * HTML Parser and NEJ Config Transformer
 */
class Transformer extends Emitter {
    /**
     * HTML Parser and NEJ Config Transformer
     *
     * @param {Object} options - config object
     * @param {HTMLParser} options.parser - html parser
     * @param {CFGParser}  options.config - nej config parser
     */
    constructor(options={}) {
        super(options);

        this[parser] = options.parser;
        this[config] = options.config;

        this[parser].styles    = [];    // style list
        this[parser].scripts   = [];    // script list
        this[parser].modules   = {};    // module list
        this[parser].templates = [];    // template list
        this[parser].resources = [];    // static resource node list

        this[transform]();
    }

    /**
     * get absolute uri for resource
     *
     * @param  {String} uri - resource uri
     * @return {String} absolute uri
     */
    [getAbsURI](uri) {
        // for relative protocol path
        // //a.b.com/x/y
        if (!uri||uri.indexOf('//')===0){
            return uri||'';
        }
        // complete alias in path
        let reg = this[config].aliasMatch;
        let dict = this[config].aliasDictionary;
        uri = uri.replace(reg, ($1,$2) => {
            return dict[$2]||$1;
        });
        // absolute resource path
        let root = path.dirname(
            this[parser].file
        );
        // relative to root
        if (uri.indexOf('/')===0){
            root = this[config].dirWebRoot;
        }
        // relative to html/template file
        return util.absolute(root, uri);
    }

    /**
     * process resource
     *
     * @param  {Node}     node - current resource node
     * @param  {Object}   opt - config object
     * @param  {String}   opt.type  - resource type, e.g. styles/scripts
     * @param  {String}   opt.instr - resource instruction, e.g. STYLE/SCRIPT
     * @param  {Number}   opt.index - resource node index
     * @param  {Function} opt.notparse - noparse check result
     */
    [resource](node, opt={}) {
        // for noparse deploy tag
        if (this[status]===STATE.NOPARSE){
            this[parser].resources.push(node);
            return;
        }
        let uri = this[getAbsURI](node.uri);
        // insert style to pointer
        let insertToPointer = (res) => {
            buffer[index] = null;
            let list = this[parser][opt.type];
            let last = list[list.length-1];
            if (!last){
                last = INSTRUCTION[opt.instr].call(
                    this, null, opt.index
                );
            }
            last.list.push(res);
        };
        // for inline style
        let internal = () => {
            let flag = this[config].coreNoparseFlag;
            // not parse inline style
            if (opt.notparse(flag)){
                this[parser].resources.push(node);
                return;
            }
            // parse inline style
            insertToPointer({
                text: node.source
            });
        };
        // for external style
        let external = () => {
            insertToPointer({
                uri: uri
            });
        };
        // process style
        !uri ? internal() : external();
    }

    /**
     * transform for style
     *
     * @param  {Node}   node   - node object
     * @param  {Number} index  - node index in buffer
     * @param  {Array}  buffer - html result buffer
     */
    [nt.STYLE](node, index, buffer) {
        this[resource](node, {
            type: 'styles',
            instr: 'STYLE',
            index: index,
            notparse: (flag) => {
                return flag===cfg.CORE_NOPARSE_FLAG_STYLE||
                       flag===cfg.CORE_NOPARSE_FLAG_ALL;
            }
        });
    }

    /**
     * transform for script
     *
     * @param  {Node}   node   - node object
     * @param  {Number} index  - node index in buffer
     * @param  {Array}  buffer - html result buffer
     */
    [nt.SCRIPT](node, index, buffer) {
        // check umi root config
        if (this[status]===STATE.VERSION&&node.source){
            this[status] = STATE.NULL;
            let sbox = util.eval(node.source,{location:{config:{}}});
            let root = sbox.location.config.root;
            if (root){
                this[parser].umiConfig.root = root;
                buffer[index] = null;
                return;
            }
        }
        // for nej define.js
        let uri = this[getAbsURI](node.uri);
        if (nej.isNEJDefine(uri)){
            let root = this[config].dirWebRoot;
            let ret = nej.parseNEJDefURI(uri, root);
            Object.keys(ret.params).forEach((key) => {
                let it = ret.params[key];
                // absolute for path parameter
                // ../a/b or ./a/b or /a/b or a/b/
                if (/^[\.\/]/.test(it)||it.indexOf('/')>0){
                    ret.params[key] = this[getAbsURI](it);
                }
            });
            this[config].update(ret);
            return;
        }
        // for common script resource
        this[resource](node, {
            type: 'scripts',
            instr: 'SCRIPT',
            index: index,
            notparse: (flag) => {
                return (flag===cfg.CORE_NOPARSE_FLAG_SCRIPT||
                        flag===cfg.CORE_NOPARSE_FLAG_ALL)&&
                        !nej.isNEJScript(node.source);
            }
        });
    }

    /**
     * transform for nej template
     *
     * @param  {Node}   node   - node object
     * @param  {Number} index  - node index in buffer
     * @param  {Array}  buffer - html result buffer
     */
    [nt.TEMPLATE](node, index, buffer) {

    }

    /**
     * transform for instruction
     *
     * @param  {Node}   node   - node object
     * @param  {Number} index  - node index in buffer
     * @param  {Array}  buffer - html result buffer
     */
    [nt.INSTRUCTION](node, index, buffer) {
        // clear instruction node
        buffer[index] = null;
        // process instruction
        let func = INSTRUCTION[node.command];
        if (typeof func==='function'){
            // only support start instruction
            if (!node.closed){
                func.apply(this, arguments);
            }
        }else if(func){
            // for start instruction
            if (!node.closed&&typeof func.beg==='function'){
                func.beg.apply(this, arguments);
            }
            // for close instruction
            if (node.closed&&typeof func.end==='function'){
                func.end.apply(this, arguments);
            }
        }
    }

    /**
     * transform for other node
     *
     * @param  {Node}   node   - node object
     * @param  {Number} index  - node index in buffer
     * @param  {Array}  buffer - html result buffer
     */
    [defau1t](node, index, buffer) {

    }

    /**
     * transform html parse result with nej config
     */
    [transform]() {
        this[status] = STATE.NULL;
        this[parser].result.forEach((node, index, list) => {
            // for ignore block
            if (this[status]===STATE.IGNORE){
                list[index] = null;
                return;
            }
            // for common block
            let func = this[node.nodeType];
            if (typeof func==='function'){
                func.apply(this, arguments);
            }else{
                this[defau1t].apply(this, arguments);
            }
        });
    }

}

// export Converter
module.exports = Transformer;