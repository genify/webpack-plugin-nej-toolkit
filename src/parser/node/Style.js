/*
 * Style Node Class
 *
 * @author caijf(genify@163.com)
 */
const nd   = require('./type.js');
const Node = require('./Node.js');

/**
 * Style Node Class
 */
class NodeStyle extends Node {
    /**
     * Style Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.uri - external style url
     * @param {String} options.source - internal style code
     */
    constructor(options={}) {
        super(options);
        this.nodeType = nd.STYLE;
    }

}

// export class
module.exports = NodeStyle;