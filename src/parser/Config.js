/*
 * Config Content Parser
 *
 * @author caijf(genify@163.com)
 */
const fs       = require('fs');
const dt       = require('fecha');
const qs       = require('querystring');
const path     = require('path');
const _util    = require('../util/util.js');
const _Emitter = require('../util/emitter.js');

// private name
const cache          = Symbol('cache');
const check          = Symbol('check');
const filter         = Symbol('filter');
const parse          = Symbol('parse');
const parseProp      = Symbol('parseProp');
const deprecate      = Symbol('deprecate');
const formatKey      = Symbol('formatKey');
const formatDir      = Symbol('formatDir');
const formatDirSub   = Symbol('formatDirSub');
const formatDomain   = Symbol('formatDomain');
const formatDomains  = Symbol('formatDomains');
const formatBoolean  = Symbol('formatBoolean');
const formatNumber   = Symbol('formatNumber');
const formatRegExp   = Symbol('formatRegExp');
const formatPathVar  = Symbol('formatPathVar');
const formatJSONObj  = Symbol('formatJSONObj');
const formatCoreList = Symbol('formatCoreList');

// config filters
const FILTERS_INDEXED = {};
const FILTERS_CONFIG = [
    {
        // relative to DIR_CONFIG
        DIR_WEBROOT:function(v){
            return _util.absolute(
                this.get('DIR_CONFIG'),
                (v||'.')+'/'
            );
        }
    },{
        // relative to DIR_WEBROOT
        DIR_SOURCE:function(v){
            return this[formatDir](v);
        }
    },{
        // relative to DIR_SOURCE
        DIR_SOURCE_SUB:function(v){
            if (v){
                return this[formatDirSub](v,
                    this.get('DIR_SOURCE')||
                    this.get('DIR_WEBROOT')
                );
            }
        }
    },{
        // relative to DIR_WEBROOT
        DIR_OUTPUT:function(v){
            let ret = _util.absolute(
                this.get('DIR_WEBROOT'),
                this[formatPathVar](v||'.')+'/'
            );
            _util.mkdir(ret);
            return ret;
        }
    },{
        // relative to DIR_WEBROOT
        DIR_SOURCE_TP:function(v){
            return this[formatDir](v);
        }
    },{
        // relative to DIR_SOURCE_TP
        DIR_SOURCE_TP_SUB:function(v){
            if (v){
                return this[formatDirSub](v,
                    this.get('DIR_SOURCE_TP')||
                    this.get('DIR_WEBROOT')
                );
            }
        }
    },{
        // relative to DIR_WEBROOT
        DIR_OUTPUT_TP:function(v){
            let output = v
                ? this[formatDir](v)
                : this.get('DIR_OUTPUT');
            _util.mkdir(output);
            return output;
        }
    },{
        // relative to DIR_WEBROOT
        DIR_OUTPUT_STATIC:function(v){
            let output = v
                    ? this[formatDir](v)
                    : this.get('DIR_OUTPUT')||
                      this.get('DIR_WEBROOT');
            _util.mkdir(output);
            return output;
        }
    },{
        // relative to DIR_WEBROOT
        DIR_STATIC:function(v){
            return this[formatDir](v||'./res/');
        },
        DIR_STATIC_MERGE:function(v){
            return this[formatRegExp](v,'i');
        }
    },{
        // @deprecated see ALIAS_MATCH
        ALIAS_START_TAG:function(v){
            return v||'${';
        },
        // @deprecated see ALIAS_MATCH
        ALIAS_END_TAG:function(v){
            return v||'}';
        }
    },{
        ALIAS_MATCH:function(v){
            v = this[formatRegExp](v,'ig');
            if (!v){
                // use start tag and end tag
                let reg = /([$()[\]*+|])/g,
                    beg = this.get('ALIAS_START_TAG').replace(reg,'\\$1'),
                    end = this.get('ALIAS_END_TAG').replace(reg,'\\$1');
                this.remove('ALIAS_END_TAG','ALIAS_START_TAG');
                v = new RegExp(`${beg}(.*?)${end}`,'ig');
            }
            return v;
        }
    },{
        ALIAS_DICTIONARY:function(v){
            return this[formatJSONObj](v)||{};
        }
    },{
        DM_STATIC:function(v){
            return this[formatDomains](v);
        }
    },{
        DM_STATIC_CS:function(v){
            return this[formatDomains](v,'DM_STATIC');
        },
        DM_STATIC_JS:function(v){
            return this[formatDomains](v,'DM_STATIC');
        },
        DM_STATIC_RS:function(v){
            return this[formatDomains](v,'DM_STATIC');
        },
        // @deprecated see NEJ_MODULE_ROOT
        DM_STATIC_MR:function(v){
            this[deprecate]('DM_STATIC_MR','NEJ_MODULE_ROOT',v);
        },
        // @deprecated see MANIFEST_ROOT
        DM_STATIC_MF:function(v){
            this[deprecate]('DM_STATIC_MF','MANIFEST_ROOT',v);
        }
    },{
        // @deprecated see FILE_FILTER
        FILE_SUFFIXE:function(v){
            if (v){
                v = '\\.(?:'+v+')$';
            }
            this[deprecate]('FILE_SUFFIXE','FILE_FILTER',v);
        }
    },{
        FILE_FILTER:function(v){
            return this[formatRegExp](v,'i')||/\.(html|ftl)$/i;
        },
        FILE_EXCLUDE:function(v){
            return this[formatRegExp](v,'i');
        }
    },{
        FILE_CHARSET:function(v){
            return (v||'utf-8').toLowerCase();
        }
    },{
        // @deprecated see VERSION_MODE
        NAME_SUFFIX:function(v){
            if (v){
                if (v.search(/[._-]/)!==0){
                    v = '_'+v;
                }
                v = '[FILENAME]'+v;
            }
            this[deprecate]('NAME_SUFFIX','VERSION_MODE',v);
        },
        // @deprecated see VERSION_MODE
        RAND_VERSION:function(v){
            // use rand mode
            if (v&&this[formatBoolean](v)){
                v = 1;
            }
            this[deprecate]('RAND_VERSION','VERSION_MODE',v);
        }
    },{
        VERSION_MODE:function(v){
            return this[formatNumber](v,0,1,v||0);
        }
    },{
        // @deprecated see VERSION_STATIC
        STATIC_VERSION:function(v){
            this[deprecate]('STATIC_VERSION','VERSION_STATIC',v);
        }
    },{
        VERSION_STATIC:function(v){
            return this[formatBoolean](v);
        },
        VERSION_STATIC_MODE:function(v){
            return this[formatNumber](v,0,1,v)||0;
        }
    },{
        // @deprecated see CORE_MERGE_FLAG
        X_NOCORE_STYLE:function(v){
            if (v!=null){
                let NOTHING = 0;
                let MGSTYLE = 1;
                v = (this[formatBoolean](v)?MGSTYLE:NOTHING)
                    + (this.get('CORE_MERGE_FLAG')||NOTHING);
            }
            this[deprecate]('X_NOCORE_STYLE','CORE_MERGE_FLAG',v);
        },
        // @deprecated see CORE_MERGE_FLAG
        X_NOCORE_SCRIPT:function(v){
            if (v!=null){
                let NOTHING = 0;
                let MGSCRIPT = 2;
                v = (this[formatBoolean](v)?MGSCRIPT:NOTHING)
                    + (this.get('CORE_MERGE_FLAG')||NOTHING);
            }
            this[deprecate]('X_NOCORE_SCRIPT','CORE_MERGE_FLAG',v);
        },
        // @deprecated see CORE_NOPARSE_FLAG
        X_NOPARSE_FLAG:function(v){
            this[deprecate]('X_NOPARSE_FLAG','CORE_NOPARSE_FLAG',v);
        }
    },{
        // @deprecated see WRP_INLINE_SOURCE
        X_MODULE_WRAPPER:function(v){
            if (v){
                v = v||this.get('WRP_INLINE_SOURCE')||'%s';
            }
            this[deprecate]('X_MODULE_WRAPPER','WRP_INLINE_SOURCE',v);
        },
        // @deprecated see WRP_INLINE_SOURCE
        X_SCRIPT_WRAPPER:function(v){
            if (v){
                v = v||this.get('WRP_INLINE_SOURCE')||'%s';
            }
            this[deprecate]('X_SCRIPT_WRAPPER','WRP_INLINE_SOURCE',v);
        }
    },{
        // @deprecated see CPRS_FLAG
        X_NOCOMPRESS:function(v){
            if (v!=null){
                let AUTO = 0;
                let NOTZIP = 1;
                v = this[formatBoolean](v)?NOTZIP:AUTO;
            }
            this[deprecate]('X_NOCOMPRESS','CPRS_FLAG',v);
        },
        // @deprecated see CPRS_KEEP_COMMENT
        X_KEEP_COMMENT:function(v){
            this[deprecate]('X_KEEP_COMMENT','CPRS_KEEP_COMMENT',v);
        }
    },{
        NEJ_DIR: function (v) {
            if (!v) {
                let root = this.get('DIR_WEBROOT');
                // check nej in lib
                v = root + 'src/javascript/lib/nej/';
                if (fs.existsSync(v + 'define.js')) {
                    return v;
                }
                // check nej src directory
                v += 'src/';
                if (fs.existsSync(v + 'define.js')) {
                    return v;
                }
                return;
            }
            // check query string for nej config
            let arr = (v || '').split('?');
            if (arr[1]) {
                this.set(
                    'NEJ_CONFIG',
                    qs.parse(arr[1])
                );
            }
            return this[formatDir](arr[0]);
        }
    },{
        NEJ_CONFIG:function(v){
            // for a=b&b=c&c=d
            if (typeof v==='string'){
                v = qs.parse(v);
            }
            return v||this.get('NEJ_CONFIG')||{};
        },
        NEJ_PARAMETERS:function(v){
            return this[formatJSONObj](v);
        },
        NEJ_REGULAR:function(v){
            if (!v){
                v = './src/javascript/lib/regularjs/dist/regular.js';
            }
            v = _util.absolute(this.get('DIR_WEBROOT'),v);
            return fs.existsSync(v) ? v : 'regularjs';
        },
        NEJ_PLATFORM:function(v){
            return v||'';
        },
        NEJ_PROCESSOR:function(v){
            let ret;
            if (v){
                let file = _util.absolute(
                    this.get('DIR_CONFIG'),v
                );
                try{
                    ret = require(file);
                }catch(ex){
                    // ignore
                }
            }
            // for file path
            // merge processors
            let plugins = {
                rgl: 'regular',
                regular: (event) => {
                    try{
                        let rgl = require(
                            this.get('NEJ_REGULAR')
                        );
                        return JSON.stringify(
                            rgl.parse(event.content)
                        );
                    }catch(ex){
                        return JSON.stringify(event.content);
                    }
                }
            };
            Object.assign(plugins,ret||{});
            Object.keys(plugins).forEach((key) => {
                let func = plugins[key];
                if (typeof func==='string'){
                    func = plugins[func];
                }
                plugins[key] = func.bind(this);
            });
            return plugins;
        },
        NEJ_INJECTOR:function(v){
            return v||'I$';
        },
        NEJ_MODULE_ROOT:function(v){
            return _util.normalize(
                this[formatDomain](v), true
            );
        },
        NEJ_MODULE_VERSION:function (v) {
            return this[formatNumber](v,0,1,0);
        },
        NEI_PROJECT_ID:function(v){
            return this[formatNumber](v,0,Number.POSITIVE_INFINITY,0);
        },

        OPT_IMAGE_FLAG:function(v){
            return this[formatBoolean](v);
        },
        OPT_IMAGE_QUALITY:function(v){
            return this[formatNumber](v,1,100,100);
        },
        OPT_IMAGE_BASE64:function(v){
            return this[formatNumber](v,0,1000000,0);
        },
        OPT_IMAGE_SPRITE:function(v){
            if (v){
                return _util.absolute(
                    this.get('DIR_STATIC'), v+'/'
                );
            }
        },
        OPT_IMAGE_SPRITE_OPTIONS:function(v){
            return this[formatJSONObj](v);
        },

        MANIFEST_ROOT:function(v){
            return _util.normalize(
                this[formatDomain](v), true
            );
        },
        MANIFEST_OUTPUT:function(v){
            return this[formatDir](v||'./cache.manifest');
        },
        MANIFEST_TEMPLATE:function(v){
            // dump content
            let content;
            if (v){
                // relative to DIR_CONFIG
                let mtpl = _util.absolute(
                    this.get('DIR_CONFIG'),v
                );
                if (fs.existsSync(mtpl)){
                    let list = fs
                        .readFileSync(mtpl,'utf-8')
                        .split(/\r\n|\r|\n/);
                    content = list.join('\n');
                }
            }
            // check content
            if (!content){
                content = [
                    'CACHE MANIFEST',
                    '#VERSION = #<VERSION>','',
                    'CACHE:','#<CACHE_LIST>','',
                    'NETWORK:','*','',
                    'FALLBACK:',''
                ].join('\n');
            }
            return content;
        },
        MANIFEST_FILTER:function(v){
            return this[formatRegExp](v,'i');
        },

        OBF_LEVEL:function(v){
            return this[formatNumber](v,0,3,0);
        },
        OBF_NAME_BAGS:function(v){
            return _util.absolute(
                this.get('DIR_CONFIG'),
                v||'./names.json'
            );
        },
        OBF_COMPATIBLE:function(v){
            // default value is true
            if (v==null||v===''){
                v = true;
            }
            return this[formatBoolean](v);
        },
        OBF_SOURCE_MAP:function(v){
            v = this[formatBoolean](v);
            if (v){
                let dir = this.get('DIR_OUTPUT_STATIC')+'s/';
                this.set('DIR_SOURCE_MAP',dir);
                _util.mkdir(dir);
            }
            return v;
        },
        OBF_MAX_CS_INLINE_SIZE:function(v){
            return this[formatNumber](v,0,Number.POSITIVE_INFINITY,50);
        },
        OBF_MAX_JS_INLINE_SIZE:function(v){
            return this[formatNumber](v,0,Number.POSITIVE_INFINITY,0);
        },
        OBF_CORE_INLINE_FLAG:function(v){
            return this[formatNumber](v,0,3,0);
        },
        OBF_DROP_CONSOLE:function(v){
            return this[formatBoolean](v);
        },
        OBF_GLOBAL_VAR:function(v){
            return this[formatJSONObj](v);
        },

        CORE_LIST_JS:function(v){
            return this[formatCoreList](v);
        },
        CORE_LIST_CS:function(v){
            return this[formatCoreList](v);
        },
        CORE_MASK_JS:function(v){
            return this[formatCoreList](v);
        },
        CORE_MASK_CS:function(v){
            return this[formatCoreList](v);
        },
        CORE_FREQUENCY_JS:function(v){
            return this[formatNumber](v,2,1000000,2);
        },
        CORE_FREQUENCY_CS:function(v){
            return this[formatNumber](v,2,1000000,2);
        },
        CORE_IGNORE_ENTRY:function(v){
            return this[formatBoolean](v);
        },
        CORE_MERGE_FLAG:function(v){
            return this[formatNumber](v,0,3,0);
        },
        CORE_NOPARSE_FLAG:function(v){
            return this[formatNumber](v,0,3,0);
        },

        WRP_INLINE_SOURCE:function(v){
            return v||'%s';
        },
        WRP_SCRIPT_SOURCE:function(v){
            return v||'%s';
        },
        WRP_INLINE_CS:function(v){
            return v||'<textarea name="css">%s</textarea>';
        },
        WRP_EXLINE_CS:function(v){
            return v||'<textarea name="css" data-src="%s"></textarea>';
        },
        WRP_INLINE_JS:function(v){
            return v||'<textarea name="js">%s</textarea>';
        },
        WRP_EXLINE_JS:function(v){
            return v||'<textarea name="js" data-src="%s"></textarea>';
        },
        WRP_INLINE_TP:function(v){
            return v||'<textarea id="%s" name="%s">%s</textarea>';
        },
        WRP_INLINE_STYLE:function(v){
            return v||'<style type="text/css">\n%s\n</style>';
        },
        WRP_EXLINE_STYLE:function(v){
            return v||'<link rel="stylesheet" href="%s"/>';
        },
        WRP_INLINE_SCRIPT:function(v){
            return v||'<script>\n%s\n</script>';
        },
        WRP_EXLINE_SCRIPT:function(v){
            return v||'<script src="%s"></script>';
        },

        CPRS_FLAG:function(v){
            return this[formatNumber](v,0,2,0);
        },
        CPRS_KEEP_COMMENT:function(v){
            return this[formatBoolean](v);
        },

        WCS_UPLOAD_URL:function(v){
            return v||'';
        },
        WCS_UPLOAD_TOKEN:function(v){
            return v||'';
        },
        WCS_APP_ID:function(v){
            return v||'';
        },
        WCS_NATIVE_ID:function(v){
            return v||'';
        },
        WCS_FILE_INCLUDE:function(v){
            return v||'';
        },
        WCS_FILE_EXCLUDE:function(v){
            return v||'';
        },
        WCS_CONFIG_FILE:function(v){
            if (!v){
                v = './cache.json';
            }
            // relative to DIR_CONFIG
            return _util.absolute(
                this.get('DIR_CONFIG'),v
            );
        },
        WCS_CONFIG_EXTENSION:function(v){
            return this[formatJSONObj](v);
        },

        X_AUTO_EXLINK_PATH:function(v){
            return this[formatBoolean](v);
        },
        X_AUTO_EXLINK_PREFIX:function(v){
            if (typeof v==='string'){
                v = '^(?:'+v+')$';
            }
            return this[formatRegExp](v,'i');
        },
        X_AUTO_EXLINK_SCRIPT:function(v){
            return this[formatBoolean](v);
        },
        X_AUTO_EXLINK_SCRIPT_EXTENSION:function(v){
            return this[formatJSONObj](v);
        },


        X_RELEASE_MODE:function(v){
            return (v||'online').toLowerCase();
        },
        X_LOGGER_LEVEL:function(v){
            return (v||'all').toUpperCase();
        },
        X_LOGGER_FILE:function(v){
            return v||(
                this.get('DIR_CONFIG')+
                dt.format(new Date(),'YYYYMMDD-HHmmssSSS.log')
            );
        }
    }];

