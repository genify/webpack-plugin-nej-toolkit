/*
 * Style Instruction Class
 *
 * @author caijf(genify@163.com)
 */
const ntype = require('../node/const.js');
const Instruction = require('./Instruction.js');

// private variables
const config = Symbol('config');

/**
 * Style Instruction Class
 *
 * supported properties
 * - result     style list
 */
class InstrStyle extends Instruction {
    /**
     * Style Instruction Class
     *
     * @param {Object} options - config object
     * @param {String} options.file - file path
     */
    constructor(options) {
        super(options);
        this.result = [];
    }

    /**
     * process instruction beg tag
     *
     * ```html
     *      <!-- @name {a:111, b:2222} -->
     * ```
     *
     * @param  {Node}   node   - Instruction Node
     * @param  {Number} index  - instruction pointer in the buffer
     * @param  {Array}  buffer - Node list
     */
    begInstr(node, index, buffer) {
        super.begInstr(...arguments);
        this[config] = node.config||{};
    }

    /**
     * process content between instrction beg tag to end tag
     *
     * ```html
     *      <div>
     *          <img src="/path/to/image.png"/>
     *      </div>
     * ```
     *
     * @param  {Node}   node   - Resource Node
     * @param  {Number} index  - instruction pointer in the buffer
     * @param  {Array}  buffer - Node list
     */
    procInstr(node, index, buffer) {
        super.procInstr(...arguments);
        if (node.nodeType===ntype.STYLE){
            this.result.push(node);
        }
    }
}

// export class
module.exports = InstrStyle;