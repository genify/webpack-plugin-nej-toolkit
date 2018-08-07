/*
 * Base Node Class
 *
 * @author caijf(genify@163.com)
 */
const Emitter = require('../../util/emitter.js');

/**
 * Base Node Class
 */
class Node extends Emitter {
    /**
     * Base Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.source - node source code
     */
    constructor(options={}) {
        super(options);
        Object.assign(this, options);
    }
}

// export class
module.exports = Node;