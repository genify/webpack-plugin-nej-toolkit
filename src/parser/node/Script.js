/*
 * Script Node Class
 *
 * @author caijf(genify@163.com)
 */
const nd   = require('./type.js');
const Node = require('./Node.js');

/**
 * Script Node Class
 */
class NodeScript extends Node {
    /**
     * Script Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.uri - external script url
     * @param {String} options.source - internal script code
     */
    constructor(options={}) {
        super(options);
        this.nodeType = nd.SCRIPT;
    }
}

// export class
module.exports = NodeScript;