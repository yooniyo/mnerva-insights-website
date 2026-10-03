(async()=>{
  const status=document.getElementById('ed-status');
  try{
    const response=await fetch('/api/site');if(!response.ok)throw Error('Could not load the draft.');
    window.mnervaEditorBootstrap={model:await response.json(),save:async model=>{
      const response=await fetch('/api/site',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(model)});
      if(!response.ok){const body=await response.json();throw Error(body.error||'Save failed.');}
    }};
    const script=document.createElement('script');script.src='/editor.js';document.body.append(script);
  }catch(e){status.textContent=e.message;}
})();
