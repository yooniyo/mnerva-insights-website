const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {buildModel,validModel}=require('./model');

function createEditorServer(options={}) {
  const root=options.root||path.join(__dirname,'../*Main');
  const dataDir=options.dataDir||process.env.MNERVA_EDITOR_DATA||path.join(__dirname,'../editor-data');
  const password=options.password??process.env.MNERVA_EDITOR_PASSWORD;
  const user=options.user||process.env.MNERVA_EDITOR_USER||'mnerva';
  const file=path.join(dataDir,'draft.json');
  let model=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):buildModel(root);
  if(!validModel(model))throw Error('Invalid stored draft. Restore a valid draft backup.');
  const equal=(a,b)=>{const x=crypto.createHash('sha256').update(a).digest(),y=crypto.createHash('sha256').update(b).digest();return crypto.timingSafeEqual(x,y);};
  const send=(res,status,body,type='application/json')=>{res.writeHead(status,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});res.end(type==='application/json'?JSON.stringify(body):body);};
  return http.createServer(async(req,res)=>{
    try {
      if(password){
        const auth=req.headers.authorization||'',supplied=auth.startsWith('Basic ')?Buffer.from(auth.slice(6),'base64').toString():'';
        if(!equal(supplied,user+':'+password)){res.setHeader('WWW-Authenticate','Basic realm="mnerva editor", charset="UTF-8"');send(res,401,{error:'Sign in to the editor.'});return;}
      }
      const pathname=new URL(req.url,'http://localhost').pathname;
      if(pathname==='/api/site'&&req.method==='GET'){send(res,200,model);return;}
      if(pathname==='/api/site'&&req.method==='PUT'){
        const origin=req.headers.origin;
        if(origin&&new URL(origin).host!==req.headers.host){send(res,403,{error:'Save requests must come from this editor.'});return;}
        if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')){send(res,415,{error:'Use JSON for a draft.'});return;}
        let length=0,chunks=[];
        for await(const chunk of req){length+=chunk.length;if(length>64*1024*1024){send(res,413,{error:'Draft is too large. Use smaller image and font files.'});return;}chunks.push(chunk);}
        let next;try{next=JSON.parse(Buffer.concat(chunks).toString());}catch(e){send(res,400,{error:'Invalid JSON.'});return;}
        if(!validModel(next)){send(res,400,{error:'Invalid draft format.'});return;}
        fs.mkdirSync(dataDir,{recursive:true,mode:0o700});
        const revision=path.join(dataDir,'revisions');fs.mkdirSync(revision,{recursive:true,mode:0o700});
        fs.writeFileSync(path.join(revision,Date.now()+'-'+crypto.randomBytes(3).toString('hex')+'.json'),JSON.stringify(model),{mode:0o600});
        const revisions=fs.readdirSync(revision).sort();for(const old of revisions.slice(0,Math.max(0,revisions.length-30)))fs.unlinkSync(path.join(revision,old));
        const temp=file+'.tmp';fs.writeFileSync(temp,JSON.stringify(next),{mode:0o600});fs.renameSync(temp,file);model=next;
        send(res,200,{saved:true});return;
      }
      if(req.method!=='GET'){send(res,405,{error:'Method not allowed.'});return;}
      if(pathname==='/'||pathname==='/admin'||pathname==='/admin/'){
        const shell=fs.readFileSync(path.join(__dirname,'editor-shell.html'),'utf8');
        send(res,200,'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>mnerva editor</title><link rel="stylesheet" href="/editor.css"></head><body style="margin:0">'+shell+'<script src="/loader.js"></script></body></html>','text/html');return;
      }
      const files={'/editor.js':['editor.js','text/javascript'],'/editor.css':['editor.css','text/css'],'/loader.js':['loader.js','text/javascript']};
      if(files[pathname]){const [name,type]=files[pathname];send(res,200,fs.readFileSync(path.join(__dirname,name),'utf8'),type);return;}
      send(res,404,{error:'Not found.'});
    }catch(e){console.error('Editor request failed:',e.message);if(!res.headersSent)send(res,500,{error:'The editor could not complete this request.'});else res.end();}
  });
}
if(require.main===module){
  const host=process.env.MNERVA_EDITOR_HOST||'127.0.0.1';
  if(host!=='127.0.0.1'&&host!=='::1'&&!process.env.MNERVA_EDITOR_PASSWORD)throw Error('Set MNERVA_EDITOR_PASSWORD before exposing the editor on a network.');
  const port=Number(process.env.MNERVA_EDITOR_PORT||3100);
  createEditorServer().listen(port,host,()=>console.log('mnerva editor running at http://'+host+':'+port+'/admin'));
}
module.exports={createEditorServer};
