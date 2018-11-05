/*
 * Node Type Constant
 *
 * @author caijf(genify@163.com)
 */
module.exports = {
    /**
     * node type of tag
     *
     * @type {symbol}
     */
    TAG: Symbol('tag'),
    /**
     * node type of text
     *
     * @type {symbol}
     */
    TEXT: Symbol('text'),
    /**
     * node type of style
     *
     * @type {symbol}
     */
    STYLE: Symbol('style'),
    /**
     * node type of script
     *
     * @type {symbol}
     */
    SCRIPT: Symbol('script'),
    /**
     * unknown node type
     *
     * @type {symbol}
     */
    UNKNOWN: Symbol('unknown'),
    /**
     * node type of template
     *
     * @type {symbol}
     */
    TEMPLATE: Symbol('template'),
    /**
     * node type of resource
     *
     * @type {symbol}
     */
    RESOURCE: Symbol('resource'),
    /**
     * node type of instruction
     *
     * @type {symbol}
     */
    INSTRUCTION: Symbol('instruction')
};