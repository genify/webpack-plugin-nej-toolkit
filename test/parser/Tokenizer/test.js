let expect = require('chai').expect;
let fs = require('fs');
let Tokenizer = require('../../../src/parser/Tokenizer.js');

describe('Tokenizer',() => {

    let cases = [
        {
            code:'<a "hidefocus"="true"/>',
            result:{name:'a',attrs:{'"hidefocus"':'true'},closed:!1,selfClosed:!0}
        },{
            code:"<def abc'ghi=123>",
            result:{name:"def",closed:!1,selfClosed:!1,attrs:{"abc'ghi":"123"}}
        },{
            code:"<def'>",
            result:{name:"def'",closed:!1,selfClosed:!1}
        },{
            code:"<def'a bc'>",
            result:{name:"def'a",closed:!1,selfClosed:!1,attrs:{"bc'":''}}
        },{
            code:'<img src="/a.png" alt="test\\"abc">',
            result:{name:'img',attrs:{src:'/a.png',alt:'test\\"abc'},closed:!1,selfClosed:!1}
        },{
            code:'<img src="/a.png" alt=\'test"abc\'>',
            result:{name:'img',attrs:{src:'/a.png',alt:'test"abc'},closed:!1,selfClosed:!1}
        },{
            code:'<a href = "/res/loading.gif" title = "a = zbc & b =c ">',
            result:{name:'a',attrs:{href:'/res/loading.gif',title:'a = zbc & b =c '},closed:!1,selfClosed:!1}
        },{
            code:'<img src = "/res/loading.gif" />',
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
        },{
            code:'<img alt="" src="../../res/image/loading.gif" class="test">',
            result:{name:'img',closed:!1,selfClosed:!1,attrs:{src:'../../res/image/loading.gif',alt:'',class:'test'}}
        },{
            code:'<def"abc">',
            result:{name:'def"abc"',closed:!1,selfClosed:!1,attrs:{}}
        },{
            code:"<def'abc'>",
            result:{name:"def'abc'",closed:!1,selfClosed:!1,attrs:{}}
        },{
            code:'<#assign a = b + c />',
            result:{name:'#assign',closed:!1,selfClosed:!0,attrs:{a:'b','+':'',c:''}}
        },{
            code:'<@topbar title="title!\\"中文\\""/>',
            result:{name:'@topbar',closed:!1,selfClosed:!0,attrs:{title:'title!\\"中文\\"'}}
        }
    ];

    describe('new Tokenizer',() => {

        let dumpFirst = function(list, type) {
            return list.find((it) => {
                if (!type||it.type===type){
                    return true;
                }
            });
        };

        cases.forEach(function(config){
            config.type = config.type||'tag';
            config.result.source = config.code;
            it('should return '+JSON.stringify(config.result)+' for parse '+config.type+': '+config.code,function(){
                // do tokenizer
                //let opt = {},ret;
                //opt[config.type] = function(e){ret = e;};
                let tokenizer = new Tokenizer({
                    content: config.code
                });
                let ret = (dumpFirst(tokenizer.result,config.type)||{}).data;
                // check result
                let r = config.result;
                if (!!r.attrs){
                    expect(ret.attrs).to.eql(r.attrs);
                }
                delete r.attrs;
                delete ret.attrs;
                expect(ret).to.eql(r);
            });
        });

        let _doTestFromFile = function(file){
            let ret = {tag:[],text:[],comment:[]};
            new Tokenizer(
                {
                    content:fs
                        .readFileSync(__dirname+'/'+file,'utf-8')
                        .split(/\r\n|\r|\n/).join('\n'),
                    tag:function(event){
                        ret.tag.push(event);
                        //let source = event.source;
                        //delete event.source;
                        //console.log('TAG: %s -> %j',source,event);
                    },
                    text:function(event){
                        ret.text.push(event);
                        //console.log('TEXT -> %j',event);
                    },
                    comment:function(event){
                        ret.comment.push(event);
                        //console.log('COMMENT -> %j',event);
                    }
                }
            );
            return ret;
        };
        // it('should be ok for parsing html file',function(){
        // _doTestFromFile('a.html');
        // });
        // it('should be ok for parsing freemarker file',function(){
        // _doTestFromFile('a.ftl');
        // });
        it('should be ok for parsing script with tag',function(){
            let ret = _doTestFromFile('b.html');
            // beg script
            let tag = ret.tag.shift();
            expect(tag.name).to.equal('script');
            // end script
            tag = ret.tag.pop();
            expect(tag.name).to.equal('script');
            expect(tag.closed).to.be.true;
        });
        it('should be ok for parsing textarea with content',function(){
            let ret = _doTestFromFile('c.html');
            // beg textarea
            let tag = ret.tag.shift();
            expect(tag.name).to.equal('textarea');
            expect(tag.attrs).to.eql({name:"jst",id:"#<seedDate>"});
            // end textarea
            tag = ret.tag.pop();
            expect(tag.name).to.equal('textarea');
            expect(tag.closed).to.be.true;
        });
        it('should be ok for parsing conditional comments',function(){
            let ret = _doTestFromFile('d.html');
            expect(ret.comment.length).to.equal(1);
            expect(ret.comment[0].comment.trim()).to.equal('Comment content');
        });
    });

});



