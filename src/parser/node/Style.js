/*
 * Style Node Class
 *
 * @author caijf(genify@163.com)
 */
const Node = require('./Node.js');

// private variables
const type = Symbol('style');

/**
 * Style Node Class
 */
class NodeStyle extends Node {
    /**
     * Style Node type identifier
     *
     * @type {symbol}
     */
    static get TYPE() {
        return type;
    }

    /**
     * Style Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.uri - external style url
     * @param {String} options.source - internal style code
     */
    constructor(options={}) {
        super(options);
        this.nodeType = type;
    }

}

// export class
module.exports = NodeStyle;