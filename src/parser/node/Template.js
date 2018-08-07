/*
 * Template Node Class
 *
 * @author caijf(genify@163.com)
 */
const Node = require('./Node.js');

/**
 * Template Node Class
 */
class NodeTemplate extends Node {
    /**
     * Template Node Class
     *
     * @param {Object} options - config object
     * @param {String} options.type   - template type, e.g. css/js/html
     * @param {String} options.uri    - external template url
     * @param {String} options.id     - template identifier
     * @param {String} options.source - template content
     */
    constructor(options={}) {
        super(options);

    }
}

// export class
module.exports = NodeTemplate;