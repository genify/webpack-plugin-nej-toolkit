/*
 * HTML Parser
 *
 * @author caijf(genify@163.com)
 */
const Tagger  = require('./Tagger.js');
const Emitter = require('../util/emitter.js');

// node type
const NODE_TAG         = Symbol('tag');
const NODE_TEXT        = Symbol('text');
const NODE_STYLE       = Symbol('style');
const NODE_SCRIPT      = Symbol('script');
const NODE_COMMENT     = Symbol('comment');
const NODE_TEMPLATE    = Symbol('template');
const NODE_RESOURCE    = Symbol('resource');
const NODE_INSTRUCTION = Symbol('instruction');

// private name
const file          = Symbol('file');
const parser        = Symbol('parser');
const format        = Symbol('format');
const onInstruction = Symbol('onInstruction');
const onResource    = Symbol('onResource');
const onTextarea    = Symbol('onTextarea');
const onComment     = Symbol('onComment');
const onScript      = Symbol('onScript');
const onStyle       = Symbol('onStyle');
const onText        = Symbol('onText');
const onTag         = Symbol('onTag');

/**
 * HTML Parser
 *
 * input config
 * - file       html file path
 * - content    html file content
 * supported properties
 * - result     content result after parse
 */
class HTMLParser extends Emitter{
    /**
     * node type of tag
     *
     * @type {symbol}
     */
    static get NODE_TAG() {
        return NODE_TAG;
    }

    /**
     * node type of text
     *
     * @type {symbol}
     */
    static get NODE_TEXT() {
        return NODE_TEXT;
    }
    /**
     * node type of style
     *
     * @type {symbol}
     */
    static get NODE_STYLE() {
        return NODE_STYLE;
    }
    /**
     * node type of script
     *
     * @type {symbol}
     */
    static get NODE_SCRIPT() {
        return NODE_SCRIPT;
    }
    /**
     * node type of template
     *
     * @type {symbol}
     */
    static get NODE_TEMPLATE() {
        return NODE_TEMPLATE;
    }
    /**
     * node type of resource
     *
     * @type {symbol}
     */
    static get NODE_RESOURCE() {
        return NODE_RESOURCE;
    }
    /**
     * node type of instruction
     *
     * @type {symbol}
     */
    static get NODE_INSTRUCTION() {
        return NODE_INSTRUCTION;
    }
    /**
     * node type of comment
     *
     * @type {symbol}
     */
    static get NODE_COMMENT() {
        return NODE_COMMENT;
    }

    /**
     * HTML Parser
     *
     * @param {Object} options - config object
     * @param {String} options.file    - html file path
     * @param {String} options.content - html content
     */
    constructor(options={}) {
        super(options);
        // private properties
        this[file]   = options.file;
        this.result  = [];
        // parse content
        this[parser] = new Tagger({
            content     : options.content||'',
            tag         : this[onTag].bind(this),
            text        : this[onText].bind(this),
            style       : this[onStyle].bind(this),
            script      : this[onScript].bind(this),
            textarea    : this[onTextarea].bind(this),
            comment     : this[onComment].bind(this),
            instruction : this[onInstruction].bind(this)
        });
    }

    /**
     * format nej template type
     *
     * @param  {String} type - original type
     * @return {String} type after format
     */
    [format](type='') {
        type = type.replace('nej/','');
        if (/^(css|cs|style)$/i.test(type)){
            return 'css';
        }
        if (/^(js|javascript|script)$/i.test(type)){
            return 'js';
        }
        return type;
    }

    /**
     * resource event for tag parse
     *
     * @param  {Object} event - event object
     */
    [onResource](event) {
        // console.log('%s:%s','resource',type);
        let ret = {
            node: HTMLParser.NODE_RESOURCE,
            beg: event.beg
        };
        // not self close tag resource
        if (event.beg!==event.end){
            ret.end = event.end;
            ret.text = event.source;
        }
        this.result.push(ret);
    }

    /**
     * style event from tag parse
     *
     * for style
     * <link rel="stylesheet" type="text/css" href="./a.css"/>
     * <style>.a{color:#aaa;}</style>
     * <style type="text/css">.a{color:#aaa;}</style>
     *
     * for nej template
     * <link rel="nej" type="nej/css" href="./a.css"/>
     * <link rel="nej" type="nej/html" href="./a.html"/>
     * <link rel="nej" type="nej/javascript" href="./a.js"/>
     * <style type="nej/css">.a{color:#aaa;}</style>
     *
     * @param  {Object} event - event object
     */
    [onStyle](event) {
        // console.log('%s:%j','style',event);
        let conf = event.config||{};
        let type = (conf.type||'').toLowerCase().trim();
        // check external style
        // check nej external template
        let external = () => {
            let ret = {};
            let rel = (conf.rel||'').toLowerCase().trim();
            if (rel.indexOf('stylesheet')>=0){
                ret.node = HTMLParser.NODE_STYLE;
            }else if(rel==='nej'){
                ret.node = HTMLParser.NODE_TEMPLATE;
                ret.type = this[format](type);
            }
            if (ret.node){
                ret.uri = conf.href;
                return ret;
            }
        };
        // check inline style
        // check nej inline style template
        let internal = () => {
            let ret = {};
            if (!type||type==='text/css'){
                ret.node = HTMLParser.NODE_STYLE;
            }
            // check nej inline style template
            if (type.indexOf('nej/')===0){
                ret.node = HTMLParser.NODE_TEMPLATE;
                ret.type = this[format](type);
                ret.id = conf.id;
            }
            if (ret.node){
                ret.text = event.source;
                return ret;
            }
        };
        // run resource transform
        let ret = !conf.href ? internal() : external();
        if (ret){
            this.result.push(ret);
        }else{
            this[onResource](event);
        }
    };
    
