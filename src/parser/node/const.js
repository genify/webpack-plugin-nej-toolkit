/*
 * Node Type Constant
 *
 * @author caijf(genify@163.com)
 */
const Tag         = require('./Tag.js');
const Text        = require('./Text.js');
const Style       = require('./Style.js');
const Script      = require('./Script.js');
const Template    = require('./Template.js');
const Resource    = require('./Resource.js');
const Instruction = require('./Instruction.js');

// export node type and constructor
module.exports = {
    /**
     * node type of tag
     *
     * @type {symbol}
     */
    TAG: Tag.TYPE,
    /**
     * Tag Node Constructor
     *
     * @type {Node}
     */
    Tag: Tag,
    /**
     * node type of text
     *
     * @type {symbol}
     */
    TEXT: Text.TYPE,
    /**
     * Text Node Constructor
     *
     * @type {Node}
     */
    Text: Text,
    /**
     * node type of style
     *
     * @type {symbol}
     */
    STYLE: Style.TYPE,
    /**
     * Style Node Constructor
     *
     * @type {Node}
     */
    Style: Style,
    /**
     * node type of script
     *
     * @type {symbol}
     */
    SCRIPT: Script.TYPE,
    /**
     * Script Node Constructor
     *
     * @type {Node}
     */
    Script: Script,
    /**
     * node type of template
     *
     * @type {symbol}
     */
    TEMPLATE: Template.TYPE,
    /**
     * Template Node Constructor
     *
     * @type {Node}
     */
    Template: Template,
    /**
     * node type of resource
     *
     * @type {symbol}
     */
    RESOURCE: Resource.TYPE,
    /**
     * Resource Node Constructor
     *
     * @type {Node}
     */
    Resource: Resource,
    /**
     * node type of instruction
     *
     * @type {symbol}
     */
    INSTRUCTION: Instruction.TYPE,
    /**
     * Instruction Node Constructor
     *
     * @type {Node}
     */
    Instruction: Instruction
};