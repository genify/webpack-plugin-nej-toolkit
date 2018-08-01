let fs = require('fs');
let expect = require('chai').expect;
let CFGParser = require('../../../src/parser/Config.js');

describe('CFGParser', () => {

    describe('new CFGParser', () => {

        it('should be ok to instance CFGParser without config file', (done) => {
            new CFGParser({
                error: (e) => {
                    console.error(e.message);
                },
                warn: (e) => {
                    console.warn(e.message);
                },
                info: (e) => {
                    console.info(e.message);
                },
                debug: (e) => {
                    console.debug(e.message);
                },
                done: (e) => {
                    console.info(e.message);
                    done();
                }
            });
        });

        it('should be ok to instance CFGParser with config file', (done) => {
            new CFGParser({
                config: __dirname+'/release.conf',
                error: (e) => {
                    console.error(e.message);
                },
                warn: (e) => {
                    console.warn(e.message);
                },
                info: (e) => {
                    console.info(e.message);
                },
                debug: (e) => {
                    console.debug(e.message);
                },
                done: (e) => {
                    console.info(e.message);
                    done();
                }
            });
        });

    });

    describe('check config field', () => {

        let keys = [
            'DIR_CONFIG','DIR_WEBROOT',
            'DIR_SOURCE','DIR_SOURCE_SUB',
            'DIR_SOURCE_TP','DIR_SOURCE_TP_SUB'
        ];
        let matchFiles = function(reg){
            expect('/home/user/app/a.html').to.match(reg);
            expect('/home/user/app/a.ftl').to.match(reg);
            expect('/home/user/app/a.vm').to.match(reg);
            expect('/home/user/app/a.js').to.not.match(reg);
            expect('/home/user/app/a.css').to.not.match(reg);
        };
        let cases = [
            {
                desc: 'should emit error when config file not exist',
                config: __dirname+'/config.json',
                done: (self) => {
                    expect(keys).to.include.members(self.errors);
                }
            },
            {
                desc: 'should emit error when DIR_WEBROOT not exist',
                config: {DIR_WEBROOT:__dirname+'/1'},
                done: (self) => {
                    fs.rmdirSync(__dirname+'/1');
                    expect(keys).to.include.members(self.errors);
                }
            },
            {
                desc: 'should emit error when no input',
                config: {DIR_WEBROOT:__dirname+'/2'},
                done: (self) => {
                    fs.rmdirSync(__dirname+'/2');
                    expect(keys).to.include.members(self.errors);
                }
            },
            {
                desc: 'should compatible with ALIAS_START_TAG/ALIAS_END_TAG',
                config: {ALIAS_START_TAG:'{{',ALIAS_END_TAG:'}}'},
                done: (self) => {
                    var v = '{{config_lib_root}}define.js?pro={{pro_root}}'.replace(
                        self.get('ALIAS_MATCH'),($1,$2) => {
                            return $2;
                        }
                    );
                    expect(v).to.equal('config_lib_rootdefine.js?pro=pro_root');
                }
            },
            {
                desc: 'should be ok when set ALIAS_MATCH with type of string',
                config: {ALIAS_MATCH : '\\{\\{(.*?)\\}\\}'},
                done: (self) => {
                    var v = '{{config_lib_root}}define.js?pro={{pro_root}}'.replace(
                        self.get('ALIAS_MATCH'),($1,$2) => {
                            return $2;
                        }
                    );
                    expect(v).to.equal('config_lib_rootdefine.js?pro=pro_root');
                }
            },
            {
                desc: 'should be ok when set ALIAS_MATCH with type of regexp',
                config: {ALIAS_MATCH:/\{\{(.*?)\}\}/gi},
                done: (self) => {
                    var v = '{{config_lib_root}}define.js?pro={{pro_root}}'.replace(
                        self.get('ALIAS_MATCH'), ($1,$2) => {
                            return $2;
                        }
                    );
                    expect(v).to.equal('config_lib_rootdefine.js?pro=pro_root');
                }
            },
            {
                desc: 'should compatible with FILE_SUFFIXE',
                config: {FILE_SUFFIXE:'html|ftl|vm'},
                done: (self) => {
                    matchFiles(self.get('FILE_FILTER'));
                }
            },
            {
                desc: 'should be ok when set FILE_FILTER with type of string',
                config: {FILE_FILTER:'\\.(?:html|ftl|vm)$'},
                done: (self) => {
                    matchFiles(self.get('FILE_FILTER'));
                }
            },
            {
                desc: 'should be ok when set FILE_FILTER with type of regexp',
                config: {FILE_FILTER:/\.(?:html|ftl|vm)$/i},
                done: (self) => {
                    matchFiles(self.get('FILE_FILTER'));
                }
            },
            {
                desc: 'should compatible with NAME_SUFFIX',
                config: {NAME_SUFFIX:'v2'},
                done: (self) => {
                    expect(self.get('VERSION_MODE')).to.equal('[FILENAME]_v2');
                }
            },
            {
                desc: 'should compatible with RAND_VERSION',
                config: {RAND_VERSION:true},
                done: (self) => {
                    expect(self.get('VERSION_MODE')).to.equal(1);
                }
            },
            {
                desc: 'should compatible with STATIC_VERSION',
                config: {STATIC_VERSION:true},
                done: (self) => {
                    expect(self.get('VERSION_STATIC')).to.be.true;
                }
            },
            {
                desc: 'should compatible with X_NOCORE_STYLE',
                config: {X_NOCORE_STYLE:true},
                done: (self) => {
                    expect(self.get('CORE_MERGE_FLAG')).to.equal(1);
                }
            },
            {
                desc: 'should compatible with X_NOCORE_SCRIPT',
                config: {X_NOCORE_SCRIPT:true},
                done: (self) => {
                    expect(self.get('CORE_MERGE_FLAG')).to.equal(2);
                }
            },
            {
                desc: 'should compatible with X_NOCORE_STYLE/X_NOCORE_SCRIPT',
                config: {X_NOCORE_STYLE:true,X_NOCORE_SCRIPT:true},
                done: (self) => {
                    expect(self.get('CORE_MERGE_FLAG')).to.equal(3);
                }
            },
            {
                desc: 'should compatible with X_MODULE_WRAPPER',
                config: {X_MODULE_WRAPPER:'<#noparse>%s</#noparse>'},
                done: (self) => {
                    expect(self.get('WRP_INLINE_SOURCE')).to.equal('<#noparse>%s</#noparse>');
                }
            },
            {
                desc: 'should compatible with X_SCRIPT_WRAPPER',
                config: {X_SCRIPT_WRAPPER:'<#noparse>%s</#noparse>'},
                done: (self) => {
                    expect(self.get('WRP_INLINE_SOURCE')).to.equal('<#noparse>%s</#noparse>');
                }
            },
            {
                desc: 'should compatible with DM_STATIC_MF',
                config: {DM_STATIC_MF:'/pub/'},
                done: (self) => {
                    expect(self.get('MANIFEST_ROOT')).to.equal('/pub/');
                }
            }
        ];

        cases.forEach((opt) => {
            it(opt.desc, (done) => {
                let inst;
                let func = opt.done;
                opt.done = () => {
                    process.nextTick(()=>{
                        func.call(null, inst);
                        done();
                    });
                };
                inst = new CFGParser(opt);
            });
        });
    });

});


