const fs = require('node:fs');
const path = require('node:path');
function buildModel(root) {
  const pages={},assets={};
  for(const name of fs.readdirSync(root).filter(n=>n.endsWith('.html'))) {
    const source=fs.readFileSync(path.join(root,name),'utf8');
    const head=source.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1]||'';
    const body=source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]||'';
    pages[name]={title:head.match(/<title>(.*?)<\/title>/i)?.[1]||name,head,body:body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,''),bodyStyle:''};
    for(const match of body.matchAll(/<img[^>]+src="([^"]+)"/g)) {
      const relative=match[1],file=path.resolve(root,relative);
      if(!file.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(file))continue;
      const type={'.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'}[path.extname(file)];
      if(type)assets[relative]='data:'+type+';base64,'+fs.readFileSync(file).toString('base64');
    }
  }
  return {version:1,pages,assets,fonts:[],css:fs.readFileSync(path.join(root,'styles.css'),'utf8'),siteJS:fs.readFileSync(path.join(root,'site.js'),'utf8')};
}
function validModel(value) {
  return value&&value.version===1&&typeof value.css==='string'&&typeof value.siteJS==='string'&&Array.isArray(value.fonts)&&value.assets&&typeof value.assets==='object'&&value.pages?.['index.html']&&Object.entries(value.pages).every(([name,p])=>/^[a-z0-9-]+\.html$/.test(name)&&typeof p.head==='string'&&typeof p.body==='string'&&typeof p.title==='string')&&value.fonts.every(f=>typeof f.name==='string'&&typeof f.url==='string'&&/^[\w \-]{1,60}$/.test(f.name)&&f.url.startsWith('data:'));
}
module.exports={buildModel,validModel};
