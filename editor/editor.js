(() => {
  'use strict';
  const root = document.getElementById('mnerva-editor');
  const config = window.mnervaEditorBootstrap;
  const clone = value => JSON.parse(JSON.stringify(value));
  let model = clone(config.model), page = 'index.html', selected = null, editing = true;
  const history = [], future = [];
  const q = id => root.querySelector('#ed-' + id);
  const canvas = q('canvas'), shadow = canvas.attachShadow({mode:'open'});
  const style = document.createElement('style'), surface = document.createElement('div');
  surface.className = 'site-surface';
  shadow.append(style, surface);
  const message = text => {q('status').textContent = text;};
  const title = el => el === surface ? 'Page background' : el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ' — ' + (el.textContent.trim().replace(/\s+/g,' ').slice(0,60) || el.getAttribute('alt') || el.className || 'empty');
  function cleanHTML() {
    const copy = surface.cloneNode(true);
    copy.querySelectorAll('[data-ed-id],[data-ed-selected]').forEach(el => {el.removeAttribute('data-ed-id');el.removeAttribute('data-ed-selected');});
    copy.querySelectorAll('[data-ed-src]').forEach(el => {el.setAttribute('src',el.getAttribute('data-ed-src'));el.removeAttribute('data-ed-src');});
    copy.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
    copy.querySelectorAll('script').forEach(el => el.remove());
    return copy.innerHTML;
  }
  function capture() {
    model.pages[page].body = cleanHTML();
    model.pages[page].bodyStyle = surface.getAttribute('style') || '';
  }
  function checkpoint() {capture();history.push(clone(model));if(history.length>35)history.shift();future.length=0;}
  function changed(text='Unsaved changes.') {capture();q('undo').disabled=!history.length;q('redo').disabled=!future.length;message(text);}
  function cssForCanvas() {
    const css=model.css.replace(/:root/g,':host').replace(/\bbody\b/g,'.site-surface').replace(/html\.js/g,'.js').replace(/\bhtml\b/g,':host').replace(/@media\s*(\((?:min|max)-width[^{}]+)\{/g,'@container mn-site $1{').replace(/([\d.]+)vw\b/g,'$1cqw');
    return ':host{container-type:inline-size;container-name:mn-site}\n'+css + '\n' + fontCSS() + '\n.site-surface{min-width:0}.site-surface img{max-width:100%}.site-surface[data-editing] [data-ed-selected]{outline:2px solid #8860bd;outline-offset:4px}.site-surface[data-editing] [data-ed-id]:hover{outline:1px dashed #9a91ad;outline-offset:2px}';
  }
  function fontCSS() {return model.fonts.map(f=>'@font-face{font-family:"'+f.name+'";src:url("'+f.url+'");font-display:swap}').join('\n');}
  function populatePages() {
    q('page').replaceChildren(...Object.entries(model.pages).map(([name,p])=>new Option(name==='index.html'?'Home':new DOMParser().parseFromString(p.title.replace(/\s*\|.*$/,''),'text/html').body.textContent,name)));
    q('page').value=page;
  }
  function populateFonts() {
    const names=['Default','Georgia','Times New Roman','Palatino','Baskerville','Garamond','Arial','Helvetica',...model.fonts.map(f=>f.name)];
    q('font').replaceChildren(...names.map(name=>new Option(name,name==='Default'?'':name)));
  }
  function refreshTree() {
    const elements=[surface,...surface.querySelectorAll('*')].filter(el=>!['SCRIPT','STYLE','BR'].includes(el.tagName));
    q('element').replaceChildren(...elements.map((el,i)=>{el.dataset.edId=String(i);return new Option(title(el),String(i));}));
    q('destination').replaceChildren(...elements.map((el,i)=>new Option(title(el),String(i))));
    q('sections').replaceChildren();
    surface.querySelectorAll('main > section').forEach(section=>{
      const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.textContent=title(section);button.draggable=true;
      button.addEventListener('click',()=>select(section));
      button.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',section.dataset.edId));
      button.addEventListener('dragover',e=>e.preventDefault());
      button.addEventListener('drop',e=>{e.preventDefault();const moving=element(e.dataTransfer.getData('text/plain'));if(moving&&moving!==section&&!moving.contains(section)){checkpoint();section.before(moving);refreshTree();select(moving);changed('Section order changed.');}});
      li.append(button);q('sections').append(li);
    });
  }
  function element(id){return id==='0'?surface:surface.querySelector('[data-ed-id="'+String(id).replace(/[^0-9]/g,'')+'"]');}
  function render() {
    selected=null;style.textContent=cssForCanvas();
    surface.innerHTML=model.pages[page].body;
    surface.querySelectorAll('script').forEach(el=>el.remove());
    surface.setAttribute('style',model.pages[page].bodyStyle || '');
    surface.querySelectorAll('img').forEach(img=>{const src=img.getAttribute('src');if(model.assets[src]){img.setAttribute('data-ed-src',src);img.src=model.assets[src];}});
    if(editing)surface.setAttribute('data-editing','');else surface.removeAttribute('data-editing');
    populatePages();populateFonts();refreshTree();select(surface.querySelector('h1')||surface);
    q('css').value=model.css;q('undo').disabled=!history.length;q('redo').disabled=!future.length;
  }
  function select(el) {
    if(!el)return;
    surface.querySelectorAll('[data-ed-selected]').forEach(n=>n.removeAttribute('data-ed-selected'));surface.removeAttribute('data-ed-selected');
    selected=el;el.setAttribute('data-ed-selected','');q('element').value=el.dataset.edId;
    const computed=getComputedStyle(el), hasChildren=!!el.children.length;
    q('text').value=el.innerText || el.textContent || '';q('text').disabled=hasChildren&&!['H1','H2','H3','H4','P','A','BUTTON','SPAN','LABEL'].includes(el.tagName);
    q('apply-text').disabled=q('text').disabled;
    q('html').value=el===surface?el.innerHTML:el.outerHTML;
    q('href').value=el.getAttribute('href')||'';q('href').disabled=el.tagName!=='A';
    q('alt').value=el.getAttribute('alt')||'';q('alt').disabled=el.tagName!=='IMG';
    const fields={'size':'font-size','line':'line-height','spacing':'letter-spacing','padding':'padding','margin':'margin','width':'width','max-width':'max-width','min-height':'min-height','columns':'grid-template-columns','gap':'gap','position':'background-position'};
    for(const [id,prop]of Object.entries(fields))q(id).value=el.style.getPropertyValue(prop);
    q('font').value=el.style.fontFamily.replace(/^["']|["']$/g,'');q('weight').value=el.style.fontWeight;q('align').value=el.style.textAlign;q('display').value=el.style.display;
    q('color').value=toHex(computed.color);q('background').value=toHex(computed.backgroundColor);
    q('up').disabled=el===surface||!el.previousElementSibling;q('down').disabled=el===surface||!el.nextElementSibling;
    q('delete').disabled=el===surface;q('duplicate').disabled=el===surface;
  }
  function toHex(color){const n=color.match(/[\d.]+/g);if(!n||n.length<3)return '#ffffff';return '#'+n.slice(0,3).map(v=>Math.round(Number(v)).toString(16).padStart(2,'0')).join('');}
  surface.addEventListener('click',event=>{
    const el=event.target;if(!(el instanceof Element))return;
    const a=el.closest('a');
    if(editing){event.preventDefault();select(el);if(window.innerWidth<=700)root.querySelector('.ed-inspector').scrollIntoView({block:'start'});}
    else if(a){event.preventDefault();const target=(a.getAttribute('href')||'').split(/[?#]/)[0];if(model.pages[target]){capture();page=target;render();}}
  });
  surface.addEventListener('submit',e=>{e.preventDefault();message('Forms are disabled in the editor preview.');});
  q('element').addEventListener('change',()=>select(element(q('element').value)));
  q('view-selection').addEventListener('click',()=>selected?.scrollIntoView({block:'center'}));
  q('open-controls').addEventListener('click',()=>root.querySelector('.ed-inspector').scrollIntoView({block:'start'}));
  q('parent').addEventListener('click',()=>{if(selected?.parentElement&&selected!==surface)select(selected.parentElement);});
  q('page').addEventListener('change',()=>{capture();page=q('page').value;render();message('Select an element on the page to edit it.');});
  q('mode').addEventListener('click',()=>{editing=!editing;q('mode').textContent=editing?'Preview':'Edit';surface.toggleAttribute('data-editing',editing);message(editing?'Select an element on the page to edit it.':'Preview mode. Page links are active.');});
  q('apply-text').addEventListener('click',()=>{
    if(!selected||q('text').disabled)return;checkpoint();selected.replaceChildren();
    q('text').value.split('\n').forEach((line,i)=>{if(i)selected.append(document.createElement('br'));selected.append(document.createTextNode(line));});
    refreshTree();select(selected);changed();
  });
  const props={'size':'font-size','weight':'font-weight','line':'line-height','spacing':'letter-spacing','align':'text-align','color':'color','background':'background-color','padding':'padding','margin':'margin','width':'width','max-width':'max-width','min-height':'min-height','display':'display','columns':'grid-template-columns','gap':'gap','position':'background-position'};
  for(const [id,prop]of Object.entries(props))q(id).addEventListener('change',()=>{
    if(!selected)return;const value=q(id).value.trim();if(value&&!CSS.supports(prop,value)){message('That value is not valid for '+prop+'.');return;}checkpoint();selected.style.setProperty(prop,value);changed();
  });
  q('href').addEventListener('change',()=>{if(selected?.tagName==='A'){const href=q('href').value.trim();if(/^javascript:/i.test(href)){message('Use a page path or web address.');return;}checkpoint();selected.setAttribute('href',href);changed();}});
  q('alt').addEventListener('change',()=>{if(selected?.tagName==='IMG'){checkpoint();selected.alt=q('alt').value;changed();}});
  function applyFont(){
    if(!selected)return;checkpoint();const font=q('font').value,scope=q('font-scope').value;
    if(scope==='element')selected.style.fontFamily=font?'"'+font+'"':'';
    else {const variable=scope==='headings'?'--mn-serif':'--mn-sans';model.css+='\n:root{'+variable+':"'+font+'",'+(scope==='headings'?'serif':'sans-serif')+'}\n';style.textContent=cssForCanvas();}
    changed();
  }
  q('apply-font').addEventListener('click',applyFont);
  q('font').addEventListener('change',()=>{if(q('font-scope').value==='element')applyFont();});
  const readFile=file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not read file.'));reader.readAsDataURL(file);});
  q('upload-font').addEventListener('click',async()=>{
    const file=q('font-file').files[0],name=q('font-name').value.trim();
    if(!file||!name){message('Choose a font file and enter a name.');return;}
    if(!/^[\w \-]{1,60}$/.test(name)||!/\.(woff2?|ttf|otf)$/i.test(file.name)){message('Use a font file and a name containing letters, numbers, spaces or hyphens.');return;}
    if(file.size>15*1024*1024){message('Choose a font smaller than 15 MB.');return;}
    try{const url=await readFile(file);checkpoint();model.fonts=model.fonts.filter(f=>f.name!==name);model.fonts.push({name,url});populateFonts();q('font').value=name;style.textContent=cssForCanvas();changed('Font added. Select where to apply it, then choose Apply font.');}catch(e){message(e.message);}
  });
  q('upload-image').addEventListener('click',async()=>{
    const file=q('image-file').files[0],target=selected;if(!file||!target){message('Select an element and choose an image.');return;}
    if(!/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type)||file.size>20*1024*1024){message('Use a PNG, JPG, WebP, GIF or AVIF image under 20 MB.');return;}
    try{const url=await readFile(file);checkpoint();if(target.tagName==='IMG'){target.removeAttribute('data-ed-src');target.src=url;}else{target.style.backgroundImage='url("'+url+'")';target.style.backgroundSize=q('fit').value;target.style.backgroundPosition=q('position').value||'center';target.style.backgroundRepeat='no-repeat';}changed('Image applied.');}catch(e){message(e.message);}
  });
  q('fit').addEventListener('change',()=>{if(selected){checkpoint();selected.style.backgroundSize=q('fit').value;changed();}});
  q('clear-background').addEventListener('click',()=>{if(selected){checkpoint();selected.style.backgroundImage='none';changed();}});
  for(const direction of ['up','down'])q(direction).addEventListener('click',()=>{
    if(!selected||selected===surface)return;const sibling=direction==='up'?selected.previousElementSibling:selected.nextElementSibling;if(!sibling)return;checkpoint();if(direction==='up')sibling.before(selected);else sibling.after(selected);refreshTree();select(selected);changed();
  });
  q('duplicate').addEventListener('click',()=>{if(!selected||selected===surface)return;checkpoint();const copy=selected.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));selected.after(copy);refreshTree();select(copy);changed();});
  q('delete').addEventListener('click',()=>{if(!selected||selected===surface)return;checkpoint();const parent=selected.parentElement;selected.remove();refreshTree();select(parent);changed('Element removed. Undo restores it.');});
  function move(inside){const target=element(q('destination').value);if(!selected||selected===surface||!target||selected===target||selected.contains(target)||(!inside&&target===surface)){message('Choose a destination outside the selected element.');return;}if(inside&&['IMG','INPUT','BR','HR','SELECT','TEXTAREA'].includes(target.tagName)){message('Choose a container.');return;}checkpoint();if(inside)target.append(selected);else target.before(selected);refreshTree();select(selected);changed();}
  q('move-before').addEventListener('click',()=>move(false));q('move-inside').addEventListener('click',()=>move(true));
  q('add').addEventListener('click',()=>{
    if(!selected||['IMG','INPUT','BR','HR','SELECT','TEXTAREA'].includes(selected.tagName)){message('Select a section or container.');return;}
    checkpoint();const tag=q('add-kind').value,n=document.createElement(tag);
    if(tag==='section'){n.className='page-detail';n.innerHTML='<div class="container"><h2>New section</h2><p>Edit this text.</p></div>';}
    else if(tag==='img'){n.alt='';n.style.minHeight='120px';}
    else if(tag==='div'){n.innerHTML='<p>Edit this text.</p>';}
    else {n.textContent=tag==='h2'?'New heading':'Edit this text.';if(tag==='a')n.href='contact.html';}
    selected.append(n);refreshTree();select(n);changed();
  });
  q('shared').addEventListener('click',()=>{
    const region=selected?.closest('header,footer');if(!region){message('Select an element within the header or footer.');return;}
    checkpoint();const current=cleanHTML(),doc=new DOMParser().parseFromString(current,'text/html'),shared=doc.querySelector(region.tagName.toLowerCase());
    for(const p of Object.values(model.pages)){const d=new DOMParser().parseFromString(p.body,'text/html'),old=d.querySelector(region.tagName.toLowerCase());if(old)old.replaceWith(shared.cloneNode(true));p.body=d.body.innerHTML;}
    render();changed('Shared '+region.tagName.toLowerCase()+' updated on all pages.');
  });
  q('apply-html').addEventListener('click',()=>{
    if(!selected)return;checkpoint();const doc=new DOMParser().parseFromString(q('html').value,'text/html');
    doc.querySelectorAll('script,iframe,object,embed').forEach(el=>el.remove());doc.querySelectorAll('*').forEach(el=>{for(const a of [...el.attributes])if(/^on/i.test(a.name)||/^javascript:/i.test(a.value))el.removeAttribute(a.name);});
    if(selected===surface)surface.innerHTML=doc.body.innerHTML;else selected.replaceWith(...doc.body.childNodes);refreshTree();select(surface);changed();
  });
  q('apply-css').addEventListener('click',()=>{checkpoint();model.css=q('css').value;style.textContent=cssForCanvas();changed();});
  q('undo').addEventListener('click',()=>{if(!history.length)return;capture();future.push(clone(model));model=history.pop();render();message('Change undone.');});
  q('redo').addEventListener('click',()=>{if(!future.length)return;capture();history.push(clone(model));model=future.pop();render();message('Change restored.');});
  q('width-preset').addEventListener('change',()=>{canvas.style.width=q('width-preset').value;});
  const download=(name,content,type)=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  q('save').addEventListener('click',async()=>{
    capture();try{if(config.save){await config.save(clone(model));message('Draft saved to the editor server. The public website is unchanged.');}else{localStorage.setItem('mnerva-editor-draft-v1',JSON.stringify(model));message('Draft saved in this browser. Download a backup to keep a separate copy.');}}catch(e){message('Could not save: '+e.message+'. Download a draft backup instead.');}
  });
  q('backup').addEventListener('click',()=>{capture();download('mnerva-draft.json',JSON.stringify(model),'application/json');message('Draft backup downloaded.');});
  q('restore').addEventListener('change',async()=>{
    const file=q('restore').files[0];if(!file)return;try{const next=JSON.parse(await file.text());if(!next.pages?.['index.html']||typeof next.css!=='string'||!Array.isArray(next.fonts))throw Error('Invalid draft file');checkpoint();model=next;page='index.html';render();message('Backup restored. Save to keep these changes.');}catch(e){message(e.message);}
  });
  function exportedFiles(){
    capture();const files={'styles.css':model.css+'\n'+fontCSS(),'site.js':model.siteJS||''};
    for(const [name,p]of Object.entries(model.pages)){
      const doc=new DOMParser().parseFromString(p.body,'text/html');doc.querySelectorAll('img').forEach(img=>{const src=img.getAttribute('src');if(model.assets[src])img.src=model.assets[src];});
      const head=p.head.replace(/<link\b[^>]*rel="icon"[^>]*>/g,'');
      const bodyStyle=p.bodyStyle?' style="'+p.bodyStyle.replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"':'';
      files[name]='<!DOCTYPE html>\n<html lang="en"><head>'+head+'</head><body'+bodyStyle+'>'+doc.body.innerHTML+'</body></html>';
    }
    return files;
  }
  function zip(files){
    const encoder=new TextEncoder(),parts=[];let offset=0;const directory=[];
    const table=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[i]=c;}
    const crc=bytes=>{let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
    for(const [name,text]of Object.entries(files)){
      const n=encoder.encode(name),b=encoder.encode(text),c=crc(b),h=new Uint8Array(30+n.length),v=new DataView(h.buffer);
      v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,c,true);v.setUint32(18,b.length,true);v.setUint32(22,b.length,true);v.setUint16(26,n.length,true);h.set(n,30);parts.push(h,b);
      const d=new Uint8Array(46+n.length),w=new DataView(d.buffer);w.setUint32(0,0x02014b50,true);w.setUint16(4,20,true);w.setUint16(6,20,true);w.setUint16(8,0x800,true);w.setUint32(16,c,true);w.setUint32(20,b.length,true);w.setUint32(24,b.length,true);w.setUint16(28,n.length,true);w.setUint32(42,offset,true);d.set(n,46);directory.push(d);offset+=h.length+b.length;
    }
    const size=directory.reduce((n,d)=>n+d.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,directory.length,true);v.setUint16(10,directory.length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);return new Blob([...parts,...directory,end],{type:'application/zip'});
  }
  q('export').addEventListener('click',()=>{download('mnerva-website.zip',zip(exportedFiles()),'application/zip');message('Website exported with all pages, fonts, and uploaded images. Nothing has been published.');});
  if(config.restoreBrowser){try{const saved=localStorage.getItem('mnerva-editor-draft-v1');if(saved){const next=JSON.parse(saved);if(next.pages?.['index.html']&&next.css&&next.fonts)model=next;}}catch(e){}}
  root.mnervaEditor={getModel:()=>{capture();return clone(model);},exportedFiles,zip,select,render};
  render();
})();
