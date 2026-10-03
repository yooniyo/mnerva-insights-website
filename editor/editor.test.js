const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createEditorServer}=require('./server');

test('authenticated draft save is durable and keeps a revision',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mnerva-test-'));
 const options={dataDir:dir,password:'local-test-password'};
 let server=createEditorServer(options);
 const start=async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));return 'http://127.0.0.1:'+server.address().port;};
 const headers={Authorization:'Basic '+Buffer.from('mnerva:local-test-password').toString('base64')};
 try{
  let url=await start();assert.equal((await fetch(url+'/api/site')).status,401);
  const model=await(await fetch(url+'/api/site',{headers})).json();
  assert.equal((await fetch(url+'/api/site',{method:'PUT',headers:{...headers,'Content-Type':'application/json',Origin:'https://other.example'},body:JSON.stringify(model)})).status,403);
  assert.equal((await fetch(url+'/api/site',{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:'{"bad":true}'})).status,400);
  model.pages['index.html'].body+='<p>Persistence check</p>';
  assert.equal((await fetch(url+'/api/site',{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(model)})).status,200);
  assert.equal(fs.readdirSync(path.join(dir,'revisions')).length,1);
  await new Promise(r=>server.close(r));server=createEditorServer(options);url=await start();
  assert((await(await fetch(url+'/api/site',{headers})).json()).pages['index.html'].body.includes('Persistence check'));
 }finally{await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}
});
