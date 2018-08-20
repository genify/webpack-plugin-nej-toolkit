/*
 * HTML Parser and NEJ Config Transformer
 *
 * @author caijf(genify@163.com)
 */
const nd      = require('./node/type.js');
const Emitter = require('../util/emitter.js');

// private name
const parser     = Symbol('parser');
const config     = Symbol('config');
const transform  = Symbol('transform');

const STATE = {
    
};

// transform style/script/template node
const TRANSFORM = {
    [nd.STYLE]: function (node, index, buffer) {
        
    },
    [nd.SCRIPT]: function (node, index, buffer) {
        
    },
    [nd.TEMPLATE]: function (node, index, buffer) {
        
    },
    [nd.INSTRUCTION]: function (node, index, buffer) {
        
    }
};

// transform instruction
const INSTRUCTION = {
    STYLE: function () {

    },
    SCRIPT: function () {

    },
    TEMPLATE: function () {

    },
    VERSION: function () {
        
    },
    MANIFEST: function () {
        
    },
    MODULE: {
        beg: function () {
            
        },
        end: function () {
            
        }
    },
    NOCOMPRESS: {
        beg: function () {

        },
        end: function () {

        }
    },
    NOPARSE: {
        beg: function () {

        },
        end: function () {

        }
    },
    IGNORE: {
        beg: function () {
            
        },
        end: function () {
            
        }
    },
    MERGE: {
        beg: function () {
            
        },
        end: function () {
            
        }
    }
};

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

        this[transform]();
    }

    /**
     * transform html parse result with nej config
     */
    [transform]() {
        this[parser].result.forEach((node, index, list) => {
            let func = TRANSFORM[node.nodeType];
            if (typeof func==='function'){
                func.apply(this, arguments);
            }
        });
    }

}

// export Converter
module.exports = Transformer;