// index filter config
FILTERS_CONFIG.forEach((it) => {
    Object.keys(it).forEach((key) => {
        FILTERS_INDEXED[key] = it[key];
    });
});

/**
 * Config Content Parser
 */
class Parser extends _Emitter{
    /**
     * Config Content Parser
     *
     * @param {Object} options - config object
     * @param {Object|String} options.config - config object or config file path
     */
    constructor(options={}) {
        super(options);
        this[cache] = {};
        this[parse](options.config);
        this[check]();
        this.emit('done',{
            message: 'config parse done'
        });
    }

    /**
     * get config value with key
     *
     * @param  {String} key - config key
     * @return {*} config value
     */
    get(key) {
        key = this[formatKey](key);
        // default value for config is empty string
        let val = this[cache][key];
        if (val==null){
            val = '';
        }
        return val;
    }

    /**
     * set config value with key
     *
     * @param {String} key   - config key
     * @param {*}      value - config value
     */
    set(key, value) {
        key = this[formatKey](key);
        this[cache][key] = value;
    }

    /**
     * remove config with key
     */
    remove() {
        [...arguments].forEach((key) =>{
            key = this[formatKey](key);
            delete this[cache][key];
        });
    }

    /**
     * filter config value
     *
     * @param  {Function} func  - filter action
     * @param  {String}   key   - config key
     * @param  {*}        value - config value
     */
    [filter](func, key, value) {
        key = this[formatKey](key);
        if (typeof func==='function'){
            value = func.call(this, value);
        }
        if (value!=null){
            this.set(key, value);
        }
    }

