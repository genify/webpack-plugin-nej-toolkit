/*
 * Prepare Webpack Entry Plugin
 * dump entry script config from html/template directory
 *
 * @author genify <genify@163.com>
 */
let path = require('path');
let nej = require('nej');

// private name
const dumpFiles = Symbol('dumpFiles');
const afterFileLoad = Symbol('afterFileLoad');

/**
 * Prepare Webpack Entry Plugin
 */
class NEJPluginPrepareEntry {
    /**
     * Prepare Webpack Entry Plugin
     *
     * @example
     *
     * ```
     * // webpack config file
     * module.exports = {
     *      // use nej toolkit config as entry
     *      entry: "/path/to/nej/release.conf"
     * };
     * ```
     *
     * @param {Object} options - plugin config options
     */
    constructor(options) {
        // do nothing
    }

    /**
     * dump input files
     *
     * @param compiler
     * @param {Object}  opt - dump config object
     * @param {String}  opt.dirInput - input directory
     * @param {String}  opt.dirInputSub - input sub director
     * @param {Boolean} opt.isTemplate  - is template file
     */
    [dumpFiles](compiler, opt) {
        if (!opt.dirInput){
            return;
        }
        let conf = compiler.nejConf.format({
            filter: 'FILE_FILTER',
            exclude: 'FILE_EXCLUDE',
            charset: 'FILE_CHARSET'
        });
        (opt.dirInputSub||[opt.dirInput]).forEach((dir) => {
            let list = nej.fs.lsfile(dir, (name, path) => {
                return !/^\./.test(name)&&
                    (!conf.filter||conf.filter.test(path))&&    // match path
                    (!conf.exclude||!conf.exclude.test(path));  // not exclude path
            });
            list.forEach((file) => {
                compiler.nejResult.push({
                    uri: file,
                    root: opt.dirInput,
                    charset: conf.charset,
                    isTemplate: !!opt.isTemplate
                });
            });
        });
    }

    [afterFileLoad](compiler) {
        compiler.nejCache = nej.io.dump();
        console.log(compiler);
    }

    /**
     * apply plugin
     *
     * @param compiler
     */
    apply(compiler) {
        // parse nej config
        compiler.hooks.entryOption.tap(
            'NEJPluginPrepareEntry -> Parse Config', () => {
                compiler.nejConf = new nej.PRS_Config({
                    config: path.resolve(compiler.options.entry)
                });
            }
        );
        // prepare webpack entry
        compiler.hooks.beforeRun.tapPromise(
            'NEJPluginPrepareEntry -> Prepare Entry', () => {
                return new Promise((resolve) => {
                    compiler.nejResult = new nej.EXP_Html({
                        file: compiler.nejConf.get('DIR_CONFIG')+'deploy.html'
                    });
                    // dump html files
                    let optHTML = compiler.nejConf.format({
                        dirInput: 'DIR_SOURCE',
                        dirInputSub: 'DIR_SOURCE_SUB'
                    });
                    this[dumpFiles](compiler, optHTML);
                    // dump template files
                    let optTPL = compiler.nejConf.format({
                        dirInput: 'DIR_SOURCE',
                        dirInputSub: 'DIR_SOURCE_SUB'
                    });
                    optTPL.isTemplate = true;
                    this[dumpFiles](compiler, optTPL);
                    // parse entry
                    compiler.nejResult.parse(
                        compiler.nejConf.format({
                            // for html parser
                            charset:'FILE_CHARSET',
                            ignoreMode:'X_RELEASE_MODE',
                            keepComment:'CPRS_KEEP_COMMENT',
                            cprsFlag:'CPRS_FLAG',
                            noCoreFlag:'CORE_MERGE_FLAG',
                            noParseFlag:'CORE_NOPARSE_FLAG',
                            inCoreFlag:'OBF_CORE_INLINE_FLAG',
                            exLinkAttributeFlag:'X_AUTO_EXLINK_PATH',
                            exLinkAttributeName:'X_AUTO_EXLINK_PREFIX',
                            exLinkAttributeRoot:'DIR_SOURCE',
                            // for resource parser
                            webRoot:'DIR_WEBROOT',
                            resRoot:'DIR_STATIC',
                            resReg:'DIR_STATIC_MERGE',
                            sptRoot:'OPT_IMAGE_SPRITE',
                            aliasReg:'ALIAS_MATCH',
                            aliasDict:'ALIAS_DICTIONARY'
                        })
                    );
                    nej.io.onload(() => {
                        this[afterFileLoad](compiler);
                    });
                });
            }
        );
    }
}

module.exports = NEJPluginPrepareEntry;
