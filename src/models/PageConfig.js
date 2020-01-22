const icons ={"static":"/images/padrao/global.png","blog":"/images/padrao/feed.png"}

function PageConfig(title="Titulo",href,coll,view,admin,type="static",altView= undefined, altColl =  undefined){
  this.title = title;
  this.href = href;
  this.rootColl = coll;
  this.altColl = altColl
  this.view = view;
  this.altView =altView;
  this.admin = admin;
  this.cachedContents = {};
  this.type =type;
  this.run  = (router)=>{
    console.log(this.title+ " is now ready")

    if(this.type == "static"){
      router.get(this.href, (req,res)=>{
        
        res.render(this.view,{ title:`${generalConfig.overview.title} | ${this.title}`,overview:generalConfig.overview,contents:this.cachedContents}); 
      });
    }else if(this.type == "blog"){
      console.log("blog")
      router.get(`${this.href}/:topic?/:post?`, async(req,res,next)=>{

        var topic = req.params.topic == undefined ? 'undefined':req.params.topic;
        var post = req.params.post;
        var page  = req.query.page == undefined ? 0 : req.query.page;
        var offset = req.query.o == undefined? 7 : req.query.o
        var key = post == undefined ?'topic': 'path';
        if(key == "topic"){

          console.log("topic")
          var value = post == undefined ? topic:page;
          var requestString = `/direct/${this.rootColl[1]}/${key}?v=${value}&sort=date&offset=${page * offset}&limit=${offset}`;
          res.render(this.view,{ title:`${generalConfig.overview.title} | ${this.title}`,overview:generalConfig.overview,contents:this.cachedContents,requestString}); 
        }else{
          console.log("especific")
          try{ var article = await  db.collection(this.altColl).find({path:post}).toArray();
            console.log(article)
            if(article != undefined){
              article[0].views+=1;db.collection(this.altColl).updateOne({path:post},{$set:article[0]},{upsert: true});

               article[0].breadCrumbs = `${article[0].topic != "" ? "artigos &rsaquo; "+ article[0].topic :"artigos &rsaquo; all" } &rsaquo; ${article[0].path} `

                res.render(this.altView,{ title:`${generalConfig.overview.title} | ${this.title}`,overview:generalConfig.overview,contents:this.cachedContents,article:article[0]}); 
                return;
            
            }
          }catch(err){}
          next();
       

        }

      });
    }
  }
}
module.exports = {PageConfig,icons}