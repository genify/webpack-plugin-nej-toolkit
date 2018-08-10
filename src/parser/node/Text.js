/*
 * Text Node Class
 *
 * @author caijf(genify@163.com)
 */
const nd   = require('./type.js');
const Node = require('./Node.js');

/**
 * Text Node Class
 */
class NodeText extends Node {
    /**
     * Text Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.source - text source content
     */
    constructor(options={}) {
        super(options);
        this.nodeType = nd.TEXT;
    }
}

// export class
module.exports = NodeText;