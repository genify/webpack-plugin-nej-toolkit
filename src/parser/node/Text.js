/*
 * Text Node Class
 *
 * @author caijf(genify@163.com)
 */
const Node = require('./Node.js');

// private variables
const type = Symbol('text');

/**
 * Text Node Class
 */
class NodeText extends Node {
    /**
     * Text Node type identifier
     *
     * @type {symbol}
     */
    static get TYPE() {
        return type;
    }

    /**
     * Text Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.source - text source content
     */
    constructor(options={}) {
        super(options);
        this.nodeType = type;
    }
}

// export class
module.exports = NodeText;