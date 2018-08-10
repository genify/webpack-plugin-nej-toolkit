/*
 * Instruction Node Class
 *
 * @author caijf(genify@163.com)
 */
const nd   = require('./type.js');
const Node = require('./Node.js');

/**
 * Instruction Node Class
 */
class NodeInstruction extends Node {
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
        this.nodeType = nd.INSTRUCTION;
    }
}

// export class
module.exports = NodeInstruction;