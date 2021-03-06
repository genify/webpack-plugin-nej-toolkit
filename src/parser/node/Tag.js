/*
 * Tag Node Class
 *
 * @author caijf(genify@163.com)
 */
const Node = require('./Node.js');

// private variables
const type = Symbol('tag');

/**
 * Tag Node Class
 */
class NodeTag extends Node {
    /**
     * Tag Node type identifier
     *
     * @type {symbol}
     */
    static get TYPE() {
        return type;
    }

    /**
     * Tag Node Class
     *
     * @param {Object}  options - config object
     * @param {String}  options.name       - tag name
     * @param {Object}  options.attrs      - tag attributes map
     * @param {String}  options.source     - html source code
     * @param {Boolean} options.closed     - is closed tag
     * @param {Boolean} options.selfClosed - is self closed tag
     */
    constructor(options={}) {
        super(options);
        this.nodeType = type;
    }
}

// export class
module.exports = NodeTag;