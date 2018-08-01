/*
 * HTML Content Tag Tokenizer
 *
 * @author caijf(genify@163.com)
 */
const _Emitter = require('../util/emitter.js');

// private name
const last            = Symbol('last');
const status          = Symbol('status');
const buffer          = Symbol('buffer');
const string          = Symbol('string');
const chars           = Symbol('chars');
const props           = Symbol('props');
const delimiter       = Symbol('delimiter');

const parse           = Symbol('parse');
const checkSpace      = Symbol('checkSpace');
const updateState     = Symbol('updateState');
const begTagState     = Symbol('begTagState');
const endTagName      = Symbol('endTagName');
const endTagCheck     = Symbol('endTagCheck');
const endTagState     = Symbol('endTagState');
const begTextState    = Symbol('begTextState');
const endTextState    = Symbol('endTextState');
const begNameState    = Symbol('begNameState');
const endNameState    = Symbol('endNameState');
const begValueState   = Symbol('begValueState');
const endValueState   = Symbol('endValueState');
const begStringState  = Symbol('begStringState');
const endStringState  = Symbol('endStringState');
const begEscapeState  = Symbol('begEscapeState');
const endEscapeState  = Symbol('endEscapeState');
const begCommentState = Symbol('begCommentState');
const endCommentState = Symbol('endCommentState');

// state decoration
const STATE = {
    TAG     : 1,    // <XX XX=XX />
    TEXT    : 2,
    NAME    : 3,    // attr=value
    VALUE   : 4,
    STRING  : 5,    // '' OR ""
    ESCAPE  : 6,    // \
    COMMENT : 7
};

// state transform handler
const TRANSFORM = {
    '<':function(){
        // for << or <abc<
        this[buffer].pop();
        this[endTextState]();
        // switch to tag state
        this[begTagState]();
    },
    '-':function(c,n){
        n = (n||'').toLowerCase();
        // switch to comment state
        if (this[status]===STATE.TAG&&
            this[string][0]==='!'&&
            this[string][1]==='-'&&
            n!=='[if '){
            this[begCommentState]();
            return;
        }
        return !0;
    },
    '/':function(){
        if (this[endTagCheck]()){
            this[updateState](STATE.TAG);
        }
    },
    '>':function(){
        // end comment for -->
        let l = this[string].length-1;
        if (this[status]===STATE.COMMENT&&
            this[string][l]==='-'&&this[string][l-1]==='-'){
            // pop --
            this[string].pop();
            this[string].pop();
            this[endCommentState]();
            this[begTextState]();
            return;
        }
        // for <a>
        // for <a ab>
        // for <a ab=c>
        if (this[status]===STATE.TAG||
            this[status]===STATE.NAME||
            this[status]===STATE.VALUE){
            this[endTagCheck]();
            this[endTagState]();
            this[begTextState]();
        }
    },
    '"':function(c){
        // " or ' in string, eg. '"',"'"
        if (this[status]===STATE.STRING&&this[delimiter]!==c){
            this[string].push(c);
            return;
        }
        // end string state
        if (this[status]===STATE.STRING){
            this[endStringState]();
            return;
        }
        // fix error ' or " in tag name
        if (this[status]===STATE.TAG){
            this[string].push(c);
            return;
        }
        // switch to string state
        if (this[status]===STATE.NAME||
            this[status]===STATE.VALUE){
            // fix error ' or " in name or value
            if (this[string].length>0){
                this[string].push(c);
                return;
            }
            this[begStringState](c);
        }
    },
    '\\':function(c){
        // switch to escape state
        if (this[status]===STATE.STRING){
            this[begEscapeState](c);
        }
    },
    '=':function(){
        // switch to value state
        if (this[status]===STATE.NAME){
            this[endNameState]();
            this[begValueState]();
        }
    }
};
TRANSFORM["'"] = TRANSFORM['"'];

/**
 * HTML Content Tag Tokenizer
 * split content to one or more tag/text/comment
 *
 * input config
 * - content      html file content
 * supported properties
 * - result       result list for content parsing, [{type:'tag',data:{}},{type:'text',data:''},{type:'comment',data:''}...]
 * supported events
 * - ontag        tag parse end event, {name:'xxx',attrs:{x:'xx'},closed:false,selfClosed:false,source:'<xxx x="xx">'}
 * - ontext       text parse end event, {source:'xxxxxxxx'}
 * - oncomment    comment pare end event, {comment:'xxxx',source:'<!-- xxxx -->'}
 */
class Tokenizer extends _Emitter {
    /**
     * HTML Content Tag Tokenizer
     *
     * @param  {Object} options - config object
     * @param  {String} options.content - html content
     */
    constructor(options={}) {
        super(options);
        // private attributes
        this[last]      = null;
        this[status]     = STATE.TEXT;
        this[buffer]    = [];    // source cache
        this[string]    = [];    // string cache
        this[delimiter] = null;  // string split, ' or "
        this[chars]     = null;  // not space char
        this.result     = [];
        // parse html content
        this[parse](options.content);
    }

