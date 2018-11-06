/*
 * Instruction Constant
 *
 * @author caijf(genify@163.com)
 */
const Instruction = require('./Instruction.js');

// private variables
const instrs = {};

/**
 * register Instruction name and class, the name used in tag comment
 *
 * ```html
 *      <!-- @name {a:true, b:123} -->
 *
 *          Your Content Here
 *
 *      <!-- /@name -->
 * ```
 *
 * @param  {String} name - instruction name used in tag
 * @param  {Instruction} Class - Instruction Constructor
 */
exports.register = function (name, Class) {
    if (Class.prototype instanceof Instruction){
        name = name.toUpperCase();
        instrs[name] = Class;
    }
};

/**
 * get Instruction Definition from register cache
 *
 * @param  {String} name - Instruction name
 * @return {Instruction} Instruction Definition
 */
exports.get = function (name) {
    return instrs[name.toUpperCase()];
};

// import default supported instruction
const imap = {
    UMI         : 'UMI',
    STYLE       : 'Style',
    MERGE       : 'Merge',
    SCRIPT      : 'Script',
    MODULE      : 'Module',
    IGNORE      : 'Ignore',
    DEFINE      : 'Script',
    NOPARSE     : 'NoParse',
    VERSION     : 'UMI',
    TEMPLATE    : 'Template'
};
// regist instruction module
Object.keys(imap).forEach((name) => {
    exports.register(
        name, require('./'+imap[name]+'.js')
    );
});