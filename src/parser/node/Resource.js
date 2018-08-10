/*
 * Resource Node Class
 *
 * @author caijf(genify@163.com)
 */
const nd   = require('./type.js');
const Node = require('./Node.js');

/**
 * Resource Node Class
 */
class NodeResource extends Node {
    /**
     * Resource Node Class
     *
     * @param {Object}   options - config object
     * @param {NodeTag}  options.beg - begin tag instance
     * @param {NodeTag=} options.end - end tag instance
     * @param {String=}  options.source - content between tag
     */
    constructor(options={}) {
        super(options);
        this.nodeType = nd.RESOURCE;
    }
}

// export class
module.exports = NodeResource;