    /**
     * parse html content
     *
     * @param  {String} content html content
     */
    [parse](content='') {
        let i=0,c,func,next,r=/[\s]/;
        let s = ['"',"'",'\\'];
        let l = [
            STATE.TAG,STATE.NAME,
            STATE.VALUE,STATE.COMMENT
        ];
        while(!!(c=content.charAt(i++))){
            // save no space char
            let spc = r.test(c);
            if (!spc){
                this[chars] = c;
            }
            //console.log(c);
            this[buffer].push(c);
            // revert escape state
            if (this[status]===STATE.ESCAPE){
                this[endEscapeState](c);
                continue;
            }
            // char in string or in comment
            if ((this[status]===STATE.STRING&&s.indexOf(c)<0)||
                (this[status]===STATE.COMMENT&&c!==">")){
                this[string].push(c);
                continue;
            }
            // check white space
            if (spc){
                this[checkSpace](c);
                continue;
            }
            // check state char
            func = TRANSFORM[c];
            if (!!func){
                // for conditional comments
                if (c==='-'){
                    next = content.substr(i,4);
                }
                if (!func.call(this,c,next)){
                    continue;
                }
            }
            // buffer string
            if (l.indexOf(this[status])>=0){
                this[string].push(c);
            }
        }
        this[endTextState]();
    }

    /**
     * check white space char
     *
     * @param  {String} c - string char
     */
    [checkSpace](c) {
        // init name state
        if (this[status]===STATE.TAG){
            this[endTagName]();
            this[begNameState]();
            return;
        }
        // end name state
        if (this[status]===STATE.NAME&&this[string].length>0){
            this[endNameState]();
            this[begNameState]();
            return;
        }
        // end value state
        // ok for empty value if last is not "="
        if (this[status]===STATE.VALUE&&(this[string].length>0||this[chars]!=='=')){
            this[endValueState]();
            this[begNameState]();
        }
    }

    /**
     * update internal state
     *
     * @param  {Number} state - state value
     */
    [updateState](state){
        this[last] = this[status];
        this[status] = state;
    };

    /**
     * begin tag state
     */
    [begTagState](){
        this[string] = [];
        this[buffer] = ['<'];
        this[props]  = {attrs:{}};
        this[updateState](STATE.TAG);
    };
    
    /**
     * end tag name state
     */
    [endTagName](){
        if (!this[props].name){
            this[props].name = this[string].join('').trim();
            this[string] = [];
        }
    };

    /**
     * check end tag state
     *
     * @return {Boolean} whether name or value state
     */
    [endTagCheck](){
        // for <abc/> or <abc>
        if (this[status]===STATE.TAG){
            this[endTagName]();
            return !1;
        }
        // for <abc x/> or <abc x>
        if (this[status]===STATE.NAME){
            this[endNameState]();
            return !0;
        }
        // for <abc x=ab/> or <abc x=ab>
        if (this[status]===STATE.VALUE){
            this[endValueState]();
            return !0;
        }
    };

    /**
     * end tag state
     */
    [endTagState](){
        delete this[props].attr;
        this[props].source = this[buffer].join('');
        this[props].closed = this[buffer][1]==='/';
        this[props].selfClosed = this[buffer][this[buffer].length-2]==='/';
        this.result.push({
            type: 'tag',
            data: this[props]
        });
        this.emit('tag',this[props]);
    };

    /**
     * begin text state
     */
    [begTextState](){
        this[buffer] = [];
        this[updateState](STATE.TEXT);
    };

    /**
     * end text state
     */
    [endTextState](){
        if (this[buffer].length>0){
            let text = this[buffer].join('');
            this.result.push({
                type: 'text',
                data: text
            });
            this.emit('text',{
                source: text
            });
        }
    };

    /**
     * begin name state
     */
    [begNameState](){
        this[string] = [];
        this[updateState](STATE.NAME);
    };

    /**
     * end name state
     */
    [endNameState](){
        let sep = this[delimiter]||'';
        let name = `${sep}${this[string].join('').trim()}${sep}`;
        if (!!name){
            this[props].attr = name;
            this[props].attrs[name] = '';
        }
    };

    /**
     * begin value state
     */
    [begValueState](){
        this[string] = [];
        this[updateState](STATE.VALUE);
    };

    /**
     * end value state
     */
    [endValueState](){
        let value = this[string].join('');
        if (!!this[props].attr){
            this[props].attrs[this[props].attr] = value;
            delete this[props].attr;
        }
    };

    /**
     * begin string state
     *
     * @param {String} c - string char
     */
    [begStringState](c){
        this[string] = [];
        this[delimiter] = c;
        this[updateState](STATE.STRING);
    };

    /**
     * end string state
     */
    [endStringState](){
        // revert to last state
        this[status] = this[last];
        if (this[status]===STATE.NAME){
            this[endNameState]();
        }else if(this[status]===STATE.VALUE){
            this[endValueState]();
        }
        this[delimiter] = null;
    };

    /**
     * begin escape state
     *
     * @param  {String} c - string char
     */
    [begEscapeState](c){
        this[string].push(c);
        this[status] = STATE.ESCAPE;
    };

    /**
     * end escape state
     *
     * @param  {String} c - string char
     */
    [endEscapeState](c){
        this[string].push(c);
        this[status] = STATE.STRING;
    };

    /**
     * begin comment state
     */
    [begCommentState](){
        this[string] = [];
        this[updateState](STATE.COMMENT);
    };

    /**
     * end comment state
     */
    [endCommentState](){
        let event = {
            source: this[buffer].join(''),
            comment: this[string].join('')
        };
        this.result.push({
            type: 'comment',
            data: event
        });
        this.emit('comment', event);
    };
}

// export tokenizer
module.exports = Tokenizer;