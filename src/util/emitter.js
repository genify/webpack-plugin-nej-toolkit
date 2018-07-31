/*
 * Abstract Event Emitter
 *
 * @author caijf(genify@163.com)
 */
const Emitter = require('events');

/**
 * Abstract Event Emitter
 */
class PluginEmitter extends Emitter{
    /**
     * Abstract Event Emitter
     *
     * @param {Object} options - event config
     */
    constructor(options={}) {
        super(options);
        Object.keys(options).forEach((key) => {
            let func = options[key];
            if (typeof func==='function'){
                this.on(key, func);
            }
        });
    }

    /**
     * calls each of the listeners registered for the event named
     *
     * @param {String} name - event name
     */
    emit(name) {
        let list = this.listeners(name);
        if (!list||!list.length){
            return;
        }
        super.emit(...arguments);
    }
}
// export plugin emitter
module.exports = PluginEmitter;