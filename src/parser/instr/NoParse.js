/*
 * NoParse Instruction Class
 *
 * @author caijf(genify@163.com)
 */
const Instruction = require('./Instruction.js');

// private variables
const type = Symbol('noparse');

/**
 * NoParse Instruction Class
 */
class InstrNoParse extends Instruction {
    /**
     * NoParse Instruction type
     *
     * @type {symbol}
     */
    static get TYPE() {
        return type;
    }

    /**
     * Instruction Class
     *
     * @param {Object} options - config object
     * @param {String} options.node - Instruction Node
     */
    constructor(options={}) {
        super(options);
        this.type = type;
    }
}

// export class
module.exports = InstrNoParse;