let fs = require('fs');
let expect = require('chai').expect;
let Tagger = require('../../../src/parser/Tagger.js');
    
describe('Tagger',function(){

    let cases = [
        {
            code:'<img src="/res/loading.gif"/>',
            result:{name:'img',attrs:{src:'/res/loading.gif'},closed:!1,selfClosed:!0}
        },{
            code:'<!DOCTYPE html>',
            result:{name:'!DOCTYPE',attrs:{html:''},closed:!1,selfClosed:!1}
        },{
            code:'<html>',
            result:{name:'html',closed:!1,selfClosed:!1}
        },{
            code:'<meta charset="utf-8"/>',
            result:{name:'meta',attrs:{charset:'utf-8'},closed:!1,selfClosed:!0}
        },{
            type:'comment',
            code:'<!-- @STYLE -->',
            result:{comment:' @STYLE '}
        },{
            code:'<link href="../css/template.css" rel="stylesheet" type="text/css"/>',
            result:{name:'link',attrs:{href:'../css/template.css',rel:'stylesheet',type:'text/css'},closed:!1,selfClosed:!0}
        },{
            code:'<textarea name="html" data-src="module/tab/index.html">',
            result:{name:'textarea',attrs:{name:'html','data-src':'module/tab/index.html'},closed:!1,selfClosed:!1}
        },{
            code:'</script>',
            result:{name:'script',closed:!0,selfClosed:!1}
        },{
            code:'<a hidefocus>',
            result:{name:'a',attrs:{hidefocus:''},closed:!1,selfClosed:!1}
        },{
            code:'<a hidefocus/>',
            result:{name:'a',attrs:{hidefocus:''},closed:!1,selfClosed:!0}
        },{
            code:'<a hidefocus="true">',
            result:{name:'a',attrs:{hidefocus:'true'},closed:!1,selfClosed:!1}
        },{
            code:'<a hidefocus="true"/>',
            result:{name:'a',attrs:{hidefocus:'true'},closed:!1,selfClosed:!0}
        },{
            code:'<#escape x as x?html>',
            result:{name:'#escape',attrs:{x:'',as:'','x?html':''},closed:!1,selfClosed:!1}
        },{
            code:'<#include "../../wrap/3g.common.ftl">',
            result:{name:'#include',attrs:{'"../../wrap/3g.common.ftl"':''},closed:!1,selfClosed:!1}
        },{
            code:'<#if category??&&category?size&gt;0>',
            result:{name:'#if',attrs:{'category??&&category?size&gt;0':''},closed:!1,selfClosed:!1}
        },{
            code:'</#list>',
            result:{name:'#list',closed:!0,selfClosed:!1}
        }
    ];

    describe('.stringify(tag)',function(){
        cases.forEach(function(config){
            if (config.type==='comment'){
                return;
            }
            it('should return '+config.code+' for stringify '+JSON.stringify(config.result),function(){
                let ret = Tagger.stringify(config.result);
                expect(ret).to.eql(config.code);
            });
        });
    });


    describe('new Tagger',function(){
        let _doTestFromFile = function(file){
            let ret = {style:[],script:[],textarea:[],instr:[]};
            ret.inst = new Tagger(
                {
                    content:fs.readFileSync(__dirname+'/'+file,'utf-8'),
                    style:function(event){
                        ret.style.push(event);
                        //console.log('STYLE\n%j\n%j',event.config,event.source);
                    },
                    script:function(event){
                        ret.script.push(event);
                        //console.log('SCRIPT\n%j\n%j',event.config,event.source);
                    },
                    textarea:function(event){
                        ret.textarea.push(event);
                        //console.log('TEXTAREA\n%j\n%j',event.config,event.source);
                    },
                    instruction:function(event){
                        ret.instr.push(event);
                        //console.log('INSTRUCTION\n%s\n%j',event.command,event.config);
                    }
                }
            );
            return ret;
        };
        it('should be ok for parsing html file',function(){
            let ret = _doTestFromFile('a.html');
            // check style
            expect(ret.style[0].config.href).to.equal('../css/template.css');
            expect(ret.style[1].config.href).to.equal('../css/app.css');
            // check script
            expect(ret.script[0].source).not.be.empty;
            expect(ret.script[1].config.src).to.equal('../javascript/cache/tag.data.js');
            expect(ret.script[2].config.src).to.equal('../javascript/cache/blog.data.js');
            expect(ret.script[3].source).not.be.empty;
            expect(ret.script[4].config.src).to.equal('http://nej.netease.com/nej/src/define.js');
            expect(ret.script[5].source).not.be.empty;
            // check textarea
            expect(ret.textarea[0].config).to.eql({name:"html","data-src":"module/tab/index.html"});
            expect(ret.textarea[1].config).to.eql({name:"html","data-src":"module/layout/system/index.html"});
            expect(ret.textarea[2].config).to.eql({name:"html","data-src":"module/layout/blog/index.html"});
            expect(ret.textarea[3].config).to.eql({name:"html","data-src":"module/layout/blog.list/index.html"});
            expect(ret.textarea[4].config).to.eql({name:"html","data-src":"module/layout/setting/index.html"});
            expect(ret.textarea[5].config).to.eql({name:"html","data-src":"module/layout/setting.account/index.html"});
            // check instruction
            //ret.instr.should.eql([{"closed":false,"command":"STYLE","config":{"core":false}},{"closed":false,"command":"TEMPLATE"},{"closed":true,"command":"TEMPLATE"},{"closed":false,"command":"MODULE"},{"closed":true,"command":"MODULE"},{"closed":false,"command":"IGNORE"},{"closed":true,"command":"IGNORE"},{"closed":false,"command":"VERSION"},{"closed":false,"command":"DEFINE","config":{"inline":true}}]);
        });
        it('should be ok for parsing freemarker file',function(){
            var ret = _doTestFromFile('a.ftl');
            // check style
            expect(ret.style[0].config.href).to.equal('/src/css/page/schedule.css');
            // check script
            expect(ret.script[0].source).to.not.be.empty;
            expect(ret.script[1].config.src).to.equal('${jslib}define.js?${jscnf}');
            expect(ret.script[2].config.src).to.equal('${jspro}page/schedule/schedule.js');
            // check textarea
            expect(ret.textarea[0].config).to.eql({"name":"txt","id":"product-loading"});
            expect(ret.textarea[0].source).not.be.empty;
            expect(ret.textarea[1].config).to.eql({"name":"jst","id":"product-list"});
            expect(ret.textarea[1].source).to.not.be.empty;
            // check instruction
            expect(ret.instr).to.be.empty;
        });
    });
});