    /**
     * deprecate key1 to key2
     *
     * @param  {String} key1  - deprecated key
     * @param  {String} key2  - new key
     * @param  {String|Function} value - new value or get new value function
     */
    [deprecate](key1, key2, value) {
        // not config old key
        if (value==null||value===''){
            return;
        }
        // warn if config with old key
        this.emit('warn',{
            field: [key1, key2],
            message: `${key1} is deprecated, use ${key2} instead`
        });
        // delegate to new key
        let func = FILTERS_INDEXED[key2];
        this[filter](func, key2, value);
        FILTERS_INDEXED[key2] = (v) => {
            if (v==null||v===''){
                return this.get(key2);
            }
            return func.call(this, v);
        };
    }

    /**
     * check config parameter
     */
    [check]() {
        // check web root
        let root = this.get('DIR_WEBROOT');
        if (!fs.existsSync(root)){
            this.emit('error',{
                field: 'DIR_WEBROOT',
                message: `DIR_WEBROOT[${root}] not exist`
            });
        }
        // check input directory
        if (!this.get('DIR_SOURCE')&&
            !this.get('DIR_SOURCE_SUB')&&
            !this.get('DIR_SOURCE_TP')&&
            !this.get('DIR_SOURCE_TP_SUB')){
            this.emit('error',{
                field: [
                    'DIR_SOURCE','DIR_SOURCE_SUB',
                    'DIR_SOURCE_TP','DIR_SOURCE_TP_SUB'
                ],
                message: 'not found input directory'
            });
        }
        // check static entry and template entry directory
        let sdir = this.get('DIR_SOURCE');
        let tdir = this.get('DIR_SOURCE_TP');
        if (sdir&&tdir&&(sdir.indexOf(tdir)>=0||tdir.indexOf(sdir)>=0)){
            this.emit('warn',{
                field: ['DIR_SOURCE', 'DIR_SOURCE_TP'],
                message: `one dir is sub dir of another, DIR_SOURCE[${sdir}],DIR_SOURCE_TP[${tdir}]`
            });
        }
        // check static entry output directory
        let odir = this.get('DIR_OUTPUT');
        if (odir.indexOf(root)!==0){
            this.emit('warn',{
                field: 'DIR_OUTPUT',
                message: `DIR_OUTPUT[${odir}] not in DIR_WEBROOT`
            });
        }
        // check static resource output directory
        let ostat = this.get('DIR_OUTPUT_STATIC');
        if (ostat.indexOf(root)!==0){
            this.emit('warn',{
                field: 'DIR_OUTPUT_STATIC',
                message: `DIR_OUTPUT_STATIC[${ostat}] is not sub directory of DIR_WEBROOT`
            });
        }
        // check static resource input directory
        let istat = this.get('DIR_STATIC');
        if (!fs.existsSync(istat)){
            this.emit('warn',{
                field: 'DIR_STATIC',
                message: `DIR_STATIC[${istat}] not exist`
            });
        }
        // check sprite directory
        let sprite = this.get('OPT_IMAGE_SPRITE');
        if (sprite){
            if (!fs.existsSync(sprite)){
                this.emit('warn',{
                    field: 'OPT_IMAGE_SPRITE',
                    message: `OPT_IMAGE_SPRITE[${sprite}] not exist`
                });
            }
            // check dir under webroot
            if (sprite.indexOf(root)!==0){
                this.emit('warn',{
                    field: 'OPT_IMAGE_SPRITE',
                    message: `OPT_IMAGE_SPRITE[${sprite}] not in DIR_WEBROOT`
                });
            }
        }
    }

