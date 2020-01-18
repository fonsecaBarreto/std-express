var ObjectId = require('mongodb').ObjectID;
paginas= {
    home:{
        view:"home-view",
        href:"/home",
        title:"Início",
        contents:{},
        colls:[db.collection("home-contents")],
        run:function(router){
            router.get(this.href,(req,res)=>{
                console.log("aquiii")
                res.render(this.view,{title:`${process.env.APP_TITLE} | ${this.title}`,conteudo: this.contents});
            });
        },
    },
    artigos:{
        view:"artigos-view",
        href:"/artigos",
        title:"Artigos",
        contents:{},
        colls:[db.collection("artigos-contents"),db.collection("artigos-posts")],
        run:function(router){
            router.get(`${this.href}/:topic?/:post?`,async (req,res,next)=>{
                var topic = req.params.topic == undefined ? 'undefined':req.params.topic;
                var post = req.params.post;
                var page  = req.query.page == undefined ? 0 : req.query.page;
                var offset = req.query.o == undefined? 7 : req.query.o
                var key = post == undefined ?'topic': 'path';
                if(key == "topic"){
                    var value = post == undefined ? topic:page;
                    var requestString = `/direct/artigos-posts/${key}?v=${value}&sort=date&offset=${page * offset}&limit=${offset}`;
                    res.render(this.view,{title:`${process.env.APP_TITLE} | ${this.title}`,conteudo: this.contents,requestString});
                }else{
                    var article = await this.colls[1].find({path:post}).toArray();
                    if(article != undefined){
                   
                        console.log(article[0].views,"<-----")
                        article[0].views+=1;this.colls[1].updateOne({path:post},{$set:article[0]},{upsert: true});


                        article[0].breadCrumbs = `${article[0].topic != "" ? "artigos &rsaquo; "+ article[0].topic :"artigos &rsaquo; all" } &rsaquo; ${article[0].path} `
                        res.render('artigos-alternative-view',{title:`${process.env.APP_TITLE} | ${this.title}`,conteudo: this.contents,article:article[0]});
                    }
                }
            });
            
        },
        downloadCB: async function(conteudo){
            return new Promise(async (resolve)=>{
                var provTopicsName = []
                conteudo.topics = {};
                console.log("now handling topics")
                try{
                    var docs = await this.colls[1].find({}).toArray();
                    console.log(docs.length)
                    await Promise.all(docs.map(async function(doc){
                        if(!provTopicsName.includes(doc.topic) && doc.topic != "" && doc.topic != undefined){provTopicsName.push(doc.topic)}
                    }))
                
                   await Promise.all(provTopicsName.map(async function(name){
                        var href =`/artigos/${name}`;
                        conteudo.topics[ name.charAt(0).toUpperCase() + name.slice(1)]=href;
                    }))
                    
                } catch(err){throw err} 
                /*  */
                if(conteudo.destaques != undefined){
                    try{
                        conteudo.destaques  = await Promise.all(conteudo.destaques.map(async (el)=>{
                            var result = await db.collection(el.from.slice(1)).find({_id:ObjectId(el._id)}).toArray();
                            return result[0];
                        }));

                        await Promise.all(conteudo.destaques.map(async (el)=>{ // each one is a form
                            el.href = `/${el.topic != "" ? "artigos/"+el.topic :"artigos/all" }/${el.path} `
                           
                            if(el.img  != undefined){
                                console.log("there is a img")
                                try{
                                    el.srcset ="";
                                    el.srcset+= `${el.img[0].xs.location} ${el.img[0].xs.width}w, `
                                    el.srcset+= `${el.img[0].sm.location} ${el.img[0].sm.width}w, `
                                    el.srcset+= `${el.img[0].md.location} ${el.img[0].md.width}w, `
                                    el.srcset+= `${el.img[0].lg.location} ${el.img[0].lg.width}w, `
                                    el.srcset+= `${el.img[0].xl.location} ${el.img[0].xl.width}w `
                                }catch(err){}
                            }
                         
                        }));



                    }catch(err){}
                    
                }
                resolve(conteudo)
                
            })
            
        }
    }
}
function download(pagina){
    console.log(" < WARNING >  downloading contents from "+pagina.title)
    var rootColl = pagina.colls[0];
    return new Promise(async function(resolve){
        var result = await rootColl.find({}).toArray(); // rootDoc
        var conteudo = {};
        try{
            await Promise.all( result.map(async (element,index) => { //each element represents a html element
                //console.log(index,element.elementId)
               if(element.config != undefined){
                   if(element.config.static == true){ 
                    var res = []; // <----resource of document
                    if(typeof(element.resource) != "string"){res = element.resource;}
                    else if(element.resource.charAt(0)=="&"){
                        var ref= element.resource.substring(2);
                        var subColl = db.collection(ref)
                        var res = await subColl.find({}).toArray();
                    } 
                /* srcset */
                await Promise.all(res.map(async (el)=>{ // each one is a form
                
                    if(el.img  != undefined){
                        console.log("there is a img")
                        try{
                            el.srcset ="";
                            el.srcset+= `${el.img[0].xs.location} ${el.img[0].xs.width}w, `
                            el.srcset+= `${el.img[0].sm.location} ${el.img[0].sm.width}w, `
                            el.srcset+= `${el.img[0].md.location} ${el.img[0].md.width}w, `
                            el.srcset+= `${el.img[0].lg.location} ${el.img[0].lg.width}w, `
                            el.srcset+= `${el.img[0].xl.location} ${el.img[0].xl.width}w `
                        }catch(err){}
                    }
                 
                }));
                conteudo[element.elementId]= res;
               
                }
               }
            }) );
        }catch(err){console.log(err)}
        if(pagina.downloadCB != undefined){
            try{
                var conteudo  = await pagina.downloadCB(conteudo)
            }catch(err){}
        }
        resolve(conteudo);    
    });
}
module.exports ={download,paginas};