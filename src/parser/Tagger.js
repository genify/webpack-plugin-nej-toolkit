/*
 * HTML Tag Parser
 *
 * @author caijf(genify@163.com)
 */
const _util     = require('../util/util.js');
const Emitter   = require('../util/emitter.js');
const Tokenizer = require('./Tokenizer.js');

// private name
const last              = Symbol('last');
const props             = Symbol('props');
const status            = Symbol('status');
const parser            = Symbol('parser');
const string            = Symbol('string');
const onTag             = Symbol('onTag');
const onText            = Symbol('onText');
const onComment         = Symbol('onComment');
const updateState       = Symbol('updateState');
const begTextState      = Symbol('begTextState');
const endTextState      = Symbol('endTextState');
const begResState       = Symbol('begResState');
const endResState       = Symbol('endResState');
const parseInstruction  = Symbol('parseInstruction');
const isInResourceState = Symbol('isInResourceState');

// parser state
const STATE = {
    TEXT     : 1,
    STYLE    : 2,
    SCRIPT   : 3,
    TEXTAREA : 4,
    NOTMATCH : 100
};

// state transform handler
const TRANSFORM = {
    style:function(options){
        // begin style
        let attrs = options.attrs||{};
        if (this[status]===STATE.TEXT&&attrs.disabled==null){
            return STATE.STYLE;
        }
        // end style
        if (this[status]===STATE.STYLE&&
            !!options.closed&&!options.selfClosed){
            return 'style';
        }
    },
    script:function(options){
        // begin script
        if (this[status]===STATE.TEXT){
            return STATE.SCRIPT;
        }
        // end script
        if (this[status]===STATE.SCRIPT&&
            !!options.closed&&!options.selfClosed){
            return 'script';
        }
    },
    textarea:function(options){
        // begin textarea
        if (this[status]===STATE.TEXT){
            return STATE.TEXTAREA;
        }
        // end textarea
        if (this[status]===STATE.TEXTAREA&&
            !!options.closed&&!options.selfClosed){
            return 'textarea';
        }
    },
    link:function(options){
        let attrs = options.attrs||{};
        // external style link
        if (this[status]===STATE.TEXT&&
            !!attrs.href&&attrs.disabled==null){
            // begin style
            this[endTextState]();
            this[begResState](STATE.STYLE,options);
            // end style
            this[endResState]('style','',options);
            this[begTextState]();
            return STATE.NOTMATCH;
        }
    }
};

/**
 * HTML Tag Parser
 *
 * input config
 * - content          html file content
 * supported events
 * - onstyle          style resource parse end event, {config:{},buffer:[],source:''}
 * - onscript         script resource parse end event, {config:{},buffer:[],source:''}
 * - ontextarea       textarea resource parse end event, {config:{},buffer:[],source:''}
 * - oninstruction    nej deploy instruction parse end event, {command:'STYLE',config:{core:false},closed:false}
 * - ontag            tag parse end event, {tag:{},buffer:[]}
 * - ontext           text parse end event, {source:'',buffer:[]}
 * - oncomment        comment parse end event, {source:'',buffer:[]}
 */
class Tagger extends Emitter {
    /**
     * HTML Tag Parser
     *
     * @param {Object} options - config object
     * @param {String} options.content - html file content
     */
    constructor(options={}) {
        super(options);

        // init private status
        this[last]   = null;
        this[props]  = null;
        this[status] = STATE.TEXT;
        this[string] = [];
        this.result  = [];

        // tokenizer html content
        this[parser] = new Tokenizer({
            content : options.content||'',
            tag     : this[onTag].bind(this),
            text    : this[onText].bind(this),
            comment : this[onComment].bind(this)
        });
    }

    /**
     * serialize tag source
     *
     * @param  {Object} tag - tag config object
     * @return {String} tag source
     */
    static stringify(tag) {
        // illegal tag object
        if (!tag.name){
            return '';
        }
        let ret = ['<'];
        // close tag
        if (tag.closed){
            ret.push('/');
        }
        ret.push(tag.name);
        // merge properties
        if (!tag.closed){
            let arr = [];
            let attrs = tag.attrs||{};
            Object.keys(attrs).forEach((key) => {
                let v = attrs[key];
                if (!!v){
                    v = '="'+v+'"';
                }
                arr.push(key+v);
            });
            if (arr.length>0){
                ret.push(' ',arr.join(' '));
            }
            if (tag.selfClosed){
                ret.push('/');
            }
        }
        ret.push('>');
        return ret.join('');
    }

