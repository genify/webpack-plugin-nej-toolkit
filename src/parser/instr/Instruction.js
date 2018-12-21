/*
 * Instruction Base Class
 *
 * @author caijf(genify@163.com)
 */
const Emitter = require('../../util/emitter.js');

/**
 * Instruction Base Class
 */
class Instruction extends Emitter {
    /**
     * Base Instruction Class
     *
     * @param {Object} options - config object
     * @param {String} options.file - file path
     */
    constructor(options) {
        super(options);

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
        // do something by sub class
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
        // do something by sub class
    }

    /**
     * process instruction end tag
     *
     * ```html
     *      <!-- /@name -->
     * ```
     *
     * @param  {Node}   node   - Instruction Node
     * @param  {Number} index  - instruction pointer in the buffer
     * @param  {Array}  buffer - Node list
     */
    endInstr(node, index, buffer) {
        // do something by sub class
    }
}

// export class
module.exports = Instruction;