    /**
     * script event from tag parser
     *
     * for script
     * <script src="./a.js"></script>
     * <script>var a = "aaa";</script>
     * <script type="text/javascript">var a = "aaa";</script>
     *
     * for nej template
     * <script type="nej/css">.a{color:#aaa;}</script>
     * <script type="nej/html"><div>xxxx</div></script>
     * <script type="nej/javascript">var a = "aaaa";</script>
     *
     * @param  {Object} event - event object
     */
    [onScript](event) {
        // console.log('%s:%j','script',event);
        let ret;
        let conf = event.config||{};
        let type = (conf.type||'').toLowerCase().trim();
        // for nej template
        if (type.indexOf('nej/')===0){
            ret = {
                node: HTMLParser.NODE_TEMPLATE,
                type: this[format](type),
                text: event.source,
                uri: conf.src,
                id: conf.id
            };
        }
        // for script
        if (!type||/(text|application)\/(x-)?javascript/i.test(type)){
            ret = {
                node: HTMLParser.NODE_SCRIPT,
                text: event.source,
                uri: conf.src
            };
        }
        // save resource
        if (ret){
            this.result.push(ret);
        }else{
            this[onResource](event);
        }
    }
    
    /**
     * textarea event from tag parser
     * 
     * for textarea
     * <textarea name="txt" id="xxx">xxxx</textarea>
     * <textarea name="jst" id="xxx">xxxx</textarea>
     * <textarea name="ntp" id="xxx">xxxx</textarea>
     * <textarea name="js" data-src="yyy">xxxx</textarea>
     * <textarea name="css" data-src="yyy">xxxx</textarea>
     * <textarea name="html" data-src="yyy">xxxx</textarea>
     *
     * <textarea name="nej/txt" id="xxx">xxxx</textarea>
     * <textarea name="nej/jst" id="xxx">xxxx</textarea>
     * <textarea name="nej/ntp" id="xxx">xxxx</textarea>
     * <textarea name="nej/js" data-src="yyy">xxxx</textarea>
     * <textarea name="nej/css" data-src="yyy">xxxx</textarea>
     * <textarea name="nej/html" data-src="yyy">xxxx</textarea>
     *
     * @param  {Object} event - event object
     */
    [onTextarea](event) {
        // console.log('%s:%j','textarea',event);
        let cnf = event.config||{};
        let ret = {
            node: HTMLParser.NODE_TEMPLATE,
            type: cnf.name||''
        };
        // for nej template
        if (ret.type.indexOf('nej/')===0||
            /txt|jst|ntp|js|css|html/i.test(ret.type)){
            ret.type = this[format](ret.type);
            ret.id   = cnf.id;
            ret.uri  = cnf['data-src'];
            ret.text = event.source;
            this.result.push(ret);
        }else{
            this[onResource](event);
        }
    };

    /**
     * instruction event from tag parser
     *
     * for nej deploy instruction
     * <!-- @STYLE {core:true,inline:true} -->
     * <!-- @SCRIPT {nodep:true,core:true,inline:true} -->
     * <!-- @VERSION -->
     * <!-- @MANIFEST -->
     * <!-- @TEMPLATE -->
     * <!-- @MODULE -->     <!-- /@MODULE -->
     * <!-- @NOPARSE -->    <!-- /@NOPARSE -->
     * <!-- @NOCOMPRESS --> <!-- /@NOCOMPRESS -->
     * <!-- @IGNORE {mode:'online|test|develop'} --> <!-- /@IGNORE -->
     *
     * @param  {Object} event - event object
     */
    [onInstruction](event) {
        // console.log('%s:%j','instr',event);
        event.node = HTMLParser.NODE_INSTRUCTION;
        this.result.push(event);
    };

    /**
     * comment event from tag parser
     *
     * @param  {Object} event - event object
     */
    [onComment](event) {
        // console.log('%s:%j','comment',event);
        this.result.push({
            node: HTMLParser.NODE_COMMENT,
            text: event.source
        });
    };

    /**
     * tag event from tag parser
     *
     * @param  {Object} event - event object
     */
    [onTag](event) {
        // console.log('%s:%j','tag',event);
        event.tag.node = HTMLParser.NODE_TAG;
        this.result.push(event.tag);
    };

    /**
     * text event from tag parser
     *
     * @param  {Object} event - event object
     */
    [onText](event) {
        // console.log('%s:%j','text',event);
        this.result.push({
            node: HTMLParser.NODE_TEXT,
            text: event.source
        });
    };

}

// export html parser
module.exports = HTMLParser;