    /**
     * parse config object or config file
     *
     * @param  {Object|String} conf - config object or config file
     */
    [parse](conf) {
        if (!conf){
            this.emit('error',{
                message: `not assign config file`
            });
            return;
        }
        // parse config
        let ret = conf;
        let dir = _util.absolute(
            process.cwd()+'/'
        );
        // dump config from file
        if (typeof ret==='string'){
            let file = _util.absolute(dir,ret);
            this.emit('info', {
                message: `parse config file ${file}`
            });
            ret = this[parseProp](file);
            dir = path.dirname(file)+'/';
        }
        // check config directory
        if (!ret['DIR_CONFIG']){
            this.set('DIR_CONFIG', dir);
        }
        // format config item
        FILTERS_CONFIG.forEach((it) => {
            Object.keys(it).forEach((key) => {
                this[filter](
                    FILTERS_INDEXED[key],
                    key, ret[key]
                );
                delete ret[key];
            });
        });
        // cache config left
        Object.keys(ret).forEach((key) => {
            this.set(key, ret[key]);
        });
    }

    /**
     * parse properties file
     *
     * @param  {String} file - properties file path
     * @return {Object} config object
     */
    [parseProp](file) {
        if (!fs.existsSync(file)){
            this.emit('error',{
                field: 'DIR_CONFIG',
                message: `config file [${file}] not exist`
            });
            return null;
        }
        // try dump from json config file
        let parseJSON = () => {
            let ret;
            try{
                let map = require(file);
                // if import ok copy and format key
                ret = {};
                Object.keys(map).forEach((key) => {
                    ret[this[formatKey](key)] = map[key];
                });
            }catch(ex){
                // ignore
            }
            return ret;
        };
        // try dump from properties file
        let parseProps = () => {
            let ret = {};
            let cmt = /^\s*#/;
            let list = fs
                .readFileSync(file,'utf-8')
                .split(/\r\n|\r|\n/);
            list.forEach((line) => {
                // for comment line
                if (cmt.test(line)){
                    return;
                }
                // for config line
                let arr = line.split('=');
                let key = this[formatKey](arr.shift());
                ret[key] = (arr.join('=')||'').trim();
            });
            return ret;
        };
        // try to dump properties
        return parseJSON()||parseProps();
    }

