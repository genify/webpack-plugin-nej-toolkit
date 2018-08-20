/*
 * Prepare Webpack Entry Plugin
 * dump entry script config from html/template directory
 *
 * @author genify <genify@163.com>
 */
let path = require('path');
let NEJRooter = require('../parser/Root.js');
let CFGParser = require('../parser/Config.js');

/**
 * Prepare Webpack Entry Plugin
 */
class NEJEntry {
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
     * apply plugin
     *
     * @param compiler
     */
    apply(compiler) {
        // parse nej config
        compiler.hooks.entryOption.tap(
            'NEJPluginPrepareEntry -> Parse Config', () => {
                compiler.nejConfig = new CFGParser({
                    config: path.resolve(compiler.options.entry),
                    error: () => {
                        process.abort();
                    }
                });
            }
        );
        // prepare webpack entry
        compiler.hooks.beforeRun.tapPromise(
            'NEJPluginPrepareEntry -> Prepare Entry', () => {
                return new Promise((resolve) => {
                    compiler.nejRoot = new NEJRooter({
                        config: compiler.nejConfig,
                        done: () => {
                            compiler.options.entry =
                                compiler.nejRoot.getWebPackEntry();
                            resolve();
                        }
                    });
                });
            }
        );
    }
}

module.exports = NEJEntry;
