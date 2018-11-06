/*
 * Instruction Base Class
 *
 * @author caijf(genify@163.com)
 */

/**
 * Instruction Base Class
 */
class Instruction {
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
    static onInstrBeg(node, index, buffer) {
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
    static onInstrProc(node, index, buffer) {

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
    static onInstrEnd(node, index, buffer) {
        // do something by sub class
    }
}

// export class
module.exports = Instruction;