    /**
     * format config key
     *
     * @param key
     */
    [formatKey](key) {
        key = (key||'').toString();
        return key.trim().toUpperCase();
    }

    /**
     * convert dir to absolute path relative to web root
     *
     * @param  {String} dir - dir path
     * @return {String} absolute dir path
     */
    [formatDir](dir) {
        let root = this.get('DIR_WEBROOT');
        return _util.absolute(root, dir);
    }

    /**
     * convert sub dir to absolute path relative to root
     *
     * @param  {String} sub  - sub directory
     * @param  {String} root - root relative by
     * @return {Array} absolute sub directory
     */
    [formatDirSub](sub, root) {
        let ret = [];
        sub.split(/[,;\s]+/).forEach((dir) => {
            let subdir = _util.absolute(
                root, (dir||'.')+'/'
            );
            if (ret.indexOf(subdir)<0){
                ret.push(subdir);
            }
        });
        return ret;
    }

    /**
     * format domain value
     *
     * @param  {String} domain - domain value
     * @return {String} domain after formatted
     */
    [formatDomain](domain) {
        if (!domain){
            return null;
        }
        if (domain.indexOf('/')>=0){
            return domain;
        }
        return 'http://'+domain+'/';
    }

    /**
     * format domain list
     *
     * @param  {String} domains - domain list split by , or ; or space
     * @param  {String} key - default domain value key
     * @return {Array}  domain value list
     */
    [formatDomains](domains, key) {
        let def = this.get(key)||[];
        if (!domains){
            return def;
        }
        // check domain string
        let ret;
        if (typeof domains==='string'){
            ret = domains.split(/[,;\s]+/);
        }else if (Array.isArray(domains)){
            ret = domains;
        }
        // format all domain
        let res = [];
        (ret||[]).forEach((dm) => {
            if (dm){
                let dm = this[formatDomain](dm);
                if (dm) res.push(dm);
            }
        });
        // check domain list
        if (!res.length){
            return def;
        }
        return res;
    }

