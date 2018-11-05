/*
 * Config Constant
 *
 * @author caijf(genify@163.com)
 */
module.exports = {
    /**
     * core file merge strategy for auto
     *
     * @type {Number}
     */
    CORE_MERGE_FLAG_AUTO: 0,
    /**
     * core file merge strategy for merge style by page
     *
     * @type {Number}
     */
    CORE_MERGE_FLAG_EXCLUDE_STYLE: 1,
    /**
     * core file merge strategy for merge script by page
     *
     * @type {Number}
     */
    CORE_MERGE_FLAG_EXCLUDE_SCRIPT: 2,
    /**
     * core file merge strategy for merge style/script by page
     *
     * @type {Number}
     */
    CORE_MERGE_FLAG_EXCLUDE_ALL: 3,
    /**
     * not parse inline resource flag by deploy tag in page
     *
     * @type {Number}
     */
    CORE_NOPARSE_FLAG_AUTO: 0,
    /**
     * not parse inline resource flag for all style
     *
     * @type {Number}
     */
    CORE_NOPARSE_FLAG_STYLE: 1,
    /**
     * not parse inline resource flag for all script
     *
     * @type {Number}
     */
    CORE_NOPARSE_FLAG_SCRIPT: 2,
    /**
     * not parse inline resource flag for all
     *
     * @type {Number}
     */
    CORE_NOPARSE_FLAG_ALL: 3
};