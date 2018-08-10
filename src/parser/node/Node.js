/*
 * Base Node Class
 *
 * @author caijf(genify@163.com)
 */
const nd = require('./type.js');

/**
 * Base Node Class
 */
class Node {
    /**
     * Base Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.source - node source code
     */
    constructor(options={}) {
        Object.assign(this, options);
        this.nodeType = nd.UNKNOWN;
    }
}

// export class
module.exports = Node;