    /**
     * format boolean value
     *
     * @param  {String}  value - config value
     * @return {Boolean} boolean value,'true' -> true; 0/false/null/undefined will be false
     */
    [formatBoolean](value) {
        if (typeof value==='string'){
            return value.toLowerCase()==='true';
        }
        return !!value;
    }

    /**
     * format number value
     *
     * @param  {String|Number} value - config value
     * @param  {Number} low  - lower value
     * @param  {Number} high - higher value
     * @param  {Number} def  - default value
     * @return {Number} number after format
     */
    [formatNumber](value, low, high, def){
        value = parseInt(value,10);
        if (isNaN(value)||value<low||value>high){
            value = def;
        }
        return value;
    }

    /**
     * format regexp value
     *
     * @param  {String|RegExp} value - config value
     * @param  {String=} mode - test mode, "i" and "g" flag setting
     * @return {RegExp} regexp after format
     */
    [formatRegExp](value, mode){
        if (value instanceof RegExp){
            return value;
        }
        if (!!value&&typeof value==='string'){
            return new RegExp(value, mode||'');
        }
    }

    /**
     * format parameter in path
     *
     * @param  {String} value - path value
     * @return {String} path after parameter format
     */
    [formatPathVar](value){
        let time = new Date();
        return (value||'').replace(/\[(.+?)]/gi, ($1, $2) => {
            if ($2.toLowerCase()==='timestamp'){
                return +time;
            }
            return dt.format(time, $2);
        });
    }

    /**
     * format core list in config file
     *
     * @param  {String|Array} value - core list config
     * @return {Array} core list
     */
    [formatCoreList](value){
        if (!value){
            return null;
        }
        if (Array.isArray(value)){
            return value;
        }
        // for json string
        let list = this[formatJSONObj](value);
        if (Array.isArray(list)){
            return list;
        }
        // for file path
        let file = _util.absolute(
            this.get('DIR_CONFIG'), value
        );
        try{
            list = require(file);
        }catch(ex){
            // ignore
        }
        if (Array.isArray(list)){
            return list;
        }
    }

    /**
     * format json string to json object
     *
     * @param  {String} value - json string
     * @return {Object} json object
     */
    [formatJSONObj](value){
        if (typeof value==='string'){
            try{
                return JSON.parse(value);
            }catch(ex){
                // ignore
                value = null;
            }
        }
        return value;
    }

}
// export config parser
module.exports = Parser;