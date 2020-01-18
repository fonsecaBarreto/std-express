var router = require("express").Router();
var cors = require("cors");
var controller = require("../src/pagesContents");

router.get("/",function(req,res){ res.redirect("/artigos")});


Object.keys(controller.paginas).forEach((key)=>{
  var pagina = controller.paginas[key];
  controller.download(pagina)
  .then(contents=>{
    
    console.log(" ready");

    pagina.contents = contents;
    pagina.run(router)
  });
})
function authenticationMiddleware () {  
  return function (req, res, next) {
    if (req.isAuthenticated()) {console.log("AUTHENTIFICADO");return next()
    }res.redirect('/login')
  }
}

router.get("/update",cors(),authenticationMiddleware(),async (req,res)=>{
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>  :: atualizando ::   <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<' + req.params.page);
  try{
    await Promise.all(Object.keys(controller.paginas).map(async function(key){
      var pagina = controller.paginas[key]
        controller.download(pagina)
        .then(contents=>{
          pagina.contents = contents;
        });
      })
    )
   
    /*  */
    res.json({status:true})
    

  }catch(err){
    res.json({status:false})
  }
});

module.exports = router;




 
  
  