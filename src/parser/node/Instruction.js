/*
 * Instruction Node Class
 *
 * @author caijf(genify@163.com)
 */
const Node = require('./Node.js');

// private variables
const type = Symbol('instruction');

/**
 * Instruction Node Class
 */
class NodeInstruction extends Node {
    /**
     * Tag Node type identifier
     *
     * @type {symbol}
     */
    static get TYPE() {
        return type;
    }

    /**
     * Instruction Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.command - deploy command
     * @param {Object} options.config  - command config object
     * @param {String} options.source  - source code
     * @param {Boolean} options.closed - is command closed
     */
    constructor(options={}) {
        super(options);
        this.config = this.config||{};
        this.nodeType = type;
    }
}

// export class
module.exports = NodeInstruction;