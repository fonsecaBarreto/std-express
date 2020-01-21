var router = require('express').Router();
start(generalConfig.pages)
.then((paginas)=>{
  console.log("everything is up to date")
  router.get("/",(req,res)=>{
    res.redirect(generalConfig.overview.landingPage);
  })
  Object.keys(paginas).forEach(key=>{
    paginas[key].run(router)
  })
})
function start(paginas){
  return new Promise(async resolve=>{
    await  Promise.all(Object.keys(paginas).map(async (key)=>{
      let pagina = paginas[key];
      pagina.cachedContents = await download(pagina,stringfyImages)
      return;
    }))
    resolve(paginas)
  })
}
function download(pagina,...cbs){
  console.log("\n< DOWNLOADING > from "+pagina.rootColl)
  if(pagina.rootColl != undefined){

    try{
        let rootColl = db.collection(pagina.rootColl);
        var log = "ERRO";
        return new Promise(async function(resolve){
          try{
            var result = await rootColl.find({'type':{$ne:"info"}}).toArray(); if(result.length > 0){log = result.length}
            var conteudo = {};
            await Promise.all( result.map(async (rootDoc,index) => { 
              if(rootDoc.config != undefined && rootDoc.config.static == true){
                var res = []; 
                if(typeof(rootDoc.resource) != "string"){res = rootDoc.resource;}
                else if(rootDoc.resource.charAt(0)=="&"){
                    var ref= rootDoc.resource.substring(2);
                    var res = await db.collection(ref).find({}).toArray();
                } 
              }else{res = rootDoc.resource}
              await Promise.all(cbs.map(async cb=>{
                return cb(res)
              }));
              conteudo[rootDoc.elementId]=res
            }));
            resolve(conteudo);   
          }catch(err){throw err}
        });
      }catch(err){
            
      }
  }
}
function stringfyImages(res){
  return new Promise(async resolve=>{
    if(typeof(res) != "string"){
      try{await Promise.all(res.map(async (form)=>{ // each one is a form    
          if(form.img  != undefined){
              try{
                  form.srcset ="";
                  form.srcset+= `${form.img[0].xs.location} ${form.img[0].xs.width}w, `
                  form.srcset+= `${form.img[0].sm.location} ${form.img[0].sm.width}w, `
                  form.srcset+= `${form.img[0].md.location} ${form.img[0].md.width}w, `
                  form.srcset+= `${form.img[0].lg.location} ${form.img[0].lg.width}w, `
                  form.srcset+= `${form.img[0].xl.location} ${form.img[0].xl.width}w `
              }catch(err){throw err}
          }
      })); }catch(err){throw err}
    }
    resolve()
  })
}

module.exports = router;