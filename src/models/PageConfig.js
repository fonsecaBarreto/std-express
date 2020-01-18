function PageConfig(title="Titulo",href,coll,view,admin){
  this.title = title;
  this.href = href;
  this.rootColl = coll;
  this.view = view;
  this.admin = admin;
  this.cachedContents = {};
  this.run  = (router)=>{
    console.log(this.title+ "is now ready")
    router.get(this.href, (req,res)=>{
       res.render(this.view,{ title:`${generalConfig.overview.title} | ${this.title}`,overview:generalConfig.overview,contents:this.cachedContents}); 
    })
  }
}
module.exports = PageConfig