const icons ={"static":"/images/padrao/global.png","blog":"/images/padrao/feed.png"}

function PageConfig(title="Titulo",href,coll,view,admin,type="static"){
  this.title = title;
  this.href = href;
  this.rootColl = coll;
  this.view = view;
  this.admin = admin;
  this.cachedContents = {};
  this.type =type;
  this.run  = (router)=>{
    console.log(this.title+ "is now ready")
    router.get(this.href, (req,res)=>{
       res.render(this.view,{ title:`${generalConfig.overview.title} | ${this.title}`,overview:generalConfig.overview,contents:this.cachedContents}); 
    })
  }
}
module.exports = {PageConfig,icons}