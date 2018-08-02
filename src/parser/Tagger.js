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
const onResource        = Symbol('onResource');
const updateState       = Symbol('updateState');
const begTextState      = Symbol('begTextState');
const endTextState      = Symbol('endTextState');
const begResState       = Symbol('begResState');
const endResState       = Symbol('endResState');
const parseInstruction  = Symbol('parseInstruction');

// parser state
const STATE = {
    TEXT     : Symbol('text'),
    STYLE    : Symbol('style'),
    SCRIPT   : Symbol('script'),
    TEXTAREA : Symbol('textarea'),
    NOTMATCH : Symbol('notmatch')
};

// state transform handler
const TRANSFORM = {
    style:{
        beg: function(options){
            let attrs = options.attrs||{};
            if (this[status]===STATE.TEXT&&attrs.disabled==null){
                return STATE.STYLE;
            }
        },
        end: function (options) {
            return this[status]===STATE.STYLE&&
                !!options.closed&&!options.selfClosed;
        }
    },
    script:{
        beg: function(){
            if (this[status]===STATE.TEXT){
                return STATE.SCRIPT;
            }
        },
        end: function (options) {
            return this[status]===STATE.SCRIPT&&
                !!options.closed&&!options.selfClosed;
        }
    },
    textarea:{
        beg: function(){
            if (this[status]===STATE.TEXT){
                return STATE.TEXTAREA;
            }
        },
        end: function (options) {
            return this[status]===STATE.TEXTAREA&&
                !!options.closed&&!options.selfClosed;
        }
    },
    link:{
        beg: function(options){
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
    }
};

/**
 * HTML Tag Parser
 *
 * input config
 * - content          html file content
 * supported properties
 * - result           html content line after tag parsing
 * supported events
 * - onstyle          style resource parse end event, {config:{},source:''}
 * - onscript         script resource parse end event, {config:{},source:''}
 * - ontextarea       textarea resource parse end event, {config:{},source:''}
 * - oninstruction    nej deploy instruction parse end event, {command:'STYLE',config:{core:false},closed:false}
 * - ontag            tag parse end event, {tag:{}}
 * - ontext           text parse end event, {source:''}
 * - oncomment        comment parse end event, {source:''}
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
            tag     : this[onResource].bind(this,onTag),
            text    : this[onResource].bind(this,onText),
            comment : this[onResource].bind(this,onComment)
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
                source: text
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
        this[props]  = options;
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
            end: tag,
            beg: this[props],
            config: this[props].attrs,
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
     * check resource content
     *
     * @param  {String} name - resource callback name
     * @param  {Object} options - resource result
     */
    [onResource](name, options) {
        // check resource end tag
        if (name===onTag){
            let type = options.name.toLowerCase();
            let func = (TRANSFORM[type]||{}).end;
            if (func&&func.call(this, options)){
                this[name].call(this, options);
                return;
            }
        }
        // check content in resource
        let isInRes =
            this[status]===STATE.STYLE||
            this[status]===STATE.SCRIPT||
            this[status]===STATE.TEXTAREA;
        // save resource source
        if (isInRes){
            this[string].push(options.source);
        }else{
            this[name].call(this, options);
        }
    }

    /**
     * on tag event from tokenizer
     *
     * @param  {Object} options - tag config
     */
    [onTag](options) {
        // script/style/textarea
        let type = options.name.toLowerCase();
        let conf = TRANSFORM[type];
        if (!conf){
            // for normal tag
            let event = {
                tag: options
            };
            this.emit('tag',event);
            if (event.value!=null){
                this.result.push(event.value);
                return;
            }
        }else{
            let ret = conf.beg.call(this, options);
            // ignore cache for link style
            if (ret===STATE.NOTMATCH){
                return;
            }
            // for resource begin
            if (ret){
                this[endTextState]();
                this[begResState](ret,options);
                return;
            }
            // for resource end
            ret = conf.end.call(this, options);
            if (ret){
                this[endResState](type,options.source,options);
                this[begTextState]();
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
        // text content
        if (!options.name){
            let event = {
                source: options.source
            };
            this.emit('text',event);
            if (event.value!=null){
                this.result.push(event.value);
                return;
            }
        }
        this.result.push(options.source);
    };
    
    /**
     * comment event form tokenizer
     * 
     * @param  {Object} options - comment config
     */
    [onComment](options) {
        let ret = this[parseInstruction](options.comment);
        if (!!ret){
            ret.source = options.source;
            this.emit('instruction',ret);
        }else{
            let event = {
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