<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>NEJ Module Sample - 前端实例</title>
    <link href="${css_root}template.css" rel="stylesheet" type="text/css"/>
    <link href="${css_root}app.css" rel="stylesheet" type="text/css"/>
  </head>
  <body id="www-wd-com">
  
    <div class="g-doc">
      <div class="g-hd">
        <h1 class="m-logo">网易-杭研院-前端技术组-实例库</h1>
        <h2 class="m-title">NEJ Module Sample</h2>
      </div>
      <div class="g-bd" id="module-box"></div>
      <div class="g-bd">
        <div class="m-foot">
        	如有任何问题，请联系：蔡剑飞(<a href="mailto:caijf@corp.netease.com">caijf@corp.netease.com</a>)
        </div>
      </div>
      <div class="g-ft">
        <div class="m-foot">
        	&nbsp;&copy;&nbsp;网易-杭研院-前端技术组
        </div>
      </div>
    </div>
    
    <div id="template-box" style="display:none;">
      <!-- @TEMPLATE -->
      <textarea name="html" data-src="module/tab/index.html"></textarea>
      <textarea name="html" data-src="module/layout/system/index.html"></textarea>
      <textarea name="html" data-src="module/layout/blog/index.html"></textarea>
      <textarea name="html" data-src="module/layout/blog.list/index.html"></textarea>
      <textarea name="html" data-src="module/layout/setting/index.html"></textarea>
      <textarea name="html" data-src="module/layout/setting.account/index.html"></textarea>
      <textarea name="html" data-src="module/blog/tag/index.html"></textarea>
      <!-- /@TEMPLATE -->
      <!-- @MODULE -->
      <textarea name="html" data-src="module/blog/tab/index.html"></textarea>
      <textarea name="html" data-src="module/blog/list.box/index.html"></textarea>
      <textarea name="html" data-src="module/blog/list.tag/index.html"></textarea>
      <textarea name="html" data-src="module/blog/list/index.html"></textarea>
      <textarea name="html" data-src="module/setting/tab/index.html"></textarea>
      <textarea name="html" data-src="module/setting/account.tab/index.html"></textarea>
      <!-- /@MODULE -->
    </div>
    
    <!-- @IGNORE -->
    <script src="/src/javascript/cache/tag.data.js"></script>
    <script src="/src/javascript/cache/blog.data.js"></script>
    <!-- /@IGNORE -->
    
    <!-- @VERSION -->
    <script>location.config={root:'/src/html/'};</script>

    <script src="${lib_root}define.js?pro=${pro_root}"></script>
    <script src="${pro_root}page/app.js"></script>
  </body>
</html>