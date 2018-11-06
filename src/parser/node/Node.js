/*
 * Base Node Class
 *
 * @author caijf(genify@163.com)
 */

// private variables
const type = Symbol('unknown');

/**
 * Base Node Class
 */
class Node {
    /**
     * Node type identifier
     *
     * @type {symbol}
     */
    static get TYPE() {
        return type;
    }

    /**
     * Base Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.source - node source code
     */
    constructor(options={}) {
        Object.assign(this, options);
        this.nodeType = type;
    }
}

// export class
module.exports = Node;