    /**
     * check resource state
     *
     * @return {Boolean} whether resource state
     */
    [isInResourceState]() {
        return this[status]===STATE.STYLE||
               this[status]===STATE.SCRIPT||
               this[status]===STATE.TEXTAREA;
    };

    /**
     * update state
     *
     * @param  {Number} state - state value
     */
    [updateState](state) {
        this[last]   = this[status];
        this[status] = state;
    };
    
    /**
     * begin text state
     */
    [begTextState]() {
        this[string] = [];
        this[updateState](STATE.TEXT);
    };

    /**
     * end text state
     */
    [endTextState]() {
        let text = this[string].join('');
        if (!!text){
            this.emit('text',{
                source: text,
                buffer: this.result
            });
        }
    };

    /**
     * begin resource state
     *
     * @param  {Number} state   - state value
     * @param  {Object} options - config options
     */
    [begResState](state,options) {
        this[props]  = options.attrs;
        this[string] = [options.source];
        this[updateState](state);
    };

    /**
     * end resource state
     *
     * @param  {String} name   - resource name
     * @param  {String} source - resource text
     * @param  {Object} tag    - tag result object
     */
    [endResState](name,source,tag) {
        let beg = this[string].shift(),
            end = source||'';
        let event = {
            tag: tag,
            config: this[props],
            buffer: this.result,
            source: this[string].join('')
        };
        this.emit(name,event);
        // event.value will be pushed to buffer (for placeholder)
        // if not event.value the origin style will be pushed to buffer
        if (event.value!=null){
            this.result.push(event.value);
        }else{
            this.result.push(beg,event.source,end);
        }
    };

    /**
     * parse nej deploy instruction
     *
     * @param  {String} comment - comment content
     * @return {Object} instruction config object
     */
    [parseInstruction](comment) {
        comment = (comment||'').trim();
        // begin instruction
        if (comment.indexOf('@')===0){
            let ret = {closed:!1};
            // @ABC {a:'',b:''}
            let index = comment.search(/[\s{]/);
            if (index>0){
                ret.command = comment.substr(1,index-1).toUpperCase();
                ret.config = _util.eval('result = '+comment.substr(index)).result;
            }else{
                ret.command = comment.substr(1).toUpperCase();
            }
            return ret;
        }
        // end instruction
        if (comment.indexOf('/@')===0){
            return {
                closed:!0,
                command:comment.substr(2).toUpperCase()
            };
        }
    }

    /**
     * on tag event from tokenizer
     *
     * @param  {Object} options - tag config
     */
    [onTag](options) {
        // script/style/textarea
        let tname = options.name.toLowerCase(),
            pfunc = TRANSFORM[tname];
        if (!!pfunc){
            let ret = pfunc.call(this,options);
            // ignore cache
            if (ret===STATE.NOTMATCH){
                return;
            }
            // end state
            if (typeof ret==='string'){
                this[endResState](
                    ret,options.source,options
                );
                this[begTextState]();
                return;
            }
            // begin state
            if (typeof ret==='number'){
                this[endTextState]();
                this[begResState](ret,options);
                return;
            }
        }else{
            let event = {
                tag: options,
                buffer: this.result
            };
            this.emit('tag',event);
            if (event.value!=null){
                this.result.push(event.value);
                return;
            }
        }
        // save source
        this[onText](options);
    };

    /**
     * text event from tokenizer
     *
     * @param  {Object} options - text config
     */
    [onText](options) {
        let event = {
            source: options.source,
            buffer: this.result
        };
        // save source
        if (this[isInResourceState]()){
            this.emit('restxt',event);
            if (event.value!=null){
                this[string].push(options.value);
            }else{
                this[string].push(options.source);
            }
        }else{
            // text content
            if (!options.name){
                this.emit('text',event);
                if (event.value!=null){
                    this.result.push(event.value);
                    return;
                }
            }
            this.result.push(options.source);
        }
    };
    
    /**
     * comment event form tokenizer
     * 
     * @param  {Object} options - comment config
     */
    [onComment](options) {
        let ret = this[parseInstruction](options.comment);
        if (!!ret){
            ret.buffer = this.result;
            ret.source = options.source;
            this.emit('instruction',ret);
        }else{
            let event = {
                buffer: this.result,
                source: options.source
            };
            this.emit('comment',event);
            if (event.value!=null){
                this.result.push(event.value);
            }else{
                this.result.push(event.source);
            }
        }
    };
}

// export tag parser
module.exports = Tagger;