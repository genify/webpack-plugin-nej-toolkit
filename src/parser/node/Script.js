/*
 * Script Node Class
 *
 * @author caijf(genify@163.com)
 */
const Node = require('./Node.js');

// private variables
const type = Symbol('script');

/**
 * Script Node Class
 */
class NodeScript extends Node {
    /**
     * Script Node type identifier
     *
     * @type {symbol}
     */
    static get TYPE() {
        return type;
    }

    /**
     * Script Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.uri - external script url
     * @param {String} options.source - internal script code
     */
    constructor(options={}) {
        super(options);
        this.nodeType = type;
    }
}

// export class
module.exports = NodeScript;